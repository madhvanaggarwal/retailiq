from fastapi import APIRouter, Query
from app.services.forecast_service import get_forecast_overview, get_store_forecast, get_forecast_movers

router = APIRouter(prefix="/forecast", tags=["Forecast"])

@router.get("/overview")
def read_forecast_overview():
    return get_forecast_overview()

@router.get("/store/{store_id}")
def read_store_forecast(
    store_id: int,
    aggregation: str = Query("daily", pattern="^(daily|weekly)$")
):
    return get_store_forecast(store_id, aggregation)

@router.get("/movers")
def read_forecast_movers():
    return get_forecast_movers()
