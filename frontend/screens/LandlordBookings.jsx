// import React, { useEffect, useState, useCallback } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   RefreshControl,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useRoute } from '@react-navigation/native';
// import { Ionicons } from '@expo/vector-icons'; // UI-only: icons
// import { fetchBookings, patchBookingStatus, postBookingReply } from '../lib/api';
// import ReplyModal from './ReplyModal';

// const GREEN = '#3cc172';

// export default function LandlordBookings({ landlordId: landlordIdProp }) {
//   const route = useRoute();
//   const [landlordId, setLandlordId] = useState(
//     landlordIdProp || route?.params?.landlordId || ''
//   );

//   const [items, setItems] = useState([]);
//   const [status, setStatus] = useState('');
//   const [page, setPage] = useState(1);
//   const [pages, setPages] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   const [replyOpen, setReplyOpen] = useState(false);
//   const [replyBooking, setReplyBooking] = useState(null);

//   useEffect(() => {
//     // last-resort fallback: read landlordId from auth_user in storage (logic unchanged)
//     (async () => {
//       if (landlordId) return;
//       try {
//         const raw = await AsyncStorage.getItem('auth_user');
//         const user = raw ? JSON.parse(raw) : null;
//         if (user?._id) setLandlordId(user._id);
//       } catch {}
//     })();
//   }, [landlordId]);

//   const load = useCallback(async (p = 1, append = false) => {
//     if (!landlordId) return;
//     try {
//       if (!append) setLoading(true);
//       const { data, page: cur, pages: totalPages } = await fetchBookings({
//         role: 'landlord',
//         landlordId,
//         status: status || undefined,
//         page: p,
//         limit: 20,
//       });
//       setPage(cur || 1);
//       setPages(totalPages || 1);
//       setItems(prev => (append ? [...prev, ...data] : data));
//     } catch (e) {
//       console.log('load landlord bookings error:', e);
//       Alert.alert('Could not load', e.message || 'Please try again.');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, [landlordId, status]);

//   useEffect(() => { load(1, false); }, [load, landlordId, status]);

//   const onRefresh = () => { setRefreshing(true); load(1, false); };
//   const onEndReached = () => { if (page < pages && !loading) load(page + 1, true); };

//   const updateStatus = async (id, next) => {
//     try {
//       await patchBookingStatus(id, next);
//       setItems(prev => prev.map(x => (x._id === id ? { ...x, status: next } : x)));
//     } catch (e) {
//       Alert.alert('Update failed', e.message || 'Please try again.');
//     }
//   };

//   const openReply = (booking) => { setReplyBooking(booking); setReplyOpen(true); };
//   const sendReply = async (body) => {
//     await postBookingReply(replyBooking._id, body);
//     setItems(prev => prev.map(x => (x._id === replyBooking._id ? { ...x, status: 'contacted' } : x)));
//   };

//   // ---------- UI helpers (no logic change) ----------
//   const statusChipBg = (s) => {
//     if (s === 'contacted') return '#e5f0ff';
//     if (s === 'closed') return '#ffe9e9';
//     if (s === 'new') return '#f3f4f6';
//     return '#f3f4f6';
//   };
//   const statusChipText = (s) => {
//     if (!s) return 'New';
//     return s[0].toUpperCase() + s.slice(1);
//   };

//   // ---------- Header + Filters (visual only) ----------
//   const Header = (
//     <View className="px-4 pt-5 pb-2 bg-white border-b border-gray-100">
//       <Text className="text-2xl font-extrabold text-gray-900">Bookings</Text>
//       <Text className="text-gray-500 mt-1">Manage inquiries for your properties</Text>

//       <View className="flex-row mt-4" style={{ gap: 8 }}>
//         {[
//           { key: '', label: 'All', icon: 'apps' },
//           { key: 'new', label: 'New', icon: 'mail-unread' },
//           { key: 'contacted', label: 'Contacted', icon: 'chatbubble-ellipses' },
//           { key: 'closed', label: 'Closed', icon: 'checkmark-done' },
//         ].map((opt) => {
//           const active = status === opt.key;
//           return (
//             <TouchableOpacity
//               key={opt.key || 'all'}
//               onPress={() => setStatus(opt.key)}
//               className="flex-row items-center px-3 py-2 rounded-full border"
//               style={{
//                 backgroundColor: active ? `${GREEN}22` : '#fff',
//                 borderColor: active ? GREEN : '#e5e7eb',
//               }}
//               accessibilityRole="button"
//               accessibilityLabel={`Filter ${opt.label}`}
//             >
//               <Ionicons name={opt.icon} size={14} color={active ? GREEN : '#6b7280'} />
//               <Text
//                 className="ml-1.5 text-[12px] font-semibold"
//                 style={{ color: active ? GREEN : '#374151' }}
//               >
//                 {opt.label}
//               </Text>
//             </TouchableOpacity>
//           );
//         })}
//       </View>
//     </View>
//   );

//   const renderItem = ({ item }) => {
//     const p = item.property || {};
//     return (
//       <View
//         className="mx-4 mt-3 rounded-2xl bg-white p-4"
//         // Subtle card elevation (UI-only)
//         style={{
//           shadowColor: '#000',
//           shadowOpacity: 0.06,
//           shadowRadius: 10,
//           shadowOffset: { width: 0, height: 4 },
//           elevation: 2,
//         }}
//       >
//         {/* Title + status */}
//         <View className="flex-row items-start justify-between">
//           <View className="flex-1 pr-3">
//             <Text className="text-gray-900 font-extrabold" numberOfLines={1}>
//               {p.title || 'Property'}
//             </Text>
//             <Text className="text-gray-500 text-[12px]" numberOfLines={1}>
//               {p.address || '—'}
//             </Text>
//           </View>

//           <View
//             className="px-2 py-1 rounded-full border"
//             style={{ backgroundColor: statusChipBg(item.status), borderColor: '#e5e7eb' }}
//           >
//             <Text className="text-[11px] text-gray-700">
//               {statusChipText(item.status)}
//             </Text>
//           </View>
//         </View>

//         {/* Meta */}
//         <View className="mt-3">
//           <View className="flex-row items-center">
//             <Ionicons name="person-circle" size={16} color="#6b7280" />
//             <Text className="ml-1.5 text-[12px] text-gray-700" numberOfLines={1}>
//               {item.name}
//               {item.email ? ` · ${item.email}` : ''}
//               {item.phone ? ` · ${item.phone}` : ''}
//             </Text>
//           </View>

//           {item.preferredDate ? (
//             <View className="flex-row items-center mt-1.5">
//               <Ionicons name="calendar-outline" size={16} color="#6b7280" />
//               <Text className="ml-1.5 text-[12px] text-gray-700">
//                 Preferred: {new Date(item.preferredDate).toLocaleString()}
//               </Text>
//             </View>
//           ) : null}

//           {item.message ? (
//             <View className="flex-row items-start mt-1.5">
//               <Ionicons
//                 name="chatbubble-ellipses-outline"
//                 size={16}
//                 color="#6b7280"
//                 style={{ marginTop: 1 }}
//               />
//               <Text className="ml-1.5 text-[12px] text-gray-700">{item.message}</Text>
//             </View>
//           ) : null}
//         </View>

//         {/* Actions */}
//         <View className="flex-row items-center justify-between mt-3">
//           <Text className="text-[11px] text-gray-500">
//             Received: {new Date(item.createdAt).toLocaleString()}
//           </Text>

//           <View className="flex-row" style={{ gap: 8 }}>
//             <TouchableOpacity
//               onPress={() => openReply(item)}
//               className="flex-row items-center px-3 py-2 rounded-full"
//               style={{ backgroundColor: '#e8fff2' }}
//               accessibilityRole="button"
//               accessibilityLabel="Reply to requester"
//             >
//               <Ionicons name="send" size={14} color="#0f766e" />
//               <Text className="ml-1 text-[12px] font-semibold" style={{ color: '#0f766e' }}>
//                 Reply
//               </Text>
//             </TouchableOpacity>

//             {item.status !== 'contacted' && (
//               <TouchableOpacity
//                 onPress={() => updateStatus(item._id, 'contacted')}
//                 className="flex-row items-center px-3 py-2 rounded-full"
//                 style={{ backgroundColor: '#e5f0ff' }}
//                 accessibilityRole="button"
//                 accessibilityLabel="Mark as contacted"
//               >
//                 <Ionicons name="checkmark-circle-outline" size={14} color="#1d4ed8" />
//                 <Text className="ml-1 text-[12px] font-semibold" style={{ color: '#1d4ed8' }}>
//                   Mark contacted
//                 </Text>
//               </TouchableOpacity>
//             )}

//             {item.status !== 'closed' && (
//               <TouchableOpacity
//                 onPress={() => updateStatus(item._id, 'closed')}
//                 className="flex-row items-center px-3 py-2 rounded-full"
//                 style={{ backgroundColor: '#ffe9e9' }}
//                 accessibilityRole="button"
//                 accessibilityLabel="Close request"
//               >
//                 <Ionicons name="close-circle-outline" size={14} color="#b91c1c" />
//                 <Text className="ml-1 text-[12px] font-semibold" style={{ color: '#b91c1c' }}>
//                   Close
//                 </Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <View className="flex-1 bg-gray-50">
//       {Header}

//       {!landlordId ? (
//         <View className="flex-1 items-center justify-center px-6">
//           <Ionicons name="alert-circle-outline" size={28} color="#9ca3af" />
//           <Text className="mt-2 text-gray-500 text-center">No landlord ID found.</Text>
//         </View>
//       ) : loading && items.length === 0 ? (
//         <View className="flex-1 items-center justify-center">
//           <ActivityIndicator />
//           <Text className="mt-2 text-gray-500">Loading bookings…</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={items}
//           keyExtractor={(it) => String(it._id)}
//           renderItem={renderItem}
//           onEndReached={onEndReached}
//           onEndReachedThreshold={0.4}
//           refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//           ListEmptyComponent={
//             <View className="items-center mt-16">
//               <Ionicons name="file-tray-outline" size={32} color="#9ca3af" />
//               <Text className="mt-2 text-gray-500">No requests.</Text>
//             </View>
//           }
//           contentContainerStyle={{ paddingBottom: 24 }}
//         />
//       )}

//       <ReplyModal
//         visible={replyOpen}
//         booking={replyBooking}
//         onClose={() => setReplyOpen(false)}
//         onSend={sendReply}
//       />
//     </View>
//   );
// }
// screens/LandlordBookings.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { fetchBookings, patchBookingStatus, postBookingReply } from '../lib/api';
import ReplyModal from './ReplyModal';

const GREEN = '#3cc172';

export default function LandlordBookings({ landlordId: landlordIdProp }) {
  const navigation = useNavigation();
  const route = useRoute();
  const [landlordId, setLandlordId] = useState(
    landlordIdProp || route?.params?.landlordId || ''
  );

  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [replyOpen, setReplyOpen] = useState(false);
  const [replyBooking, setReplyBooking] = useState(null);

  useEffect(() => {
    // last-resort fallback: read landlordId from auth_user in storage
    (async () => {
      if (landlordId) return;
      try {
        const raw = await AsyncStorage.getItem('auth_user');
        const user = raw ? JSON.parse(raw) : null;
        if (user?._id) setLandlordId(user._id);
      } catch {}
    })();
  }, [landlordId]);

  const load = useCallback(async (p = 1, append = false) => {
    if (!landlordId) return;
    try {
      if (!append) setLoading(true);
      const { data, page: cur, pages: totalPages } = await fetchBookings({
        role: 'landlord',
        landlordId,
        status: status || undefined,
        page: p,
        limit: 20,
      });
      setPage(cur || 1);
      setPages(totalPages || 1);
      setItems(prev => (append ? [...prev, ...data] : data));
    } catch (e) {
      console.log('load landlord bookings error:', e);
      Alert.alert('Could not load', e.message || 'Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [landlordId, status]);

  useEffect(() => { load(1, false); }, [load, landlordId, status]);

  const onRefresh = () => { setRefreshing(true); load(1, false); };
  const onEndReached = () => { if (page < pages && !loading) load(page + 1, true); };

  const updateStatus = async (id, next) => {
    try {
      await patchBookingStatus(id, next);
      setItems(prev => prev.map(x => (x._id === id ? { ...x, status: next } : x)));
    } catch (e) {
      Alert.alert('Update failed', e.message || 'Please try again.');
    }
  };

  const openReply = (booking) => { setReplyBooking(booking); setReplyOpen(true); };
  const sendReply = async (body) => {
    await postBookingReply(replyBooking._id, body);
    setItems(prev => prev.map(x => (x._id === replyBooking._id ? { ...x, status: 'contacted' } : x)));
  };

  // Header with back + pill filters (different style than MyBookings)
  const Header = (
    <View className="px-4 pt-5 pb-2 bg-white border-b border-gray-100">
      <View className="flex-row items-center mb-3">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-xl items-center justify-center bg-gray-50"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text className="ml-2 text-2xl font-extrabold text-gray-900">Bookings (Landlord)</Text>
      </View>
      <Text className="text-gray-500">Requests sent to your properties</Text>

      <View className="flex-row mt-4" style={{ gap: 8 }}>
        {[
          { key: '', label: 'All', icon: 'apps' },
          { key: 'new', label: 'New', icon: 'mail-unread' },
          { key: 'contacted', label: 'Contacted', icon: 'chatbubble-ellipses' },
          { key: 'closed', label: 'Closed', icon: 'checkmark-done' },
        ].map((opt) => {
          const active = status === opt.key;
          return (
            <TouchableOpacity
              key={opt.key || 'all'}
              onPress={() => setStatus(opt.key)}
              className="flex-row items-center px-3 py-2 rounded-full border"
              style={{
                backgroundColor: active ? `${GREEN}22` : '#fff',
                borderColor: active ? GREEN : '#e5e7eb',
              }}
              accessibilityRole="button"
              accessibilityLabel={`Filter ${opt.label}`}
            >
              <Ionicons name={opt.icon} size={14} color={active ? GREEN : '#6b7280'} />
              <Text
                className="ml-1.5 text-[12px] font-semibold"
                style={{ color: active ? GREEN : '#374151' }}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const statusChipBg = (s) => {
    if (s === 'contacted') return '#e5f0ff';
    if (s === 'closed') return '#ffe9e9';
    if (s === 'new') return '#f3f4f6';
    return '#f3f4f6';
  };

  const renderItem = ({ item }) => {
    const p = item.property || {};
    return (
      <View
        className="mx-4 mt-3 rounded-2xl bg-white p-4"
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 2,
        }}
      >
        {/* Title + status */}
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-gray-900 font-extrabold" numberOfLines={1}>
              {p.title || 'Property'}
            </Text>
            <Text className="text-gray-500 text-[12px]" numberOfLines={1}>
              {p.address || '—'}
            </Text>
          </View>

          <View
            className="px-2 py-1 rounded-full border"
            style={{ backgroundColor: statusChipBg(item.status), borderColor: '#e5e7eb' }}
          >
            <Text className="text-[11px] text-gray-700">
              {item.status ? item.status[0].toUpperCase() + item.status.slice(1) : 'New'}
            </Text>
          </View>
        </View>

        {/* Meta */}
        <View className="mt-3">
          <View className="flex-row items-center">
            <Ionicons name="person-circle" size={16} color="#6b7280" />
            <Text className="ml-1.5 text-[12px] text-gray-700" numberOfLines={1}>
              {item.name}
              {item.email ? ` · ${item.email}` : ''}
              {item.phone ? ` · ${item.phone}` : ''}
            </Text>
          </View>

          {item.preferredDate ? (
            <View className="flex-row items-center mt-1.5">
              <Ionicons name="calendar-outline" size={16} color="#6b7280" />
              <Text className="ml-1.5 text-[12px] text-gray-700">
                Preferred: {new Date(item.preferredDate).toLocaleString()}
              </Text>
            </View>
          ) : null}

          {item.message ? (
            <View className="flex-row items-start mt-1.5">
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={16}
                color="#6b7280"
                style={{ marginTop: 1 }}
              />
              <Text className="ml-1.5 text-[12px] text-gray-700">{item.message}</Text>
            </View>
          ) : null}
        </View>

        {/* Actions */}
        <View className="flex-row items-center justify-between mt-3">
          <Text className="text-[11px] text-gray-500">
            Received: {new Date(item.createdAt).toLocaleString()}
          </Text>

          <View className="flex-row" style={{ gap: 8 }}>
            <TouchableOpacity
              onPress={() => openReply(item)}
              className="flex-row items-center px-3 py-2 rounded-full"
              style={{ backgroundColor: '#e8fff2' }}
              accessibilityRole="button"
              accessibilityLabel="Reply to requester"
            >
              <Ionicons name="send" size={14} color="#0f766e" />
              <Text className="ml-1 text-[12px] font-semibold" style={{ color: '#0f766e' }}>
                Reply
              </Text>
            </TouchableOpacity>

            {item.status !== 'contacted' && (
              <TouchableOpacity
                onPress={() => updateStatus(item._id, 'contacted')}
                className="flex-row items-center px-3 py-2 rounded-full"
                style={{ backgroundColor: '#e5f0ff' }}
                accessibilityRole="button"
                accessibilityLabel="Mark as contacted"
              >
                <Ionicons name="checkmark-circle-outline" size={14} color="#1d4ed8" />
                <Text className="ml-1 text-[12px] font-semibold" style={{ color: '#1d4ed8' }}>
                  Mark contacted
                </Text>
              </TouchableOpacity>
            )}

            {item.status !== 'closed' && (
              <TouchableOpacity
                onPress={() => updateStatus(item._id, 'closed')}
                className="flex-row items-center px-3 py-2 rounded-full"
                style={{ backgroundColor: '#ffe9e9' }}
                accessibilityRole="button"
                accessibilityLabel="Close request"
              >
                <Ionicons name="close-circle-outline" size={14} color="#b91c1c" />
                <Text className="ml-1 text-[12px] font-semibold" style={{ color: '#b91c1c' }}>
                  Close
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {Header}

      {!landlordId ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={28} color="#9ca3af" />
          <Text className="mt-2 text-gray-500 text-center">No landlord ID found.</Text>
        </View>
      ) : loading && items.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className="mt-2 text-gray-500">Loading bookings…</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => String(it._id)}
          renderItem={renderItem}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View className="items-center mt-16">
              <Ionicons name="file-tray-outline" size={32} color="#9ca3af" />
              <Text className="mt-2 text-gray-500">No requests.</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}

      <ReplyModal
        visible={replyOpen}
        booking={replyBooking}
        onClose={() => setReplyOpen(false)}
        onSend={sendReply}
      />
    </View>
  );
}