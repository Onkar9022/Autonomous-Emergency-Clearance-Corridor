// AECC Unified Backend API Client
// Handles authenticated HTTP requests to Express & PostgreSQL backend

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.token = typeof window !== 'undefined' ? localStorage.getItem('aecc_auth_token') : null;
  }

  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('aecc_auth_token', token);
      } else {
        localStorage.removeItem('aecc_auth_token');
      }
    }
  }

  getToken() {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('aecc_auth_token');
    }
    return this.token;
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error || 'API Request failed');
        error.status = response.status;
        error.details = data.details;
        throw error;
      }

      return data;
    } catch (err) {
      // Re-throw with status if present
      throw err;
    }
  }

  // Auth endpoints
  async login(email, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async getBootstrapUsers() {
    return this.request('/auth/bootstrap');
  }

  // Dashboard Metrics
  async getMetrics() {
    return this.request('/dashboard/metrics');
  }

  // Incidents
  async getIncidents(status) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/incidents${query}`);
  }

  async getIncident(id) {
    return this.request(`/incidents/${id}`);
  }

  async createIncident(incidentData) {
    return this.request('/incidents', {
      method: 'POST',
      body: JSON.stringify(incidentData),
    });
  }

  async assignAmbulance(incidentId, ambulanceId) {
    return this.request(`/incidents/${incidentId}/ambulance`, {
      method: 'PATCH',
      body: JSON.stringify({ ambulanceId }),
    });
  }

  async selectHospital(incidentId, hospitalId) {
    return this.request(`/incidents/${incidentId}/hospital`, {
      method: 'PATCH',
      body: JSON.stringify({ hospitalId }),
    });
  }

  async resolveIncident(incidentId) {
    return this.request(`/incidents/${incidentId}/resolve`, {
      method: 'POST',
    });
  }

  // Hospitals
  async getHospitals() {
    return this.request('/hospitals');
  }

  async rankHospitals(lat, lng, category) {
    return this.request(`/hospitals/rank?lat=${lat}&lng=${lng}&category=${encodeURIComponent(category || '')}`);
  }

  // Ambulances
  async getAmbulances() {
    return this.request('/ambulances');
  }

  async releaseAmbulance(id) {
    return this.request(`/ambulances/${id}/release`, {
      method: 'PATCH',
    });
  }

  // Green Corridors
  async getActiveCorridor() {
    return this.request('/corridors/active');
  }

  async updateCorridorStatus(id, status, signalsSequenceJson) {
    return this.request(`/corridors/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, signalsSequenceJson }),
    });
  }

  // Traffic Signals
  async getSignals() {
    return this.request('/signals');
  }

  async toggleSignalState(id, state) {
    return this.request(`/signals/${id}/state`, {
      method: 'POST',
      body: JSON.stringify({ state }),
    });
  }

  // Events / Audit Logs
  async getEvents(limit = 50) {
    return this.request(`/events?limit=${limit}`);
  }

  getExportCSVUrl() {
    return `${API_BASE_URL}/reports/csv`;
  }

  // Health & Settings
  async getHealth() {
    return this.request('/health');
  }

  async getSettings() {
    return this.request('/health/settings');
  }

  async updateSetting(key, value) {
    return this.request('/health/settings', {
      method: 'POST',
      body: JSON.stringify({ key, value }),
    });
  }

  async resetBackendDemoData() {
    return this.request('/health/settings/reset', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();
