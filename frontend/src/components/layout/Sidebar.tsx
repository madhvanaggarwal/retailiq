import React from 'react';
import {
  LayoutDashboard,
  Store,
  TrendingUp,
  Stethoscope,
  Lightbulb,
  Sliders,
  CheckSquare,
  FileText,
  MessageSquare,
  Database,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export type NavModule =
  | 'overview'
  | 'stores'
  | 'forecast'
  | 'diagnosis'
  | 'recommendations'
  | 'simulator'
  | 'actions'
  | 'reports'
  | 'consultant'
  | 'methodology';

interface SidebarProps {
  activeModule: NavModule;
  onSelectModule: (module: NavModule) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  collapsed,
  onToggleCollapse,
}) => {
  const navItems = [
    { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'stores', label: 'Store Performance', icon: Store },
    { id: 'forecast', label: 'Sales Forecast', icon: TrendingUp },
    { id: 'diagnosis', label: 'Business Diagnosis', icon: Stethoscope },
    { id: 'recommendations', label: 'Consulting Recs', icon: Lightbulb },
    { id: 'simulator', label: 'What-If Simulator', icon: Sliders },
    { id: 'actions', label: 'Action Tracker', icon: CheckSquare },
    { id: 'reports', label: 'Reports & Brief', icon: FileText },
    { id: 'consultant', label: 'Ask Consultant', icon: MessageSquare, badge: 'AI/NLP' },
    { id: 'methodology', label: 'Data Quality & Models', icon: Database },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 bg-white border-r border-slate-200 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-700 to-brand-900 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
            RQ
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-base tracking-tight text-navy-900 truncate">
                Retail<span className="text-brand-700">IQ</span>
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium truncate">
                Consulting Platform
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectModule(item.id as NavModule)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-200/60'
                  : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100/70 border border-transparent'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-brand-700' : 'text-slate-400'}`} />
              {!collapsed && (
                <div className="flex items-center justify-between w-full min-w-0">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-semibold bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded border border-brand-200">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-100">
        {!collapsed ? (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="flex items-center gap-1.5 text-brand-700 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Rossmann ML Engine</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              1,115 stores • XGBoost v2 • Q3 2015 Deployment Snapshot
            </p>
          </div>
        ) : (
          <div className="flex justify-center text-slate-400 py-1" title="Rossmann ML Engine">
            <Sparkles className="w-5 h-5 text-brand-700" />
          </div>
        )}
      </div>
    </aside>
  );
};
