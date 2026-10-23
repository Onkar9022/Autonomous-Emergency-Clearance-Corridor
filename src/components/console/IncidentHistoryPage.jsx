// Searchable Incident History & Audit Trail (Section 16)
// Historical records, outcome tracking, CSV export

import React, { useState } from 'react';
import { useAECC } from '../../context/AECCContext';
import { History, Download, Search, Filter, CheckCircle2, Clock } from 'lucide-react';

export default function IncidentHistoryPage() {
  const { incidents, hospitals } = useAECC();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = incidents.filter(
    (inc) =>
      inc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.location?.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // CSV Export Function
  const handleExportCSV = () => {
    const headers = ['Incident ID,Category,Severity,Address,Ambulance,Hospital,Status,Created At,Time Saved (mins)'];
    const rows = incidents.map((inc) => {
      const hospName = hospitals.find((h) => h.id === inc.destinationHospitalId)?.shortName || 'N/A';
      return `"${inc.id}","${inc.category}","${inc.severity}","${inc.location?.address || ''}","${inc.assignedAmbulanceId || 'N/A'}","${hospName}","${inc.status}","${inc.createdAt}","${inc.timeSavedMinutes || 0}"`;
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AECC_Incident_History_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-navy flex items-center gap-2">
            <History className="w-5 h-5 text-sky" />
            <span>Incident Audit Log & Dispatch History</span>
          </h2>
          <p className="text-xs text-muted mt-1">
            Permanent record of municipal emergency dispatches, clinical destinations and corridor outcomes.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-surface-dim hover:bg-surface-alt text-navy font-extrabold text-xs shadow-xs transition-all active:scale-95"
        >
          <Download className="w-4 h-4 text-corridor" />
          <span>Export CSV Audit Log</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search incident by ID, category, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-surface-dim text-navy text-xs focus:outline-none focus:border-corridor font-medium shadow-xs"
        />
      </div>

      {/* History Table */}
      <div className="rounded-3xl bg-white border border-surface-dim overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface text-navy font-bold uppercase text-[10px] tracking-wider border-b border-surface-dim">
              <tr>
                <th className="py-3.5 px-4">Incident ID</th>
                <th className="py-3.5 px-4">Category & Severity</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Assigned Unit</th>
                <th className="py-3.5 px-4">Hospital Destination</th>
                <th className="py-3.5 px-4">Corridor Outcome</th>
                <th className="py-3.5 px-4 text-right">Time Saved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-dim font-medium">
              {filtered.map((inc) => {
                const hosp = hospitals.find((h) => h.id === inc.destinationHospitalId);
                const isResolved = inc.status === 'Resolved';

                return (
                  <tr key={inc.id} className="hover:bg-surface/60 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-navy">{inc.id}</td>
                    <td className="py-4 px-4">
                      <div className="text-navy font-bold">{inc.category}</div>
                      <span
                        className={`inline-block mt-0.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full ${
                          inc.severity === 'Critical' ? 'bg-coral/15 text-coral' : 'bg-amber-500/15 text-amber-800'
                        }`}
                      >
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-navy-light max-w-xs truncate font-medium">
                      {inc.location?.address || 'Solapur Sector'}
                    </td>
                    <td className="py-4 px-4 font-mono text-navy font-semibold">
                      {inc.assignedAmbulanceId || 'Awaiting'}
                    </td>
                    <td className="py-4 px-4 text-navy font-semibold">
                      {hosp ? hosp.shortName : 'Calculating...'}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isResolved
                            ? 'bg-emerald-500/15 text-emerald-800'
                            : 'bg-coral/15 text-coral animate-pulse'
                        }`}
                      >
                        {isResolved ? 'Handover Complete' : 'Active En Route'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-black text-corridor">
                      +{inc.timeSavedMinutes || 7} mins
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
