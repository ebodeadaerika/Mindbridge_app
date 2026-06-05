"""Run this inside the API container to create all tables directly."""
import os, sys
sys.path.insert(0, '/app')

from app.database import engine
from app.models import Base  # noqa — imports all models

print("Creating all tables...")
Base.metadata.create_all(bind=engine)
print("Done! Tables created.")

# List tables
from sqlalchemy import text
with engine.connect() as conn:
    result = conn.execute(text("SELECT tablename FROM pg_tables WHERE schemaname='public'"))
    tables = [row[0] for row in result]
    print(f"Tables in database: {tables}")
