// import React, { useEffect, useState, useCallback } from 'react';
// import { View, Text, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useNavigation } from '@react-navigation/native';
// import { Ionicons } from '@expo/vector-icons';
// import { API_BASE } from '../config/api.js';

// const ensureAbsolute = (u) => !u ? u : /^https?:\/\//.test(u) ? u : `${API_BASE}/${String(u).replace(/^\/?/, '').replace(/\\/g, '/')}`;
// const currency = (n) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(Number(n || 0));

// // Simple scoring helpers (UNCHANGED)
// const BADGE_ORDER = ['Unverified', 'Bronze', 'Silver', 'Gold', 'Platinum'];
// const badgeScore = (b) => Math.max(0, BADGE_ORDER.indexOf(b || 'Unverified'));
// const num = (v) => (typeof v === 'number' ? v : Number(v) || 0);

// const FIELDS = [
//   { key: 'title', label: 'Title' },
//   { key: 'rentPrice', label: 'Rent', render: (v) => currency(v) + '/mo' },
//   { key: 'propertyType', label: 'Type' },
//   { key: 'bedrooms', label: 'Bedrooms' },
//   { key: 'bathrooms', label: 'Bathrooms' },
//   { key: 'ecoBadge', label: 'Eco Badge' },
//   { key: 'energyRating', label: 'Energy Rating' },
//   { key: 'ecoFeatures', label: 'Eco Features', render: (v) => Array.isArray(v) ? v.join(', ') : '' },
//   { key: 'address', label: 'Address' },
// ];

// export default function Compare() {
//   const navigation = useNavigation();
//   const [items, setItems] = useState(null); // wishlist from backend
//   const [loading, setLoading] = useState(false);
//   const [selected, setSelected] = useState([]); // array of property ids

//   // LOAD (UNCHANGED)
//   const load = useCallback(async () => {
//     setLoading(true);
//     try {
//       const token = await AsyncStorage.getItem('auth_token');
//       if (!token) throw new Error('Sign in required');
//       const res = await fetch(`${API_BASE}/UserOperations/wishlist`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json().catch(() => ({}));
//       if (!res.ok || data?.success === false) throw new Error(data?.message || 'Failed to load saved properties');
//       setItems(Array.isArray(data?.data) ? data.data : []);
//     } catch (e) {
//       Alert.alert('Error', e.message || 'Could not load saved properties');
//       setItems([]);
//     }
//     setLoading(false);
//   }, []);

//   useEffect(() => { load(); }, [load]);

//   // SELECT (UNCHANGED)
//   const toggleSelect = (id) => {
//     setSelected((prev) => {
//       const has = prev.includes(id);
//       if (has) return prev.filter((x) => x !== id);
//       if (prev.length >= 2) { Alert.alert('Limit', 'Select only two properties to compare.'); return prev; }
//       return [...prev, id];
//     });
//   };

//   // SUMMARY (UNCHANGED)
//   const computeSummary = (a, b) => {
//     if (!a || !b) return null;
//     const aEco = Array.isArray(a.ecoFeatures) ? a.ecoFeatures.length : 0;
//     const bEco = Array.isArray(b.ecoFeatures) ? b.ecoFeatures.length : 0;
//     const criteria = [
//       { key: 'ecoScore', a: aEco, b: bEco, higherBetter: true, label: 'Eco features' },
//       { key: 'ecoBadge', a: badgeScore(a.ecoBadge), b: badgeScore(b.ecoBadge), higherBetter: true, label: 'Eco badge' },
//       { key: 'rentPrice', a: num(a.rentPrice), b: num(b.rentPrice), higherBetter: false, label: 'Rent price' },
//       { key: 'bedrooms', a: num(a.bedrooms), b: num(b.bedrooms), higherBetter: true, label: 'Bedrooms' },
//       { key: 'bathrooms', a: num(a.bathrooms), b: num(b.bathrooms), higherBetter: true, label: 'Bathrooms' },
//       { key: 'energyRating', a: num(a.energyRating), b: num(b.energyRating), higherBetter: true, label: 'Energy rating' },
//     ];
//     let winsA = 0;
//     let winsB = 0;
//     criteria.forEach((c) => {
//       if (c.a === c.b) return;
//       const aBetter = c.higherBetter ? c.a > c.b : c.a < c.b;
//       if (aBetter) winsA += 1; else winsB += 1;
//     });
//     const total = winsA + winsB || 1;
//     const pctA = Math.round((winsA / total) * 100);
//     const pctB = 100 - pctA;
//     return { winsA, winsB, total, pctA, pctB };
//   };

//   return (
//     <View className="flex-1 bg-white">
//       {/* ======= Header ======= */}
//       <View className="bg-white border-b border-gray-100" style={{ paddingTop: 12, paddingBottom: 10, paddingHorizontal: 16 }}>
//         <View className="flex-row items-center justify-between">
//           <TouchableOpacity
//             onPress={() => navigation.goBack()}
//             className="rounded-xl"
//             style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' }}
//             activeOpacity={0.9}
//           >
//             <Ionicons name="arrow-back" size={20} color="#111827" />
//           </TouchableOpacity>
//           <Text className="text-lg font-extrabold text-gray-900">Compare Apartments</Text>
//           <View style={{ width: 40 }} />
//         </View>
//       </View>

//       {/* ======= Body ======= */}
//       {loading && !items ? (
//         <View className="flex-1 items-center justify-center bg-white">
//           <ActivityIndicator />
//         </View>
//       ) : items && items.length === 0 ? (
//         <View className="flex-1 items-center justify-center bg-white px-6">
//           <Ionicons name="stats-chart-outline" size={30} color="#94a3b8" />
//           <Text className="text-[12px] text-gray-500 mt-2 text-center">
//             No saved apartments to compare
//           </Text>
//         </View>
//       ) : (
//         <View style={{ flex: 1 }}>
//           {/* ======= Section: Saved Apartments ======= */}
//           <View className="px-4 pt-12 pb-3">
//             <View className="flex-row items-center justify-between">
//               <View className="flex-row items-center">
//                 <Ionicons name="heart-outline" size={18} color="#111827" />
//                 <Text className="ml-2 text-[14px] font-semibold text-gray-900">Saved Apartments</Text>
//               </View>
//               <View className="px-2 py-1 rounded-full" style={{ backgroundColor: '#F1F5F9' }}>
//                 <Text className="text-[11px] font-semibold text-gray-700">
//                   {selected.length}/2 selected
//                 </Text>
//               </View>
//             </View>
//             <Text className="text-[11px] text-gray-500 mt-1">
//               Tap to select exactly two to compare
//             </Text>
//           </View>

//           {/* Saved list with selection */}
//           <ScrollView
//             contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 6, paddingBottom: 10 }}
//             showsVerticalScrollIndicator={false}
//           >
//             {(items || []).map((it) => {
//               const img = ensureAbsolute(it?.images?.[0]?.url || it?.images?.[0]);
//               const isSel = selected.includes(it._id);
//               return (
//                 <TouchableOpacity
//                   key={it._id}
//                   activeOpacity={0.92}
//                   onPress={() => toggleSelect(it._id)}
//                   className="bg-white border rounded-2xl"
//                   style={{
//                     marginBottom: 10,
//                     paddingHorizontal: 10,
//                     paddingVertical: 10,
//                     borderColor: isSel ? '#60A5FA' : '#E5E7EB',
//                     shadowColor: '#000',
//                     shadowOpacity: 0.04,
//                     shadowRadius: 6,
//                     shadowOffset: { width: 0, height: 2 },
//                     elevation: 1
//                   }}
//                 >
//                   <View className="flex-row items-center">
//                     {/* image */}
//                     {img ? (
//                       <Image
//                         source={{ uri: img }}
//                         style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: '#F3F4F6' }}
//                       />
//                     ) : (
//                       <View style={{ width: 56, height: 56 }} className="bg-gray-100 items-center justify-center rounded-xl">
//                         <Ionicons name="image-outline" size={18} color="#9ca3af" />
//                       </View>
//                     )}

//                     {/* text */}
//                     <View style={{ flex: 1, marginLeft: 10 }}>
//                       <Text className="text-[13px] font-semibold text-gray-900" numberOfLines={1}>{it.title}</Text>
//                       <Text className="text-[11px] text-gray-500" numberOfLines={1}>{it.propertyType}</Text>
//                     </View>

//                     {/* right action: visual tick when selected */}
//                     <View
//                       className="w-9 h-9 rounded-lg items-center justify-center"
//                       style={{ backgroundColor: isSel ? '#DBEAFE' : '#F3F4F6', borderWidth: 1, borderColor: isSel ? '#93C5FD' : '#E5E7EB' }}
//                     >
//                       {isSel ? (
//                         <Ionicons name="checkmark" size={18} color="#1D4ED8" />
//                       ) : (
//                         <Ionicons name="add" size={18} color="#111827" />
//                       )}
//                     </View>
//                   </View>
//                 </TouchableOpacity>
//               );
//             })}
//           </ScrollView>

//           {/* ======= Section: Comparison (visible when 2 selected) ======= */}
//           {selected.length === 2 ? (() => {
//             const a = (items || []).find((x) => x._id === selected[0]);
//             const b = (items || []).find((x) => x._id === selected[1]);
//             const sum = computeSummary(a, b);

//             return (
//               <View style={{ borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#fff' }}>
//                 {/* Comparison header */}
//                 <View className="px-4 pt-10 pb-3">
//                   <View className="flex-row items-center">
//                     <Ionicons name="stats-chart-outline" size={18} color="#111827" />
//                     <Text className="ml-2 text-[14px] font-semibold text-gray-900">Comparison</Text>
//                   </View>
//                   <Text className="text-[11px] text-gray-500 mt-1">
//                     Side-by-side contrast of features & pricing
//                   </Text>
//                 </View>

//                 <ScrollView
//                   horizontal
//                   bounces
//                   showsHorizontalScrollIndicator={false}
//                   contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 16 }}
//                 >
//                   {/* Summary card */}
//                   <View className="mr-3" style={{ width: 260 }}>
//                     <View
//                       className="rounded-2xl border border-gray-200 p-3 bg-white"
//                       style={{
//                         shadowColor: '#000',
//                         shadowOpacity: 0.05,
//                         shadowRadius: 8,
//                         shadowOffset: { width: 0, height: 2 },
//                         elevation: 2,
//                       }}
//                     >
//                       <Text className="text-[12px] text-gray-600">Overall match</Text>

//                       <View className="mt-2">
//                         <Text className="text-[13px] font-semibold text-gray-900" numberOfLines={2}>{a?.title || 'Property A'}</Text>
//                         <View className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
//                           <View style={{ width: `${sum?.pctA ?? 50}%` }} className="h-2 bg-emerald-500" />
//                         </View>
//                         <Text className="text-[11px] text-gray-600 mt-1">{sum?.pctA ?? 50}% better for you</Text>
//                       </View>

//                       <View className="mt-3">
//                         <Text className="text-[13px] font-semibold text-gray-900" numberOfLines={2}>{b?.title || 'Property B'}</Text>
//                         <View className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
//                           <View style={{ width: `${sum?.pctB ?? 50}%` }} className="h-2 bg-indigo-500" />
//                         </View>
//                         <Text className="text-[11px] text-gray-600 mt-1">{sum?.pctB ?? 50}% overall</Text>
//                       </View>

//                       {/* legend */}
//                       <View className="flex-row items-center mt-3">
//                         <View className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10B981' }} />
//                         <Text className="text-[10px] text-gray-500 ml-1">Property A</Text>
//                         <View className="w-3 h-3 rounded-full ml-3" style={{ backgroundColor: '#6366F1' }} />
//                         <Text className="text-[10px] text-gray-500 ml-1">Property B</Text>
//                       </View>
//                     </View>
//                   </View>

//                   {/* Labels column */}
//                   <View className="mr-2" style={{ width: 170 }}>
//                     <View className="h-[145px]" />
//                     {FIELDS.map((f, i) => (
//                       <View
//                         key={f.key}
//                         className="px-3 border-b border-gray-200"
//                         style={{
//                           height: 48,
//                           justifyContent: 'center',
//                           backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
//                         }}
//                       >
//                         <Text className="text-[12px] font-semibold text-gray-700">{f.label}</Text>
//                       </View>
//                     ))}
//                   </View>

//                   {/* Two property columns */}
//                   {selected.map((sid, idx) => {
//                     const it = (items || []).find((x) => x._id === sid);
//                     const img = ensureAbsolute(it?.images?.[0]?.url || it?.images?.[0]);
//                     const otherId = selected[(idx + 1) % 2];
//                     const other = (items || []).find((x) => x._id === otherId);
//                     const betterColor = '#047857';
//                     const neutral = '#111827';
//                     const isBetterVal = (f) => {
//                       const key = f.key;
//                       let aVal = it?.[key];
//                       let bVal = other?.[key];
//                       if (key === 'ecoFeatures') { aVal = (it?.ecoFeatures||[]).length; bVal = (other?.ecoFeatures||[]).length; }
//                       if (key === 'ecoBadge') { aVal = badgeScore(it?.ecoBadge); bVal = badgeScore(other?.ecoBadge); }
//                       if (key === 'rentPrice' || key === 'bedrooms' || key === 'bathrooms' || key === 'energyRating') { aVal = num(aVal); bVal = num(bVal); }
//                       if (aVal === bVal) return null;
//                       const higherBetter = key !== 'rentPrice';
//                       const aBetter = higherBetter ? aVal > bVal : aVal < bVal;
//                       return aBetter;
//                     };
//                     return (
//                       <View
//                         key={sid}
//                         className="bg-white rounded-2xl border border-gray-200 mr-2"
//                         style={{
//                           width: 240,
//                           shadowColor: '#000',
//                           shadowOpacity: 0.05,
//                           shadowRadius: 8,
//                           shadowOffset: { width: 0, height: 2 },
//                           elevation: 2,
//                         }}
//                       >
//                         {/* mini header */}
//                         <View className="px-3 py-3 border-b border-gray-200">
//                           <View className="flex-row items-center">
//                             {img ? (
//                               <Image source={{ uri: img }} style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: '#f3f4f6' }} />
//                             ) : (
//                               <View style={{ width: 64, height: 64 }} className="bg-gray-100 items-center justify-center rounded-xl">
//                                 <Ionicons name="image-outline" size={18} color="#9ca3af" />
//                               </View>
//                             )}
//                             <View style={{ flex: 1, marginLeft: 8 }}>
//                               <Text className="text-[13px] font-semibold" numberOfLines={2}>{it?.title}</Text>
//                               <Text className="text-[11px] text-gray-500" numberOfLines={1}>{it?.propertyType}</Text>
//                             </View>
//                             <TouchableOpacity onPress={() => toggleSelect(sid)} className="px-2 py-2 rounded-xl bg-gray-100" activeOpacity={0.8}>
//                               <Ionicons name="close" size={18} color="#111827" />
//                             </TouchableOpacity>
//                           </View>
//                         </View>

//                         {/* Values */}
//                         {FIELDS.map((f, i) => {
//                           const raw = it?.[f.key];
//                           const val = f.render ? f.render(raw) : (raw ?? '');
//                           const better = isBetterVal(f);
//                           return (
//                             <View
//                               key={f.key}
//                               className="px-3 border-b border-gray-100"
//                               style={{
//                                 height: 48,
//                                 justifyContent: 'center',
//                                 backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
//                               }}
//                             >
//                               <Text
//                                 className="text-[12px] font-semibold"
//                                 style={{ color: better === null ? neutral : (better ? betterColor : neutral) }}
//                                 numberOfLines={2}
//                               >
//                                 {String(val || '')}
//                               </Text>
//                             </View>
//                           );
//                         })}

//                         <TouchableOpacity
//                           onPress={() => navigation.navigate('PropertyDetail', { property: it })}
//                           className="m-3 py-2 rounded-xl items-center"
//                           style={{ backgroundColor: '#111827' }}
//                           activeOpacity={0.95}
//                         >
//                           <Text className="text-white text-[12px] font-semibold">View details</Text>
//                         </TouchableOpacity>
//                       </View>
//                     );
//                   })}
//                 </ScrollView>
//               </View>
//             );
//           })() : null }
//         </View>
//       )}
//     </View>
//   );
// }
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator, SafeAreaView, StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE } from '../config/api.js';

const ensureAbsolute = (u) => !u ? u : /^https?:\/\//.test(u) ? u : `${API_BASE}/${String(u).replace(/^\/?/, '').replace(/\\/g, '/')}`;
const currency = (n) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(Number(n || 0));

// ----- helpers (UNCHANGED) -----
const BADGE_ORDER = ['Unverified', 'Bronze', 'Silver', 'Gold', 'Platinum'];
const badgeScore = (b) => Math.max(0, BADGE_ORDER.indexOf(b || 'Unverified'));
const num = (v) => (typeof v === 'number' ? v : Number(v) || 0);

const FIELDS = [
  { key: 'title', label: 'Title' },
  { key: 'rentPrice', label: 'Rent', render: (v) => currency(v) + '/mo' },
  { key: 'propertyType', label: 'Type' },
  { key: 'bedrooms', label: 'Bedrooms' },
  { key: 'bathrooms', label: 'Bathrooms' },
  { key: 'ecoBadge', label: 'Eco Badge' },
  { key: 'energyRating', label: 'Energy Rating' },
  { key: 'ecoFeatures', label: 'Eco Features', render: (v) => Array.isArray(v) ? v.join(', ') : '' },
  { key: 'address', label: 'Address' },
];

export default function Compare() {
  const navigation = useNavigation();
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);

  // --- page scroll refs (UI-only) ---
  const pageRef = useRef(null);
  const compareAnchorRef = useRef(null);
  const compareYRef = useRef(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) throw new Error('Sign in required');
      const res = await fetch(`${API_BASE}/UserOperations/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) throw new Error(data?.message || 'Failed to load saved properties');
      setItems(Array.isArray(data?.data) ? data.data : []);
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not load saved properties');
      setItems([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // selection (UNCHANGED) + UI scroll when exactly 2 picked
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const has = prev.includes(id);
      let next;
      if (has) next = prev.filter((x) => x !== id);
      else {
        if (prev.length >= 2) { Alert.alert('Limit', 'Select only two properties to compare.'); return prev; }
        next = [...prev, id];
      }
      // UI: if we just reached 2, scroll to comparison section
      if (next.length === 2 && pageRef.current) {
        requestAnimationFrame(() => {
          pageRef.current?.scrollTo({ y: Math.max(compareYRef.current - 8, 0), animated: true });
        });
      }
      return next;
    });
  };

  // summary (UNCHANGED)
  const computeSummary = (a, b) => {
    if (!a || !b) return null;
    const aEco = Array.isArray(a.ecoFeatures) ? a.ecoFeatures.length : 0;
    const bEco = Array.isArray(b.ecoFeatures) ? b.ecoFeatures.length : 0;
    const criteria = [
      { key: 'ecoScore', a: aEco, b: bEco, higherBetter: true, label: 'Eco features' },
      { key: 'ecoBadge', a: badgeScore(a.ecoBadge), b: badgeScore(b.ecoBadge), higherBetter: true, label: 'Eco badge' },
      { key: 'rentPrice', a: num(a.rentPrice), b: num(b.rentPrice), higherBetter: false, label: 'Rent price' },
      { key: 'bedrooms', a: num(a.bedrooms), b: num(b.bedrooms), higherBetter: true, label: 'Bedrooms' },
      { key: 'bathrooms', a: num(a.bathrooms), b: num(b.bathrooms), higherBetter: true, label: 'Bathrooms' },
      { key: 'energyRating', a: num(a.energyRating), b: num(b.energyRating), higherBetter: true, label: 'Energy rating' },
    ];
    let winsA = 0, winsB = 0;
    criteria.forEach((c) => {
      if (c.a === c.b) return;
      const aBetter = c.higherBetter ? c.a > c.b : c.a < c.b;
      if (aBetter) winsA++; else winsB++;
    });
    const total = winsA + winsB || 1;
    const pctA = Math.round((winsA / total) * 100);
    const pctB = 100 - pctA;
    return { winsA, winsB, total, pctA, pctB };
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="bg-white border-b border-gray-100" style={{ paddingTop: 6, paddingBottom: 10, paddingHorizontal: 16 }}>
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="rounded-xl"
            style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' }}
            activeOpacity={0.9}
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </TouchableOpacity>
          <Text className="text-lg font-extrabold text-gray-900">Compare Apartments</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      {/* Body states */}
      {loading && !items ? (
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator />
        </View>
      ) : items && items.length === 0 ? (
        <View className="flex-1 items-center justify-center bg-white px-6">
          <Ionicons name="stats-chart-outline" size={30} color="#94a3b8" />
          <Text className="text-[12px] text-gray-500 mt-2 text-center">No saved apartments to compare</Text>
        </View>
      ) : (
        // Single vertical scroll to avoid nested scroll fights
        <ScrollView
          ref={pageRef}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Saved Apartments */}
          <View className="px-4 pt-12 pb-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="heart-outline" size={18} color="#111827" />
                <Text className="ml-2 text-[14px] font-semibold text-gray-900">Saved Apartments</Text>
              </View>
              <View className="px-2 py-1 rounded-full" style={{ backgroundColor: '#F1F5F9' }}>
                <Text className="text-[11px] font-semibold text-gray-700">{selected.length}/2 selected</Text>
              </View>
            </View>
            <Text className="text-[11px] text-gray-500 mt-1">Tap to select exactly two to compare</Text>
          </View>

          {/* Cards list (no inner vertical ScrollView) */}
          <View style={{ paddingHorizontal: 12, paddingTop: 6 }}>
            {(items || []).map((it) => {
              const img = ensureAbsolute(it?.images?.[0]?.url || it?.images?.[0]);
              const isSel = selected.includes(it._id);
              return (
                <TouchableOpacity
                  key={it._id}
                  activeOpacity={0.92}
                  onPress={() => toggleSelect(it._id)}
                  className="bg-white border rounded-2xl"
                  style={{
                    marginBottom: 10,
                    paddingHorizontal: 10,
                    paddingVertical: 10,
                    borderColor: isSel ? '#60A5FA' : '#E5E7EB',
                    shadowColor: '#000',
                    shadowOpacity: 0.04,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 1,
                  }}
                >
                  <View className="flex-row items-center">
                    {img ? (
                      <Image
                        source={{ uri: img }}
                        style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: '#F3F4F6' }}
                      />
                    ) : (
                      <View style={{ width: 56, height: 56 }} className="bg-gray-100 items-center justify-center rounded-xl">
                        <Ionicons name="image-outline" size={18} color="#9ca3af" />
                      </View>
                    )}

                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text className="text-[13px] font-semibold text-gray-900" numberOfLines={1}>{it.title}</Text>
                      <Text className="text-[11px] text-gray-500" numberOfLines={1}>{it.propertyType}</Text>
                    </View>

                    <View
                      className="w-9 h-9 rounded-lg items-center justify-center"
                      style={{ backgroundColor: isSel ? '#DBEAFE' : '#F3F4F6', borderWidth: 1, borderColor: isSel ? '#93C5FD' : '#E5E7EB' }}
                    >
                      {isSel ? (
                        <Ionicons name="checkmark" size={18} color="#1D4ED8" />
                      ) : (
                        <Ionicons name="add" size={18} color="#111827" />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Comparison Section */}
          <View
            ref={compareAnchorRef}
            onLayout={(e) => { compareYRef.current = e.nativeEvent.layout.y; }}
            style={{ borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#fff', marginTop: selected.length ? 8 : 0 }}
          >
            <View className="px-4 pt-12 pb-3">
              <View className="flex-row items-center">
                <Ionicons name="stats-chart-outline" size={18} color="#111827" />
                <Text className="ml-2 text-[14px] font-semibold text-gray-900">Comparison</Text>
              </View>
              <Text className="text-[11px] text-gray-500 mt-1">Side-by-side contrast of features & pricing</Text>
            </View>

            {/* Only render the table when exactly two are chosen */}
            {selected.length === 2 ? (() => {
              const a = (items || []).find((x) => x._id === selected[0]);
              const b = (items || []).find((x) => x._id === selected[1]);
              const sum = computeSummary(a, b);

              return (
                <ScrollView
                  horizontal
                  bounces
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 16 }}
                >
                  {/* Summary card */}
                  <View className="mr-3" style={{ width: 260 }}>
                    <View
                      className="rounded-2xl border border-gray-200 p-3 bg-white"
                      style={{
                        shadowColor: '#000',
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 2 },
                        elevation: 2,
                      }}
                    >
                      <Text className="text-[12px] text-gray-600">Overall match</Text>

                      <View className="mt-2">
                        <Text className="text-[13px] font-semibold text-gray-900" numberOfLines={2}>{a?.title || 'Property A'}</Text>
                        <View className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                          <View style={{ width: `${sum?.pctA ?? 50}%` }} className="h-2 bg-emerald-500" />
                        </View>
                        <Text className="text-[11px] text-gray-600 mt-1">{sum?.pctA ?? 50}% better for you</Text>
                      </View>

                      <View className="mt-3">
                        <Text className="text-[13px] font-semibold text-gray-900" numberOfLines={2}>{b?.title || 'Property B'}</Text>
                        <View className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                          <View style={{ width: `${sum?.pctB ?? 50}%` }} className="h-2 bg-indigo-500" />
                        </View>
                        <Text className="text-[11px] text-gray-600 mt-1">{sum?.pctB ?? 50}% overall</Text>
                      </View>

                      <View className="flex-row items-center mt-3">
                        <View className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10B981' }} />
                        <Text className="text-[10px] text-gray-500 ml-1">Property A</Text>
                        <View className="w-3 h-3 rounded-full ml-3" style={{ backgroundColor: '#6366F1' }} />
                        <Text className="text-[10px] text-gray-500 ml-1">Property B</Text>
                      </View>
                    </View>
                  </View>

                  {/* Labels column */}
                  <View className="mr-2" style={{ width: 170 }}>
                    {/* spacer aligns with the mini-headers in property columns */}
                    <View className="h-[150px]" />
                    {FIELDS.map((f, i) => (
                      <View
                        key={f.key}
                        className="px-3 border-b border-gray-200"
                        style={{
                          height: 48,
                          justifyContent: 'center',
                          backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                        }}
                      >
                        <Text className="text-[12px] font-semibold text-gray-700">{f.label}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Property columns */}
                  {selected.map((sid, idx) => {
                    const it = (items || []).find((x) => x._id === sid);
                    const img = ensureAbsolute(it?.images?.[0]?.url || it?.images?.[0]);
                    const otherId = selected[(idx + 1) % 2];
                    const other = (items || []).find((x) => x._id === otherId);
                    const betterColor = '#047857';
                    const neutral = '#111827';
                    const isBetterVal = (f) => {
                      const key = f.key;
                      let aVal = it?.[key];
                      let bVal = other?.[key];
                      if (key === 'ecoFeatures') { aVal = (it?.ecoFeatures||[]).length; bVal = (other?.ecoFeatures||[]).length; }
                      if (key === 'ecoBadge') { aVal = badgeScore(it?.ecoBadge); bVal = badgeScore(other?.ecoBadge); }
                      if (key === 'rentPrice' || key === 'bedrooms' || key === 'bathrooms' || key === 'energyRating') { aVal = num(aVal); bVal = num(bVal); }
                      if (aVal === bVal) return null;
                      const higherBetter = key !== 'rentPrice';
                      const aBetter = higherBetter ? aVal > bVal : aVal < bVal;
                      return aBetter;
                    };
                    return (
                      <View
                        key={sid}
                        className="bg-white rounded-2xl border border-gray-200 mr-2"
                        style={{
                          width: 240,
                          shadowColor: '#000',
                          shadowOpacity: 0.05,
                          shadowRadius: 8,
                          shadowOffset: { width: 0, height: 2 },
                          elevation: 2,
                        }}
                      >
                        {/* mini header */}
                        <View className="px-3 py-3 border-b border-gray-200">
                          <View className="flex-row items-center">
                            {img ? (
                              <Image source={{ uri: img }} style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: '#f3f4f6' }} />
                            ) : (
                              <View style={{ width: 64, height: 64 }} className="bg-gray-100 items-center justify-center rounded-xl">
                                <Ionicons name="image-outline" size={18} color="#9ca3af" />
                              </View>
                            )}
                            <View style={{ flex: 1, marginLeft: 8 }}>
                              <Text className="text-[13px] font-semibold" numberOfLines={2}>{it?.title}</Text>
                              <Text className="text-[11px] text-gray-500" numberOfLines={1}>{it?.propertyType}</Text>
                            </View>
                            <TouchableOpacity onPress={() => toggleSelect(sid)} className="px-2 py-2 rounded-xl bg-gray-100" activeOpacity={0.8}>
                              <Ionicons name="close" size={18} color="#111827" />
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* rows */}
                        {FIELDS.map((f, i) => {
                          const raw = it?.[f.key];
                          const val = f.render ? f.render(raw) : (raw ?? '');
                          const better = isBetterVal(f);
                          return (
                            <View
                              key={f.key}
                              className="px-3 border-b border-gray-100"
                              style={{
                                height: 48,
                                justifyContent: 'center',
                                backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                              }}
                            >
                              <Text
                                className="text-[12px] font-semibold"
                                style={{ color: better === null ? neutral : (better ? betterColor : neutral) }}
                                numberOfLines={2}
                              >
                                {String(val || '')}
                              </Text>
                            </View>
                          );
                        })}

                        <TouchableOpacity
                          onPress={() => navigation.navigate('PropertyDetail', { property: it })}
                          className="m-3 py-2 rounded-xl items-center"
                          style={{ backgroundColor: '#111827' }}
                          activeOpacity={0.95}
                        >
                          <Text className="text-white text-[12px] font-semibold">View details</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </ScrollView>
              );
            })() : (
              // helpful hint when not yet at 2
              <View className="px-4 pb-6">
                <Text className="text-[12px] text-gray-500">Select two saved apartments above to start comparing.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}