from datetime import date
from pydantic import BaseModel, Field


class ApiError(BaseModel):
    code: str
    message: str


class ApiResponse(BaseModel):
    success: bool = True
    data: dict | None = None
    error: ApiError | None = None


class MenuChatRequest(BaseModel):
    question: str = Field(min_length=1)
    sessionId: str | None = None


class RecommendComboRequest(BaseModel):
    numberOfPeople: int = Field(gt=0)
    budget: int = Field(gt=0)
    preferences: list[str] = Field(default_factory=list)


class ManagerReportRequest(BaseModel):
    date: date
