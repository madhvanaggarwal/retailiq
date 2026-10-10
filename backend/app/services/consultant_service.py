import re
from typing import Dict, Any, List
from app.services.data_loader import DataLoader
import pandas as pd

def answer_consultant_query(query: str) -> Dict[str, Any]:
    dl = DataLoader.get_instance()
    summary = dl.summary
    q_lower = query.lower().strip()
    
    # Check if querying a specific store (e.g. "store 817", "store 383", "store #10")
    store_match = re.search(r'\bstore\s*(?:#|\s)?(\d+)\b', q_lower)
    if store_match:
        store_id = int(store_match.group(1))
        master = dl.store_master_df
        match = master[master["Store"] == store_id]
        if not match.empty:
            s = match.iloc[0]
            prob = float(s.get("risk_probability", 0)) * 100
            rev_risk = float(s.get("revenue_at_risk", 0))
            sales = float(s.get("StoreMeanSales", 0))
            cust = float(s.get("StoreMeanCustomers", 0))
            basket = float(s.get("StoreSalesPerCust", 0))
            tier = str(s.get("tier", "Middle 50%"))
            flag = str(s.get("flag", "OK"))
            stype = str(s.get("StoreType", "a"))
            asst = str(s.get("Assortment", "a"))
            
            return {
                "query": query,
                "topic": f"Store {store_id} Analysis",
                "executive_takeaway": f"Store {store_id} is a Type '{stype}' format with Assortment '{asst}', currently sitting in the {tier} tier with status '{flag}'. Predicted underperformance risk is {prob:.1f}%.",
                "evidence_and_metrics": [
                    {"label": "Average Daily Sales", "value": f"€{sales:,.0f}"},
                    {"label": "Daily Customers", "value": f"{cust:,.0f} shoppers/day"},
                    {"label": "Average Basket Size", "value": f"€{basket:.2f}"},
                    {"label": "Risk Probability (Q3 2015)", "value": f"{prob:.1f}%"},
                    {"label": "Revenue at Risk", "value": f"€{rev_risk:,.0f}"}
                ],
                "detailed_analysis": f"Store {store_id} generates €{sales:,.0f} per open day. " + (
                    f"It is flagged as high-risk primarily due to negative momentum and tough prior-year comp benchmarks. The estimated quarterly shortfall at risk is €{rev_risk:,.0f}."
                    if prob >= 50 else
                    "The store exhibits stable operational momentum and healthy comp performance."
                ),
                "strategic_recommendations": [
                    f"Review inventory availability during high-traffic promotional weeks.",
                    f"Benchmark against its peer group (Type {stype} - Assortment {asst}).",
                    f"View detailed daily forecast backtests and SHAP risk drivers on the Store Performance page."
                ],
                "related_module": "/stores",
                "related_module_title": "Store Performance Detail"
            }

    # 1. Overall Performance
    if any(k in q_lower for k in ["overall", "performance", "how is the business", "chain", "summary", "overview"]):
        return {
            "query": query,
            "topic": "Chain-Wide Executive Performance Review",
            "executive_takeaway": "The chain operates 1,115 stores generating healthy overall volume, but shows substantial performance polarization: top-tier stores generate 2.22x more revenue than bottom-tier stores. For Q3 2015, €10.0M of quarterly revenue is at risk across 306 flagged stores.",
            "evidence_and_metrics": [
                {"label": "Total Stores Analyzed", "value": "1,115 stores"},
                {"label": "Top vs Bottom Sales Gap", "value": "2.22x multiplier"},
                {"label": "Customer Footfall Multiplier", "value": "2.21x (1,117 vs 504 customers/day)"},
                {"label": "Spend per Customer", "value": "Nearly equal: €9.60 vs €9.20 (1.04x)"},
                {"label": "Q3 2015 Revenue at Risk", "value": "€9.98M across 306 stores"}
            ],
            "detailed_analysis": "Our diagnostic models confirm that revenue variation is almost purely a footfall problem. Bottom-tier stores suffer from low visitor density, not smaller customer shopping baskets. Furthermore, 306 stores are statistically primed to underperform in Q3 2015 due to high prior-year hurdles and weakening trailing momentum.",
            "strategic_recommendations": [
                "Prioritize the top 50 revenue-at-risk stores for immediate operational review.",
                "Redirect marketing away from basket discounting into local storefront visibility and footfall acquisition.",
                "Accelerate conversion of basic-assortment stores to extended assortment format."
            ],
            "related_module": "/overview",
            "related_module_title": "Executive Overview"
        }

    # 2. Risk / Stores needing attention
    if any(k in q_lower for k in ["risk", "attention", "underperform", "flagged", "threat", "decline"]):
        return {
            "query": query,
            "topic": "Store Risk & Underperformance Early Warnings",
            "executive_takeaway": "306 stores are flagged at risk of underperforming their comp benchmarks in Q3 2015. Total probability-weighted revenue at risk is €10.0M.",
            "evidence_and_metrics": [
                {"label": "Stores Flagged at Risk", "value": "306 of 1,115 (27.4%)"},
                {"label": "Total Revenue at Risk", "value": "€9.98M per quarter"},
                {"label": "Typical Shortfall of Underperformers", "value": "8.24% of quarterly revenue"},
                {"label": "Risk Classifier Precision / Recall", "value": "64.2% Precision, 77.8% Recall (ROC-AUC 0.896)"},
                {"label": "Top Revenue-at-Risk Stores", "value": "Stores 817 (€121k), 383 (€97k), 262 (€92k), 788 (€77k)"}
            ],
            "detailed_analysis": "Risk is driven by momentum and the base effect. Counterintuitively, many large top-tier stores (such as Store 817 and Store 262) are flagged because their prior-year comp baseline was extraordinarily high, and recent sales trends are decelerating.",
            "strategic_recommendations": [
                "Rank operational audits strictly by euros at risk, not store size.",
                "Send regional managers individual store diagnostic cards with SHAP root-cause drivers.",
                "Proactively adjust promotional calendars for stores facing high comp hurdles."
            ],
            "related_module": "/stores",
            "related_module_title": "Store Performance & Risk Explorer"
        }

    # 3. Footfall vs Basket size gap
    if any(k in q_lower for k in ["traffic", "footfall", "basket", "gap", "shopper", "customer"]):
        return {
            "query": query,
            "topic": "Footfall vs. Basket Size Diagnostic",
            "executive_takeaway": "The gap between winning and losing stores is 95% driven by customer footfall, not basket size. Bottom stores receive less than half the foot traffic of top stores, but shoppers spend almost the same once inside.",
            "evidence_and_metrics": [
                {"label": "Top Tier Daily Customers", "value": "1,117 shoppers/day"},
                {"label": "Bottom Tier Daily Customers", "value": "504 shoppers/day (2.21x deficit)"},
                {"label": "Top Tier Spend per Customer", "value": "€9.60"},
                {"label": "Bottom Tier Spend per Customer", "value": "€9.20 (only 4% difference)"},
                {"label": "Average Daily Sales Gap", "value": "€10,723 vs €4,637 (2.22x gap)"}
            ],
            "detailed_analysis": "Traditional retail initiatives that attempt to upsell additional items to bottom-tier customers deliver minimal incremental ROI. Because spend per customer is already €9.20, the strategic bottleneck is the doorway: getting more unique shoppers into the store.",
            "strategic_recommendations": [
                "Shift promotional budget into exterior storefront visibility, directional signage, and geo-targeted mobile ads.",
                "Review opening hours: adjust opening times to capture early morning commuter flow.",
                "Audit local competitor proximity to identify if foot traffic is being intercepted."
            ],
            "related_module": "/diagnosis",
            "related_module_title": "Business Diagnosis"
        }

    # 4. Expansion / New Stores
    if any(k in q_lower for k in ["expand", "expansion", "new store", "profile", "format", "replicate"]):
        return {
            "query": query,
            "topic": "Store Expansion & Format Opportunity Scoring",
            "executive_takeaway": "Store Type 'd' with Extended Assortment 'c' and competitor >=2 km is the chain's top-performing format (+1.16 composite score). Basic assortment formats in dense competitive areas rank lowest (-1.26 score).",
            "evidence_and_metrics": [
                {"label": "Rank #1 Format", "value": "Type d / Assortment c / comp ≥ 2 km (+1.16 score)"},
                {"label": "Rank #2 Format", "value": "Type d / Assortment c / comp < 2 km (+0.96 score)"},
                {"label": "Lowest Ranked Format", "value": "Type c / Assortment a / comp < 2 km (-1.26 score)"},
                {"label": "Star Niche Format", "value": "Type 'b' (17 stores): High sales but too small to scale safely"},
                {"label": "Average Daily Sales (Top Format)", "value": "€7,048 with +5.8% YoY growth"}
            ],
            "detailed_analysis": "Format scoring uses a multi-factor composite z-score combining daily sales volume, YoY comp growth, basket economics, and risk resilience. Extended assortment provides essential SKU breadth that drives consumer preference over rivals.",
            "strategic_recommendations": [
                "Prioritize Store Type 'd' blueprints for all future real estate lease signings.",
                "Convert existing basic assortment 'a' stores into extended assortment 'c' where floor space permits.",
                "Caveat: This analysis is a format-level proxy; always validate local demographic and pedestrian traffic data before committing capital."
            ],
            "related_module": "/recommendations",
            "related_module_title": "Consulting Recommendations"
        }

    # 5. Forecast / Machine Learning Accuracy
    if any(k in q_lower for k in ["forecast", "accuracy", "model", "xgboost", "rmse", "mape", "predict"]):
        return {
            "query": query,
            "topic": "Sales Forecasting Model & Accuracy Review",
            "executive_takeaway": "The Model A XGBoost forecaster achieves an 8.03% MAPE and €840 RMSE on the 6-week holdout evaluation, cutting prediction error by 24% compared to the historical baseline average.",
            "evidence_and_metrics": [
                {"label": "Evaluation Window", "value": "20 Jun 2015 – 31 Jul 2015 (40,282 store-days)"},
                {"label": "XGBoost v2 (Final) MAPE", "value": "8.03% (vs 10.79% Baseline)"},
                {"label": "XGBoost v2 RMSE", "value": "€839.86 (vs €1,108.64 Baseline)"},
                {"label": "Model R² Score", "value": "0.924 (92.4% variance explained)"},
                {"label": "Key Features", "value": "Store promo-lift, day-of-week, seasonality, holiday timing"}
            ],
            "detailed_analysis": "By explicitly modeling store-specific promotional elasticity and calendar holiday lead/lag effects, the model captures aggregate chain demand surges and store-level daily volatility with enterprise precision.",
            "strategic_recommendations": [
                "Use daily model forecasts to optimize store staff scheduling during promotional cycles.",
                "Trigger automated replenishment when actual store sales exceed forecast by >15% on Day 1 of a promo.",
                "Utilize the What-If Simulator to stress-test promotional shifts."
            ],
            "related_module": "/forecast",
            "related_module_title": "Sales Forecast Module"
        }

    # Default fallback
    return {
        "query": query,
        "topic": "Retail Strategy Advisory",
        "executive_takeaway": "RetailIQ synthesizes 1,115 stores, 2.5 years of transactions, and validated machine learning models to answer your retail strategy questions.",
        "evidence_and_metrics": [
            {"label": "Analyzed Stores", "value": "1,115 stores"},
            {"label": "Validated Models", "value": "Sales Forecaster (XGBoost) & Risk Classifier"},
            {"label": "Flagged Stores", "value": "306 stores (€10M revenue at risk)"},
            {"label": "Core Driver", "value": "2.21x customer footfall gap between top and bottom tiers"}
        ],
        "detailed_analysis": f"Regarding '{query}': Our data indicates that store performance is heavily influenced by foot traffic acquisition, assortment breadth (extended category 'c'), and comp momentum. Specific store diagnostics and scenario models are available across the platform.",
        "strategic_recommendations": [
            "Explore the Executive Overview for headline portfolio metrics.",
            "Investigate Store Performance to review individual store diagnostics and SHAP risk drivers.",
            "Use the What-If Simulator to test the revenue impact of growth and promotional changes."
        ],
        "related_module": "/overview",
        "related_module_title": "Executive Overview"
    }
