import React from 'react';
import { NavModule } from './Sidebar';
import { Calendar, Bot, Printer, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  activeModule: NavModule;
  onOpenConsultant: () => void;
  onOpenPrintReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  onOpenConsultant,
  onOpenPrintReport,
}) => {
  const titles: Record<NavModule, { title: string; subtitle: string }> = {
    overview: {
      title: 'Executive Overview',
      subtitle: 'Chain health scorecard, performance tiers, and strategic priorities.',
    },
    stores: {
      title: 'Store Performance & Risk Explorer',
      subtitle: 'Detailed store benchmarks, peer comparisons, and SHAP risk drivers.',
    },
    forecast: {
      title: 'Sales Forecast & Backtest',
      subtitle: 'Model A (XGBoost) predictions, holdout accuracy, and expected movers.',
    },
    diagnosis: {
      title: 'Business Diagnosis & Root Causes',
      subtitle: 'Evidence-backed investigations of footfall, formats, and promotional lift.',
    },
    recommendations: {
      title: 'Consulting Recommendations',
      subtitle: 'Structured strategic initiatives categorized by urgency and impact.',
    },
    simulator: {
      title: 'What-If Scenario Simulator',
      subtitle: 'Interactive sensitivity modeling for growth, footfall, and promotion policies.',
    },
    actions: {
      title: 'Management Action Tracker',
      subtitle: 'Persistent execution log for strategy milestones, owners, and measurable outcomes.',
    },
    reports: {
      title: 'Executive Strategy Reports',
      subtitle: 'Stakeholder presentation deliverables, CSV downloads, and printable brief.',
    },
    consultant: {
      title: 'Ask Your Retail Consultant',
      subtitle: 'Natural language strategic inquiries backed by verified model outputs.',
    },
    methodology: {
      title: 'Methodology, Models & Data Quality',
      subtitle: 'Dataset audit, feature engineering pipeline, XGBoost architectures, and caveats.',
    },
  };

  const { title, subtitle } = titles[activeModule] || {
    title: 'RetailIQ',
    subtitle: 'Understand performance. Predict what comes next. Make better retail decisions.',
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-lg font-bold text-navy-900 tracking-tight">{title}</h1>
        <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Reporting Period Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Holdout: 20 Jun – 31 Jul 2015</span>
        </div>

        {/* Data Quality Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Validated (1,115 Stores)</span>
        </div>

        {/* Quick Assistant Button */}
        {activeModule !== 'consultant' && (
          <button
            onClick={onOpenConsultant}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 text-brand-700 hover:bg-teal-100 border border-teal-200/80 text-xs font-semibold transition-colors"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Consultant</span>
          </button>
        )}

        {/* Print / Export Report Button */}
        <button
          onClick={onOpenPrintReport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors"
          title="Print or view executive report"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Executive Brief</span>
        </button>
      </div>
    </header>
  );
};
