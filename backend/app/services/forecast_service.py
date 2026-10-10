from typing import Dict, Any, List, Optional
from app.services.data_loader import DataLoader
import pandas as pd
import numpy as np

def get_forecast_overview() -> Dict[str, Any]:
    dl = DataLoader.get_instance()
    
    # Model evaluation comparison table
    model_eval = []
    if not dl.eval_forecast_df.empty:
        for idx, row in dl.eval_forecast_df.iterrows():
            model_eval.append({
                "model_name": str(idx),
                "rmse": round(float(row.get("RMSE (€)", 0)), 1),
                "mape": round(float(row.get("MAPE (%)", 0)), 2),
                "r2": round(float(row.get("R²", 0)), 3),
                "rmspe": round(float(row.get("RMSPE (Kaggle, %)", 0)), 2)
            })

    # Chain aggregate daily holdout data
    daily_records = []
    if not dl.daily_forecast_df.empty:
        for _, row in dl.daily_forecast_df.iterrows():
            daily_records.append({
                "date": str(row["Date"]),
                "actual_m": round(float(row["Sales"]), 2),
                "forecast_m": round(float(row["Forecast"]), 2),
                "error_m": round(float(row["Forecast"] - row["Sales"]), 2)
            })

    # Summary metrics
    best_eval = model_eval[-1] if model_eval else {
        "rmse": 839.9, "mape": 8.03, "r2": 0.924, "rmspe": 11.34
    }

    return {
        "holdout_period": "2015-06-20 to 2015-07-31 (40,282 store-days evaluated)",
        "models_comparison": model_eval,
        "best_model": best_eval,
        "daily_aggregate": daily_records
    }

def get_store_forecast(store_id: int, aggregation: str = "daily") -> Dict[str, Any]:
    dl = DataLoader.get_instance()
    fc_df = dl.forecast_test_df
    
    if fc_df.empty:
        return {"store_id": store_id, "items": [], "metrics": {}}
        
    store_fc = fc_df[fc_df["Store"] == store_id].sort_values("Date").copy()
    if store_fc.empty:
        return {"store_id": store_id, "items": [], "metrics": {}}
        
    store_fc["Date"] = pd.to_datetime(store_fc["Date"])
    actuals = store_fc["Sales"].values
    preds = store_fc["Forecast"].values
    baselines = store_fc["Baseline"].values
    
    rmse = round(float(np.sqrt(np.mean((actuals - preds) ** 2))), 1)
    mape = round(float(np.mean(np.abs(actuals - preds) / np.maximum(actuals, 1)) * 100), 2)
    total_actual = float(np.sum(actuals))
    total_forecast = float(np.sum(preds))
    total_baseline = float(np.sum(baselines))
    
    items: List[Dict[str, Any]] = []
    
    if aggregation == "weekly":
        store_fc["Week"] = store_fc["Date"].dt.to_period("W").apply(lambda r: r.start_time.strftime("%Y-%m-%d"))
        grouped = store_fc.groupby("Week").agg({
            "Sales": "sum",
            "Forecast": "sum",
            "Baseline": "sum",
            "Promo": "mean"
        }).reset_index()
        
        for _, row in grouped.iterrows():
            items.append({
                "period": str(row["Week"]),
                "sales": round(float(row["Sales"]), 1),
                "forecast": round(float(row["Forecast"]), 1),
                "baseline": round(float(row["Baseline"]), 1),
                "promo_share": round(float(row["Promo"]) * 100, 1)
            })
    else:
        for _, row in store_fc.iterrows():
            items.append({
                "period": str(row["Date"].strftime("%Y-%m-%d")),
                "sales": round(float(row["Sales"]), 1),
                "forecast": round(float(row["Forecast"]), 1),
                "baseline": round(float(row["Baseline"]), 1),
                "promo": int(row["Promo"]),
                "school_holiday": int(row.get("SchoolHoliday", 0))
            })
            
    return {
        "store_id": store_id,
        "aggregation": aggregation,
        "metrics": {
            "rmse": rmse,
            "mape": mape,
            "total_actual": round(total_actual, 1),
            "total_forecast": round(total_forecast, 1),
            "total_baseline": round(total_baseline, 1),
            "variance_pct": round(((total_forecast - total_actual) / max(total_actual, 1)) * 100, 2)
        },
        "items": items
    }

def get_forecast_movers() -> Dict[str, Any]:
    dl = DataLoader.get_instance()
    fc_df = dl.forecast_test_df
    
    if fc_df.empty:
        return {"top_gainers": [], "top_decliners": []}
        
    store_totals = fc_df.groupby("Store").agg({
        "Sales": "sum",
        "Forecast": "sum",
        "Baseline": "sum"
    }).reset_index()
    
    store_totals["diff_vs_baseline"] = store_totals["Forecast"] - store_totals["Baseline"]
    store_totals["pct_diff"] = (store_totals["diff_vs_baseline"] / store_totals["Baseline"]) * 100
    
    # Merge store profile metadata
    master = dl.store_master_df[["Store", "StoreType", "Assortment", "tier", "flag"]]
    merged = store_totals.merge(master, on="Store", how="left")
    
    # Top gainers vs baseline
    gainers = merged.sort_values("pct_diff", ascending=False).head(10)
    # Top decliners vs baseline
    decliners = merged.sort_values("pct_diff", ascending=True).head(10)
    
    def format_list(df_sub):
        res = []
        for _, r in df_sub.iterrows():
            res.append({
                "store_id": int(r["Store"]),
                "store_type": str(r.get("StoreType", "a")),
                "assortment": str(r.get("Assortment", "a")),
                "tier": str(r.get("tier", "Middle 50%")),
                "forecast_total": round(float(r["Forecast"]), 0),
                "baseline_total": round(float(r["Baseline"]), 0),
                "diff_euros": round(float(r["diff_vs_baseline"]), 0),
                "diff_pct": round(float(r["pct_diff"]), 1),
                "risk_flag": str(r.get("flag", "OK"))
            })
        return res
        
    return {
        "top_gainers": format_list(gainers),
        "top_decliners": format_list(decliners)
    }
