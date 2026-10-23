// Traffic Signal Network Monitoring & Virtual Intercept (Section 11)
// Searchable signal table, virtual override triggers, communication status

import React, { useState } from 'react';
import { useAECC } from '../../context/AECCContext';
import { Radio, Search, Filter, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export default function TrafficSignalsPage() {
  const { trafficSignals, toggleSignalState, userRole, operatingMode } = useAECC();
  const [filterState, setFilterState] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = trafficSignals.filter((sig) => {
    const matchesFilter =
      filterState === 'all'
        ? true
        : filterState === 'priority'
        ? sig.state === 'priority_active'
        : filterState === 'green'
        ? sig.state === 'green'
        : sig.state === 'red';
    const matchesSearch =
      sig.intersectionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sig.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-navy flex items-center gap-2">
            <Radio className="w-5 h-5 text-teal" />
            <span>Municipal Traffic Signal Network</span>
          </h2>
          <p className="text-xs text-muted mt-1">
            Real-time status of Solapur smart intersection gateways and virtual corridor overrides.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2">
          {['all', 'priority', 'green', 'red'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterState(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                filterState === f ? 'bg-corridor text-white shadow-xs' : 'bg-white border border-surface-dim text-navy hover:bg-surface-alt'
              }`}
            >
              {f === 'priority' ? 'Priority Active' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search intersection by name or node ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-surface-dim text-navy text-xs focus:outline-none focus:border-corridor font-medium shadow-xs"
        />
      </div>

      {/* Signals Table */}
      <div className="rounded-3xl bg-white border border-surface-dim overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface text-navy font-bold uppercase text-[10px] tracking-wider border-b border-surface-dim">
              <tr>
                <th className="py-3.5 px-4">Node ID</th>
                <th className="py-3.5 px-4">Intersection Name</th>
                <th className="py-3.5 px-4">Operating Mode</th>
                <th className="py-3.5 px-4">Current Signal State</th>
                <th className="py-3.5 px-4">Connectivity</th>
                <th className="py-3.5 px-4">Last Acknowledged</th>
                <th className="py-3.5 px-4 text-right">Simulation Trigger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-dim font-medium">
              {filtered.map((sig) => {
                const isPriority = sig.state === 'priority_active';
                return (
                  <tr key={sig.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-navy">{sig.id}</td>
                    <td className="py-4 px-4 font-bold text-navy">
                      <div>{sig.intersectionName}</div>
                      <div className="text-[10px] text-muted font-mono font-normal">
                        {sig.location.lat.toFixed(4)}°N, {sig.location.lng.toFixed(4)}°E
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted font-medium">{sig.operatingMode}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isPriority
                            ? 'bg-corridor/15 text-corridor border border-corridor/40 animate-pulse'
                            : sig.state === 'green'
                            ? 'bg-emerald-500/15 text-emerald-800'
                            : 'bg-coral/15 text-coral'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isPriority ? 'bg-corridor' : sig.state === 'green' ? 'bg-emerald-500' : 'bg-coral'
                          }`}
                        />
                        {sig.state}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {operatingMode === 'SIMULATION' ? (
                        <span className="flex items-center gap-1.5 text-navy-light text-[11px] font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky" />
                          <span>Simulated Loopback</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-amber-700 text-[11px] font-medium" title="No physical NTCIP controller connected">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>Hardware Disconnected</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-muted font-mono text-[11px]">{sig.lastAck}</td>
                    <td className="py-4 px-4 text-right">
                      {userRole === 'Read-Only Observer' ? (
                        <span className="text-[10px] text-muted font-mono italic">
                          Locked (Observer Mode)
                        </span>
                      ) : (
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => toggleSignalState(sig.id, sig.state === 'green' ? 'red' : 'green')}
                            className="px-2.5 py-1 rounded-lg bg-surface-alt hover:bg-surface-dim text-navy text-[10px] font-bold font-mono border border-surface-dim transition-colors"
                          >
                            Toggle {sig.state === 'green' ? 'RED' : 'GREEN'}
                          </button>
                          <button
                            onClick={() => toggleSignalState(sig.id, 'priority_active')}
                            className="px-2.5 py-1 rounded-lg bg-corridor/15 hover:bg-corridor/25 text-corridor text-[10px] font-bold font-mono border border-corridor/30 transition-colors"
                          >
                            CORRIDOR HOLD
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Safety & Protocol Interlock Notice */}
      <div className="p-4 rounded-2xl bg-white border border-surface-dim shadow-xs text-xs text-muted space-y-1.5">
        <div className="flex items-center gap-2 text-amber-700 font-bold">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>Safety Interlock & Physical Hardware Status</span>
        </div>
        <p>
          Physical traffic-signal commands remain strictly disabled. The AECC console operates in software simulation mode with local virtual relays. Enabling the LIVE INTEGRATION mode will not transmit commands to physical municipal intersection controllers until authenticated hardware bridges, fail-safe conflict monitor units (CMU), and municipal traffic authority safety interlocks are physically provisioned.
        </p>
      </div>
    </div>
  );
}
