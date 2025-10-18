// src/config/api.js
// Automatically works for Android emulator, iOS simulator, and Expo Go (real phone)
import { Platform } from 'react-native';
import Constants from 'expo-constants';

function getDevIP() {
  // Example Expo host strings: "192.168.1.8:8081", "192.168.1.8:19000"
  const host = Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost;
  return host ? host.split(':')[0] : null;
}

const PORT = 4000;

export const API_BASE = __DEV__
  ? Platform.select({
      ios: (() => {
        const ip = getDevIP();
        return `http://${ip ?? 'localhost'}:${PORT}`;
      })(),
      android: (() => {
        const ip = getDevIP();
        return `http://${ip ?? '10.0.2.2'}:${PORT}`;
      })(),
      default: (() => {
        const ip = getDevIP();
        return `http://${ip ?? 'localhost'}:${PORT}`;
      })(),
    })
  : (process.env.EXPO_PUBLIC_API_URL || 'https://your-prod-api.example.com');