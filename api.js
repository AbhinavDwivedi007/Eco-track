/**
 * EcoTrack - Frontend API Client
 * Seamlessly interfaces the frontend with the Node.js / Express backend.
 * Handles JWT authentication, user session, carbon calculations, and history.
 */

const EcoApi = {
  // Determine API base URL
  getBaseUrl() {
    if (window.location.protocol === 'file:') {
      return 'http://localhost:5000/api';
    }
    if (window.location.port === '5000') {
      return '/api';
    }
    return 'http://localhost:5000/api';
  },

  // Token & Session Management
  getToken() {
    return localStorage.getItem('ecotrack_auth_token');
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('ecotrack_auth_token', token);
    } else {
      localStorage.removeItem('ecotrack_auth_token');
    }
  },

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('ecotrack_auth_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem('ecotrack_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ecotrack_auth_user');
    }
    window.dispatchEvent(new CustomEvent('ecotrack_user_change', { detail: user }));
  },

  isAuthenticated() {
    return Boolean(this.getToken());
  },

  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...customHeaders
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  // Check backend server connectivity
  async checkHealth() {
    try {
      const res = await fetch(`${this.getBaseUrl()}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        return { online: true, data };
      }
    } catch (e) {
      // offline
    }
    return { online: false };
  },

  // Auth: Register
  async register(name, email, password) {
    try {
      const res = await fetch(`${this.getBaseUrl()}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        this.setToken(data.token);
        this.setCurrentUser(data.user);
        return { success: true, user: data.user, token: data.token };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch (err) {
      return { success: false, message: 'Server connection failed. Please ensure the backend is running.' };
    }
  },

  // Auth: Login
  async login(email, password) {
    try {
      const res = await fetch(`${this.getBaseUrl()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        this.setToken(data.token);
        this.setCurrentUser(data.user);
        return { success: true, user: data.user, token: data.token };
      }
      return { success: false, message: data.message || 'Invalid credentials' };
    } catch (err) {
      return { success: false, message: 'Server connection failed. Please ensure the backend is running.' };
    }
  },

  // Auth: Logout
  logout() {
    this.setToken(null);
    this.setCurrentUser(null);
  },

  // Auth: Get current user profile
  async getMe() {
    if (!this.getToken()) return null;
    try {
      const res = await fetch(`${this.getBaseUrl()}/auth/me`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          this.setCurrentUser(data.user);
          return data.user;
        }
      }
    } catch (err) {
      console.warn('Could not fetch user profile from backend:', err);
    }
    return this.getCurrentUser();
  },

  // POST /api/carbon/calculate
  async calculateFootprint(payload) {
    try {
      const res = await fetch(`${this.getBaseUrl()}/carbon/calculate`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.user) {
          this.setCurrentUser(json.data.user);
        }
        return json.data;
      }
    } catch (err) {
      console.warn('Backend calculate failed or offline:', err);
    }
    return null;
  },

  // POST /api/carbon/simulate
  async simulateHabit(currentMode, newMode, dailyKm) {
    try {
      const res = await fetch(`${this.getBaseUrl()}/carbon/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentMode, newMode, dailyKm })
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('Backend simulate failed:', err);
    }
    return null;
  },

  // GET /api/carbon/history
  async getHistory(limit = 20) {
    try {
      const res = await fetch(`${this.getBaseUrl()}/carbon/history?limit=${limit}`, {
        headers: this.getHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('Backend get history failed:', err);
    }
    return null;
  },

  // GET /api/carbon/history/summary
  async getSummary() {
    try {
      const res = await fetch(`${this.getBaseUrl()}/carbon/history/summary`, {
        headers: this.getHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('Backend get summary failed:', err);
    }
    return null;
  },

  // =========================================================================
  // My Green Plants API Endpoints
  // =========================================================================

  // GET /api/plants
  async getPlants() {
    try {
      const res = await fetch(`${this.getBaseUrl()}/plants`, {
        headers: this.getHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (err) {
      console.warn('Backend getPlants failed:', err);
    }
    return [];
  },

  // GET /api/plants/summary
  async getPlantSummary() {
    try {
      const res = await fetch(`${this.getBaseUrl()}/plants/summary`, {
        headers: this.getHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('Backend getPlantSummary failed:', err);
    }
    return null;
  },

  // POST /api/plants
  async addPlant(plantData) {
    try {
      const res = await fetch(`${this.getBaseUrl()}/plants`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(plantData)
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('Backend addPlant failed:', err);
      return { success: false, message: 'Could not connect to plant storage service' };
    }
  },

  // DELETE /api/plants/:id
  async deletePlant(plantId) {
    try {
      const res = await fetch(`${this.getBaseUrl()}/plants/${plantId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('Backend deletePlant failed:', err);
      return { success: false, message: 'Could not connect to plant service' };
    }
  },

  // POST /api/plants/identify
  async identifyPlant(payload) {
    try {
      const res = await fetch(`${this.getBaseUrl()}/plants/identify`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('Backend identifyPlant failed:', err);
      return { success: false, message: 'Identification service unavailable' };
    }
  },

  // GET /api/plants/species
  async getSpeciesCatalog() {
    try {
      const res = await fetch(`${this.getBaseUrl()}/plants/species`, {
        headers: this.getHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (err) {
      console.warn('Backend getSpeciesCatalog failed:', err);
    }
    return [];
  }
};

window.EcoApi = EcoApi;
