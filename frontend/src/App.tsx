import React, { useState } from 'react';
import { Layout } from './components/layout/Layout';
import { NavModule } from './components/layout/Sidebar';

// Modules
import { OverviewModule } from './modules/overview/OverviewModule';
import { StoresModule } from './modules/stores/StoresModule';
import { ForecastModule } from './modules/forecast/ForecastModule';
import { DiagnosisModule } from './modules/diagnosis/DiagnosisModule';
import { RecommendationsModule } from './modules/recommendations/RecommendationsModule';
import { SimulatorModule } from './modules/simulator/SimulatorModule';
import { ActionsModule } from './modules/actions/ActionsModule';
import { ReportsModule } from './modules/reports/ReportsModule';
import { ConsultantModule } from './modules/consultant/ConsultantModule';
import { MethodologyModule } from './modules/methodology/MethodologyModule';

export const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<NavModule>('overview');
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);

  const handleSelectStore = (storeId: number) => {
    setSelectedStoreId(storeId);
    setActiveModule('stores');
  };

  const handleClearSelectedStore = () => {
    setSelectedStoreId(null);
  };

  return (
    <Layout activeModule={activeModule} onSelectModule={setActiveModule}>
      {activeModule === 'overview' && (
        <OverviewModule
          onSelectStore={handleSelectStore}
          onNavigate={(mod) => setActiveModule(mod)}
        />
      )}
      {activeModule === 'stores' && (
        <StoresModule
          selectedStoreId={selectedStoreId}
          onClearSelectedStore={handleClearSelectedStore}
        />
      )}
      {activeModule === 'forecast' && <ForecastModule />}
      {activeModule === 'diagnosis' && <DiagnosisModule />}
      {activeModule === 'recommendations' && (
        <RecommendationsModule onNavigateToActions={() => setActiveModule('actions')} />
      )}
      {activeModule === 'simulator' && <SimulatorModule />}
      {activeModule === 'actions' && <ActionsModule />}
      {activeModule === 'reports' && <ReportsModule />}
      {activeModule === 'consultant' && (
        <ConsultantModule onNavigate={(mod) => setActiveModule(mod)} />
      )}
      {activeModule === 'methodology' && <MethodologyModule />}
    </Layout>
  );
};

export default App;
