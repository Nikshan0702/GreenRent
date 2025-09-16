// api.js
import axios from 'axios';
import { Platform } from 'react-native';

const TUNNEL_HTTPS = ''; // e.g. 'https://<your-ngrok-id>.ngrok.io'

const getBaseURL = () => {
  if (TUNNEL_HTTPS) return TUNNEL_HTTPS;
  if (Platform.OS === 'android') return 'http://10.0.2.2:4000';
  return 'http://127.0.0.1:4000';
};

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});