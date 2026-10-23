// AECC Operations Console Master Router & View Switcher
// Integrates all 13 Command Center Views into a cohesive, responsive experience

import React, { useState, useEffect } from 'react';
import ConsoleLayout from './ConsoleLayout';
import OverviewDashboard from './OverviewDashboard';
import LiveEmergencyMapPage from './LiveEmergencyMapPage';
import CreateEmergencyPage from './CreateEmergencyPage';
import RouteOptimizationPage from './RouteOptimizationPage';
import NearbyHospitalsPage from './NearbyHospitalsPage';
import GreenCorridorPage from './GreenCorridorPage';
import TrafficSignalsPage from './TrafficSignalsPage';
import AmbulanceFleetPage from './AmbulanceFleetPage';
import AITrafficIntelligencePage from './AITrafficIntelligencePage';
import IncidentHistoryPage from './IncidentHistoryPage';
import AnalyticsReportsPage from './AnalyticsReportsPage';
import SystemHealthPage from './SystemHealthPage';
import SettingsPage from './SettingsPage';

export default function OperationsConsole({ onExit }) {
  const [currentView, setCurrentView] = useState(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#console/')) {
      const viewId = hash.replace('#console/', '');
      return viewId || 'dashboard';
    }
    return 'dashboard';
  });

  const handleViewChange = (viewId) => {
    setCurrentView(viewId);
    window.location.hash = `#console/${viewId}`;
  };

  // Sync hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#console/')) {
        const viewId = hash.replace('#console/', '');
        if (viewId) setCurrentView(viewId);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <OverviewDashboard onNavigate={handleViewChange} />;
      case 'map':
        return <LiveEmergencyMapPage />;
      case 'create':
        return <CreateEmergencyPage onNavigate={handleViewChange} />;
      case 'routes':
        return <RouteOptimizationPage onNavigate={handleViewChange} />;
      case 'hospitals':
        return <NearbyHospitalsPage onNavigate={handleViewChange} />;
      case 'corridor':
        return <GreenCorridorPage onNavigate={handleViewChange} />;
      case 'signals':
        return <TrafficSignalsPage />;
      case 'fleet':
        return <AmbulanceFleetPage onNavigate={handleViewChange} />;
      case 'ai-traffic':
        return <AITrafficIntelligencePage />;
      case 'history':
        return <IncidentHistoryPage />;
      case 'analytics':
        return <AnalyticsReportsPage />;
      case 'health':
        return <SystemHealthPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewDashboard onNavigate={handleViewChange} />;
    }
  };

  return (
    <ConsoleLayout
      currentView={currentView}
      onViewChange={handleViewChange}
      onExitConsole={onExit}
    >
      {renderView()}
    </ConsoleLayout>
  );
}
