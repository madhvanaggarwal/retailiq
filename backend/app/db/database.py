import sqlite3
from pathlib import Path
from app.config import DB_PATH

def get_db_connection():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        priority TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'In Progress',
        assigned_owner TEXT NOT NULL,
        due_date TEXT NOT NULL,
        affected_stores TEXT,
        baseline_metric TEXT,
        target_metric TEXT,
        actual_outcome TEXT,
        notes TEXT,
        lessons_learned TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Check if empty, seed default consulting initiatives
    cursor.execute("SELECT COUNT(*) FROM actions")
    count = cursor.fetchone()[0]
    if count == 0:
        default_actions = [
            (
                "Local Footfall & Store Visibility Campaign",
                "Traffic & Marketing",
                "Critical",
                "In Progress",
                "Chief Commercial Officer",
                "2015-09-30",
                "Bottom 25% Tier (279 stores)",
                "504 avg daily customers per store",
                "+10% daily footfall (~555 customers/day)",
                "Pilot launched across 30 stores in South region; early traffic shows +4.2% lift.",
                "Top vs bottom tier gap is driven by traffic (2.2x), not basket size (1.04x). Focus marketing strictly on footfall.",
                "Circular ads had lower ROI than geo-targeted mobile search and signage."
            ),
            (
                "Early Warning Q3 Risk Review & Inventory Realignment",
                "Risk Mitigation",
                "Critical",
                "In Progress",
                "VP Retail Operations",
                "2015-08-31",
                "306 Flagged Stores (€10.0M revenue at risk)",
                "306 stores flagged with P(underperform) >= 50%",
                "Intervene on top 50 revenue-at-risk stores to mitigate 50% of expected shortfall (€5.0M)",
                "Audit completed for top 25 high-volume stores (Stores 817, 383, 262, 788, etc.); localized stock rebalanced.",
                "Momentum and tough prior-year comp quarters are the primary drivers. Regional managers given store-level SHAP cards.",
                "Early engagement with regional managers prevented stockouts during promotional weeks."
            ),
            (
                "Assortment Upgrade Program (Basic 'a' to Extended 'c')",
                "Assortment & Merchandising",
                "High",
                "Pending Approval",
                "Head of Merchandising",
                "2015-11-15",
                "45 High-Density Urban Stores with Assortment 'a'",
                "Basic assortment stores average 1-4% YoY growth",
                "Achieve 5-7% YoY growth matching profile Type d / Assortment c benchmarks",
                "Store fixture schematics finalized; supplier vendor terms under review.",
                "Extended assortment stores consistently outperform basic assortment across all competition environments.",
                "Store floor plan constraints require selecting only stores with >400 sqm trading area."
            ),
            (
                "Promo2 Effectiveness Audit & Campaign Restructuring",
                "Operations & Staffing",
                "Medium",
                "Draft",
                "Marketing Analytics Director",
                "2015-10-15",
                "61% of bottom-tier stores participating in Promo2",
                "Promo2 stores over-represented in bottom tier (61% vs 42% in top tier)",
                "Phase out non-performing Promo2 cycles and reallocate marketing funds to local store discovery",
                "Initial performance analysis indicates zero statistically significant incremental lift from recurring circular coupons.",
                "Promo2 was assigned to underperforming stores as a reactive remedy, but customers have coupon fatigue.",
                "Need tighter A/B testing before expanding coupon agreements."
            )
        ]
        
        cursor.executemany("""
        INSERT INTO actions (
            title, category, priority, status, assigned_owner, due_date,
            affected_stores, baseline_metric, target_metric, actual_outcome,
            notes, lessons_learned
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, default_actions)
        conn.commit()
    conn.close()
