"""Initialize refactor database tables from ORM metadata."""
import sys
sys.path.insert(0, '.')

from app.db.connection import RefactorBase, refactor_engine
from app.db import models  # noqa: F401 - register all models


def init_refactor() -> None:
    RefactorBase.metadata.create_all(bind=refactor_engine)
    print("✅ Refactor tables initialized")


if __name__ == "__main__":
    init_refactor()
