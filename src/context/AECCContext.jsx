// AECC Central Application State & Real-Time Simulation Engine
// Implements shared reactive state across all 13 Console views and Demonstration Mode

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  INITIAL_HOSPITALS,
  INITIAL_AMBULANCES,
  INITIAL_TRAFFIC_SIGNALS,
  DEMO_SCENARIO,
} from '../data/solapurData';
import { getRoadRoutes, calculateHaversineDistance } from '../services/routingService';
import { rankHospitalsForIncident } from '../services/hospitalService';
import { storageService } from '../services/storageService';
import { apiClient } from '../services/apiClient';

const AECCContext = createContext(null);

function formatBackendIncident(bInc) {
  if (!bInc) return null;
  return {
    id: bInc.id,
    category: bInc.category,
    severity: bInc.severity,
    status: bInc.status === 'REPORTED' ? 'Reported' : bInc.status === 'DISPATCHED' ? 'Dispatched' : bInc.status === 'RESOLVED' ? 'Resolved' : bInc.status,
    location: {
      address: bInc.address,
      lat: bInc.lat,
      lng: bInc.lng,
    },
    patientReference: bInc.patientReference,
    patientCount: bInc.patientCount,
    medicalRequirements: bInc.medicalRequirements,
    reportingSource: bInc.reportingSource,
    notes: bInc.notes,
    destinationHospitalId: bInc.destinationHospitalId,
    assignedAmbulanceId: bInc.assignedAmbulance?.id || null,
    selectedRouteId: bInc.routes?.find((r) => r.isSelected)?.id || bInc.routes?.[0]?.id || null,
    timeSavedMinutes: bInc.timeSavedMinutes,
    totalTravelMinutes: bInc.totalTravelMinutes,
    createdAt: bInc.createdAt,
    completedAt: bInc.completedAt,
    routes: bInc.routes
      ? bInc.routes.map((r) => ({
          ...r,
          geometry: typeof r.geometryJson === 'string' ? JSON.parse(r.geometryJson) : r.geometryJson || [],
          scoreBreakdown: typeof r.scoreBreakdownJson === 'string' ? JSON.parse(r.scoreBreakdownJson) : r.scoreBreakdownJson || {},
        }))
      : undefined,
    corridorPlan: bInc.corridorPlan
      ? {
          ...bInc.corridorPlan,
          signals: typeof bInc.corridorPlan.signalsSequenceJson === 'string' ? JSON.parse(bInc.corridorPlan.signalsSequenceJson) : bInc.corridorPlan.signalsSequenceJson || [],
        }
      : undefined,
  };
}

export function AECCProvider({ children }) {
  // Operating Mode & User Roles
  const [operatingMode, setOperatingMode] = useState('SIMULATION'); // 'SIMULATION' | 'LIVE INTEGRATION'
  const [userRole, setUserRole] = useState('Emergency Operator'); // 'Administrator' | 'Emergency Operator' | 'Read-Only Observer'
  const [currentUser, setCurrentUser] = useState({
    id: 'user-02',
    email: 'operator@aecc.gov',
    fullName: 'Ritesh Kulkarni (Senior Dispatcher)',
    role: 'EMERGENCY_OPERATOR',
    department: 'Central Emergency Dispatch Centre',
  });
  const [backendOnline, setBackendOnline] = useState(false);
  const [dataSourceLabel, setDataSourceLabel] = useState('Checking PostgreSQL backend...');

  // Municipal Datasets via Storage Service
  const [hospitals, setHospitals] = useState(() => storageService.getHospitals());
  const [ambulances, setAmbulances] = useState(() => storageService.getAmbulances());
  const [trafficSignals, setTrafficSignals] = useState(() => storageService.getSignals());

  // Incidents
  const [incidents, setIncidents] = useState(() => {
    const saved = storageService.getIncidents();
    return saved && saved.length > 0
      ? saved
      : [
          {
            id: 'INC-2026-8801',
            category: 'Road accident',
            severity: 'High',
            location: { lat: 17.6620, lng: 75.9040, address: 'Near Railway Station Chowk, Solapur' },
            patientCount: 1,
            patientReference: 'PAT-REF-8801',
            status: 'Resolved',
            assignedAmbulanceId: 'AMB-02',
            destinationHospitalId: 'HOSP-02',
            createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
            completedAt: new Date(Date.now() - 3600000 * 2.5).toISOString(),
            timeSavedMinutes: 8,
            totalTravelMinutes: 11,
          },
        ];
  });

  const [activeIncident, setActiveIncident] = useState(null);
  const [rankedHospitals, setRankedHospitals] = useState([]);
  const [availableRoutes, setAvailableRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [corridorPlan, setCorridorPlan] = useState(null);

  // Simulation Engine State
  const [simStatus, setSimStatus] = useState('idle'); // 'idle' | 'running' | 'paused' | 'completed'
  const [simSpeed, setSimSpeed] = useState(1); // 1, 2, 5
  const [simPhase, setSimPhase] = useState('idle'); // 'dispatch' | 'scene' | 'transport' | 'hospital' | 'completed'
  const [simProgress, setSimProgress] = useState(0); // 0 to 1
  const [ambulancePos, setAmbulancePos] = useState(null);
  const [currentSpeedKmH, setCurrentSpeedKmH] = useState(0);
  const [remainingDistanceKm, setRemainingDistanceKm] = useState(0);
  const [estArrivalSeconds, setEstArrivalSeconds] = useState(0);

  // Real-Time Event Feed
  const [events, setEvents] = useState(() => [
    {
      id: 'EVT-INIT',
      timestamp: new Date().toLocaleTimeString(),
      category: 'System',
      severity: 'Info',
      message: 'AECC Decision Engine & Dispatch Gateway initialized in SIMULATION mode.',
    },
  ]);

  const addEvent = useCallback((category, severity, message, incidentId = null) => {
    const newEvt = {
      id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString(),
      category,
      severity,
      message,
      incidentId,
    };
    setEvents((prev) => [newEvt, ...prev.slice(0, 75)]);
  }, []);

  // Save to storageService on updates
  useEffect(() => {
    storageService.saveIncidents(incidents);
  }, [incidents]);

  // Initial Synchronization with Authoritative Neon PostgreSQL Backend
  useEffect(() => {
    async function syncBackendData() {
      const isHealthy = await storageService.checkHealth();
      setBackendOnline(isHealthy);
      setDataSourceLabel(storageService.sourceLabel);

      if (isHealthy) {
        // Authenticate with default operator role if not already authenticated
        if (!apiClient.getToken()) {
          try {
            const loginRes = await apiClient.login('operator@aecc.gov', 'Operator@AECC2026!');
            if (loginRes?.user) setCurrentUser(loginRes.user);
          } catch (e) {
            console.warn('Initial backend login error:', e);
          }
        } else {
          try {
            const meRes = await apiClient.getMe();
            if (meRes?.user) setCurrentUser(meRes.user);
          } catch {}
        }

        // Hydrate state from PostgreSQL
        try {
          const [incList, hospList, ambList, sigList] = await Promise.all([
            storageService.fetchAuthoritativeIncidents(),
            storageService.fetchAuthoritativeHospitals(),
            storageService.fetchAuthoritativeAmbulances(),
            storageService.fetchAuthoritativeSignals(),
          ]);

          if (incList && incList.length > 0) setIncidents(incList);
          if (hospList && hospList.length > 0) setHospitals(hospList);
          if (ambList && ambList.length > 0) setAmbulances(ambList);
          if (sigList && sigList.length > 0) setTrafficSignals(sigList);

          addEvent('System', 'Success', 'Authoritative state loaded from Neon PostgreSQL (AWS us-east-2).');
        } catch (err) {
          console.warn('PostgreSQL data hydration warning:', err);
        }
      } else {
        addEvent('System', 'Info', 'Operating in local sandbox mode. LocalStorage fallback active.');
      }
    }

    syncBackendData();
  }, [addEvent]);

  // Role Switcher with Server-side JWT Authentication
  const switchRole = useCallback(
    async (targetRole) => {
      setUserRole(targetRole);

      const roleCreds = {
        Administrator: { email: 'admin@aecc.gov', password: 'Admin@AECC2026!' },
        'Emergency Operator': { email: 'operator@aecc.gov', password: 'Operator@AECC2026!' },
        'Read-Only Observer': { email: 'observer@aecc.gov', password: 'Observer@AECC2026!' },
      };

      const creds = roleCreds[targetRole] || roleCreds['Emergency Operator'];

      if (backendOnline) {
        try {
          const res = await apiClient.login(creds.email, creds.password);
          if (res?.user) {
            setCurrentUser(res.user);
            addEvent('Security', 'Success', `Session authenticated as ${res.user.fullName} (${res.user.role}).`);
          }
        } catch (e) {
          addEvent('Security', 'Warning', `Server auth switch failed: ${e.message}`);
        }
      } else {
        addEvent('Security', 'Info', `Active role switched to ${targetRole} (Demo mode).`);
      }
    },
    [backendOnline, addEvent]
  );

  // Recalculate hospital rankings whenever active incident changes
  useEffect(() => {
    if (activeIncident) {
      const ranked = rankHospitalsForIncident(activeIncident, hospitals);
      setRankedHospitals(ranked);
    } else {
      setRankedHospitals([]);
    }
  }, [activeIncident, hospitals]);

  // Identify signals along the route and build Corridor Plan
  const planGreenCorridor = useCallback(
    (route, ambId, hospId) => {
      if (!route || !route.geometry || route.geometry.length < 2) return null;

      // Find signals close to any route waypoint (< 450m)
      const matchedSignals = [];
      const thresholdKm = 0.45;

      trafficSignals.forEach((sig) => {
        let minDist = Infinity;
        let bestWaypointIdx = 0;
        route.geometry.forEach((pt, idx) => {
          const d = calculateHaversineDistance(sig.location.lat, sig.location.lng, pt[0], pt[1]);
          if (d < minDist) {
            minDist = d;
            bestWaypointIdx = idx;
          }
        });

        if (minDist <= thresholdKm) {
          matchedSignals.push({
            ...sig,
            waypointIndex: bestWaypointIdx,
            progressPct: bestWaypointIdx / (route.geometry.length - 1),
            estEtaSeconds: Math.round((bestWaypointIdx / (route.geometry.length - 1)) * (route.durationMinutes * 60)),
            corridorState: 'Pending Priority Hold',
          });
        }
      });

      // Sort in order of travel
      matchedSignals.sort((a, b) => a.waypointIndex - b.waypointIndex);

      const plan = {
        id: `COR-${Date.now()}`,
        status: 'Planned', // 'Planned' | 'Requested' | 'Active' | 'Released'
        routeId: route.id,
        ambulanceId: ambId,
        hospitalId: hospId,
        signals: matchedSignals,
        createdAt: new Date().toISOString(),
      };

      setCorridorPlan(plan);
      addEvent('Corridor', 'Success', `Green Corridor planned with ${matchedSignals.length} coordinated intersections.`);
      return plan;
    },
    [trafficSignals, addEvent]
  );

  // Create Emergency Function with Strict Availability Check and PostgreSQL Persistence
  const createEmergency = useCallback(
    async (incidentData) => {
      // 1. Try real PostgreSQL backend write
      if (backendOnline) {
        try {
          const res = await apiClient.createIncident({
            category: incidentData.category,
            severity: incidentData.severity,
            location: {
              address: incidentData.location.address,
              lat: incidentData.location.lat,
              lng: incidentData.location.lng,
            },
            patientReference: incidentData.patientReference,
            patientCount: incidentData.patientCount || 1,
            medicalRequirements: incidentData.medicalRequirements,
            reportingSource: incidentData.reportingSource,
            notes: incidentData.notes,
          });

          if (res && res.success && res.data) {
            const formatted = formatBackendIncident(res.data);
            setIncidents((prev) => [formatted, ...prev.filter((i) => i.id !== formatted.id)]);
            setActiveIncident(formatted);

            if (formatted.routes && formatted.routes.length > 0) {
              setAvailableRoutes(formatted.routes);
              setSelectedRoute(formatted.routes[0]);
            }

            if (formatted.corridorPlan) {
              setCorridorPlan(formatted.corridorPlan);
            }

            // Sync authoritative fleet and signals
            const [updatedAmbs, updatedSigs] = await Promise.all([
              storageService.fetchAuthoritativeAmbulances(),
              storageService.fetchAuthoritativeSignals(),
            ]);
            if (updatedAmbs) setAmbulances(updatedAmbs);
            if (updatedSigs) setTrafficSignals(updatedSigs);

            addEvent(
              'Emergency',
              'Critical',
              `[PostgreSQL] New ${formatted.severity} Emergency: ${formatted.category} at ${formatted.location.address}`,
              formatted.id
            );
            return formatted;
          }
        } catch (err) {
          addEvent('System', 'Warning', `PostgreSQL write failed (${err.message}). Using local state.`);
        }
      }

      // 2. Fallback local execution
      const generatedId = `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newInc = {
        status: 'Reported',
        createdAt: new Date().toISOString(),
        ...incidentData,
        id: incidentData.id && !incidents.some((i) => i.id === incidentData.id)
          ? incidentData.id
          : generatedId,
      };

      setIncidents((prev) => [newInc, ...prev]);
      setActiveIncident(newInc);
      addEvent('Emergency', 'Critical', `New ${newInc.severity} Emergency: ${newInc.category} at ${newInc.location.address}`, newInc.id);

      // Rank nearby hospitals
      const ranked = rankHospitalsForIncident(newInc, hospitals);
      setRankedHospitals(ranked);

      const bestHosp = ranked[0] || hospitals[0];
      const availableAmbs = ambulances.filter((a) => a.status === 'Available');
      const bestAmb = availableAmbs.length > 0 ? availableAmbs[0] : null;

      if (!bestAmb) {
        addEvent('Fleet', 'Warning', 'ALERT: No ambulances currently available in sector! Awaiting vehicle turnaround.', newInc.id);
      } else {
        setAmbulances((prev) => {
          const list = prev.map((a) => (a.id === bestAmb.id ? { ...a, status: 'Dispatched', assignedIncidentId: newInc.id } : a));
          storageService.saveAmbulances(list);
          return list;
        });
      }

      // Retrieve routes
      const routes = await getRoadRoutes(newInc.location, bestHosp.location, newInc.severity);
      setAvailableRoutes(routes);
      const topRoute = routes[0];
      setSelectedRoute(topRoute);

      // Update incident references
      const updatedInc = {
        ...newInc,
        destinationHospitalId: bestHosp.id,
        assignedAmbulanceId: bestAmb ? bestAmb.id : null,
        selectedRouteId: topRoute.id,
      };
      setActiveIncident(updatedInc);
      setIncidents((prev) => {
        const list = prev.map((inc) => (inc.id === newInc.id ? updatedInc : inc));
        storageService.saveIncidents(list);
        return list;
      });

      if (bestAmb) {
        planGreenCorridor(topRoute, bestAmb.id, bestHosp.id);
      }
      return updatedInc;
    },
    [backendOnline, hospitals, ambulances, incidents, addEvent, planGreenCorridor]
  );

  // Manual Selection Handlers
  const selectHospital = useCallback(
    async (hospId) => {
      const hosp = hospitals.find((h) => h.id === hospId);
      if (!hosp || !activeIncident) return;

      if (backendOnline) {
        try {
          const res = await apiClient.selectHospital(activeIncident.id, hospId);
          if (res && res.success && res.data) {
            const formatted = formatBackendIncident(res.data);
            setActiveIncident(formatted);
            setIncidents((prev) => prev.map((inc) => (inc.id === activeIncident.id ? formatted : inc)));
            if (formatted.routes && formatted.routes.length > 0) {
              setAvailableRoutes(formatted.routes);
              setSelectedRoute(formatted.routes[0]);
              planGreenCorridor(formatted.routes[0], formatted.assignedAmbulanceId, hospId);
            }
            addEvent('Hospital', 'Info', `[PostgreSQL] Destination set to ${hosp.name}`, activeIncident.id);
            return;
          }
        } catch (err) {
          console.warn('Backend hospital selection failed, falling back to local:', err);
        }
      }

      const updated = { ...activeIncident, destinationHospitalId: hospId };
      setActiveIncident(updated);
      setIncidents((prev) => {
        const list = prev.map((inc) => (inc.id === activeIncident.id ? updated : inc));
        storageService.saveIncidents(list);
        return list;
      });
      addEvent('Hospital', 'Info', `Destination set to ${hosp.name}`, activeIncident.id);

      // Recalculate routes to new destination
      const routes = await getRoadRoutes(activeIncident.location, hosp.location, activeIncident.severity);
      setAvailableRoutes(routes);
      setSelectedRoute(routes[0]);
      planGreenCorridor(routes[0], activeIncident.assignedAmbulanceId, hospId);
    },
    [backendOnline, hospitals, activeIncident, addEvent, planGreenCorridor]
  );

  // Strictly enforce: Never assign an unavailable ambulance (with server-side concurrency check)
  const assignAmbulance = useCallback(
    async (ambId) => {
      const amb = ambulances.find((a) => a.id === ambId);
      if (!amb || !activeIncident) return false;

      if (backendOnline) {
        try {
          const res = await apiClient.assignAmbulance(activeIncident.id, ambId);
          if (res && res.success) {
            const updatedAmbs = await storageService.fetchAuthoritativeAmbulances();
            if (updatedAmbs) setAmbulances(updatedAmbs);

            const updated = { ...activeIncident, assignedAmbulanceId: ambId, status: 'Dispatched' };
            setActiveIncident(updated);
            setIncidents((prev) => prev.map((inc) => (inc.id === activeIncident.id ? updated : inc)));
            addEvent('Fleet', 'Success', `[PostgreSQL] Ambulance ${amb.callSign} (${amb.type}) successfully assigned.`, activeIncident.id);
            return true;
          }
        } catch (err) {
          addEvent('Fleet', 'Warning', `ASSIGNMENT REJECTED: ${err.message}`, activeIncident.id);
          return false;
        }
      }

      // Local fallback enforcement
      if (amb.status !== 'Available' && amb.assignedIncidentId !== activeIncident.id) {
        addEvent('Fleet', 'Warning', `ASSIGNMENT REJECTED: ${amb.callSign} is currently ${amb.status}. Only Available units can be dispatched.`, activeIncident.id);
        return false;
      }

      setAmbulances((prev) => {
        const updatedAmbs = prev.map((a) =>
          a.id === ambId
            ? { ...a, status: 'Dispatched', assignedIncidentId: activeIncident.id }
            : a.assignedIncidentId === activeIncident.id
            ? { ...a, status: 'Available', assignedIncidentId: null }
            : a
        );
        storageService.saveAmbulances(updatedAmbs);
        return updatedAmbs;
      });

      const updated = { ...activeIncident, assignedAmbulanceId: ambId, status: 'Dispatched' };
      setActiveIncident(updated);
      setIncidents((prev) => {
        const list = prev.map((inc) => (inc.id === activeIncident.id ? updated : inc));
        storageService.saveIncidents(list);
        return list;
      });
      addEvent('Fleet', 'Success', `Ambulance ${amb.callSign} (${amb.type}) successfully assigned.`, activeIncident.id);
      return true;
    },
    [backendOnline, ambulances, activeIncident, addEvent]
  );

  const selectRoute = useCallback(
    (routeId) => {
      const route = availableRoutes.find((r) => r.id === routeId);
      if (!route || !activeIncident) return;

      setSelectedRoute(route);
      setAvailableRoutes((prev) => prev.map((r) => ({ ...r, selected: r.id === routeId })));
      planGreenCorridor(route, activeIncident.assignedAmbulanceId, activeIncident.destinationHospitalId);
      addEvent('Routing', 'Info', `Route changed to: ${route.name} (${route.distanceKm} km, ${route.durationMinutes} min)`, activeIncident.id);
    },
    [availableRoutes, activeIncident, planGreenCorridor, addEvent]
  );

  // Virtual Signal Toggle with RBAC Enforcement (Operator / Admin only)
  const toggleSignalState = useCallback(
    async (signalId, newState) => {
      if (userRole === 'Read-Only Observer') {
        addEvent('Security', 'Warning', 'ACCESS DENIED: Role \'READ_ONLY_OBSERVER\' cannot modify municipal signal states.');
        return false;
      }

      if (backendOnline) {
        try {
          await apiClient.toggleSignalState(signalId, newState.toUpperCase());
          addEvent('Traffic Signal', 'Success', `[PostgreSQL] Signal ${signalId} set to ${newState.toUpperCase()} in database.`);
        } catch (err) {
          if (err.status === 403) {
            addEvent('Security', 'Warning', `ACCESS DENIED: Role '${currentUser.role}' is not permitted to modify traffic signals.`);
            return false;
          }
        }
      }

      setTrafficSignals((prev) => {
        const list = prev.map((sig) => (sig.id === signalId ? { ...sig, state: newState, lastAck: 'Just now (Virtual Hold)' } : sig));
        storageService.saveSignals(list);
        return list;
      });
      addEvent('Traffic Signal', 'Warning', `Signal ${signalId} manually toggled to ${newState.toUpperCase()} by ${userRole} in simulation.`);
      return true;
    },
    [userRole, backendOnline, currentUser.role, addEvent]
  );

  // Manual Incident Resolution by Operator
  const resolveIncident = useCallback(
    async (incId = null) => {
      const targetId = incId || activeIncident?.id;
      if (!targetId) return;

      if (backendOnline) {
        try {
          await apiClient.resolveIncident(targetId);
          addEvent('Emergency', 'Success', `[PostgreSQL] Incident ${targetId} marked RESOLVED in database.`, targetId);
          const [updatedAmbs, updatedSigs] = await Promise.all([
            storageService.fetchAuthoritativeAmbulances(),
            storageService.fetchAuthoritativeSignals(),
          ]);
          if (updatedAmbs) setAmbulances(updatedAmbs);
          if (updatedSigs) setTrafficSignals(updatedSigs);
        } catch (err) {
          console.warn('Backend resolve error:', err);
        }
      }

      const targetInc = incidents.find((i) => i.id === targetId);
      const updated = {
        ...(targetInc || activeIncident),
        status: 'Resolved',
        completedAt: new Date().toISOString(),
        timeSavedMinutes: selectedRoute?.estTimeSavedMinutes || 7,
        totalTravelMinutes: Math.round((selectedRoute?.durationMinutes || 8) * 0.6),
      };

      setIncidents((prev) => {
        const list = prev.map((i) => (i.id === targetId ? updated : i));
        storageService.saveIncidents(list);
        return list;
      });

      if (activeIncident?.id === targetId) {
        setActiveIncident(updated);
      }

      // Free assigned ambulance back to Available
      if (updated.assignedAmbulanceId) {
        setAmbulances((prev) => {
          const list = prev.map((a) => (a.id === updated.assignedAmbulanceId ? { ...a, status: 'Available', assignedIncidentId: null } : a));
          storageService.saveAmbulances(list);
          return list;
        });
      }

      // Release Corridor & Restore Signals
      setCorridorPlan((prev) => (prev ? { ...prev, status: 'Released' } : null));
      setTrafficSignals((prev) => {
        const list = prev.map((s) => ({
          ...s,
          state: 'green',
          lastAck: 'Corridor Released (Equilibrium Restored)',
        }));
        storageService.saveSignals(list);
        return list;
      });

      setSimStatus('idle');
      setSimPhase('idle');
      setSimProgress(0);
      setCurrentSpeedKmH(0);

      addEvent('Emergency', 'Success', `Incident ${targetId} marked RESOLVED by operator. Resources returned to service.`, targetId);
    },
    [backendOnline, activeIncident, incidents, selectedRoute, addEvent]
  );

  // ==========================================
  // REAL-TIME SIMULATION ANIMATION ENGINE
  // ==========================================
  const simIntervalRef = useRef(null);
  const demoTimeoutsRef = useRef([]);

  const startSimulation = useCallback(() => {
    if (!selectedRoute || !selectedRoute.geometry || selectedRoute.geometry.length < 2) return;

    setSimStatus('running');
    setSimPhase('transport');
    addEvent('Simulation', 'Success', 'Autonomous Priority Green Corridor initiated along route.');

    // Activate Corridor & Signals
    setCorridorPlan((prev) => (prev ? { ...prev, status: 'Active' } : null));
    setTrafficSignals((prev) =>
      prev.map((s) => ({
        ...s,
        state: 'priority_active',
        lastAck: 'Locked by AECC Cloud',
      }))
    );
  }, [selectedRoute, addEvent]);

  const pauseSimulation = useCallback(() => {
    setSimStatus('paused');
    addEvent('Simulation', 'Info', 'Simulation paused by operator.');
  }, [addEvent]);

  const resumeSimulation = useCallback(() => {
    setSimStatus('running');
    addEvent('Simulation', 'Info', 'Simulation resumed.');
  }, [addEvent]);

  const resetSimulation = useCallback(() => {
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    demoTimeoutsRef.current.forEach((t) => clearTimeout(t));
    demoTimeoutsRef.current = [];

    setSimStatus('idle');
    setSimPhase('idle');
    setSimProgress(0);
    setCurrentSpeedKmH(0);
    if (selectedRoute && selectedRoute.geometry) {
      setAmbulancePos({ lat: selectedRoute.geometry[0][0], lng: selectedRoute.geometry[0][1] });
      setRemainingDistanceKm(selectedRoute.distanceKm);
      setEstArrivalSeconds(selectedRoute.durationMinutes * 60);
    }
    // Restore signal states
    setTrafficSignals((prev) => {
      const list = prev.map((s) => ({
        ...s,
        state: 'red',
        lastAck: 'Normal cycle restored',
      }));
      storageService.saveSignals(list);
      return list;
    });
    // Restore assigned ambulance to Available
    setAmbulances((prev) => {
      const list = prev.map((a) =>
        a.assignedIncidentId === activeIncident?.id || a.status === 'At Hospital' || a.status === 'Dispatched'
          ? { ...a, status: 'Available', assignedIncidentId: null }
          : a
      );
      storageService.saveAmbulances(list);
      return list;
    });
    setCorridorPlan((prev) => (prev ? { ...prev, status: 'Planned' } : null));
    addEvent('Simulation', 'Info', 'Simulation reset to origin state.');
  }, [selectedRoute, activeIncident, addEvent]);

  // Main Animation Tick Effect
  useEffect(() => {
    if (simStatus !== 'running' || !selectedRoute || !selectedRoute.geometry) {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
      }
      return;
    }

    const geom = selectedRoute.geometry;
    const totalPoints = geom.length;
    const tickMs = 100;
    // Base progression: full route in 35 seconds at 1x speed
    const stepPct = (1 / (350 / simSpeed));

    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    simIntervalRef.current = setInterval(() => {
      setSimProgress((prev) => {
        const next = prev + stepPct;

        if (next >= 1) {
          clearInterval(simIntervalRef.current);
          simIntervalRef.current = null;
          setSimStatus('completed');
          setSimPhase('completed');
          setAmbulancePos({ lat: geom[geom.length - 1][0], lng: geom[geom.length - 1][1] });
          setCurrentSpeedKmH(0);
          setRemainingDistanceKm(0);
          setEstArrivalSeconds(0);

          // Mark incident resolved & complete
          if (activeIncident) {
            const completed = {
              ...activeIncident,
              status: 'Resolved',
              completedAt: new Date().toISOString(),
              timeSavedMinutes: selectedRoute.estTimeSavedMinutes || 7,
              totalTravelMinutes: Math.round(selectedRoute.durationMinutes * 0.6),
            };
            setIncidents((incList) => incList.map((i) => (i.id === activeIncident.id ? completed : i)));
            setActiveIncident(completed);
            addEvent('Simulation', 'Success', `Ambulance reached hospital! Trauma Bay handover confirmed. Time saved: ${completed.timeSavedMinutes} mins.`, activeIncident.id);
          }

          // Release green corridor & restore signals
          setCorridorPlan((cp) => (cp ? { ...cp, status: 'Released' } : null));
          setTrafficSignals((sigs) => {
            const list = sigs.map((s) => ({
              ...s,
              state: 'green',
              lastAck: 'Corridor Released (Civilian Restore)',
            }));
            storageService.saveSignals(list);
            return list;
          });

          // Reset ambulance status to At Hospital
          if (activeIncident?.assignedAmbulanceId) {
            setAmbulances((ambs) => {
              const updated = ambs.map((a) => (a.id === activeIncident.assignedAmbulanceId ? { ...a, status: 'At Hospital' } : a));
              storageService.saveAmbulances(updated);
              return updated;
            });
          }

          return 1;
        }

        // Interpolate current position along polyline
        const exactIndex = next * (totalPoints - 1);
        const lowIndex = Math.floor(exactIndex);
        const highIndex = Math.min(lowIndex + 1, totalPoints - 1);
        const subFraction = exactIndex - lowIndex;

        const p1 = geom[lowIndex];
        const p2 = geom[highIndex];
        const lat = p1[0] + (p2[0] - p1[0]) * subFraction;
        const lng = p1[1] + (p2[1] - p1[1]) * subFraction;

        setAmbulancePos({ lat, lng });

        // Update live metrics
        const speed = Math.round(55 + Math.sin(next * Math.PI * 4) * 12);
        setCurrentSpeedKmH(speed);
        setRemainingDistanceKm(parseFloat((selectedRoute.distanceKm * (1 - next)).toFixed(2)));
        setEstArrivalSeconds(Math.max(0, Math.round(selectedRoute.durationMinutes * 60 * (1 - next))));

        // Dynamically update signals along route as ambulance approaches
        setCorridorPlan((cp) => {
          if (!cp || !cp.signals) return cp;
          const updatedSignals = cp.signals.map((sig) => {
            const sigPct = sig.progressPct;
            let cState = sig.corridorState;
            if (next >= sigPct + 0.08) {
              cState = 'Passed (Corridor Flushed)';
            } else if (next >= sigPct - 0.08) {
              cState = 'Active Priority Corridor';
            } else {
              cState = 'Holding Feeder Red (Approaching)';
            }
            return { ...sig, corridorState: cState };
          });
          return { ...cp, signals: updatedSignals };
        });

        return next;
      });
    }, tickMs);

    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [simStatus, simSpeed, selectedRoute, activeIncident, addEvent]);

  // ==========================================
  // ONE-CLICK "START LIVE DEMONSTRATION"
  // ==========================================
  const startLiveDemonstration = useCallback(async () => {
    resetSimulation();
    addEvent('System', 'Critical', '🚀 DEMONSTRATION INITIATED: Saat Rasta Multi-Vehicle Incident in Solapur.');

    const demoInc = await createEmergency(DEMO_SCENARIO.incident);

    // Auto-select recommended Hospital and Ambulance
    const t1 = setTimeout(() => {
      selectHospital(DEMO_SCENARIO.recommendedHospitalId);
      assignAmbulance(DEMO_SCENARIO.recommendedAmbulanceId);
    }, 400);

    // Auto-start simulation movement
    const t2 = setTimeout(() => {
      startSimulation();
    }, 1200);

    demoTimeoutsRef.current = [t1, t2];
  }, [resetSimulation, createEmergency, selectHospital, assignAmbulance, startSimulation, addEvent]);

  return (
    <AECCContext.Provider
      value={{
        operatingMode,
        setOperatingMode,
        userRole,
        setUserRole,
        hospitals,
        setHospitals,
        ambulances,
        setAmbulances,
        trafficSignals,
        setTrafficSignals,
        incidents,
        setIncidents,
        activeIncident,
        setActiveIncident,
        rankedHospitals,
        availableRoutes,
        selectedRoute,
        corridorPlan,
        simStatus,
        simSpeed,
        setSimSpeed,
        simPhase,
        simProgress,
        ambulancePos,
        currentSpeedKmH,
        remainingDistanceKm,
        estArrivalSeconds,
        events,
        addEvent,
        createEmergency,
        selectHospital,
        assignAmbulance,
        selectRoute,
        toggleSignalState,
        planGreenCorridor,
        startSimulation,
        pauseSimulation,
        resumeSimulation,
        resetSimulation,
        startLiveDemonstration,
        resolveIncident,
        currentUser,
        setCurrentUser,
        backendOnline,
        dataSourceLabel,
        switchRole,
      }}
    >
      {children}
    </AECCContext.Provider>
  );
}

export function useAECC() {
  const context = useContext(AECCContext);
  if (!context) {
    throw new Error('useAECC must be used within an AECCProvider');
  }
  return context;
}
