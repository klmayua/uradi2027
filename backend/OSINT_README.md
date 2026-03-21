# URADI-360 OSINT Layer

## Overview

The OSINT (Open Source Intelligence) Layer provides automated intelligence gathering, analysis, and alerting for the URADI-360 Political Intelligence Platform. It monitors news sources, social media, and government feeds to provide real-time insights into political sentiment, emerging narratives, and potential crises.

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    OSINT ORCHESTRATION LAYER                      │
│  ┌────────────┬────────────┬────────────┬────────────┐                                      │
│  │ Scheduler  │  Pipeline   │  Quality    │  Alert      │                                      │
│  │(APScheduler)│  Manager    │  Controller │  Engine     │                                      │
│  └────────────┴────────────┴────────────┴────────────┘                                      │
└──────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      DATA INGESTION LAYER                         │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────┐                         │
│  │ News        │ │ Social      │ │ Government  │ │ Traditional │ │ Custom│                         │
│  │ Scrapers    │ │ Monitors    │ │ Feeds       │ │ Media       │ │ Sources│                         │
│  │ (15+ sites) │ │ (Twitter/X) │ │ (INEC)      │ │ (Radio)     │ │       │                         │
│  └───────────┴───────────┴───────────┴───────────┴───────┘                         │
└──────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    AI CLASSIFICATION LAYER (Kimi K2)                 │
│  ┌───────────┬───────────┬───────────┬───────────┐                                      │
│  │ Sentiment  │ Topic      │ Entity     │ Threat     │                                      │
│  │ Analysis   │ Extraction │ Recognition│ Assessment │                                      │
│  └───────────┴───────────┴───────────┴───────────┘                                      │
└──────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      EMBEDDING & VECTOR LAYER                        │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  Vector Embeddings (Kimi/K2) → Qdrant Vector Store               │   │
│  │  - Semantic similarity search                                   │   │
│  │  - Clustering & anomaly detection                                │   │
│  │  - Cross-reference with voter sentiment                          │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

## Components

### Database Models (`models_osint.py`)

- **OSINTSource**: Configured data sources (news, social, government)
- **OSINTMention**: Individual mentions/articles/posts collected
- **OSINTAlert**: Automated alerts for crises and anomalies
- **NarrativeCluster**: AI-detected narrative themes
- **DailyBrief**: AI-generated daily intelligence summaries
- **OSINTProcessingQueue**: Celery job queue
- **OSINTMetrics**: Time-series metrics aggregation

### Task Workers (`tasks/`)

- **ingestion_tasks.py**: Data collection from sources
- **classification_tasks.py**: AI-powered content classification
- **embedding_tasks.py**: Vector embedding generation and clustering
- **alert_tasks.py**: Crisis detection and alerting
- **brief_tasks.py**: Daily brief generation
- **osint_tasks.py**: Orchestration and coordination

### Scrapers (`scrapers/`)

- **news_scraper.py**: Nigerian news outlets (Premium Times, Vanguard, etc.)
- **social_scraper.py**: Twitter/X monitoring
- **government_scraper.py**: INEC and government sources
- **custom_scraper.py**: User-defined sources

### API Endpoints (`api/osint.py`)

- **Sources**: CRUD for OSINT sources
- **Mentions**: Search, filter, retrieve mentions
- **Alerts**: Alert management and acknowledgment
- **Briefs**: Daily intelligence briefs
- **Narratives**: Narrative cluster analysis
- **WebSocket**: Real-time alert streaming

## Setup

### Prerequisites

1. **PostgreSQL** with existing URADI-360 database
2. **Redis** for Celery broker and caching
3. **Qdrant** for vector storage (or use cloud version)
4. **Kimi API Key** for AI classification

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run database migration:
```bash
cd backend
alembic upgrade head
```

3. Initialize OSINT layer:
```bash
py init_osint.py --setup-defaults
```

4. Start Celery workers:
```bash
# Terminal 1 - Worker
celery -A celery_app worker --loglevel=info -Q ingestion,classification,embedding,alerts,briefs,default

# Terminal 2 - Scheduler
celery -A celery_app beat --loglevel=info
```

5. Verify setup:
```bash
py init_osint.py --check-only
```

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/uradi360

# Redis
REDIS_URL=redis://localhost:6379/0

# Qdrant Vector Database
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your_key_here  # Optional for local

# Kimi AI
KIMI_API_KEY=sk-your-key-here
KIMI_BASE_URL=https://api.moonshot.cn/v1
KIMI_MODEL=kimi-k2-turbo-preview

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

## Usage

### API Endpoints

#### Sources
```bash
# List sources
GET /api/osint/sources

# Create source
POST /api/osint/sources
{
    "name": "Custom News Source",
    "source_type": "news",
    "source_url": "https://example.com/feed",
    "fetch_interval_minutes": 30
}

# Test source
POST /api/osint/sources/{id}/test

# Trigger fetch
POST /api/osint/sources/{id}/fetch
```

#### Mentions
```bash
# List mentions with filters
GET /api/osint/mentions?sentiment=negative&urgency=high&limit=50

# Get single mention
GET /api/osint/mentions/{id}

# Semantic search
POST /api/osint/search
{
    "query": "security concerns in Kano",
    "limit": 20
}
```

#### Alerts
```bash
# List alerts
GET /api/osint/alerts?status=open&severity=high

# Acknowledge alert
POST /api/osint/alerts/{id}/acknowledge

# Resolve alert
POST /api/osint/alerts/{id}/resolve
{
    "notes": "Investigated and resolved"
}
```

#### Daily Briefs
```bash
# List briefs
GET /api/osint/briefs

# Get brief
GET /api/osint/briefs/{id}

# Generate brief
POST /api/osint/briefs/generate?date=2026-03-20
```

### WebSocket

Connect to real-time alerts:
```javascript
const ws = new WebSocket('ws://api.uradi360.com/api/osint/ws/alerts');

ws.onopen = () => {
    ws.send(JSON.stringify({
        action: 'subscribe',
        tenant_id: 'your-tenant-id'
    }));
};

ws.onmessage = (event) => {
    const alert = JSON.parse(event.data);
    console.log('New alert:', alert);
};
```

## Alert Types

| Alert Type | Trigger | Severity |
|------------|---------|----------|
| `sentiment_crash` | Avg sentiment drops below -0.5 | High |
| `volume_spike` | Mentions exceed 3x baseline | Medium/High |
| `crisis_detected` | High urgency + crisis keywords | Critical |
| `narrative_shift` | Significant topic changes | Medium |
| `security_incident` | Individual mention urgency > 90 | Critical |

## Scheduled Tasks

| Task | Schedule | Description |
|------|----------|-------------|
| Fetch News | Every 15 min | Collect from news sources |
| Fetch Social | Every 5 min | Collect from social media |
| Process Mentions | Every 2 min | Run AI classification |
| Generate Embeddings | Every 10 min | Create vector embeddings |
| Check Alerts | Every 3 min | Evaluate alert conditions |
| Generate Brief | Every 6 hours | Create daily briefs |
| Cleanup | Daily | Archive old data |

## Development

### Adding New Sources

1. Add scraper class to `scrapers/`
2. Register in `ingestion_tasks.py`
3. Create via API or add to `DEFAULT_SOURCES` in `init_osint.py`

### Custom Classification

Extend `KimiClient` in `services/kimi_client.py`:
```python
async def custom_classifier(self, content: str) -> Dict:
    # Add custom classification logic
    pass
```

### Testing

```bash
# Run Celery task directly
py -c "from tasks.ingestion_tasks import fetch_source; fetch_source.delay('source-uuid')"

# Check queue status
celery -A celery_app inspect active
celery -A celery_app inspect scheduled
```

## Monitoring

### Health Checks

- `/health` - General system health
- `/api/osint/metrics/dashboard` - OSINT metrics

### Metrics

- Mention volume by source
- Sentiment trends
- Alert frequency
- Processing queue depth
- API latency

## Troubleshooting

### Common Issues

**Celery workers not processing:**
```bash
# Check workers are running
celery -A celery_app inspect ping

# Check queue configuration
celery -A celery_app inspect active_queues
```

**Qdrant connection failed:**
- Verify Qdrant is running: `docker ps | grep qdrant`
- Check Qdrant URL in environment

**Kimi API errors:**
- Verify API key is set
- Check rate limits in Kimi dashboard

**Database migration failed:**
```bash
# Manual migration
alembic upgrade 20260320_add_osint_layer

# Check current version
alembic current
```

## Security & Compliance

- All content sanitized before storage (XSS prevention)
- NDPR-compliant data retention (90 days default)
- Encrypted API keys at rest
- Row-level security for multi-tenancy
- No PII storage without consent

## License

Internal use only - URADI-360 Platform
