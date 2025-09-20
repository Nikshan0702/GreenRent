// screens/PropertyList.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// ANDROID emulator: http://10.0.2.2:4000
// iOS simulator:    http://localhost:4000
// Physical device:  http://<your-computer-LAN-IP>:4000
const API_BASE = 'http://10.0.2.2:4000';
const LIST_URL = (page, limit, qParams = '') =>
  `${API_BASE}/PropertyOperations/list?page=${page}&limit=${limit}${qParams}`;

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

export default function PropertyList() {
  const navigation = useNavigation();

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const LIMIT = 12;

  const fetchPage = useCallback(async (pageNum, replace = false) => {
    const url = LIST_URL(pageNum, LIMIT); // add filters like &q= if needed
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const list = Array.isArray(data?.data) ? data.data : [];
    setPages(data?.pages || 1);
    setItems((prev) => (replace ? list : [...prev, ...list]));
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        await fetchPage(1, true);
        if (mounted) {
          setPage(1);
        }
      } catch (e) {
        Alert.alert('Error', 'Could not load properties list');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [fetchPage]);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchPage(1, true);
      setPage(1);
    } catch (e) {
      Alert.alert('Error', 'Refresh failed');
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
      Alert.alert('Error', 'Could not load more');
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, loading, page, pages, fetchPage]);

  const renderItem = useCallback(({ item }) => {
    const firstImg = item?.images?.[0];
    const imgUri = ensureAbsolute(firstImg?.url || firstImg?.uri || firstImg);
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        className="bg-white rounded-2xl mb-4 overflow-hidden border border-gray-100"
        onPress={() => navigation.navigate('PropertyDetailsScreen', {
          propertyId: item._id,
          // optional: pass the object for instant UI
          property: {
            ...item,
            owner: item.ownerId ? {
              name: item.ownerId.uname,
              email: item.ownerId.email,
              phone: item.ownerId.number,
            } : undefined,
          },
        })}
      >
        {imgUri ? (
          <Image source={{ uri: imgUri }} className="w-full h-44" resizeMode="cover" />
        ) : (
          <View className="w-full h-44 bg-gray-100 items-center justify-center">
            <Ionicons name="image-outline" size={28} color="#9ca3af" />
            <Text className="text-gray-500 mt-1">No image</Text>
          </View>
        )}

        <View className="p-4">
          <Text className="text-lg font-semibold text-gray-900" numberOfLines={1}>
            {item.title || 'Property'}
          </Text>
          <Text className="text-gray-500 mt-1" numberOfLines={1}>
            {item.address || '—'}
          </Text>

          <View className="flex-row items-center mt-3">
            <View className="px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 mr-2">
              <Text className="text-emerald-700 text-xs font-semibold">
                {item.propertyType || '—'}
              </Text>
            </View>
            <View className="px-2 py-1 rounded-full bg-indigo-50 border border-indigo-200">
              <Text className="text-indigo-700 text-xs font-semibold">
                {currency(item.rentPrice)}/mo
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [navigation]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator />
        <Text className="mt-2 text-gray-600">Loading properties…</Text>
      </View>
    );
  }

  if (!items.length) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-6">
        <Text className="text-lg font-semibold text-gray-800 mb-2">No properties yet</Text>
        <Text className="text-gray-600 text-center mb-4">Add your first property to get started.</Text>
        <TouchableOpacity
          onPress={onRefresh}
          className="px-4 py-2 rounded-xl bg-gray-200"
        >
          <Text className="text-gray-800 font-medium">Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={items}
        keyExtractor={(it) => it._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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