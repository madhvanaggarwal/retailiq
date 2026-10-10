from fastapi import APIRouter
from app.services.diagnosis_service import get_business_diagnosis

router = APIRouter(prefix="/diagnosis", tags=["Diagnosis"])

@router.get("")
def read_diagnosis():
    return get_business_diagnosis()
