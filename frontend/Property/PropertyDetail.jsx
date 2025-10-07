// import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
// import {
//   View, Text, Image, TouchableOpacity, ScrollView, Platform, Modal,
//   Pressable, ActivityIndicator, Alert, Animated, Linking, TextInput
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Ionicons } from '@expo/vector-icons';
// import { useRoute, useNavigation } from '@react-navigation/native';



// const PRIMARY = '#3CC172'; // brand green

// const API_BASE = Platform.OS === 'ios' ? 'http://localhost:4000' : 'http://10.0.2.2:4000';
// const REVIEW_BASE = `${API_BASE}/ReviewOperations`;


// const ensureAbsolute = (u) =>
//   !u ? u : /^https?:\/\//.test(u) ? u : `${API_BASE}/${String(u).replace(/^\/?/, '').replace(/\\/g, '/')}`;

// const currency = (n) =>
//   new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(Number(n || 0));

// const BADGE_STYLES = {
//   Platinum: { bg: '#e0f2fe', text: '#0369a1', icon: 'diamond', border: '#bae6fd', big: 'diamond' },
//   Gold: { bg: '#fef3c7', text: '#92400e', icon: 'trophy', border: '#fde68a', big: 'trophy' },
//   Silver: { bg: '#f8fafc', text: '#475569', icon: 'medal', border: '#cbd5e1', big: 'medal' },
//   Bronze: { bg: '#fff7ed', text: '#9a3412', icon: 'ribbon', border: '#fed7aa', big: 'ribbon' },
//   Unverified: { bg: '#f3f4f6', text: '#6b7280', icon: 'alert-circle', border: '#e5e7eb', big: 'alert-circle' },
// };

// const getLocationLabel = (item) => {
//   if (item?.locationName && typeof item.locationName === 'string') return item.locationName;
//   if (item?.address && typeof item.address === 'string') {
//     const first = item.address.split(',').map(s => s.trim()).filter(Boolean)[0];
//     return first || 'Location';
//   }
//   return 'Location';
// };


// const FEATURE_KEYS = ['solarPanels', 'recycling', 'energyRating', 'insulation', 'greyWater'];
// function computeEcoScoreLocal(ecoFeatures = []) {
//   if (!Array.isArray(ecoFeatures) || ecoFeatures.length === 0) return 0;
//   const totalPossible = FEATURE_KEYS.length;
//   const selected = ecoFeatures.filter((k) => FEATURE_KEYS.includes(k)).length;
//   const ratio = selected / totalPossible;
//   return Math.round(Math.max(0, Math.min(1, ratio)) * 100);
// }

// /** Small progress bar */
// function EcoScoreBar({ score = 0 }) {
//   const pct = Math.max(0, Math.min(100, Number(score) || 0));
//   return (
//     <View>
//       <View className="flex-row items-center justify-between mb-1">
//         <Text className="text-[12px] text-gray-700">Eco score</Text>
//         <Text className="text-[12px] font-semibold text-gray-900">{pct}/100</Text>
//       </View>
//       <View style={{ height: 8, borderRadius: 999 }} className="bg-gray-200 overflow-hidden">
//         <View style={{ width: `${pct}%`, height: 8 }} className="bg-emerald-500" />
//       </View>
//     </View>
//   );
// }

// export default function PropertyDetail() {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const prop = route.params?.property || {};

//   const [commentModal, setCommentModal] = useState({ visible: false, property: prop });
//   const [commentsTick, setCommentsTick] = useState(0);
//   const [zoom, setZoom] = useState(false);
//   const [bookingOpen, setBookingOpen] = useState(false);

//   const img = ensureAbsolute(prop?.images?.[0]?.url || prop?.images?.[0]);
//   const badge = prop?.ecoBadge || 'Unverified';
//   const pal = BADGE_STYLES[badge] || BADGE_STYLES.Unverified;

//   // Eco score: prefer backend value; else compute locally from features
//   const ecoScore = useMemo(() => {
//     if (typeof prop?.ecoScore === 'number') return Math.round(prop.ecoScore);
//     return computeEcoScoreLocal(prop?.ecoFeatures);
//   }, [prop?.ecoScore, prop?.ecoFeatures]);

//   const lat = prop?.location?.coordinates?.[1];
//   const lng = prop?.location?.coordinates?.[0];
//   const locLabel = getLocationLabel(prop);

//   return (
//     <View className="flex-1 bg-white">
//       {/* Header */}
//       <View className={`${Platform.OS === 'android' ? 'pt-10' : 'pt-14'} pb-3 px-4 bg-white border-b border-gray-100 flex-row items-center justify-between`}>
//         <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 rounded-xl bg-gray-100 border border-gray-200" activeOpacity={0.8}>
//           <Ionicons name="arrow-back" size={20} color="#111827" />
//         </TouchableOpacity>
//         <Text className="text-lg font-extrabold text-gray-900" numberOfLines={1}>Property</Text>
//         <View style={{ width: 40 }} />
//       </View>

//       <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
//         {/* 1) Hero image */}
//         <TouchableOpacity activeOpacity={0.95} onPress={() => setZoom(true)}>
//           {img ? (
//             <Image source={{ uri: img }} style={{ width: '100%', height: 260 }} resizeMode="cover" />
//           ) : (
//             <View style={{ width: '100%', height: 260 }} className="bg-gray-100 items-center justify-center">
//               <Ionicons name="image-outline" size={24} color="#9ca3af" />
//             </View>
//           )}
//         </TouchableOpacity>

//         {/* 2) Badge row (large icon + quick stats + Eco Score) */}
//         <View className="px-4 mt-4">
//           <View className="flex-row items-center">
//             <View className="mr-3 items-center justify-center rounded-2xl" style={{ backgroundColor: pal.bg, padding: 12, borderWidth: 1, borderColor: pal.border }}>
//               <Ionicons name={pal.big} size={28} color={pal.text} />
//             </View>

//             <View className="flex-1">
//               <View
//                 style={{ alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: pal.border, backgroundColor: pal.bg }}
//               >
//                 <Text style={{ color: pal.text, fontWeight: '700', fontSize: 12 }}>{badge}</Text>
//               </View>

//               <View className="flex-row items-center mt-2">
//                 {prop?.avgRating !== undefined ? (
//                   <Text className="text-[12px] text-gray-700" numberOfLines={1}>
//                     ⭐ {prop.avgRating || 0} · {prop.reviewCount || 0} reviews
//                   </Text>
//                 ) : null}
//               </View>
//             </View>

//             {!!lat && !!lng && (
//               <TouchableOpacity
//                 onPress={() => {
//                   const url = Platform.select({
//                     ios: `maps://?q=${encodeURIComponent(prop.title)}&ll=${lat},${lng}`,
//                     android: `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(prop.title)})`,
//                   });
//                   Linking.openURL(url);
//                 }}
//                 className="px-3 py-2 rounded-xl ml-2"
//                 style={{ backgroundColor: '#ecfeff', borderWidth: 1, borderColor: '#a5f3fc' }}
//                 activeOpacity={0.9}
//               >
//                 <Text className="text-[12px] font-semibold" style={{ color: '#0e7490' }}>View in Maps</Text>
//               </TouchableOpacity>
//             )}
//           </View>

//           {/* Eco Score sits directly under the badge row for perfect alignment */}
//           <View className="mt-3">
//             <EcoScoreBar score={ecoScore} />
//           </View>
//         </View>

//         {/* 3) Property details row */}
//         <View className="px-4 mt-4">
//           <Text className="text-xl font-extrabold text-gray-900" numberOfLines={2}>
//             {prop?.title || 'Property'}
//           </Text>

//           <View className="flex-row items-center mt-1">
//             <Ionicons name="location-outline" size={14} color="#6b7280" />
//             <Text className="text-[12px] text-gray-700 ml-1" numberOfLines={1}>{locLabel}</Text>
//           </View>

//           <Text className="text-[12px] text-gray-600 mt-1">{prop?.address}</Text>

//           <View className="flex-row items-center mt-2">
//             <View className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 mr-1.5">
//               <Text className="text-indigo-700 text-[12px] font-semibold">{currency(prop?.rentPrice)}/mo</Text>
//             </View>
//             <View className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
//               <Text className="text-emerald-700 text-[12px] font-semibold">{prop?.propertyType}</Text>
//             </View>
//           </View>

//           {prop?.description ? (
//             <Text className="text-gray-700 text-[13px] mt-3">{prop.description}</Text>
//           ) : null}
//         </View>

//         {/* 4) Request to Contact */}
//         <View className="px-4 mt-5">
//           <TouchableOpacity
//             onPress={() => setBookingOpen(true)}
//             className="items-center py-3 rounded-xl"
//             style={{ backgroundColor: '#111827' }}
//             activeOpacity={0.9}
//           >
//             <Text className="text-white font-semibold">Request to Contact</Text>
//           </TouchableOpacity>
//         </View>

//         {/* 5) Write review */}
//         <View className="px-4 mt-3">
//           <TouchableOpacity
//             onPress={() => setCommentModal({ visible: true, property: prop })}
//             className="items-center py-3 rounded-xl"
//             style={{ backgroundColor: '#0b5cff' }}
//             activeOpacity={0.9}
//           >
//             <Text className="text-white font-semibold">Write a Review</Text>
//           </TouchableOpacity>
//         </View>

//         {/* 6) Reviews list */}
//         <View className="px-4 mt-5">
//           <Text className="font-semibold text-gray-900 text-[14px] mb-2">Reviews</Text>
//           <CommentsBlock propertyId={prop?._id} title="Reviews" reloadKey={commentsTick} />
//         </View>
//       </ScrollView>

//       {/* Overlays */}
//       <ZoomImage visible={zoom} onClose={() => setZoom(false)} src={img} />
//       <CommentModal
//         modal={{ ...commentModal, property: prop }}
//         setModal={setCommentModal}
//         onPosted={() => setCommentsTick((t) => t + 1)}
//       />
//       <BookingRequestModal
//         visible={bookingOpen}
//         onClose={() => setBookingOpen(false)}
//         property={prop}
//       />
//     </View>
//   );
// }

// /* ---------- Comments, Modals, Zoom (unchanged) ---------- */
// function CommentsBlock({ propertyId, reloadKey, title = 'Reviews', compact = false }) {
//   const [items, setItems] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const load = useCallback(async () => {
//     if (!propertyId) return;
//     setLoading(true);
//     try {
//       const res = await fetch(`${REVIEW_BASE}/${propertyId}/comments`);
//       const data = await res.json();
//       setItems(data?.data || []);
//     } catch {}
//     setLoading(false);
//   }, [propertyId]);

//   useEffect(() => { load(); }, [load, reloadKey]);

//   if (loading && !items) return <View className="mt-2"><ActivityIndicator /></View>;
//   if (!items || items.length === 0) return <Text className="text-gray-500 mt-2 text-[11px]">No reviews yet.</Text>;

//   const slice = compact ? items.slice(0, 2) : items;

//   return (
//     <View className="mt-1">
//       <Text className="font-semibold text-gray-900 mb-1 text-[12px]">{title}</Text>
//       {slice.map((c) => {
//         const mood = c?.sentiment?.label;
//         const conf = typeof c?.sentiment?.confidence === 'number' ? ` (${Math.round(c.sentiment.confidence * 100)}%)` : '';
//         return (
//           <View key={c._id} className="bg-gray-50 border border-gray-200 rounded-lg p-2 mb-1.5">
//             <Text className="text-[10px] text-gray-500">
//               {c.userId?.uname || 'User'} • {new Date(c.createdAt).toLocaleDateString()}
//             </Text>
//             {c.rating ? <Text className="text-amber-600 text-[11px] mt-0.5">⭐ {c.rating}/5</Text> : null}
//             {mood ? <Text className="text-[10px] text-gray-500 mt-0.5">Mood: {mood}{conf}</Text> : null}
//             <Text className="text-[12px] text-gray-800 mt-0.5">{c.text}</Text>
//           </View>
//         );
//       })}
//       {items.length > slice.length && (
//         <Text className="text-[11px] text-gray-500 mt-0.5">+ {items.length - slice.length} more…</Text>
//       )}
//     </View>
//   );
// }

// function CommentModal({ modal, setModal, onPosted }) {
//   const prop = modal.property;
//   const [text, setText] = useState('');
//   const [rating, setRating] = useState('5');
//   const [busy, setBusy] = useState(false);

//   useEffect(() => {
//     if (!modal.visible) { setText(''); setRating('5'); setBusy(false); }
//   }, [modal.visible]);

//   const submit = async () => {
//     try {
//       const token = await AsyncStorage.getItem('auth_token');
//       if (!token) return Alert.alert('Sign in required');

//       const t = text.trim();
//       const num = Number(rating);
//       if (!t) return Alert.alert('Required', 'Please enter your comment.');
//       if (Number.isNaN(num) || num < 1 || num > 5) return Alert.alert('Invalid rating', 'Rating must be between 1 and 5.');

//       setBusy(true);
//       const res = await fetch(`${REVIEW_BASE}/${prop._id}/comments`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
//         body: JSON.stringify({ text: t, rating: num }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.message || 'Comment failed');

//       Alert.alert('Posted', 'Your review has been added.');
//       onPosted?.();
//       setModal({ visible: false, property: prop });
//     } catch (e) {
//       Alert.alert('Error', e.message);
//     } finally {
//       setBusy(false);
//     }
//   };

//   return (
//     <Modal visible={modal.visible} transparent animationType="slide" onRequestClose={() => setModal({ visible: false, property: prop })}>
//       <View className="flex-1 bg-black/40 justify-end">
//         <View className="bg-white rounded-t-2xl p-4">
//           <Text className="text-lg font-bold mb-2" numberOfLines={1}>
//             Review {prop?.title}
//           </Text>
//           <View className="bg-gray-100 rounded-xl px-3 py-2 mb-2">
//             <TextInput
//               value={text}
//               onChangeText={setText}
//               placeholder="Write your review…"
//               multiline
//               style={{ minHeight: 96 }}
//             />
//           </View>
//           <View className="bg-gray-100 rounded-xl px-3 py-2 mb-3">
//             <TextInput
//               value={rating}
//               onChangeText={setRating}
//               placeholder="Rating (1-5)"
//               keyboardType="number-pad"
//             />
//           </View>

//           <View className="flex-row">
//             <Pressable onPress={() => setModal({ visible: false, property: prop })} className="flex-1 mr-2 bg-gray-200 rounded-xl py-3 items-center">
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

// // function BookingRequestModal({ visible, onClose, property }) {
// //   const [name, setName]           = useState('');
// //   const [email, setEmail]         = useState('');
// //   const [phone, setPhone]         = useState('');
// //   const [preferredDate, setPref]  = useState('');
// //   const [message, setMessage]     = useState('');
// //   const [submitting, setSubmitting] = useState(false);

// //   useEffect(() => {
// //     if (visible) {
// //       (async () => {
// //         try {
// //           const n = (await AsyncStorage.getItem('user_name')) || '';
// //           const e = (await AsyncStorage.getItem('user_email')) || '';
// //           setName(n);
// //           setEmail(e);
// //         } catch {}
// //       })();
// //     } else {
// //       setPref('');
// //       setMessage('');
// //       setSubmitting(false);
// //     }
// //   }, [visible]);

// //   const submit = async () => {
// //     try {
// //       if (!name.trim()) return Alert.alert('Name is required');
// //       const emailOk = !email || /^\S+@\S+\.\S+$/.test(email);
// //       if (!emailOk) return Alert.alert('Enter a valid email');

// //       setSubmitting(true);
// //       try {
// //         await AsyncStorage.setItem('user_name', name.trim());
// //         if (email) await AsyncStorage.setItem('user_email', email.trim());
// //       } catch {}

// //       const res = await fetch(`${API_BASE}/bookings`, {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({
// //           type: 'contactRequest',
// //           propertyId: property?._id,
// //           name: name.trim(),
// //           email: email.trim() || undefined,
// //           phone: phone.trim() || undefined,
// //           preferredDate: preferredDate.trim() || undefined,
// //           message: message.trim() || undefined,
// //         }),
// //       });

// //       const js = await res.json().catch(() => ({}));
// //       if (!res.ok || js?.success === false) {
// //         throw new Error(js?.message || 'Failed to send request');
// //       }

// //       Alert.alert('Request sent', 'The landlord will contact you soon.');
// //       onClose?.();
// //     } catch (e) {
// //       Alert.alert('Could not send', e.message || 'Please try again later.');
// //     } finally {
// //       setSubmitting(false);
// //     }
// //   };

// //   if (!visible) return null;

// //   return (
// //     <Modal visible transparent animationType="slide" onRequestClose={onClose}>
// //       <View className="flex-1 bg-black/40 justify-end">
// //         <View className="bg-white rounded-t-2xl p-4" style={{ maxHeight: '90%' }}>
// //           <View className="flex-row items-center justify-between mb-2">
// //             <Text className="text-lg font-bold">Request to Contact</Text>
// //             <TouchableOpacity onPress={onClose}>
// //               <Ionicons name="close" size={22} color="#111827" />
// //             </TouchableOpacity>
// //           </View>

// //           <Text className="text-[12px] text-gray-600 mb-3" numberOfLines={2}>
// //             {property?.title} · {property?.address}
// //           </Text>

// //           <View className="bg-gray-100 rounded-xl px-3 py-2 mb-2">
// //             <TextInput value={name} onChangeText={setName} placeholder="Your name *" />
// //           </View>
// //           <View className="bg-gray-100 rounded-xl px-3 py-2 mb-2">
// //             <TextInput value={email} onChangeText={setEmail} placeholder="Your email (optional)" keyboardType="email-address" autoCapitalize="none" />
// //           </View>
// //           <View className="bg-gray-100 rounded-xl px-3 py-2 mb-2">
// //             <TextInput value={phone} onChangeText={setPhone} placeholder="Your phone (optional)" keyboardType="phone-pad" />
// //           </View>
// //           <View className="bg-gray-100 rounded-xl px-3 py-2 mb-2">
// //             <TextInput value={preferredDate} onChangeText={setPref} placeholder="Preferred date (e.g., next week morning)" />
// //           </View>
// //           <View className="bg-gray-100 rounded-xl px-3 py-2 mb-3">
// //             <TextInput value={message} onChangeText={setMessage} placeholder="Message (optional)" multiline style={{ minHeight: 70 }} />
// //           </View>

// //           <Pressable
// //             disabled={submitting}
// //             onPress={submit}
// //             className={`py-3 rounded-xl items-center ${submitting ? 'opacity-60' : ''}`}
// //             style={{ backgroundColor: '#111827' }}
// //           >
// //             {submitting ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold">Send request</Text>}
// //           </Pressable>
// //         </View>
// //       </View>
// //     </Modal>
// //   );
// // }



// function BookingRequestModal({ visible, onClose, property }) {
//   const [name, setName]           = useState('');
//   const [email, setEmail]         = useState('');
//   const [phone, setPhone]         = useState('');
//   const [preferredDate, setPref]  = useState('');
//   const [message, setMessage]     = useState('');
//   const [submitting, setSubmitting] = useState(false);
//   const [errors, setErrors]       = useState({});

//   useEffect(() => {
//     if (visible) {
//       (async () => {
//         try {
//           const n = (await AsyncStorage.getItem('user_name')) || '';
//           const e = (await AsyncStorage.getItem('user_email')) || '';
//           setName(n);
//           setEmail(e);
//         } catch {}
//       })();
//     } else {
//       setPref('');
//       setMessage('');
//       setSubmitting(false);
//       setErrors({});
//     }
//   }, [visible]);

//   const validate = useCallback(() => {
//     const errs = {};
//     if (!name.trim()) errs.name = 'Your name is required';
//     if (email && !/^\S+@\S+\.\S+$/.test(email)) errs.email = 'Enter a valid email';
//     if (phone && String(phone).replace(/\D/g, '').length < 7) errs.phone = 'Phone seems too short';
//     setErrors(errs);
//     return Object.keys(errs).length === 0;
//   }, [name, email, phone]);

//   const quickPick = (label) => setPref(label);

// // BookingRequestModal.js (only the submit() fetch changed; keep the rest)
// const submit = async () => {
//   if (!validate()) return;
//   try {
//     setSubmitting(true);

//     try {
//       await AsyncStorage.setItem('user_name', name.trim());
//       if (email) await AsyncStorage.setItem('user_email', email.trim());
//     } catch {}

//     const payload = {
//       type: 'contactRequest',
//       propertyId: property?._id,
//       name: name.trim(),
//       email: email.trim() || undefined,
//       phone: phone.trim() || undefined,
//       preferredDate: preferredDate.trim() || undefined,
//       message: message.trim() || undefined,
//     };

//     // ✅ correct mounted route
//     const res = await fetch(`${API_BASE}/ReviewOperations/bookings`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(payload),
//     });

//     let data;
//     try {
//       data = await res.clone().json();
//     } catch {
//       const raw = await res.text().catch(() => '');
//       console.log('Non-JSON response body:', raw?.slice(0, 400));
//       throw new Error('Invalid response from server');
//     }

//     if (!res.ok || data?.success === false) {
//       throw new Error(data?.message || `Request failed with status ${res.status}`);
//     }

//     Alert.alert('Request sent', 'The landlord was notified. Please check your email for confirmation.');
//     onClose?.();
//   } catch (e) {
//     console.error('Booking submission error:', e);
//     Alert.alert('Could not send', e.message || 'Please try again later.');
//   } finally {
//     setSubmitting(false);
//   }
// };

//   if (!visible) return null;

//   return (
//     <Modal visible transparent animationType="slide" onRequestClose={onClose}>
//       <View className="flex-1 bg-black/40 justify-end">
//         <View className="bg-white rounded-t-3xl p-4" style={{ maxHeight: '92%' }}>
//           {/* sheet handle */}
//           <View className="items-center mb-2">
//             <View style={{ width: 56, height: 5, borderRadius: 999, backgroundColor: '#E5E7EB' }} />
//           </View>

//           {/* header */}
//           <View className="flex-row items-center justify-between mb-1">
//             <Text className="text-lg font-extrabold" numberOfLines={1}>Contact Landlord</Text>
//             <TouchableOpacity
//               accessibilityLabel="Close"
//               onPress={onClose}
//               className="p-2 rounded-xl"
//               style={{ backgroundColor: '#F3F4F6' }}>
//               <Ionicons name="close" size={20} color="#111827" />
//             </TouchableOpacity>
//           </View>

//           <Text className="text-[12px] text-gray-600 mb-3" numberOfLines={2}>
//             {property?.title} · {property?.address}
//           </Text>

//           {/* name */}
//           <View className="mb-2">
//             <View className="bg-gray-100 rounded-xl px-3 py-2 border" style={{ borderColor: errors.name ? '#EF4444' : 'transparent' }}>
//               <TextInput
//                 value={name}
//                 onChangeText={(t)=>{ setName(t); if (errors.name) setErrors(prev=>({ ...prev, name: undefined })); }}
//                 placeholder="Your name "
//                 accessibilityLabel="Your name"
//                 returnKeyType="next"
//               />
//             </View>
//             {errors.name ? <Text className="text-[11px] mt-1" style={{ color: '#EF4444' }}>{errors.name}</Text> : null}
//           </View>

//           {/* email */}
//           <View className="mb-2">
//             <View className="bg-gray-100 rounded-xl px-3 py-2 border" style={{ borderColor: errors.email ? '#EF4444' : 'transparent' }}>
//               <TextInput
//                 value={email}
//                 onChangeText={(t)=>{ setEmail(t); if (errors.email) setErrors(prev=>({ ...prev, email: undefined })); }}
//                 placeholder="Your email (optional)"
//                 accessibilityLabel="Your email"
//                 keyboardType="email-address"
//                 autoCapitalize="none"
//               />
//             </View>
//             {errors.email ? <Text className="text-[11px] mt-1" style={{ color: '#EF4444' }}>{errors.email}</Text> : null}
//           </View>

//           {/* phone */}
//           <View className="mb-2">
//             <View className="bg-gray-100 rounded-xl px-3 py-2 border" style={{ borderColor: errors.phone ? '#EF4444' : 'transparent' }}>
//               <TextInput
//                 value={phone}
//                 onChangeText={(t)=>{ setPhone(t); if (errors.phone) setErrors(prev=>({ ...prev, phone: undefined })); }}
//                 placeholder="Your phone (optional)"
//                 accessibilityLabel="Your phone"
//                 keyboardType="phone-pad"
//               />
//             </View>
//             {errors.phone ? <Text className="text-[11px] mt-1" style={{ color: '#EF4444' }}>{errors.phone}</Text> : null}
//           </View>

//           {/* preferred date + quick picks */}
//           <View className="mb-2">
//             <View className="bg-gray-100 rounded-xl px-3 py-2">
//               <TextInput
//                 value={preferredDate}
//                 onChangeText={setPref}
//                 placeholder="Preferred date/time (e.g., Sat 10:30 AM)"
//                 accessibilityLabel="Preferred date and time"
//               />
//             </View>
//             <View className="flex-row mt-2" style={{ gap: 8 }}>
//               {['Today evening', 'Tomorrow morning', 'This weekend'].map((lbl) => (
//                 <Pressable
//                   key={lbl}
//                   onPress={() => quickPick(lbl)}
//                   className="px-3 py-1.5 rounded-full border"
//                   style={{ borderColor: PRIMARY, backgroundColor: preferredDate === lbl ? `${PRIMARY}22` : 'white' }}
//                   accessibilityLabel={`Quick pick ${lbl}`}>
//                   <Text style={{ fontSize: 12, color: PRIMARY, fontWeight: preferredDate === lbl ? '700' : '600' }}>{lbl}</Text>
//                 </Pressable>
//               ))}
//             </View>
//           </View>

//           {/* message */}
//           <View className="mb-3">
//             <View className="bg-gray-100 rounded-xl px-3 py-2">
//               <TextInput
//                 value={message}
//                 onChangeText={setMessage}
//                 placeholder="Message (optional)"
//                 multiline
//                 style={{ minHeight: 80 }}
//                 accessibilityLabel="Message to landlord"
//               />
//             </View>
//             <Text className="text-[11px] text-gray-500 mt-1">
//               We’ll share your contact details with the landlord to arrange next steps.
//             </Text>
//           </View>

//           {/* CTA */}
//           <Pressable
//             disabled={submitting}
//             onPress={submit}
//             className={`py-3 rounded-xl items-center ${submitting ? 'opacity-70' : ''}`}
//             style={{ backgroundColor: PRIMARY }}
//             accessibilityRole="button"
//             accessibilityLabel="Send contact request">
//             {submitting ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold">Send request</Text>}
//           </Pressable>

//           {/* secondary: cancel */}
//           <Pressable
//             disabled={submitting}
//             onPress={onClose}
//             className="py-3 rounded-xl items-center mt-2"
//             style={{ backgroundColor: '#F3F4F6' }}
//             accessibilityRole="button"
//             accessibilityLabel="Cancel">
//             <Text className="font-semibold" style={{ color: '#111827' }}>Cancel</Text>
//           </Pressable>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// /* ---------- Zoom image ---------- */
// function ZoomImage({ visible, onClose, src }) {
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

//   if (!visible) return null;

//   return (
//     <Modal visible transparent animationType="none" onRequestClose={onClose}>
//       <Animated.View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', opacity }}>
//         <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 16 }}>
//           <Animated.View style={{ transform: [{ scale }], borderRadius: 16, overflow: 'hidden', backgroundColor: '#fff' }}>
//             {src ? (
//               <Image source={{ uri: src }} style={{ width: '100%', height: 320 }} resizeMode="cover" />
//             ) : (
//               <View style={{ width: '100%', height: 320 }} className="bg-gray-100 items-center justify-center">
//                 <Ionicons name="image-outline" size={24} color="#9ca3af" />
//               </View>
//             )}
//             <TouchableOpacity onPress={onClose} className="m-3 py-3 rounded-xl items-center" style={{ backgroundColor: '#111827' }} activeOpacity={0.9}>
//               <Text className="text-white font-semibold">Close</Text>
//             </TouchableOpacity>
//           </Animated.View>
//         </View>
//       </Animated.View>
//     </Modal>
//   );
// }






// screens/PropertyDetail.js
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  View, Text, Image, TouchableOpacity, Platform, Modal, Pressable,
  ActivityIndicator, Alert, Animated, Linking, TextInput, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';

/** ============================================================
 * UI-THEMING ONLY — LOGIC UNCHANGED
 * - same props, state, navigation, API endpoints
 * - only layout/typography/animations improved
 * ============================================================ */
const PRIMARY = '#3CC172'; // brand green
const INK = '#111827';
const MUTED = '#6B7280';
const CARD_BORDER = '#E5E7EB';
const SURFACE = '#FFFFFF';

const API_BASE = Platform.OS === 'ios' ? 'http://localhost:4000' : 'http://10.0.2.2:4000';
const REVIEW_BASE = `${API_BASE}/ReviewOperations`;

const ensureAbsolute = (u) =>
  !u ? u : /^https?:\/\//.test(u) ? u : `${API_BASE}/${String(u).replace(/^\/?/, '').replace(/\\/g, '/')}`;

const currency = (n) =>
  new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(Number(n || 0));

const BADGE_STYLES = {
  Platinum: { bg: '#e0f2fe', text: '#0369a1', icon: 'diamond', border: '#bae6fd', big: 'diamond' },
  Gold: { bg: '#fef3c7', text: '#92400e', icon: 'trophy', border: '#fde68a', big: 'trophy' },
  Silver: { bg: '#f8fafc', text: '#475569', icon: 'medal', border: '#cbd5e1', big: 'medal' },
  Bronze: { bg: '#fff7ed', text: '#9a3412', icon: 'ribbon', border: '#fed7aa', big: 'ribbon' },
  Unverified: { bg: '#f3f4f6', text: '#6b7280', icon: 'alert-circle', border: '#e5e7eb', big: 'alert-circle' },
};

const getLocationLabel = (item) => {
  if (item?.locationName && typeof item.locationName === 'string') return item.locationName;
  if (item?.address && typeof item.address === 'string') {
    const first = item.address.split(',').map(s => s.trim()).filter(Boolean)[0];
    return first || 'Location';
  }
  return 'Location';
};

// local eco score fallback (logic unchanged)
const FEATURE_KEYS = ['solarPanels', 'recycling', 'energyRating', 'insulation', 'greyWater'];
function computeEcoScoreLocal(ecoFeatures = []) {
  if (!Array.isArray(ecoFeatures) || ecoFeatures.length === 0) return 0;
  const totalPossible = FEATURE_KEYS.length;
  const selected = ecoFeatures.filter((k) => FEATURE_KEYS.includes(k)).length;
  const ratio = selected / totalPossible;
  return Math.round(Math.max(0, Math.min(1, ratio)) * 100);
}

/** Small progress bar (unchanged logic, refined visuals) */
function EcoScoreBar({ score = 0 }) {
  const pct = Math.max(0, Math.min(100, Number(score) || 0));
  return (
    <View>
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-[12px]" style={{ color: MUTED }}>Eco score</Text>
        <Text className="text-[12px] font-semibold" style={{ color: INK }}>{pct}/100</Text>
      </View>
      <View style={{ height: 8, borderRadius: 999, backgroundColor: '#E5E7EB', overflow: 'hidden' }}>
        <View style={{ width: `${pct}%`, height: 8, backgroundColor: '#10B981' }} />
      </View>
    </View>
  );
}

export default function PropertyDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  const prop = route.params?.property || {};

  const [commentModal, setCommentModal] = useState({ visible: false, property: prop });
  const [commentsTick, setCommentsTick] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  const img = ensureAbsolute(prop?.images?.[0]?.url || prop?.images?.[0]);
  const badge = prop?.ecoBadge || 'Unverified';
  const pal = BADGE_STYLES[badge] || BADGE_STYLES.Unverified;

  // Eco score: prefer backend value; else compute locally from features
  const ecoScore = useMemo(() => {
    if (typeof prop?.ecoScore === 'number') return Math.round(prop.ecoScore);
    return computeEcoScoreLocal(prop?.ecoFeatures);
  }, [prop?.ecoScore, prop?.ecoFeatures]);

  const lat = prop?.location?.coordinates?.[1];
  const lng = prop?.location?.coordinates?.[0];
  const locLabel = getLocationLabel(prop);

  /** ── Subtle hero parallax/stretch (UI only) ───────────────── */
  const scrollY = useRef(new Animated.Value(0)).current;
  const heroHeight = scrollY.interpolate({
    inputRange: [-120, 0, 200],
    outputRange: [320, 260, 220],
    extrapolateRight: 'clamp',
  });
  const heroTranslateY = scrollY.interpolate({
    inputRange: [-120, 0, 200],
    outputRange: [-10, 0, 0],
  });

  return (
    <View className="flex-1" style={{ backgroundColor: SURFACE }}>
      {/* Header (same logic, refined size & tap target) */}
      <View
        className={`${Platform.OS === 'android' ? 'pt-10' : 'pt-14'} pb-3 px-4 border-b`}
        style={{ borderColor: CARD_BORDER, backgroundColor: SURFACE }}
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="rounded-2xl"
            style={{ backgroundColor: '#F3F4F6', padding: 8 }}
            activeOpacity={0.85}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={20} color={INK} />
          </TouchableOpacity>
          <Text className="text-lg font-extrabold" style={{ color: INK }} numberOfLines={1}>Property</Text>
          <View style={{ width: 36 }} />
        </View>
      </View>

      {/* CONTENT */}
      <Animated.ScrollView
        contentContainerStyle={{ paddingBottom: 28 }}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
      >
        {/* 1) Hero image (Animated) */}
        <TouchableOpacity activeOpacity={0.95} onPress={() => setZoom(true)}>
          {img ? (
            <Animated.Image
              source={{ uri: img }}
              style={{ width: '100%', height: heroHeight, transform: [{ translateY: heroTranslateY }], backgroundColor: '#F3F4F6' }}
              resizeMode="cover"
            />
          ) : (
            <View style={{ width: '100%', height: 260 }} className="bg-gray-100 items-center justify-center">
              <Ionicons name="image-outline" size={24} color="#9ca3af" />
            </View>
          )}
        </TouchableOpacity>

        {/* 2) Badge + quick stats + maps button */}
        <View className="px-4 mt-4">
          <View className="flex-row items-center">
            <View
              className="mr-3 items-center justify-center rounded-2xl"
              style={{ backgroundColor: pal.bg, padding: 12, borderWidth: 1, borderColor: pal.border }}
            >
              <Ionicons name={pal.big} size={28} color={pal.text} />
            </View>

            <View className="flex-1">
              <View
                style={{ alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: pal.border, backgroundColor: pal.bg }}
              >
                <Text style={{ color: pal.text, fontWeight: '700', fontSize: 12 }}>{badge}</Text>
              </View>

              <View className="flex-row items-center mt-2">
                {prop?.avgRating !== undefined ? (
                  <Text className="text-[12px]" style={{ color: MUTED }} numberOfLines={1}>
                    ⭐ {prop.avgRating || 0} · {prop.reviewCount || 0} reviews
                  </Text>
                ) : null}
              </View>
            </View>

            {!!lat && !!lng && (
              <TouchableOpacity
                onPress={() => {
                  const url = Platform.select({
                    ios: `maps://?q=${encodeURIComponent(prop.title)}&ll=${lat},${lng}`,
                    android: `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(prop.title)})`,
                  });
                  Linking.openURL(url);
                }}
                className="px-3 py-2 rounded-xl ml-2"
                style={{ backgroundColor: '#ECFEFF', borderWidth: 1, borderColor: '#A5F3FC' }}
                activeOpacity={0.9}
                accessibilityRole="button"
                accessibilityLabel="Open location in maps"
              >
                <Text className="text-[12px] font-semibold" style={{ color: '#0E7490' }}>View in Maps</Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="mt-3">
            <EcoScoreBar score={ecoScore} />
          </View>
        </View>

        {/* 3) Property details (card look with better rhythm) */}
        <View className="px-4 mt-5">
          <View
            style={{
              backgroundColor: SURFACE,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: CARD_BORDER,
              padding: 14,
              shadowColor: '#000',
              shadowOpacity: 0.04,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 1,
            }}
          >
            <Text className="text-xl font-extrabold" style={{ color: INK }} numberOfLines={2}>
              {prop?.title || 'Property'}
            </Text>

            <View className="flex-row items-center mt-2">
              <Ionicons name="location-outline" size={14} color={MUTED} />
              <Text className="text-[12px] ml-1" style={{ color: MUTED }} numberOfLines={1}>
                {locLabel}
              </Text>
            </View>

            {prop?.address ? (
              <Text className="text-[12px] mt-1" style={{ color: '#4B5563' }}>
                {prop.address}
              </Text>
            ) : null}

            <View className="flex-row items-center mt-3">
              <View className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 mr-1.5">
                <Text className="text-[12px] font-semibold" style={{ color: '#4338CA' }}>
                  {currency(prop?.rentPrice)}/mo
                </Text>
              </View>
              <View className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                <Text className="text-[12px] font-semibold" style={{ color: '#047857' }}>
                  {prop?.propertyType}
                </Text>
              </View>
            </View>

            {prop?.description ? (
              <Text className="mt-3 text-[13px]" style={{ color: '#374151' }}>
                {prop.description}
              </Text>
            ) : null}
          </View>
        </View>

        {/* 4) CTAs */}
        <View className="px-4 mt-5">
          <TouchableOpacity
            onPress={() => setBookingOpen(true)}
            className="items-center py-3 rounded-xl"
            style={{ backgroundColor: INK }}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="Request to contact landlord"
          >
            <Text className="text-white font-semibold">Request to Contact</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCommentModal({ visible: true, property: prop })}
            className="items-center py-3 rounded-xl mt-2"
            style={{ backgroundColor: '#0B5CFF' }}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="Write a review"
          >
            <Text className="text-white font-semibold">Write a Review</Text>
          </TouchableOpacity>
        </View>

        {/* 5) Reviews */}
        <View className="px-4 mt-5">
          <Text className="font-semibold text-[14px] mb-2" style={{ color: INK }}>Reviews</Text>
          <CommentsBlock propertyId={prop?._id} title="Reviews" reloadKey={commentsTick} />
        </View>
      </Animated.ScrollView>

      {/* Overlays (logic untouched) */}
      <ZoomImage visible={zoom} onClose={() => setZoom(false)} src={img} />
      <CommentModal
        modal={{ ...commentModal, property: prop }}
        setModal={setCommentModal}
        onPosted={() => setCommentsTick((t) => t + 1)}
      />
      <BookingRequestModal
        visible={bookingOpen}
        onClose={() => setBookingOpen(false)}
        property={prop}
      />
    </View>
  );
}

/* ---------- Comments, Modals, Zoom (unchanged logic; visual tweaks only) ---------- */
function CommentsBlock({ propertyId, reloadKey, title = 'Reviews', compact = false }) {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!propertyId) return;
    setLoading(true);
    try {
      const res = await fetch(`${REVIEW_BASE}/${propertyId}/comments`);
      const data = await res.json();
      setItems(data?.data || []);
    } catch {}
    setLoading(false);
  }, [propertyId]);

  useEffect(() => { load(); }, [load, reloadKey]);

  if (loading && !items) return <View className="mt-2"><ActivityIndicator /></View>;
  if (!items || items.length === 0) return <Text className="text-[11px] mt-2" style={{ color: MUTED }}>No reviews yet.</Text>;

  const slice = compact ? items.slice(0, 2) : items;

  return (
    <View className="mt-1">
      <Text className="font-semibold mb-1 text-[12px]" style={{ color: INK }}>{title}</Text>
      {slice.map((c) => {
        const mood = c?.sentiment?.label;
        const conf = typeof c?.sentiment?.confidence === 'number' ? ` (${Math.round(c.sentiment.confidence * 100)}%)` : '';
        return (
          <View
            key={c._id}
            className="rounded-lg p-2 mb-1.5"
            style={{ backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: CARD_BORDER }}
          >
            <Text className="text-[10px]" style={{ color: MUTED }}>
              {c.userId?.uname || 'User'} • {new Date(c.createdAt).toLocaleDateString()}
            </Text>
            {c.rating ? <Text className="text-[11px] mt-0.5" style={{ color: '#B45309' }}>⭐ {c.rating}/5</Text> : null}
            {mood ? <Text className="text-[10px] mt-0.5" style={{ color: MUTED }}>Mood: {mood}{conf}</Text> : null}
            <Text className="text-[12px] mt-0.5" style={{ color: '#111827' }}>{c.text}</Text>
          </View>
        );
      })}
      {items.length > slice.length && (
        <Text className="text-[11px] mt-0.5" style={{ color: MUTED }}>
          + {items.length - slice.length} more…
        </Text>
      )}
    </View>
  );
}

function CommentModal({ modal, setModal, onPosted }) {
  const prop = modal.property;
  const [text, setText] = useState('');
  const [rating, setRating] = useState('5');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!modal.visible) { setText(''); setRating('5'); setBusy(false); }
  }, [modal.visible]);

  const submit = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) return Alert.alert('Sign in required');

      const t = text.trim();
      const num = Number(rating);
      if (!t) return Alert.alert('Required', 'Please enter your comment.');
      if (Number.isNaN(num) || num < 1 || num > 5) return Alert.alert('Invalid rating', 'Rating must be between 1 and 5.');

      setBusy(true);
      const res = await fetch(`${REVIEW_BASE}/${prop._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: t, rating: num }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Comment failed');

      Alert.alert('Posted', 'Your review has been added.');
      onPosted?.();
      setModal({ visible: false, property: prop });
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={modal.visible} transparent animationType="slide" onRequestClose={() => setModal({ visible: false, property: prop })}>
      <View className="flex-1" style={{ backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
        <View className="rounded-t-2xl p-4" style={{ backgroundColor: SURFACE }}>
          <Text className="text-lg font-bold mb-2" style={{ color: INK }} numberOfLines={1}>
            Review {prop?.title}
          </Text>
          <View className="rounded-xl px-3 py-2 mb-2" style={{ backgroundColor: '#F3F4F6' }}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Write your review…"
              multiline
              style={{ minHeight: 96 }}
            />
          </View>
          <View className="rounded-xl px-3 py-2 mb-3" style={{ backgroundColor: '#F3F4F6' }}>
            <TextInput
              value={rating}
              onChangeText={setRating}
              placeholder="Rating (1-5)"
              keyboardType="number-pad"
            />
          </View>

          <View className="flex-row">
            <Pressable onPress={() => setModal({ visible: false, property: prop })} className="flex-1 mr-2 rounded-xl py-3 items-center" style={{ backgroundColor: '#E5E7EB' }}>
              <Text className="font-semibold" style={{ color: INK }}>Cancel</Text>
            </Pressable>
            <Pressable disabled={busy} onPress={submit} className={`flex-1 rounded-xl py-3 items-center ${busy ? 'opacity-70' : ''}`} style={{ backgroundColor: INK }}>
              {busy ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold">Post</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function BookingRequestModal({ visible, onClose, property }) {
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [phone, setPhone]         = useState('');
  const [preferredDate, setPref]  = useState('');
  const [message, setMessage]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors]       = useState({});

  useEffect(() => {
    if (visible) {
      (async () => {
        try {
          const n = (await AsyncStorage.getItem('user_name')) || '';
          const e = (await AsyncStorage.getItem('user_email')) || '';
          setName(n);
          setEmail(e);
        } catch {}
      })();
    } else {
      setPref('');
      setMessage('');
      setSubmitting(false);
      setErrors({});
    }
  }, [visible]);

  const validate = useCallback(() => {
    const errs = {};
    if (!name.trim()) errs.name = 'Your name is required';
    if (email && !/^\S+@\S+\.\S+$/.test(email)) errs.email = 'Enter a valid email';
    if (phone && String(phone).replace(/\D/g, '').length < 7) errs.phone = 'Phone seems too short';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [name, email, phone]);

  const quickPick = (label) => setPref(label);

  // submit logic unchanged (correct endpoint preserved)
  const submit = async () => {
    if (!validate()) return;
    try {
      setSubmitting(true);

      try {
        await AsyncStorage.setItem('user_name', name.trim());
        if (email) await AsyncStorage.setItem('user_email', email.trim());
      } catch {}

      const payload = {
        type: 'contactRequest',
        propertyId: property?._id,
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        preferredDate: preferredDate.trim() || undefined,
        message: message.trim() || undefined,
      };

      const res = await fetch(`${API_BASE}/ReviewOperations/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await res.clone().json();
      } catch {
        const raw = await res.text().catch(() => '');
        console.log('Non-JSON response body:', raw?.slice(0, 400));
        throw new Error('Invalid response from server');
      }

      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || `Request failed with status ${res.status}`);
      }

      Alert.alert('Request sent', 'The landlord was notified. Please check your email for confirmation.');
      onClose?.();
    } catch (e) {
      console.error('Booking submission error:', e);
      Alert.alert('Could not send', e.message || 'Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1" style={{ backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
        <View className="rounded-t-3xl p-4" style={{ backgroundColor: SURFACE, maxHeight: '92%' }}>
          {/* handle */}
          <View className="items-center mb-2">
            <View style={{ width: 56, height: 5, borderRadius: 999, backgroundColor: '#E5E7EB' }} />
          </View>

          {/* header */}
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-lg font-extrabold" style={{ color: INK }} numberOfLines={1}>Contact Landlord</Text>
            <TouchableOpacity
              accessibilityLabel="Close"
              onPress={onClose}
              className="p-2 rounded-xl"
              style={{ backgroundColor: '#F3F4F6' }}>
              <Ionicons name="close" size={20} color={INK} />
            </TouchableOpacity>
          </View>

          <Text className="text-[12px] mb-3" style={{ color: MUTED }} numberOfLines={2}>
            {property?.title} · {property?.address}
          </Text>

          {/* name */}
          <View className="mb-2">
            <View className="rounded-xl px-3 py-2 border" style={{ backgroundColor: '#F3F4F6', borderColor: errors.name ? '#EF4444' : 'transparent' }}>
              <TextInput
                value={name}
                onChangeText={(t)=>{ setName(t); if (errors.name) setErrors(prev=>({ ...prev, name: undefined })); }}
                placeholder="Your name *"
                accessibilityLabel="Your name"
                returnKeyType="next"
              />
            </View>
            {errors.name ? <Text className="text-[11px] mt-1" style={{ color: '#EF4444' }}>{errors.name}</Text> : null}
          </View>

          {/* email */}
          <View className="mb-2">
            <View className="rounded-xl px-3 py-2 border" style={{ backgroundColor: '#F3F4F6', borderColor: errors.email ? '#EF4444' : 'transparent' }}>
              <TextInput
                value={email}
                onChangeText={(t)=>{ setEmail(t); if (errors.email) setErrors(prev=>({ ...prev, email: undefined })); }}
                placeholder="Your email (optional)"
                accessibilityLabel="Your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.email ? <Text className="text-[11px] mt-1" style={{ color: '#EF4444' }}>{errors.email}</Text> : null}
          </View>

          {/* phone */}
          <View className="mb-2">
            <View className="rounded-xl px-3 py-2 border" style={{ backgroundColor: '#F3F4F6', borderColor: errors.phone ? '#EF4444' : 'transparent' }}>
              <TextInput
                value={phone}
                onChangeText={(t)=>{ setPhone(t); if (errors.phone) setErrors(prev=>({ ...prev, phone: undefined })); }}
                placeholder="Your phone (optional)"
                accessibilityLabel="Your phone"
                keyboardType="phone-pad"
              />
            </View>
            {errors.phone ? <Text className="text-[11px] mt-1" style={{ color: '#EF4444' }}>{errors.phone}</Text> : null}
          </View>

          {/* preferred date + quick picks */}
          <View className="mb-2">
            <View className="rounded-xl px-3 py-2" style={{ backgroundColor: '#F3F4F6' }}>
              <TextInput
                value={preferredDate}
                onChangeText={setPref}
                placeholder="Preferred date/time (e.g., Sat 10:30 AM)"
                accessibilityLabel="Preferred date and time"
              />
            </View>
            <View className="flex-row mt-2" style={{ gap: 8 }}>
              {['Today evening', 'Tomorrow morning', 'This weekend'].map((lbl) => (
                <Pressable
                  key={lbl}
                  onPress={() => quickPick(lbl)}
                  className="px-3 py-1.5 rounded-full border"
                  style={{ borderColor: PRIMARY, backgroundColor: preferredDate === lbl ? `${PRIMARY}22` : 'white' }}
                  accessibilityLabel={`Quick pick ${lbl}`}>
                  <Text style={{ fontSize: 12, color: PRIMARY, fontWeight: preferredDate === lbl ? '700' : '600' }}>{lbl}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* message */}
          <View className="mb-3">
            <View className="rounded-xl px-3 py-2" style={{ backgroundColor: '#F3F4F6' }}>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Message (optional)"
                multiline
                style={{ minHeight: 80 }}
                accessibilityLabel="Message to landlord"
              />
            </View>
            <Text className="text-[11px] mt-1" style={{ color: MUTED }}>
              We’ll share your contact details with the landlord to arrange next steps.
            </Text>
          </View>

          {/* CTA */}
          <Pressable
            disabled={submitting}
            onPress={submit}
            className={`py-3 rounded-xl items-center ${submitting ? 'opacity-70' : ''}`}
            style={{ backgroundColor: PRIMARY }}
            accessibilityRole="button"
            accessibilityLabel="Send contact request">
            {submitting ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold">Send request</Text>}
          </Pressable>

          {/* secondary: cancel */}
          <Pressable
            disabled={submitting}
            onPress={onClose}
            className="py-3 rounded-xl items-center mt-2"
            style={{ backgroundColor: '#F3F4F6' }}
            accessibilityRole="button"
            accessibilityLabel="Cancel">
            <Text className="font-semibold" style={{ color: INK }}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/* ---------- Zoom image (unchanged logic, smoother open) ---------- */
function ZoomImage({ visible, onClose, src }) {
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
  }, [visible, opacity, scale]);

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', opacity }}>
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 16 }}>
          <Animated.View style={{ transform: [{ scale }], borderRadius: 16, overflow: 'hidden', backgroundColor: SURFACE }}>
            {src ? (
              <Image source={{ uri: src }} style={{ width: '100%', height: 320 }} resizeMode="cover" />
            ) : (
              <View style={{ width: '100%', height: 320 }} className="bg-gray-100 items-center justify-center">
                <Ionicons name="image-outline" size={24} color="#9ca3af" />
              </View>
            )}
            <TouchableOpacity
              onPress={onClose}
              className="m-3 py-3 rounded-xl items-center"
              style={{ backgroundColor: INK }}
              activeOpacity={0.9}
              accessibilityRole="button"
              accessibilityLabel="Close image"
            >
              <Text className="text-white font-semibold">Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>
    </Modal>
  );
}