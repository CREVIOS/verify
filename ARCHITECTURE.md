# IPO Document Verification System - Architecture Overview

## System Architecture

This is a production-grade, AI-powered IPO document verification platform that validates claims in IPO documents against supporting evidence, similar to Wizpresso's Factify.

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                            │
│                  (Next.js 16 + shadcn/ui)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │  Supporting  │  │  PDF Viewer  │  │  Citations Panel    │  │
│  │  Documents   │  │  (Center)    │  │  (Right Sidebar)    │  │
│  │  (Left)      │  │              │  │                     │  │
│  └──────────────┘  └──────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API Layer (FastAPI)                          │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────────────┐   │
│  │ Projects │  │Documents │  │  Verification Endpoints    │   │
│  │   API    │  │   API    │  │  (Jobs, Sentences, Review) │   │
│  └──────────┘  └──────────┘  └────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                 ┌────────────┼────────────┐
                 ▼            ▼            ▼
┌──────────────────┐  ┌──────────────┐  ┌────────────────────┐
│   PostgreSQL     │  │   Weaviate   │  │  RabbitMQ + Redis  │
│   (Supabase)     │  │   Vector DB  │  │  (Task Queue)      │
│                  │  │              │  │                    │
│  • Projects      │  │ • Embeddings │  │  • Celery Worker   │
│  • Documents     │  │ • Semantic   │  │  • Celery Beat     │
│  • Jobs          │  │   Search     │  │  • Flower Monitor  │
│  • Sentences     │  │ • Citations  │  │                    │
│  • Citations     │  │              │  │                    │
└──────────────────┘  └──────────────┘  └────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              AI Verification Pipeline                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  1. Document Processing (PDF/DOCX → Sentences)           │  │
│  │  2. Vector Embedding (Sentence Transformers)             │  │
│  │  3. Semantic Search (Weaviate Retrieval)                 │  │
│  │  4. LLM Verification (Langchain + Google Gemini)         │  │
│  │  5. Citation Extraction & Linking                        │  │
│  │  6. Confidence Scoring                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Frontend (Next.js 16)

**Location**: `/frontend`

**Key Features**:
- App Router with React Server Components
- Three-panel verification interface
- Real-time progress updates via WebSocket
- Color-coded sentence highlighting
- Interactive citation viewer
- Responsive design

**Main Components**:
- `VerificationViewer.tsx`: Three-panel verification UI
- `app/(dashboard)`: Dashboard and project pages
- `components/ui/`: shadcn UI components
- `lib/api.ts`: API client
- `lib/socket.ts`: WebSocket integration

### 2. Backend (FastAPI)

**Location**: `/backend`

**Modular Structure**:
```
backend/
├── app/
│   ├── api/              # API endpoints
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── projects.py      # Project CRUD
│   │       │   ├── documents.py     # Upload, Index
│   │       │   └── verification.py  # Jobs, Review
│   │       └── router.py
│   ├── core/             # Configuration
│   │   ├── config.py     # Settings
│   │   └── logging.py    # Logging setup
│   ├── db/               # Database
│   │   ├── models.py     # SQLAlchemy models
│   │   └── session.py    # Connection pooling
│   ├── services/         # Business logic
│   │   ├── document_processor.py   # PDF/DOCX parsing
│   │   ├── vector_store.py         # Weaviate integration
│   │   └── verification_service.py # LLM verification
│   ├── tasks/            # Celery tasks
│   │   ├── celery_app.py
│   │   ├── document_tasks.py       # Indexing
│   │   └── verification_tasks.py   # Verification
│   ├── schemas/          # Pydantic models
│   │   ├── project.py
│   │   ├── document.py
│   │   └── verification.py
│   └── main.py          # App entry point
```

### 3. Document Processing Pipeline

**Flow**:
1. **Upload**: User uploads PDF/DOCX files
2. **Parse**: Extract text with page/position tracking
3. **Chunk**: Split into overlapping chunks for embeddings
4. **Embed**: Generate vectors using Sentence Transformers
5. **Index**: Store in Weaviate with metadata

**Code**: `backend/app/services/document_processor.py`

### 4. Verification Pipeline

**Flow**:
1. **Extract Sentences**: Parse main document into sentences
2. **For each sentence**:
   - Generate embedding
   - Search Weaviate for similar chunks
   - Build context with top-k results
   - Send to Gemini with verification prompt
   - Parse LLM response for validation + citations
   - Store results with confidence scores

**Code**: `backend/app/services/verification_service.py`

**Verification Prompt Structure**:
```
System: Expert document verifier instructions
Human:
  - Claim: {sentence}
  - Context: {project_background}
  - Evidence: {retrieved_chunks}

Response Format:
  - validation_result: VALIDATED|UNCERTAIN|INCORRECT
  - confidence_score: 0.0-1.0
  - reasoning: explanation
  - citations: [{ document, page, quote, relevance }]
```

### 5. Database Schema

**Key Models**:

```python
Project
  - id (UUID)
  - name, description, background_context
  - created_at, updated_at

Document
  - id (UUID)
  - project_id (FK)
  - filename, file_path, file_size
  - document_type (MAIN | SUPPORTING)
  - indexed (bool)
  - page_count, metadata

DocumentChunk
  - id (UUID)
  - document_id (FK)
  - content, page_number
  - weaviate_id (for vector store)

VerificationJob
  - id (UUID)
  - project_id (FK)
  - main_document_id (FK)
  - status (PENDING|PROCESSING|COMPLETED|FAILED)
  - progress, statistics
  - celery_task_id

VerifiedSentence
  - id (UUID)
  - verification_job_id (FK)
  - content, page_number
  - validation_result (VALIDATED|UNCERTAIN|INCORRECT)
  - confidence_score, reasoning
  - citations (JSON)
  - manually_reviewed, reviewer_notes
```

### 6. Async Task Processing

**Celery Workers**:
- `index_document_task`: Process and index documents
- `run_verification_task`: Verify all sentences in a job

**Configuration**:
- Broker: RabbitMQ (reliable message delivery)
- Backend: Redis (fast result storage)
- Workers: Configurable concurrency
- Monitoring: Flower web UI

### 7. Vector Store (Weaviate)

**Schema per Project**:
```
Collection: Project_{project_id}
  - content (text)
  - document_id, chunk_id
  - page_number, start_char, end_char
  - filename, document_type
  - vector (384-dim from sentence-transformers)
```

**Search Strategy**:
- Cosine similarity search
- Top-k retrieval (default: 5)
- Minimum similarity threshold: 0.7
- Batch indexing for performance

## Data Flow Example

### Complete Workflow

1. **User creates project**:
   ```
   POST /api/v1/projects
   → Creates Project record
   → Creates Weaviate collection
   ```

2. **User uploads documents**:
   ```
   POST /api/v1/documents/upload
   → Saves file to disk
   → Creates Document record
   → Returns document_id
   ```

3. **System indexes documents**:
   ```
   POST /api/v1/documents/{id}/index
   → Triggers Celery task
   → Parses PDF/DOCX
   → Creates chunks
   → Generates embeddings
   → Stores in Weaviate + PostgreSQL
   ```

4. **User starts verification**:
   ```
   POST /api/v1/verification/jobs
   → Creates VerificationJob

   POST /api/v1/verification/jobs/{id}/start
   → Triggers Celery task
   → Extracts sentences from main doc
   → For each sentence:
     - Searches Weaviate
     - Calls Gemini API
     - Stores VerifiedSentence with citations
     - Sends WebSocket progress update
   ```

5. **User reviews results**:
   ```
   GET /api/v1/verification/jobs/{id}
   → Returns job with all sentences
   → Frontend renders three-panel UI
   → User clicks sentence → shows citations
   ```

## Key Design Decisions

### 1. Modular Architecture
- Separation of concerns (API, Services, Tasks, DB)
- Easy to test and maintain
- Can scale individual components

### 2. Async Processing
- Long-running tasks don't block API
- Progress tracking via WebSocket
- Retry mechanisms for failures

### 3. Citation Tracking
- Every verification linked to source
- Page and character positions stored
- Similarity scores for confidence

### 4. Connection Pooling
- PostgreSQL pool (20 connections, 10 overflow)
- Redis connection pooling
- Weaviate batch operations

### 5. Validation Tiers
- **VALIDATED** (Green): High confidence, strong evidence
- **UNCERTAIN** (Yellow): Moderate confidence, needs review
- **INCORRECT** (Red): Contradicts or lacks evidence

### 6. Embeddings
- Sentence Transformers (all-MiniLM-L6-v2)
- 384-dimensional vectors
- Fast inference, good quality

### 7. LLM Integration
- Google Gemini 1.5 Pro
- Low temperature (0.1) for consistency
- Structured JSON output
- Retry logic for errors

## Performance Considerations

### Scalability
- **Horizontal**: Add more Celery workers
- **Vertical**: Increase worker concurrency
- **Database**: Connection pooling, indexes
- **Vector Store**: Batch operations
- **Caching**: Redis for frequent queries

### Optimization
- Chunk size: 512 tokens (balance context vs speed)
- Batch size: 10 sentences (LLM rate limits)
- Weaviate batch: 100 chunks (network efficiency)
- DB pool: 20 connections (based on load)

## Security

### Current
- Environment-based secrets
- CORS configuration
- Input validation (Pydantic)
- File type restrictions
- Size limits

### Production Additions Needed
- Authentication (JWT, OAuth)
- Authorization (RBAC)
- Rate limiting
- Input sanitization
- SQL injection protection (using ORM)
- XSS protection
- HTTPS/TLS
- Secret management (Vault, AWS Secrets)

## Monitoring & Observability

### Logging
- Loguru for structured logging
- JSON format for production
- File rotation (30 days)
- Log levels (INFO, ERROR, DEBUG)

### Monitoring
- Flower: Celery task monitoring
- RabbitMQ Management: Queue health
- PostgreSQL: Connection pool stats
- Weaviate: Vector store metrics

### Metrics to Track
- Verification throughput (sentences/min)
- Average confidence scores
- Citation quality (similarity scores)
- Task queue depth
- API response times
- Database query performance
- LLM API costs

## Future Enhancements

1. **Advanced PDF Viewer**
   - Render actual PDFs with highlights
   - Click citations → jump to source page
   - Side-by-side comparison

2. **Collaborative Review**
   - Multiple reviewers
   - Comments and discussions
   - Approval workflows

3. **Export & Reporting**
   - PDF reports with citations
   - Excel exports
   - Audit trails

4. **Advanced Analytics**
   - Verification quality metrics
   - Document comparison
   - Trend analysis

5. **Performance**
   - Caching frequent queries
   - Pre-computation of embeddings
   - Parallel processing

6. **AI Improvements**
   - Fine-tuned models for IPO domain
   - Multi-model ensemble
   - Active learning from reviews

## Getting Started

See [SETUP.md](./SETUP.md) for detailed setup instructions.

Quick start:
```bash
# Start all services
docker-compose up -d

# Backend (in separate terminal)
cd backend
pip install -r requirements.txt
uvicorn app.main:socket_app --reload

# Frontend (in separate terminal)
cd frontend
npm install
npm run dev
```

Access at http://localhost:3000
