from fastapi import APIRouter
from app.services.overview_service import get_executive_overview

router = APIRouter(prefix="/overview", tags=["Overview"])

@router.get("")
def read_overview():
    return get_executive_overview()
