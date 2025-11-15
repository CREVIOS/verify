# Production Setup Guide

## 🚀 Quick Start

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum, 8GB+ recommended
- 20GB disk space

### Initial Setup

1. **Clone and Configure**
   ```bash
   git clone <repository-url>
   cd verify
   cp .env.production.example .env
   ```

2. **Edit Environment Variables**
   ```bash
   nano .env
   ```
   **Required values:**
   - `POSTGRES_PASSWORD` - Strong database password
   - `RABBITMQ_PASSWORD` - Strong RabbitMQ password
   - `OPENAI_API_KEY` - OpenAI API key for embeddings
   - `MISTRAL_API_KEY` - Mistral AI key for verification
   - `SUPABASE_URL` and `SUPABASE_KEY` - For document storage
   - `SECRET_KEY` - Random 64-character string

3. **Deploy**
   ```bash
   ./deploy.sh start
   ```

4. **Verify Deployment**
   ```bash
   ./deploy.sh status
   ```

## 📋 System Architecture

### Services

| Service | Port | Purpose |
|---------|------|---------|
| Frontend | 3000 | Next.js UI |
| Backend | 8000 | FastAPI REST API |
| PostgreSQL | 5432 | Primary database |
| Redis | 6379 | Cache & Celery backend |
| RabbitMQ | 5672, 15672 | Message broker + Management UI |
| Weaviate | 8080 | Vector database |
| Flower | 5555 | Celery monitoring |

### Data Flow

```
User → Frontend → Backend → PostgreSQL
                  ↓
              Celery Worker → Weaviate (vectors)
                  ↓           ↓
              RabbitMQ    OpenAI/Mistral APIs
                  ↓
              Redis (cache)
```

## 🔧 Management Commands

### Service Control
```bash
# Start all services
./deploy.sh start

# Stop all services
./deploy.sh stop

# Restart all services
./deploy.sh restart

# View logs (all services)
./deploy.sh logs

# View logs (specific service)
./deploy.sh logs backend
./deploy.sh logs frontend
./deploy.sh logs celery-worker

# Check service status
./deploy.sh status
```

### Database Management
```bash
# Run migrations
./deploy.sh migrate

# Create backup
./deploy.sh backup

# Restore from backup
docker-compose -f docker-compose.prod.yml exec -T postgres \
  psql -U postgres ipo_verification < backup_YYYYMMDD_HHMMSS.sql
```

### Celery Worker Management
```bash
# Scale workers
docker-compose -f docker-compose.prod.yml up -d --scale celery-worker=4

# View Flower monitoring UI
open http://localhost:5555
```

## 📊 Monitoring

### Health Checks

**Backend Health:**
```bash
curl http://localhost:8000/api/health
```

**Frontend Health:**
```bash
curl http://localhost:3000
```

**Database Health:**
```bash
docker-compose -f docker-compose.prod.yml exec postgres \
  pg_isready -U postgres
```

### Metrics

**Prometheus Metrics:**
```bash
curl http://localhost:8000/api/metrics
```

**RabbitMQ Management:**
- URL: http://localhost:15672
- Default: admin/changeme (change in .env)

**Flower (Celery):**
- URL: http://localhost:5555

### Logs

**Real-time logs:**
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100 backend
```

**Log locations:**
- Backend: stdout (captured by Docker)
- Frontend: stdout (captured by Docker)
- PostgreSQL: `/var/lib/postgresql/data/pg_log/`
- RabbitMQ: stdout

## 🔐 Security

### Environment Security

**Change default passwords:**
```bash
# Generate strong passwords
openssl rand -base64 32

# Update in .env:
POSTGRES_PASSWORD=<generated-password>
RABBITMQ_PASSWORD=<generated-password>
SECRET_KEY=<generated-secret>
```

### Network Security

**Firewall rules:**
```bash
# Allow only necessary ports
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw deny 5432/tcp   # Block external PostgreSQL
ufw deny 6379/tcp   # Block external Redis
ufw deny 5672/tcp   # Block external RabbitMQ
```

**CORS Configuration:**
Update `CORS_ORIGINS` in `.env`:
```
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### SSL/TLS

**Using Nginx reverse proxy:**
```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📈 Performance Tuning

### Database Optimization

**postgresql.conf:**
```ini
# Connection pooling
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
work_mem = 16MB

# Query optimization
random_page_cost = 1.1  # For SSD
effective_io_concurrency = 200
```

### Redis Configuration

**redis.conf:**
```ini
maxmemory 512mb
maxmemory-policy allkeys-lru
appendonly yes
```

### Celery Workers

**Scale based on load:**
```bash
# CPU-bound tasks: workers = CPU cores
# I/O-bound tasks: workers = 2 * CPU cores

docker-compose -f docker-compose.prod.yml up -d --scale celery-worker=8
```

## 🔄 Backup & Recovery

### Automated Backups

**Cron job for daily backups:**
```bash
# Add to crontab
crontab -e

# Backup daily at 2 AM
0 2 * * * cd /path/to/verify && ./deploy.sh backup

# Keep backups for 30 days
0 3 * * * find /path/to/verify/backup_*.sql -mtime +30 -delete
```

### Manual Backup
```bash
# Create backup
./deploy.sh backup

# Output: backup_YYYYMMDD_HHMMSS.sql
```

### Restore

**From backup file:**
```bash
# Stop application
./deploy.sh stop

# Start only database
docker-compose -f docker-compose.prod.yml up -d postgres

# Wait for database
sleep 10

# Restore
docker-compose -f docker-compose.prod.yml exec -T postgres \
  psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS ipo_verification;"
docker-compose -f docker-compose.prod.yml exec -T postgres \
  psql -U postgres -d postgres -c "CREATE DATABASE ipo_verification;"
docker-compose -f docker-compose.prod.yml exec -T postgres \
  psql -U postgres ipo_verification < backup_YYYYMMDD_HHMMSS.sql

# Start all services
./deploy.sh start
```

## 🚨 Troubleshooting

### Service Won't Start

**Check logs:**
```bash
./deploy.sh logs <service-name>
```

**Common issues:**
- Port already in use: Change port in docker-compose.prod.yml
- Insufficient memory: Increase Docker memory limit
- Missing environment variables: Check .env file

### Database Connection Issues

**Check database:**
```bash
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U postgres -c "SELECT version();"
```

**Reset database:**
```bash
./deploy.sh stop
docker volume rm verify_postgres_data
./deploy.sh start
```

### Celery Worker Not Processing

**Check RabbitMQ:**
```bash
docker-compose -f docker-compose.prod.yml exec rabbitmq \
  rabbitmqctl list_queues
```

**Restart workers:**
```bash
docker-compose -f docker-compose.prod.yml restart celery-worker
```

### High Memory Usage

**Check container stats:**
```bash
docker stats
```

**Limit container memory:**
Edit `docker-compose.prod.yml` and add:
```yaml
deploy:
  resources:
    limits:
      memory: 512M
```

## 📞 Support

### Debug Mode

**Enable debug logging:**
```bash
# In .env
DEBUG=true

# Restart services
./deploy.sh restart
```

### Health Check Endpoints

- **Backend**: http://localhost:8000/api/health
- **Database**: http://localhost:8000/api/ready
- **Metrics**: http://localhost:8000/api/metrics

### Common Commands

```bash
# Shell into backend container
docker-compose -f docker-compose.prod.yml exec backend bash

# Shell into database
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres ipo_verification

# View Redis keys
docker-compose -f docker-compose.prod.yml exec redis redis-cli KEYS '*'

# Inspect Weaviate
curl http://localhost:8080/v1/meta
```

## 🎯 Production Checklist

- [ ] Environment variables configured in `.env`
- [ ] Strong passwords set for all services
- [ ] CORS origins configured for your domain
- [ ] SSL/TLS certificates installed
- [ ] Firewall rules configured
- [ ] Automated backups enabled
- [ ] Monitoring and alerts set up
- [ ] Log rotation configured
- [ ] Resource limits set
- [ ] Health checks verified
- [ ] API keys secured
- [ ] Database migrations applied
- [ ] Load testing completed
- [ ] Documentation updated
- [ ] Team trained on deployment procedures

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PostgreSQL Performance](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Celery Documentation](https://docs.celeryq.dev/)

---

**System Status**: Production-ready deployment with Docker Compose orchestration.
