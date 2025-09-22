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


import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const API_BASE = Platform.OS === 'ios' ? 'http://localhost:4000' : 'http://10.0.2.2:4000';
const OCR_URL = (propertyId) => `${API_BASE}/CertificateOperations/ocr/${propertyId}`;

function guessFileName(uri, fallback = 'certificate') {
  const parts = String(uri).split('/').filter(Boolean);
  const last = parts[parts.length - 1] || `${fallback}.jpg`;
  return last.includes('.') ? last : `${last}.jpg`;
}

function guessMimeFromName(name, fallback = 'image/jpeg') {
  const lower = name.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.heic')) return 'image/heic';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  return fallback;
}

export default function AddCertificate() {
  const route = useRoute();
  const navigation = useNavigation();
  const { propertyId, onUpdated } = route.params || {};
  const [busy, setBusy] = useState(false);

  const pickAndUpload = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission required', 'Please allow photo library access.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.uri) {
        Alert.alert('Error', 'No file selected.');
        return;
      }

      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        Alert.alert('Auth required', 'Please sign in again.');
        return;
      }

      setBusy(true);

      const name = asset.fileName || guessFileName(asset.uri);
      const type = asset.mimeType || guessMimeFromName(name);

      const fd = new FormData();
      fd.append('certificate', { uri: asset.uri, name, type });

      const res = await fetch(OCR_URL(propertyId), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });

      let data = {};
      try { data = await res.json(); } catch {}

      if (!res.ok) {
        const msg = data?.message || `Upload failed (HTTP ${res.status})`;
        Alert.alert('Upload failed', msg);
        return;
      }

      const badge = data?.data?.ecoBadge || 'Unverified';
      // optimistic UI for previous screen
      onUpdated?.(badge);

      Alert.alert('Success', `Badge created: ${badge}`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e?.message || 'Upload/OCR failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className={`bg-white border-b border-gray-100 ${Platform.OS === 'android' ? 'pt-8' : 'pt-10'}`}>
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-2 rounded-xl bg-gray-50 border border-gray-200"
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Add Certificate</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      {/* Body */}
      <View className="p-5">
        <Text className="text-gray-700 mb-2">Property ID</Text>
        <View className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
          <Text className="text-gray-900">{propertyId || '-'}</Text>
        </View>

        <TouchableOpacity
          onPress={pickAndUpload}
          disabled={busy}
          className={`px-4 py-3 rounded-xl ${busy ? 'bg-[#3cc172]/70' : 'bg-[#3cc172]'}`}
          activeOpacity={0.9}
        >
          <View className="flex-row items-center justify-center">
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
                <Text className="text-white font-semibold ml-2">Upload Certificate</Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}