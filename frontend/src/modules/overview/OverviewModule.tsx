import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { MetricCard } from '../../components/common/MetricCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  TrendingUp,
  AlertTriangle,
  Store,
  Users,
  ShoppingBag,
  Target,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from 'recharts';

interface OverviewModuleProps {
  onSelectStore: (storeId: number) => void;
  onNavigate: (module: any) => void;
}

export const OverviewModule: React.FC<OverviewModuleProps> = ({
  onSelectStore,
  onNavigate,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getOverview().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand-700 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-500 font-medium">Loading executive data...</span>
        </div>
      </div>
    );
  }

  const { kpis, daily_trend, tiers, top_risk_stores, executive_recommendations } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Strategic Callout Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-navy-900 to-brand-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-brand-500/20 text-brand-200 border border-brand-500/30">
              Executive Brief
            </span>
            <span className="text-xs text-slate-300">1,115 Drugstores Analyzed</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Footfall gap is the primary revenue driver; €10.0M at risk in Q3 2015.
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Winning stores outperform through 2.21x customer footfall, not basket size. Model A forecaster achieves 8.03% MAPE; Model B flags 306 stores facing quarterly underperformance.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('diagnosis')}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
          >
            <span>Explore Root Causes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 1. Core Scorecard Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Portfolio Performance Scorecard
          </h3>
          <span className="text-xs text-slate-400">Validated Kaggle Rossmann ML Pipeline</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Analyzed Stores"
            value={kpis.total_stores}
            subValue="Complete drugstore network across Germany"
            icon={Store}
            badge="100% Audited"
          />
          <MetricCard
            title="Q3 2015 Revenue at Risk"
            value={`€${kpis.revenue_at_risk_m}M`}
            subValue={`${kpis.stores_flagged_risk} stores flagged with P(risk) ≥ 50%`}
            trend="-8.2% shortfall"
            trendDirection="down"
            icon={AlertTriangle}
          />
          <MetricCard
            title="Forecast Accuracy (MAPE)"
            value={`${kpis.forecast_mape}%`}
            subValue={`RMSE €${kpis.forecast_rmse} / store-day (R² ${kpis.forecast_r2})`}
            trend="vs 10.8% Baseline"
            trendDirection="up"
            icon={TrendingUp}
          />
          <MetricCard
            title="Traffic Multiplier"
            value={`${kpis.traffic_gap_multiplier}x`}
            subValue="Top vs Bottom daily customer footfall (1,117 vs 504)"
            trend="Basket: 1.04x"
            trendDirection="neutral"
            icon={Users}
          />
        </div>
      </div>

      {/* 2. Charts Section: Daily Sales vs Forecast & Footfall vs Basket */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actual vs Forecast Daily Trend (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <div>
              <h4 className="text-base font-bold text-navy-900">Chain Daily Sales vs Forecast</h4>
              <p className="text-xs text-slate-500">6-Week Held-Out Window (20 Jun – 31 Jul 2015) in € Millions</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                40,282 store-days backtested
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) => val.slice(5)}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(val) => `€${val}M`}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val: number) => [`€${val.toFixed(2)}M`, '']}
                  labelFormatter={(label) => `Date: ${label}`}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="sales_m"
                  name="Actual Sales"
                  stroke="#1E293B"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="forecast_m"
                  name="XGBoost Forecast"
                  stroke="#0D9488"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
            <span>Model captures promotional surges and Sunday closure cycles accurately.</span>
            <button
              onClick={() => onNavigate('forecast')}
              className="text-brand-700 hover:text-brand-800 font-semibold flex items-center gap-1"
            >
              <span>Forecast Explorer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Traffic vs Basket Size Comparison Bar Chart (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-base font-bold text-navy-900">Footfall vs Basket Gap</h4>
              <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded font-semibold border border-brand-200">
                Diagnosis
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Top-tier stores generate 2.22x more revenue driven by footfall (1,117 vs 504 customers). Average spend per customer is nearly identical (€9.60 vs €9.20).
            </p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { tier: 'Top 25%', customers: 1117, spend: 9.6 },
                    { tier: 'Middle 50%', customers: 699, spend: 9.7 },
                    { tier: 'Bottom 25%', customers: 504, spend: 9.2 },
                  ]}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="tier" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="customers" name="Avg Daily Customers" fill="#0B4F5C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
            <span className="font-semibold text-navy-900">Strategic Takeaway: </span>
            Don't discount basket sizes. Focus marketing on local storefront awareness and footfall acquisition.
          </div>
        </div>
      </div>

      {/* 3. Performance Tiers Breakdown */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Store Performance Tiers (1,115 Stores)
            </h3>
            <p className="text-xs text-slate-500">Segmented by average daily sales velocity and customer footfall</p>
          </div>
          <button
            onClick={() => onNavigate('stores')}
            className="text-xs text-brand-700 hover:text-brand-800 font-semibold flex items-center gap-1"
          >
            <span>View All Stores</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tiers.map((t: any) => (
            <div
              key={t.tier}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:border-brand-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <StatusBadge type="tier" value={t.tier} />
                  <span className="text-xs font-semibold text-slate-500">{t.stores_count} Stores</span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Avg Daily Sales</span>
                    <span className="font-bold text-navy-900">€{t.avg_daily_sales.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Avg Daily Customers</span>
                    <span className="font-bold text-brand-700">{t.avg_daily_customers} shoppers</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Spend per Customer</span>
                    <span className="font-medium text-slate-800">€{t.avg_spend_per_customer.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Median Comp Growth</span>
                    <span className="font-semibold text-emerald-700">{t.yoy_growth_median}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Promo2 Participation</span>
                    <span className="font-medium text-slate-700">{t.promo2_share}</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-snug border-t border-slate-100 pt-3">
                {t.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Priority Attention: Highest Revenue-at-Risk Stores */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-navy-900">Highest Revenue-at-Risk Stores (Q3 2015)</h4>
              <span className="text-xs bg-rose-50 text-rose-700 font-semibold px-2 py-0.5 rounded border border-rose-200">
                Requires Investigation
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Ranked by probability-weighted quarterly revenue at risk (P(risk) × Q2 Revenue × 8.24% shortfall)
            </p>
          </div>
          <button
            onClick={() => onNavigate('stores')}
            className="text-xs text-brand-700 hover:text-brand-800 font-semibold flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Full Risk Ranking (306 Stores)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">Store ID</th>
                <th className="py-2.5 px-3">Format / Assortment</th>
                <th className="py-2.5 px-3">Performance Tier</th>
                <th className="py-2.5 px-3">Risk Probability</th>
                <th className="py-2.5 px-3">Q2 2015 Revenue</th>
                <th className="py-2.5 px-3">Revenue at Risk</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {top_risk_stores.map((s: any) => (
                <tr key={s.store_id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-bold text-navy-900">Store #{s.store_id}</td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-slate-700">Type {s.store_type}</span>
                    <span className="text-slate-400"> • Asst {s.assortment}</span>
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge type="tier" value={s.tier} />
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-rose-700">{s.risk_probability}%</span>
                  </td>
                  <td className="py-3 px-3 text-slate-700">€{s.q2_revenue.toLocaleString()}</td>
                  <td className="py-3 px-3 font-bold text-rose-700">€{s.revenue_at_risk.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onSelectStore(s.store_id)}
                      className="px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50 rounded-lg transition-colors border border-brand-200"
                    >
                      Audit Store
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Prioritized Executive Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Prioritized Management Recommendations
            </h3>
            <p className="text-xs text-slate-500">Core strategic initiatives synthesized from diagnostic and forecast findings</p>
          </div>
          <button
            onClick={() => onNavigate('recommendations')}
            className="text-xs text-brand-700 hover:text-brand-800 font-semibold flex items-center gap-1"
          >
            <span>All Recommendations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {executive_recommendations.map((rec: any) => (
            <div
              key={rec.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <StatusBadge type="priority" value={rec.category} />
                  <span className="text-[11px] font-medium text-slate-500">{rec.urgency} Urgency</span>
                </div>
                <h4 className="text-sm font-bold text-navy-900 mb-1.5">{rec.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{rec.summary}</p>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-500">
                  <span>Owner:</span>
                  <span className="font-medium text-navy-900">{rec.owner}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Impact:</span>
                  <span className="font-semibold text-emerald-700">{rec.impact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
