# URADI-360 Development Guide

This guide provides instructions for setting up a development environment for the URADI-360 platform.

## Prerequisites

1. **Python 3.12+**
2. **Node.js 18+**
3. **Docker and Docker Compose**
4. **PostgreSQL 16** (for local development without Docker)
5. **Redis 7** (for local development without Docker)

## Project Structure

```
URADI-360/
├── backend/              # FastAPI backend service
│   ├── alembic/          # Database migrations
│   ├── auth/             # Authentication module
│   ├── tenants/          # Tenant management
│   ├── users/            # User management
│   ├── models.py         # Database models
│   ├── database.py       # Database connection
│   ├── main.py           # Application entry point
│   ├── requirements.txt  # Python dependencies
│   └── Dockerfile        # Backend Docker image
├── apps/
│   └── command-center/   # Next.js frontend
│       ├── app/          # App router pages
│       ├── components/    # Shared components
│       ├── public/        # Static assets
│       ├── package.json  # Frontend dependencies
│       └── Dockerfile    # Frontend Docker image
├── nginx/                # Nginx configuration
├── docker-compose.yml    # Development environment
└── README.md             # Project documentation
```

## Backend Development Setup

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Variables

Create a `.env` file in the backend directory with the required environment variables:

```env
DATABASE_URL=postgresql://uradi:PASSWORD@localhost:5432/uradi360
REDIS_URL=redis://localhost:6379/0
JWT_SECRET=my_secret_key_that_is_at_least_64_characters_long_for_security_purposes
JWT_ALGORITHM=HS256
JWT_EXPIRY_HOURS=24
KIMI_API_KEY=your_kimi_api_key_here
KIMI_BASE_URL=https://api.moonshot.ai/v1
KIMI_MODEL=kimi-k2-0711
TERMII_API_KEY=your_termii_api_key_here
TERMII_SENDER_ID=URADI360
AFRICASTALKING_API_KEY=your_africastalking_api_key_here
AFRICASTALKING_USERNAME=your_africastalking_username_here
WHATSAPP_TOKEN=your_360dialog_token_here
MAPBOX_TOKEN=your_mapbox_public_token_here
SENTRY_DSN=your_sentry_dsn_here
```

### 3. Database Setup

Start PostgreSQL and Redis services locally, or use Docker Compose:

```bash
docker-compose up -d postgres redis
```

Then run the database migrations:

```bash
cd backend
alembic upgrade head
```

### 4. Run the Backend

```bash
cd backend
uvicorn main:app --reload
```

The backend API will be available at `http://localhost:8000`.

## Frontend Development Setup

### 1. Install Node Dependencies

```bash
cd apps/command-center
npm install
```

### 2. Run Development Server

```bash
cd apps/command-center
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## Docker Development Environment

For a complete development environment, use Docker Compose:

```bash
docker-compose up --build
```

This will start all services:
- PostgreSQL database
- Redis cache
- Backend API
- Frontend application
- Nginx reverse proxy

Access the application at `http://localhost:3000`.

## Database Migrations

### Generate a New Migration

```bash
cd backend
alembic revision --autogenerate -m "Description of changes"
```

### Apply Migrations

```bash
cd backend
alembic upgrade head
```

### Downgrade Migrations

```bash
cd backend
alembic downgrade -1
```

## Testing

### Backend Tests

Tests are located in the `backend/tests` directory. Run tests with:

```bash
cd backend
pytest
```

### Frontend Tests

Tests are located in the `apps/command-center/__tests__` directory. Run tests with:

```bash
cd apps/command-center
npm test
```

## API Documentation

The FastAPI backend automatically generates interactive API documentation:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Code Quality

### Backend

- Follow PEP 8 style guidelines
- Use type hints for all function signatures
- Write docstrings for all public methods

### Frontend

- Follow Airbnb JavaScript style guide
- Use TypeScript for all components
- Write tests for complex logic

## Deployment

The production deployment uses Docker Compose with the following considerations:

1. Environment variables are loaded from a secure source
2. SSL certificates are managed with Let's Encrypt
3. Database backups are automated
4. Monitoring is configured with Sentry

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Verify PostgreSQL is running
2. Check database credentials in `.env`
3. Ensure the database user has proper permissions

### Authentication Errors

If authentication is failing:

1. Verify JWT secret in `.env`
2. Check token expiration settings
3. Ensure the user exists in the database

### Frontend Build Issues

If the frontend fails to build:

1. Verify Node.js version (18+)
2. Check for missing dependencies
3. Clear node_modules and reinstall

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests for new functionality
5. Submit a pull request

Follow the build phases outlined in the project documentation for major feature implementations.