"""Register all ORM models on the application's shared SQLAlchemy metadata."""

from backend.app.models.document import Document
from backend.app.models.evaluation_case import EvaluationCase
from backend.app.models.evaluation_dataset import EvaluationDataset
from backend.app.models.experiment_run import ExperimentRun
from backend.app.models.project import Project

__all__ = [
    "Document",
    "EvaluationCase",
    "EvaluationDataset",
    "ExperimentRun",
    "Project",
]
