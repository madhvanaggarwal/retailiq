import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { MetricCard } from '../../components/common/MetricCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  TrendingUp,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  CheckCircle2
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

export const ForecastModule: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [selectedStore, setSelectedStore] = useState<number>(1);
  const [aggregation, setAggregation] = useState<'daily' | 'weekly'>('daily');
  const [storeForecast, setStoreForecast] = useState<any>(null);
  const [movers, setMovers] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getForecastOverview(),
      api.getForecastMovers(),
      api.getStoreForecast(1, 'daily')
    ]).then(([ov, mov, sf]) => {
      setOverview(ov);
      setMovers(mov);
      setStoreForecast(sf);
      setLoading(false);
    });
  }, []);

  const handleStoreChange = (storeId: number) => {
    setSelectedStore(storeId);
    api.getStoreForecast(storeId, aggregation).then((res) => {
      setStoreForecast(res);
    });
  };

  const handleAggregationChange = (agg: 'daily' | 'weekly') => {
    setAggregation(agg);
    api.getStoreForecast(selectedStore, agg).then((res) => {
      setStoreForecast(res);
    });
  };

  const downloadCSV = () => {
    if (!storeForecast || !storeForecast.items.length) return;
    const headers = ['Period', 'ActualSales', 'Forecast', 'Baseline', 'Promo'];
    const rows = storeForecast.items.map((i: any) => [
      i.period,
      i.sales,
      i.forecast,
      i.baseline,
      i.promo !== undefined ? i.promo : i.promo_share
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: any[]) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `store_${selectedStore}_forecast_${aggregation}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !overview) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand-700 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-500 font-medium">Loading forecasting models...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Model Evaluation & Benchmark Comparison */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <h3 className="text-base font-bold text-navy-900">
              Holdout Backtest & Evaluation Benchmarks
            </h3>
            <p className="text-xs text-slate-500">
              Evaluated on 40,282 store-days across all 1,115 stores (20 Jun 2015 – 31 Jul 2015)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-xl font-semibold border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Model A Deployed: XGBoost v2 (Final)</span>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">Model Architecture</th>
                <th className="py-2.5 px-3">RMSE (€ / store-day)</th>
                <th className="py-2.5 px-3">MAPE (%)</th>
                <th className="py-2.5 px-3">R² Score</th>
                <th className="py-2.5 px-3">RMSPE (Kaggle Benchmark)</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {overview.models_comparison.map((m: any, idx: number) => {
                const isFinal = idx === 2;
                return (
                  <tr key={m.model_name} className={isFinal ? 'bg-teal-50/40 font-semibold' : 'hover:bg-slate-50/50'}>
                    <td className="py-3 px-3 text-navy-900">
                      {m.model_name}
                      {isFinal && <span className="ml-2 text-[10px] text-brand-700 font-bold bg-brand-100 px-1.5 py-0.5 rounded">Active Engine</span>}
                    </td>
                    <td className="py-3 px-3 text-slate-800">€{m.rmse.toLocaleString()}</td>
                    <td className="py-3 px-3 text-brand-700 font-bold">{m.mape.toFixed(2)}%</td>
                    <td className="py-3 px-3 text-slate-800">{m.r2.toFixed(3)}</td>
                    <td className="py-3 px-3 text-slate-700">{m.rmspe.toFixed(2)}%</td>
                    <td className="py-3 px-3 text-right">
                      {isFinal ? (
                        <span className="text-xs text-emerald-700 font-semibold">Production</span>
                      ) : (
                        <span className="text-xs text-slate-400">Baseline / Iteration</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Interactive Store Forecast Explorer */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-navy-900">Store-Level Forecast Explorer</h3>
            <p className="text-xs text-slate-500">
              Inspect actual receipts against model forecasts and promotional effects for any store
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Store Picker */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500">Select Store:</label>
              <select
                value={selectedStore}
                onChange={(e) => handleStoreChange(Number(e.target.value))}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 261, 262, 383, 444, 513, 562, 733, 788, 817, 906, 1014, 1018, 1115].map((id) => (
                  <option key={id} value={id}>
                    Store #{id} {id === 817 ? '(Top Risk)' : id === 261 ? '(High Volume)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Aggregation Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => handleAggregationChange('daily')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  aggregation === 'daily'
                    ? 'bg-white text-navy-900 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => handleAggregationChange('weekly')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  aggregation === 'weekly'
                    ? 'bg-white text-navy-900 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                Weekly
              </button>
            </div>

            {/* CSV Download Button */}
            <button
              onClick={downloadCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors border border-slate-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Store Forecast KPIs */}
        {storeForecast && storeForecast.metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Actual Sales</span>
              <p className="text-base font-bold text-navy-900 mt-0.5">
                €{storeForecast.metrics.total_actual.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-500">6-week sum</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Forecasted Sales</span>
              <p className="text-base font-bold text-brand-700 mt-0.5">
                €{storeForecast.metrics.total_forecast.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-500">
                Variance: {storeForecast.metrics.variance_pct > 0 ? '+' : ''}
                {storeForecast.metrics.variance_pct}%
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Historical Baseline</span>
              <p className="text-base font-bold text-slate-800 mt-0.5">
                €{storeForecast.metrics.total_baseline.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-500">Store DOW/Promo average</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Store Error (MAPE)</span>
              <p className="text-base font-bold text-emerald-700 mt-0.5">
                {storeForecast.metrics.mape}%
              </p>
              <span className="text-[10px] text-slate-500">RMSE: €{storeForecast.metrics.rmse}</span>
            </div>
          </div>
        )}

        {/* Store Chart */}
        {storeForecast && (
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={storeForecast.items} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="period"
                  tickFormatter={(val) => val.slice(5)}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(val) => `€${(val / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val: number) => [`€${val.toLocaleString()}`, '']}
                  labelFormatter={(l) => `Period: ${l}`}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="sales"
                  name="Actual Sales"
                  stroke="#1E293B"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  name="XGBoost Forecast"
                  stroke="#0D9488"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="baseline"
                  name="Baseline DOW Average"
                  stroke="#94A3B8"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 3. Top Expected Movers (Gainers & Decliners vs Baseline) */}
      {movers && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Expected Increases */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-sm">
                <ArrowUpRight className="w-4 h-4" />
                <span>Largest Forecast Uplift vs Historical Baseline</span>
              </div>
              <span className="text-[11px] text-slate-400">Top 10 Stores</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {movers.top_gainers.map((g: any) => (
                <div key={g.store_id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-navy-900">Store #{g.store_id}</span>
                    <span className="text-slate-400 ml-2">Type {g.store_type} • {g.tier}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-700">+{g.diff_pct}%</span>
                    <span className="text-slate-400 text-[11px] ml-2">(+€{g.diff_euros.toLocaleString()})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Expected Declines */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-rose-700 font-bold text-sm">
                <ArrowDownRight className="w-4 h-4" />
                <span>Largest Forecast Declines vs Historical Baseline</span>
              </div>
              <span className="text-[11px] text-slate-400">Top 10 Stores</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {movers.top_decliners.map((d: any) => (
                <div key={d.store_id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-navy-900">Store #{d.store_id}</span>
                    <span className="text-slate-400 ml-2">Type {d.store_type} • {d.tier}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-rose-700">{d.diff_pct}%</span>
                    <span className="text-slate-400 text-[11px] ml-2">(€{d.diff_euros.toLocaleString()})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
