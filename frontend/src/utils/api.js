// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3000';
const AWS_REGION = import.meta.env.VITE_AWS_REGION || 'us-east-1';
const COGNITO_USER_POOL_ID = import.meta.env.VITE_COGNITO_USER_POOL_ID || '';
const COGNITO_CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID || '';

// Get auth token from local storage or session
function getAuthToken() {
  return localStorage.getItem('idToken') || '';
}

// API Client
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = getAuthToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

const api = new ApiClient(API_BASE_URL);

// Train Search API
export async function searchTrains(from, to, date) {
  try {
    const result = await api.get('/trains/search', { from, to, date });
    console.log('Raw API result:', result);
    console.log('result.trains:', result.trains);
    return result.trains || [];
  } catch (error) {
    console.error('Search trains error:', error);
    throw error;
  }
}

// Create Booking API
export async function createBooking(bookingData) {
  try {
    const result = await api.post('/bookings', bookingData);
    return result;
  } catch (error) {
    console.error('Create booking error:', error);
    throw error;
  }
}

// Get User Bookings API
export async function getBookings() {
  try {
    const result = await api.get('/bookings');
    return result.bookings || [];
  } catch (error) {
    console.error('Get bookings error:', error);
    throw error;
  }
}

// Cancel Booking API
export async function cancelBooking(pnr) {
  try {
    const result = await api.delete(`/bookings/${pnr}`);
    return result;
  } catch (error) {
    console.error('Cancel booking error:', error);
    throw error;
  }
}

// Cognito Authentication helpers
export const cognitoConfig = {
  region: AWS_REGION,
  userPoolId: COGNITO_USER_POOL_ID,
  clientId: COGNITO_CLIENT_ID,
};

export function isAuthenticated() {
  const token = getAuthToken();
  if (!token) return false;

  try {
    // Decode JWT and check expiration
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function logout() {
  localStorage.removeItem('idToken');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/login';
}

export function setTokens(idToken, accessToken, refreshToken) {
  localStorage.setItem('idToken', idToken);
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}
