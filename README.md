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

## Tech Stack

### Frontend
- **Next.js 16**: App Router with React Server Components
- **shadcn/ui**: Beautiful, accessible components
- **TailwindCSS**: Utility-first styling
- **PDF.js**: Advanced PDF rendering with highlighting
- **Zustand**: State management
- **Socket.IO**: Real-time updates

### Backend
- **FastAPI**: High-performance Python web framework
- **Langchain**: LLM orchestration framework
- **Google Gemini**: AI model for verification
- **Celery**: Distributed task queue
- **RabbitMQ**: Message broker
- **Redis**: Caching and session storage
- **SQLAlchemy**: ORM with connection pooling
- **Supabase**: PostgreSQL database
- **Weaviate**: Vector database for semantic search

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
