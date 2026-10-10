import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { StoreListItem, StoreDetail } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Store as StoreIcon,
  Users,
  ShoppingBag,
  ExternalLink,
  Download,
  Info
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

interface StoresModuleProps {
  selectedStoreId?: number | null;
  onClearSelectedStore?: () => void;
}

export const StoresModule: React.FC<StoresModuleProps> = ({
  selectedStoreId,
  onClearSelectedStore,
}) => {
  const [stores, setStores] = useState<StoreListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [storeType, setStoreType] = useState('All');
  const [assortment, setAssortment] = useState('All');
  const [tier, setTier] = useState('All');
  const [flag, setFlag] = useState('All');
  const [promo2, setPromo2] = useState('All');
  const [sortBy, setSortBy] = useState('revenue_at_risk');
  const [sortDir, setSortDir] = useState('desc');

  // Modal Detail State
  const [modalStoreId, setModalStoreId] = useState<number | null>(selectedStoreId || null);
  const [storeDetail, setStoreDetail] = useState<StoreDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Load stores list
  const loadStores = () => {
    setLoading(true);
    api.getStores({
      search,
      store_type: storeType,
      assortment,
      tier,
      flag,
      promo2,
      sort_by: sortBy,
      sort_dir: sortDir,
      page,
      page_size: pageSize
    }).then((res) => {
      setStores(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadStores();
  }, [search, storeType, assortment, tier, flag, promo2, sortBy, sortDir, page, pageSize]);

  // Load modal detail if storeId changes
  useEffect(() => {
    if (selectedStoreId) {
      setModalStoreId(selectedStoreId);
    }
  }, [selectedStoreId]);

  useEffect(() => {
    if (modalStoreId) {
      setDetailLoading(true);
      api.getStoreDetail(modalStoreId)
        .then((res) => {
          setStoreDetail(res);
          setDetailLoading(false);
        })
        .catch(() => {
          setStoreDetail(null);
          setDetailLoading(false);
        });
    } else {
      setStoreDetail(null);
    }
  }, [modalStoreId]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
    setPage(1);
  };

  const closeModal = () => {
    setModalStoreId(null);
    if (onClearSelectedStore) onClearSelectedStore();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-navy-900">Chain Store Directory & Benchmarks</h3>
            <p className="text-xs text-slate-500">
              Showing {total.toLocaleString()} stores audited across operational tiers and risk categories
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              Sorted by: <span className="font-semibold text-navy-900">{sortBy.replace(/_/g, ' ')}</span> ({sortDir.toUpperCase()})
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-100">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search Store ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Store Type */}
          <div>
            <select
              value={storeType}
              onChange={(e) => { setStoreType(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="All">All Store Types</option>
              <option value="a">Type a (Urban standard)</option>
              <option value="b">Type b (High-volume star)</option>
              <option value="c">Type c (Competitive)</option>
              <option value="d">Type d (Extended format)</option>
            </select>
          </div>

          {/* Assortment */}
          <div>
            <select
              value={assortment}
              onChange={(e) => { setAssortment(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="All">All Assortments</option>
              <option value="a">Assortment a (Basic)</option>
              <option value="b">Assortment b (Extra)</option>
              <option value="c">Assortment c (Extended)</option>
            </select>
          </div>

          {/* Tier */}
          <div>
            <select
              value={tier}
              onChange={(e) => { setTier(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="All">All Tiers</option>
              <option value="Top 25%">Top 25%</option>
              <option value="Middle 50%">Middle 50%</option>
              <option value="Bottom 25%">Bottom 25%</option>
            </select>
          </div>

          {/* Risk Flag */}
          <div>
            <select
              value={flag}
              onChange={(e) => { setFlag(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="All">All Risk Flags</option>
              <option value="At risk">At risk (306 stores)</option>
              <option value="OK">OK (809 stores)</option>
            </select>
          </div>

          {/* Promo2 */}
          <div>
            <select
              value={promo2}
              onChange={(e) => { setPromo2(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="All">All Promo2 Status</option>
              <option value="1">Promo2 Active</option>
              <option value="0">No Promo2</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stores Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-semibold uppercase tracking-wider">
                <th
                  onClick={() => handleSort('Store')}
                  className="py-3 px-3 cursor-pointer hover:text-navy-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Store ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Format / Asst</th>
                <th className="py-3 px-3">Tier</th>
                <th
                  onClick={() => handleSort('risk_probability')}
                  className="py-3 px-3 cursor-pointer hover:text-navy-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Risk Prob</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('revenue_at_risk')}
                  className="py-3 px-3 cursor-pointer hover:text-navy-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Revenue at Risk</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('StoreMeanSales')}
                  className="py-3 px-3 cursor-pointer hover:text-navy-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Avg Daily Sales</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('StoreMeanCustomers')}
                  className="py-3 px-3 cursor-pointer hover:text-navy-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Daily Customers</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Spend / Cust</th>
                <th className="py-3 px-3">Competitor Dist</th>
                <th className="py-3 px-3">Promo2</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-brand-700 border-t-transparent rounded-full animate-spin"></div>
                      <span>Querying store records...</span>
                    </div>
                  </td>
                </tr>
              ) : stores.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    No matching stores found for selected filters.
                  </td>
                </tr>
              ) : (
                stores.map((s) => (
                  <tr
                    key={s.store_id}
                    onClick={() => setModalStoreId(s.store_id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-bold text-navy-900">
                      Store #{s.store_id}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-700">Type {s.store_type}</span>
                      <span className="text-slate-400"> • Asst {s.assortment}</span>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge type="tier" value={s.tier} />
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-semibold ${s.risk_probability >= 50 ? 'text-rose-700' : 'text-slate-700'}`}>
                        {s.risk_probability}%
                      </span>
                      {s.risk_probability >= 50 && (
                        <span className="ml-1 text-[10px] text-rose-600 bg-rose-50 px-1 py-0.2 rounded font-medium">
                          Flagged
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {s.revenue_at_risk > 0 ? (
                        <span className={s.revenue_at_risk > 50000 ? 'text-rose-700' : 'text-slate-800'}>
                          €{s.revenue_at_risk.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-400">€0</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800">
                      €{s.avg_daily_sales.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-brand-700 font-semibold">
                      {s.avg_daily_customers.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      €{s.sales_per_customer.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {s.competition_distance > 0
                        ? `${(s.competition_distance / 1000).toFixed(1)} km`
                        : 'None'}
                    </td>
                    <td className="py-3 px-3">
                      {s.promo2 === 1 ? (
                        <span className="text-brand-700 font-medium">Yes</span>
                      ) : (
                        <span className="text-slate-400">No</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setModalStoreId(s.store_id)}
                        className="px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50 rounded-lg border border-brand-200 transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500 gap-2">
          <div>
            Showing Page <span className="font-semibold text-navy-900">{page}</span> of{' '}
            <span className="font-semibold text-navy-900">{totalPages}</span> ({total} stores)
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-medium">Page {page}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Single Store Deep Dive Profile */}
      <Modal
        isOpen={modalStoreId !== null}
        onClose={closeModal}
        title={storeDetail ? `Store #${storeDetail.store_id} Performance & Diagnostic Card` : 'Store Audit'}
        subtitle={storeDetail ? `Peer Group: ${storeDetail.peer_group} • Performance Tier: ${storeDetail.tier}` : ''}
        maxWidth="max-w-5xl"
      >
        {detailLoading || !storeDetail ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-3 border-brand-700 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-slate-500">Loading store audit details...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Scorecard */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Avg Daily Sales</span>
                <p className="text-lg font-bold text-navy-900 mt-0.5">€{storeDetail.avg_daily_sales.toLocaleString()}</p>
                <span className="text-[10px] text-slate-500">Peer avg: €{storeDetail.peer_avg_sales.toLocaleString()}</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Daily Customers</span>
                <p className="text-lg font-bold text-brand-700 mt-0.5">{storeDetail.avg_daily_customers.toLocaleString()}</p>
                <span className="text-[10px] text-slate-500">Peer avg: {storeDetail.peer_avg_customers.toLocaleString()}</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Spend / Customer</span>
                <p className="text-lg font-bold text-navy-900 mt-0.5">€{storeDetail.sales_per_customer.toFixed(2)}</p>
                <span className="text-[10px] text-slate-500">Peer avg: €{storeDetail.peer_avg_basket.toFixed(2)}</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Revenue at Risk</span>
                <p className={`text-lg font-bold mt-0.5 ${storeDetail.revenue_at_risk > 0 ? 'text-rose-700' : 'text-slate-800'}`}>
                  €{storeDetail.revenue_at_risk.toLocaleString()}
                </p>
                <span className="text-[10px] text-slate-500">Risk Prob: {storeDetail.risk_probability}%</span>
              </div>
            </div>

            {/* Daily Forecast vs Actual Time Series (6-Week Holdout) */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                <div>
                  <h4 className="text-sm font-bold text-navy-900">
                    6-Week Holdout Sales vs Model Forecast (20 Jun – 31 Jul 2015)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    XGBoost Model A Predictions vs Actual Daily Sales vs Historical Baseline Average
                  </p>
                </div>
                {storeDetail.forecast_metrics.mape && (
                  <div className="text-xs bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                    Store MAPE: <span className="font-bold text-navy-900">{storeDetail.forecast_metrics.mape}%</span> • RMSE: €{storeDetail.forecast_metrics.rmse}
                  </div>
                )}
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={storeDetail.daily_history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(val) => val.slice(5)}
                      tick={{ fontSize: 10, fill: '#64748B' }}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(val) => `€${val}`}
                      tick={{ fontSize: 10, fill: '#64748B' }}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(val: number) => [`€${val.toLocaleString()}`, '']}
                      contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      name="Actual Daily Sales"
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
                      name="Historical DOW/Promo Mean"
                      stroke="#94A3B8"
                      strokeWidth={1}
                      strokeDasharray="2 2"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Risk Factors & Recommendations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Risk Diagnostic Factors */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Diagnostic & Risk Drivers (SHAP)</span>
                </h5>
                <div className="space-y-2.5">
                  {storeDetail.risk_factors.map((rf, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-navy-900">{rf.factor}</span>
                        <StatusBadge type="priority" value={rf.severity} />
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">{rf.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Store Specific Recommendations */}
              <div className="bg-teal-50/50 rounded-xl p-4 border border-teal-200/70">
                <h5 className="text-xs font-bold uppercase tracking-wider text-brand-800 mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-brand-700" />
                  <span>Tailored Operational Actions</span>
                </h5>
                <div className="space-y-2.5">
                  {storeDetail.recommendations.map((rc, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-teal-100 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-navy-900">{rc.action}</span>
                        <StatusBadge type="priority" value={rc.priority} />
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">{rc.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
