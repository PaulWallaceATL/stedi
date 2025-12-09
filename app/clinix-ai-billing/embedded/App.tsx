import React, { useState } from 'react';
import { ViewState } from './types';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Prioritization } from './pages/Prioritization';
import { PerformanceReview } from './pages/PerformanceReview';
import { DenialManager } from './pages/DenialManager';
import { NewClaimMethod } from './pages/NewClaimMethod';
import { ClaimWizard } from './pages/ClaimWizard';
import { UploadReview } from './pages/UploadReview';
import { ClaimDetail } from './pages/ClaimDetail';
import { Settings } from './pages/Settings';
import { Success } from './pages/Success';

function App() {
  const [currentView, setView] = useState<ViewState>(ViewState.DASHBOARD);

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard setView={setView} />;
      case ViewState.PRIORITIZATION:
        return <Prioritization setView={setView} />;
      case ViewState.PERFORMANCE_REVIEW:
        return <PerformanceReview setView={setView} />;
      case ViewState.DENIAL_MANAGER:
        return <DenialManager setView={setView} />;
      case ViewState.CLAIM_METHOD:
        return <NewClaimMethod setView={setView} />;
      case ViewState.CLAIM_WIZARD:
        return <ClaimWizard setView={setView} />;
      case ViewState.UPLOAD_REVIEW:
        return <UploadReview setView={setView} />;
      case ViewState.CLAIM_DETAIL:
        return <ClaimDetail setView={setView} />;
      case ViewState.SETTINGS:
        return <Settings />;
      case ViewState.SUCCESS:
        return <Success setView={setView} />;
      default:
        return <Dashboard setView={setView} />;
    }
  };

  const shouldShowGlobalHeader = currentView !== ViewState.CLAIM_WIZARD && currentView !== ViewState.SUCCESS;

  return (
    <div className="relative flex h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-hidden">
      {shouldShowGlobalHeader && <Header currentView={currentView} setView={setView} />}
      <div className="flex-1 flex overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;