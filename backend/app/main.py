from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.routes.documents import router as documents_router
from backend.app.api.routes.evaluation import router as evaluation_router
from backend.app.api.routes.experiments import router as experiments_router
from backend.app.api.routes.health import router as health_router
from backend.app.api.routes.project_evaluations import (
    router as project_evaluations_router,
)
from backend.app.api.routes.projects import router as projects_router
from backend.app.api.routes.search import router as search_router
from backend.app.core.config import settings

# -----------------------------
# FastAPI Application
# -----------------------------

app = FastAPI(
    title=settings.app_name,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# API Routes
# -----------------------------

app.include_router(health_router)
app.include_router(documents_router)
app.include_router(search_router)
app.include_router(evaluation_router)
app.include_router(experiments_router)
app.include_router(projects_router)
app.include_router(project_evaluations_router)
