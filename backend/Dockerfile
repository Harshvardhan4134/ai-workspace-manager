# AI Workspace Manager - Backend API
# Simple Cloud Run deployment

FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY app/ ./app/

# Cloud Run sets PORT env var (default 8080)
CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}
