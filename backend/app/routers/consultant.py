from fastapi import APIRouter
from pydantic import BaseModel
from app.services.consultant_service import answer_consultant_query

router = APIRouter(prefix="/consultant", tags=["Consultant"])

class QueryRequest(BaseModel):
    query: str

@router.post("/query")
def ask_consultant(req: QueryRequest):
    return answer_consultant_query(req.query)
