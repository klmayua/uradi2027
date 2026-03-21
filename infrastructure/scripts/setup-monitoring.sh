#!/bin/bash

# URADI-360 Monitoring Stack Setup
# Installs Prometheus, Grafana, Loki, and AlertManager

set -e

APP_NAME="uradi360"
MONITORING_DIR="/opt/$APP_NAME/monitoring"

echo "========================================"
echo "  URADI-360 Monitoring Setup"
echo "========================================"
echo ""

# Create monitoring directory
mkdir -p $MONITORING_DIR
mkdir -p $MONITORING_DIR/{prometheus,grafana,loki,alertmanager}

# =============================================================================
# PROMETHEUS CONFIGURATION
# =============================================================================
cat > $MONITORING_DIR/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

rule_files:
  - /etc/prometheus/rules/*.yml

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'uradi360-backend'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: /metrics
    scrape_interval: 5s

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
EOF

# Prometheus alert rules
cat > $MONITORING_DIR/prometheus/alerts.yml << 'EOF'
groups:
  - name: uradi360
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is above 5%"

      - alert: ServiceDown
        expr: up{job="uradi360-backend"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "URADI-360 service is down"

      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High API latency detected"
EOF

# =============================================================================
# GRAFANA CONFIGURATION
# =============================================================================
mkdir -p $MONITORING_DIR/grafana/dashboards
mkdir -p $MONITORING_DIR/grafana/provisioning/datasources
mkdir -p $MONITORING_DIR/grafana/provisioning/dashboards

# Data sources
cat > $MONITORING_DIR/grafana/provisioning/datasources/datasources.yml << 'EOF'
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true

  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100

  - name: PostgreSQL
    type: postgres
    url: ${SUPABASE_HOST}:5432
    database: postgres
    user: ${SUPABASE_USER}
    secureJsonData:
      password: ${SUPABASE_PASSWORD}
EOF

# Dashboard provisioning
cat > $MONITORING_DIR/grafana/provisioning/dashboards/dashboards.yml << 'EOF'
apiVersion: 1
providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    editable: true
    options:
      path: /var/lib/grafana/dashboards
EOF

# =============================================================================
# LOKI CONFIGURATION
# =============================================================================
cat > $MONITORING_DIR/loki/local-config.yaml << 'EOF'
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    address: 127.0.0.1
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1
    final_sleep: 0s
  chunk_idle_period: 5m
  chunk_retain_period: 30s

schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 168h

storage_config:
  boltdb:
    directory: /tmp/loki/index

  filesystem:
    directory: /tmp/loki/chunks

limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 168h

chunk_store_config:
  max_look_back_period: 0s

table_manager:
  retention_deletes_enabled: true
  retention_period: 168h
EOF

# =============================================================================
# DOCKER COMPOSE FOR MONITORING
# =============================================================================
cat > $MONITORING_DIR/docker-compose.yml << 'EOF'
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: uradi360-prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - ./prometheus/alerts.yml:/etc/prometheus/rules/alerts.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
      - '--web.enable-lifecycle'

  grafana:
    image: grafana/grafana:latest
    container_name: uradi360-grafana
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - ./grafana/provisioning:/etc/grafana/provisioning
      - ./grafana/dashboards:/var/lib/grafana/dashboards
      - grafana_data:/var/lib/grafana
    depends_on:
      - prometheus

  loki:
    image: grafana/loki:latest
    container_name: uradi360-loki
    restart: unless-stopped
    ports:
      - "3100:3100"
    volumes:
      - ./loki/local-config.yaml:/etc/loki/local-config.yaml
      - loki_data:/tmp/loki
    command: -config.file=/etc/loki/local-config.yaml

  alertmanager:
    image: prom/alertmanager:latest
    container_name: uradi360-alertmanager
    restart: unless-stopped
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager/alertmanager.yml:/etc/alertmanager/alertmanager.yml
      - alertmanager_data:/alertmanager

  node-exporter:
    image: prom/node-exporter:latest
    container_name: uradi360-node-exporter
    restart: unless-stopped
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'

  redis-exporter:
    image: oliver006/redis_exporter:latest
    container_name: uradi360-redis-exporter
    restart: unless-stopped
    environment:
      - REDIS_ADDR=redis://redis:6379
    depends_on:
      - redis

  postgres-exporter:
    image: prometheuscommunity/postgres-exporter:latest
    container_name: uradi360-postgres-exporter
    restart: unless-stopped
    environment:
      - DATA_SOURCE_NAME=${DATABASE_URL}

volumes:
  prometheus_data:
  grafana_data:
  loki_data:
  alertmanager_data:

networks:
  default:
    external:
      name: uradi360-network
EOF

# AlertManager config template
cat > $MONITORING_DIR/alertmanager/alertmanager.yml << 'EOF'
global:
  smtp_smarthost: 'smtp.sendgrid.net:587'
  smtp_from: 'alerts@uradi360.com'
  smtp_auth_username: 'apikey'
  smtp_auth_password: '${SENDGRID_API_KEY}'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'slack'

receivers:
  - name: 'slack'
    slack_configs:
      - api_url: '${SLACK_WEBHOOK_URL}'
        channel: '#alerts-critical'
        title: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

  - name: 'email'
    email_configs:
      - to: 'ops@uradi360.com'
        headers:
          Subject: 'URADI-360 Alert: {{ .GroupLabels.alertname }}'
EOF

# =============================================================================
# PROMTAIL (LOG SHIPPER) CONFIGURATION
# =============================================================================
cat > $MONITORING_DIR/promtail-config.yml << 'EOF'
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: system
    static_configs:
      - targets:
          - localhost
        labels:
          job: system
          __path__: /var/log/syslog

  - job_name: uradi360
    static_configs:
      - targets:
          - localhost
        labels:
          job: uradi360
          __path__: /var/log/uradi360/*.log
EOF

# =============================================================================
# START MONITORING STACK
# =============================================================================
echo "Starting monitoring stack..."
cd $MONITORING_DIR

docker-compose up -d

echo ""
echo "========================================"
echo "  Monitoring Setup Complete!"
echo "========================================"
echo ""
echo "Access your monitoring tools:"
echo "  Grafana:       http://localhost:3000"
echo "  Prometheus:    http://localhost:9090"
echo "  AlertManager:  http://localhost:9093"
echo ""
echo "Default Grafana credentials:"
echo "  Username: admin"
echo "  Password: (set in .env file)"
echo ""
echo "To view logs:"
echo "  docker-compose -f $MONITORING_DIR/docker-compose.yml logs -f"
