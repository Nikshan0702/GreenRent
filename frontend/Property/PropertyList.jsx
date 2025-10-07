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

          {/* Eco badge chip */}
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

        {/* Card body */}
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
    <View className="flex-1 mt-0 bg-[#f7f9fc]">
      {/* ===================== Header (with Back) ===================== */}
      <View
        className={`${Platform.OS === 'android' ? 'pt-8' : 'pt-12'} pb-3 px-4 bg-white border-b border-gray-100`}
      >
        {/* Row: Back button · Title centered · Spacer right (keeps title centered) */}
        <View className="flex-row items-center justify-between mt-10">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="rounded-2xl"
            style={{ width: 40, height: 40, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            activeOpacity={0.85}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="arrow-back" size={18} color="#111827" />
          </TouchableOpacity>

          <Text className="text-lg font-extrabold text-gray-900">Discover</Text>

          {/* Spacer keeps the title perfectly centered */}
          <View style={{ width: 40, height: 40 }} />
        </View>

        {/* Search input — compact, clean */}
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

        {/* Filters row (logic unchanged) */}
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