import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine
from app.database import Base
from app.models import User, Article, Tag, Citation # Import all models to register them

load_dotenv()

async def reset():
    database_url = os.getenv("DATABASE_URL")
    print(f"Resetting database: {database_url}")
    engine = create_async_engine(database_url)
    
    async with engine.begin() as conn:
        # Drop all tables in correct order using SQLAlchemy
        await conn.run_sync(Base.metadata.drop_all)
        # Recreate all tables
        await conn.run_sync(Base.metadata.create_all)
        print("Database schema recreated successfully.")
        
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(reset())
