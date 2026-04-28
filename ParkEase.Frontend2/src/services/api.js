// src/services/api.js
// Base API configuration for all microservices

import axios from 'axios';

// ── Service Base URLs ──────────────────────────────
const AUTH_URL      = 'http://localhost:5000/api/v1';
const LOT_URL       = 'http://localhost:5002/api/v1';
const SPOT_URL      = 'http://localhost:5003/api/v1';
const VEHICLE_URL   = 'http://localhost:5004/api/v1';
const BOOKING_URL   = 'http://localhost:5005/api/v1';
const PAYMENT_URL   = 'http://localhost:5006/api/v1';
const NOTIF_URL     = 'http://localhost:5007/api/v1';

// ── Axios instance with JWT interceptor ───────────
const createApi = (baseURL) => {
  const instance = axios.create({ baseURL });

  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const authApi    = createApi(AUTH_URL);
export const lotApi     = createApi(LOT_URL);
export const spotApi    = createApi(SPOT_URL);
export const vehicleApi = createApi(VEHICLE_URL);
export const bookingApi = createApi(BOOKING_URL);
export const paymentApi = createApi(PAYMENT_URL);
export const notifApi   = createApi(NOTIF_URL);
