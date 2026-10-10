from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.db.database import init_db
from app.services.data_loader import DataLoader
from app.routers import (
    overview,
    stores,
    forecast,
    diagnosis,
    recommendations,
    simulator,
    actions,
    reports,
    consultant,
    quality
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database and load data cache
    init_db()
    DataLoader.get_instance()
    yield
    # Shutdown

app = FastAPI(
    title="RetailIQ Consulting & Strategy Platform API",
    description="Understand performance. Predict what comes next. Make better retail decisions.",
    version="1.0.0",
    lifespan=lifespan
)

from app.config import FRONTEND_DIST, HOST, PORT, CORS_ORIGINS

# Enable CORS for local dev and preview
is_wildcard = "*" in CORS_ORIGINS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=not is_wildcard,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root & Health check
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "RetailIQ Backend",
        "version": "1.0.0"
    }

# Include all module routers
app.include_router(overview.router, prefix="/api")
app.include_router(stores.router, prefix="/api")
app.include_router(forecast.router, prefix="/api")
app.include_router(diagnosis.router, prefix="/api")
app.include_router(recommendations.router, prefix="/api")
app.include_router(simulator.router, prefix="/api")
app.include_router(actions.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(consultant.router, prefix="/api")
app.include_router(quality.router, prefix="/api")

# Mount frontend production build if available
from fastapi.staticfiles import StaticFiles
from app.config import FRONTEND_DIST
if FRONTEND_DIST.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIST), html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    from app.config import HOST, PORT
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=True)
