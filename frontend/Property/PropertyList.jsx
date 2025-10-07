//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// import React, { useEffect, useState, useCallback, useRef } from 'react';
// import {
//   View, Text, FlatList, Image, TouchableOpacity, TextInput,
//   ActivityIndicator, RefreshControl, Alert, Platform, Modal, Pressable,
//   Animated, Linking, ScrollView
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';

// const API_BASE = Platform.OS === 'ios' ? 'http://localhost:4000' : 'http://10.0.2.2:4000';
// const REVIEW_BASE = `${API_BASE}/ReviewOperations`;

// const LIST_URL = (page, limit, q = '', type = '', minPrice = '', maxPrice = '') => {
//   const qs = new URLSearchParams();
//   qs.set('page', String(page));
//   qs.set('limit', String(limit));
//   if (q) qs.set('q', q);
//   if (type) qs.set('type', type);
//   if (minPrice !== '' && minPrice !== undefined) qs.set('minPrice', String(minPrice));
//   if (maxPrice !== '' && maxPrice !== undefined) qs.set('maxPrice', String(maxPrice));
//   return `${API_BASE}/PropertyOperations/list?${qs.toString()}`;
// };

// const ensureAbsolute = (u) =>
//   !u ? u : /^https?:\/\//.test(u) ? u : `${API_BASE}/${String(u).replace(/^\/?/, '').replace(/\\/g, '/')}`;

// const currency = (n) =>
//   new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(Number(n || 0));

// const BADGE_STYLES = {
//   Platinum: { bg: '#e0f2fe', text: '#0369a1', icon: 'diamond-outline', border: '#bae6fd' },
//   Gold: { bg: '#fef3c7', text: '#92400e', icon: 'trophy-outline', border: '#fde68a' },
//   Silver: { bg: '#f8fafc', text: '#475569', icon: 'medal-outline', border: '#cbd5e1' },
//   Bronze: { bg: '#fff7ed', text: '#9a3412', icon: 'ribbon-outline', border: '#fed7aa' },
//   Unverified: { bg: '#f3f4f6', text: '#6b7280', icon: 'alert-circle-outline', border: '#e5e7eb' },
// };

// const TYPES = ['Apartment', 'House', 'Studio', 'Villa', 'Townhouse'];
// const PRICES = [
//   { label: '≤ 100k', min: '', max: 100000 },
//   { label: '≤ 200k', min: '', max: 200000 },
//   { label: '≤ 300k', min: '', max: 300000 },
//   { label: 'Any', min: '', max: '' },
// ];

// const getLocationLabel = (item) => {
//   if (item?.locationName && typeof item.locationName === 'string') return item.locationName;
//   if (item?.address && typeof item.address === 'string') {
//     const first = item.address.split(',').map(s => s.trim()).filter(Boolean)[0];
//     return first || 'Location';
//   }
//   return 'Location';
// };

// export default function PropertyList() {
//   const navigation = useNavigation();

//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [page, setPage] = useState(1);
//   const [pages, setPages] = useState(1);
//   const [loadingMore, setLoadingMore] = useState(false);

//   const [search, setSearch] = useState('');
//   const [typeFilter, setTypeFilter] = useState('');
//   const [priceFilter, setPriceFilter] = useState(PRICES[3]);

//   const [expandAll, setExpandAll] = useState(false);
//   const [commentModal, setCommentModal] = useState({ visible: false, property: null });
//   const [zoom, setZoom] = useState({ visible: false, item: null });

//   const [commentsTick, setCommentsTick] = useState(0);
//   const LIMIT = 16;

//   const fetchPage = useCallback(
//     async (p = 1, replace = false) => {
//       const min = priceFilter?.min ?? '';
//       const max = priceFilter?.max ?? '';
//       const res = await fetch(LIST_URL(p, LIMIT, search, typeFilter, min, max));
//       if (!res.ok) throw new Error('Fetch failed');
//       const data = await res.json();
//       setPages(data.pages || 1);
//       setItems((prev) => (replace ? data.data : [...prev, ...data.data]));
//     },
//     [search, typeFilter, priceFilter]
//   );

//   useEffect(() => {
//     (async () => {
//       setLoading(true);
//       try { await fetchPage(1, true); setPage(1); }
//       catch (e) { Alert.alert('Error', e.message); }
//       finally { setLoading(false); }
//     })();
//   }, [fetchPage]);

//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     try { await fetchPage(1, true); setPage(1); }
//     finally { setRefreshing(false); }
//   }, [fetchPage]);

//   const loadMore = useCallback(async () => {
//     if (loadingMore || loading || page >= pages) return;
//     setLoadingMore(true);
//     try { const next = page + 1; await fetchPage(next, false); setPage(next); }
//     finally { setLoadingMore(false); }
//   }, [loadingMore, loading, page, pages, fetchPage]);

//   const goToBooking = (prop) => navigation.navigate('BookingScreen', { property: prop });
//   const openZoom = (item) => setZoom({ visible: true, item });
//   const closeZoom = () => setZoom({ visible: false, item: null });
//   const onCardPress = () => setExpandAll((prev) => !prev);
//   const handleCommentPosted = () => setCommentsTick((t) => t + 1);

//   const renderItem = ({ item, index }) => {
//     const img = ensureAbsolute(item?.images?.[0]?.url || item?.images?.[0]);
//     const expanded = expandAll;
//     const badge = item?.ecoBadge || 'Unverified';
//     const pal = BADGE_STYLES[badge] || BADGE_STYLES.Unverified;
//     const locLabel = getLocationLabel(item);

//     return (
//       <View
//         className="rounded-2xl overflow-hidden"
//         style={{
//           width: '48%',
//           marginTop: index < 2 ? 0 : 12,
//           backgroundColor: '#fff',
//           borderColor: '#eef2f7',
//           borderWidth: 1,
//           shadowColor: '#000',
//           shadowOpacity: 0.06,
//           shadowRadius: 8,
//           shadowOffset: { width: 0, height: 2 },
//           elevation: 2,
//         }}
//       >
//         <TouchableOpacity activeOpacity={0.88} onPress={onCardPress}>
//           <View style={{ position: 'relative' }}>
//             <TouchableOpacity activeOpacity={0.9} onPress={() => openZoom(item)}>
//               {img ? (
//                 <Image source={{ uri: img }} style={{ width: '100%', height: 120 }} resizeMode="cover" />
//               ) : (
//                 <View style={{ width: '100%', height: 120 }} className="bg-gray-100 items-center justify-center">
//                   <Ionicons name="image-outline" size={18} color="#9ca3af" />
//                 </View>
//               )}
//             </TouchableOpacity>

//             <View
//               style={{
//                 position: 'absolute',
//                 top: 8,
//                 left: 8,
//                 flexDirection: 'row',
//                 alignItems: 'center',
//                 backgroundColor: pal.bg,
//                 borderColor: pal.border,
//                 borderWidth: 1,
//                 borderRadius: 999,
//                 paddingHorizontal: 8,
//                 paddingVertical: 4,
//                 shadowColor: '#000',
//                 shadowOpacity: 0.08,
//                 shadowRadius: 3,
//                 shadowOffset: { width: 0, height: 1 },
//               }}
//             >
//               <Ionicons name={pal.icon} size={12} color={pal.text} style={{ marginRight: 4 }} />
//               <Text style={{ fontSize: 11, fontWeight: '700', color: pal.text }}>{badge}</Text>
//             </View>
//           </View>

//           <View style={{ paddingHorizontal: 10, paddingVertical: 8 }}>
//             <Text className="text-[14px] font-semibold text-gray-900" numberOfLines={1}>
//               {item.title}
//             </Text>
//             <View className="flex-row items-center mt-1">
//               <Ionicons name="location-outline" size={12} color="#6b7280" />
//               <Text className="text-[11px] text-gray-600 ml-1" numberOfLines={1}>{locLabel}</Text>
//             </View>
//             <View className="flex-row items-center mt-2">
//               <View className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 mr-1.5">
//                 <Text className="text-indigo-700 text-[10px] font-semibold">{currency(item.rentPrice)}/mo</Text>
//               </View>
//               <View className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
//                 <Text className="text-emerald-700 text-[10px] font-semibold">{item.propertyType}</Text>
//               </View>
//             </View>
//           </View>
//         </TouchableOpacity>

//         {expanded && (
//           <View style={{ paddingHorizontal: 10, paddingBottom: 10 }}>
//             <Text className="text-gray-700 text-[12px]">{item.description}</Text>

//             <View className="mt-2 bg-gray-50 border border-gray-200 rounded-xl p-2">
//               <View className="flex-row items-center">
//                 <Ionicons name="location-outline" size={14} color="#374151" />
//                 <Text className="ml-1 text-[12px] text-gray-800" numberOfLines={2}>{item.address}</Text>
//               </View>
//             </View>

//             <View className="flex-row mt-2">
//               <TouchableOpacity onPress={() => goToBooking(item)} style={{ flex: 1, marginRight: 6 }} className="bg-[#3cc172] rounded-xl py-2 items-center">
//                 <Text className="text-white font-semibold text-[12px]">Book</Text>
//               </TouchableOpacity>
//               <TouchableOpacity onPress={() => setCommentModal({ visible: true, property: item })} style={{ flex: 1, marginLeft: 6 }} className="bg-gray-800 rounded-xl py-2 items-center">
//                 <Text className="text-white font-semibold text-[12px]">Comment</Text>
//               </TouchableOpacity>
//             </View>

//             <CommentsBlock propertyId={item._id} compact reloadKey={commentsTick} />
//           </View>
//         )}
//       </View>
//     );
//   };

//   if (loading) {
//     return (
//       <View className="flex-1 items-center justify-center bg-gray-50">
//         <ActivityIndicator />
//         <Text className="mt-2 text-gray-600">Loading…</Text>
//       </View>
//     );
//   }

//   return (
//     <View className="flex-1 mt-20 bg-[#f7f9fc]">
//       {/* Header / Search / Filters (keep your existing header here, omitted for brevity) */}

//       <FlatList
//         data={items}
//         keyExtractor={(it) => it._id}
//         renderItem={renderItem}
//         numColumns={2}
//         columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 12 }}
//         contentContainerStyle={{ paddingTop: 10, paddingBottom: 16 }}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//         onEndReachedThreshold={0.3}
//         onEndReached={loadMore}
//         ListFooterComponent={loadingMore ? (<View className="py-4 items-center"><ActivityIndicator /></View>) : null}
//       />

//       <ZoomPreview modal={zoom} onClose={closeZoom} />
//       <CommentModal modal={commentModal} setModal={setCommentModal} onPosted={handleCommentPosted} />
//     </View>
//   );
// }

// /* ---------- Filters Row Component ---------- */
// function FiltersRow({ typeFilter, setTypeFilter, priceFilter, setPriceFilter, onApply }) {
//   return (
//     <View className="mt-2">
//       <View className="flex-row items-center">
//         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 8 }}>
//           <Chip label="All Types" active={!typeFilter} onPress={() => setTypeFilter('')} />
//           {TYPES.map((t) => (
//             <Chip key={t} label={t} active={typeFilter === t} onPress={() => setTypeFilter((prev) => (prev === t ? '' : t))} />
//           ))}
//           {PRICES.map((p) => (
//             <Chip key={p.label} label={p.label} active={priceFilter?.label === p.label} onPress={() => setPriceFilter(p)} />
//           ))}
//         </ScrollView>

//         <TouchableOpacity onPress={onApply} className="ml-2 px-3 py-2 rounded-xl bg-gray-900" activeOpacity={0.9}>
//           <Text className="text-white text-[12px] font-semibold">Apply</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// function Chip({ label, active, onPress }) {
//   return (
//     <TouchableOpacity
//       onPress={onPress}
//       className="mr-2"
//       style={{
//         backgroundColor: active ? '#e0e7ff' : '#f3f4f6',
//         borderColor: active ? '#c7d2fe' : '#e5e7eb',
//         borderWidth: 1,
//         paddingHorizontal: 10,
//         paddingVertical: 6,
//         borderRadius: 999,
//       }}
//     >
//       <Text style={{ fontSize: 12, fontWeight: '600', color: active ? '#3730a3' : '#374151' }}>{label}</Text>
//     </TouchableOpacity>
//   );
// }

// /* ---------- Zoom Preview Modal ---------- */
// function ZoomPreview({ modal, onClose }) {
//   const { visible, item } = modal || {};
//   const scale = useRef(new Animated.Value(0.9)).current;
//   const opacity = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     if (visible) {
//       Animated.parallel([
//         Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
//         Animated.spring(scale, { toValue: 1, friction: 7, tension: 60, useNativeDriver: true }),
//       ]).start();
//     } else {
//       opacity.setValue(0);
//       scale.setValue(0.9);
//     }
//   }, [visible, opacity, scale]);

//   if (!visible || !item) return null;

//   const img = ensureAbsolute(item?.images?.[0]?.url || item?.images?.[0]);
//   const lat = item?.location?.coordinates?.[1];
//   const lng = item?.location?.coordinates?.[0];
//   const locLabel = getLocationLabel(item);

//   return (
//     <Modal visible transparent animationType="none" onRequestClose={onClose}>
//       <Animated.View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', opacity }}>
//         <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 16 }}>
//           <Animated.View style={{ transform: [{ scale }], borderRadius: 16, overflow: 'hidden', backgroundColor: '#fff' }}>
//             {img ? (
//               <Image source={{ uri: img }} style={{ width: '100%', height: 280 }} resizeMode="cover" />
//             ) : (
//               <View style={{ width: '100%', height: 280 }} className="bg-gray-100 items-center justify-center">
//                 <Ionicons name="image-outline" size={24} color="#9ca3af" />
//               </View>
//             )}

//             <View style={{ padding: 12 }}>
//               <Text className="text-[16px] font-bold text-gray-900" numberOfLines={1}>
//                 {item.title}
//               </Text>

//               <View className="flex-row items-center mt-1">
//                 <Ionicons name="location-outline" size={14} color="#6b7280" />
//                 <Text className="text-[12px] text-gray-700 ml-1" numberOfLines={1}>
//                   {locLabel}
//                 </Text>
//               </View>

//               <Text className="text-[12px] text-gray-600 mt-1">{item.address}</Text>

//               {!!lat && !!lng && (
//                 <View className="flex-row items-center mt-2">
//                   <Ionicons name="navigate-outline" size={16} color="#111827" />
//                   <Text className="ml-1 text-[12px] text-gray-700">
//                     {lat.toFixed(5)}, {lng.toFixed(5)}
//                   </Text>
//                   <TouchableOpacity
//                     onPress={() => {
//                       const url = Platform.select({
//                         ios: `maps://?q=${encodeURIComponent(item.title)}&ll=${lat},${lng}`,
//                         android: `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(item.title)})`,
//                       });
//                       Linking.openURL(url);
//                     }}
//                     className="ml-auto px-3 py-1.5 rounded-lg"
//                     style={{ backgroundColor: '#ecfeff', borderWidth: 1, borderColor: '#a5f3fc' }}
//                   >
//                     <Text className="text-[12px] font-semibold" style={{ color: '#0e7490' }}>
//                       View in Maps
//                     </Text>
//                   </TouchableOpacity>
//                 </View>
//               )}

//               <TouchableOpacity onPress={onClose} className="mt-3 py-3 rounded-xl items-center" style={{ backgroundColor: '#111827' }} activeOpacity={0.9}>
//                 <Text className="text-white font-semibold">Close</Text>
//               </TouchableOpacity>
//             </View>
//           </Animated.View>
//         </View>
//       </Animated.View>
//     </Modal>
//   );
// }

// /* ---------- Comments block (ONLY ONE DEFINITION) ---------- */
// function CommentsBlock({ propertyId, compact = false, reloadKey, title = 'Reviews' }) {
//   const [items, setItems] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const load = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${REVIEW_BASE}/${propertyId}/comments`);
//       const data = await res.json();
//       setItems(data?.data || []);
//     } catch {
//       // ignore
//     }
//     setLoading(false);
//   }, [propertyId]);

//   useEffect(() => {
//     load();
//   }, [load, reloadKey]);

//   if (loading && !items) {
//     return (
//       <View className="mt-2">
//         <ActivityIndicator />
//       </View>
//     );
//   }
//   if (!items || items.length === 0) {
//     return <Text className="text-gray-500 mt-2 text-[11px]">No reviews yet.</Text>;
//   }

//   const slice = compact ? items.slice(0, 2) : items;

//   return (
//     <View className="mt-2">
//       <Text className="font-semibold text-gray-900 mb-1 text-[12px]">{title}</Text>

//       {slice.map((c) => {
//         const mood = c?.sentiment?.label;
//         const conf =
//           typeof c?.sentiment?.confidence === 'number'
//             ? ` (${Math.round(c.sentiment.confidence * 100)}%)`
//             : '';

//         return (
//           <View key={c._id} className="bg-gray-50 border border-gray-200 rounded-lg p-2 mb-1.5">
//             <Text className="text-[10px] text-gray-500">
//               {c.userId?.uname || 'User'} • {new Date(c.createdAt).toLocaleDateString()}
//             </Text>

//             {c.rating ? (
//               <Text className="text-amber-600 text-[11px] mt-0.5">⭐ {c.rating}/5</Text>
//             ) : null}

//             {mood ? (
//               <Text className="text-[10px] text-gray-500 mt-0.5">
//                 Mood: {mood}
//                 {conf}
//               </Text>
//             ) : null}

//             <Text className="text-[12px] text-gray-800 mt-0.5" numberOfLines={3}>
//               {c.text}
//             </Text>
//           </View>
//         );
//       })}

//       {items.length > slice.length && (
//         <Text className="text-[11px] text-gray-500 mt-0.5">+ {items.length - slice.length} more…</Text>
//       )}
//     </View>
//   );
// }

// /* ---------- Comment modal ---------- */
// function CommentModal({ modal, setModal, onPosted }) {
//   const prop = modal.property;
//   const [text, setText] = useState('');
//   const [rating, setRating] = useState('5');
//   const [busy, setBusy] = useState(false);

//   useEffect(() => {
//     if (!modal.visible) {
//       setText('');
//       setRating('5');
//       setBusy(false);
//     }
//   }, [modal.visible]);

//   const submit = async () => {
//     try {
//       const token = await AsyncStorage.getItem('auth_token');
//       if (!token) return Alert.alert('Sign in required');

//       if (!text.trim()) return Alert.alert('Required', 'Please enter your comment.');
//       const num = Number(rating);
//       if (Number.isNaN(num) || num < 1 || num > 5) return Alert.alert('Invalid rating', 'Rating must be between 1 and 5.');

//       setBusy(true);
//       const res = await fetch(`${REVIEW_BASE}/${prop._id}/comments`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
//         body: JSON.stringify({ text: text.trim(), rating: num }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.message || 'Comment failed');

//       Alert.alert('Posted', 'Your comment has been added.');
//       onPosted?.();
//       setModal({ visible: false, property: null });
//     } catch (e) {
//       Alert.alert('Error', e.message);
//     } finally {
//       setBusy(false);
//     }
//   };

//   return (
//     <Modal visible={modal.visible} transparent animationType="slide" onRequestClose={() => setModal({ visible: false, property: null })}>
//       <View className="flex-1 bg-black/40 justify-end">
//         <View className="bg-white rounded-t-2xl p-4">
//           <Text className="text-lg font-bold mb-2" numberOfLines={1}>Comment on {prop?.title}</Text>
//           <TextInput value={text} onChangeText={setText} placeholder="Write your comment…" multiline className="bg-gray-100 rounded-xl px-3 py-2 h-24 mb-2" />
//           <TextInput value={rating} onChangeText={setRating} placeholder="Rating (1-5)" keyboardType="number-pad" className="bg-gray-100 rounded-xl px-3 py-2 mb-3" />
//           <View className="flex-row">
//             <Pressable onPress={() => setModal({ visible: false, property: null })} className="flex-1 mr-2 bg-gray-200 rounded-xl py-3 items-center">
//               <Text className="font-semibold text-gray-800">Cancel</Text>
//             </Pressable>
//             <Pressable disabled={busy} onPress={submit} className={`flex-1 bg-gray-800 rounded-xl py-3 items-center ${busy ? 'opacity-70' : ''}`}>
//               {busy ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold">Post</Text>}
//             </Pressable>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// }









// screens/PropertyList.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, TextInput,
  ActivityIndicator, RefreshControl, Alert, Platform, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const API_BASE = Platform.OS === 'ios' ? 'http://localhost:4000' : 'http://10.0.2.2:4000';

const LIST_URL = (page, limit, q = '', type = '', minPrice = '', maxPrice = '') => {
  const qs = new URLSearchParams();
  qs.set('page', String(page));
  qs.set('limit', String(limit));
  if (q) qs.set('q', q);
  if (type) qs.set('type', type);
  if (minPrice !== '' && minPrice !== undefined) qs.set('minPrice', String(minPrice));
  if (maxPrice !== '' && maxPrice !== undefined) qs.set('maxPrice', String(maxPrice));
  return `${API_BASE}/PropertyOperations/list?${qs.toString()}`;
};

const ensureAbsolute = (u) =>
  !u ? u : /^https?:\/\//.test(u) ? u : `${API_BASE}/${String(u).replace(/^\/?/, '').replace(/\\/g, '/')}`;

const currency = (n) =>
  new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(Number(n || 0));

const BADGE_STYLES = {
  Platinum: { bg: '#e0f2fe', text: '#0369a1', icon: 'diamond-outline', border: '#bae6fd' },
  Gold: { bg: '#fef3c7', text: '#92400e', icon: 'trophy-outline', border: '#fde68a' },
  Silver: { bg: '#f8fafc', text: '#475569', icon: 'medal-outline', border: '#cbd5e1' },
  Bronze: { bg: '#fff7ed', text: '#9a3412', icon: 'ribbon-outline', border: '#fed7aa' },
  Unverified: { bg: '#f3f4f6', text: '#6b7280', icon: 'alert-circle-outline', border: '#e5e7eb' },
};

const TYPES = ['Apartment', 'House', 'Studio', 'Villa', 'Townhouse'];
const PRICES = [
  { label: '≤ 100k', min: '', max: 100000 },
  { label: '≤ 200k', min: '', max: 200000 },
  { label: '≤ 300k', min: '', max: 300000 },
  { label: 'Any', min: '', max: '' },
];

const getLocationLabel = (item) => {
  if (item?.locationName && typeof item.locationName === 'string') return item.locationName;
  if (item?.address && typeof item.address === 'string') {
    const first = item.address.split(',').map(s => s.trim()).filter(Boolean)[0];
    return first || 'Location';
  }
  return 'Location';
};

// export default function PropertyList() {
//   const navigation = useNavigation();

//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [page, setPage] = useState(1);
//   const [pages, setPages] = useState(1);
//   const [loadingMore, setLoadingMore] = useState(false);

//   const [search, setSearch] = useState('');
//   const [typeFilter, setTypeFilter] = useState('');
//   const [priceFilter, setPriceFilter] = useState(PRICES[3]); // Any

//   const LIMIT = 16;

//   const fetchPage = useCallback(
//     async (p = 1, replace = false) => {
//       const min = priceFilter?.min ?? '';
//       const max = priceFilter?.max ?? '';
//       const res = await fetch(LIST_URL(p, LIMIT, search, typeFilter, min, max));
//       if (!res.ok) throw new Error('Fetch failed');
//       const data = await res.json();
//       setPages(data.pages || 1);
//       setItems((prev) => (replace ? data.data : [...prev, ...data.data]));
//     },
//     [search, typeFilter, priceFilter]
//   );

//   useEffect(() => {
//     (async () => {
//       setLoading(true);
//       try { await fetchPage(1, true); setPage(1); }
//       catch (e) { Alert.alert('Error', e.message); }
//       finally { setLoading(false); }
//     })();
//   }, [fetchPage]);

//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     try { await fetchPage(1, true); setPage(1); }
//     finally { setRefreshing(false); }
//   }, [fetchPage]);

//   const loadMore = useCallback(async () => {
//     if (loadingMore || loading || page >= pages) return;
//     setLoadingMore(true);
//     try { const next = page + 1; await fetchPage(next, false); setPage(next); }
//     finally { setLoadingMore(false); }
//   }, [loadingMore, loading, page, pages, fetchPage]);

//   const onCardPress = (item) => {
//     navigation.navigate('PropertyDetail', { property: item }); // 👉 go to detail
//   };

//   const renderItem = ({ item, index }) => {
//     const img = ensureAbsolute(item?.images?.[0]?.url || item?.images?.[0]);
//     const badge = item?.ecoBadge || 'Unverified';
//     const pal = BADGE_STYLES[badge] || BADGE_STYLES.Unverified;
//     const locLabel = getLocationLabel(item);

//     return (
//       <TouchableOpacity
//         activeOpacity={0.9}
//         onPress={() => onCardPress(item)}
//         className="rounded-2xl overflow-hidden"
//         style={{
//           width: '48%',
//           marginTop: index < 2 ? 0 : 12,
//           backgroundColor: '#fff',
//           borderColor: '#eef2f7',
//           borderWidth: 1,
//           shadowColor: '#000',
//           shadowOpacity: 0.06,
//           shadowRadius: 8,
//           shadowOffset: { width: 0, height: 2 },
//           elevation: 2,
//         }}
//       >
//         <View style={{ position: 'relative' }}>
//           {img ? (
//             <Image source={{ uri: img }} style={{ width: '100%', height: 120 }} resizeMode="cover" />
//           ) : (
//             <View style={{ width: '100%', height: 120 }} className="bg-gray-100 items-center justify-center">
//               <Ionicons name="image-outline" size={18} color="#9ca3af" />
//             </View>
//           )}

//           {/* eco badge chip */}
//           <View
//             style={{
//               position: 'absolute',
//               top: 8,
//               left: 8,
//               flexDirection: 'row',
//               alignItems: 'center',
//               backgroundColor: pal.bg,
//               borderColor: pal.border,
//               borderWidth: 1,
//               borderRadius: 999,
//               paddingHorizontal: 8,
//               paddingVertical: 4,
//               shadowColor: '#000',
//               shadowOpacity: 0.08,
//               shadowRadius: 3,
//               shadowOffset: { width: 0, height: 1 },
//             }}
//           >
//             <Ionicons name={pal.icon} size={12} color={pal.text} style={{ marginRight: 4 }} />
//             <Text style={{ fontSize: 11, fontWeight: '700', color: pal.text }}>{badge}</Text>
//           </View>
//         </View>

//         <View style={{ paddingHorizontal: 10, paddingVertical: 8 }}>
//           <Text className="text-[14px] font-semibold text-gray-900" numberOfLines={1}>
//             {item.title}
//           </Text>

//           {/* concise location */}
//           <View className="flex-row items-center mt-1">
//             <Ionicons name="location-outline" size={12} color="#6b7280" />
//             <Text className="text-[11px] text-gray-600 ml-1" numberOfLines={1}>
//               {locLabel}
//             </Text>
//           </View>

//           <View className="flex-row items-center mt-2">
//             <View className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 mr-1.5">
//               <Text className="text-indigo-700 text-[10px] font-semibold">{currency(item.rentPrice)}/mo</Text>
//             </View>
//             <View className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
//               <Text className="text-emerald-700 text-[10px] font-semibold">{item.propertyType}</Text>
//             </View>
//           </View>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   if (loading) {
//     return (
//       <View className="flex-1 items-center justify-center bg-gray-50">
//         <ActivityIndicator />
//         <Text className="mt-2 text-gray-600">Loading…</Text>
//       </View>
//     );
//   }

//   return (
//     <View className="flex-1 mt-20 bg-[#f7f9fc]">
//       {/* Header: Back + Search */}
//       <View className={`${Platform.OS === 'android' ? 'pt-8' : 'pt-12'} pb-3 px-4 bg-white border-b border-gray-100`}>
//         <View className="flex-row items-center justify-between mb-2">
//           <View style={{ width: 40 }} /> 
//           <Text className="text-lg font-extrabold text-gray-900">Discover</Text>
//           <View style={{ width: 40 }} />
//         </View>

//         <View
//           className="flex-row items-center"
//           style={{
//             backgroundColor: '#f1f5f9',
//             borderRadius: 14,
//             paddingHorizontal: 10,
//             paddingVertical: Platform.OS === 'android' ? 6 : 8,
//             borderWidth: 1,
//             borderColor: '#e5e7eb',
//           }}
//         >
//           <Ionicons name="search" size={18} color="#6b7280" />
//           <TextInput
//             value={search}
//             onChangeText={setSearch}
//             placeholder="Search properties, locations…"
//             className="flex-1 ml-2"
//             style={{ fontSize: 14 }}
//             onSubmitEditing={onRefresh}
//             returnKeyType="search"
//           />
//           {search ? (
//             <TouchableOpacity
//               onPress={() => {
//                 setSearch('');
//                 onRefresh();
//               }}
//             >
//               <Ionicons name="close-circle" size={18} color="#9ca3af" />
//             </TouchableOpacity>
//           ) : null}
//         </View>

//         <FiltersRow
//           typeFilter={typeFilter}
//           setTypeFilter={setTypeFilter}
//           priceFilter={priceFilter}
//           setPriceFilter={setPriceFilter}
//           onApply={() => fetchPage(1, true).then(() => setPage(1))}
//         />
//       </View>

//       <FlatList
//         data={items}
//         keyExtractor={(it) => it._id}
//         renderItem={renderItem}
//         numColumns={2}
//         columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 12 }}
//         contentContainerStyle={{ paddingTop: 10, paddingBottom: 16 }}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//         onEndReachedThreshold={0.3}
//         onEndReached={loadMore}
//         ListFooterComponent={loadingMore ? (<View className="py-4 items-center"><ActivityIndicator /></View>) : null}
//       />
//     </View>
//   );
// }




export default function PropertyList() {
  const navigation = useNavigation();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState(PRICES[3]); // Any

  const LIMIT = 16;

  const fetchPage = useCallback(
    async (p = 1, replace = false) => {
      const min = priceFilter?.min ?? '';
      const max = priceFilter?.max ?? '';
      const res = await fetch(LIST_URL(p, LIMIT, search, typeFilter, min, max));
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setPages(data.pages || 1);
      setItems((prev) => (replace ? data.data : [...prev, ...data.data]));
    },
    [search, typeFilter, priceFilter]
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { await fetchPage(1, true); setPage(1); }
      catch (e) { Alert.alert('Error', e.message); }
      finally { setLoading(false); }
    })();
  }, [fetchPage]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await fetchPage(1, true); setPage(1); }
    finally { setRefreshing(false); }
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (loadingMore || loading || page >= pages) return;
    setLoadingMore(true);
    try { const next = page + 1; await fetchPage(next, false); setPage(next); }
    finally { setLoadingMore(false); }
  }, [loadingMore, loading, page, pages, fetchPage]);

  const onCardPress = (item) => {
    navigation.navigate('PropertyDetail', { property: item }); // 👉 go to detail (unchanged)
  };

  // --- UI: card renderer (visual tweaks only) ---
  const renderItem = ({ item, index }) => {
    const img = ensureAbsolute(item?.images?.[0]?.url || item?.images?.[0]);
    const badge = item?.ecoBadge || 'Unverified';
    const pal = BADGE_STYLES[badge] || BADGE_STYLES.Unverified;
    const locLabel = getLocationLabel(item);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onCardPress(item)}
        className="rounded-2xl overflow-hidden"
        style={{
          width: '48%',
          marginTop: index < 2 ? 4 : 12, // tighter top margin for first row
          backgroundColor: '#fff',
          borderColor: '#e9eef5',
          borderWidth: 1,
          // softer, premium shadow
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 3 },
          elevation: 2,
        }}
      >
        {/* Image area */}
        <View style={{ position: 'relative' }}>
          {img ? (
            <Image
              source={{ uri: img }}
              style={{ width: '100%', height: 130, backgroundColor: '#f3f4f6' }}
              resizeMode="cover"
            />
          ) : (
            <View style={{ width: '100%', height: 130 }} className="bg-gray-100 items-center justify-center">
              <Ionicons name="image-outline" size={18} color="#9ca3af" />
            </View>
          )}

          {/* Eco badge chip (smaller & cleaner) */}
          <View
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: pal.bg,
              borderColor: pal.border,
              borderWidth: 1,
              borderRadius: 999,
              paddingHorizontal: 8,
              paddingVertical: 4,
              shadowColor: '#000',
              shadowOpacity: 0.06,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 1 },
            }}
          >
            <Ionicons name={pal.icon} size={12} color={pal.text} style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 11, fontWeight: '700', color: pal.text }}>{badge}</Text>
          </View>
        </View>

        {/* Body */}
        <View style={{ paddingHorizontal: 10, paddingVertical: 8 }}>
          <Text className="text-[14px] font-semibold text-gray-900" numberOfLines={1}>
            {item.title}
          </Text>

          {/* concise location */}
          <View className="flex-row items-center mt-1">
            <Ionicons name="location-outline" size={12} color="#6b7280" />
            <Text className="text-[11px] text-gray-600 ml-1" numberOfLines={1}>
              {locLabel}
            </Text>
          </View>

          {/* chips */}
          <View className="flex-row items-center mt-2">
            <View className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 mr-1.5">
              <Text className="text-indigo-700 text-[10px] font-semibold">
                {currency(item.rentPrice)}/mo
              </Text>
            </View>
            <View className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
              <Text className="text-emerald-700 text-[10px] font-semibold">
                {item.propertyType}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator />
        <Text className="mt-2 text-gray-600">Loading…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 mt-14 bg-[#f7f9fc]">
      {/* Header: centered title + compact search (structure unchanged, styling improved) */}
      <View
        className={`${Platform.OS === 'android' ? 'pt-8' : 'pt-12'} pb-3 px-4 bg-white border-b border-gray-100`}
      >
        {/* Title row kept centered visually */}
        <View className="flex-row items-center justify-between mb-2">
          <View style={{ width: 40 }} />
          <Text className="text-lg font-extrabold text-gray-900">Discover</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search input — smaller height, cleaner contrast */}
        <View
          className="flex-row items-center"
          style={{
            backgroundColor: '#F8FAFC',
            borderRadius: 14,
            paddingHorizontal: 10,
            paddingVertical: Platform.OS === 'android' ? 6 : 7,
            borderWidth: 1,
            borderColor: '#E5E7EB',
          }}
        >
          <Ionicons name="search" size={18} color="#6b7280" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search properties, locations…"
            className="flex-1 ml-2"
            style={{ fontSize: 14 }}
            onSubmitEditing={onRefresh}
            returnKeyType="search"
          />
          {search ? (
            <TouchableOpacity
              onPress={() => {
                setSearch('');
                onRefresh();
              }}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filters row — same logic/props; style refined inside FiltersRow if you want */}
        <FiltersRow
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          priceFilter={priceFilter}
          setPriceFilter={setPriceFilter}
          onApply={() => fetchPage(1, true).then(() => setPage(1))}
        />
      </View>

      {/* Grid list */}
      <FlatList
        data={items}
        keyExtractor={(it) => it._id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 12 }}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReachedThreshold={0.3}
        onEndReached={loadMore}
        ListFooterComponent={
          loadingMore ? (
            <View className="py-4 items-center">
              <ActivityIndicator />
            </View>
          ) : null
        }
      />
    </View>
  );
}

/* ---------- Filters Row ---------- */
function FiltersRow({ typeFilter, setTypeFilter, priceFilter, setPriceFilter, onApply }) {
  return (
    <View className="mt-2">
      <View className="flex-row items-center">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 8 }}>
          <Chip label="All Types" active={!typeFilter} onPress={() => setTypeFilter('')} />
          {TYPES.map((t) => (
            <Chip key={t} label={t} active={typeFilter === t} onPress={() => setTypeFilter((prev) => (prev === t ? '' : t))} />
          ))}
          {PRICES.map((p) => (
            <Chip key={p.label} label={p.label} active={priceFilter?.label === p.label} onPress={() => setPriceFilter(p)} />
          ))}
        </ScrollView>

        <TouchableOpacity onPress={onApply} className="ml-2 px-3 py-2 rounded-xl bg-gray-900" activeOpacity={0.9}>
          <Text className="text-white text-[12px] font-semibold">Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Chip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="mr-2"
      style={{
        backgroundColor: active ? '#e0e7ff' : '#f3f4f6',
        borderColor: active ? '#c7d2fe' : '#e5e7eb',
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: '600', color: active ? '#3730a3' : '#374151' }}>{label}</Text>
    </TouchableOpacity>
  );
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////