from app.db.database import get_db_connection
from typing import List, Optional, Dict, Any

def get_all_actions(status: Optional[str] = None, priority: Optional[str] = None, category: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM actions WHERE 1=1"
    params = []
    if status and status != "All":
        query += " AND status = ?"
        params.append(status)
    if priority and priority != "All":
        query += " AND priority = ?"
        params.append(priority)
    if category and category != "All":
        query += " AND category = ?"
        params.append(category)
        
    query += " ORDER BY CASE priority WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 ELSE 4 END, due_date ASC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    actions = [dict(row) for row in rows]
    conn.close()
    return actions

def get_action_by_id(action_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM actions WHERE id = ?", (action_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def create_action(data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO actions (
        title, category, priority, status, assigned_owner, due_date,
        affected_stores, baseline_metric, target_metric, actual_outcome,
        notes, lessons_learned
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.get("title", ""),
        data.get("category", "General"),
        data.get("priority", "Medium"),
        data.get("status", "In Progress"),
        data.get("assigned_owner", "Unassigned"),
        data.get("due_date", ""),
        data.get("affected_stores", ""),
        data.get("baseline_metric", ""),
        data.get("target_metric", ""),
        data.get("actual_outcome", ""),
        data.get("notes", ""),
        data.get("lessons_learned", "")
    ))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return get_action_by_id(new_id)

def update_action(action_id: int, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    fields = []
    params = []
    for key in ["title", "category", "priority", "status", "assigned_owner", "due_date",
                "affected_stores", "baseline_metric", "target_metric", "actual_outcome",
                "notes", "lessons_learned"]:
        if key in data and data[key] is not None:
            fields.append(f"{key} = ?")
            params.append(data[key])
            
    if not fields:
        conn.close()
        return get_action_by_id(action_id)
        
    fields.append("updated_at = CURRENT_TIMESTAMP")
    params.append(action_id)
    
    query = f"UPDATE actions SET {', '.join(fields)} WHERE id = ?"
    cursor.execute(query, params)
    conn.commit()
    conn.close()
    return get_action_by_id(action_id)

def delete_action(action_id: int) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM actions WHERE id = ?", (action_id,))
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    return deleted
