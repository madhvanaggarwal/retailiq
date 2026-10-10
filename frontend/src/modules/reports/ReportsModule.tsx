import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Printer,
  Download,
  FileText,
  ShieldCheck,
  Calendar,
  UserCheck,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Store
} from 'lucide-react';

export const ReportsModule: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getExecutiveReport().then((res) => {
      setReport(res);
      setLoading(false);
    });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const downloadRiskCSV = () => {
    if (!report || !report.top_revenue_at_risk) return;
    const headers = ['Store', 'Tier', 'StoreType', 'Assortment', 'RiskProbability', 'Q2Revenue', 'RevenueAtRisk'];
    const rows = report.top_revenue_at_risk.map((r: any) => [
      r.store_id,
      r.tier,
      r.store_type,
      r.assortment,
      r.risk_probability,
      r.q2_revenue,
      r.revenue_at_risk
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: any[]) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'rossmann_store_risk_q3_2015.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadExpansionCSV = () => {
    if (!report || !report.expansion_profiles) return;
    const headers = ['Profile', 'Stores', 'AvgDailySales', 'YoYGrowthH1', 'SalesPerCust', 'AvgRisk', 'ExpansionScore'];
    const rows = report.expansion_profiles.map((r: any) => [
      `"${r.profile}"`,
      r.stores,
      r.avg_daily_sales,
      r.yoy_growth_h1,
      r.sales_per_customer,
      r.avg_risk,
      r.expansion_score
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: any[]) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'rossmann_expansion_scores.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !report) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand-700 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-500 font-medium">Generating executive report brief...</span>
        </div>
      </div>
    );
  }

  const { metadata = report.report_metadata, kpi_scorecard, tiers, forecast_benchmarks, top_revenue_at_risk, expansion_profiles, recommendations, action_items, scope_and_limitations } = report;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Action Controls Banner (Hidden during print) */}
      <div className="no-print bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200 uppercase tracking-wider">
            C-Suite Consulting Deliverable
          </span>
          <h3 className="text-lg font-bold text-navy-900 mt-1">Executive Consulting Report Brief</h3>
          <p className="text-xs text-slate-500">
            Formatted for board presentations, executive committee reviews, and offline PDF archiving.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={downloadRiskCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Risk CSV</span>
          </button>
          <button
            onClick={downloadExpansionCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Expansion CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Consulting Deliverable Document Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 shadow-sm space-y-8 text-slate-800">
        {/* Document Header */}
        <div className="border-b-2 border-brand-700 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-extrabold text-brand-800 tracking-wider text-xl uppercase">
                Retail<span className="text-navy-900">IQ</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">| Rossmann Engagement</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight leading-tight">
              {metadata.title}
            </h1>
            <p className="text-sm font-medium text-slate-600 mt-1">{metadata.subtitle}</p>
          </div>

          <div className="text-xs text-slate-500 text-left md:text-right space-y-1">
            <div>
              <strong className="text-navy-900">Authors:</strong> {metadata.authors}
            </div>
            <div>
              <strong className="text-navy-900">Coverage:</strong> {metadata.total_stores_analyzed} Drugstores
            </div>
            <div>
              <strong className="text-navy-900">Timeline:</strong> {metadata.reporting_period}
            </div>
          </div>
        </div>

        {/* Section 1: Executive Summary & Headline Scorecard */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-navy-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
            <span>1. Executive Scorecard & Performance Summary</span>
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            The chain operates 1,115 stores generating strong baseline revenue, but exhibits severe footfall polarization: top-tier stores generate 2.22x more revenue than bottom-tier stores through 2.21x higher customer counts (1,117 vs 504 daily shoppers), while customer spend is almost identical (€9.60 vs €9.20). Model B flags 306 stores with high risk of quarterly underperformance, representing €10.0M of probability-weighted quarterly revenue at risk in Q3 2015.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 uppercase text-[10px] font-semibold block">Total Estate</span>
              <span className="text-lg font-bold text-navy-900">{kpi_scorecard.total_stores} Stores</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 uppercase text-[10px] font-semibold block">Q3 Revenue at Risk</span>
              <span className="text-lg font-bold text-rose-700">€{kpi_scorecard.revenue_at_risk_m}M</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 uppercase text-[10px] font-semibold block">Forecast Accuracy (MAPE)</span>
              <span className="text-lg font-bold text-emerald-700">{kpi_scorecard.forecast_mape}%</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 uppercase text-[10px] font-semibold block">Footfall Disparity</span>
              <span className="text-lg font-bold text-brand-700">{kpi_scorecard.traffic_gap_multiplier}x</span>
            </div>
          </div>
        </div>

        {/* Section 2: Performance Tiers Breakdown Table */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-navy-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            2. Estate Performance Tiers (Footfall vs. Basket Disparity)
          </h2>
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Performance Tier</th>
                <th className="py-2.5 px-3">Stores</th>
                <th className="py-2.5 px-3">Daily Sales</th>
                <th className="py-2.5 px-3">Daily Footfall</th>
                <th className="py-2.5 px-3">Spend / Customer</th>
                <th className="py-2.5 px-3">Median Growth</th>
                <th className="py-2.5 px-3">Promo2 Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tiers.map((t: any) => (
                <tr key={t.tier}>
                  <td className="py-2.5 px-3 font-bold text-navy-900">{t.tier}</td>
                  <td className="py-2.5 px-3">{t.stores_count}</td>
                  <td className="py-2.5 px-3 font-medium">€{t.avg_daily_sales.toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-bold text-brand-700">{t.avg_daily_customers} shoppers</td>
                  <td className="py-2.5 px-3">€{t.avg_spend_per_customer.toFixed(2)}</td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-700">{t.yoy_growth_median}</td>
                  <td className="py-2.5 px-3">{t.promo2_share}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 3: Model Benchmarks & Forecasting Accuracies */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-navy-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            3. Model A (Forecast) & Model B (Risk Classifier) Benchmarks
          </h2>
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Model Engine</th>
                <th className="py-2.5 px-3">RMSE (€ / store-day)</th>
                <th className="py-2.5 px-3">MAPE (%)</th>
                <th className="py-2.5 px-3">R² Score</th>
                <th className="py-2.5 px-3">RMSPE (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {forecast_benchmarks.map((m: any, idx: number) => (
                <tr key={m.model_name} className={idx === 2 ? 'bg-teal-50/40 font-bold' : ''}>
                  <td className="py-2.5 px-3 text-navy-900">{m.model_name}</td>
                  <td className="py-2.5 px-3">€{m.rmse.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-brand-700">{m.mape.toFixed(2)}%</td>
                  <td className="py-2.5 px-3">{m.r2.toFixed(3)}</td>
                  <td className="py-2.5 px-3">{m.rmspe.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 4: Top Revenue-at-Risk Stores */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-navy-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            4. Priority Risk List (Top 10 of 306 Flagged Stores)
          </h2>
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Store ID</th>
                <th className="py-2.5 px-3">Format</th>
                <th className="py-2.5 px-3">Tier</th>
                <th className="py-2.5 px-3">Risk Probability</th>
                <th className="py-2.5 px-3">Q2 2015 Revenue</th>
                <th className="py-2.5 px-3">Revenue at Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {top_revenue_at_risk.map((s: any) => (
                <tr key={s.store_id}>
                  <td className="py-2.5 px-3 font-bold text-navy-900">Store #{s.store_id}</td>
                  <td className="py-2.5 px-3">Type {s.store_type} • Asst {s.assortment}</td>
                  <td className="py-2.5 px-3">{s.tier}</td>
                  <td className="py-2.5 px-3 font-bold text-rose-700">{s.risk_probability}%</td>
                  <td className="py-2.5 px-3">€{s.q2_revenue.toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-bold text-rose-700">€{s.revenue_at_risk.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 5: Strategic Recommendations */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-navy-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            5. Executive Strategic Recommendations
          </h2>
          <div className="space-y-3">
            {recommendations.slice(0, 3).map((r: any, idx: number) => (
              <div key={r.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-navy-900 text-sm">
                    {idx + 1}. {r.title}
                  </span>
                  <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                    {r.urgency} Urgency • {r.category}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">{r.recommended_action}</p>
                <div className="flex flex-wrap justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-200">
                  <span><strong>Owner:</strong> {r.suggested_owner}</span>
                  <span><strong>Timeline:</strong> {r.suggested_timeline}</span>
                  <span><strong>Impact:</strong> {r.quantified_impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: Action Tracker Live Status */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-navy-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            6. Milestone Governance & Action Tracker Status
          </h2>
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Initiative</th>
                <th className="py-2.5 px-3">Owner</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Target Metric</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {action_items.map((act: any) => (
                <tr key={act.id}>
                  <td className="py-2.5 px-3 font-bold text-navy-900">{act.title}</td>
                  <td className="py-2.5 px-3">{act.assigned_owner}</td>
                  <td className="py-2.5 px-3 font-semibold">{act.status}</td>
                  <td className="py-2.5 px-3 font-mono">{act.due_date}</td>
                  <td className="py-2.5 px-3 text-slate-600">{act.target_metric || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 7: Scope, Assumptions & Limitations */}
        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
          <h3 className="font-bold text-navy-900 uppercase tracking-wider text-[11px]">
            7. Engagement Scope, Assumptions & Limitations
          </h3>
          <ul className="text-slate-600 space-y-1 list-disc list-inside leading-relaxed text-[11px]">
            {scope_and_limitations.map((l: string, idx: number) => (
              <li key={idx}>{l}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
