# URADI-360 Security Alert: Secrets Rotation Required

## ⚠️ CRITICAL ACTION REQUIRED

The `.env.production` file previously contained hardcoded secrets that were committed to git. These secrets have been rotated and must be considered **COMPROMISED**.

## What Was Done

1. ✅ Generated new secrets using `openssl rand -hex 64`
2. ✅ Updated `.env.production` with placeholder values
3. ✅ Added `.env.production` to `.gitignore`
4. ✅ Created `.env.example` as a template

## What You Must Do IMMEDIATELY

### 1. Rotate Database Password

If the PostgreSQL password was real, change it immediately:

```sql
-- Connect to PostgreSQL as admin
ALTER USER uradi WITH PASSWORD 'new_secure_password_here';
```

### 2. Rotate MinIO Credentials

If MinIO was deployed with those credentials:

```bash
# Access MinIO console and create new access keys
# Or use mc CLI:
mc admin user add myminio uradi-new
mc admin policy set myminio readwrite user=uradi-new
mc admin user remove myminio uradi  # Remove old user
```

### 3. Rotate JWT Secrets

All existing user sessions will be invalidated. Users must log in again.

### 4. Revoke API Keys

If these API keys were real, revoke and regenerate them:

- **Kimi API Key**: https://platform.moonshot.ai/
- **Termii API Key**: https://termii.com/
- **Twilio Auth Token**: https://console.twilio.com/
- **SendGrid API Key**: https://sendgrid.com/
- **Paystack Secret Key**: https://dashboard.paystack.com/

### 5. Use a Secret Manager

**DO NOT** store production secrets in `.env.production`. Use one of these:

#### Option A: Railway Secrets (Recommended)
```bash
railway variables set JWT_SECRET="your-secret-here"
railway variables set DATABASE_URL="your-db-url"
```

#### Option B: AWS Secrets Manager
```bash
aws secretsmanager create-secret \
  --name uradi360/production \
  --secret-string file://secrets.json
```

#### Option C: HashiCorp Vault
```bash
vault kv put secret/uradi360 \
  jwt_secret="your-secret-here" \
  database_url="your-db-url"
```

## New Secrets Generated (For Reference)

These are the NEW secrets that should be used (store securely):

```bash
# Generated on 2026-03-20
JWT_SECRET=58d9fbaf0526cc41ec9923af68caac6ae80d0f6bc493e9ca497d4c91d9f16ce5ce482381192f71d591c1c16d29df66d008a9154f1f1f256299c78d9eb8a20c4b

JWT_REFRESH_SECRET=5944cc50566fcd2287ceea1314276b2ec19f727ce42cab26319852ccf32dde19508dae2eb55b33772a048603cccaec86aa2f4a1aed9c2484d7ee9808a3cebc9f

SESSION_SECRET=a733bcb904b61402b0109cc2f65c76021d45801d3e71085af8d2e53951f9997ac257e620a8b50e84b8a7f4e35a5b81aeacf2bf1719b93dadf46719a9857186e5

POSTGRES_PASSWORD=ec5409a707f6fd34ec4cc11465a69082044896157e053c0248fc584ee219cf04

MINIO_ACCESS_KEY=48ca3876350d7951b1a2c33eb149aa3a3a4b2f17c8250b7ca940bf848aded576

MINIO_SECRET_KEY=960bf1ca983cfbae4760891c6e19b4551b97bd4bbe5a7d7f4c54d2282af10f8600e1d1adb9c8b63f048b8ecdb44d696f38196e7c7b9e22ad2a62defdbadb5080
```

**⚠️ WARNING**: These secrets are shown here for your convenience. Store them securely and do not commit them.

## Git History Cleanup (Optional but Recommended)

The old secrets are still in git history. To completely remove them:

```bash
# Install git-filter-repo if needed
# pip install git-filter-repo

# Remove the file from history
git filter-repo --path .env.production --invert-paths

# Force push (DANGEROUS - coordinate with team)
git push origin --force --all
```

**Note**: This rewrites git history. All team members must re-clone the repository.

## Verification Checklist

- [ ] Database password rotated
- [ ] MinIO credentials rotated
- [ ] JWT secrets rotated
- [ ] All third-party API keys revoked and regenerated
- [ ] `.env.production` added to `.gitignore`
- [ ] Production secrets stored in secret manager (not in repo)
- [ ] Team notified to re-clone if git history was rewritten
- [ ] Application tested with new secrets

## Questions?

Contact the security team or refer to:
- `.env.example` for configuration template
- `DEPLOYMENT_GUIDE.md` for deployment instructions
