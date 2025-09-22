// import React, { useEffect, useState, useCallback } from 'react';
// import {
//   View, Text, FlatList, Image, TouchableOpacity,
//   ActivityIndicator, RefreshControl, Alert, Platform, TextInput
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { Ionicons } from '@expo/vector-icons';

// const API_BASE = 'http://10.0.2.2:4000';
// const LIST_URL = (page, limit, qParams = '') =>
//   `${API_BASE}/PropertyOperations/list?page=${page}&limit=${limit}${qParams}`;

// const ensureAbsolute = (uri) => {
//   if (!uri) return uri;
//   uri = String(uri).replace(/\\/g, '/');
//   if (/^https?:\/\//.test(uri)) return uri;
//   return `${API_BASE}/${uri.replace(/^\/?/, '')}`;
// };

// const currency = (n) => {
//   if (n === null || n === undefined || isNaN(Number(n))) return '-';
//   return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 })
//     .format(Number(n));
// };

// export default function PropertyList() {
//   const navigation = useNavigation();

//   const [items, setItems] = useState([]);
//   const [page, setPage] = useState(1);
//   const [pages, setPages] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [search, setSearch] = useState('');
//   const LIMIT = 12;

//   const fetchPage = useCallback(async (pageNum, replace = false, query = '') => {
//     const qParam = query ? `&q=${encodeURIComponent(query)}` : '';
//     const url = LIST_URL(pageNum, LIMIT, qParam);
//     const res = await fetch(url);
//     if (!res.ok) throw new Error(`HTTP ${res.status}`);
//     const data = await res.json();
//     const list = Array.isArray(data?.data) ? data.data : [];
//     setPages(data?.pages || 1);
//     setItems((prev) => (replace ? list : [...prev, ...list]));
//   }, []);

//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         setLoading(true);
//         await fetchPage(1, true, search);
//         if (mounted) setPage(1);
//       } catch (e) {
//         Alert.alert('Error', 'Could not load properties list');
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     })();
//     return () => { mounted = false; };
//   }, [fetchPage, search]);

//   const onRefresh = useCallback(async () => {
//     try {
//       setRefreshing(true);
//       await fetchPage(1, true, search);
//       setPage(1);
//     } catch (e) {
//       Alert.alert('Error', 'Refresh failed');
//     } finally {
//       setRefreshing(false);
//     }
//   }, [fetchPage, search]);

//   const loadMore = useCallback(async () => {
//     if (loadingMore || loading || page >= pages) return;
//     try {
//       setLoadingMore(true);
//       const next = page + 1;
//       await fetchPage(next, false, search);
//       setPage(next);
//     } catch (e) {
//       Alert.alert('Error', 'Could not load more');
//     } finally {
//       setLoadingMore(false);
//     }
//   }, [loadingMore, loading, page, pages, fetchPage, search]);

//   const renderItem = useCallback(({ item }) => {
//     const firstImg = item?.images?.[0];
//     const imgUri = ensureAbsolute(firstImg?.url || firstImg?.uri || firstImg);

//     return (
//       <TouchableOpacity
//         activeOpacity={0.9}
//         className="bg-white rounded-2xl overflow-hidden border border-gray-100"
//         style={{ width: '48%', marginBottom: 14 }}
//         onPress={() =>
//           navigation.navigate('PropertyDetailsScreen', {
//             propertyId: item._id,
//             property: {
//               ...item,
//               owner: item.ownerId
//                 ? {
//                     name: item.ownerId.uname,
//                     email: item.ownerId.email,
//                     phone: item.ownerId.number,
//                   }
//                 : undefined,
//             },
//           })
//         }
//       >
//         {imgUri ? (
//           <Image source={{ uri: imgUri }} className="w-full" style={{ height: 120 }} resizeMode="cover" />
//         ) : (
//           <View className="w-full items-center justify-center bg-gray-100" style={{ height: 120 }}>
//             <Ionicons name="image-outline" size={24} color="#9ca3af" />
//             <Text className="text-gray-500 mt-1 text-xs">No image</Text>
//           </View>
//         )}

//         <View className="p-3">
//           <Text className="text-[15px] font-semibold text-gray-900" numberOfLines={1}>
//             {item.title || 'Property'}
//           </Text>
//           <Text className="text-gray-500 text-[12px] mt-0.5" numberOfLines={1}>
//             {item.address || '—'}
//           </Text>

//           <View className="flex-row items-center mt-2">
//             <View className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 mr-2">
//               <Text className="text-emerald-700 text-[10px] font-semibold">
//                 {item.propertyType || '—'}
//               </Text>
//             </View>
//             <View className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200">
//               <Text className="text-indigo-700 text-[10px] font-semibold">
//                 {currency(item.rentPrice)}/mo
//               </Text>
//             </View>
//           </View>
//         </View>
//       </TouchableOpacity>
//     );
//   }, [navigation]);

//   // Header with Back + Search
//   const Header = () => (
//     <View className={`${Platform.OS === 'android' ? 'pt-8' : 'pt-3'} bg-white`}>
//       <View className="flex-row mt-10 items-center justify-between px-4 py-3">
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           className="p-2 rounded-xl bg-gray-50 border border-gray-200"
//           activeOpacity={0.8}
//         >
//           <Ionicons name="arrow-back" size={20} color="#111827" />
//         </TouchableOpacity>
//         <Text className="text-xl font-bold text-gray-900">Properties</Text>
//         <View style={{ width: 40 }} />
//       </View>

//       {/* Search Bar */}
//       <View className="flex-row items-center mx-4 mb-3 px-3 py-2 rounded-xl bg-gray-100">
//         <Ionicons name="search" size={18} color="#6b7280" />
//         <TextInput
//           placeholder="Search properties..."
//           value={search}
//           onChangeText={setSearch}
//           className="flex-1 ml-2 text-gray-800"
//           returnKeyType="search"
//         />
//         {search.length > 0 && (
//           <TouchableOpacity onPress={() => setSearch('')}>
//             <Ionicons name="close-circle" size={18} color="#9ca3af" />
//           </TouchableOpacity>
//         )}
//       </View>

//       <View className="h-[1px] bg-gray-100" />
//     </View>
//   );

//   if (loading) {
//     return (
//       <View className="flex-1 items-center justify-center bg-gray-50">
//         <ActivityIndicator />
//         <Text className="mt-2 text-gray-600">Loading properties…</Text>
//       </View>
//     );
//   }

//   if (!items.length) {
//     return (
//       <View className="flex-1 bg-white">
//         <Header />
//         <View className="flex-1 items-center justify-center bg-gray-50 p-6">
//           <Text className="text-lg font-semibold text-gray-800 mb-2">No properties found</Text>
//           <Text className="text-gray-600 text-center mb-4">Try adjusting your search or add new properties.</Text>
//         </View>
//       </View>
//     );
//   }

//   return (
//     <View className="flex-1 bg-white">
//       <Header />
//       <FlatList
//         data={items}
//         keyExtractor={(it) => it._id}
//         renderItem={renderItem}
//         numColumns={2}
//         columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
//         contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//         onEndReachedThreshold={0.3}
//         onEndReached={loadMore}
//         ListFooterComponent={
//           loadingMore ? (
//             <View className="py-4 items-center">
//               <ActivityIndicator />
//             </View>
//           ) : null
//         }
//       />
//     </View>
//   );
// }


// import React, { useEffect, useState, useCallback, useMemo } from 'react';
// import { View, Text, FlatList, Image, TouchableOpacity, TextInput,
//          ActivityIndicator, RefreshControl, Alert, Platform, Modal, Pressable, ScrollView } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Ionicons } from '@expo/vector-icons';

// const API_BASE = Platform.OS === 'ios' ? 'http://localhost:4000' : 'http://10.0.2.2:4000';
// const LIST_URL = (page, limit, q='') => `${API_BASE}/PropertyOperations/list?page=${page}&limit=${limit}${q ? `&q=${encodeURIComponent(q)}` : ''}`;

// const ensureAbsolute = (u) => !u ? u : /^https?:\/\//.test(u) ? u : `${API_BASE}/${String(u).replace(/^\/?/, '').replace(/\\/g,'/')}`;
// const currency = (n) => new Intl.NumberFormat('en-LK',{style:'currency',currency:'LKR',maximumFractionDigits:0}).format(Number(n||0));

// export default function PropertyList() {
//   const [items, setItems] = useState([]);
//   const [expandedId, setExpandedId] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [page, setPage] = useState(1);
//   const [pages, setPages] = useState(1);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [search, setSearch] = useState('');
//   const [bookingModal, setBookingModal] = useState({ visible: false, property: null });
//   const [commentModal, setCommentModal] = useState({ visible: false, property: null });
//   const LIMIT = 12;

//   const fetchPage = useCallback(async (p=1, replace=false) => {
//     const res = await fetch(LIST_URL(p, LIMIT, search));
//     if (!res.ok) throw new Error('Fetch failed');
//     const data = await res.json();
//     setPages(data.pages || 1);
//     setItems(prev => replace ? data.data : [...prev, ...data.data]);
//   }, [search]);

//   useEffect(() => {
//     (async () => {
//       setLoading(true);
//       try { await fetchPage(1, true); setPage(1); } 
//       catch(e){ Alert.alert('Error', e.message); } 
//       finally{ setLoading(false); }
//     })();
//   }, [fetchPage]);

//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     try { await fetchPage(1, true); setPage(1); } finally { setRefreshing(false); }
//   }, [fetchPage]);

//   const loadMore = useCallback(async () => {
//     if (loadingMore || loading || page >= pages) return;
//     setLoadingMore(true);
//     try { const next = page + 1; await fetchPage(next, false); setPage(next); }
//     finally { setLoadingMore(false); }
//   }, [loadingMore, loading, page, pages, fetchPage]);

//   const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id);

//   const openBooking = (prop) => setBookingModal({ visible: true, property: prop });
//   const openComment = (prop) => setCommentModal({ visible: true, property: prop });

//   const renderItem = ({ item }) => {
//     const img = ensureAbsolute(item?.images?.[0]?.url || item?.images?.[0]);
//     const expanded = expandedId === item._id;

//     return (
//       <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-3 mx-4">
//         <TouchableOpacity activeOpacity={0.85} onPress={() => toggleExpand(item._id)}>
//           {img ? (
//             <Image source={{ uri: img }} style={{ width: '100%', height: 170 }} resizeMode="cover" />
//           ) : (
//             <View className="w-full h-[170px] bg-gray-100 items-center justify-center">
//               <Ionicons name="image-outline" size={22} color="#9ca3af" />
//             </View>
//           )}
//           <View className="p-3">
//             <Text className="text-[16px] font-semibold text-gray-900" numberOfLines={1}>{item.title}</Text>
//             <Text className="text-[12px] text-gray-500" numberOfLines={1}>{item.address}</Text>
//             <View className="flex-row items-center mt-2">
//               <View className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 mr-2">
//                 <Text className="text-indigo-700 text-[10px] font-semibold">{currency(item.rentPrice)}/mo</Text>
//               </View>
//               <View className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
//                 <Text className="text-emerald-700 text-[10px] font-semibold">{item.propertyType}</Text>
//               </View>
//             </View>
//           </View>
//         </TouchableOpacity>

//         {expanded && (
//           <View className="px-3 pb-3">
//             <Text className="text-gray-700 text-[13px]">{item.description}</Text>

//             {/* Actions */}
//             <View className="flex-row mt-3">
//               <TouchableOpacity onPress={() => openBooking(item)} className="flex-1 mr-2 bg-[#3cc172] rounded-xl py-3 items-center">
//                 <Text className="text-white font-semibold">Book</Text>
//               </TouchableOpacity>
//               <TouchableOpacity onPress={() => openComment(item)} className="flex-1 bg-gray-800 rounded-xl py-3 items-center">
//                 <Text className="text-white font-semibold">Comment</Text>
//               </TouchableOpacity>
//             </View>

//             {/* View comments */}
//             <CommentsBlock propertyId={item._id} />
//           </View>
//         )}
//       </View>
//     );
//   };

//   if (loading) return (
//     <View className="flex-1 items-center justify-center bg-gray-50">
//       <ActivityIndicator /><Text className="mt-2 text-gray-600">Loading…</Text>
//     </View>
//   );

//   return (
//     <View className="flex-1 bg-white">
//       {/* Search */}
//       <View className={`${Platform.OS === 'android' ? 'pt-10' : 'pt-12'} px-4 pb-3 bg-white`}>
//         <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2">
//           <Ionicons name="search" size={18} color="#6b7280" />
//           <TextInput
//             value={search} onChangeText={setSearch} placeholder="Search…" className="flex-1 ml-2"
//             onSubmitEditing={onRefresh} returnKeyType="search" />
//           {search ? (
//             <TouchableOpacity onPress={() => { setSearch(''); onRefresh(); }}>
//               <Ionicons name="close-circle" size={18} color="#9ca3af" />
//             </TouchableOpacity>
//           ) : null}
//         </View>
//       </View>

//       <FlatList
//         data={items}
//         keyExtractor={(it) => it._id}
//         renderItem={renderItem}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//         onEndReachedThreshold={0.3}
//         onEndReached={loadMore}
//         ListFooterComponent={loadingMore ? <View className="py-4 items-center"><ActivityIndicator/></View> : null}
//       />

//       {/* Booking modal */}
//       <BookingModal modal={bookingModal} setModal={setBookingModal} />

//       {/* Comment modal */}
//       <CommentModal modal={commentModal} setModal={setCommentModal} />
//     </View>
//   );
// }

// /* ---------- Comments block (inline view) ---------- */
// function CommentsBlock({ propertyId }) {
//   const [items, setItems] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const load = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/PropertyOperations/${propertyId}/comments`);
//       const data = await res.json();
//       setItems(data?.data || []);
//     } catch {}
//     setLoading(false);
//   }, [propertyId]);

//   useEffect(() => { load(); }, [load]);

//   if (loading && !items) return <View className="mt-3"><ActivityIndicator/></View>;
//   if (!items || items.length === 0) return <Text className="text-gray-500 mt-3">No comments yet.</Text>;

//   return (
//     <View className="mt-3">
//       <Text className="font-semibold text-gray-900 mb-1">User comments</Text>
//       {items.slice(0,3).map((c) => (
//         <View key={c._id} className="bg-gray-50 border border-gray-200 rounded-xl p-2 mb-2">
//           <Text className="text-[12px] text-gray-500">{c.userId?.uname || 'User'} • {new Date(c.createdAt).toLocaleDateString()}</Text>
//           {c.rating ? <Text className="text-amber-600 text-[12px] mt-1">⭐ {c.rating}/5</Text> : null}
//           <Text className="text-[13px] text-gray-800 mt-1">{c.text}</Text>
//         </View>
//       ))}
//       {items.length > 3 && <Text className="text-[12px] text-gray-500 mt-1">+ {items.length - 3} more…</Text>}
//     </View>
//   );
// }

// /* ---------- Booking modal ---------- */
// function BookingModal({ modal, setModal }) {
//   const prop = modal.property;
//   const [start, setStart] = useState('');
//   const [end, setEnd] = useState('');
//   const [guests, setGuests] = useState('1');
//   const [busy, setBusy] = useState(false);

//   useEffect(() => { if (!modal.visible) { setStart(''); setEnd(''); setGuests('1'); setBusy(false);} }, [modal.visible]);

//   const submit = async () => {
//     try {
//       const token = await AsyncStorage.getItem('auth_token');
//       if (!token) return Alert.alert('Sign in required');

//       setBusy(true);
//       const res = await fetch(`${API_BASE}/PropertyOperations/${prop._id}/bookings`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
//         body: JSON.stringify({ startDate: start, endDate: end, guests: Number(guests||1) })
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.message || 'Booking failed');
//       Alert.alert('Booked (pending)', `Total: LKR ${Math.round(data.data.totalPrice).toLocaleString()}`);
//       setModal({ visible: false, property: null });
//     } catch (e) {
//       Alert.alert('Error', e.message);
//     } finally { setBusy(false); }
//   };

//   return (
//     <Modal visible={modal.visible} transparent animationType="slide" onRequestClose={() => setModal({ visible:false, property:null })}>
//       <View className="flex-1 bg-black/40 justify-end">
//         <View className="bg-white rounded-t-2xl p-4">
//           <Text className="text-lg font-bold mb-2">Book {prop?.title}</Text>
//           <View className="flex-row mb-2">
//             <TextInput value={start} onChangeText={setStart} placeholder="Start (YYYY-MM-DD)" className="flex-1 bg-gray-100 rounded-xl px-3 py-2 mr-2"/>
//             <TextInput value={end} onChangeText={setEnd} placeholder="End (YYYY-MM-DD)" className="flex-1 bg-gray-100 rounded-xl px-3 py-2"/>
//           </View>
//           <View className="flex-row mb-3">
//             <TextInput value={guests} onChangeText={setGuests} placeholder="Guests" keyboardType="number-pad" className="flex-1 bg-gray-100 rounded-xl px-3 py-2"/>
//           </View>
//           <View className="flex-row">
//             <Pressable onPress={() => setModal({ visible:false, property:null })} className="flex-1 mr-2 bg-gray-200 rounded-xl py-3 items-center">
//               <Text className="font-semibold text-gray-800">Cancel</Text>
//             </Pressable>
//             <Pressable disabled={busy} onPress={submit} className={`flex-1 bg-[#3cc172] rounded-xl py-3 items-center ${busy ? 'opacity-70':''}`}>
//               {busy ? <ActivityIndicator color="#fff"/> : <Text className="text-white font-semibold">Confirm</Text>}
//             </Pressable>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// /* ---------- Comment modal ---------- */
// function CommentModal({ modal, setModal }) {
//   const prop = modal.property;
//   const [text, setText] = useState('');
//   const [rating, setRating] = useState('5');
//   const [busy, setBusy] = useState(false);

//   useEffect(() => { if (!modal.visible) { setText(''); setRating('5'); setBusy(false);} }, [modal.visible]);

//   const submit = async () => {
//     try {
//       const token = await AsyncStorage.getItem('auth_token');
//       if (!token) return Alert.alert('Sign in required');

//       setBusy(true);
//       const res = await fetch(`${API_BASE}/PropertyOperations/${prop._id}/comments`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
//         body: JSON.stringify({ text, rating: Number(rating) })
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.message || 'Comment failed');
//       Alert.alert('Posted', 'Your comment has been added.');
//       setModal({ visible: false, property: null });
//     } catch (e) {
//       Alert.alert('Error', e.message);
//     } finally { setBusy(false); }
//   };

//   return (
//     <Modal visible={modal.visible} transparent animationType="slide" onRequestClose={() => setModal({ visible:false, property:null })}>
//       <View className="flex-1 bg-black/40 justify-end">
//         <View className="bg-white rounded-t-2xl p-4">
//           <Text className="text-lg font-bold mb-2">Comment on {prop?.title}</Text>
//           <TextInput value={text} onChangeText={setText} placeholder="Write your comment…" multiline className="bg-gray-100 rounded-xl px-3 py-2 h-28 mb-2"/>
//           <TextInput value={rating} onChangeText={setRating} placeholder="Rating (1-5)" keyboardType="number-pad" className="bg-gray-100 rounded-xl px-3 py-2 mb-3"/>
//           <View className="flex-row">
//             <Pressable onPress={() => setModal({ visible:false, property:null })} className="flex-1 mr-2 bg-gray-200 rounded-xl py-3 items-center">
//               <Text className="font-semibold text-gray-800">Cancel</Text>
//             </Pressable>
//             <Pressable disabled={busy} onPress={submit} className={`flex-1 bg-gray-800 rounded-xl py-3 items-center ${busy ? 'opacity-70':''}`}>
//               {busy ? <ActivityIndicator color="#fff"/> : <Text className="text-white font-semibold">Post</Text>}
//             </Pressable>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// }

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, TextInput,
  ActivityIndicator, RefreshControl, Alert, Platform, Modal, Pressable,
  Animated, Linking, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

/* ---- Badge styles with icons ---- */
const BADGE_STYLES = {
  Platinum: { bg: '#e0f2fe', text: '#0369a1', icon: 'diamond-outline', border: '#bae6fd' },
  Gold: { bg: '#fef3c7', text: '#92400e', icon: 'trophy-outline', border: '#fde68a' },
  Silver: { bg: '#f8fafc', text: '#475569', icon: 'medal-outline', border: '#cbd5e1' },
  Bronze: { bg: '#fff7ed', text: '#9a3412', icon: 'ribbon-outline', border: '#fed7aa' },
  Unverified: { bg: '#f3f4f6', text: '#6b7280', icon: 'alert-circle-outline', border: '#e5e7eb' },
};

/* ---------- Filters (under search) ---------- */
const TYPES = ['Apartment', 'House', 'Studio', 'Villa', 'Townhouse'];
const PRICES = [
  { label: '≤ 100k', min: '', max: 100000 },
  { label: '≤ 200k', min: '', max: 200000 },
  { label: '≤ 300k', min: '', max: 300000 },
  { label: 'Any', min: '', max: '' },
];

export default function PropertyList() {
  const navigation = useNavigation();

  const [items, setItems] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // search + filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState(PRICES[3]); // Any by default

  // comments modal
  const [commentModal, setCommentModal] = useState({ visible: false, property: null });

  // zoom modal
  const [zoom, setZoom] = useState({ visible: false, item: null });

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

  // initial + when filters change
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await fetchPage(1, true);
        setPage(1);
      } catch (e) {
        Alert.alert('Error', e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchPage]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchPage(1, true);
      setPage(1);
    } finally {
      setRefreshing(false);
    }
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (loadingMore || loading || page >= pages) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      await fetchPage(next, false);
      setPage(next);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, loading, page, pages, fetchPage]);

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));
  const goToBooking = (prop) => navigation.navigate('BookingScreen', { property: prop });

  const openZoom = (item) => setZoom({ visible: true, item });
  const closeZoom = () => setZoom({ visible: false, item: null });

  const renderItem = ({ item, index }) => {
    const img = ensureAbsolute(item?.images?.[0]?.url || item?.images?.[0]);
    const expanded = expandedId === item._id;
    const badge = item?.ecoBadge || 'Unverified';
    const pal = BADGE_STYLES[badge] || BADGE_STYLES.Unverified;

    const lat = item?.location?.coordinates?.[1];
    const lng = item?.location?.coordinates?.[0];

    return (
      <View
        className="rounded-2xl overflow-hidden"
        style={{
          width: '48%',
          marginTop: index < 2 ? 0 : 12,
          backgroundColor: '#fff',
          borderColor: '#eef2f7',
          borderWidth: 1,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        }}
      >
        <TouchableOpacity activeOpacity={0.88} onPress={() => toggleExpand(item._id)}>
          <View style={{ position: 'relative' }}>
            <TouchableOpacity activeOpacity={0.9} onPress={() => openZoom(item)}>
              {img ? (
                <Image source={{ uri: img }} style={{ width: '100%', height: 120 }} resizeMode="cover" />
              ) : (
                <View style={{ width: '100%', height: 120 }} className="bg-gray-100 items-center justify-center">
                  <Ionicons name="image-outline" size={18} color="#9ca3af" />
                </View>
              )}
            </TouchableOpacity>

            {/* eco badge chip */}
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
                shadowOpacity: 0.08,
                shadowRadius: 3,
                shadowOffset: { width: 0, height: 1 },
              }}
            >
              <Ionicons name={pal.icon} size={12} color={pal.text} style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: pal.text }}>{badge}</Text>
            </View>
          </View>

          <View style={{ paddingHorizontal: 10, paddingVertical: 8 }}>
            <Text className="text-[14px] font-semibold text-gray-900" numberOfLines={1}>
              {item.title}
            </Text>
            <Text className="text-[11px] text-gray-500 mt-0.5" numberOfLines={1}>
              {item.address}
            </Text>

            <View className="flex-row items-center mt-2">
              <View className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 mr-1.5">
                <Text className="text-indigo-700 text-[10px] font-semibold">{currency(item.rentPrice)}/mo</Text>
              </View>
              <View className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                <Text className="text-emerald-700 text-[10px] font-semibold">{item.propertyType}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* expanded section */}
        {expanded && (
          <View style={{ paddingHorizontal: 10, paddingBottom: 10 }}>
            <Text className="text-gray-700 text-[12px]">{item.description}</Text>

            {/* location details */}
            <View className="mt-2 bg-gray-50 border border-gray-200 rounded-xl p-2">
              <View className="flex-row items-center">
                <Ionicons name="location-outline" size={14} color="#374151" />
                <Text className="ml-1 text-[12px] text-gray-800" numberOfLines={2}>
                  {item.address}
                </Text>
              </View>
              {!!lat && !!lng && (
                <View className="flex-row items-center mt-1">
                  <Ionicons name="map-outline" size={14} color="#374151" />
                  <Text className="ml-1 text-[11px] text-gray-600">
                    lat: {lat.toFixed(5)}, lng: {lng.toFixed(5)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      const url = Platform.select({
                        ios: `maps://?q=${encodeURIComponent(item.title)}&ll=${lat},${lng}`,
                        android: `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(item.title)})`,
                      });
                      Linking.openURL(url);
                    }}
                    className="ml-auto px-2 py-1 rounded-lg"
                    style={{ backgroundColor: '#eef2ff', borderWidth: 1, borderColor: '#e0e7ff' }}
                  >
                    <Text className="text-[11px] font-semibold" style={{ color: '#4338ca' }}>
                      Open in Maps
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* actions */}
            <View className="flex-row mt-2">
              <TouchableOpacity
                onPress={() => goToBooking(item)}
                style={{ flex: 1, marginRight: 6 }}
                className="bg-[#3cc172] rounded-xl py-2 items-center"
              >
                <Text className="text-white font-semibold text-[12px]">Book</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setCommentModal({ visible: true, property: item })}
                style={{ flex: 1, marginLeft: 6 }}
                className="bg-gray-800 rounded-xl py-2 items-center"
              >
                <Text className="text-white font-semibold text-[12px]">Comment</Text>
              </TouchableOpacity>
            </View>

            <CommentsBlock propertyId={item._id} compact />
          </View>
        )}
      </View>
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
    <View className="flex-1 mt-20 bg-[#f7f9fc]">
      {/* Header: Back + Search */}
      <View className={`${Platform.OS === 'android' ? 'pt-8' : 'pt-12'} pb-3 px-4 bg-white border-b border-gray-100`}>
        <View className="flex-row items-center justify-between mb-2">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-2 rounded-xl bg-gray-100 border border-gray-200"
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </TouchableOpacity>
          <Text className="text-lg font-extrabold text-gray-900">Discover</Text>
          <View style={{ width: 40 }} />
        </View>

        <View
          className="flex-row items-center"
          style={{
            backgroundColor: '#f1f5f9',
            borderRadius: 14,
            paddingHorizontal: 10,
            paddingVertical: Platform.OS === 'android' ? 6 : 8,
            borderWidth: 1,
            borderColor: '#e5e7eb',
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
            >
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filters row */}
        <FiltersRow
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          priceFilter={priceFilter}
          setPriceFilter={setPriceFilter}
          onApply={() =>
            fetchPage(1, true).then(() => {
              setPage(1);
            })
          }
        />
      </View>

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

      {/* Zoom + location modal */}
      <ZoomPreview modal={zoom} onClose={closeZoom} />

      {/* Comments modal */}
      {/* ✅ Fixed prop names */}
      <CommentModal modal={commentModal} setModal={setCommentModal} />
    </View>
  );
}

/* ---------- Filters Row Component ---------- */
function FiltersRow({ typeFilter, setTypeFilter, priceFilter, setPriceFilter, onApply }) {
  return (
    <View className="mt-2">
      <View className="flex-row items-center">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 8 }}>
          {/* Type chips */}
          <Chip label="All Types" active={!typeFilter} onPress={() => setTypeFilter('')} />
          {TYPES.map((t) => (
            <Chip key={t} label={t} active={typeFilter === t} onPress={() => setTypeFilter((prev) => (prev === t ? '' : t))} />
          ))}

          {/* Price chips */}
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

/* ---------- Zoom Preview Modal (animated zoom-in + location) ---------- */
function ZoomPreview({ modal, onClose }) {
  const { visible, item } = modal || {};
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 7, tension: 60, useNativeDriver: true }),
      ]).start();
    } else {
      opacity.setValue(0);
      scale.setValue(0.9);
    }
  }, [visible]);

  if (!visible || !item) return null;

  const img = ensureAbsolute(item?.images?.[0]?.url || item?.images?.[0]);
  const lat = item?.location?.coordinates?.[1];
  const lng = item?.location?.coordinates?.[0];

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', opacity }}>
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 16 }}>
          <Animated.View style={{ transform: [{ scale }], borderRadius: 16, overflow: 'hidden', backgroundColor: '#fff' }}>
            {img ? (
              <Image source={{ uri: img }} style={{ width: '100%', height: 280 }} resizeMode="cover" />
            ) : (
              <View style={{ width: '100%', height: 280 }} className="bg-gray-100 items-center justify-center">
                <Ionicons name="image-outline" size={24} color="#9ca3af" />
              </View>
            )}

            <View style={{ padding: 12 }}>
              <Text className="text-[16px] font-bold text-gray-900" numberOfLines={1}>
                {item.title}
              </Text>
              <Text className="text-[12px] text-gray-600 mt-1">{item.address}</Text>

              {!!lat && !!lng && (
                <View className="flex-row items-center mt-2">
                  <Ionicons name="navigate-outline" size={16} color="#111827" />
                  <Text className="ml-1 text-[12px] text-gray-700">
                    {lat.toFixed(5)}, {lng.toFixed(5)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      const url = Platform.select({
                        ios: `maps://?q=${encodeURIComponent(item.title)}&ll=${lat},${lng}`,
                        android: `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(item.title)})`,
                      });
                      Linking.openURL(url);
                    }}
                    className="ml-auto px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: '#ecfeff', borderWidth: 1, borderColor: '#a5f3fc' }}
                  >
                    <Text className="text-[12px] font-semibold" style={{ color: '#0e7490' }}>
                      View in Maps
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity onPress={onClose} className="mt-3 py-3 rounded-xl items-center" style={{ backgroundColor: '#111827' }} activeOpacity={0.9}>
                <Text className="text-white font-semibold">Close</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Animated.View>
    </Modal>
  );
}

/* ---------- Comments block (compact list) ---------- */
function CommentsBlock({ propertyId, compact = false }) {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/PropertyOperations/${propertyId}/comments`);
      const data = await res.json();
      setItems(data?.data || []);
    } catch {}
    setLoading(false);
  }, [propertyId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !items) return <View className="mt-2"><ActivityIndicator /></View>;
  if (!items || items.length === 0) return <Text className="text-gray-500 mt-2 text-[11px]">No comments yet.</Text>;

  const slice = compact ? items.slice(0, 2) : items;

  return (
    <View className="mt-2">
      <Text className="font-semibold text-gray-900 mb-1 text-[12px]">Recent comments</Text>
      {slice.map((c) => (
        <View key={c._id} className="bg-gray-50 border border-gray-200 rounded-lg p-2 mb-1.5">
          <Text className="text-[10px] text-gray-500">
            {c.userId?.uname || 'User'} • {new Date(c.createdAt).toLocaleDateString()}
          </Text>
          {c.rating ? <Text className="text-amber-600 text-[11px] mt-0.5">⭐ {c.rating}/5</Text> : null}
          <Text className="text-[12px] text-gray-800 mt-0.5" numberOfLines={3}>
            {c.text}
          </Text>
        </View>
      ))}
      {items.length > slice.length && <Text className="text-[11px] text-gray-500 mt-0.5">+ {items.length - slice.length} more…</Text>}
    </View>
  );
}

/* ---------- Comment modal (fixed prop names) ---------- */
function CommentModal({ modal, setModal }) {
  const prop = modal.property;
  const [text, setText] = useState('');
  const [rating, setRating] = useState('5');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!modal.visible) {
      setText('');
      setRating('5');
      setBusy(false);
    }
  }, [modal.visible]);

  const submit = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) return Alert.alert('Sign in required');

      setBusy(true);
      const res = await fetch(`${API_BASE}/PropertyOperations/${prop._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text, rating: Number(rating) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Comment failed');
      Alert.alert('Posted', 'Your comment has been added.');
      setModal({ visible: false, property: null });
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={modal.visible} transparent animationType="slide" onRequestClose={() => setModal({ visible: false, property: null })}>
      <View className="flex-1 bg-black/40 justify-end">
        <View className="bg-white rounded-t-2xl p-4">
          <Text className="text-lg font-bold mb-2" numberOfLines={1}>
            Comment on {prop?.title}
          </Text>
          <TextInput value={text} onChangeText={setText} placeholder="Write your comment…" multiline className="bg-gray-100 rounded-xl px-3 py-2 h-24 mb-2" />
          <TextInput value={rating} onChangeText={setRating} placeholder="Rating (1-5)" keyboardType="number-pad" className="bg-gray-100 rounded-xl px-3 py-2 mb-3" />
          <View className="flex-row">
            <Pressable onPress={() => setModal({ visible: false, property: null })} className="flex-1 mr-2 bg-gray-200 rounded-xl py-3 items-center">
              <Text className="font-semibold text-gray-800">Cancel</Text>
            </Pressable>
            <Pressable disabled={busy} onPress={submit} className={`flex-1 bg-gray-800 rounded-xl py-3 items-center ${busy ? 'opacity-70' : ''}`}>
              {busy ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold">Post</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}