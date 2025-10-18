// screens/MyBookings.js
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchBookings } from '../lib/api';

const GREEN = '#3cc172';

export default function MyBookings() {
  const navigation = useNavigation();
  const route = useRoute();
  const [email, setEmail] = useState(route?.params?.email || '');
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');        // '' | 'new' | 'contacted' | 'closed'
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
       
  // last-resort: read email from storage
  useEffect(() => {
    (async () => {
      if (email) return;
      try {
        const raw = await AsyncStorage.getItem('auth_user');
        const user = raw ? JSON.parse(raw) : null;
        if (user?.email) setEmail(String(user.email).trim().toLowerCase());
      } catch {}
    })();
  }, [email]);

  const load = useCallback(async () => {
    if (!email) return;
    try {
      setLoading(true);
      const { data } = await fetchBookings({
        role: 'requester',
        email,
        status: status || undefined,
        page: 1,
        limit: 50,
      });
      setItems(data || []);
    } catch (e) {
      console.log('my bookings load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [email, status]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const statusChipBg = (s) => {
    if (s === 'contacted') return '#e5f0ff';
    if (s === 'closed') return '#ffe9e9';
    if (s === 'new') return '#f3f4f6';
    return '#f3f4f6';
  };

  const Header = (
    <View className="px-4 pt-5 pb-3 bg-white border-b border-gray-100">
      {/* Back button */}
      <View className="flex-row items-center mb-3">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-xl items-center justify-center bg-gray-50"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text className="ml-2 text-2xl font-extrabold text-gray-900">My Bookings</Text>
      </View>
      <Text className="text-gray-500">Requests you’ve sent to landlords</Text>

      {/* Segmented filter – different style than landlord page */}
      <View className="mt-4 rounded-2xl bg-gray-100 p-1 flex-row">
        {[
          { key: '', label: 'All' },
          { key: 'new', label: 'New' },
          { key: 'contacted', label: 'Contacted' },
          { key: 'closed', label: 'Closed' },
        ].map((opt) => {
          const active = status === opt.key;
          return (
            <TouchableOpacity
              key={opt.key || 'all'}
              onPress={() => setStatus(opt.key)}
              className="flex-1 py-2 rounded-xl items-center"
              style={{ backgroundColor: active ? '#fff' : 'transparent' }}
              accessibilityRole="button"
              accessibilityLabel={`Filter ${opt.label}`}
            >
              <Text
                className="text-[12px] font-semibold"
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
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-gray-900 font-extrabold" numberOfLines={1}>
              {p.title || 'Property'}
            </Text>
            <Text className="text-gray-500 text-[12px]" numberOfLines={1}>
              {p.address || '—'}
            </Text>
          </View>

        {/* status chip */}
          <View className="px-2 py-1 rounded-full border"
                style={{ backgroundColor: statusChipBg(item.status), borderColor: '#e5e7eb' }}>
            <Text className="text-[11px] text-gray-700">
              {item.status ? item.status[0].toUpperCase() + item.status.slice(1) : 'New'}
            </Text>
          </View>
        </View>

        <View className="mt-3">
          {item.preferredDate ? (
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={16} color="#6b7280" />
              <Text className="ml-1.5 text-[12px] text-gray-700">
                Preferred: {new Date(item.preferredDate).toLocaleString()}
              </Text>
            </View>
          ) : null}

          {item.message ? (
            <View className="flex-row items-start mt-1.5">
              <Ionicons name="chatbubble-ellipses-outline" size={16} color="#6b7280" style={{ marginTop: 1 }}/>
              <Text className="ml-1.5 text-[12px] text-gray-700">{item.message}</Text>
            </View>
          ) : null}
        </View>

        <View className="flex-row items-center justify-between mt-3">
          <Text className="text-[11px] text-gray-500">
            Sent: {new Date(item.createdAt).toLocaleString()}
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="information-circle-outline" size={14} color="#6b7280" />
            <Text className="ml-1 text-[12px] text-gray-600">
              Waiting on landlord
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {Header}

      {!email ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={28} color="#9ca3af" />
          <Text className="mt-2 text-gray-500 text-center">
            Sign in to see your booking requests.
          </Text>
        </View>
      ) : loading && items.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className="mt-2 text-gray-500">Loading your bookings…</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => String(it._id)}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View className="items-center mt-16">
              <Ionicons name="file-tray-outline" size={32} color="#9ca3af" />
              <Text className="mt-2 text-gray-500">No bookings yet.</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
}