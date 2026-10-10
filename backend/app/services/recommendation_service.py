from typing import Dict, Any, List
from app.services.data_loader import DataLoader

def get_consulting_recommendations() -> Dict[str, Any]:
    dl = DataLoader.get_instance()
    summary = dl.summary
    
    recommendations = [
        {
            "id": "rec-1",
            "title": "Local Footfall Recovery Campaign for Bottom-Tier Stores",
            "category": "Act Now",
            "urgency": "High",
            "priority": "Critical",
            "evidence_strength": "High",
            "business_problem": "Bottom 25% stores suffer from a chronic customer traffic deficit (504 vs 1,117 daily customers in top tier), while spend per customer is nearly identical (€9.20 vs €9.60). Current discounting strategies fail to drive footfall.",
            "supporting_evidence": "Customer count ratio between top and bottom tiers is 2.21x, while basket size ratio is only 1.04x. Total 279 stores in bottom tier generate only €4,637 avg daily sales vs €10,723 in top tier.",
            "affected_stores": "279 bottom-tier stores across all regions",
            "potential_causes": [
                "Storefront visibility gaps in secondary locations",
                "Sub-optimal opening hours vs local shopping flow",
                "Lack of geo-targeted local digital awareness"
            ],
            "recommended_action": "Reallocate 15% of broad circular marketing expenditure into localized pedestrian signage, exterior storefront refreshments, and hyper-local mobile search/maps optimization.",
            "alternative_actions": [
                "Option B: Deep product discounting (High margin erosion; ineffective based on basket data)",
                "Option C: Store closures (Destroys network value and customer density)"
            ],
            "trade_offs": "Requires reallocating marketing spend away from chain-wide TV/circulars into fragmented local marketing programs.",
            "expected_direction_of_impact": "Positive customer footfall growth with protected gross margins",
            "quantified_impact": "Targeting a +10% lift in footfall (+50 customers/day per store) equates to approximately €125,000 annualized incremental revenue per store, or ~€35M chain-wide across bottom tier.",
            "estimated_cost": "€1,200–€1,800 per store for local search setup, signage, and localized digital testing (~€450K total)",
            "required_resources": "Head of Local Marketing, Digital Performance Agency, Regional Merchandisers",
            "suggested_owner": "Chief Commercial Officer",
            "suggested_timeline": "60 Days (Phase 1 pilot in 30 stores; Phase 2 rollout)",
            "implementation_steps": [
                "Phase 1 (Days 1–20): Audit top 30 lowest-traffic stores for physical visibility and local Google Maps presence.",
                "Phase 2 (Days 21–45): Launch geo-fenced mobile search advertising and improved physical directional signage.",
                "Phase 3 (Days 46–60): Measure daily footfall delta vs matched control stores; expand to remaining bottom-tier stores."
            ],
            "success_metric": "+10% increase in average daily customer count within 60 days of intervention",
            "follow_up_plan": "Weekly customer count tracking using POS receipt timestamps vs historical dow benchmarks.",
            "assumptions_and_limitations": "Assumes store staffing can handle increased transaction volume without deteriorating service levels."
        },
        {
            "id": "rec-2",
            "title": "Quarterly Early-Warning Risk Review Protocol",
            "category": "Investigate",
            "urgency": "Critical",
            "priority": "Critical",
            "evidence_strength": "High",
            "business_problem": "306 stores are flagged at high risk of falling into the bottom quartile of quarterly growth for Q3 2015, putting an estimated €10.0M of quarterly revenue at risk.",
            "supporting_evidence": "The XGBoost classifier captures 77.8% of historical underperformers with 64.2% precision (ROC-AUC 0.896). The top 25 flagged stores represent over 25% of the total €10M at-risk revenue.",
            "affected_stores": "306 flagged stores, prioritized by euros at risk (e.g. Stores 817, 383, 262, 788, 733)",
            "potential_causes": [
                "Tough prior-year comp hurdle ('base effect')",
                "Consecutive trailing months of negative growth momentum",
                "New competitor opening within the last 12 months"
            ],
            "recommended_action": "Issue quarterly store-level diagnostic cards with SHAP explanations to Regional Managers 3 weeks prior to quarter start; conduct proactive inventory and staffing alignment.",
            "alternative_actions": [
                "Option B: Blanket inventory cuts (Risks severe out-of-stock and sales death spiral)",
                "Option C: Wait for quarterly financial close (Too late to salvage revenue shortfall)"
            ],
            "trade_offs": "Requires 2–3 hours per week of Regional Manager inspection and operational overhead.",
            "expected_direction_of_impact": "Direct reduction in quarterly growth shortfall and prevention of out-of-stocks",
            "quantified_impact": "Mitigating 40% of the predicted shortfall in the top 50 revenue-at-risk stores protects ~€2.5M in quarterly revenue.",
            "estimated_cost": "Internal operational time; zero software license cost using existing model outputs.",
            "required_resources": "VP Retail Operations, 12 Regional Sales Directors, BI Reporting Team",
            "suggested_owner": "VP Retail Operations",
            "suggested_timeline": "30 Days (Immediate implementation for Q3 2015)",
            "implementation_steps": [
                "Phase 1 (Days 1–7): Distribute the Q3 2015 risk list ranked by euros at risk to Regional Directors.",
                "Phase 2 (Days 8–20): Conduct virtual deep-dives for the top 50 revenue-at-risk stores with store managers.",
                "Phase 3 (Days 21–30): Adjust promotional scheduling and safety stock for stores facing high prior-year base comps."
            ],
            "success_metric": "Reduce actual Q3 shortfall of flagged stores by >=40% relative to baseline expectation",
            "follow_up_plan": "Bi-weekly sales check against Model A forecasts and monthly comp growth reviews.",
            "assumptions_and_limitations": "Model identifies statistical vulnerability, not guaranteed failure; managerial intervention must be collaborative, not punitive."
        },
        {
            "id": "rec-3",
            "title": "Assortment Expansion in High-Density Basic Stores",
            "category": "Opportunity",
            "urgency": "Medium",
            "priority": "High",
            "evidence_strength": "High",
            "business_problem": "Stores operating basic assortment 'a' lag in growth (+1.3%–3.9% YoY) and represent the lowest-scoring formats in competitive environments (expansion score -1.26).",
            "supporting_evidence": "Extended assortment 'c' stores achieve 4.4%–7.0% YoY growth and command the #1 expansion score (+1.16). Basic stores with nearby competitors suffer high churn to rival drugstores.",
            "affected_stores": "45 high-density urban stores currently operating Assortment 'a' with >400 sqm floor space",
            "potential_causes": [
                "Historical legacy layout not modernized",
                "Perceived lack of space or inventory working capital"
            ],
            "recommended_action": "Upgrade 45 basic assortment stores to extended assortment 'c', adding high-margin health, beauty, and organic personal care SKUs.",
            "alternative_actions": [
                "Option B: Keep basic assortment and compete purely on price (Low-margin race to bottom)"
            ],
            "trade_offs": "One-off inventory working capital commitment and 2-day store re-merchandising disruption.",
            "expected_direction_of_impact": "Sustained increase in visit frequency, customer retention, and average basket spend",
            "quantified_impact": "Projected +3.5% to +5.0% annual comp sales lift per converted store (~€35,000–€55,000 per store/year).",
            "estimated_cost": "€8,000–€12,000 initial fixture and display setup per store (~€450K total capital)",
            "required_resources": "Head of Category Management, Store Merchandising Operations, Supply Chain Logistics",
            "suggested_owner": "Head of Merchandising",
            "suggested_timeline": "90 Days (Wave 1: 15 stores; Wave 2: 30 stores)",
            "implementation_steps": [
                "Phase 1 (Days 1–30): Select 45 candidate stores based on floor layout and supply chain access.",
                "Phase 2 (Days 31–60): Execute modular fixture conversions during overnight off-hours.",
                "Phase 3 (Days 61–90): Monitor initial category sales velocity and replenish high-demand SKUs."
            ],
            "success_metric": "Achieve +4.5% YoY sales growth in converted stores within 90 days post-launch",
            "follow_up_plan": "Quarterly category margin and inventory turns audit comparing test stores to non-converted peers.",
            "assumptions_and_limitations": "Dependent on warehouse logistics ability to service extended SKU catalogue without transit delays."
        },
        {
            "id": "rec-4",
            "title": "Promo2 Continuous Discount Restructuring & Pilot Audit",
            "category": "Test First",
            "urgency": "Medium",
            "priority": "Medium",
            "evidence_strength": "Medium",
            "business_problem": "Promo2 covers 61% of bottom-tier stores and 560 stores total, yet analysis reveals zero significant footfall lift in chronic underperformers. Promo2 has become an ineffective operational subsidy.",
            "supporting_evidence": "Promo2 stores have lower median YoY growth (+1.2% in bottom tier) and exhibit higher risk rates than non-participating peers of identical format.",
            "affected_stores": "Cohort of 30 bottom-tier stores running Promo2 in South/Central divisions",
            "potential_causes": [
                "Consumer coupon exhaustion and lack of novelty",
                "Participating brands overlap with standard weekly supplier promos (Promo 1)"
            ],
            "recommended_action": "Execute a 6-week controlled pause of Promo2 across 30 test stores; measure gross margin impact and footfall changes against a matched control group.",
            "alternative_actions": [
                "Option B: Immediate chain-wide cancellation (Unnecessary risk without controlled validation)"
            ],
            "trade_offs": "Potential minor temporary dip in coupon shopper volume; opportunity to recover 120–180 bps in gross margin.",
            "expected_direction_of_impact": "Margin expansion with negligible net sales drop",
            "quantified_impact": "If margin improves by 1.5% with <1% sales drop, estimated net profit gain is €450,000+ across test stores annualized.",
            "estimated_cost": "Zero cost; savings in printed circular materials and vendor rebate administration.",
            "required_resources": "Pricing Analytics Team, Trade Marketing Manager, Regional Operations",
            "suggested_owner": "Marketing Analytics Director",
            "suggested_timeline": "45 Days (A/B Test Run & Evaluation)",
            "implementation_steps": [
                "Phase 1 (Days 1–10): Match 30 test stores with 30 control stores on sales volume and demographics.",
                "Phase 2 (Days 11–35): Pause circular coupon distribution in test stores while maintaining standard Promo 1.",
                "Phase 3 (Days 36–45): Evaluate customer retention, transaction count, and gross margin differential."
            ],
            "success_metric": "Maintain >=99% sales volume while recovering >=100 bps in gross margin",
            "follow_up_plan": "Present formal findings to Executive Committee for chain-wide policy decision.",
            "assumptions_and_limitations": "Ensure competitive environment in test zones remains stable during the 6-week test period."
        },
        {
            "id": "rec-5",
            "title": "Defensive Playbook for New Competitor Openings",
            "category": "Monitor",
            "urgency": "Medium",
            "priority": "Medium",
            "evidence_strength": "High",
            "business_problem": "While proximity to established competitors is healthy (prime commercial zones), competitor openings within the last 12 months trigger an acute -3.5% to -8.0% sales drop during months 1–6.",
            "supporting_evidence": "Historical store panel data demonstrates severe vulnerability when CompetitionOpenSince is recent, with customer counts dropping 5-10% during the competitor launch quarter.",
            "affected_stores": "All stores with competitors opening in the next 1–2 quarters (~40 stores annually)",
            "potential_causes": [
                "Competitor introductory promotional blitz",
                "Customer curiosity to sample new retail formats"
            ],
            "recommended_action": "Establish an automated 60-day competitor opening trigger in the POS/BI system to execute a pre-emptive loyalty reward, temporary price-match guarantee, and customer VIP event 14 days before rival opening.",
            "alternative_actions": [
                "Option B: Ignore rival opening and rely on brand habit (Historically yields 5-8% revenue loss)"
            ],
            "trade_offs": "Requires tactical localized discount funding for 30 days.",
            "expected_direction_of_impact": "Customer retention and churn mitigation",
            "quantified_impact": "Protecting 50% of the typical opening-loss preserves ~€25,000–€40,000 per affected store.",
            "estimated_cost": "€3,000 per opening event in targeted promotional collateral and loyalty bonuses.",
            "required_resources": "Regional Marketing Specialist, Store Managers",
            "suggested_owner": "Head of Field Operations",
            "suggested_timeline": "Ongoing (Quarterly review)",
            "implementation_steps": [
                "Phase 1: Maintain active municipal planning permit log to detect competitor openings 90 days in advance.",
                "Phase 2: Launch localized 'Welcome Back / Loyalty Double Points' 14 days prior to competitor ribbon cutting.",
                "Phase 3: Track customer retention index for 6 months post-opening."
            ],
            "success_metric": "Limit store sales erosion to <2.5% in the first 90 days after competitor opening",
            "follow_up_plan": "Monthly tracking of customer churn and transaction frequency.",
            "assumptions_and_limitations": "Requires accurate tracking of competitor commercial registration dates."
        }
    ]
    
    return {
        "total_recommendations": len(recommendations),
        "categories": ["Act Now", "Investigate", "Test First", "Opportunity", "Monitor"],
        "items": recommendations
    }
