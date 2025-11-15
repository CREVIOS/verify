# IPO Document Verification System

A production-grade IPO document verification platform with AI-powered citation tracking and validation, similar to Wizpresso's Factify.

## Features

- 📄 **Document Processing**: Upload and process IPO documents (PDF/DOCX) with supporting materials
- 🔍 **AI Verification**: Sentence-level verification using Langchain + Google Gemini
- 🎯 **Citation Tracking**: Every claim is linked to source documents with precise citations
- 🎨 **Color-Coded Highlighting**: Green (validated), Yellow (uncertain), Red (incorrect)
- 📊 **Three-Panel Interface**: Supporting docs (left), PDF viewer (center), Citations (right)
- ⚡ **Async Processing**: Celery + RabbitMQ for background job processing
- 🔄 **Real-time Updates**: WebSocket support for live verification status
- 🗃️ **Vector Search**: Weaviate integration for semantic document retrieval

## Tech Stack (State-of-the-Art 2025)

### Frontend
- **Next.js 15.1+**: App Router with Turbopack, React Server Components
- **pnpm 8.15+**: Fast, disk-efficient package manager (3x faster than npm)
- **shadcn/ui**: Beautiful, accessible Radix UI components
- **TailwindCSS 3.4+**: Utility-first styling with JIT
- **PDF.js**: Advanced PDF rendering with highlighting
- **Zustand**: Lightweight state management (< 1KB)
- **Socket.IO**: Real-time WebSocket updates
- **TypeScript 5.3+**: Full type safety

### Backend (Production-Optimized)
- **FastAPI 0.109+**: High-performance async Python framework
- **Poetry**: Modern dependency management with lock files
- **OpenAI text-embedding-3-large**: SOTA embedding model (3,072 dimensions)
- **Google Gemini 1.5 Pro**: Latest multimodal LLM for verification
- **Supabase Storage**: S3-compatible object storage with CDN
- **Langchain**: LLM orchestration framework
- **Celery 5.3+**: Distributed task queue with retry logic
- **RabbitMQ 3.12+**: Reliable message broker
- **Redis 7+**: In-memory cache and session store
- **SQLAlchemy 2.0+**: Async ORM with connection pooling (20 connections)
- **PostgreSQL 16**: Via Supabase with PgBouncer
- **Weaviate 4.4+**: Vector database for semantic search

### Production Features
- **Rate Limiting**: SlowAPI middleware (60 req/min)
- **Monitoring**: Sentry + Prometheus + Flower
- **Caching**: Multi-layer with Redis (1hr TTL)
- **Logging**: Structured JSON logging with Loguru
- **Security**: JWT auth, bcrypt hashing, input validation
- **Performance**: Async/await, batch processing, connection pooling

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Next.js   │─────▶│   FastAPI    │─────▶│  Supabase   │
│   Frontend  │      │   Backend    │      │ PostgreSQL  │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ├─────▶┌─────────────┐
                            │      │   Weaviate  │
                            │      │   Vector    │
                            │      └─────────────┘
                            │
                            ├─────▶┌─────────────┐
                            │      │   RabbitMQ  │
                            │      │   + Celery  │
                            │      └─────────────┘
                            │
                            └─────▶┌─────────────┐
                                   │    Redis    │
                                   └─────────────┘
```

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 20+
- Python 3.11+
- Google Gemini API Key
- Supabase Account

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd verify
```

2. Set up environment variables:
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials

# Frontend
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local with your API URL
```

3. Start Docker services:
```bash
docker-compose up -d
```

4. Install dependencies and run:
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

5. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Project Structure

```
verify/
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Core configuration
│   │   ├── db/             # Database models & connection
│   │   ├── services/       # Business logic
│   │   ├── tasks/          # Celery tasks
│   │   ├── schemas/        # Pydantic schemas
│   │   └── utils/          # Utilities
│   ├── tests/              # Backend tests
│   ├── requirements.txt
│   └── pyproject.toml
├── frontend/               # Next.js 16 frontend
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── lib/              # Utilities
│   ├── hooks/            # Custom hooks
│   └── public/           # Static assets
├── docker-compose.yml     # Docker services
└── README.md
```

## Usage

1. **Upload Documents**: Upload the main IPO document and supporting materials
2. **Configure Job**: Select main document, mark supporting docs, add context
3. **Index Documents**: Process and embed documents into vector store
4. **Run Verification**: Start the verification job
5. **Review Results**: View color-coded highlights and citations in the three-panel UI
6. **Export Report**: Generate verification reports with all citations

## Development

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Database Migrations

```bash
cd backend
alembic upgrade head
```

## License

MIT

## Support

For issues and questions, please open a GitHub issue.
