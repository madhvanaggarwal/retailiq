import {
  OverviewKPIs,
  DailyTrendItem,
  TierSummary,
  StoreListItem,
  StoreDetail,
  DiagnosticFinding,
  RecommendationItem,
  ActionItem,
  ConsultantAnswer
} from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '') + '/api';
export const api = {
  // 1. Health
  async getHealth(): Promise<{ status: string; service: string }> {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // 2. Executive Overview
  async getOverview(): Promise<{
    kpis: OverviewKPIs;
    daily_trend: DailyTrendItem[];
    tiers: TierSummary[];
    top_risk_stores: any[];
    executive_recommendations: any[];
  }> {
    const res = await fetch(`${API_BASE}/overview`);
    return res.json();
  },

  // 3. Stores
  async getStores(params: {
    search?: string;
    store_type?: string;
    assortment?: string;
    tier?: string;
    flag?: string;
    promo2?: string;
    sort_by?: string;
    sort_dir?: string;
    page?: number;
    page_size?: number;
  }): Promise<{
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    items: StoreListItem[];
  }> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.store_type && params.store_type !== 'All') query.set('store_type', params.store_type);
    if (params.assortment && params.assortment !== 'All') query.set('assortment', params.assortment);
    if (params.tier && params.tier !== 'All') query.set('tier', params.tier);
    if (params.flag && params.flag !== 'All') query.set('flag', params.flag);
    if (params.promo2 && params.promo2 !== 'All') query.set('promo2', params.promo2);
    if (params.sort_by) query.set('sort_by', params.sort_by);
    if (params.sort_dir) query.set('sort_dir', params.sort_dir);
    if (params.page) query.set('page', String(params.page));
    if (params.page_size) query.set('page_size', String(params.page_size));

    const res = await fetch(`${API_BASE}/stores?${query.toString()}`);
    return res.json();
  },

  async getStoreDetail(storeId: number): Promise<StoreDetail> {
    const res = await fetch(`${API_BASE}/stores/${storeId}`);
    if (!res.ok) throw new Error(`Store #${storeId} not found`);
    return res.json();
  },

  // 4. Forecast
  async getForecastOverview(): Promise<{
    holdout_period: string;
    models_comparison: Array<{
      model_name: string;
      rmse: number;
      mape: number;
      r2: number;
      rmspe: number;
    }>;
    best_model: any;
    daily_aggregate: Array<{
      date: string;
      actual_m: number;
      forecast_m: number;
      error_m: number;
    }>;
  }> {
    const res = await fetch(`${API_BASE}/forecast/overview`);
    return res.json();
  },

  async getStoreForecast(storeId: number, aggregation: 'daily' | 'weekly' = 'daily'): Promise<{
    store_id: number;
    aggregation: string;
    metrics: {
      rmse: number;
      mape: number;
      total_actual: number;
      total_forecast: number;
      total_baseline: number;
      variance_pct: number;
    };
    items: Array<{
      period: string;
      sales: number;
      forecast: number;
      baseline: number;
      promo?: number;
      school_holiday?: number;
      promo_share?: number;
    }>;
  }> {
    const res = await fetch(`${API_BASE}/forecast/store/${storeId}?aggregation=${aggregation}`);
    return res.json();
  },

  async getForecastMovers(): Promise<{
    top_gainers: any[];
    top_decliners: any[];
  }> {
    const res = await fetch(`${API_BASE}/forecast/movers`);
    return res.json();
  },

  // 5. Diagnosis
  async getDiagnosis(): Promise<{
    summary: string;
    findings: DiagnosticFinding[];
  }> {
    const res = await fetch(`${API_BASE}/diagnosis`);
    return res.json();
  },

  // 6. Recommendations
  async getRecommendations(): Promise<{
    total_recommendations: number;
    categories: string[];
    items: RecommendationItem[];
  }> {
    const res = await fetch(`${API_BASE}/recommendations`);
    return res.json();
  },

  // 7. Simulator
  async runSimulation(payload: {
    target_type: string;
    target_id: string;
    weeks: number;
    growth_rate: number;
    promo_policy: string;
    basket_shift: number;
  }): Promise<{
    scenario_summary: {
      target_type: string;
      target_id: string;
      horizon_weeks: number;
      growth_assumption_pct: number;
      promo_policy: string;
      basket_shift_pct: number;
      total_baseline_forecast: number;
      total_simulated_sales: number;
      net_revenue_impact_euros: number;
      net_impact_pct: number;
      stores_affected: number;
    };
    chart_data: Array<{
      date: string;
      actual: number;
      baseline_model_forecast: number;
      simulated_forecast: number;
    }>;
    methodology_caveats: string[];
  }> {
    const res = await fetch(`${API_BASE}/simulator/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // 8. Action Tracker
  async getActions(filter?: { status?: string; priority?: string; category?: string }): Promise<ActionItem[]> {
    const query = new URLSearchParams();
    if (filter?.status) query.set('status', filter.status);
    if (filter?.priority) query.set('priority', filter.priority);
    if (filter?.category) query.set('category', filter.category);
    const res = await fetch(`${API_BASE}/actions?${query.toString()}`);
    return res.json();
  },

  async createAction(payload: Partial<ActionItem>): Promise<ActionItem> {
    const res = await fetch(`${API_BASE}/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async updateAction(id: number, payload: Partial<ActionItem>): Promise<ActionItem> {
    const res = await fetch(`${API_BASE}/actions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async deleteAction(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/actions/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // 9. Reports
  async getExecutiveReport(): Promise<any> {
    const res = await fetch(`${API_BASE}/reports/executive`);
    return res.json();
  },

  // 10. Consultant
  async askConsultant(query: string): Promise<ConsultantAnswer> {
    const res = await fetch(`${API_BASE}/consultant/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    if (!res.ok) {
      let errorMsg = `Server returned status ${res.status}`;
      try {
        const errJson = await res.json();
        if (errJson && errJson.detail) {
          errorMsg = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
        }
      } catch (_) {}
      throw new Error(errorMsg);
    }
    return res.json();
  },

  // 11. Methodology & Quality
  async getMethodology(): Promise<any> {
    const res = await fetch(`${API_BASE}/quality`);
    return res.json();
  }
};
