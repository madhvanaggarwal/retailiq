from fastapi import APIRouter
from app.services.quality_service import get_methodology_and_quality

router = APIRouter(prefix="/quality", tags=["Quality"])

@router.get("")
def read_quality_and_methodology():
    return get_methodology_and_quality()
