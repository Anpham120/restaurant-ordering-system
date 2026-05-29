# AI Service

FastAPI service for restaurant RAG features and management report support.

## Run locally

```bash
cd services/ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

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

When the local `knowledge_base` does not contain enough context, the service returns:

```text
Hiện tại hệ thống chưa có đủ dữ liệu để kết luận.
```
