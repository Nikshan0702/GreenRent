// lib/api.js
import { Platform } from 'react-native';
export const API_BASE = Platform.OS === 'ios' ? 'http://localhost:4000' : 'http://10.0.2.2:4000';

async function getJson(url) {
  const res = await fetch(url);
  const text = await res.text();
  let data = {};
  try { data = JSON.parse(text); } catch {}
  if (!res.ok || data?.success === false) throw new Error(data?.message || `HTTP ${res.status}`);
  return data;
}

export async function fetchBookings({ role, email, landlordId, page=1, limit=20, status, type, q }) {
  const qs = new URLSearchParams({ role, page: String(page), limit: String(limit) });
  if (email) qs.set('email', email);
  if (landlordId) qs.set('landlordId', landlordId);
  if (status) qs.set('status', status);
  if (type) qs.set('type', type);
  if (q) qs.set('q', q);
  return getJson(`${API_BASE}/ReviewOperations/bookings?${qs.toString()}`);
}

export async function patchBookingStatus(id, status) {
  const res = await fetch(`${API_BASE}/ReviewOperations/bookings/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const data = await res.json().catch(()=>({}));
  if (!res.ok || data?.success === false) throw new Error(data?.message || `HTTP ${res.status}`);
  return data;
}

export async function postBookingReply(id, message) {
  const res = await fetch(`${API_BASE}/ReviewOperations/bookings/${id}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  const data = await res.json().catch(()=>({}));
  if (!res.ok || data?.success === false) throw new Error(data?.message || `HTTP ${res.status}`);
  return data; // { success: true, data: { requesterAccepted } }
}

export async function fetchBookingThread(id) {
  return getJson(`${API_BASE}/ReviewOperations/bookings/${id}/messages`);
}