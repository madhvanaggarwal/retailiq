from typing import Dict, Any, List
from app.services.data_loader import DataLoader

def get_business_diagnosis() -> Dict[str, Any]:
    dl = DataLoader.get_instance()
    summary = dl.summary
    
    findings = [
        {
            "id": "traffic-vs-basket",
            "title": "1. Traffic vs. Basket Size Divergence",
            "business_question": "Why do top-tier stores generate 2.22x more sales than bottom-tier stores?",
            "supporting_evidence": {
                "top_daily_customers": 1117,
                "bottom_daily_customers": 504,
                "customer_gap_ratio": round(summary.get("top_vs_bottom_customers_x", 2.21), 2),
                "top_basket_eur": 9.60,
                "bottom_basket_eur": 9.20,
                "basket_gap_ratio": round(summary.get("top_vs_bottom_basket_x", 1.04), 2),
                "stat_headline": "2.21x Customer Footfall Gap vs. Only 1.04x Basket Size Difference"
            },
            "relevant_stores": "All 1,115 stores categorized into Top 25% (279), Middle 50% (557), and Bottom 25% (279)",
            "comparison_baseline": "Middle 50% estate average: 699 daily customers, €9.70 spend per customer",
            "primary_finding": "The revenue gap across the chain is almost entirely driven by foot traffic, not checkout spend. Once a customer enters a bottom-tier store, they spend nearly the exact same amount as a customer in a flagship store.",
            "potential_explanations": [
                "Poor storefront visibility, inferior accessibility, or suburban secondary locations.",
                "Inadequate local marketing or localized opening hour mismatches.",
                "Customers in bottom-tier territories have fewer natural daily visit triggers."
            ],
            "alternative_explanations": [
                "Local competitor opened nearby drawing away foot traffic.",
                "Demographic differences in local catchment area density."
            ],
            "suggested_next_investigation": "Conduct a pedestrian traffic and signage audit across bottom-tier stores. Test localized search marketing and exterior store refreshes rather than basket-size upsell promotions."
        },
        {
            "id": "assortment-impact",
            "title": "2. Assortment Depth & Store Format Performance",
            "business_question": "Which merchandising formats generate durable comp growth?",
            "supporting_evidence": {
                "extended_assortment_growth": "4.4% to 7.0% YoY H1 median growth",
                "basic_assortment_growth": "1.3% to 3.9% YoY H1 median growth",
                "star_format": "Store Type 'b' (17 stores): >50% in Top Tier",
                "best_expansion_format": "Type d / Assortment c (+1.16 composite z-score)",
                "worst_format": "Type c / Assortment a in dense competition (-1.26 composite z-score)"
            },
            "relevant_stores": "1,115 stores segmented across 4 store types (a, b, c, d) and 3 assortment tiers (a: basic, b: extra, c: extended)",
            "comparison_baseline": "Chain median YoY growth of +2.8%",
            "primary_finding": "Extended assortment ('c') provides a structural buffer against underperformance. Basic assortment ('a') stores suffer from low SKU variety and dominate the bottom tier.",
            "potential_explanations": [
                "Extended assortments fulfill one-stop shopping needs, capturing higher visit frequency.",
                "Basic assortment stores lose impulse purchases and specialty healthcare sales to competitors."
            ],
            "alternative_explanations": [
                "Extended assortment stores may simply have larger physical square footage that naturally generates higher sales."
            ],
            "suggested_next_investigation": "Identify stores operating basic assortment 'a' with sufficient square footage to transition to extended assortment 'c'."
        },
        {
            "id": "promo2-paradox",
            "title": "3. The Promo2 Circular Discount Paradox",
            "business_question": "Does participating in continuous couponing (Promo2) rescue struggling stores?",
            "supporting_evidence": {
                "bottom_tier_promo2_share": "61%",
                "top_tier_promo2_share": "42%",
                "middle_tier_promo2_share": "51%",
                "incremental_sales_lift": "Zero statistically detectable long-term customer lift in bottom-tier stores",
                "observation": "Participating stores suffer persistent lower growth despite recurring circular discounts"
            },
            "relevant_stores": "560 stores participating in Promo2 across the chain",
            "comparison_baseline": "555 non-participating stores matched by store type and geography",
            "primary_finding": "Promo2 was historically deployed reactively into underperforming stores, but recurring continuous coupons fail to solve the underlying footfall deficit while eroding gross margin.",
            "potential_explanations": [
                "Coupon redemptions are captured by existing shoppers rather than acquiring new foot traffic.",
                "Circular distribution channels in suburban territories have low penetration."
            ],
            "alternative_explanations": [
                "Promo2 stores would have declined even faster without the promotional support (selection bias)."
            ],
            "suggested_next_investigation": "Run an A/B pause test on Promo2 across a matched cohort of 30 bottom-tier stores to measure true margin and customer elasticity."
        },
        {
            "id": "competition-proximity",
            "title": "4. Competitor Proximity vs. Recency Paradox",
            "business_question": "Does having a close competitor damage retail performance?",
            "supporting_evidence": {
                "under_500m_avg_sales": "€7,500+ daily sales (highest across chain)",
                "over_5km_avg_sales": "€5,800 daily sales (isolated locations)",
                "new_competitor_impact": "-3.5% to -8.0% YoY drop in first 12 months after opening",
                "stable_competitor_impact": "Negligible effect after 24 months open"
            },
            "relevant_stores": "Stores segmented by CompetitionDistance (<500m, 500m-2km, >2km) and CompetitionOpenSince",
            "comparison_baseline": "Stores without competitor opening events in the preceding 12 months",
            "primary_finding": "Proximity to competitors is a positive indicator of prime commercial density (high footfall hubs). What harms performance is competitor *recency*—the initial customer curiosity period during months 1 to 12.",
            "potential_explanations": [
                "Cluster retail destinations naturally generate collective foot traffic (agglomeration effect).",
                "Newly opened competitors launch aggressive promotional honeymoon offers that temporarily divert footfall."
            ],
            "alternative_explanations": [
                "Competitors specifically choose to build adjacent to our most profitable stores."
            ],
            "suggested_next_investigation": "Set up a competitor opening notification tracker to launch targeted retention campaigns 30 days prior to new competitor store inaugurations."
        },
        {
            "id": "base-effect-risk",
            "title": "5. Base Effects & Underperformance Momentum (SHAP Analysis)",
            "business_question": "What signals explain the 306 stores flagged for underperformance in Q3 2015?",
            "supporting_evidence": {
                "flagged_stores_count": 306,
                "revenue_at_risk_total": "€10.0M per quarter",
                "typical_shortfall": "8.24% of quarterly revenue",
                "top_shap_driver": "level_vs_base (Current sales level relative to prior-year comparison quarter)",
                "second_shap_driver": "base_jump (Abnormally high sales in comparison quarter)",
                "third_shap_driver": "last_month_yoy (Short-term momentum trailing chain)"
            },
            "relevant_stores": "306 flagged stores evaluated at end of Q2 2015 for deployment in Q3 2015",
            "comparison_baseline": "Chain median growth across historical 5 labelled quarters",
            "primary_finding": "Underperformance in retail is largely predictable through the compounding effect of negative momentum and tough prior-year base comparisons. Stores trailing their required comp rate are highly likely to show negative quarterly surprises.",
            "potential_explanations": [
                "Store management is unaware of the heightened comp hurdle and does not adjust commercial scheduling.",
                "Recent negative trends reflect localized operational decay (staff turnover, stockouts)."
            ],
            "alternative_explanations": [
                "One-off events in prior year (e.g. major local festival or construction) created an artificial comp peak."
            ],
            "suggested_next_investigation": "Deploy the store-level risk ranking to regional managers with customized SHAP diagnostic cards ahead of each quarter."
        }
    ]
    
    return {
        "summary": "Evidence-backed diagnostic review identifying the structural drivers of store performance, format growth, and revenue at risk.",
        "findings": findings
    }
