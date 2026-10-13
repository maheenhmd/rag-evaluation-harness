import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.core.auth import get_current_user_id
from backend.app.db.postgres import get_db
from backend.app.llm.openai_provider import LLMError
from backend.app.schemas.evaluation import (
    EvaluationRunRequest,
    EvaluationRunResponse,
)
from backend.app.services.evaluation_service import EvaluationDatasetError
from backend.app.services.experiment_service import (
    ProjectCorpusEmptyError,
    run_project_evaluation,
)
from backend.app.services.project_service import get_owned_project_by_id

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/projects/{project_id}/evaluations/run",
    response_model=EvaluationRunResponse,
)
def evaluate_project(
    project_id: int,
    request: EvaluationRunRequest | None = None,
    db: Session = Depends(get_db),  # noqa: B008
    owner_id: str = Depends(get_current_user_id),
) -> EvaluationRunResponse:
    project = get_owned_project_by_id(
        db=db,
        project_id=project_id,
        owner_id=owner_id,
    )

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    evaluation_request = request or EvaluationRunRequest()

    try:
        return run_project_evaluation(
            db=db,
            project_id=project_id,
            request=evaluation_request,
        )

    except ProjectCorpusEmptyError as error:
        logger.warning(
            "Evaluation rejected because project corpus is empty. "
            "project_id=%s owner_id=%s",
            project_id,
            owner_id,
        )

        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error

    except EvaluationDatasetError as error:
        logger.warning(
            "Evaluation dataset error. "
            "project_id=%s owner_id=%s reason=%s",
            project_id,
            owner_id,
            str(error),
        )

        raise HTTPException(
            status_code=422,
            detail=str(error),
        ) from error

    except LLMError as error:
        logger.warning(
            "LLM evaluation failed. "
            "project_id=%s owner_id=%s status=%s reason=%s",
            project_id,
            owner_id,
            error.status_code,
            str(error),
        )

        raise HTTPException(
            status_code=error.status_code,
            detail=str(error),
        ) from error

    except Exception:
        logger.exception(
            "Unexpected evaluation failure. "
            "project_id=%s owner_id=%s",
            project_id,
            owner_id,
        )

        raise