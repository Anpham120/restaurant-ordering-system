from fastapi import FastAPI

from app.config import get_settings
from app.rag import FALLBACK_ANSWER, KnowledgeBase
from app.schemas import (
    ApiResponse,
    ManagerReportRequest,
    MenuChatRequest,
    RecommendComboRequest,
)


settings = get_settings()
app = FastAPI(title=settings.service_name)
knowledge_base = KnowledgeBase(settings.knowledge_base_path)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "healthy", "service": settings.service_name}


@app.post(f"{settings.api_prefix}/ai/menu-chat", response_model=ApiResponse)
def menu_chat(request: MenuChatRequest) -> ApiResponse:
    result = knowledge_base.search(request.question)
    return ApiResponse(data={"answer": result.answer, "sources": result.sources})


@app.post(f"{settings.api_prefix}/ai/recommend-combo", response_model=ApiResponse)
def recommend_combo(request: RecommendComboRequest) -> ApiResponse:
    query = " ".join(
        [
            f"{request.numberOfPeople} người",
            f"ngân sách {request.budget}",
            *request.preferences,
        ]
    )
    result = knowledge_base.search(query)
    return ApiResponse(
        data={
            "answer": result.answer,
            "sources": result.sources,
            "numberOfPeople": request.numberOfPeople,
            "budget": request.budget,
        }
    )


@app.post(f"{settings.api_prefix}/ai/manager-report", response_model=ApiResponse)
def manager_report(request: ManagerReportRequest) -> ApiResponse:
    return ApiResponse(
        data={
            "date": request.date.isoformat(),
            "summary": FALLBACK_ANSWER,
            "sources": [],
        }
    )


@app.post(f"{settings.api_prefix}/ai/rebuild-index", response_model=ApiResponse)
def rebuild_index() -> ApiResponse:
    return ApiResponse(data=knowledge_base.rebuild_index())
