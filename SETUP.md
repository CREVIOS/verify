# IPO Document Verification System - Setup Guide

This guide will help you set up and run the complete IPO Document Verification application.

## Prerequisites

Before starting, ensure you have the following installed:

- Docker Desktop (v20.10 or higher)
- Docker Compose (v2.0 or higher)
- Node.js (v20 or higher)
- Python (v3.11 or higher)
- Git

## Environment Setup

### 1. Clone and Navigate to Project

```bash
cd verify
```

### 2. Set Up Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and configure the following:

```bash
# Required: Add your Google Gemini API Key
GOOGLE_API_KEY=your_gemini_api_key_here

# Database (keep default for local development)
DATABASE_URL=postgresql://postgres:postgres_password@localhost:5432/ipo_verification

# Redis
REDIS_URL=redis://localhost:6379/0

# Celery/RabbitMQ
CELERY_BROKER_URL=amqp://admin:rabbitmq_password@localhost:5672/ipo_vhost
CELERY_RESULT_BACKEND=redis://localhost:6379/1

# Weaviate
WEAVIATE_URL=http://localhost:8080

# Secret Key (generate a secure random string)
SECRET_KEY=your_secure_secret_key_here
```

### 3. Set Up Frontend Environment

```bash
cd ../frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
```

## Running the Application

### Option 1: Using Docker (Recommended)

This will start all services (PostgreSQL, Redis, RabbitMQ, Weaviate, Celery):

```bash
# From the project root
docker-compose up -d
```

Wait for all services to be healthy (check with `docker-compose ps`).

### Option 2: Manual Setup (Development)

#### Start Docker Services Only

```bash
# Start just the infrastructure services
docker-compose up -d postgres redis rabbitmq weaviate
```

#### Run Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations (if applicable)
# alembic upgrade head

# Start FastAPI server
uvicorn app.main:socket_app --reload --host 0.0.0.0 --port 8000

# In separate terminals, start Celery worker and beat
celery -A app.tasks.celery_app worker --loglevel=info
celery -A app.tasks.celery_app beat --loglevel=info
```

#### Run Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Accessing the Application

Once everything is running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/v1/docs
- **Flower (Celery Monitor)**: http://localhost:5555
- **RabbitMQ Management**: http://localhost:15672 (admin/rabbitmq_password)

## Using the Application

### Step 1: Create a Project

1. Navigate to http://localhost:3000
2. Click "Get Started" or go to Dashboard
3. Create a new project with a name and description
4. Add background context (optional but recommended)

### Step 2: Upload Documents

1. Upload the main IPO document (PDF or DOCX) - mark as "Main"
2. Upload supporting documents (annual reports, etc.) - mark as "Supporting"
3. Index all documents (click "Index" for each document)
4. Wait for indexing to complete (supporting documents must be indexed)

### Step 3: Run Verification

1. Go to the project's verification page
2. Select the main document to verify
3. Click "Start Verification"
4. Watch real-time progress as sentences are verified

### Step 4: Review Results

1. View the three-panel interface:
   - **Left**: Supporting documents list
   - **Center**: Main document with color-coded sentences
   - **Right**: Citations and details when you click a sentence

2. Color coding:
   - **Green**: Validated (claim is supported by evidence)
   - **Yellow**: Uncertain (ambiguous or partial support)
   - **Red**: Incorrect (contradicts evidence or unsupported)

3. Click any sentence to view:
   - AI reasoning
   - Source citations with similarity scores
   - Option to manually review and update status

## Verification API Workflow

For programmatic access:

```bash
# 1. Create project
curl -X POST http://localhost:8000/api/v1/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "My IPO Project", "description": "Test project"}'

# 2. Upload document
curl -X POST http://localhost:8000/api/v1/documents/upload \
  -F "file=@/path/to/document.pdf" \
  -F "project_id=<project-id>" \
  -F "document_type=main"

# 3. Index document
curl -X POST http://localhost:8000/api/v1/documents/<document-id>/index

# 4. Create verification job
curl -X POST http://localhost:8000/api/v1/verification/jobs \
  -H "Content-Type: application/json" \
  -d '{"project_id": "<project-id>", "main_document_id": "<document-id>"}'

# 5. Start verification
curl -X POST http://localhost:8000/api/v1/verification/jobs/<job-id>/start

# 6. Get results
curl http://localhost:8000/api/v1/verification/jobs/<job-id>
```

## Troubleshooting

### Docker Services Won't Start

```bash
# Check logs
docker-compose logs <service-name>

# Restart specific service
docker-compose restart <service-name>

# Full restart
docker-compose down && docker-compose up -d
```

### Celery Tasks Not Running

```bash
# Check Celery worker logs
docker-compose logs celery_worker

# Check RabbitMQ
docker-compose logs rabbitmq

# View tasks in Flower
open http://localhost:5555
```

### Database Connection Issues

```bash
# Check PostgreSQL
docker-compose logs postgres

# Verify connection
docker-compose exec postgres psql -U postgres -d ipo_verification
```

### Frontend Can't Connect to Backend

- Ensure backend is running on port 8000
- Check CORS settings in backend/.env
- Verify NEXT_PUBLIC_API_URL in frontend/.env.local

## Development Tips

### Backend

- API docs: http://localhost:8000/api/v1/docs (Interactive Swagger UI)
- Database: Use tools like pgAdmin or DBeaver to inspect data
- Logging: Check `backend/logs/` for detailed logs

### Frontend

- Hot reload is enabled - changes reflect immediately
- Use React DevTools for debugging
- Check browser console for errors

### Monitoring

- Celery tasks: http://localhost:5555 (Flower)
- RabbitMQ queues: http://localhost:15672
- Weaviate: http://localhost:8080/v1 (API endpoint)

## Production Deployment

For production:

1. Use proper secret management (AWS Secrets Manager, etc.)
2. Set up SSL/TLS certificates
3. Use production-grade PostgreSQL (Supabase, AWS RDS)
4. Configure proper logging and monitoring (Sentry, DataDog)
5. Set up CI/CD pipelines
6. Use environment-specific configurations
7. Enable authentication and authorization
8. Set up database backups
9. Configure rate limiting
10. Use CDN for frontend assets

## Performance Optimization

- **Backend**: Adjust DB pool size, Celery workers based on load
- **Frontend**: Enable static generation where possible
- **Weaviate**: Tune batch sizes for your data volume
- **Gemini**: Monitor API usage and costs

## Support

For issues or questions:
- Check API documentation: http://localhost:8000/api/v1/docs
- Review logs in Docker containers
- Open an issue in the repository

## Next Steps

- Integrate PDF viewer for better document visualization
- Add user authentication (NextAuth.js, Supabase Auth)
- Implement team collaboration features
- Add export functionality (PDF reports, Excel)
- Set up automated testing (pytest, Jest)
- Deploy to production (Vercel + Railway/Render)
