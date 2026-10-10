from typing import Dict, Any, List, Optional
from app.services.data_loader import DataLoader
import pandas as pd
import numpy as np

def get_stores_list(
    search: Optional[str] = None,
    store_type: Optional[str] = None,
    assortment: Optional[str] = None,
    tier: Optional[str] = None,
    flag: Optional[str] = None,
    promo2: Optional[str] = None,
    sort_by: str = "Store",
    sort_dir: str = "asc",
    page: int = 1,
    page_size: int = 20
) -> Dict[str, Any]:
    dl = DataLoader.get_instance()
    df = dl.store_master_df.copy()
    
    if df.empty:
        return {"total": 0, "page": page, "page_size": page_size, "items": []}
        
    # Filters
    if search:
        s = search.strip()
        if s.isdigit():
            df = df[df["Store"] == int(s)]
        else:
            df = df[df["Store"].astype(str).str.contains(s, case=False, na=False)]
            
    if store_type and store_type != "All":
        df = df[df["StoreType"] == store_type]
        
    if assortment and assortment != "All":
        df = df[df["Assortment"] == assortment]
        
    if tier and tier != "All":
        df = df[df["tier"] == tier]
        
    if flag and flag != "All":
        df = df[df["flag"] == flag]
        
    if promo2 and promo2 != "All":
        p_val = 1 if promo2 in ["1", "Yes", "true"] else 0
        df = df[df["Promo2"] == p_val]
        
    total = len(df)
    
    # Sorting
    ascending = (sort_dir.lower() == "asc")
    if sort_by in df.columns:
        df = df.sort_values(sort_by, ascending=ascending)
    else:
        df = df.sort_values("Store", ascending=True)
        
    # Pagination
    start = (page - 1) * page_size
    end = start + page_size
    sliced = df.iloc[start:end]
    
    items: List[Dict[str, Any]] = []
    for _, r in sliced.iterrows():
        items.append({
            "store_id": int(r["Store"]),
            "store_type": str(r.get("StoreType", "a")),
            "assortment": str(r.get("Assortment", "a")),
            "tier": str(r.get("tier", "Middle 50%")),
            "flag": str(r.get("flag", "OK")),
            "risk_probability": round(float(r["risk_probability"]) * 100, 1) if pd.notna(r.get("risk_probability")) else 0.0,
            "revenue_at_risk": round(float(r.get("revenue_at_risk", 0)), 0) if pd.notna(r.get("revenue_at_risk")) else 0,
            "q2_revenue": round(float(r.get("q2_2015_revenue", 0)), 0) if pd.notna(r.get("q2_2015_revenue")) else 0,
            "avg_daily_sales": round(float(r.get("StoreMeanSales", 0)), 1) if pd.notna(r.get("StoreMeanSales")) else 0,
            "avg_daily_customers": round(float(r.get("StoreMeanCustomers", 0)), 1) if pd.notna(r.get("StoreMeanCustomers")) else 0,
            "sales_per_customer": round(float(r.get("StoreSalesPerCust", 0)), 2) if pd.notna(r.get("StoreSalesPerCust")) else 0,
            "competition_distance": float(r.get("CompetitionDistance", 0)) if pd.notna(r.get("CompetitionDistance")) else 0,
            "promo2": int(r.get("Promo2", 0)) if pd.notna(r.get("Promo2")) else 0,
            "peer_group": str(r.get("peer_group", ""))
        })
        
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if total > 0 else 1,
        "items": items
    }

def get_store_details(store_id: int) -> Optional[Dict[str, Any]]:
    dl = DataLoader.get_instance()
    df = dl.store_master_df
    
    match = df[df["Store"] == store_id]
    if match.empty:
        return None
        
    store = match.iloc[0]
    
    # 1. 6-week daily sales, forecast, and baseline time series
    daily_history: List[Dict[str, Any]] = []
    fc_df = dl.forecast_test_df
    rmse = None
    mape = None
    
    if not fc_df.empty:
        store_fc = fc_df[fc_df["Store"] == store_id].sort_values("Date")
        if not store_fc.empty:
            actuals = store_fc["Sales"].values
            preds = store_fc["Forecast"].values
            baselines = store_fc["Baseline"].values
            dates = store_fc["Date"].values
            promos = store_fc["Promo"].values
            
            rmse = round(float(np.sqrt(np.mean((actuals - preds) ** 2))), 1)
            mape = round(float(np.mean(np.abs(actuals - preds) / np.maximum(actuals, 1)) * 100), 2)
            
            for i in range(len(store_fc)):
                daily_history.append({
                    "date": str(dates[i]),
                    "sales": round(float(actuals[i]), 1),
                    "forecast": round(float(preds[i]), 1),
                    "baseline": round(float(baselines[i]), 1),
                    "promo": int(promos[i])
                })
                
    # 2. Risk drivers / Diagnostic attributes
    risk_factors = []
    prob = float(store.get("risk_probability", 0)) if pd.notna(store.get("risk_probability")) else 0
    if prob >= 0.5:
        # Check specific signals
        level_base = store.get("level_vs_base")
        if pd.notna(level_base) and level_base < 0:
            risk_factors.append({
                "factor": "High Base Effect Deficit",
                "severity": "High",
                "detail": f"Store currently trades {abs(round(level_base*100, 1))}% below the prior-year comparison benchmark, making quarterly comp targets very difficult to meet."
            })
        yoy_growth = store.get("yoy_growth_last_q")
        if pd.notna(yoy_growth) and yoy_growth < 0:
            risk_factors.append({
                "factor": "Negative Growth Momentum",
                "severity": "High",
                "detail": f"Trailing quarter YoY growth was {round(yoy_growth*100, 1)}% vs chain, indicating ongoing structural erosion."
            })
        cust_yoy = store.get("customers_yoy")
        if pd.notna(cust_yoy) and cust_yoy < 0:
            risk_factors.append({
                "factor": "Footfall Contraction",
                "severity": "Medium",
                "detail": f"Customer counts down {abs(round(cust_yoy*100, 1))}% relative to chain baseline."
            })
        if store.get("Promo2") == 1:
            risk_factors.append({
                "factor": "Promo2 Inefficiency",
                "severity": "Medium",
                "detail": "Participating in Promo2 continuous discount scheme without demonstrating positive margin or traffic turnaround."
            })
    else:
        risk_factors.append({
            "factor": "Stable Demand & Sound Comp Base",
            "severity": "Low",
            "detail": "Store is currently outperforming or tracking in line with historical seasonal benchmarks."
        })
        
    # 3. Recommendations for this store
    store_recs = []
    if prob >= 0.5:
        store_recs.append({
            "action": "Immediate Regional Manager Operational Audit",
            "priority": "High",
            "description": f"Conduct an on-site operational review to inspect stock availability during peak days and review local pricing. At-risk revenue is estimated at €{int(store.get('revenue_at_risk', 0)):,}."
        })
    if store.get("StoreSalesPerCust", 0) > store.get("peer_avg_basket", 0) and store.get("StoreMeanCustomers", 0) < store.get("peer_avg_customers", 0):
        store_recs.append({
            "action": "Footfall Generation & Store Frontage Rejuvenation",
            "priority": "High",
            "description": f"Basket size (€{round(store.get('StoreSalesPerCust', 0), 2)}) exceeds peer benchmark (€{round(store.get('peer_avg_basket', 0), 2)}), but footfall is {round((1 - store.get('StoreMeanCustomers', 0)/max(store.get('peer_avg_customers', 1), 1))*100, 1)}% below peers. Reallocate budget to storefront signage and local awareness."
        })
    if store.get("Assortment") == "a" and store.get("StoreType") in ["a", "d"]:
        store_recs.append({
            "action": "Evaluate Assortment Expansion to Category 'c'",
            "priority": "Medium",
            "description": "Store operates with basic assortment 'a'. Upgrading to extended assortment 'c' in similar profiles historically drives 4-7% YoY growth lift."
        })
    if not store_recs:
        store_recs.append({
            "action": "Maintain Promotional Rhythm & Monitor Inventory",
            "priority": "Routine",
            "description": "Store performance is healthy. Maintain standard replenishment cycles aligned with Model A sales forecasts."
        })

    return {
        "store_id": int(store["Store"]),
        "store_type": str(store.get("StoreType", "a")),
        "assortment": str(store.get("Assortment", "a")),
        "tier": str(store.get("tier", "Middle 50%")),
        "flag": str(store.get("flag", "OK")),
        "risk_probability": round(prob * 100, 1),
        "revenue_at_risk": round(float(store.get("revenue_at_risk", 0)), 0),
        "q2_revenue": round(float(store.get("q2_2015_revenue", 0)), 0),
        "avg_daily_sales": round(float(store.get("StoreMeanSales", 0)), 1),
        "avg_daily_customers": round(float(store.get("StoreMeanCustomers", 0)), 1),
        "sales_per_customer": round(float(store.get("StoreSalesPerCust", 0)), 2),
        "competition_distance": float(store.get("CompetitionDistance", 0)) if pd.notna(store.get("CompetitionDistance")) else 0,
        "competition_open_month": int(store.get("CompetitionOpenSinceMonth", 0)) if pd.notna(store.get("CompetitionOpenSinceMonth")) else 0,
        "competition_open_year": int(store.get("CompetitionOpenSinceYear", 0)) if pd.notna(store.get("CompetitionOpenSinceYear")) else 0,
        "promo2": int(store.get("Promo2", 0)) if pd.notna(store.get("Promo2")) else 0,
        "promo2_since_week": int(store.get("Promo2SinceWeek", 0)) if pd.notna(store.get("Promo2SinceWeek")) else 0,
        "promo2_since_year": int(store.get("Promo2SinceYear", 0)) if pd.notna(store.get("Promo2SinceYear")) else 0,
        "promo_interval": str(store.get("PromoInterval", "None")) if pd.notna(store.get("PromoInterval")) else "None",
        "peer_group": str(store.get("peer_group", "")),
        "peer_avg_sales": round(float(store.get("peer_avg_sales", 0)), 1),
        "peer_avg_customers": round(float(store.get("peer_avg_customers", 0)), 1),
        "peer_avg_basket": round(float(store.get("peer_avg_basket", 0)), 2),
        "forecast_metrics": {
            "rmse": rmse,
            "mape": mape
        },
        "daily_history": daily_history,
        "risk_factors": risk_factors,
        "recommendations": store_recs
    }
