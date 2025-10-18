// // api.js
// import axios from 'axios';
// import { Platform } from 'react-native';

// const TUNNEL_HTTPS = ''; // e.g. 'https://<your-ngrok-id>.ngrok.io'

// const getBaseURL = () => {
//   if (TUNNEL_HTTPS) return TUNNEL_HTTPS;
//   if (Platform.OS === 'android') return 'http://10.0.2.2:4000';
//   return 'http://127.0.0.1:4000';
// };

// export const api = axios.create({
//   baseURL: getBaseURL(),
//   headers: { 'Content-Type': 'application/json' },
//   timeout: 20000,
// });

// config/api.js (client)
import { Platform } from 'react-native';
import Constants from 'expo-constants';

function getDevIP() {
  const host = Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost;
  return host ? host.split(':')[0] : null;
}

const PORT = 4000;
// If you later add a global prefix like '/api', set it here.
const API_PREFIX = ''; // e.g. '/api' if your server uses app.use('/api', ...)

export const API_BASE = __DEV__
  ? Platform.select({
      ios: (() => {
        const ip = getDevIP();
        return `http://${ip ?? 'localhost'}:${PORT}${API_PREFIX}`;
      })(),
      android: (() => {
        const ip = getDevIP();
        return `http://${ip ?? '10.0.2.2'}:${PORT}${API_PREFIX}`;
      })(),
      default: (() => {
        const ip = getDevIP();
        return `http://${ip ?? 'localhost'}:${PORT}${API_PREFIX}`;
      })(),
    })
  : (process.env.EXPO_PUBLIC_API_URL || 'https://your-prod-api.example.com');

const build = (p) => `${API_BASE}${p}`;