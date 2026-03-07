from __future__ import annotations
from typing import Dict, List, Optional
from uuid import UUID, uuid4
from datetime import datetime, timezone
from .schemas import Article, ArticleCreate, ArticleUpdate, Tag, TagCreate


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class Storage:
    def __init__(self) -> None:
        self.articles: Dict[UUID, Article] = {}
        self.tags: Dict[UUID, Tag] = {}

    # Articles
    def list_articles(self) -> List[Article]:
        return list(self.articles.values())

    def get_article(self, article_id: UUID) -> Optional[Article]:
        return self.articles.get(article_id)

    def create_article(self, payload: ArticleCreate) -> Article:
        aid = uuid4()
        article = Article(
            id=aid,
            title=payload.title,
            abstract=payload.abstract,
            tags=payload.tags or [],
            citations=payload.citations or [],
            created_at=_now_iso(),
            updated_at=_now_iso(),
        )
        self.articles[aid] = article
        return article

    def update_article(self, article_id: UUID, payload: ArticleUpdate) -> Optional[Article]:
        article = self.articles.get(article_id)
        if not article:
            return None
        data = article.model_dump()
        if payload.title is not None:
            data["title"] = payload.title
        if payload.abstract is not None:
            data["abstract"] = payload.abstract
        if payload.tags is not None:
            data["tags"] = payload.tags
        if payload.citations is not None:
            data["citations"] = payload.citations
        data["updated_at"] = _now_iso()
        updated = Article(**data)
        self.articles[article_id] = updated
        return updated

    def delete_article(self, article_id: UUID) -> bool:
        return self.articles.pop(article_id, None) is not None

    # Tags
    def list_tags(self) -> List[Tag]:
        return list(self.tags.values())

    def get_tag(self, tag_id: UUID) -> Optional[Tag]:
        return self.tags.get(tag_id)

    def create_tag(self, payload: TagCreate) -> Tag:
        tid = uuid4()
        tag = Tag(id=tid, name=payload.name, color=payload.color)
        self.tags[tid] = tag
        return tag

    def delete_tag(self, tag_id: UUID) -> bool:
        return self.tags.pop(tag_id, None) is not None


storage = Storage()
