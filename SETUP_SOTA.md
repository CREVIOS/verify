# Setup Guide - State-of-the-Art Stack

This guide will help you set up the IPO Document Verification application with the latest SOTA stack.

## Prerequisites

- **Docker Desktop** (v20.10+)
- **Node.js** (v20.0+) - for pnpm
- **Python** (v3.11+)
- **pnpm** (v8.15+) - Install with: `npm install -g pnpm`
- **Poetry** - Install with: `curl -sSL https://install.python-poetry.org | python3 -`
- **Git**

## Required API Keys

You'll need the following API keys:

1. **OpenAI API Key** - For text-embedding-3-large embeddings
   - Get from: https://platform.openai.com/api-keys
   - Cost: ~$0.13 per 1M tokens

2. **Google Gemini API Key** - For document verification
   - Get from: https://makersuite.google.com/app/apikey
   - Free tier available

3. **Supabase Project** - For database and storage
   - Sign up at: https://supabase.com
   - Free tier: 500MB database, 1GB storage

## Step 1: Clone and Setup

```bash
cd verify
```

## Step 2: Backend Setup with Poetry

```bash
cd backend

# Install dependencies with Poetry
poetry install

# Activate virtual environment
poetry shell

# Copy environment file
cp .env.example .env
```

Edit `backend/.env` with your credentials:

```bash
# Required API Keys
OPENAI_API_KEY=sk-your-openai-key-here
GOOGLE_API_KEY=your-gemini-key-here

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-role-key
SUPABASE_STORAGE_BUCKET=ipo-documents

# Database (from Supabase project settings)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project.supabase.co:5432/postgres

# Redis, RabbitMQ, Weaviate (Docker services)
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=amqp://admin:rabbitmq_password@localhost:5672/ipo_vhost
WEAVIATE_URL=http://localhost:8080

# Security
SECRET_KEY=your-super-secret-key-change-in-production

# Storage Mode
USE_SUPABASE_STORAGE=true  # Set to false for local filesystem
```

## Step 3: Setup Supabase Storage

1. Go to your Supabase Dashboard
2. Navigate to **Storage** → **New Bucket**
3. Create bucket named: `ipo-documents`
4. Set to **Private** (not public)
5. Configure in your `.env` file

## Step 4: Frontend Setup with pnpm

```bash
cd ../frontend

# Install pnpm if not already installed
npm install -g pnpm@8.15.1

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
```

## Step 5: Start Docker Services

Start infrastructure services (PostgreSQL, Redis, RabbitMQ, Weaviate):

```bash
# From project root
docker-compose up -d postgres redis rabbitmq weaviate
```

Wait for all services to be healthy:

```bash
docker-compose ps
```

## Step 6: Run Backend

```bash
cd backend

# Make sure Poetry environment is activated
poetry shell

# Run FastAPI server
poetry run uvicorn app.main:socket_app --reload --host 0.0.0.0 --port 8000
```

In separate terminals:

```bash
# Terminal 2: Start Celery worker
cd backend
poetry shell
poetry run celery -A app.tasks.celery_app worker --loglevel=info --concurrency=4

# Terminal 3: Start Celery beat (scheduler)
cd backend
poetry shell
poetry run celery -A app.tasks.celery_app beat --loglevel=info
```

## Step 7: Run Frontend

```bash
cd frontend

# Start Next.js with Turbopack (faster)
pnpm dev
```

## Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs** (Swagger): http://localhost:8000/api/v1/docs
- **Flower** (Celery Monitoring): http://localhost:5555
- **RabbitMQ Management**: http://localhost:15672 (admin/rabbitmq_password)

## Verification Workflow

### 1. Create Project

Navigate to http://localhost:3000 and:
- Click "Get Started" or "Create New Project"
- Enter project name and description
- Add background context (helps AI understand domain)

### 2. Upload Documents

**Main Document** (IPO prospectus):
- Upload PDF or DOCX file
- Mark as "Main" document type
- This is the document to be verified

**Supporting Documents** (evidence):
- Upload annual reports, financial statements, etc.
- Mark as "Supporting" document type
- These provide evidence for verification

### 3. Index Documents

- Click "Index" for each supporting document
- Wait for indexing to complete (shows progress)
- Embeddings are generated using OpenAI text-embedding-3-large
- Stored in Weaviate vector database

### 4. Run Verification

- Select the main document to verify
- Click "Start Verification"
- Watch real-time progress via WebSocket
- Celery processes verification in background

### 5. Review Results

Three-panel interface:
- **Left Panel**: List of supporting documents
- **Center Panel**: Main document with color-coded sentences
  - 🟢 Green: Validated (supported by evidence)
  - 🟡 Yellow: Uncertain (needs review)
  - 🔴 Red: Incorrect (contradicts evidence)
- **Right Panel**: Citations and AI reasoning (click any sentence)

## Production Deployment

### Backend (Railway/Render)

1. **Set Environment Variables**:
```bash
# All from .env file
OPENAI_API_KEY=...
GOOGLE_API_KEY=...
SUPABASE_URL=...
# etc.
```

2. **Install Dependencies**:
```bash
poetry install --no-dev
```

3. **Run with Gunicorn**:
```bash
poetry run gunicorn app.main:socket_app \
  -w 4 \
  -k uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:$PORT
```

### Frontend (Vercel)

```bash
cd frontend

# Build
pnpm build

# Deploy to Vercel
pnpm vercel --prod
```

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_API_URL`: Your backend URL
- `NEXT_PUBLIC_SOCKET_URL`: Your backend URL

### Celery Workers (Separate Service)

Deploy Celery workers as a separate service:

```bash
poetry run celery -A app.tasks.celery_app worker \
  --loglevel=info \
  --concurrency=4 \
  --max-tasks-per-child=100
```

## Performance Tips

### OpenAI Embeddings
- Batch processing: 100 texts/call (faster + cheaper)
- Caching: Redis stores frequent queries
- Retry logic: Automatic with exponential backoff

### Database
- Connection pooling: 20 connections configured
- Use indexes on frequently queried columns
- Enable query logging in dev, disable in prod

### Frontend
- Turbopack: 700x faster than Webpack
- Image optimization: Use Next.js Image component
- Code splitting: Automatic with App Router
- Static generation: Pre-render where possible

## Monitoring

### Sentry (Errors)
```bash
# Backend
SENTRY_DSN=your-sentry-dsn

# Frontend
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### Prometheus (Metrics)
```bash
# Enable in backend
PROMETHEUS_ENABLED=true

# Access metrics
curl http://localhost:8000/metrics
```

### Flower (Celery)
```bash
# Access at http://localhost:5555
# Monitor task queue, failures, retries
```

## Troubleshooting

### Poetry Issues

```bash
# Clear cache
poetry cache clear pypi --all

# Reinstall
rm -rf poetry.lock
poetry install
```

### pnpm Issues

```bash
# Clear cache
pnpm store prune

# Reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### OpenAI Rate Limits

```bash
# Reduce batch size
OPENAI_EMBEDDING_BATCH_SIZE=50  # Default: 100

# Add delay between requests (in code)
```

### Supabase Storage Issues

```bash
# Check bucket exists
curl https://your-project.supabase.co/storage/v1/bucket

# Verify permissions in Supabase dashboard
# Storage → Policies → Add policy
```

### Weaviate Connection

```bash
# Check if running
curl http://localhost:8080/v1/.well-known/ready

# Restart
docker-compose restart weaviate
```

## Cost Optimization

### OpenAI Embeddings
- **text-embedding-3-large**: $0.13 / 1M tokens
- Typical document: ~500 tokens
- 1000 documents: ~$0.065

### Gemini
- **gemini-1.5-pro**: $0.00125 / 1K characters (input)
- Typical verification: 2K characters
- 1000 sentences: ~$2.50

### Supabase
- Free tier: 500MB DB + 1GB storage
- Paid: $25/month for more resources

### Infrastructure (Docker)
- Development: Free (local)
- Production: $20-50/month (Railway/Render)

## Next Steps

1. ✅ Set up development environment
2. ✅ Test with sample documents
3. ⏳ Configure production environment
4. ⏳ Set up monitoring (Sentry + Prometheus)
5. ⏳ Deploy to production
6. ⏳ Add custom domain and SSL
7. ⏳ Set up CI/CD pipeline
8. ⏳ Configure backups

## Support

- **Documentation**: See TECH_STACK.md for detailed stack info
- **Architecture**: See ARCHITECTURE.md for system design
- **Issues**: Open GitHub issue for bugs/questions

## Performance Benchmarks

Expected performance with SOTA stack:

- **Embedding Generation**: 100 texts/second (batch mode)
- **Vector Search**: < 100ms for 100k+ vectors
- **API Response**: < 100ms average, < 250ms P95
- **Verification**: ~1 sentence/second (with Gemini)
- **Database Queries**: < 50ms (with indexes)

## Best Practices

### Development
- Use `pnpm dev` with Turbopack for fast refresh
- Enable `poetry shell` for isolated environment
- Use TypeScript strict mode
- Run `pnpm lint` before commits

### Production
- Enable rate limiting
- Use HTTPS/TLS
- Rotate API keys regularly
- Monitor error rates with Sentry
- Set up database backups
- Use CDN for frontend assets

---

Built with ❤️ using state-of-the-art technologies in 2025.
