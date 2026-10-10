from typing import Dict, Any, List
from app.services.data_loader import DataLoader
from app.services.overview_service import get_executive_overview
from app.services.forecast_service import get_forecast_overview
from app.services.recommendation_service import get_consulting_recommendations
from app.db.crud import get_all_actions

def get_executive_report_data() -> Dict[str, Any]:
    dl = DataLoader.get_instance()
    overview = get_executive_overview()
    forecast = get_forecast_overview()
    recs = get_consulting_recommendations()
    actions = get_all_actions()
    
    top_10_risk = []
    if not dl.store_risk_df.empty:
        top_slice = dl.store_risk_df.sort_values("revenue_at_risk", ascending=False).head(10)
        for _, r in top_slice.iterrows():
            top_10_risk.append({
                "store_id": int(r["Store"]),
                "tier": str(r.get("tier", "Top 25%")),
                "store_type": str(r.get("StoreType", "a")),
                "assortment": str(r.get("Assortment", "a")),
                "risk_probability": round(float(r["risk_probability"]) * 100, 1),
                "q2_revenue": int(r.get("q2_2015_revenue", 0)),
                "revenue_at_risk": int(r.get("revenue_at_risk", 0))
            })

    expansion_profiles = []
    if not dl.expansion_df.empty:
        for _, r in dl.expansion_df.iterrows():
            expansion_profiles.append({
                "profile": str(r["profile"]),
                "stores": int(r["stores"]),
                "avg_daily_sales": round(float(r["avg_daily_sales"]), 0),
                "yoy_growth_h1": round(float(r["yoy_growth_h1"]) * 100, 1),
                "sales_per_customer": round(float(r["sales_per_customer"]), 2),
                "avg_risk": round(float(r["avg_risk"]) * 100, 1),
                "expansion_score": round(float(r["expansion_score"]), 2)
            })

    return {
        "report_metadata": {
            "title": "Rossmann Retail Chain — Growth & Efficiency Strategic Review",
            "subtitle": "ML-Powered Retail Consulting & Strategy Deliverable",
            "authors": "Madhvan Aggarwal, Harshit Jain",
            "date": "2015 / 2026 Deliverable",
            "reporting_period": "January 2013 – July 2015 Historical Dataset | Holdout Evaluation: 20 Jun – 31 Jul 2015",
            "total_stores_analyzed": 1115
        },
        "kpi_scorecard": overview["kpis"],
        "tiers": overview["tiers"],
        "forecast_benchmarks": forecast["models_comparison"],
        "top_revenue_at_risk": top_10_risk,
        "expansion_profiles": expansion_profiles,
        "recommendations": recs["items"],
        "action_items": actions,
        "scope_and_limitations": [
            "Data covers 1,115 stores from Jan 2013 to Jul 2015. 180 stores exhibit a historical closure gap from Jul–Dec 2014.",
            "Performance metrics are calculated strictly per open day; closed days do not penalize average store velocity.",
            "Underperformance is defined as next-quarter YoY comp growth falling in the chain's bottom 25%.",
            "Revenue at risk represents a probability-weighted expected shortfall based on historical 8.24% gaps, not guaranteed loss.",
            "Expansion scoring is a format-level proxy; local micro-demographics, footfall footers, and rent data must be audited prior to capital lease deployment."
        ]
    }
