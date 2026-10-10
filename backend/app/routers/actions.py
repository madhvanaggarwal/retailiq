from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from app.db.crud import get_all_actions, get_action_by_id, create_action, update_action, delete_action

router = APIRouter(prefix="/actions", tags=["Actions"])

class ActionCreate(BaseModel):
    title: str
    category: str = "General"
    priority: str = "Medium"
    status: str = "In Progress"
    assigned_owner: str = "Unassigned"
    due_date: str
    affected_stores: Optional[str] = None
    baseline_metric: Optional[str] = None
    target_metric: Optional[str] = None
    actual_outcome: Optional[str] = None
    notes: Optional[str] = None
    lessons_learned: Optional[str] = None

class ActionUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    assigned_owner: Optional[str] = None
    due_date: Optional[str] = None
    affected_stores: Optional[str] = None
    baseline_metric: Optional[str] = None
    target_metric: Optional[str] = None
    actual_outcome: Optional[str] = None
    notes: Optional[str] = None
    lessons_learned: Optional[str] = None

@router.get("")
def read_actions(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None)
):
    return get_all_actions(status=status, priority=priority, category=category)

@router.get("/{action_id}")
def read_action(action_id: int):
    action = get_action_by_id(action_id)
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    return action

@router.post("")
def add_action(payload: ActionCreate):
    return create_action(payload.dict())

@router.put("/{action_id}")
def modify_action(action_id: int, payload: ActionUpdate):
    updated = update_action(action_id, payload.dict())
    if not updated:
        raise HTTPException(status_code=404, detail="Action not found")
    return updated

@router.delete("/{action_id}")
def remove_action(action_id: int):
    success = delete_action(action_id)
    if not success:
        raise HTTPException(status_code=404, detail="Action not found")
    return {"message": "Action deleted successfully"}
