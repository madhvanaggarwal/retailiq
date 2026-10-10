export interface OverviewKPIs {
  total_stores: number;
  stores_flagged_risk: number;
  revenue_at_risk_m: number;
  shortfall_pct: number;
  forecast_mape: number;
  forecast_rmse: number;
  forecast_r2: number;
  baseline_mape: number;
  baseline_rmse: number;
  risk_auc: number;
  risk_precision: number;
  risk_recall: number;
  traffic_gap_multiplier: number;
  basket_gap_multiplier: number;
  top_expansion_profile: string;
  reporting_period: string;
  data_freshness: string;
}

export interface DailyTrendItem {
  date: string;
  sales_m: number;
  forecast_m: number;
  error_m: number;
}

export interface TierSummary {
  tier: string;
  stores_count: number;
  avg_daily_customers: number;
  avg_spend_per_customer: number;
  avg_daily_sales: number;
  yoy_growth_median: string;
  promo2_share: string;
  risk_share: string;
  description: string;
}

export interface StoreListItem {
  store_id: number;
  store_type: string;
  assortment: string;
  tier: string;
  flag: string;
  risk_probability: number;
  revenue_at_risk: number;
  q2_revenue: number;
  avg_daily_sales: number;
  avg_daily_customers: number;
  sales_per_customer: number;
  competition_distance: number;
  promo2: number;
  peer_group: string;
}

export interface StoreDetail {
  store_id: number;
  store_type: string;
  assortment: string;
  tier: string;
  flag: string;
  risk_probability: number;
  revenue_at_risk: number;
  q2_revenue: number;
  avg_daily_sales: number;
  avg_daily_customers: number;
  sales_per_customer: number;
  competition_distance: number;
  competition_open_month: number;
  competition_open_year: number;
  promo2: number;
  promo2_since_week: number;
  promo2_since_year: number;
  promo_interval: string;
  peer_group: string;
  peer_avg_sales: number;
  peer_avg_customers: number;
  peer_avg_basket: number;
  forecast_metrics: {
    rmse: number | null;
    mape: number | null;
  };
  daily_history: Array<{
    date: string;
    sales: number;
    forecast: number;
    baseline: number;
    promo: number;
  }>;
  risk_factors: Array<{
    factor: string;
    severity: string;
    detail: string;
  }>;
  recommendations: Array<{
    action: string;
    priority: string;
    description: string;
  }>;
}

export interface DiagnosticFinding {
  id: string;
  title: string;
  business_question: string;
  supporting_evidence: Record<string, any>;
  relevant_stores: string;
  comparison_baseline: string;
  primary_finding: string;
  potential_explanations: string[];
  alternative_explanations: string[];
  suggested_next_investigation: string;
}

export interface RecommendationItem {
  id: string;
  title: string;
  category: string;
  urgency: string;
  priority: string;
  evidence_strength: string;
  business_problem: string;
  supporting_evidence: string;
  affected_stores: string;
  potential_causes: string[];
  recommended_action: string;
  alternative_actions: string[];
  trade_offs: string;
  expected_direction_of_impact: string;
  quantified_impact: string;
  estimated_cost: string;
  required_resources: string;
  suggested_owner: string;
  suggested_timeline: string;
  implementation_steps: string[];
  success_metric: string;
  follow_up_plan: string;
  assumptions_and_limitations: string;
}

export interface ActionItem {
  id: number;
  title: string;
  category: string;
  priority: string;
  status: string;
  assigned_owner: string;
  due_date: string;
  affected_stores?: string;
  baseline_metric?: string;
  target_metric?: string;
  actual_outcome?: string;
  notes?: string;
  lessons_learned?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ConsultantAnswer {
  query: string;
  topic: string;
  executive_takeaway: string;
  evidence_and_metrics: Array<{ label: string; value: string }>;
  detailed_analysis: string;
  strategic_recommendations: string[];
  related_module: string;
  related_module_title: string;
}
