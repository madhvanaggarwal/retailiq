import React, { useState } from 'react';
import { Sidebar, NavModule } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  activeModule: NavModule;
  onSelectModule: (module: NavModule) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  activeModule,
  onSelectModule,
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Collapsible Sidebar */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={onSelectModule}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          collapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <Header
          activeModule={activeModule}
          onOpenConsultant={() => onSelectModule('consultant')}
          onOpenPrintReport={() => onSelectModule('reports')}
        />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
