// Create Emergency & Dispatch Workflow (Section 6 of Specification)
// Interactive form, location preset picker, hospital preview, dispatch confirmation

import React, { useState } from 'react';
import { useAECC } from '../../context/AECCContext';
import {
  AlertTriangle,
  MapPin,
  Users,
  FileText,
  Building2,
  Ambulance,
  CheckCircle2,
  Compass,
  ArrowRight,
} from 'lucide-react';

const SOLAPUR_LOCATION_PRESETS = [
  { name: 'Saat Rasta Flyover Approach', lat: 17.6688, lng: 75.9015, address: 'Saat Rasta Flyover, Solapur' },
  { name: 'Dr. Ambedkar Chowk Arterial', lat: 17.6660, lng: 75.9055, address: 'Near Collectorate, Solapur' },
  { name: 'Rang Bhavan Roundabout', lat: 17.6715, lng: 75.9095, address: 'Rang Bhavan Circle, Solapur' },
  { name: 'Hotgi Road IT Hub', lat: 17.6620, lng: 75.8920, address: 'Hotgi Road Industrial Artery, Solapur' },
  { name: 'Solapur Railway Station Square', lat: 17.6550, lng: 75.9040, address: 'Station Road, Solapur' },
];

export default function CreateEmergencyPage({ onNavigate }) {
  const { createEmergency, hospitals, ambulances } = useAECC();

  const [formData, setFormData] = useState({
    category: 'Road accident',
    severity: 'Critical',
    locationAddress: 'Saat Rasta Flyover Approach, Solapur',
    lat: 17.6688,
    lng: 75.9015,
    patientReference: `PAT-${Date.now().toString().slice(-4)}`,
    patientCount: 1,
    medicalRequirements: 'Emergency Trauma Triage, Ventilator Support',
    reportingSource: 'Municipal 112 Police & Ambulance Dispatch',
    notes: 'Severe multi-vehicle collision. Incoming trajectory requires corridor clearance.',
  });

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [createdIncident, setCreatedIncident] = useState(null);
  const [formError, setFormError] = useState('');

  const handlePresetSelect = (preset) => {
    setFormData((prev) => ({
      ...prev,
      locationAddress: preset.address,
      lat: preset.lat,
      lng: preset.lng,
    }));
    setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    const lat = parseFloat(formData.lat);
    const lng = parseFloat(formData.lng);
    const count = parseInt(formData.patientCount, 10);

    if (isNaN(lat) || lat < 15.0 || lat > 22.0) {
      setFormError('Invalid Latitude: Coordinates must be within Maharashtra municipal bounds (15.0° - 22.0° N).');
      return;
    }
    if (isNaN(lng) || lng < 72.0 || lng > 80.0) {
      setFormError('Invalid Longitude: Coordinates must be within Maharashtra municipal bounds (72.0° - 80.0° E).');
      return;
    }
    if (isNaN(count) || count < 1) {
      setFormError('Patient count must be at least 1.');
      return;
    }
    if (!formData.locationAddress.trim()) {
      setFormError('Incident address or landmark description is required.');
      return;
    }

    setConfirmModalOpen(true);
  };

  const handleConfirmDispatch = async () => {
    const inc = await createEmergency({
      category: formData.category,
      severity: formData.severity,
      location: {
        address: formData.locationAddress,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
      },
      patientReference: formData.patientReference,
      patientCount: parseInt(formData.patientCount, 10),
      medicalRequirements: formData.medicalRequirements,
      reportingSource: formData.reportingSource,
      notes: formData.notes,
    });

    setCreatedIncident(inc);
    setConfirmModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-black text-navy flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-coral" />
          <span>Register New Emergency Incident</span>
        </h2>
        <p className="text-xs text-muted mt-1">
          Initiate municipal emergency response, trigger automated hospital discovery and plan priority corridor.
        </p>
      </div>

      {/* Success Notification if just created */}
      {createdIncident && (
        <div className="p-4 rounded-2xl bg-corridor/15 border border-corridor/40 text-xs text-emerald-900 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-corridor" />
            <div>
              <strong className="block text-navy text-sm font-extrabold">Emergency Dispatched Successfully!</strong>
              <span className="text-muted">
                Incident ID: <code className="font-mono text-corridor font-bold">{createdIncident.id}</code>. Green corridor and routing engine are active.
              </span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2 rounded-xl bg-corridor hover:bg-corridor-dark text-white font-extrabold text-xs shadow-md shadow-corridor/20"
          >
            Go to Live Dashboard →
          </button>
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-white border border-surface-dim shadow-xs space-y-5">
        {formError && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 text-xs flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-coral shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Category & Severity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-navy mb-1.5 uppercase tracking-wider">
              Emergency Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-dim text-navy text-xs font-semibold focus:outline-none focus:border-corridor focus:bg-white"
            >
              <option value="Road accident">Road accident (High-Impact Collision)</option>
              <option value="Cardiac emergency">Cardiac emergency (STEMI / Arrest)</option>
              <option value="Trauma">Trauma (Fall / Penetrating Injury)</option>
              <option value="Fire-related emergency">Fire-related emergency (Burn Critical)</option>
              <option value="Medical emergency">Medical emergency (Stroke / Sepsis)</option>
              <option value="Disaster response">Disaster response (Multi-Casualty)</option>
              <option value="Other">Other Critical Transport</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-navy mb-1.5 uppercase tracking-wider">
              Severity Tier
            </label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-dim text-navy text-xs font-semibold focus:outline-none focus:border-corridor focus:bg-white"
            >
              <option value="Critical">Critical (Immediate Code Red Life Threat)</option>
              <option value="High">High (Urgent Hospital Transfer)</option>
              <option value="Medium">Medium (Semi-Urgent Emergency)</option>
              <option value="Low">Low (Non-Immediate Transport)</option>
            </select>
          </div>
        </div>

        {/* Location Presets & Coordinate Inputs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-navy uppercase tracking-wider">
              Solapur Geographic Coordinates
            </label>
            <span className="text-[11px] text-teal font-mono font-semibold">Quick Preset Chooser</span>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap gap-2">
            {SOLAPUR_LOCATION_PRESETS.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handlePresetSelect(p)}
                className="px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-alt border border-surface-dim text-xs text-navy font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Compass className="w-3 h-3 text-corridor" />
                <span>{p.name}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Incident Address / Landmark"
                value={formData.locationAddress}
                onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-dim text-navy text-xs font-medium focus:outline-none focus:border-corridor focus:bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="0.0001"
                placeholder="Latitude"
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                required
                className="w-full px-3 py-2.5 rounded-xl bg-surface border border-surface-dim text-navy text-xs font-mono font-medium focus:outline-none focus:border-corridor focus:bg-white"
              />
              <input
                type="number"
                step="0.0001"
                placeholder="Longitude"
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                required
                className="w-full px-3 py-2.5 rounded-xl bg-surface border border-surface-dim text-navy text-xs font-mono font-medium focus:outline-none focus:border-corridor focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Patient Reference & Medical Requirements */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-navy mb-1.5 uppercase tracking-wider">
              Patient Reference ID
            </label>
            <input
              type="text"
              value={formData.patientReference}
              onChange={(e) => setFormData({ ...formData, patientReference: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-dim text-navy text-xs font-mono font-medium focus:outline-none focus:border-corridor focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy mb-1.5 uppercase tracking-wider">
              Patient Count
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={formData.patientCount}
              onChange={(e) => setFormData({ ...formData, patientCount: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-dim text-navy text-xs font-medium focus:outline-none focus:border-corridor focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy mb-1.5 uppercase tracking-wider">
              Reporting Source
            </label>
            <input
              type="text"
              value={formData.reportingSource}
              onChange={(e) => setFormData({ ...formData, reportingSource: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-dim text-navy text-xs font-medium focus:outline-none focus:border-corridor focus:bg-white"
            />
          </div>
        </div>

        {/* Medical Requirements & Notes */}
        <div>
          <label className="block text-xs font-bold text-navy mb-1.5 uppercase tracking-wider">
            Special Medical Requirements & Clinical Notes
          </label>
          <textarea
            rows="3"
            value={formData.medicalRequirements}
            onChange={(e) => setFormData({ ...formData, medicalRequirements: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-dim text-navy text-xs leading-relaxed focus:outline-none focus:border-corridor focus:bg-white font-medium"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-coral hover:bg-coral-dark text-white font-extrabold text-xs shadow-md shadow-coral/20 transition-all active:scale-95"
          >
            <span>REVIEW DISPATCH & ACTIVATE ROUTING</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Dispatch Confirmation Modal (Section 6 requirement) */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-lg w-full bg-white border border-surface-dim rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-coral/15 text-coral flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-navy text-base">Confirm Autonomous Dispatch</h3>
                <p className="text-xs text-muted">Review emergency assignment parameters before committing to municipal grid</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-surface-dim text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted">Category:</span>
                <strong className="text-navy">{formData.category} ({formData.severity})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Target Area:</span>
                <span className="text-navy-light font-semibold truncate max-w-[220px]">{formData.locationAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Coordinates:</span>
                <span className="font-mono text-teal font-bold">{formData.lat}°N, {formData.lng}°E</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Estimated Ambulance:</span>
                <strong className="text-corridor">AMB-01 (ALS Unit — Closest Responder)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Target Hospital:</span>
                <strong className="text-sky">Ashwini Sahakari Rugnalaya (Level-1 Trauma)</strong>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-surface-alt hover:bg-surface-dim text-navy font-bold text-xs border border-surface-dim"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDispatch}
                className="flex-1 py-2.5 rounded-xl bg-corridor hover:bg-corridor-dark text-white font-extrabold text-xs shadow-md shadow-corridor/20"
              >
                CONFIRM & DISPATCH
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
