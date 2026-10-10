from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.consultant_service import answer_consultant_query

router = APIRouter(prefix="/consultant", tags=["Consultant"])

class QueryRequest(BaseModel):
    query: str

@router.post("/query")
def ask_consultant(req: QueryRequest):
    if not req.query or not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    return answer_consultant_query(req.query.strip())
