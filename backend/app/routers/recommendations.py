from fastapi import APIRouter
from app.services.recommendation_service import get_consulting_recommendations

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("")
def read_recommendations():
    return get_consulting_recommendations()
