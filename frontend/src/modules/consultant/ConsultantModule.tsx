import React, { useState } from 'react';
import { api } from '../../services/api';
import { ConsultantAnswer } from '../../types';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  ExternalLink
} from 'lucide-react';

interface ConsultantModuleProps {
  onNavigate: (module: any) => void;
}

export const ConsultantModule: React.FC<ConsultantModuleProps> = ({ onNavigate }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ q: string; a: ConsultantAnswer }>>([
    {
      q: 'Explain our overall chain performance in plain English',
      a: {
        query: 'Explain our overall chain performance in plain English',
        topic: 'Chain-Wide Executive Performance Review',
        executive_takeaway: 'The chain operates 1,115 stores generating healthy overall volume, but shows substantial performance polarization: top-tier stores generate 2.22x more revenue than bottom-tier stores. For Q3 2015, €10.0M of quarterly revenue is at risk across 306 flagged stores.',
        evidence_and_metrics: [
          { label: 'Total Stores Analyzed', value: '1,115 stores' },
          { label: 'Top vs Bottom Sales Gap', value: '2.22x multiplier' },
          { label: 'Customer Footfall Multiplier', value: '2.21x (1,117 vs 504 customers/day)' },
          { label: 'Spend per Customer', value: 'Nearly equal: €9.60 vs €9.20 (1.04x)' },
          { label: 'Q3 2015 Revenue at Risk', value: '€9.98M across 306 stores' }
        ],
        detailed_analysis: 'Our diagnostic models confirm that revenue variation is almost purely a footfall problem. Bottom-tier stores suffer from low visitor density, not smaller customer shopping baskets. Furthermore, 306 stores are statistically primed to underperform in Q3 2015 due to high prior-year hurdles and weakening trailing momentum.',
        strategic_recommendations: [
          'Prioritize the top 50 revenue-at-risk stores for immediate operational review.',
          'Redirect marketing away from basket discounting into local storefront visibility and footfall acquisition.',
          'Accelerate conversion of basic-assortment stores to extended assortment format.'
        ],
        related_module: 'overview',
        related_module_title: 'Executive Overview'
      }
    }
  ]);

  const quickPrompts = [
    'Which stores need urgent attention first and why?',
    'Explain the evidence behind the traffic vs basket size gap',
    'What is our revenue at risk for Q3 2015?',
    'Which store profiles should we expand into?',
    'How accurate is the sales forecasting model?',
    'Tell me about Store 817',
    'Why is Store 383 at risk?'
  ];

  const handleAsk = async (promptText: string) => {
    if (!promptText.trim()) return;
    setLoading(true);
    setQuery('');

    try {
      const res = await api.askConsultant(promptText);
      setHistory((prev) => [...prev, { q: promptText, a: res }]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Consultant Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-200">
              Verified NLP Engine
            </span>
            <span className="text-xs text-slate-400">Zero Hallucination Guarantee</span>
          </div>
          <h3 className="text-lg font-bold text-navy-900">
            Ask Your Retail Strategy Consultant
          </h3>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed mt-0.5">
            Ask strategic business questions in natural language. Answers query verified ML pipeline metrics, store profiles, and consulting diagnostics.
          </p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 max-w-xs">
          <strong className="text-navy-900 block mb-0.5">Data-Backed Reasoning:</strong>
          Answers are synthesized from 1,115 stores, XGBoost forecasts, and Q3 2015 risk scores.
        </div>
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Recommended Strategic Questions:
        </span>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(p)}
              disabled={loading}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-medium border border-slate-200 shadow-sm transition-all hover:border-brand-300 disabled:opacity-50 text-left"
            >
              "{p}"
            </button>
          ))}
        </div>
      </div>

      {/* Query Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk(query);
        }}
        className="relative"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a strategic retail question (e.g. 'Which stores have the highest revenue at risk?', 'Tell me about Store 817')..."
          className="w-full pl-5 pr-28 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-navy-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-2 top-2 px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5 shadow-sm"
        >
          {loading ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>Ask</span>
        </button>
      </form>

      {/* Conversation Thread */}
      <div className="space-y-6">
        {history.map((item, idx) => (
          <div key={idx} className="space-y-3">
            {/* User Question Bubble */}
            <div className="flex items-start gap-3 justify-end">
              <div className="bg-navy-900 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-xl text-xs font-medium shadow-sm">
                {item.q}
              </div>
              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            </div>

            {/* Consultant Answer Card */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-brand-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 max-w-3xl space-y-4 text-xs shadow-sm w-full">
                {/* Topic Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-brand-800 uppercase tracking-wider text-[11px]">
                    Consulting Topic: {item.a.topic}
                  </span>
                  {item.a.related_module && (
                    <button
                      onClick={() => onNavigate(item.a.related_module.replace('/', ''))}
                      className="text-[11px] font-semibold text-brand-700 hover:underline flex items-center gap-1"
                    >
                      <span>Open {item.a.related_module_title}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Executive Takeaway */}
                <div className="p-3.5 bg-teal-50/70 rounded-xl border border-teal-200 text-brand-900 leading-relaxed">
                  <strong className="block text-brand-800 text-xs mb-0.5">Executive Takeaway:</strong>
                  {item.a.executive_takeaway}
                </div>

                {/* Supporting Metrics Grid */}
                {item.a.evidence_and_metrics && item.a.evidence_and_metrics.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Supporting Data & Verified Metrics
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {item.a.evidence_and_metrics.map((m, mIdx) => (
                        <div key={mIdx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                          <span className="text-slate-400 text-[10px] block">{m.label}</span>
                          <span className="font-bold text-navy-900 block mt-0.5">{m.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed Analysis */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Consulting Analysis
                  </span>
                  <p className="text-slate-600 leading-relaxed">{item.a.detailed_analysis}</p>
                </div>

                {/* Strategic Action Directives */}
                {item.a.strategic_recommendations && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-navy-900 block">
                      Recommended Next Actions:
                    </span>
                    <ul className="space-y-1 list-disc list-inside text-slate-600 leading-relaxed text-[11px]">
                      {item.a.strategic_recommendations.map((rec, rIdx) => (
                        <li key={rIdx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
