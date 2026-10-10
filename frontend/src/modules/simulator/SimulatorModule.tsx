import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { MetricCard } from '../../components/common/MetricCard';
import {
  Sliders,
  Play,
  RotateCcw,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Layers,
  Sparkles,
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
  Legend
} from 'recharts';

export const SimulatorModule: React.FC = () => {
  const [targetType, setTargetType] = useState<'store' | 'group'>('group');
  const [targetId, setTargetId] = useState<string>('Bottom 25%');
  const [weeks, setWeeks] = useState<number>(4);
  const [growthRate, setGrowthRate] = useState<number>(0.05); // +5%
  const [basketShift, setBasketShift] = useState<number>(0.0); // 0%
  const [promoPolicy, setPromoPolicy] = useState<string>('baseline');

  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [simulating, setSimulating] = useState(false);

  const executeSimulation = () => {
    setSimulating(true);
    api.runSimulation({
      target_type: targetType,
      target_id: targetId,
      weeks,
      growth_rate: growthRate,
      promo_policy: promoPolicy,
      basket_shift: basketShift,
    }).then((res) => {
      setSimulationResult(res);
      setSimulating(false);
    });
  };

  useEffect(() => {
    executeSimulation();
  }, []);

  const resetDefaults = () => {
    setTargetType('group');
    setTargetId('Bottom 25%');
    setWeeks(4);
    setGrowthRate(0.05);
    setBasketShift(0.0);
    setPromoPolicy('baseline');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="p-2 bg-teal-50 text-brand-700 rounded-xl border border-teal-200">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-navy-900">What-If Retail Scenario Simulator</h3>
            <p className="text-xs text-slate-500">
              Stress-test footfall initiatives, promotion calendar policies, and basket growth against XGBoost Model A baselines
            </p>
          </div>
        </div>
      </div>

      {/* Simulator Control Panel */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Scenario Parameter Setup</h4>
          <button
            onClick={resetDefaults}
            className="text-xs text-slate-500 hover:text-navy-900 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Target Estate Selection */}
          <div className="space-y-3">
            <label className="font-bold text-navy-900 block">Target Store / Cohort</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setTargetType('group'); setTargetId('Bottom 25%'); }}
                className={`flex-1 py-1.5 rounded-xl border font-semibold transition-all ${
                  targetType === 'group'
                    ? 'bg-brand-50 border-brand-300 text-brand-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Store Cohort
              </button>
              <button
                type="button"
                onClick={() => { setTargetType('store'); setTargetId('1'); }}
                className={`flex-1 py-1.5 rounded-xl border font-semibold transition-all ${
                  targetType === 'store'
                    ? 'bg-brand-50 border-brand-300 text-brand-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Single Store
              </button>
            </div>

            {targetType === 'group' ? (
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-navy-900 font-medium focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="Bottom 25%">Bottom 25% Tier (279 Stores)</option>
                <option value="Middle 50%">Middle 50% Tier (557 Stores)</option>
                <option value="Top 25%">Top 25% Tier (279 Stores)</option>
                <option value="Promo2">Promo2 Active Estate (560 Stores)</option>
                <option value="All">All Stores (1,115 Stores)</option>
              </select>
            ) : (
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-navy-900 font-medium focus:ring-2 focus:ring-brand-500/20"
              >
                {[1, 2, 3, 4, 5, 261, 262, 383, 788, 817, 1014].map((id) => (
                  <option key={id} value={String(id)}>
                    Store #{id} {id === 817 ? '(Top Risk Store)' : ''}
                  </option>
                ))}
              </select>
            )}

            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">Forecast Horizon:</span>
                <span className="font-bold text-navy-900">{weeks} Weeks</span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={weeks}
                onChange={(e) => setWeeks(Number(e.target.value))}
                className="w-full accent-brand-700 cursor-pointer"
              />
            </div>
          </div>

          {/* Growth & Footfall Slider */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-navy-900 font-bold">Footfall / Sales Growth Assumption:</span>
                <span className={`font-bold ${growthRate > 0 ? 'text-emerald-700' : growthRate < 0 ? 'text-rose-700' : 'text-slate-700'}`}>
                  {growthRate > 0 ? `+${(growthRate * 100).toFixed(0)}%` : `${(growthRate * 100).toFixed(0)}%`}
                </span>
              </div>
              <input
                type="range"
                min="-0.20"
                max="0.20"
                step="0.01"
                value={growthRate}
                onChange={(e) => setGrowthRate(Number(e.target.value))}
                className="w-full accent-brand-700 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 block">
                Simulate marketing lift or local economic contraction (-20% to +20%)
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-navy-900 font-bold">Basket Spend Shift:</span>
                <span className="font-bold text-navy-900">
                  {basketShift > 0 ? `+${(basketShift * 100).toFixed(0)}%` : `${(basketShift * 100).toFixed(0)}%`}
                </span>
              </div>
              <input
                type="range"
                min="-0.10"
                max="0.10"
                step="0.01"
                value={basketShift}
                onChange={(e) => setBasketShift(Number(e.target.value))}
                className="w-full accent-brand-700 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 block">
                Simulate cross-sell / merchandising basket adjustment (-10% to +10%)
              </span>
            </div>
          </div>

          {/* Promotional Strategy Selector */}
          <div className="space-y-3">
            <label className="font-bold text-navy-900 block">Promotional Schedule Assumption</label>
            <div className="space-y-2">
              <label
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  promoPolicy === 'baseline'
                    ? 'bg-brand-50/70 border-brand-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="promoPolicy"
                  value="baseline"
                  checked={promoPolicy === 'baseline'}
                  onChange={() => setPromoPolicy('baseline')}
                  className="mt-0.5 accent-brand-700"
                />
                <div>
                  <span className="font-bold text-navy-900 block">Historical Baseline</span>
                  <span className="text-[11px] text-slate-500">Maintain standard weekly promotional rhythm.</span>
                </div>
              </label>

              <label
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  promoPolicy === 'boost_promo'
                    ? 'bg-brand-50/70 border-brand-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="promoPolicy"
                  value="boost_promo"
                  checked={promoPolicy === 'boost_promo'}
                  onChange={() => setPromoPolicy('boost_promo')}
                  className="mt-0.5 accent-brand-700"
                />
                <div>
                  <span className="font-bold text-navy-900 block">Intensified Promo (+20% Lift)</span>
                  <span className="text-[11px] text-slate-500">Apply promotional uplift to non-promo days.</span>
                </div>
              </label>

              <label
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  promoPolicy === 'reduce_promo'
                    ? 'bg-brand-50/70 border-brand-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="promoPolicy"
                  value="reduce_promo"
                  checked={promoPolicy === 'reduce_promo'}
                  onChange={() => setPromoPolicy('reduce_promo')}
                  className="mt-0.5 accent-brand-700"
                />
                <div>
                  <span className="font-bold text-navy-900 block">Scaled Back Promo (-18%)</span>
                  <span className="text-[11px] text-slate-500">Reduce promotion days to protect margin.</span>
                </div>
              </label>
            </div>

            <button
              onClick={executeSimulation}
              disabled={simulating}
              className="w-full mt-2 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{simulating ? 'Computing Simulation...' : 'Run Scenario Simulation'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Simulation Results Section */}
      {simulationResult && simulationResult.scenario_summary && (
        <div className="space-y-6">
          {/* Summary Scorecard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricCard
              title="Baseline Model Forecast"
              value={`€${(simulationResult.scenario_summary.total_baseline_forecast / 1000).toFixed(0)}k`}
              subValue={`${simulationResult.scenario_summary.stores_affected} stores audited`}
            />
            <MetricCard
              title="Simulated Total Sales"
              value={`€${(simulationResult.scenario_summary.total_simulated_sales / 1000).toFixed(0)}k`}
              subValue="Projected under scenario inputs"
              trend={`${simulationResult.scenario_summary.net_impact_pct > 0 ? '+' : ''}${simulationResult.scenario_summary.net_impact_pct}%`}
              trendDirection={simulationResult.scenario_summary.net_impact_pct >= 0 ? 'up' : 'down'}
            />
            <MetricCard
              title="Net Revenue Impact"
              value={`€${(simulationResult.scenario_summary.net_revenue_impact_euros / 1000).toFixed(0)}k`}
              subValue="Expected financial delta"
              trend={simulationResult.scenario_summary.net_impact_pct >= 0 ? 'Positive ROI' : 'Negative Delta'}
              trendDirection={simulationResult.scenario_summary.net_impact_pct >= 0 ? 'up' : 'down'}
            />
            <MetricCard
              title="Simulation Scope"
              value={`${simulationResult.scenario_summary.horizon_weeks} Weeks`}
              subValue={`Target: ${simulationResult.scenario_summary.target_id}`}
            />
          </div>

          {/* Time Series Chart: Baseline vs Simulated Projection */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <div>
                <h4 className="text-base font-bold text-navy-900">
                  Scenario Projection: Model Baseline vs Simulated Trajectory
                </h4>
                <p className="text-xs text-slate-500">
                  Daily aggregate comparison over selected {weeks}-week simulation horizon
                </p>
              </div>
              <span className="text-xs font-semibold bg-brand-50 text-brand-700 px-3 py-1 rounded-xl border border-brand-200">
                {simulationResult.scenario_summary.target_id} ({simulationResult.scenario_summary.stores_affected} Stores)
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simulationResult.chart_data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="date"
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
                    labelFormatter={(l) => `Date: ${l}`}
                    contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    name="Actual Historical Sales"
                    stroke="#1E293B"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="baseline_model_forecast"
                    name="Model Baseline Forecast"
                    stroke="#0B4F5C"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="simulated_forecast"
                    name="Simulated Scenario"
                    stroke="#E4572E"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transparent Methodological Caveats */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
            <span className="font-bold text-navy-900 block flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Methodology & Elasticity Assumptions:</span>
            </span>
            <ul className="text-slate-600 space-y-1 list-disc list-inside leading-relaxed text-[11px]">
              {simulationResult.methodology_caveats.map((c: string, idx: number) => (
                <li key={idx}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
