import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.llm_client import LLMClient, LLMProviderError
from app.rag import KnowledgeBase
from app.schemas import (
    ApiResponse,
    ManagerReportRequest,
    MenuChatRequest,
    RecommendComboRequest,
)


settings = get_settings()
app = FastAPI(title=settings.service_name)
knowledge_base = KnowledgeBase(settings.knowledge_base_path)
llm_client = LLMClient(settings)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in settings.cors_allowed_origins.split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


SYSTEM_PROMPT = """Bạn là trợ lý AI của nhà hàng TV FOOD.
Trả lời bằng tiếng Việt, lịch sự, ngắn gọn và có căn cứ.
Ưu tiên dùng RAG context được cung cấp. Nếu context thiếu dữ liệu, nói rõ giới hạn thay vì bịa thông tin.
Không tự nhận là rulebase, keyword matcher hoặc dữ liệu mẫu."""


@app.get("/health")
def health() -> dict[str, str | bool]:
    return {
        "status": "healthy",
        "service": settings.service_name,
        "provider": settings.llm_provider,
        "model": settings.llm_model,
        "providerConfigured": bool(settings.llm_api_key or os.getenv("OPENAI_API_KEY")),
    }


@app.post(f"{settings.api_prefix}/ai/menu-chat", response_model=ApiResponse)
def menu_chat(request: MenuChatRequest) -> ApiResponse | JSONResponse:
    result = knowledge_base.search(request.question)
    try:
        completion = llm_client.complete(
            SYSTEM_PROMPT,
            _build_menu_prompt(request.question, result.context),
        )
    except LLMProviderError as exc:
        return _provider_error(exc)

    return ApiResponse(
        data={
            "answer": completion.text,
            "sources": result.sources,
            "provider": completion.provider,
            "model": completion.model,
        }
    )


@app.post(f"{settings.api_prefix}/ai/recommend-combo", response_model=ApiResponse)
def recommend_combo(request: RecommendComboRequest) -> ApiResponse | JSONResponse:
    query = " ".join(
        [
            f"{request.numberOfPeople} người",
            f"ngân sách {request.budget}",
            *request.preferences,
        ]
    )
    result = knowledge_base.search(query)
    try:
        completion = llm_client.complete(
            SYSTEM_PROMPT,
            _build_combo_prompt(request, result.context),
        )
    except LLMProviderError as exc:
        return _provider_error(exc)

    return ApiResponse(
        data={
            "answer": completion.text,
            "sources": result.sources,
            "numberOfPeople": request.numberOfPeople,
            "budget": request.budget,
            "provider": completion.provider,
            "model": completion.model,
        }
    )


@app.post(f"{settings.api_prefix}/ai/manager-report", response_model=ApiResponse)
def manager_report(request: ManagerReportRequest) -> ApiResponse | JSONResponse:
    query = f"báo cáo doanh thu {request.date.isoformat()} doanh số món ăn"
    result = knowledge_base.search(query)
    try:
        completion = llm_client.complete(
            SYSTEM_PROMPT,
            _build_manager_report_prompt(request.date.isoformat(), result.context),
        )
    except LLMProviderError as exc:
        return _provider_error(exc)

    return ApiResponse(
        data={
            "date": request.date.isoformat(),
            "summary": completion.text,
            "sources": result.sources,
            "provider": completion.provider,
            "model": completion.model,
        }
    )


@app.post(f"{settings.api_prefix}/ai/rebuild-index", response_model=ApiResponse)
def rebuild_index() -> ApiResponse:
    return ApiResponse(data=knowledge_base.rebuild_index())


def _build_menu_prompt(question: str, context: str) -> str:
    return f"""RAG context:
{context or "(không có context phù hợp)"}

Câu hỏi khách hàng:
{question}

Hãy trả lời như một tư vấn viên nhà hàng. Nếu có gợi ý món, nêu lý do phù hợp."""


def _build_combo_prompt(request: RecommendComboRequest, context: str) -> str:
    preferences = ", ".join(request.preferences) if request.preferences else "không nêu"
    return f"""RAG context:
{context or "(không có context phù hợp)"}

Yêu cầu combo:
- Số khách: {request.numberOfPeople}
- Ngân sách: {request.budget} VND
- Sở thích/ghi chú: {preferences}

Hãy đề xuất combo món ăn thực tế, ước tính tổng tiền và giải thích ngắn gọn."""


def _build_manager_report_prompt(date: str, context: str) -> str:
    return f"""RAG context:
{context or "(không có context vận hành phù hợp)"}

Hãy sinh báo cáo quản lý nhà hàng cho ngày {date}.
Cấu trúc gồm: tóm tắt vận hành, điểm đáng chú ý, rủi ro/cảnh báo, đề xuất hành động."""


def _provider_error(exc: LLMProviderError) -> JSONResponse:
    response = ApiResponse(
        success=False,
        data=None,
        error={"code": exc.code, "message": exc.message},
    )
    return JSONResponse(status_code=exc.status_code, content=response.model_dump())
