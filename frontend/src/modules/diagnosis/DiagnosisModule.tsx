import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { DiagnosticFinding } from '../../types';
import {
  Stethoscope,
  Users,
  Layers,
  Percent,
  MapPin,
  TrendingDown,
  HelpCircle,
  Search,
  CheckCircle,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export const DiagnosisModule: React.FC = () => {
  const [findings, setFindings] = useState<DiagnosticFinding[]>([]);
  const [selectedId, setSelectedId] = useState<string>('traffic-vs-basket');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDiagnosis().then((res) => {
      setFindings(res.findings);
      if (res.findings.length > 0) {
        setSelectedId(res.findings[0].id);
      }
      setLoading(false);
    });
  }, []);

  if (loading || !findings.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand-700 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-500 font-medium">Loading diagnostic engine...</span>
        </div>
      </div>
    );
  }

  const active = findings.find((f) => f.id === selectedId) || findings[0];

  const icons: Record<string, any> = {
    'traffic-vs-basket': Users,
    'assortment-impact': Layers,
    'promo2-paradox': Percent,
    'competition-proximity': MapPin,
    'base-effect-risk': TrendingDown,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Intro Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-teal-50 text-brand-700 rounded-xl border border-teal-200">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-navy-900">Diagnostic Root-Cause Engine</h3>
            <p className="text-xs text-slate-500">
              Rigorous empirical investigations testing retail performance, customer behavior, and risk drivers
            </p>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Study Selector Navigation (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Diagnostic Studies (5)
          </span>
          {findings.map((f) => {
            const Icon = icons[f.id] || HelpCircle;
            const isSelected = f.id === selectedId;
            return (
              <button
                key={f.id}
                onClick={() => setSelectedId(f.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                  isSelected
                    ? 'bg-brand-50/80 border-brand-300 text-brand-900 shadow-sm'
                    : 'bg-white border-slate-200/80 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    isSelected ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold leading-tight text-navy-900 truncate">{f.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {f.business_question}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Detailed Finding Inspection Card (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-7 shadow-sm space-y-6">
          {/* Header & Question */}
          <div className="border-b border-slate-100 pb-5">
            <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200">
              Empirical Case Study
            </span>
            <h3 className="text-lg font-bold text-navy-900 mt-2">{active.title}</h3>
            <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-navy-800 font-medium">
              <span className="text-slate-400 uppercase font-semibold text-[10px] block mb-0.5">The Business Question:</span>
              "{active.business_question}"
            </div>
          </div>

          {/* Metric Evidence Highlight Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Supporting Validated Calculations
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(active.supporting_evidence).map(([key, val]) => (
                <div key={key} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="text-slate-400 capitalize block text-[11px]">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm font-bold text-navy-900 mt-0.5 block">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Finding Statement */}
          <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200 text-xs text-brand-900 leading-relaxed">
            <span className="font-bold block mb-1 text-brand-800">Verified Consulting Finding:</span>
            {active.primary_finding}
          </div>

          {/* Scope & Baseline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-700 block mb-1">Relevant Stores & Window:</span>
              <p className="text-slate-600 leading-snug">{active.relevant_stores}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-700 block mb-1">Comparison Baseline:</span>
              <p className="text-slate-600 leading-snug">{active.comparison_baseline}</p>
            </div>
          </div>

          {/* Potential vs Alternative Explanations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Primary Hypotheses</span>
              </span>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside leading-relaxed">
                {active.potential_explanations.map((exp, i) => (
                  <li key={i}>{exp}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-amber-50/40 rounded-xl border border-amber-200/80 space-y-2">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Alternative Hypotheses</span>
              </span>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside leading-relaxed">
                {active.alternative_explanations.map((exp, i) => (
                  <li key={i}>{exp}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Next Investigation Recommendation */}
          <div className="p-4 bg-slate-900 rounded-xl text-white text-xs space-y-1">
            <span className="text-brand-300 font-bold uppercase tracking-wider text-[10px] block">
              Suggested Next Investigation
            </span>
            <p className="text-slate-200 leading-relaxed">{active.suggested_next_investigation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
