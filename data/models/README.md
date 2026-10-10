# Trained model files: Rossmann consulting project

| File | What it is |
|---|---|
| `sales_forecaster_xgb.ubj` | **Model A**, final XGBoost sales forecast (RMSE €840, MAPE 8.0%, R² 0.92 on the last 6 weeks). Predicts log1p(Sales); apply `expm1()` |
| `risk_classifier_xgb.json` | **Model B**, the exact XGBoost risk classifier evaluated on Q2 2015 (ROC-AUC 0.896, accuracy 84%, precision 64%, recall 78%, F1 0.70) |
| `risk_classifier_xgb_deploy.json` | Same model refit on all labelled quarters; used to produce the Q3 2015 risk list (`outputs/store_risk_q3_2015.csv`) |
| `risk_logreg_comparison.joblib` | Logistic Regression comparison model (sklearn pipeline) |
| `model_config.json` | Feature lists **in exact column order**, category encodings (StoreType, Assortment, StateHoliday), derived-feature definitions, missing-value fills, label definition and class mapping, decision threshold (0.5), train/test periods, hyperparameters, test metrics, library versions |
| `lookup/*.csv` | Store-level lookup tables the forecast needs as inputs (store means by weekday, promo, month, etc., learned from the training period only) and the baseline table |
| `test_data/forecast_test_6weeks.csv.gz` | The exact 6-week test set with all model features, actual sales, forecast and baseline |
| `test_data/risk_test_q2_2015.csv` | The exact risk test set: features per store, true label, predicted probability |

There is no separate scaler or encoder file. XGBoost doesn't need scaling, and the category encodings are
plain mappings stored in `model_config.json`. The Logistic Regression's scaler is inside its joblib pipeline.

**Check:** `python reproduce_results.py` (from the project root) reloads these files and prints the same test metrics.
Models are saved in XGBoost native formats (.json, and binary .ubj for the large forecaster), so they load across XGBoost versions (built with xgboost 3.4.1).
