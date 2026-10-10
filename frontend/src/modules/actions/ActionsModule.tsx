import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ActionItem } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import {
  CheckSquare,
  Plus,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  User,
  Target,
  Download,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const ActionsModule: React.FC = () => {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<Partial<ActionItem> | null>(null);
  const [saving, setSaving] = useState(false);

  const loadActions = () => {
    setLoading(true);
    api.getActions({
      status: filterStatus,
      priority: filterPriority,
      category: filterCategory,
    }).then((res) => {
      setActions(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadActions();
  }, [filterStatus, filterPriority, filterCategory]);

  const handleOpenNewModal = () => {
    setEditingAction({
      title: '',
      category: 'Traffic & Marketing',
      priority: 'Medium',
      status: 'In Progress',
      assigned_owner: '',
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      affected_stores: '',
      baseline_metric: '',
      target_metric: '',
      actual_outcome: '',
      notes: '',
      lessons_learned: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (act: ActionItem) => {
    setEditingAction({ ...act });
    setIsModalOpen(true);
  };

  const handleSaveAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAction || !editingAction.title) return;
    setSaving(true);

    try {
      if (editingAction.id) {
        await api.updateAction(editingAction.id, editingAction);
      } else {
        await api.createAction(editingAction);
      }
      setIsModalOpen(false);
      setEditingAction(null);
      loadActions();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAction = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this action item?')) {
      await api.deleteAction(id);
      loadActions();
    }
  };

  const downloadCSV = () => {
    if (!actions.length) return;
    const headers = ['ID', 'Title', 'Category', 'Priority', 'Status', 'Owner', 'DueDate', 'AffectedStores', 'Baseline', 'Target', 'Outcome'];
    const rows = actions.map((a) => [
      a.id,
      `"${a.title.replace(/"/g, '""')}"`,
      a.category,
      a.priority,
      a.status,
      `"${a.assigned_owner}"`,
      a.due_date,
      `"${(a.affected_stores || '').replace(/"/g, '""')}"`,
      `"${(a.baseline_metric || '').replace(/"/g, '""')}"`,
      `"${(a.target_metric || '').replace(/"/g, '""')}"`,
      `"${(a.actual_outcome || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'retailiq_action_tracker.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-200">
              Persistent Storage (SQLite)
            </span>
            <span className="text-xs text-slate-400">Live Strategy Execution</span>
          </div>
          <h3 className="text-lg font-bold text-navy-900">
            Management Action Tracker & Milestone Governance
          </h3>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed mt-0.5">
            Assign executive owners, monitor milestone deliverables, record empirical outcome deltas, and document operational lessons learned.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={downloadCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenNewModal}
            className="px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Action Initiative</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase text-[10px] tracking-wider mr-2">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* Status */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="All">All Statuses</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Pending Approval">Pending Approval</option>
          <option value="Blocked">Blocked</option>
          <option value="Draft">Draft</option>
        </select>

        {/* Priority */}
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="All">All Priorities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {/* Category */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="All">All Categories</option>
          <option value="Traffic & Marketing">Traffic & Marketing</option>
          <option value="Risk Mitigation">Risk Mitigation</option>
          <option value="Assortment & Merchandising">Assortment & Merchandising</option>
          <option value="Operations & Staffing">Operations & Staffing</option>
          <option value="Store Expansion">Store Expansion</option>
        </select>
      </div>

      {/* Actions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Initiative / Action Title</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Assigned Owner</th>
                <th className="py-3 px-3">Due Date</th>
                <th className="py-3 px-3">Scope / Target Metric</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-brand-700 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading persistent action records...</span>
                    </div>
                  </td>
                </tr>
              ) : actions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No matching action items found. Click "+ New Action Initiative" to add one.
                  </td>
                </tr>
              ) : (
                actions.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-navy-900 max-w-xs">
                      <div>{act.title}</div>
                      {act.actual_outcome && (
                        <div className="text-[11px] font-normal text-emerald-700 mt-1 line-clamp-1">
                          ✓ {act.actual_outcome}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-700">{act.category}</span>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge type="priority" value={act.priority} />
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge type="status" value={act.status} />
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800">
                      {act.assigned_owner}
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                      {act.due_date}
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                      {act.target_metric || act.affected_stores || '—'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(act)}
                          className="p-1.5 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit action"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAction(act.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete action"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create / Edit Action */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAction?.id ? `Edit Action #${editingAction.id}` : 'Create Management Action Initiative'}
        subtitle="Saved to persistent database (survives restarts)"
        maxWidth="max-w-2xl"
      >
        {editingAction && (
          <form onSubmit={handleSaveAction} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-navy-900 block mb-1">Initiative Title *</label>
              <input
                type="text"
                required
                value={editingAction.title || ''}
                onChange={(e) => setEditingAction({ ...editingAction, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20"
                placeholder="e.g. Local Footfall Recovery Pilot in South Division"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-navy-900 block mb-1">Category</label>
                <select
                  value={editingAction.category || 'General'}
                  onChange={(e) => setEditingAction({ ...editingAction, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Traffic & Marketing">Traffic & Marketing</option>
                  <option value="Risk Mitigation">Risk Mitigation</option>
                  <option value="Assortment & Merchandising">Assortment & Merchandising</option>
                  <option value="Operations & Staffing">Operations & Staffing</option>
                  <option value="Store Expansion">Store Expansion</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-navy-900 block mb-1">Priority</label>
                <select
                  value={editingAction.priority || 'Medium'}
                  onChange={(e) => setEditingAction({ ...editingAction, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-navy-900 block mb-1">Status</label>
                <select
                  value={editingAction.status || 'In Progress'}
                  onChange={(e) => setEditingAction({ ...editingAction, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Blocked">Blocked</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-navy-900 block mb-1">Assigned Owner *</label>
                <input
                  type="text"
                  required
                  value={editingAction.assigned_owner || ''}
                  onChange={(e) => setEditingAction({ ...editingAction, assigned_owner: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. Chief Commercial Officer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-navy-900 block mb-1">Due Date *</label>
                <input
                  type="date"
                  required
                  value={editingAction.due_date || ''}
                  onChange={(e) => setEditingAction({ ...editingAction, due_date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-navy-900 block mb-1">Affected Stores</label>
                <input
                  type="text"
                  value={editingAction.affected_stores || ''}
                  onChange={(e) => setEditingAction({ ...editingAction, affected_stores: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. Bottom 25% Tier (279 stores)"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-navy-900 block mb-1">Baseline Metric</label>
                <input
                  type="text"
                  value={editingAction.baseline_metric || ''}
                  onChange={(e) => setEditingAction({ ...editingAction, baseline_metric: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. 504 avg daily customers"
                />
              </div>

              <div>
                <label className="font-bold text-navy-900 block mb-1">Target Metric</label>
                <input
                  type="text"
                  value={editingAction.target_metric || ''}
                  onChange={(e) => setEditingAction({ ...editingAction, target_metric: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. +10% daily footfall (~555 customers)"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-navy-900 block mb-1">Actual Outcome / Progress Notes</label>
              <textarea
                rows={2}
                value={editingAction.actual_outcome || ''}
                onChange={(e) => setEditingAction({ ...editingAction, actual_outcome: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="Document observed traffic changes, sales deltas, or phase milestones..."
              />
            </div>

            <div>
              <label className="font-bold text-navy-900 block mb-1">Lessons Learned</label>
              <textarea
                rows={2}
                value={editingAction.lessons_learned || ''}
                onChange={(e) => setEditingAction({ ...editingAction, lessons_learned: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="Key operational takeaways for future quarterly planning..."
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-xl font-bold shadow-sm"
              >
                {saving ? 'Saving...' : editingAction.id ? 'Update Action' : 'Create Action'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
