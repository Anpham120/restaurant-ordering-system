from dataclasses import dataclass
from pathlib import Path
import re

from app.vector_store import VectorStore, VectorStoreUnavailable


FALLBACK_ANSWER = "Hiện tại hệ thống chưa có đủ dữ liệu để kết luận."


@dataclass(frozen=True)
class SearchResult:
    answer: str
    sources: list[str]
    snippets: list[str]

    @property
    def context(self) -> str:
        return "\n\n".join(
            f"[{source}]\n{snippet}"
            for source, snippet in zip(self.sources, self.snippets, strict=False)
        )


class KnowledgeBase:
    def __init__(self, root: Path) -> None:
        self.root = root
        self.vector_store = VectorStore(root)

    def search(self, query: str, limit: int = 3) -> SearchResult:
        try:
            hits = self.vector_store.search(query, top_k=limit)
        except VectorStoreUnavailable:
            hits = []

        if not hits:
            return SearchResult(FALLBACK_ANSWER, [], [])

        snippets = [_snippet(hit.content) for hit in hits]
        sources = [hit.source for hit in hits]
        answer = " ".join(snippets).strip() or FALLBACK_ANSWER
        return SearchResult(answer, sources, snippets)

    def rebuild_index(self) -> dict:
        try:
            return self.vector_store.build_index()
        except VectorStoreUnavailable as exc:
            return {
                "indexedDocuments": 0,
                "sources": [],
                "indexPath": str(self.vector_store.index_path),
                "model": self.vector_store.model_name,
                "status": "unavailable",
                "message": str(exc),
            }


def _snippet(content: str, max_length: int = 500) -> str:
    text = re.sub(r"\s+", " ", content).strip()
    if len(text) <= max_length:
        return text
    return text[: max_length - 3].rstrip() + "..."
