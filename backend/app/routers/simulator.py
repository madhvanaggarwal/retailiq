from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
from app.services.simulator_service import run_simulation

router = APIRouter(prefix="/simulator", tags=["Simulator"])

class SimulationRequest(BaseModel):
    target_type: str = Field(default="store", description="'store' or 'group'")
    target_id: Optional[str] = Field(default="1", description="Store ID (e.g. '1') or Group ('All', 'Top 25%', 'Middle 50%', 'Bottom 25%', 'Promo2')")
    weeks: int = Field(default=6, ge=1, le=6)
    growth_rate: float = Field(default=0.0, ge=-0.30, le=0.30)
    promo_policy: str = Field(default="baseline", description="'baseline', 'boost_promo', 'reduce_promo'")
    basket_shift: float = Field(default=0.0, ge=-0.20, le=0.20)

@router.post("/run")
def simulate(req: SimulationRequest):
    return run_simulation(
        target_type=req.target_type,
        target_id=req.target_id,
        weeks=req.weeks,
        growth_rate=req.growth_rate,
        promo_policy=req.promo_policy,
        basket_shift=req.basket_shift
    )
