import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { RecommendationItem } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Lightbulb,
  CheckCircle2,
  BookmarkPlus,
  Clock,
  UserCheck,
  Target,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface RecommendationsModuleProps {
  onNavigateToActions?: () => void;
}

export const RecommendationsModule: React.FC<RecommendationsModuleProps> = ({
  onNavigateToActions,
}) => {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRecommendations().then((res) => {
      setRecommendations(res.items);
      if (res.items.length > 0) {
        setExpandedId(res.items[0].id);
      }
      setLoading(false);
    });
  }, []);

  const handleSaveToActionTracker = async (rec: RecommendationItem) => {
    try {
      await api.createAction({
        title: rec.title,
        category: rec.category === 'Opportunity' ? 'Store Expansion' : rec.category === 'Act Now' ? 'Traffic & Marketing' : 'Risk Mitigation',
        priority: rec.priority as any,
        status: 'In Progress',
        assigned_owner: rec.suggested_owner,
        due_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        affected_stores: rec.affected_stores,
        baseline_metric: rec.supporting_evidence.slice(0, 100),
        target_metric: rec.success_metric,
        notes: rec.recommended_action
      });
      setSavedSuccessId(rec.id);
      setTimeout(() => setSavedSuccessId(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand-700 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-500 font-medium">Loading consulting recommendations...</span>
        </div>
      </div>
    );
  }

  const categories = ['All', 'Act Now', 'Investigate', 'Opportunity', 'Test First', 'Monitor'];

  const filtered = selectedCategory === 'All'
    ? recommendations
    : recommendations.filter((r) => r.category === selectedCategory);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-200">
              Strategy Roadmap
            </span>
            <span className="text-xs text-slate-400">Validated Decision Logic</span>
          </div>
          <h3 className="text-lg font-bold text-navy-900">
            Consulting Recommendations & Strategic Directives
          </h3>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed mt-0.5">
            Prioritized retail transformation initiatives mapped to empirical calculations, risk probabilities, and owner accountability.
          </p>
        </div>

        {onNavigateToActions && (
          <button
            onClick={onNavigateToActions}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1.5 self-start md:self-auto"
          >
            <span>View Active Tracker</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-brand-700 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recommendations Cards List */}
      <div className="space-y-4">
        {filtered.map((rec) => {
          const isExpanded = expandedId === rec.id;
          const isSaved = savedSuccessId === rec.id;

          return (
            <div
              key={rec.id}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:border-slate-300 transition-all"
            >
              {/* Card Header (Collapsible toggle) */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                className="p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-slate-50/50 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge type="priority" value={rec.category} />
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {rec.urgency} Urgency
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Strength: <strong className="text-slate-600">{rec.evidence_strength}</strong>
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-navy-900 tracking-tight">{rec.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-1">{rec.business_problem}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleSaveToActionTracker(rec)}
                    disabled={isSaved}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                      isSaved
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-white hover:bg-slate-50 text-brand-700 border-brand-200 shadow-sm'
                    }`}
                  >
                    {isSaved ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Saved to Tracker!</span>
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="w-3.5 h-3.5" />
                        <span>Save to Action Tracker</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                  >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Expanded Deep Dive Details */}
              {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-5 text-xs bg-slate-50/30">
                  {/* Problem & Evidence */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-xl border border-slate-200">
                      <span className="font-bold text-navy-900 block mb-1">Business Problem:</span>
                      <p className="text-slate-600 leading-relaxed">{rec.business_problem}</p>
                      <div className="mt-2 text-slate-500">
                        <strong>Affected Estate:</strong> {rec.affected_stores}
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-slate-200">
                      <span className="font-bold text-navy-900 block mb-1">Supporting Data Evidence:</span>
                      <p className="text-slate-600 leading-relaxed">{rec.supporting_evidence}</p>
                    </div>
                  </div>

                  {/* Recommended Action & Trade-offs */}
                  <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-200 space-y-2">
                    <span className="font-bold text-brand-900 text-sm block">Recommended Strategic Action:</span>
                    <p className="text-slate-700 leading-relaxed text-xs">{rec.recommended_action}</p>
                    <div className="text-[11px] text-slate-600 pt-1 border-t border-teal-100 flex flex-wrap gap-4">
                      <span><strong>Trade-offs:</strong> {rec.trade_offs}</span>
                      <span><strong>Expected Impact:</strong> {rec.quantified_impact}</span>
                    </div>
                  </div>

                  {/* 3-Phase Implementation Plan */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2.5">
                    <span className="font-bold text-navy-900 block">Structured Implementation Steps:</span>
                    <div className="space-y-1.5">
                      {rec.implementation_steps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-slate-600 leading-relaxed">
                          <span className="w-4 h-4 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Accountability & Measurement Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Suggested Owner</span>
                      <p className="font-bold text-navy-900 mt-0.5">{rec.suggested_owner}</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Timeline</span>
                      <p className="font-bold text-navy-900 mt-0.5">{rec.suggested_timeline}</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Estimated Cost</span>
                      <p className="font-bold text-navy-900 mt-0.5">{rec.estimated_cost}</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Success Metric</span>
                      <p className="font-bold text-emerald-700 mt-0.5 leading-tight">{rec.success_metric}</p>
                    </div>
                  </div>

                  {/* Limitations Disclaimer */}
                  <div className="text-[11px] text-slate-400 italic">
                    Assumptions & Limitations: {rec.assumptions_and_limitations}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
