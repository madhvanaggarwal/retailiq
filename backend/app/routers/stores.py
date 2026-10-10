from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.services.store_service import get_stores_list, get_store_details

router = APIRouter(prefix="/stores", tags=["Stores"])

@router.get("")
def read_stores(
    search: Optional[str] = Query(None),
    store_type: Optional[str] = Query(None),
    assortment: Optional[str] = Query(None),
    tier: Optional[str] = Query(None),
    flag: Optional[str] = Query(None),
    promo2: Optional[str] = Query(None),
    sort_by: str = Query("Store"),
    sort_dir: str = Query("asc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    return get_stores_list(
        search=search,
        store_type=store_type,
        assortment=assortment,
        tier=tier,
        flag=flag,
        promo2=promo2,
        sort_by=sort_by,
        sort_dir=sort_dir,
        page=page,
        page_size=page_size
    )

@router.get("/{store_id}")
def read_single_store(store_id: int):
    store = get_store_details(store_id)
    if not store:
        raise HTTPException(status_code=404, detail=f"Store #{store_id} not found")
    return store
