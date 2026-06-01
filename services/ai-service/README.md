# AI Service

FastAPI service for restaurant RAG features and management report support.
The service retrieves restaurant context from `knowledge_base/` with semantic
embedding search (`sentence-transformers/all-MiniLM-L6-v2` + FAISS), then calls a
real LLM provider API to generate the final answer. The default provider is
9router-compatible chat completions. It does not use keyword/rulebase text as
the final AI response.

## Run locally

```bash
cd services/ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
set AI_SERVICE_LLM_API_KEY=your-provider-api-key
uvicorn app.main:app --reload
```

## Configuration

Environment variables:

- `AI_SERVICE_LLM_PROVIDER=9router`
- `AI_SERVICE_LLM_MODEL=9router`
- `AI_SERVICE_LLM_BASE_URL=http://localhost:20128/v1` for local runs
- `AI_SERVICE_LLM_BASE_URL=http://host.docker.internal:20128/v1` for Docker Compose
- `AI_SERVICE_LLM_API_KEY=<provider key>` or `OPENROUTER_API_KEY=<provider key>`
- `AI_SERVICE_KNOWLEDGE_BASE_PATH=knowledge_base`
- `AI_SERVICE_CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174`

## Semantic Index

Build or refresh the local vector index:

```bash
curl -X POST http://localhost:8000/api/v1/ai/rebuild-index
```

The index is written to `knowledge_base/.index/`:

- `knowledge.faiss`
- `metadata.json`

## Test

```bash
cd services/ai-service
pytest
```

## Endpoints

- `GET /health`
- `POST /api/v1/ai/menu-chat`
- `POST /api/v1/ai/recommend-combo`
- `POST /api/v1/ai/manager-report`
- `POST /api/v1/ai/rebuild-index`

If the provider API key is missing or the provider is unreachable, endpoints
return the standard error contract with `AI_SERVICE_UNAVAILABLE`.
