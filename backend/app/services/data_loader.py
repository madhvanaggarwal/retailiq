import json
from pathlib import Path
from typing import Dict, Any, Optional
import pandas as pd
import numpy as np
from app.config import MODELS_DIR, OUTPUTS_DIR, RAW_DIR

class DataLoader:
    _instance: Optional["DataLoader"] = None
    
    def __init__(self):
        self.summary: Dict[str, Any] = {}
        self.deck_data: Dict[str, Any] = {}
        self.model_config: Dict[str, Any] = {}
        self.store_risk_df: pd.DataFrame = pd.DataFrame()
        self.expansion_df: pd.DataFrame = pd.DataFrame()
        self.eval_forecast_df: pd.DataFrame = pd.DataFrame()
        self.eval_risk_df: pd.DataFrame = pd.DataFrame()
        self.daily_forecast_df: pd.DataFrame = pd.DataFrame()
        self.raw_stores_df: pd.DataFrame = pd.DataFrame()
        self.store_profiles_df: pd.DataFrame = pd.DataFrame()
        self.forecast_test_df: pd.DataFrame = pd.DataFrame()
        self.risk_test_df: pd.DataFrame = pd.DataFrame()
        self.store_master_df: pd.DataFrame = pd.DataFrame()
        self.load_all()

    @classmethod
    def get_instance(cls) -> "DataLoader":
        if cls._instance is None:
            cls._instance = DataLoader()
        return cls._instance

    def load_all(self):
        # 1. Summary JSON
        summary_path = OUTPUTS_DIR / "summary.json"
        if summary_path.exists():
            with open(summary_path, "r", encoding="utf-8") as f:
                self.summary = json.load(f)

        # 2. Deck Data JSON
        deck_path = OUTPUTS_DIR / "deck_data.json"
        if deck_path.exists():
            with open(deck_path, "r", encoding="utf-8") as f:
                self.deck_data = json.load(f)

        # 3. Model Config JSON
        cfg_path = MODELS_DIR / "model_config.json"
        if cfg_path.exists():
            with open(cfg_path, "r", encoding="utf-8") as f:
                self.model_config = json.load(f)

        # 4. Evaluation CSVs
        eval_fc_path = OUTPUTS_DIR / "eval_forecast.csv"
        if eval_fc_path.exists():
            self.eval_forecast_df = pd.read_csv(eval_fc_path, index_col=0)

        eval_risk_path = OUTPUTS_DIR / "eval_risk.csv"
        if eval_risk_path.exists():
            self.eval_risk_df = pd.read_csv(eval_risk_path)

        # 5. Daily Aggregate Forecast
        daily_path = OUTPUTS_DIR / "forecast_test_daily.csv"
        if daily_path.exists():
            self.daily_forecast_df = pd.read_csv(daily_path)

        # 6. Store Risk Q3 2015
        risk_path = OUTPUTS_DIR / "store_risk_q3_2015.csv"
        if risk_path.exists():
            self.store_risk_df = pd.read_csv(risk_path)

        # 7. Expansion Scores
        exp_path = OUTPUTS_DIR / "expansion_scores.csv"
        if exp_path.exists():
            self.expansion_df = pd.read_csv(exp_path)

        # 8. Raw Stores & Store Profiles
        raw_store_path = RAW_DIR / "store.csv"
        if raw_store_path.exists():
            self.raw_stores_df = pd.read_csv(raw_store_path)

        prof_path = MODELS_DIR / "lookup" / "store_profile.csv"
        if prof_path.exists():
            self.store_profiles_df = pd.read_csv(prof_path)

        # 9. Test Data
        fc_test_path = MODELS_DIR / "test_data" / "forecast_test_6weeks.csv.gz"
        if fc_test_path.exists():
            self.forecast_test_df = pd.read_csv(fc_test_path, compression="gzip")

        risk_test_path = MODELS_DIR / "test_data" / "risk_test_q2_2015.csv"
        if risk_test_path.exists():
            self.risk_test_df = pd.read_csv(risk_test_path)

        # 10. Build Combined Store Master
        self._build_store_master()

    def _build_store_master(self):
        # Base with raw stores
        if not self.raw_stores_df.empty:
            df = self.raw_stores_df.copy()
        else:
            df = pd.DataFrame({"Store": range(1, 1116)})

        # Merge store profile metrics
        if not self.store_profiles_df.empty:
            df = df.merge(self.store_profiles_df, on="Store", how="left")

        # Merge risk q3 2015 outputs
        if not self.store_risk_df.empty:
            risk_cols = [c for c in ["Store", "risk_probability", "q2_2015_revenue", "revenue_at_risk", "tier", "flag"] if c in self.store_risk_df.columns]
            df = df.merge(self.store_risk_df[risk_cols], on="Store", how="left")

        # Merge risk test snapshot metrics for diagnostic momentum
        if not self.risk_test_df.empty:
            diag_cols = [c for c in ["Store", "yoy_growth_last_q", "qoq_growth", "intra_q_trend", "customers_yoy", "level_vs_base", "base_jump", "last_month_yoy", "last_month_vs_base"] if c in self.risk_test_df.columns]
            df = df.merge(self.risk_test_df[diag_cols], on="Store", how="left")

        # Compute peer group key
        df["peer_group"] = "Type " + df["StoreType"].fillna("a") + " - Assortment " + df["Assortment"].fillna("a")
        
        # Calculate peer averages
        peer_means = df.groupby("peer_group")[["StoreMeanSales", "StoreMeanCustomers", "StoreSalesPerCust"]].transform("mean")
        df["peer_avg_sales"] = peer_means["StoreMeanSales"]
        df["peer_avg_customers"] = peer_means["StoreMeanCustomers"]
        df["peer_avg_basket"] = peer_means["StoreSalesPerCust"]
        
        self.store_master_df = df
