# Demo AI RAG

Kịch bản này demo AI Service theo hướng RAG + LLM provider thật:

1. AI Service lấy context từ `services/ai-service/knowledge_base/*.md` bằng semantic vector search.
2. Service gọi provider API thật bằng `AI_SERVICE_LLM_API_KEY` hoặc `OPENAI_API_KEY`.
3. Response trả `answer`/`summary` do provider sinh kèm `sources`, `provider`, `model`.

## Chuẩn bị

```powershell
cd services/ai-service
$env:AI_SERVICE_LLM_PROVIDER = "9router"
$env:AI_SERVICE_LLM_MODEL = "9router"
$env:AI_SERVICE_LLM_BASE_URL = "http://localhost:20128/v1"
$env:AI_SERVICE_LLM_API_KEY = "<your-provider-api-key>"
uvicorn app.main:app --reload --port 8000
```

## 1. Health Check

```bash
curl http://localhost:8000/health
```

Kết quả mẫu:

```json
{
  "status": "healthy",
  "service": "Restaurant AI Service",
  "provider": "9router",
  "model": "9router",
  "providerConfigured": true
}
```

## 2. Menu Chat

```bash
curl -X POST http://localhost:8000/api/v1/ai/menu-chat \
  -H "Content-Type: application/json" \
  -d "{\"question\":\"Có món nào phù hợp cho người ăn chay không?\"}"
```

Kỳ vọng: `success=true`, `data.answer` là câu trả lời do LLM sinh, `data.sources` chứa file knowledge base liên quan.

## 3. Recommend Combo

```bash
curl -X POST http://localhost:8000/api/v1/ai/recommend-combo \
  -H "Content-Type: application/json" \
  -d "{\"numberOfPeople\":4,\"budget\":500000,\"preferences\":[\"hải sản\",\"không cay\"]}"
```

Kỳ vọng: AI đề xuất combo theo số khách, ngân sách và sở thích; không dùng nội dung hardcoded từ frontend.

## 4. Manager Report

```bash
curl -X POST http://localhost:8000/api/v1/ai/manager-report \
  -H "Content-Type: application/json" \
  -d "{\"date\":\"2026-06-01\"}"
```

Kỳ vọng: AI sinh báo cáo quản lý dạng markdown/text, có `provider` và `model`.

## 5. Rebuild Semantic Index

```bash
curl -X POST http://localhost:8000/api/v1/ai/rebuild-index
```

Kết quả mẫu:

```json
{
  "success": true,
  "data": {
    "indexedDocuments": 3,
    "sources": ["faq.md", "menu.md", "policy.md"],
    "indexPath": "knowledge_base/.index/knowledge.faiss",
    "model": "sentence-transformers/all-MiniLM-L6-v2"
  }
}
```

## Lỗi Cấu Hình Provider

Nếu chưa cấu hình API key, endpoint AI trả lỗi có kiểm soát:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "AI_SERVICE_UNAVAILABLE",
    "message": "AI provider API key is not configured. Set AI_SERVICE_LLM_API_KEY or OPENAI_API_KEY."
  }
}
```
