// import React, { useEffect, useState, useCallback, useMemo } from 'react';
// import {
//   View, Text, FlatList, Image, TouchableOpacity,
//   ActivityIndicator, RefreshControl, Alert, Platform, TextInput
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useNavigation } from '@react-navigation/native';
// import { Ionicons } from '@expo/vector-icons';

// const API_BASE = Platform.OS === 'ios' ? 'http://localhost:4000' : 'http://10.0.2.2:4000';
// const OWNER_URL = (ownerId, page, limit) =>
//   `${API_BASE}/PropertyOperations/owner/${ownerId}?page=${page}&limit=${limit}`;
// const GREEN = '#3cc172';

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

// export default function Myproperties() {
//   const navigation = useNavigation();

//   const [ownerId, setOwnerId] = useState('');
//   const [token, setToken] = useState('');
//   const [items, setItems] = useState([]);
//   const [page, setPage] = useState(1);
//   const [pages, setPages] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [search, setSearch] = useState('');
//   const LIMIT = 12;

//   // --- helpers ---
//   const clearSessionAndRedirect = useCallback(async (message = 'Session expired. Please sign in again.') => {
//     try {
//       await AsyncStorage.multiRemove(['auth_user', 'auth_token', 'token', 'user']);
//     } catch {}
//     Alert.alert('Authentication', message, [
//       { text: 'OK', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }) },
//     ]);
//   }, [navigation]);

//   const loadSession = useCallback(async () => {
//     // Robustly read saved session (supports different key names)
//     const [[, userStr], [, tokenStr], [, tokenAlt], [, userAlt]] = await AsyncStorage.multiGet(
//       ['auth_user', 'auth_token', 'token', 'user']
//     );
//     const rawUser = userStr || userAlt || '';
//     const rawToken = tokenStr || tokenAlt || '';

//     let parsedUser = null;
//     try { parsedUser = rawUser ? JSON.parse(rawUser) : null; } catch {}

//     const id = parsedUser?._id || parsedUser?.id || parsedUser?.userId;
//     if (!rawToken || !id) {
//       await clearSessionAndRedirect('Please sign in to view your properties.');
//       return { id: '', token: '' };
//     }
//     return { id: String(id), token: rawToken };
//   }, [clearSessionAndRedirect]);

//   // load auth info once
//   useEffect(() => {
//     (async () => {
//       const { id, token } = await loadSession();
//       if (id && token) {
//         setOwnerId(id);
//         setToken(token);
//       }
//     })();
//   }, [loadSession]);

//   const fetchPage = useCallback(async (pageNum, replace = false) => {
//     if (!ownerId || !token) return;
//     const res = await fetch(OWNER_URL(ownerId, pageNum, LIMIT), {
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     if (res.status === 401 || res.status === 403) {
//       // Token invalid/expired OR ownerId mismatch w/ token userId
//       await clearSessionAndRedirect('Your session is not valid for this account. Please sign in again.');
//       return;
//     }

//     if (!res.ok) {
//       throw new Error(`HTTP ${res.status}`);
//     }

//     const data = await res.json();
//     const list = Array.isArray(data?.data) ? data.data : [];
//     setPages(data?.pages || 1);
//     setItems((prev) => (replace ? list : [...prev, ...list]));
//   }, [ownerId, token, clearSessionAndRedirect]);

//   // initial load
//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       if (!ownerId || !token) return;
//       try {
//         setLoading(true);
//         await fetchPage(1, true);
//         if (mounted) setPage(1);
//       } catch (e) {
//         Alert.alert('Error', e?.message || 'Could not load properties');
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     })();
//     return () => { mounted = false; };
//   }, [fetchPage, ownerId, token]);

//   const onRefresh = useCallback(async () => {
//     try {
//       setRefreshing(true);
//       await fetchPage(1, true);
//       setPage(1);
//     } catch (e) {
//       Alert.alert('Error', e?.message || 'Refresh failed');
//     } finally {
//       setRefreshing(false);
//     }
//   }, [fetchPage]);

//   const loadMore = useCallback(async () => {
//     if (loadingMore || loading || page >= pages) return;
//     try {
//       setLoadingMore(true);
//       const next = page + 1;
//       await fetchPage(next, false);
//       setPage(next);
//     } catch (e) {
//       Alert.alert('Error', e?.message || 'Could not load more');
//     } finally {
//       setLoadingMore(false);
//     }
//   }, [loadingMore, loading, page, pages, fetchPage]);

//   // client-side filter
//   const filtered = useMemo(() => {
//     if (!search.trim()) return items;
//     const q = search.trim().toLowerCase();
//     return items.filter(
//       (it) =>
//         (it.title || '').toLowerCase().includes(q) ||
//         (it.address || '').toLowerCase().includes(q) ||
//         (it.description || '').toLowerCase().includes(q)
//     );
//   }, [items, search]);

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

//           {/* Add Certificate button */}
//           <TouchableOpacity
//             onPress={() => navigation.navigate('AddCertificate', { propertyId: item._id })}
//             activeOpacity={0.9}
//             className="mt-3 px-3 py-2 rounded-xl bg-[#3cc172]"
//           >
//             <View className="flex-row items-center justify-center">
//               <Ionicons name="document-text-outline" size={16} color="#fff" />
//               <Text className="text-white font-semibold text-xs ml-2">Add Certificate</Text>
//             </View>
//           </TouchableOpacity>
//         </View>
//       </TouchableOpacity>
//     );
//   }, [navigation]);

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
//         <Text className="text-xl font-bold text-gray-900">My Properties</Text>
//         <View style={{ width: 40 }} />
//       </View>

//       {/* Search Bar */}
//       <View className="flex-row items-center mx-4 mb-3 px-3 py-2 rounded-xl bg-gray-100">
//         <Ionicons name="search" size={18} color="#6b7280" />
//         <TextInput
//           placeholder="Search my properties..."
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

//   if (!ownerId || !token) {
//     return (
//       <View className="flex-1 items-center justify-center bg-gray-50 p-6">
//         <Text className="text-lg font-semibold text-gray-800 mb-2">Sign in required</Text>
//         <Text className="text-gray-600 text-center">We couldn't find your session. Please log in again.</Text>
//       </View>
//     );
//   }

//   if (loading) {
//     return (
//       <View className="flex-1 items-center justify-center bg-gray-50">
//         <ActivityIndicator />
//         <Text className="mt-2 text-gray-600">Loading properties…</Text>
//       </View>
//     );
//   }

//   if (!filtered.length) {
//     return (
//       <View className="flex-1 bg-white">
//         <Header />
//         <View className="flex-1 items-center justify-center bg-gray-50 p-6">
//           <Text className="text-lg font-semibold text-gray-800 mb-2">No properties found</Text>
//           <Text className="text-gray-600 text-center mb-4">Try adjusting your search or add a property.</Text>
//         </View>
//       </View>
//     );
//   }

//   return (
//     <View className="flex-1 bg-white">
//       <Header />
//       <FlatList
//         data={filtered}
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


import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert, Platform, TextInput
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE }from '../config/api.js';

// const API_BASE = Platform.OS === 'ios' ? 'http://localhost:4000' : 'http://10.0.2.2:4000';
const OWNER_URL = (ownerId, page, limit) =>
  `${API_BASE}/PropertyOperations/owner/${ownerId}?page=${page}&limit=${limit}`;

const ensureAbsolute = (uri) => {
  if (!uri) return uri;
  uri = String(uri).replace(/\\/g, '/');
  if (/^https?:\/\//.test(uri)) return uri;
  return `${API_BASE}/${uri.replace(/^\/?/, '')}`;
};
const currency = (n) => {
  if (n === null || n === undefined || isNaN(Number(n))) return '-';
  return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 })
    .format(Number(n));
};

const BADGE_COLORS = {
  Platinum:  { bg: '#ecfeff', text: '#0e7490', border: '#a5f3fc' },
  Gold:      { bg: '#fef9c3', text: '#a16207', border: '#fde68a' },
  Silver:    { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' },
  Bronze:    { bg: '#fff7ed', text: '#9a3412', border: '#fed7aa' },
  Unverified:{ bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' },
};

export default function Myproperties() {
  const navigation = useNavigation();

  const [ownerId, setOwnerId] = useState('');
  const [token, setToken] = useState('');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const LIMIT = 12;


  useEffect(() => {
    console.log("[API_BASE]", API_BASE);
  }, []);


  const clearSessionAndRedirect = useCallback(async (message = 'Session expired. Please sign in again.') => {
    try {
      await AsyncStorage.multiRemove(['auth_user', 'auth_token', 'token', 'user']);
    } catch {}
    Alert.alert('Authentication', message, [
      { text: 'OK', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }) },
    ]);
  }, [navigation]);

  const loadSession = useCallback(async () => {
    const [[, userStr], [, tokenStr], [, tokenAlt], [, userAlt]] = await AsyncStorage.multiGet(
      ['auth_user', 'auth_token', 'token', 'user']
    );
    const rawUser = userStr || userAlt || '';
    const rawToken = tokenStr || tokenAlt || '';

    let parsedUser = null;
    try { parsedUser = rawUser ? JSON.parse(rawUser) : null; } catch {}

    const id = parsedUser?._id || parsedUser?.id || parsedUser?.userId;
    if (!rawToken || !id) {
      await clearSessionAndRedirect('Please sign in to view your properties.');
      return { id: '', token: '' };
    }
    return { id: String(id), token: rawToken };
  }, [clearSessionAndRedirect]);

  // load auth once
  useEffect(() => {
    (async () => {
      const { id, token } = await loadSession();
      if (id && token) {
        setOwnerId(id);
        setToken(token);
      }
    })();
  }, [loadSession]);

  const fetchPage = useCallback(async (pageNum, replace = false) => {
    if (!ownerId || !token) return;
    const res = await fetch(OWNER_URL(ownerId, pageNum, LIMIT), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401 || res.status === 403) {
      await clearSessionAndRedirect('Your session is not valid for this account. Please sign in again.');
      return;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const list = Array.isArray(data?.data) ? data.data : [];
    setPages(data?.pages || 1);
    setItems((prev) => (replace ? list : [...prev, ...list]));
  }, [ownerId, token, clearSessionAndRedirect]);

  // initial load when ownerId/token available
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!ownerId || !token) return;
      try {
        setLoading(true);
        await fetchPage(1, true);
        if (mounted) setPage(1);
      } catch (e) {
        Alert.alert('Error', e?.message || 'Could not load properties');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [fetchPage, ownerId, token]);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchPage(1, true);
      setPage(1);
    } catch (e) {
      Alert.alert('Error', e?.message || 'Refresh failed');
    } finally {
      setRefreshing(false);
    }
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (loadingMore || loading || page >= pages) return;
    try {
      setLoadingMore(true);
      const next = page + 1;
      await fetchPage(next, false);
      setPage(next);
    } catch (e) {
      Alert.alert('Error', e?.message || 'Could not load more');
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, loading, page, pages, fetchPage]);

  // refresh when screen gains focus (e.g., after AddCertificate -> back)
  useFocusEffect(
    useCallback(() => {
      if (ownerId && token) onRefresh();
    }, [ownerId, token, onRefresh])
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter(
      (it) =>
        (it.title || '').toLowerCase().includes(q) ||
        (it.address || '').toLowerCase().includes(q) ||
        (it.description || '').toLowerCase().includes(q)
    );
  }, [items, search]);

  const renderItem = useCallback(({ item }) => {
    const firstImg = item?.images?.[0];
    const imgUri = ensureAbsolute(firstImg?.url || firstImg?.uri || firstImg);
    const badge = item?.ecoBadge || 'Unverified';
    const palette = BADGE_COLORS[badge] || BADGE_COLORS.Unverified;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        className="bg-white rounded-2xl overflow-hidden border border-gray-100"
        style={{ width: '48%', marginBottom: 14 }}
        onPress={() =>
          navigation.navigate('PropertyDetailsScreen', {
            propertyId: item._id,
            property: {
              ...item,
              owner: item.ownerId
                ? {
                    name: item.ownerId.uname,
                    email: item.ownerId.email,
                    phone: item.ownerId.number,
                  }
                : undefined,
            },
          })
        }
      >
        <View>
          {imgUri ? (
            <Image source={{ uri: imgUri }} className="w-full" style={{ height: 120 }} resizeMode="cover" />
          ) : (
            <View className="w-full items-center justify-center bg-gray-100" style={{ height: 120 }}>
              <Ionicons name="image-outline" size={24} color="#9ca3af" />
              <Text className="text-gray-500 mt-1 text-xs">No image</Text>
            </View>
          )}

          {/* ECO BADGE chip */}
          <View
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: palette.bg,
              borderColor: palette.border,
              borderWidth: 1,
              borderRadius: 999,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: '700', color: palette.text }}>
              {badge}
            </Text>
          </View>
        </View>

        <View className="p-3">
          <Text className="text-[15px] font-semibold text-gray-900" numberOfLines={1}>
            {item.title || 'Property'}
          </Text>
          <Text className="text-gray-500 text-[12px] mt-0.5" numberOfLines={1}>
            {item.address || '—'}
          </Text>

          <View className="flex-row items-center mt-2">
            <View className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 mr-2">
              <Text className="text-emerald-700 text-[10px] font-semibold">
                {item.propertyType || '—'}
              </Text>
            </View>
            <View className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200">
              <Text className="text-indigo-700 text-[10px] font-semibold">
                {currency(item.rentPrice)}/mo
              </Text>
            </View>
          </View>

          {/* Add/Update Certificate */}
          <TouchableOpacity
            onPress={() => navigation.navigate('AddCertificate', {
              propertyId: item._id,
              // optional optimistic update:
              onUpdated: (newBadge) => {
                setItems((prev) => prev.map(p => p._id === item._id ? { ...p, ecoBadge: newBadge } : p));
              }
            })}
            activeOpacity={0.9}
            className="mt-3 px-3 py-2 rounded-xl bg-[#3cc172]"
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="document-text-outline" size={16} color="#fff" />
              <Text className="text-white font-semibold text-xs ml-2">
                {badge === 'Unverified' ? 'Add Certificate' : 'Update Certificate'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }, [navigation, setItems]);

  const Header = () => (
    <View className={`${Platform.OS === 'android' ? 'pt-8' : 'pt-3'} bg-white`}>
      <View className="flex-row mt-10 items-center justify-between px-4 py-3">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 rounded-xl bg-gray-50 border border-gray-200"
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">My Properties</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center mx-4 mb-3 px-3 py-2 rounded-xl bg-gray-100">
        <Ionicons name="search" size={18} color="#6b7280" />
        <TextInput
          placeholder="Search my properties..."
          value={search}
          onChangeText={setSearch}
          className="flex-1 ml-2 text-gray-800"
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      <View className="h-[1px] bg-gray-100" />
    </View>
  );

  if (!ownerId || !token) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-6">
        <Text className="text-lg font-semibold text-gray-800 mb-2">Sign in required</Text>
        <Text className="text-gray-600 text-center">We couldn't find your session. Please log in again.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator />
        <Text className="mt-2 text-gray-600">Loading properties…</Text>
      </View>
    );
  }

  if (!filtered.length) {
    return (
      <View className="flex-1 bg-white">
        <Header />
        <View className="flex-1 items-center justify-center bg-gray-50 p-6">
          <Text className="text-lg font-semibold text-gray-800 mb-2">No properties found</Text>
          <Text className="text-gray-600 text-center mb-4">Try adjusting your search or add a property.</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Header />
      <FlatList
        data={filtered}
        keyExtractor={(it) => it._id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
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