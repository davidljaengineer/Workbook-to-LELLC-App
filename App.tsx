
import React, { useState } from 'react';
import { ProjectProvider } from './context/ProjectContext';
import { Layout } from './components/Layout';
import { Module } from './types';
import { InputModule } from './modules/InputModule/InputModule';
import { IdfCurveModule } from './modules/IdfCurveModule/IdfCurveModule';
import { LotCalculatorModule } from './modules/LotCalculatorModule/LotCalculatorModule';
import { CollectorStreetModule } from './modules/CollectorStreetModule/CollectorStreetModule';
import { WeightedCModule } from './modules/WeightedCModule/WeightedCModule';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<Module>(Module.INPUT);

  const renderActiveModule = () => {
    switch (activeModule) {
      case Module.INPUT:
        return <InputModule />;
      case Module.IDF_CURVE:
        return <IdfCurveModule />;
      case Module.LOT_CALCULATOR:
        return <LotCalculatorModule />;
      case Module.COLLECTOR_STREET:
        return <CollectorStreetModule />;
      case Module.WEIGHTED_C:
        return <WeightedCModule />;
      default:
        return <InputModule />;
    }
  };

  return (
    <ProjectProvider>
      <Layout activeModule={activeModule} setActiveModule={setActiveModule}>
        {renderActiveModule()}
      </Layout>
    </ProjectProvider>
  );
};

export default App;
