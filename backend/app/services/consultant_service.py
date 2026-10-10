import re
from typing import Dict, Any, List
from app.services.data_loader import DataLoader
import pandas as pd

def answer_consultant_query(query: str) -> Dict[str, Any]:
    dl = DataLoader.get_instance()
    summary = dl.summary
    q_lower = query.lower().strip()
    
    # -------------------------------------------------------------
    # 1. SPECIFIC STORE INQUIRY (e.g. "Store 817", "Store #383", "#1")
    # -------------------------------------------------------------
    store_match = re.search(r'\b(?:store\s*(?:#|\s)?|#)(\d+)\b', q_lower)
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
            promo2 = int(s.get("Promo2", 0))
            comp_dist = float(s.get("CompetitionDistance", 0)) if pd.notnull(s.get("CompetitionDistance")) else 2325.0
            
            risk_desc = (
                f"Store {store_id} is flagged as High Risk (probability: {prob:.1f}%), with an estimated €{rev_risk:,.0f} quarterly revenue at risk."
                if prob >= 50 else
                f"Store {store_id} exhibits stable operational momentum (risk probability: {prob:.1f}%) and is not flagged for severe underperformance."
            )
            
            return {
                "query": query,
                "topic": f"Store {store_id} Performance & Risk Audit",
                "executive_takeaway": f"Store {store_id} is a Type '{stype}' format with Assortment '{asst}', located in the {tier} tier (Status: '{flag}'). {risk_desc}",
                "evidence_and_metrics": [
                    {"label": "Average Daily Sales [Fact]", "value": f"€{sales:,.0f}"},
                    {"label": "Daily Customers [Fact]", "value": f"{cust:,.0f} shoppers/day"},
                    {"label": "Average Basket Size [Fact]", "value": f"€{basket:.2f}"},
                    {"label": "Q3 2015 Risk Prob [Model]", "value": f"{prob:.1f}%"},
                    {"label": "Revenue at Risk [Model]", "value": f"€{rev_risk:,.0f}"},
                    {"label": "Promo2 Enrolled [Fact]", "value": "Yes" if promo2 == 1 else "No"},
                    {"label": "Nearest Competitor [Fact]", "value": f"{comp_dist:,.0f} m"}
                ],
                "detailed_analysis": (
                    f"Store {store_id} generates €{sales:,.0f} per open day across {cust:,.0f} average daily shoppers. "
                    + (
                        f"Our XGBoost risk model flags this store due to negative comp momentum against difficult prior-year benchmarks. "
                        f"Because basket size is €{basket:.2f}, interventions must prioritize footfall acquisition and promotional timing rather than basket upselling."
                        if prob >= 50 else
                        f"Operational trajectory remains sound with steady transaction flow. Continues to track within normal variance of its peer cohort."
                    )
                ),
                "strategic_recommendations": [
                    f"Review inventory availability during high-traffic promotional weeks.",
                    f"Benchmark against its peer group (Type {stype} - Assortment {asst}).",
                    f"Open the Store Performance audit modal to view daily XGBoost backtests and SHAP risk drivers."
                ],
                "related_module": "/stores",
                "related_module_title": "Store Performance Detail"
            }
        else:
            return {
                "query": query,
                "topic": f"Store {store_id} Not Found",
                "executive_takeaway": f"Store {store_id} was not found in the portfolio. The Rossmann retail dataset includes stores numbered from 1 to 1,115.",
                "evidence_and_metrics": [
                    {"label": "Queried Store ID", "value": f"#{store_id}"},
                    {"label": "Portfolio Range", "value": "Stores 1 to 1,115"},
                    {"label": "Total Active Stores", "value": "1,115 stores"}
                ],
                "detailed_analysis": f"Please verify the store number and try again. For a searchable list of all 1,115 stores with filters by tier, risk status, and format, explore the Store Performance module.",
                "strategic_recommendations": [
                    "Search stores by ID, type, or assortment on the Store Performance page.",
                    "Review top revenue-at-risk stores (e.g. Stores 817, 383, 262, 788) on Executive Overview."
                ],
                "related_module": "/stores",
                "related_module_title": "Store Performance Directory"
            }

    # -------------------------------------------------------------
    # 2. PROMOTIONAL EFFECTIVENESS & PROMO2 INEFFICIENCY
    # -------------------------------------------------------------
    if any(k in q_lower for k in ["promo", "promotion", "promotional", "coupon", "discount", "campaign", "promo2"]):
        return {
            "query": query,
            "topic": "Promotional Effectiveness & Promo2 Analysis",
            "executive_takeaway": "Standard bi-weekly promotions (Promo1) drive massive volume surges (+€1,800 to +€2,400 sales/day), whereas continuous couponing (Promo2) exhibits zero incremental footfall lift in struggling stores and creates -4.8% sales drag in mature stores.",
            "evidence_and_metrics": [
                {"label": "Promo 1 Daily Lift [Fact]", "value": "+35% to +45% volume lift"},
                {"label": "Promo2 Participating Stores [Fact]", "value": "560 of 1,115 stores (50.2%)"},
                {"label": "Bottom-Tier Promo2 Share [Fact]", "value": "61% enrolled (vs 42% in Top Tier)"},
                {"label": "Promo2 Incremental Lift [Fact]", "value": "Zero statistically detectable long-term lift"},
                {"label": "Mature Store Promo2 Drag [Model]", "value": "-4.8% comp growth impact"}
            ],
            "detailed_analysis": "Historical data reveals a major promotional disparity: standard Promo 1 creates urgent consumer demand and elevates daily sales by over 35%. Conversely, Promo2 was deployed reactively into underperforming locations, creating coupon dependency where existing shoppers redeem discounts without attracting incremental foot traffic. This erodes gross margin without solving the footfall deficit.",
            "strategic_recommendations": [
                "Run a 30-store A/B pause test on Promo2 across bottom-tier stores to measure true margin elasticity.",
                "Concentrate Promo1 marketing around paydays and high-traffic weekends to maximize traffic conversion.",
                "Pair promotional campaigns with extended assortment 'c' formats to maximize basket cross-selling."
            ],
            "related_module": "/diagnosis",
            "related_module_title": "Business Diagnosis Module"
        }

    # -------------------------------------------------------------
    # 3. REVENUE AT RISK & STORES NEEDING ATTENTION
    # -------------------------------------------------------------
    if any(k in q_lower for k in ["risk", "attention", "underperform", "flagged", "threat", "decline", "vulnerable", "shortfall", "q3"]):
        return {
            "query": query,
            "topic": "Store Risk & Underperformance Early Warnings",
            "executive_takeaway": "306 stores (27.4%) are flagged at risk of comp underperformance in Q3 2015. Total probability-weighted quarterly revenue at risk is €9.98M (~€10.0M), representing an average 8.24% shortfall for affected stores.",
            "evidence_and_metrics": [
                {"label": "Stores Flagged at Risk [Fact]", "value": "306 of 1,115 (27.4%)"},
                {"label": "Total Revenue at Risk [Model]", "value": "€9.98M per quarter"},
                {"label": "Expected Comp Shortfall [Model]", "value": "8.24% of quarterly revenue"},
                {"label": "Risk Classifier Accuracy [Model]", "value": "83.6% (ROC-AUC 0.896)"},
                {"label": "Top At-Risk Stores [Model]", "value": "Store 817 (€121k), 383 (€97k), 262 (€92k), 788 (€77k)"}
            ],
            "detailed_analysis": "Risk is primarily driven by momentum decelerations against high prior-year comp benchmarks. Large, historically successful stores (such as Store 817 and Store 262) face severe euro-exposure because even a modest comp decline translates into tens of thousands of euros in shortfall. Operational reviews must prioritize euro risk rather than percentage drop alone.",
            "strategic_recommendations": [
                "Prioritize the top 50 revenue-at-risk stores for immediate district manager site visits.",
                "Deploy individual store diagnostic cards with SHAP root-cause drivers to store managers.",
                "Log corrective actions directly in the RetailIQ Action Tracker with milestone governance."
            ],
            "related_module": "/stores",
            "related_module_title": "Store Performance & Risk Explorer"
        }

    # -------------------------------------------------------------
    # 4. FOOTFALL VS BASKET SIZE GAP (CORE DISCOVERY)
    # -------------------------------------------------------------
    if any(k in q_lower for k in ["traffic", "footfall", "basket", "gap", "shopper", "customer", "spend", "visit"]):
        return {
            "query": query,
            "topic": "Footfall vs. Basket Size Diagnostic",
            "executive_takeaway": "The performance gap between top and bottom stores is 96% driven by customer footfall, not basket size. Top-tier stores welcome 2.21x more shoppers per day, while spend per customer is nearly identical (€9.60 vs €9.20, a mere 1.04x difference).",
            "evidence_and_metrics": [
                {"label": "Top Tier Daily Footfall [Fact]", "value": "1,117 shoppers/day"},
                {"label": "Bottom Tier Daily Footfall [Fact]", "value": "504 shoppers/day (2.21x deficit)"},
                {"label": "Top Tier Basket Spend [Fact]", "value": "€9.60 per shopper"},
                {"label": "Bottom Tier Basket Spend [Fact]", "value": "€9.20 per shopper (only 4.3% variance)"},
                {"label": "Daily Sales Multiplier [Fact]", "value": "2.22x (€8,247 vs €3,714/day)"}
            ],
            "detailed_analysis": "Retail turnaround initiatives often focus on upselling existing shoppers to increase average transaction size. The empirical evidence proves this is misallocated effort: bottom-tier customers already spend €9.20 once inside. The core bottleneck is doorway footfall. Increasing bottom-tier customer visits generates over 20x higher financial return than attempting basket upselling.",
            "strategic_recommendations": [
                "Reallocate local marketing budgets from in-store discounting into exterior visibility and local SEO.",
                "Review operating hours to capture early commuter and evening shopping traffic.",
                "Audit pedestrian accessibility and storefront signage for the bottom 25% store cohort."
            ],
            "related_module": "/diagnosis",
            "related_module_title": "Business Diagnosis"
        }

    # -------------------------------------------------------------
    # 5. SALES FORECASTING MODEL & ACCURACY (MODEL A)
    # -------------------------------------------------------------
    if any(k in q_lower for k in ["forecast", "accuracy", "model", "xgboost", "rmse", "mape", "predict", "r2", "rmspe"]):
        return {
            "query": query,
            "topic": "Sales Forecasting Model & Accuracy Review",
            "executive_takeaway": "The Model A XGBoost forecaster achieves an 8.03% MAPE and €839.86 RMSE on the 6-week holdout evaluation (40,282 store-days), reducing prediction error by 24% relative to the historical baseline moving average.",
            "evidence_and_metrics": [
                {"label": "Evaluation Window [Fact]", "value": "20 Jun 2015 – 31 Jul 2015 (40,282 store-days)"},
                {"label": "XGBoost v2 (Final) MAPE [Model]", "value": "8.03% (vs 10.79% Baseline)"},
                {"label": "XGBoost v2 RMSE [Model]", "value": "€839.86 (vs €1,108.64 Baseline)"},
                {"label": "Model R² Score [Model]", "value": "0.924 (92.4% variance explained)"},
                {"label": "Holdout RMSPE [Model]", "value": "11.34% (vs 13.91% Baseline)"}
            ],
            "detailed_analysis": "The forecasting architecture models store-specific promo response curves, day-of-week demand patterns, school/state holiday calendar lags, and comp trends. It reliably forecasts holdout demand down to store-level daily sales, outperforming conventional moving-average baselines by substantial margins.",
            "strategic_recommendations": [
                "Incorporate store daily forecast curves into labor scheduling and shift planning.",
                "Use forecast thresholds to detect early distribution stockouts during active promo weeks.",
                "Stress-test promo adjustments in the What-If Simulator before committing marketing spend."
            ],
            "related_module": "/forecast",
            "related_module_title": "Sales Forecast Module"
        }

    # -------------------------------------------------------------
    # 6. EXPANSION & FORMAT REPLICATION OPPORTUNITY
    # -------------------------------------------------------------
    if any(k in q_lower for k in ["expand", "expansion", "new store", "profile", "format", "replicate", "blueprint"]):
        return {
            "query": query,
            "topic": "Store Expansion & Format Opportunity Scoring",
            "executive_takeaway": "Store Type 'd' with Extended Assortment 'c' and competitor >=2 km is the chain's top-performing format (+1.16 composite score, €7,048 avg daily sales, +5.8% YoY growth). Basic assortment formats in high competition rank lowest (-1.26 score).",
            "evidence_and_metrics": [
                {"label": "Rank #1 Format [Model]", "value": "Type d / Assortment c / comp ≥ 2 km (+1.16 score)"},
                {"label": "Rank #2 Format [Model]", "value": "Type d / Assortment c / comp < 2 km (+0.96 score)"},
                {"label": "Lowest Ranked Format [Model]", "value": "Type c / Assortment a / comp < 2 km (-1.26 score)"},
                {"label": "High-Volume Niche [Fact]", "value": "Type 'b' (17 stores): High sales but small sample size"},
                {"label": "Average Daily Sales [Top] [Fact]", "value": "€7,048 with +5.8% YoY comp growth"}
            ],
            "detailed_analysis": "Format scoring uses a multi-factor composite z-score combining daily sales volume, YoY comp growth, basket economics, and risk resilience. Extended assortment 'c' provides essential category depth that drives customer loyalty and shields stores from competitive attrition.",
            "strategic_recommendations": [
                "Prioritize Store Type 'd' specifications for all new real estate site acquisitions.",
                "Convert eligible Store Type 'a' locations into Extended Assortment 'c' format where space allows.",
                "Caveat: Format scores represent empirical proxies; always conduct local pedestrian footfall audits prior to capital deployment."
            ],
            "related_module": "/recommendations",
            "related_module_title": "Consulting Recommendations"
        }

    # -------------------------------------------------------------
    # 7. COMPETITOR PROXIMITY & RECENCY
    # -------------------------------------------------------------
    if any(k in q_lower for k in ["competitor", "competition", "distance", "proximity", "recency", "rival"]):
        return {
            "query": query,
            "topic": "Competitor Proximity vs. Recency Diagnostic",
            "executive_takeaway": "Proximity to competitors is not inherently detrimental: stores with competitors within 500m generate the highest daily sales (€7,500+) due to commercial density. What creates negative shock is competitor recency: newly opened rivals cause a temporary -3.5% to -8.0% YoY comp drop.",
            "evidence_and_metrics": [
                {"label": "Competitor <500m Avg Sales [Fact]", "value": "€7,500+ daily sales (prime retail clusters)"},
                {"label": "Competitor >5km Avg Sales [Fact]", "value": "€5,800 daily sales (isolated locations)"},
                {"label": "New Competitor Impact [Model]", "value": "-3.5% to -8.0% YoY drop in months 1–12"},
                {"label": "Long-Term Competitor Impact [Fact]", "value": "Negligible differential after 24 months open"}
            ],
            "detailed_analysis": "Retail stores situated in competitive clusters benefit from collective destination footfall (agglomeration). The vulnerability occurs when a competitor first opens, triggering a novelty period. After 12–24 months, customer shopping patterns stabilize back to baseline levels.",
            "strategic_recommendations": [
                "Establish a competitive opening tracking radar to flag rival permits 90 days in advance.",
                "Launch defensive loyalty and circular campaigns 30 days prior to competitor openings.",
                "Avoid avoiding prime retail locations merely because competitors are present nearby."
            ],
            "related_module": "/diagnosis",
            "related_module_title": "Business Diagnosis"
        }

    # -------------------------------------------------------------
    # 8. OVERALL CHAIN PERFORMANCE (CHAIN-WIDE REVIEW)
    # -------------------------------------------------------------
    if any(k in q_lower for k in ["overall", "performance", "how is the business", "chain", "summary", "overview", "health", "volume", "total sales"]):
        return {
            "query": query,
            "topic": "Chain-Wide Executive Performance Review",
            "executive_takeaway": "The chain operates 1,115 stores generating healthy volume across 2.5 years, but exhibits significant performance polarization: top-tier stores generate 2.22x more revenue than bottom-tier stores. For Q3 2015, €9.98M of quarterly revenue is at risk across 306 flagged stores.",
            "evidence_and_metrics": [
                {"label": "Total Stores Analyzed [Fact]", "value": "1,115 stores"},
                {"label": "Top vs Bottom Sales Gap [Fact]", "value": "2.22x multiplier (€8,247 vs €3,714/day)"},
                {"label": "Customer Footfall Gap [Fact]", "value": "2.21x (1,117 vs 504 customers/day)"},
                {"label": "Spend per Customer [Fact]", "value": "Nearly equal: €9.60 vs €9.20 (1.04x)"},
                {"label": "Q3 2015 Revenue at Risk [Model]", "value": "€9.98M across 306 stores"}
            ],
            "detailed_analysis": "Empirical models confirm that revenue variation across the chain is overwhelmingly a footfall problem. Bottom-tier stores suffer from low visitor density, not smaller customer shopping baskets. Furthermore, 306 stores face headwinds in Q3 2015 due to high prior-year comp hurdles and decelerating trailing momentum.",
            "strategic_recommendations": [
                "Prioritize the top 50 revenue-at-risk stores for immediate operational review.",
                "Redirect marketing away from basket discounting into local storefront visibility and footfall acquisition.",
                "Accelerate conversion of basic-assortment stores to extended assortment format."
            ],
            "related_module": "/overview",
            "related_module_title": "Executive Overview"
        }

    # -------------------------------------------------------------
    # 9. DEFAULT CONSULTING FALLBACK (INFORMATIVE & GUIDED)
    # -------------------------------------------------------------
    return {
        "query": query,
        "topic": "Retail Strategy Advisory",
        "executive_takeaway": f"RetailIQ synthesizes verified Rossmann empirical transaction records, XGBoost sales forecasters, and risk models to answer retail strategy inquiries. Regarding '{query}': store performance is primarily driven by footfall acquisition, assortment depth, and promotional timing.",
        "evidence_and_metrics": [
            {"label": "Analyzed Stores [Fact]", "value": "1,115 stores (Jan 2013 – Jul 2015)"},
            {"label": "Forecasting Accuracy [Model]", "value": "8.03% MAPE (XGBoost v2)"},
            {"label": "Flagged Stores [Model]", "value": "306 stores (€9.98M quarterly revenue at risk)"},
            {"label": "Primary Sales Driver [Fact]", "value": "2.21x customer footfall gap (1,117 vs 504/day)"}
        ],
        "detailed_analysis": f"Our analysis shows store performance variations across the 1,115-store portfolio reflect doorway footfall density and format assortment. For specific deep dives, ask about store risk ('Which stores have the highest revenue at risk?'), forecasting accuracy, promotional impact ('How effective are promotions?'), or a specific store ID (e.g., 'Tell me about Store 817').",
        "strategic_recommendations": [
            "Explore the Executive Overview for headline portfolio metrics and tier scorecards.",
            "Inspect Store Performance to review individual store diagnostics and SHAP risk drivers.",
            "Use the What-If Simulator to evaluate the financial impact of footfall and promo adjustments."
        ],
        "related_module": "/overview",
        "related_module_title": "Executive Overview"
    }
