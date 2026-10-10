from fastapi import APIRouter
from app.services.reports_service import get_executive_report_data

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/executive")
def read_executive_report():
    return get_executive_report_data()
