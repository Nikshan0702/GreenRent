// import React, { useState } from 'react';
// import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as ImagePicker from 'expo-image-picker';
// import { Ionicons } from '@expo/vector-icons';


// const API_BASE =
//   Platform.OS === 'ios'
//     ? 'http://localhost:4000'
//     : 'http://10.0.2.2:4000'; // Android emulator

// const OCR_URL = (propertyId) => `${API_BASE}/CertificateOperations/ocr/${propertyId}`;
// const GREEN = '#3cc172';

// function guessFileName(uri, fallback = 'certificate') {
//   // Try to extract filename from URI; fallback to .jpg
//   const parts = String(uri).split('/').filter(Boolean);
//   const last = parts[parts.length - 1] || `${fallback}.jpg`;
//   return last.includes('.') ? last : `${last}.jpg`;
// }

// function guessMimeFromName(name, fallback = 'image/jpeg') {
//   const lower = name.toLowerCase();
//   if (lower.endsWith('.png')) return 'image/png';
//   if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
//   if (lower.endsWith('.webp')) return 'image/webp';
//   if (lower.endsWith('.heic')) return 'image/heic';
//   if (lower.endsWith('.pdf')) return 'application/pdf';
//   return fallback;
// }

// export default function AddCertificate() {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { propertyId } = route.params || {};
//   const [busy, setBusy] = useState(false);

//   const pickAndUpload = async () => {
//     try {
//       // 1) Pick an image (PNG/JPG)
//       const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
//       if (!perm.granted) {
//         Alert.alert('Permission required', 'Please allow photo library access.');
//         return;
//       }
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images, // only images
//         quality: 1,
//       });
//       if (result.canceled) return;

//       const asset = result.assets?.[0];
//       if (!asset?.uri) {
//         Alert.alert('Error', 'No file selected.');
//         return;
//       }

//       // 2) Auth token
//       const token = await AsyncStorage.getItem('auth_token');
//       if (!token) {
//         Alert.alert('Auth required', 'Please sign in again.');
//         return;
//       }

//       setBusy(true);

//       // 3) Ensure proper name/type (PNG support)
//       const name = asset.fileName || guessFileName(asset.uri);
//       const type = asset.mimeType || guessMimeFromName(name);

//       const fd = new FormData();
//       fd.append('certificate', {
//         uri: asset.uri,
//         name,
//         type,
//       });

//       // 4) Upload
//       const res = await fetch(OCR_URL(propertyId), {
//         method: 'POST',
//         headers: {
//           Accept: 'application/json',
//           Authorization: `Bearer ${token}`,
//           // DON'T set Content-Type; RN/fetch will add boundary for FormData
//         },
//         body: fd,
//       });

//       let data = {};
//       try { data = await res.json(); } catch { /* keep empty */ }

//       // Helpful debug when it fails
//       if (!res.ok) {
//         const msg = data?.message || `Upload failed (HTTP ${res.status})`;
//         Alert.alert('Upload failed', msg);
//         return;
//       }

//       // 5) Done
//       const badge = data?.data?.ecoBadge || 'Unverified';
//       Alert.alert('Success', `Badge created: ${badge}`, [
//         { text: 'OK', onPress: () => navigation.goBack() },
//       ]);
//     } catch (e) {
//       Alert.alert('Error', e?.message || 'Upload/OCR failed');
//     } finally {
//       setBusy(false);
//     }
//   };

//   return (
//     <View className="flex-1 bg-gray-50">
//       {/* Header */}
//       <View className={`bg-white border-b border-gray-100 ${Platform.OS === 'android' ? 'pt-8' : 'pt-10'}`}>
//         <View className="flex-row items-center justify-between px-4 py-3">
//           <TouchableOpacity
//             onPress={() => navigation.goBack()}
//             className="p-2 rounded-xl bg-gray-50 border border-gray-200"
//             activeOpacity={0.8}
//           >
//             <Ionicons name="arrow-back" size={20} color="#111827" />
//           </TouchableOpacity>
//           <Text className="text-xl font-bold text-gray-900">Add Certificate</Text>
//           <View style={{ width: 40 }} />
//         </View>
//       </View>

//       {/* Body */}
//       <View className="p-5">
//         <Text className="text-gray-700 mb-2">Property ID</Text>
//         <View className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
//           <Text className="text-gray-900">{propertyId || '-'}</Text>
//         </View>

//         <TouchableOpacity
//           onPress={pickAndUpload}
//           disabled={busy}
//           className={`px-4 py-3 rounded-xl ${busy ? 'bg-[#3cc172]/70' : 'bg-[#3cc172]'}`}
//           activeOpacity={0.9}
//         >
//           <View className="flex-row items-center justify-center">
//             {busy ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <>
//                 <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
//                 <Text className="text-white font-semibold ml-2">Upload Certificate</Text>
//               </>
//             )}
//           </View>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }


// import React, { useState } from 'react';
// import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as ImagePicker from 'expo-image-picker';
// import { Ionicons } from '@expo/vector-icons';

// const API_BASE = Platform.OS === 'ios' ? 'http://localhost:4000' : 'http://10.0.2.2:4000';
// const OCR_URL = (propertyId) => `${API_BASE}/CertificateOperations/ocr/${propertyId}`;

// function guessFileName(uri, fallback = 'certificate') {
//   const parts = String(uri).split('/').filter(Boolean);
//   const last = parts[parts.length - 1] || `${fallback}.jpg`;
//   return last.includes('.') ? last : `${last}.jpg`;
// }

// function guessMimeFromName(name, fallback = 'image/jpeg') {
//   const lower = name.toLowerCase();
//   if (lower.endsWith('.png')) return 'image/png';
//   if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
//   if (lower.endsWith('.webp')) return 'image/webp';
//   if (lower.endsWith('.heic')) return 'image/heic';
//   if (lower.endsWith('.pdf')) return 'application/pdf';
//   return fallback;
// }

// export default function AddCertificate() {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { propertyId, onUpdated } = route.params || {};
//   const [busy, setBusy] = useState(false);

//   const pickAndUpload = async () => {
//     try {
//       const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
//       if (!perm.granted) {
//         Alert.alert('Permission required', 'Please allow photo library access.');
//         return;
//       }
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         quality: 1,
//       });
//       if (result.canceled) return;

//       const asset = result.assets?.[0];
//       if (!asset?.uri) {
//         Alert.alert('Error', 'No file selected.');
//         return;
//       }

//       const token = await AsyncStorage.getItem('auth_token');
//       if (!token) {
//         Alert.alert('Auth required', 'Please sign in again.');
//         return;
//       }

//       setBusy(true);

//       const name = asset.fileName || guessFileName(asset.uri);
//       const type = asset.mimeType || guessMimeFromName(name);

//       const fd = new FormData();
//       fd.append('certificate', { uri: asset.uri, name, type });

//       const res = await fetch(OCR_URL(propertyId), {
//         method: 'POST',
//         headers: {
//           Accept: 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: fd,
//       });

//       let data = {};
//       try { data = await res.json(); } catch {}

//       if (!res.ok) {
//         const msg = data?.message || `Upload failed (HTTP ${res.status})`;
//         Alert.alert('Upload failed', msg);
//         return;
//       }

//       const badge = data?.data?.ecoBadge || 'Unverified';
//       // optimistic UI for previous screen
//       onUpdated?.(badge);

//       Alert.alert('Success', `Badge created: ${badge}`, [
//         { text: 'OK', onPress: () => navigation.goBack() },
//       ]);
//     } catch (e) {
//       Alert.alert('Error', e?.message || 'Upload/OCR failed');
//     } finally {
//       setBusy(false);
//     }
//   };

//   return (
//     <View className="flex-1 bg-gray-50">
//       {/* Header */}
//       <View className={`bg-white border-b border-gray-100 ${Platform.OS === 'android' ? 'pt-8' : 'pt-10'}`}>
//         <View className="flex-row items-center justify-between px-4 py-3">
//           <TouchableOpacity
//             onPress={() => navigation.goBack()}
//             className="p-2 rounded-xl bg-gray-50 border border-gray-200"
//             activeOpacity={0.8}
//           >
//             <Ionicons name="arrow-back" size={20} color="#111827" />
//           </TouchableOpacity>
//           <Text className="text-xl font-bold text-gray-900">Add Certificate</Text>
//           <View style={{ width: 40 }} />
//         </View>
//       </View>

//       {/* Body */}
//       <View className="p-5">
//         <Text className="text-gray-700 mb-2">Property ID</Text>
//         <View className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
//           <Text className="text-gray-900">{propertyId || '-'}</Text>
//         </View>

//         <TouchableOpacity
//           onPress={pickAndUpload}
//           disabled={busy}
//           className={`px-4 py-3 rounded-xl ${busy ? 'bg-[#3cc172]/70' : 'bg-[#3cc172]'}`}
//           activeOpacity={0.9}
//         >
//           <View className="flex-row items-center justify-center">
//             {busy ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <>
//                 <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
//                 <Text className="text-white font-semibold ml-2">Upload Certificate</Text>
//               </>
//             )}
//           </View>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }







import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, Alert, ActivityIndicator,
  Platform, ScrollView
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

import EcoFeaturesSelector from "../Property/EcoFeaturesSelector";
import { API_BASE }from '../config/api.js';

// const API_BASE = Platform.OS === "ios" ? "http://localhost:4000" : "http://10.0.2.2:4000";
const OCR_URL = (propertyId) => `${API_BASE}/CertificateOperations/ocr/${propertyId}`;
const DEL_CERT_URL = (propertyId) => `${API_BASE}/CertificateOperations/${propertyId}`;
const ECO_URL = (propertyId) => `${API_BASE}/PropertyOperations/${propertyId}/eco`;
const PROP_URL = (propertyId) => `${API_BASE}/PropertyOperations/${propertyId}`;

function guessFileName(uri, fallback = "certificate") {
  const parts = String(uri).split("/").filter(Boolean);
  const last = parts[parts.length - 1] || `${fallback}.jpg`;
  return last.includes(".") ? last : `${last}.jpg`;
}

function guessMimeFromName(name, fallback = "image/jpeg") {
  const lower = name.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".heic")) return "image/heic";
  if (lower.endsWith(".pdf")) return "application/pdf";
  return fallback;
}

export default function AddCertificate() {
  const route = useRoute();
  const navigation = useNavigation();
  const { propertyId, onUpdated } = route.params || {};

  const [busy, setBusy] = useState(false);
  const [ecoFeatures, setEcoFeatures] = useState([]);
  const [ecoScore, setEcoScore] = useState(0);
  const [ecoBadge, setEcoBadge] = useState("Unverified");
  const [certificate, setCertificate] = useState(null);

  useEffect(() => {
    console.log("[API_BASE]", API_BASE);
  }, []);

  const loadProperty = useCallback(async () => {
    if (!propertyId) return;
    try {
      const res = await fetch(PROP_URL(propertyId));
      const js = await res.json();
      if (res.ok && js?.data) {
        const p = js.data;
        setEcoFeatures(Array.isArray(p.ecoFeatures) ? p.ecoFeatures : []);
        setEcoScore(Number(p.ecoScore || 0));
        setEcoBadge(p.ecoBadge || "Unverified");
        setCertificate(p.ecoCertificate || null);
      }
    } catch {
      // ignore
    }
  }, [propertyId]);

  useEffect(() => { loadProperty(); }, [loadProperty]);

  const saveEcoFeatures = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) return Alert.alert("Auth required", "Please sign in again.");

      setBusy(true);
      const res = await fetch(ECO_URL(propertyId), {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ecoFeatures }),
      });
      const js = await res.json();
      if (!res.ok) throw new Error(js?.message || "Failed to save eco features");

      const p = js?.data || {};
      setEcoScore(Number(p.ecoScore || 0));
      setEcoBadge(p.ecoBadge || "Unverified");

      onUpdated?.(p.ecoBadge || "Unverified");
      Alert.alert("Saved", "Eco features updated.");
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setBusy(false);
    }
  };

  const clearEcoFeatures = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) return Alert.alert("Auth required", "Please sign in again.");
      setBusy(true);
      const res = await fetch(ECO_URL(propertyId), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const js = await res.json();
      if (!res.ok) throw new Error(js?.message || "Failed to clear eco features");

      const p = js?.data || {};
      setEcoFeatures([]);
      setEcoScore(Number(p.ecoScore || 0));
      setEcoBadge(p.ecoBadge || "Unverified");
      onUpdated?.(p.ecoBadge || "Unverified");
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setBusy(false);
    }
  };

  const pickAndUpload = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission required", "Please allow photo library access.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 1,
      });
      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.uri) return Alert.alert("Error", "No file selected.");

      const token = await AsyncStorage.getItem("auth_token");
      if (!token) return Alert.alert("Auth required", "Please sign in again.");

      setBusy(true);

      const name = asset.fileName || guessFileName(asset.uri);
      const type = asset.mimeType || guessMimeFromName(name);

      const fd = new FormData();
      fd.append("certificate", { uri: asset.uri, name, type });

      const res = await fetch(OCR_URL(propertyId), {
        method: "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        body: fd,
      });

      const js = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(js?.message || `Upload failed (HTTP ${res.status})`);

      const p = js?.data || {};
      setCertificate(p.certificate || null);
      setEcoBadge(p.ecoBadge || "Unverified");
      setEcoScore(Number(p.ecoScore || 0));
      onUpdated?.(p.ecoBadge || "Unverified");

      Alert.alert("Success", `Certificate processed. Badge: ${p.ecoBadge || "Unverified"}`);
    } catch (e) {
      Alert.alert("Error", e?.message || "Upload/OCR failed");
    } finally {
      setBusy(false);
    }
  };

  const deleteCertificate = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) return Alert.alert("Auth required", "Please sign in again.");

      setBusy(true);
      const res = await fetch(DEL_CERT_URL(propertyId), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const js = await res.json();
      if (!res.ok) throw new Error(js?.message || "Failed to delete certificate");

      const p = js?.data || {};
      setCertificate(null);
      setEcoBadge(p.ecoBadge || "Unverified");
      setEcoScore(Number(p.ecoScore || 0));
      onUpdated?.(p.ecoBadge || "Unverified");
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className={`bg-white border-b border-gray-100 ${Platform.OS === "android" ? "pt-8" : "pt-10"}`}>
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 rounded-xl bg-gray-50 border border-gray-200" activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Eco & Certificate</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView className="p-5">
        {/* Eco Features Card */}
        <View className="bg-white border border-gray-200 rounded-2xl p-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="leaf-outline" size={18} color="#065f46" />
            <Text className="ml-2 text-base font-bold text-gray-900">Eco Features</Text>
            <View style={{ marginLeft: "auto" }}>
              <Text className="text-xs text-gray-500">Score: {ecoFeatures.length} / 5</Text>
            </View>
          </View>

          <EcoFeaturesSelector selected={ecoFeatures} onChange={setEcoFeatures} />

          <View className="flex-row mt-3">
            <TouchableOpacity
              onPress={saveEcoFeatures}
              disabled={busy}
              className={`flex-1 mr-2 py-3 rounded-xl ${busy ? "bg-emerald-600/70" : "bg-emerald-600"}`}
              activeOpacity={0.9}
            >
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-center">Save Features</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={clearEcoFeatures}
              disabled={busy}
              className={`flex-1 py-3 rounded-xl ${busy ? "bg-gray-200" : "bg-gray-100"}`}
              activeOpacity={0.9}
              style={{ borderWidth: 1, borderColor: "#e5e7eb" }}
            >
              <Text className="text-gray-800 font-semibold text-center">Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Certificate Card */}
        <View className="bg-white border border-gray-200 rounded-2xl p-4 mt-6">
          <View className="flex-row items-center mb-2">
            <Ionicons name="document-text-outline" size={18} color="#1f2937" />
            <Text className="ml-2 text-base font-bold text-gray-900">Certificate</Text>
            <View style={{ marginLeft: "auto" }}>
              <Text className="text-xs text-gray-500">Badge: <Text style={{ fontWeight: "700" }}>{ecoBadge}</Text></Text>
            </View>
          </View>

          {certificate ? (
            <>
              <Text className="text-[13px] text-gray-700">Issuer: {certificate.issuer || "-"}</Text>
              <Text className="text-[13px] text-gray-700">Rating: {certificate.ratingRaw || "-"}</Text>
              <Text className="text-[13px] text-gray-700">Valid until: {certificate.validUntil || "-"}</Text>
              <Text className="text-[13px] text-gray-700">Confidence: {typeof certificate.confidence === "number" ? Math.round(certificate.confidence * 100) + "%" : "-"}</Text>

              <View className="flex-row mt-3">
                <TouchableOpacity
                  onPress={pickAndUpload}
                  disabled={busy}
                  className={`flex-1 mr-2 py-3 rounded-xl ${busy ? "bg-blue-600/60" : "bg-blue-600"}`}
                  activeOpacity={0.9}
                >
                  {busy ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold text-center">Replace</Text>}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={deleteCertificate}
                  disabled={busy}
                  className={`flex-1 py-3 rounded-xl ${busy ? "bg-red-600/60" : "bg-red-600"}`}
                  activeOpacity={0.9}
                >
                  {busy ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold text-center">Delete</Text>}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <TouchableOpacity
              onPress={pickAndUpload}
              disabled={busy}
              className={`mt-1 py-3 rounded-xl ${busy ? "bg-[#3cc172]/70" : "bg-[#3cc172]"}`}
              activeOpacity={0.9}
            >
              {busy ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold text-center">Upload Certificate</Text>}
            </TouchableOpacity>
          )}
        </View>

        {/* Current summary */}
        <View className="bg-white border border-gray-200 rounded-2xl p-4 mt-6 mb-6">
          <Text className="text-[13px] text-gray-700">Current Eco Score: <Text style={{ fontWeight: "700" }}>{ecoScore}</Text></Text>
          <Text className="text-[13px] text-gray-700">Current Eco Badge: <Text style={{ fontWeight: "700" }}>{ecoBadge}</Text></Text>
        </View>
      </ScrollView>
    </View>
  );
}