import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def reset():
    engine = create_async_engine('postgresql+asyncpg://user:password@localhost:5432/library')
    async with engine.begin() as conn:
        await conn.execute(text('DROP TABLE IF EXISTS alembic_version CASCADE;'))
        await conn.execute(text('DROP TABLE IF EXISTS articles CASCADE;'))
        await conn.execute(text('DROP TABLE IF EXISTS tags CASCADE;'))
        await conn.execute(text('DROP TABLE IF EXISTS citations CASCADE;'))
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(reset())
