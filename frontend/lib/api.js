// // lib/api.js
// import { Platform } from 'react-native';

// import { API_BASE }from '../config/api.js';
// // export const API_BASE = Platform.OS === 'ios' ? 'http://localhost:4000' : 'http://10.0.2.2:4000';

// async function getJson(url) {
//   const res = await fetch(url);
//   const text = await res.text();
//   let data = {};
//   try { data = JSON.parse(text); } catch {}
//   if (!res.ok || data?.success === false) throw new Error(data?.message || `HTTP ${res.status}`);
//   return data;
// }

// // lib/api.js
// export async function fetchBookings({ role, email, landlordId, page=1, limit=20, status, type, q }) {
//   const qs = new URLSearchParams({ role, page: String(page), limit: String(limit) });
//   if (email) qs.set('email', email);
//   if (landlordId) qs.set('landlordId', landlordId);
//   if (status) qs.set('status', status);
//   if (type) qs.set('type', type);
//   if (q) qs.set('q', q);

//   const url = `${API_BASE}/ReviewOperations/bookings?${qs.toString()}`;
//   const res = await fetch(url);
//   const txt = await res.text();
//   let data = {};
//   try { data = JSON.parse(txt); } catch (e) {
//     console.log('fetchBookings non-JSON:', txt?.slice(0, 300));
//   }
//   if (!res.ok || data?.success === false) {
//     throw new Error(data?.message || `HTTP ${res.status}`);
//   }
//   return data;
// }

// export async function patchBookingStatus(id, status) {
//   const res = await fetch(`${API_BASE}/ReviewOperations/bookings/${id}/status`, {
//     method: 'PATCH',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ status }),
//   });
//   const data = await res.json().catch(()=>({}));
//   if (!res.ok || data?.success === false) throw new Error(data?.message || `HTTP ${res.status}`);
//   return data;
// }

// export async function postBookingReply(id, message) {
//   const res = await fetch(`${API_BASE}/ReviewOperations/bookings/${id}/reply`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ message }),
//   });
//   const data = await res.json().catch(()=>({}));
//   if (!res.ok || data?.success === false) throw new Error(data?.message || `HTTP ${res.status}`);
//   return data; // { success: true, data: { requesterAccepted } }
// }

// export async function fetchBookingThread(id) {
//   return getJson(`${API_BASE}/ReviewOperations/bookings/${id}/messages`);
// }


// lib/api.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../config/api.js';

// ---- helpers --------------------------------------------------
async function authHeader() {
  const token = await AsyncStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchJson(url, options = {}) {
  const baseHeaders = {
    Accept: 'application/json',
    ...(options.headers || {}),
    ...(await authHeader()),
  };

  const res = await fetch(url, { ...options, headers: baseHeaders });
  const text = await res.text();

  let data = {};
  try { data = JSON.parse(text); } catch {
    // keep raw text for debugging if server didn't return JSON
    console.log('[fetchJson] non-JSON response head:', text?.slice(0, 300));
  }

  if (!res.ok || data?.success === false) {
    const msg = data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

function qs(params = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).length) sp.set(k, String(v));
  });
  return sp.toString();
}

// ---- API functions --------------------------------------------

// GET /ReviewOperations/bookings?role=&email=&landlordId=&page=&limit=&status=&type=&q=
export async function fetchBookings({
  role,
  email,
  landlordId,
  page = 1,
  limit = 20,
  status,
  type,
  q,
}) {
  const query = qs({ role, email, landlordId, page, limit, status, type, q });
  const url = `${API_BASE}/ReviewOperations/bookings${query ? `?${query}` : ''}`;
  return fetchJson(url); // { success: true, data: ... }
}

// PATCH /ReviewOperations/bookings/:id/status  { status }
export async function patchBookingStatus(id, status) {
  const url = `${API_BASE}/ReviewOperations/bookings/${encodeURIComponent(id)}/status`;
  return fetchJson(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

// POST /ReviewOperations/bookings/:id/reply  { message }
export async function postBookingReply(id, message) {
  const url = `${API_BASE}/ReviewOperations/bookings/${encodeURIComponent(id)}/reply`;
  return fetchJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
}

// GET /ReviewOperations/bookings/:id/messages
export async function fetchBookingThread(id) {
  const url = `${API_BASE}/ReviewOperations/bookings/${encodeURIComponent(id)}/messages`;
  return fetchJson(url);
}