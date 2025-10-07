// screens/LandlordBookings.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { fetchBookings, patchBookingStatus, postBookingReply } from '../lib/api';
import ReplyModal from './ReplyModal';

export default function LandlordBookings({ landlordId }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [replyOpen, setReplyOpen] = useState(false);
  const [replyBooking, setReplyBooking] = useState(null);

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
      setPage(cur);
      setPages(totalPages || 1);
      setItems(prev => append ? [...prev, ...data] : data);
    } catch (e) {
      console.log('load landlord bookings error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [landlordId, status]);

  useEffect(() => { load(1, false); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(1, false); };
  const onEndReached = () => { if (page < pages && !loading) load(page + 1, true); };

  const updateStatus = async (id, next) => {
    try {
      await patchBookingStatus(id, next);
      setItems(prev => prev.map(x => x._id === id ? { ...x, status: next } : x));
    } catch (e) {
      Alert.alert('Update failed', e.message || 'Please try again.');
    }
  };

  const openReply = (booking) => { setReplyBooking(booking); setReplyOpen(true); };
  const sendReply = async (body) => {
    await postBookingReply(replyBooking._id, body);
    // optimistic: mark contacted
    setItems(prev => prev.map(x => x._id === replyBooking._id ? { ...x, status: 'contacted' } : x));
  };

  const renderItem = ({ item }) => {
    const p = item.property || {};
    return (
      <View className="p-3 mb-2 rounded-2xl" style={{ backgroundColor: '#fff', shadowOpacity: 0.06, shadowRadius: 8 }}>
        <Text className="font-semibold">{p.title || 'Property'}</Text>
        <Text className="text-gray-600 text-[12px]">{p.address || '-'}</Text>

        <View className="mt-2">
          <Text className="text-[12px]">From: {item.name} {item.email ? `· ${item.email}` : ''} {item.phone ? `· ${item.phone}` : ''}</Text>
          {item.preferredDate ? <Text className="text-[12px] mt-1">Preferred: {new Date(item.preferredDate).toLocaleString()}</Text> : null}
          {item.message ? <Text className="text-[12px] mt-1">{item.message}</Text> : null}
        </View>

        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-[12px]">Status: {item.status}</Text>
          <View className="flex-row" style={{ gap: 8 }}>
            <TouchableOpacity
              onPress={() => openReply(item)}
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: '#e8fff2' }}>
              <Text className="text-[12px]">Reply</Text>
            </TouchableOpacity>
            {item.status !== 'contacted' && (
              <TouchableOpacity
                onPress={() => updateStatus(item._id, 'contacted')}
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: '#e5f0ff' }}>
                <Text className="text-[12px]">Mark contacted</Text>
              </TouchableOpacity>
            )}
            {item.status !== 'closed' && (
              <TouchableOpacity
                onPress={() => updateStatus(item._id, 'closed')}
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: '#ffe9e9' }}>
                <Text className="text-[12px]">Close</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text className="text-[11px] text-gray-500 mt-2">
          Received: {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1 p-3">
      {/* quick filter */}
      <View className="flex-row mb-2" style={{ gap: 8 }}>
        {['', 'new', 'contacted', 'closed'].map(s => (
          <TouchableOpacity
            key={s || 'all'}
            onPress={() => setStatus(s)}
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: status === s ? '#3cc17222' : '#f3f4f6' }}>
            <Text style={{ fontSize: 12 }}>{s || 'All'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && items.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => String(it._id)}
          renderItem={renderItem}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text className="text-center text-gray-500 mt-10">No requests.</Text>}
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