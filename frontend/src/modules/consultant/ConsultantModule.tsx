import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api';
import { ConsultantAnswer } from '../../types';
import {
  Send,
  Bot,
  User,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Info
} from 'lucide-react';

interface ConsultantModuleProps {
  onNavigate: (module: any) => void;
}

export const ConsultantModule: React.FC<ConsultantModuleProps> = ({ onNavigate }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [history, setHistory] = useState<Array<{ q: string; a: ConsultantAnswer }>>([
    {
      q: 'Explain our overall chain performance in plain English',
      a: {
        query: 'Explain our overall chain performance in plain English',
        topic: 'Chain-Wide Executive Performance Review',
        executive_takeaway: 'The chain operates 1,115 stores generating healthy overall volume across 2.5 years, but shows substantial performance polarization: top-tier stores generate 2.22x more revenue than bottom-tier stores. For Q3 2015, €9.98M of quarterly revenue is at risk across 306 flagged stores.',
        evidence_and_metrics: [
          { label: 'Total Stores Analyzed [Fact]', value: '1,115 stores' },
          { label: 'Top vs Bottom Sales Gap [Fact]', value: '2.22x multiplier (€8,247 vs €3,714/day)' },
          { label: 'Customer Footfall Gap [Fact]', value: '2.21x (1,117 vs 504 customers/day)' },
          { label: 'Spend per Customer [Fact]', value: 'Nearly equal: €9.60 vs €9.20 (1.04x)' },
          { label: 'Q3 2015 Revenue at Risk [Model]', value: '€9.98M across 306 stores' }
        ],
        detailed_analysis: 'Our diagnostic models confirm that revenue variation is almost purely a footfall problem. Bottom-tier stores suffer from low visitor density, not smaller customer shopping baskets. Furthermore, 306 stores face comp headwinds in Q3 2015 due to high prior-year comp hurdles and decelerating trailing momentum.',
        strategic_recommendations: [
          'Prioritize the top 50 revenue-at-risk stores for immediate operational review.',
          'Redirect marketing away from basket discounting into local storefront visibility and footfall acquisition.',
          'Accelerate conversion of basic-assortment stores to extended assortment format.'
        ],
        related_module: '/overview',
        related_module_title: 'Executive Overview'
      }
    }
  ]);

  const quickPrompts = [
    'What is our revenue at risk for Q3 2015?',
    'Which stores need urgent attention first and why?',
    'Explain the evidence behind the traffic vs basket size gap',
    'How effective are promotions across the chain?',
    'How accurate is the sales forecasting model?',
    'Tell me about Store 817',
    'Which store profiles should we expand into?',
    'Why is Store 383 at risk?'
  ];

  const handleAsk = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.askConsultant(trimmed);
      setHistory((prev) => [...prev, { q: trimmed, a: res }]);
      setQuery('');
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error('Consultant query error:', err);
      setError(
        err?.message ||
        'Unable to complete query. Please verify that the RetailIQ backend server is active and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPromptClick = (p: string) => {
    setQuery(p);
    handleAsk(p);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAsk(query);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Consultant Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-200">
              Verified Analytics & NLP
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Empirical Facts & Validated Models
            </span>
          </div>
          <h3 className="text-lg font-bold text-navy-900">
            Ask Your Retail Strategy Consultant
          </h3>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed mt-0.5">
            Ask strategic business questions in natural language. Answers query verified Rossmann transaction records, XGBoost sales forecasters, and comp risk models.
          </p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 max-w-xs">
          <strong className="text-navy-900 block mb-0.5">Evidence-Backed Reasoning:</strong>
          Distinguishes empirical observations, XGBoost model forecasts, and strategy hypotheses across 1,115 stores.
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
              type="button"
              onClick={() => handleQuickPromptClick(p)}
              disabled={loading}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-medium border border-slate-200 shadow-sm transition-all hover:border-brand-300 disabled:opacity-50 text-left active:scale-[0.99]"
            >
              "{p}"
            </button>
          ))}
        </div>
      </div>

      {/* Query Input Bar */}
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          disabled={loading}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAsk(query);
            }
          }}
          placeholder="Ask a strategic retail question (e.g. 'Which stores have the highest revenue at risk?', 'Tell me about Store 817', 'How effective are promotions?')..."
          className="w-full pl-5 pr-28 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-navy-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 disabled:bg-slate-50"
        />
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={loading || !query.trim()}
          className="absolute right-2 top-2 px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5 shadow-sm active:scale-95"
        >
          {loading ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>Ask</span>
        </button>
      </form>

      {/* Error Message Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start justify-between gap-3 text-xs text-rose-800 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block text-rose-900">Query Failed:</strong>
              <span>{error}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleAsk(query)}
              disabled={loading || !query.trim()}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold transition-all disabled:opacity-40 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-700 p-1 font-bold"
              title="Dismiss error"
            >
              ✕
            </button>
          </div>
        </div>
      )}

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
                      type="button"
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
                      {item.a.evidence_and_metrics.map((m, mIdx) => {
                        const isFact = m.label.includes('[Fact]');
                        const isModel = m.label.includes('[Model]');
                        const cleanLabel = m.label.replace(/\[(Fact|Model)\]/g, '').trim();

                        return (
                          <div key={mIdx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col justify-between">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-slate-500 text-[10px] truncate">{cleanLabel}</span>
                              {isFact && (
                                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200 shrink-0">
                                  Fact
                                </span>
                              )}
                              {isModel && (
                                <span className="text-[9px] font-bold text-teal-700 bg-teal-50 px-1 py-0.2 rounded border border-teal-200 shrink-0">
                                  Model
                                </span>
                              )}
                            </div>
                            <span className="font-bold text-navy-900 block mt-0.5">{m.value}</span>
                          </div>
                        );
                      })}
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

        {/* Loading Indicator Card in Thread */}
        {loading && (
          <div className="flex items-start gap-3 animate-in fade-in duration-200">
            <div className="w-7 h-7 rounded-full bg-brand-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white rounded-2xl border border-brand-200 p-5 max-w-xl space-y-3 w-full shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 border-2 border-brand-700 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-semibold text-brand-800">
                  Synthesizing Rossmann empirical records & ML outputs...
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="h-2 bg-slate-100 rounded-full w-3/4 animate-pulse"></div>
                <div className="h-2 bg-slate-100 rounded-full w-1/2 animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>
    </div>
  );
};
