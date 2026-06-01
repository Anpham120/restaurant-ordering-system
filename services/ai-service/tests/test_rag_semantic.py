from pathlib import Path

from app.rag import KnowledgeBase
from app.vector_store import VectorSearchHit


class FakeVectorStore:
    index_path = Path("knowledge_base/.index/knowledge.faiss")
    model_name = "sentence-transformers/all-MiniLM-L6-v2"

    def search(self, query: str, top_k: int = 3) -> list[VectorSearchHit]:
        assert query == "món nào không gây dị ứng gluten?"
        assert top_k == 3
        return [
            VectorSearchHit(
                source="menu.md",
                content="Món salad rau củ không dùng bột mì, phù hợp khách cần tránh gluten.",
                score=0.91,
            )
        ]

    def build_index(self) -> dict:
        return {
            "indexedDocuments": 1,
            "sources": ["menu.md"],
            "indexPath": str(self.index_path),
            "model": self.model_name,
        }


def test_knowledge_base_uses_vector_store_for_semantic_context() -> None:
    kb = KnowledgeBase(Path("knowledge_base"))
    kb.vector_store = FakeVectorStore()

    result = kb.search("món nào không gây dị ứng gluten?")

    assert result.sources == ["menu.md"]
    assert "tránh gluten" in result.context


def test_rebuild_index_delegates_to_vector_store() -> None:
    kb = KnowledgeBase(Path("knowledge_base"))
    kb.vector_store = FakeVectorStore()

    result = kb.rebuild_index()

    assert result["indexedDocuments"] == 1
    assert result["indexPath"].endswith("knowledge.faiss")
    assert result["model"] == "sentence-transformers/all-MiniLM-L6-v2"
