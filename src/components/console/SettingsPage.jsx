import React, { useState } from 'react';
import { useAECC } from '../../context/AECCContext';
import { Settings, ShieldCheck, RotateCcw, Save, CheckCircle2, Server, Key } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

export default function SettingsPage() {
  const { operatingMode, setOperatingMode, userRole, switchRole, resetSimulation, backendOnline } = useAECC();
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [config, setConfig] = useState({
    region: 'Solapur, Maharashtra, India',
    centerLat: 17.6690,
    centerLng: 75.9064,
    osrmEndpoint: 'https://router.project-osrm.org',
    hardwareGatewayIp: '192.168.4.1 (ESP32 AP - Simulation Only)',
    databaseUrl: 'postgresql://neondb_owner:***@ep-delicate-mode...aws.neon.tech/neondb',
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleFullReset = async () => {
    if (window.confirm('Reset all AECC simulation state and database to authoritative Solapur defaults?')) {
      if (backendOnline) {
        try {
          await apiClient.resetBackendDemoData();
        } catch (e) {
          console.warn('Backend reset error:', e);
        }
      }
      localStorage.removeItem('aecc_incidents');
      localStorage.removeItem('aecc_hospitals');
      localStorage.removeItem('aecc_ambulances');
      localStorage.removeItem('aecc_signals');
      resetSimulation();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-navy flex items-center gap-2">
          <Settings className="w-5 h-5 text-navy" />
          <span>System Settings & External Service Configuration</span>
        </h2>
        <p className="text-xs text-muted mt-1">
          Manage operational mode, operator permissions, municipal network parameters, and persistent database connections.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-corridor/15 border border-corridor/40 text-emerald-800 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-corridor" />
          <span>Configuration parameters updated successfully.</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="p-6 rounded-3xl bg-white border border-surface-dim shadow-xs space-y-5">
        {/* Operating Mode & Role */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-navy mb-1.5 uppercase tracking-wider">
              Operating Mode
            </label>
            <select
              value={operatingMode}
              onChange={(e) => setOperatingMode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-dim text-navy text-xs font-semibold focus:outline-none focus:border-corridor focus:bg-white"
            >
              <option value="SIMULATION">SIMULATION (Demonstration Mode)</option>
              <option value="LIVE INTEGRATION">LIVE INTEGRATION (Municipal Relay)</option>
            </select>
            <p className="text-[10px] text-muted mt-1">
              Safety note: Simulation mode executes safe virtual preemption without commanding physical signals.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-navy mb-1.5 uppercase tracking-wider">
              Active User Role
            </label>
            <select
              value={userRole}
              onChange={(e) => switchRole(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-dim text-navy text-xs font-semibold focus:outline-none focus:border-corridor focus:bg-white"
            >
              <option value="Emergency Operator">Emergency Operator (Dispatch & Override)</option>
              <option value="Administrator">Administrator (Full System Configuration)</option>
              <option value="Read-Only Observer">Read-Only Observer (Auditing & View Only)</option>
            </select>
            <p className="text-[10px] text-muted mt-1">
              Role determines backend permissions for manual signal toggles and corridor authorizations.
            </p>
          </div>
        </div>

        {/* Municipal Region Coordinates */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold text-navy uppercase tracking-wider">
            Municipal Deployment Region
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <input
                type="text"
                value={config.region}
                onChange={(e) => setConfig({ ...config, region: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-surface border border-surface-dim text-navy text-xs font-medium"
              />
            </div>
            <div>
              <input
                type="number"
                step="0.0001"
                value={config.centerLat}
                onChange={(e) => setConfig({ ...config, centerLat: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-dim text-navy text-xs font-mono font-medium"
              />
            </div>
            <div>
              <input
                type="number"
                step="0.0001"
                value={config.centerLng}
                onChange={(e) => setConfig({ ...config, centerLng: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-dim text-navy text-xs font-mono font-medium"
              />
            </div>
          </div>
        </div>

        {/* External Service Endpoints */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold text-navy uppercase tracking-wider">
            External Service Endpoints (Adapters)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-muted block mb-1 font-medium">OSRM Routing Service URL</span>
              <input
                type="text"
                value={config.osrmEndpoint}
                onChange={(e) => setConfig({ ...config, osrmEndpoint: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-dim text-navy text-xs font-mono font-medium"
              />
            </div>
            <div>
              <span className="text-[10px] text-muted block mb-1 font-medium">ESP32 / NTCIP Hardware Gateway</span>
              <input
                type="text"
                value={config.hardwareGatewayIp}
                onChange={(e) => setConfig({ ...config, hardwareGatewayIp: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-dim text-navy text-xs font-mono font-medium"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 flex items-center justify-between border-t border-surface-dim">
          <button
            type="button"
            onClick={handleFullReset}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-alt hover:bg-surface-dim text-coral text-xs font-bold border border-surface-dim transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data to Defaults</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-corridor hover:bg-corridor-dark text-white font-extrabold text-xs shadow-md shadow-corridor/20 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
