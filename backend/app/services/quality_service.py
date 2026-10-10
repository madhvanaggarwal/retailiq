from typing import Dict, Any, List
from app.services.data_loader import DataLoader

def get_methodology_and_quality() -> Dict[str, Any]:
    dl = DataLoader.get_instance()
    
    return {
        "dataset_audit": {
            "title": "Rossmann Store Sales Dataset Audit",
            "historical_records": 1017209,
            "stores_count": 1115,
            "date_range": "2013-01-01 to 2015-07-31 (942 calendar days)",
            "duplicate_records": 0,
            "open_days_sales_greater_zero": 844338,
            "missing_values_handled": [
                {
                    "field": "CompetitionDistance",
                    "missing_count": 3,
                    "resolution": "Imputed with 2x maximum observed distance (75,860 meters) representing isolated stores."
                },
                {
                    "field": "CompetitionOpenSinceMonth / Year",
                    "missing_count": 354,
                    "resolution": "Imputed with 0; derived feature CompetitionMonthsOpen assigned -1 representing unknown entry."
                },
                {
                    "field": "Promo2SinceWeek / Year & PromoInterval",
                    "missing_count": 544,
                    "resolution": "Assigned 0 / 'None'; Promo2Weeks derived as -1 representing non-participating stores."
                }
            ],
            "known_data_anomalies": [
                "180 stores exhibit a data gap from July to December 2014 due to store refurbishments and system migrations.",
                "Performance calculations strictly evaluate open operating days to prevent closure bias."
            ]
        },
        "models_architecture": [
            {
                "model_id": "model_a",
                "name": "Model A: Daily Sales Forecaster",
                "algorithm": "XGBoost Regressor (v2 final)",
                "target_variable": "log1p(Sales), predicted with expm1()",
                "training_period": "2013-01-01 to 2015-06-19",
                "evaluation_window": "2015-06-20 to 2015-07-31 (last 6 weeks, 40,282 store-days)",
                "hyperparameters": {
                    "n_estimators": 800,
                    "max_depth": 10,
                    "learning_rate": 0.05,
                    "colsample_bytree": 0.7,
                    "subsample": 0.8,
                    "tree_method": "hist"
                },
                "features_used": [
                    "Store, DayOfWeek, Day, Month, Year, WeekOfYear, DayOfYear",
                    "Promo, StateHoliday, SchoolHoliday, StoreType, Assortment",
                    "CompetitionDistance, CompetitionMonthsOpen, Promo2, Promo2Weeks",
                    "StoreMeanSales, StoreMeanCustomers, StoreSalesPerCust",
                    "StoreDowMean, StorePromoMean, StoreMonthMean, StoreDowPromoMean",
                    "StoreRecentTrend, Promo2Active, DaysToHoliday, DaysAfterHoliday"
                ],
                "evaluation_metrics": {
                    "rmse": 839.86,
                    "mape": 8.03,
                    "r2": 0.924,
                    "rmspe": 11.34
                },
                "baseline_comparison": "Baseline store x dow x promo average: RMSE €1,108.64, MAPE 10.79%, RMSPE 14.68%"
            },
            {
                "model_id": "model_b",
                "name": "Model B: Quarterly Store Risk Classifier",
                "algorithm": "XGBoost Classifier (v3 with base effect features)",
                "target_variable": "1 = Store next-quarter YoY comp growth in chain bottom 25%",
                "training_snapshots": "4 quarterly historical snapshots (2014Q1, 2014Q2, 2014Q3, 2014Q4; 4,098 store-quarters)",
                "evaluation_snapshot": "Held-out Q2 2015 snapshot (1,115 stores, 279 actual underperformers)",
                "deploy_snapshot": "Refit on all labelled data for Q3 2015 live deployment",
                "hyperparameters": {
                    "n_estimators": 200,
                    "max_depth": 3,
                    "learning_rate": 0.05,
                    "scale_pos_weight": 3,
                    "colsample_bytree": 0.8,
                    "subsample": 0.8
                },
                "evaluation_metrics": {
                    "roc_auc": 0.896,
                    "accuracy": 83.59,
                    "precision": 64.20,
                    "recall": 77.78,
                    "f1_score": 0.703,
                    "cv_auc_mean": 0.876
                },
                "key_shap_drivers": [
                    "level_vs_base (Current level relative to prior-year comparison benchmark)",
                    "base_jump (Prior-year comparison benchmark was unusually elevated)",
                    "last_month_yoy (Short-term trailing momentum vs chain)",
                    "customers_yoy (Customer traffic growth momentum)",
                    "assortment_extended (Extended assortment provides structural protection)"
                ]
            },
            {
                "model_id": "model_c",
                "name": "Model C: Store Profile Expansion Scoring (Proxy)",
                "algorithm": "Multi-factor Composite Z-score",
                "formula": "(z(avg_daily_sales) + z(yoy_growth_h1) + z(sales_per_customer) - z(avg_risk)) / 4",
                "cohort_filter": "Profiles with >= 15 stores to ensure statistical reliability",
                "highest_ranked_profile": "Type d / Assortment c / competitor ≥ 2 km (+1.16 score)",
                "lowest_ranked_profile": "Type c / Assortment a / competitor < 2 km (-1.26 score)"
            }
        ],
        "limitations_and_disclaimers": [
            {
                "topic": "No Demographics or Footfall Sensors",
                "detail": "Rossmann dataset lacks external foot traffic footers, pedestrian counts, or demographic census data. Footfall is represented by POS checkout transactions."
            },
            {
                "topic": "No Margin or Rent Data",
                "detail": "Financial calculations focus on top-line sales and estimated revenue at risk. Gross margin and store rental overhead are not present in the dataset."
            },
            {
                "topic": "Expansion Scoring is a Format Proxy",
                "detail": "Expansion scores evaluate existing store formats and settings, not specific real estate geocodes. Physical site acquisition requires local traffic studies."
            },
            {
                "topic": "Revenue at Risk is an Estimate",
                "detail": "Revenue at risk (8.24% typical shortfall) indicates statistical vulnerability, not a certain or unpreventable financial loss."
            }
        ]
    }
