// AECC Authoritative PostgreSQL Backend Storage Service & Offline Fallback
// Provides seamless persistence across browser refresh and multi-device sessions

import { INITIAL_HOSPITALS, INITIAL_AMBULANCES, INITIAL_TRAFFIC_SIGNALS } from '../data/solapurData';
import { apiClient } from './apiClient';

class LocalStorageFallback {
  getIncidents() {
    try {
      const data = localStorage.getItem('aecc_incidents');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveIncidents(incidents) {
    try {
      localStorage.setItem('aecc_incidents', JSON.stringify(incidents));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  getHospitals() {
    try {
      const data = localStorage.getItem('aecc_hospitals');
      return data ? JSON.parse(data) : INITIAL_HOSPITALS;
    } catch {
      return INITIAL_HOSPITALS;
    }
  }

  saveHospitals(hospitals) {
    localStorage.setItem('aecc_hospitals', JSON.stringify(hospitals));
  }

  getAmbulances() {
    try {
      const data = localStorage.getItem('aecc_ambulances');
      return data ? JSON.parse(data) : INITIAL_AMBULANCES;
    } catch {
      return INITIAL_AMBULANCES;
    }
  }

  saveAmbulances(ambulances) {
    localStorage.setItem('aecc_ambulances', JSON.stringify(ambulances));
  }

  getSignals() {
    try {
      const data = localStorage.getItem('aecc_signals');
      return data ? JSON.parse(data) : INITIAL_TRAFFIC_SIGNALS;
    } catch {
      return INITIAL_TRAFFIC_SIGNALS;
    }
  }

  saveSignals(signals) {
    localStorage.setItem('aecc_signals', JSON.stringify(signals));
  }

  clearAll() {
    localStorage.removeItem('aecc_incidents');
    localStorage.removeItem('aecc_hospitals');
    localStorage.removeItem('aecc_ambulances');
    localStorage.removeItem('aecc_signals');
  }
}

class PostgresBackendStorageAdapter {
  constructor() {
    this.fallback = new LocalStorageFallback();
    this.isBackendOnline = false;
    this.lastHealthCheck = null;
    this.sourceLabel = 'Checking backend connectivity...';
  }

  async checkHealth() {
    try {
      const res = await apiClient.getHealth();
      if (res && res.status === 'Healthy') {
        this.isBackendOnline = true;
        this.sourceLabel = 'Authoritative Neon PostgreSQL (AWS us-east-2)';
        return true;
      }
    } catch {
      this.isBackendOnline = false;
      this.sourceLabel = 'Offline Demo Sandbox (LocalStorage Fallback)';
    }
    return false;
  }

  // Incidents
  async fetchAuthoritativeIncidents() {
    try {
      const res = await apiClient.getIncidents();
      if (res && res.success && Array.isArray(res.data)) {
        this.isBackendOnline = true;
        // Transform backend models to frontend format
        const transformed = res.data.map((inc) => ({
          id: inc.id,
          category: inc.category,
          severity: inc.severity,
          status: inc.status,
          location: {
            address: inc.address,
            lat: inc.lat,
            lng: inc.lng,
          },
          patientReference: inc.patientReference,
          patientCount: inc.patientCount,
          medicalRequirements: inc.medicalRequirements,
          reportingSource: inc.reportingSource,
          notes: inc.notes,
          destinationHospitalId: inc.destinationHospitalId,
          assignedAmbulanceId: inc.assignedAmbulance?.id || null,
          timeSavedMinutes: inc.timeSavedMinutes,
          totalTravelMinutes: inc.totalTravelMinutes,
          createdAt: inc.createdAt,
          completedAt: inc.completedAt,
        }));
        this.fallback.saveIncidents(transformed);
        return transformed;
      }
    } catch (e) {
      console.warn('Backend incidents fetch failed, using fallback:', e);
    }
    return this.fallback.getIncidents();
  }

  getIncidents() {
    return this.fallback.getIncidents();
  }

  saveIncidents(incidents) {
    this.fallback.saveIncidents(incidents);
  }

  // Hospitals
  async fetchAuthoritativeHospitals() {
    try {
      const res = await apiClient.getHospitals();
      if (res && res.success && Array.isArray(res.data)) {
        this.isBackendOnline = true;
        const mapped = res.data.map((h) => ({
          id: h.id,
          name: h.name,
          shortName: h.shortName,
          location: { lat: h.lat, lng: h.lng },
          address: h.address,
          phone: h.phone,
          category: h.category,
          traumaLevel: h.traumaLevel,
          hasICU: h.hasICU,
          hasCardiac: h.hasCardiac,
          hasBurnUnit: h.hasBurnUnit,
          totalBeds: h.totalBeds,
          availableBedsSimulated: h.availableBedsSimulated,
          source: h.capacitySource,
          status: h.status,
          lastVerified: h.lastVerified,
        }));
        this.fallback.saveHospitals(mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Backend hospitals fetch failed, using fallback:', e);
    }
    return this.fallback.getHospitals();
  }

  getHospitals() {
    return this.fallback.getHospitals();
  }

  saveHospitals(hospitals) {
    this.fallback.saveHospitals(hospitals);
  }

  // Ambulances
  async fetchAuthoritativeAmbulances() {
    try {
      const res = await apiClient.getAmbulances();
      if (res && res.success && Array.isArray(res.data)) {
        this.isBackendOnline = true;
        const mapped = res.data.map((a) => ({
          id: a.id,
          callSign: a.callSign,
          type: a.type,
          status: a.status === 'AVAILABLE' ? 'Available' : a.status === 'DISPATCHED' ? 'Dispatched' : a.status === 'AT_HOSPITAL' ? 'At Hospital' : a.status,
          location: { lat: a.lat, lng: a.lng },
          baseStation: a.baseStation,
          driver: a.driverName,
          driverPhone: a.driverPhone,
          equipment: a.equipment,
          fuelBatteryPercent: a.fuelBatteryPercent,
          speedKmH: a.speedKmH,
          assignedIncidentId: a.assignedIncidentId,
        }));
        this.fallback.saveAmbulances(mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Backend ambulances fetch failed, using fallback:', e);
    }
    return this.fallback.getAmbulances();
  }

  getAmbulances() {
    return this.fallback.getAmbulances();
  }

  saveAmbulances(ambulances) {
    this.fallback.saveAmbulances(ambulances);
  }

  // Signals
  async fetchAuthoritativeSignals() {
    try {
      const res = await apiClient.getSignals();
      if (res && res.success && Array.isArray(res.data)) {
        this.isBackendOnline = true;
        const mapped = res.data.map((s) => ({
          id: s.id,
          intersectionName: s.intersectionName,
          location: { lat: s.lat, lng: s.lng },
          state: s.state.toLowerCase(),
          connectivity: s.connectivity,
          operatingMode: s.operatingMode,
          hardwareProto: s.hardwareProto,
          lastAck: s.lastAck,
        }));
        this.fallback.saveSignals(mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Backend signals fetch failed, using fallback:', e);
    }
    return this.fallback.getSignals();
  }

  getSignals() {
    return this.fallback.getSignals();
  }

  saveSignals(signals) {
    this.fallback.saveSignals(signals);
  }

  clearAll() {
    this.fallback.clearAll();
  }
}

export const storageService = new PostgresBackendStorageAdapter();
