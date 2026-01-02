import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { API_BASE } from '../config/api.js';

const ensureAbsolute = (u) => !u ? u : /^https?:\/\//.test(u) ? u : `${API_BASE}/${String(u).replace(/^\/?/, '').replace(/\\/g, '/')}`;
const currency = (n) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(Number(n || 0));

export default function Wishlist() {
  const navigation = useNavigation();
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) throw new Error('Sign in required');
      const res = await fetch(`${API_BASE}/UserOperations/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) throw new Error(data?.message || 'Failed to load wishlist');
      const arr = Array.isArray(data?.data) ? data.data : [];
      setItems(arr);
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not load wishlist');
      setItems([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const removeItem = async (id) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) return Alert.alert('Sign in required');
      const res = await fetch(`${API_BASE}/UserOperations/wishlist/${id}` , {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) throw new Error(data?.message || 'Failed to remove');
      setItems((prev) => (prev || []).filter((x) => x._id !== id));
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not update wishlist');
    }
  };

  const renderItem = ({ item }) => {
    const img = ensureAbsolute(item?.images?.[0]?.url || item?.images?.[0]);
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('PropertyDetail', { property: item })}
        activeOpacity={0.9}
        className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-3 py-3 mb-2 mx-3"
      >
        {img ? (
          <Image source={{ uri: img }} style={{ width: 72, height: 72, borderRadius: 12, backgroundColor: '#f3f4f6' }} />
        ) : (
          <View style={{ width: 72, height: 72 }} className="bg-gray-100 items-center justify-center rounded-xl">
            <Ionicons name="image-outline" size={18} color="#9ca3af" />
          </View>
        )}
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text className="text-[14px] font-semibold text-gray-900" numberOfLines={1}>{item.title}</Text>
          <Text className="text-[12px] text-gray-500" numberOfLines={1}>{item.propertyType}</Text>
          <Text className="text-[12px] text-indigo-700" numberOfLines={1}>{currency(item.rentPrice)}/mo</Text>
        </View>
        <TouchableOpacity onPress={() => removeItem(item._id)} className="px-2 py-2 rounded-xl bg-gray-100">
          <Ionicons name="trash-outline" size={18} color="#111827" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading && !items) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="pt-12 pb-3 px-4 bg-white border-b border-gray-100 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 rounded-xl bg-gray-100 border border-gray-200" activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>
        <Text className="text-lg font-extrabold text-gray-900" numberOfLines={1}>Wishlist</Text>
        <View style={{ width: 40 }} />
      </View>

      {items && items.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Ionicons name="heart-outline" size={28} color="#9ca3af" />
          <Text className="text-[12px] text-gray-500 mt-2">No saved apartments</Text>
        </View>
      ) : (
        <FlatList data={items || []} keyExtractor={(it) => it._id} renderItem={renderItem} contentContainerStyle={{ paddingVertical: 12 }} />
      )}
    </View>
  );
}
