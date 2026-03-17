# URADI-360 Deployment Guide

## Overview
This guide covers deploying the URADI-360 platform across multiple environments.

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Command Center │     │  Citizen Portal │     │   Field App     │
│   (Next.js 15)  │     │   (Next.js 15)  │     │  (Expo/React    │
│   Vercel (Auth) │     │  Vercel (Public)│     │    Native)      │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │    API Core (FastAPI)   │
                    │      Railway.app        │
                    └────────────┬────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
     ┌────────▼────────┐  ┌──────▼──────┐  ┌───────▼────────┐
     │   PostgreSQL    │  │    Redis    │  │  Supabase      │
     │   (Supabase)    │  │  (Upstash)  │  │  Storage       │
     └─────────────────┘  └─────────────┘  └────────────────┘
```

---

## 1. Backend Deployment (Railway)

### Prerequisites
- Railway CLI installed
- Git repository connected to Railway

### Steps

1. **Create Railway Project**
   ```bash
   railway login
   railway init
   ```

2. **Add PostgreSQL Database**
   ```bash
   railway add --database postgres
   ```

3. **Add Redis**
   ```bash
   railway add --plugin redis
   ```

4. **Environment Variables**
   Set these in Railway Dashboard:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   SECRET_KEY=your-secret-key-here
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ALLOWED_ORIGINS=https://uradi360.vercel.app,https://uradi360-public.vercel.app
   ```

5. **Deploy**
   ```bash
   railway up
   ```

---

## 2. Command Center Deployment (Vercel)

### Prerequisites
- Vercel CLI installed
- Git repository

### Steps

1. **Create Project**
   ```bash
   cd apps/command-center
   vercel --prod
   ```

2. **Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://uradi360-api.up.railway.app
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Authentication Protection**
   The command center is protected by Supabase Auth. Only users with roles:
   - `admin`
   - `strategist`
   - `coordinator`
   - `analyst`
   
   can access the dashboard.

4. **Deploy**
   ```bash
   vercel --prod
   ```

---

## 3. Citizen Portal Deployment (Vercel)

### Steps

1. **Create Project**
   ```bash
   cd apps/citizen-portal
   vercel --prod
   ```

2. **Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://uradi360-api.up.railway.app
   NEXT_PUBLIC_TENANT_ID=jigawa
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

---

## 4. Field App Deployment (EAS)

### Prerequisites
- EAS CLI installed
- Expo account

### Steps

1. **Configure EAS**
   ```bash
   cd apps/field-app
   eas build:configure
   ```

2. **Build APK**
   ```bash
   eas build --platform android --profile preview
   ```

3. **Internal Distribution**
   ```bash
   eas build --platform android --profile production --non-interactive
   ```

4. **Download and Distribute**
   Share the APK link with field agents via secure channel.

---

## 5. Database Seeding

### Production Data

Run the seed script:
```bash
cd backend
python seed_production_data.py
```

This seeds:
- All 27 Jigawa LGAs with GeoJSON
- All wards (200+)
- Polling units (5000+)
- Admin user
- Sample voters

---

## 6. Security Checklist

### Tenant Isolation
- [ ] Verify RLS policies on all tables
- [ ] Test cross-tenant data access (should fail)
- [ ] Confirm tenant_id is required on all queries

### Authentication
- [ ] JWT tokens expire correctly
- [ ] Password hashing uses bcrypt
- [ ] Role-based access control enforced
- [ ] API endpoints require authentication

### Data Protection
- [ ] No PII in logs
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Rate limiting enabled

---

## 7. Performance Optimization

### Backend
- Database indexes on tenant_id, created_at
- Redis caching for frequent queries
- Connection pooling

### Frontend
- Image optimization
- Code splitting
- Lazy loading
- Service worker for offline support

### Lighthouse Targets
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

---

## 8. Monitoring

### Health Checks
- Backend: `/health`
- Database: Connection test
- Redis: Ping test

### Alerts
- Database connection failures
- High error rates
- Disk space warnings
- Memory usage alerts

---

## 9. Backup Strategy

### Database
- Daily automated backups (Supabase)
- Weekly manual exports
- Point-in-time recovery enabled

### Files
- Supabase Storage backups
- Version control for code

---

## 10. Rollback Plan

If deployment fails:
1. Revert to previous commit
2. Restore database from backup
3. Update DNS if needed
4. Notify team via Slack

---

## URLs After Deployment

| Service | URL |
|---------|-----|
| API | https://uradi360-api.up.railway.app |
| Command Center | https://uradi360.vercel.app |
| Citizen Portal | https://uradi360-public.vercel.app |
| API Docs | https://uradi360-api.up.railway.app/docs |

---

## Support

For deployment issues:
1. Check Railway logs: `railway logs`
2. Check Vercel logs: Dashboard > Deployments
3. Review error tracking (Sentry)
4. Contact: tech@uradi360.com
