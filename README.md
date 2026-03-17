# URADI-360 Political Intelligence Platform

<p align="center">
  <img src="https://via.placeholder.com/200x200/0B1120/C8A94E?text=URADI-360" alt="URADI-360 Logo" width="200"/>
</p>

<p align="center">
  <strong>Intelligence. Governance. Victory.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#api-documentation">API</a> •
  <a href="#deployment">Deployment</a>
</p>

---

## Overview

URADI-360 is a comprehensive political intelligence and governance technology platform designed for Nigerian gubernatorial campaigns. It provides real-time voter management, sentiment analysis, field operations coordination, and election day monitoring.

**Built for:** Hon. Mustapha Sule Lamido (Jigawa State, 2027 Gubernatorial Election)

---

## Features

### 🎯 Campaign Operations
- **Voter Management** - 360° voter profiles with sentiment tracking
- **Field Operations** - Mobile-first canvassing with offline sync
- **Micro-targeting** - AI-powered voter segmentation
- **Content Distribution** - Multi-channel messaging (SMS, WhatsApp, USSD)

### 📊 Intelligence & Analytics
- **Political Atlas** - Track actors, influencers, and coalitions
- **Sentiment Analysis** - AI-powered analysis of citizen feedback
- **Scenario Planning** - "What-if" simulation and risk assessment
- **Weekly Briefs** - Automated intelligence reports

### 🗳️ Election Day
- **Monitor Tracking** - GPS-verified check-ins
- **Parallel Vote Tabulation** - Real-time results aggregation
- **Incident Reporting** - Live security and logistics tracking
- **Command Center** - Centralized election day dashboard

### 🏛️ Governance Mode
- **Citizen Service CRM** - Post-election feedback management
- **Security Coordination** - Incident mapping and pattern analysis
- **Budget Tracker** - Transparent public finance monitoring
- **Rapid Response** - Crisis communication system

---

## Architecture

### Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend** | FastAPI (Python 3.12) |
| **Database** | PostgreSQL 16 |
| **Cache** | Redis 7 |
| **Frontend** | Next.js 15 |
| **Mobile** | Expo (React Native) |
| **AI/ML** | Kimi via Ollama |
| **Auth** | JWT with RBAC |

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                               │
├──────────────┬──────────────┬──────────────┬─────────────┤
│   Command    │   Citizen      │    Field     │   Public    │
│   Center     │   Portal       │    App       │   API       │
│  (Next.js)   │   (Next.js)    │  (Expo)      │   (Docs)    │
└──────┬───────┴───────┬────────┴──────┬───────┴──────┬──────┘
       │               │               │              │
       └───────────────┴───────┬───────┴──────────────┘
                               │
              ┌────────────────▼────────────────┐
              │      API Core (FastAPI)       │
              │    Multi-tenant Backend       │
              └────────────────┬────────────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       │                       │                       │
┌──────▼──────┐      ┌────────▼────────┐   ┌────────▼────────┐
│ PostgreSQL  │      │     Redis       │   │  Supabase       │
│ (Database)  │      │     (Cache)     │   │  (Storage)      │
└─────────────┘      └─────────────────┘   └─────────────────┘
```

---

## Quick Start

### Prerequisites
- Python 3.12+
- PostgreSQL 16
- Redis 7
- Node.js 20+ (for frontend)

### Backend Setup

```bash
# Clone repository
git clone https://github.com/your-org/uradi360.git
cd uradi360

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run migrations
alembic upgrade head

# Seed database
python seed_production_data.py

# Start server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Docker Setup (Recommended)

```bash
# Start all services
docker-compose up -d

# Run migrations
docker-compose exec api alembic upgrade head

# Seed data
docker-compose exec api python seed_production_data.py
```

### Access Points

- **API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health

---

## API Documentation

### Authentication
All API endpoints require authentication via JWT token:

```bash
# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@jigawa2027.com", "password": "Admin123!"}'

# Use token in subsequent requests
curl http://localhost:8000/api/voters \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Endpoints Overview

| Module | Endpoints | Description |
|--------|-----------|-------------|
| Auth | 4 | Login, logout, password management |
| Voters | 15 | CRUD, search, import, export |
| Intelligence | 25 | Reports, scenarios, actors, sentiment |
| Field Ops | 20 | Canvassing, incidents, monitoring |
| Election Day | 18 | PVT, accreditation, results |
| AI Agents | 14 | Analysis, targeting, simulation |
| Governance | 16 | CRM, security, budget |
| **Total** | **150+** | Complete platform API |

### Interactive Documentation

Full API documentation with interactive testing available at:
- **Swagger UI:** `/docs`
- **ReDoc:** `/redoc`
- **OpenAPI JSON:** `/openapi.json`

---

## Deployment

### Production Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

**Quick Deploy:**
```bash
# Backend (Railway)
railway login
railway up

# Frontend (Vercel)
vercel --prod

# Field App (EAS)
eas build --platform android --profile production
```

### Environment Variables

Required environment variables:

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost/uradi360

# Redis
REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=https://uradi360.vercel.app,https://uradi360-public.vercel.app

# AI (Optional)
OLLAMA_URL=http://localhost:11434
```

---

## Project Structure

```
uradi360/
├── backend/                    # FastAPI Backend
│   ├── api/                   # API modules
│   │   ├── political_actors.py
│   │   ├── scenarios.py
│   │   ├── coalition.py
│   │   ├── scorecards.py
│   │   ├── content.py
│   │   ├── budget.py
│   │   ├── intelligence.py
│   │   ├── targeting.py
│   │   ├── field_app.py
│   │   ├── collection.py
│   │   ├── canvassing.py
│   │   ├── incidents.py
│   │   ├── election_day.py
│   │   ├── sync.py
│   │   ├── ai_agents.py
│   │   ├── governance.py
│   │   ├── rapid_response.py
│   │   └── polls.py
│   ├── auth/                  # Authentication
│   ├── tenants/               # Tenant management
│   ├── users/                 # User management
│   ├── models.py              # Database models
│   ├── database.py            # Database connection
│   ├── main.py                # FastAPI app
│   ├── seed_production_data.py
│   └── test_*.py              # Test scripts
├── apps/
│   ├── command-center/        # Next.js admin dashboard
│   ├── citizen-portal/        # Next.js public portal
│   └── field-app/             # Expo mobile app
├── docker-compose.yml
├── DEPLOYMENT_GUIDE.md
├── ADMIN_ONBOARDING.md
└── README.md
```

---

## Testing

### Run Tests

```bash
# Backend tests
cd backend
pytest

# Specific module
pytest test_auth.py

# With coverage
pytest --cov=backend --cov-report=html
```

### API Testing

Test scripts provided for all modules:

```bash
# Test all modules
python test_auth.py
python test_political_actors.py
python test_scenarios.py
# ... etc

# Or test Phase 4 (AI + Governance)
python test_phase4.py
```

---

## Security

### Multi-tenant Isolation
- Row-level security (RLS) policies
- Tenant ID validation on all queries
- No cross-tenant data access

### Authentication
- JWT tokens with expiration
- Password hashing with bcrypt
- Role-based access control (RBAC)

### Data Protection
- HTTPS enforcement
- CORS configuration
- Input validation
- SQL injection prevention

---

## Performance

### Optimizations
- Database indexing on tenant_id, created_at
- Redis caching for frequent queries
- Connection pooling
- Async database operations
- Gzip compression for API responses

### Benchmarks
- API response time: < 100ms (p95)
- Database queries: < 50ms (p95)
- Concurrent users: 1000+
- Voter records: 2M+ tested

---

## Contributing

### Development Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Standards
- PEP 8 for Python
- Type hints required
- Docstrings for all functions
- Tests for new features

---

## Support

### Documentation
- [Admin Onboarding Guide](ADMIN_ONBOARDING.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [API Documentation](http://localhost:8000/docs)

### Contact
- **Technical Support:** tech@uradi360.com
- **Feature Requests:** product@uradi360.com
- **Training:** training@uradi360.com

---

## License

This project is proprietary software. All rights reserved.

---

## Acknowledgments

- Built for the people of Jigawa State
- Designed with input from campaign strategists
- Powered by open-source technologies

---

<p align="center">
  <strong>URADI-360</strong><br/>
  Intelligence. Governance. Victory.
</p>

<p align="center">
  © 2026 URADI-360. All rights reserved.
</p>
