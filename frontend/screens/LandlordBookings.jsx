import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { fetchBookings, patchBookingStatus, postBookingReply } from '../lib/api';
import ReplyModal from './ReplyModal';

// Enhanced color palette for professional look
const GREEN = '#3cc172';
const COLORS = {
  primary: GREEN,
  background: '#f8fafc',
  surface: '#ffffff',
  textPrimary: '#1f2937',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  border: '#e5e7eb',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

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


  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

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

  // Enhanced status chip background colors
  const statusChipConfig = (s) => {
    const configs = {
      new: { bg: '#fef3c7', text: '#92400e', icon: 'mail-unread', label: 'New' },
      contacted: { bg: '#dbeafe', text: '#1e40af', icon: 'chatbubble-ellipses', label: 'Contacted' },
      closed: { bg: '#fee2e2', text: '#dc2626', icon: 'checkmark-done', label: 'Closed' },
    };
    return configs[s] || { bg: '#f3f4f6', text: '#374151', icon: 'help', label: 'Unknown' };
  };

  // Enhanced Header with modern design
  const Header = (
    <Animated.View 
      style={{ opacity: fadeAnim }}
      className="px-6 pt-12 pb-4 bg-white border-b"
      style={{ borderBottomColor: COLORS.border, borderBottomWidth: 1 }}
    >
      <View className="flex-row items-center mb-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-12 h-12 rounded-2xl items-center justify-center bg-gray-50 active:bg-gray-100"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View className="ml-3 flex-1">
          <Text className="text-2xl font-bold" style={{ color: COLORS.textPrimary }}>
            Booking Requests
          </Text>
          <Text className="text-base mt-1" style={{ color: COLORS.textSecondary }}>
            Manage property inquiries
          </Text>
        </View>
      </View>

      {/* Enhanced Filter Pills */}
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
              className="flex-row items-center px-4 py-3 rounded-2xl border"
              style={{
                backgroundColor: active ? COLORS.primary : COLORS.surface,
                borderColor: active ? COLORS.primary : COLORS.border,
                shadowColor: active ? COLORS.primary : '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: active ? 0.2 : 0.05,
                shadowRadius: active ? 4 : 2,
                elevation: active ? 3 : 1,
              }}
              accessibilityRole="button"
              accessibilityLabel={`Filter ${opt.label}`}
            >
              <Ionicons 
                name={opt.icon} 
                size={16} 
                color={active ? COLORS.surface : COLORS.textSecondary} 
              />
              <Text
                className="ml-2 text-sm font-semibold"
                style={{ color: active ? COLORS.surface : COLORS.textPrimary }}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );

  const renderItem = ({ item, index }) => {
    const p = item.property || {};
    const statusConfig = statusChipConfig(item.status);
    
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            })
          }]
        }}
        className="mx-5 my-2 rounded-3xl bg-white p-5"
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 4,
          borderWidth: 1,
          borderColor: COLORS.border,
        }}
      >
        {/* Header with Property Info and Status */}
        <View className="flex-row items-start justify-between mb-4">
          <View className="flex-1 pr-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="business" size={18} color={COLORS.primary} />
              <Text className="ml-2 text-lg font-bold" style={{ color: COLORS.textPrimary }}>
                {p.title || 'Property'}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="location" size={14} color={COLORS.textTertiary} />
              <Text className="ml-1.5 text-sm" style={{ color: COLORS.textSecondary }} numberOfLines={1}>
                {p.address || 'Address not provided'}
              </Text>
            </View>
          </View>

          <View
            className="px-3 py-2 rounded-full flex-row items-center"
            style={{ backgroundColor: statusConfig.bg }}
          >
            <Ionicons name={statusConfig.icon} size={12} color={statusConfig.text} />
            <Text className="ml-1.5 text-xs font-semibold" style={{ color: statusConfig.text }}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Customer Information */}
        <View className="mb-4 p-3 rounded-2xl" style={{ backgroundColor: '#f8fafc' }}>
          <View className="flex-row items-center mb-2">
            <Ionicons name="person-circle" size={16} color={COLORS.primary} />
            <Text className="ml-2 text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
              {item.name || 'No name provided'}
            </Text>
          </View>
          
          <View className="space-y-1">
            {item.email && (
              <View className="flex-row items-center">
                <Ionicons name="mail" size={14} color={COLORS.textTertiary} />
                <Text className="ml-2 text-xs" style={{ color: COLORS.textSecondary }}>
                  {item.email}
                </Text>
              </View>
            )}
            
            {item.phone && (
              <View className="flex-row items-center">
                <Ionicons name="call" size={14} color={COLORS.textTertiary} />
                <Text className="ml-2 text-xs" style={{ color: COLORS.textSecondary }}>
                  {item.phone}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Booking Details */}
        <View className="mb-4 space-y-3">
          {item.preferredDate && (
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full items-center justify-center" 
                style={{ backgroundColor: '#e8f5e8' }}>
                <Ionicons name="calendar" size={16} color={COLORS.primary} />
              </View>
              <View className="ml-3">
                <Text className="text-xs font-medium" style={{ color: COLORS.textTertiary }}>
                  Preferred Date
                </Text>
                <Text className="text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
                  {new Date(item.preferredDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            </View>
          )}

          {item.message && (
            <View className="flex-row items-start">
              <View className="w-8 h-8 rounded-full items-center justify-center mt-1" 
                style={{ backgroundColor: '#e8f5e8' }}>
                <Ionicons name="chatbubble-ellipses" size={16} color={COLORS.primary} />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs font-medium mb-1" style={{ color: COLORS.textTertiary }}>
                  Message
                </Text>
                <Text className="text-sm leading-5" style={{ color: COLORS.textSecondary }}>
                  {item.message}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Footer with Timestamp and Actions */}
        <View className="flex-row items-center justify-between pt-3 border-t" 
          style={{ borderTopColor: COLORS.border, borderTopWidth: 1 }}>
          <View className="flex-row items-center">
            <Ionicons name="time" size={14} color={COLORS.textTertiary} />
            <Text className="ml-1 text-xs" style={{ color: COLORS.textTertiary }}>
              Received {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>

          <View className="flex-row" style={{ gap: 8 }}>
            <TouchableOpacity
              onPress={() => openReply(item)}
              className="flex-row items-center px-4 py-2 rounded-full"
              style={{ 
                backgroundColor: '#e8fff2',
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2,
              }}
              accessibilityRole="button"
              accessibilityLabel="Reply to requester"
            >
              <Ionicons name="send" size={14} color={COLORS.primary} />
              <Text className="ml-1.5 text-xs font-semibold" style={{ color: COLORS.primary }}>
                Reply
              </Text>
            </TouchableOpacity>

            {item.status !== 'contacted' && (
              <TouchableOpacity
                onPress={() => updateStatus(item._id, 'contacted')}
                className="flex-row items-center px-4 py-2 rounded-full"
                style={{ 
                  backgroundColor: '#e5f0ff',
                  shadowColor: COLORS.info,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 2,
                }}
                accessibilityRole="button"
                accessibilityLabel="Mark as contacted"
              >
                <Ionicons name="checkmark-circle" size={14} color={COLORS.info} />
                <Text className="ml-1.5 text-xs font-semibold" style={{ color: COLORS.info }}>
                  Contacted
                </Text>
              </TouchableOpacity>
            )}

            {item.status !== 'closed' && (
              <TouchableOpacity
                onPress={() => updateStatus(item._id, 'closed')}
                className="flex-row items-center px-4 py-2 rounded-full"
                style={{ 
                  backgroundColor: '#ffe9e9',
                  shadowColor: COLORS.error,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 2,
                }}
                accessibilityRole="button"
                accessibilityLabel="Close request"
              >
                <Ionicons name="close-circle" size={14} color={COLORS.error} />
                <Text className="ml-1.5 text-xs font-semibold" style={{ color: COLORS.error }}>
                  Close
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background }}>
      {Header}

      {!landlordId ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.textTertiary} />
          <Text className="mt-4 text-lg font-medium text-center" style={{ color: COLORS.textSecondary }}>
            No landlord ID found.
          </Text>
          <Text className="mt-2 text-sm text-center" style={{ color: COLORS.textTertiary }}>
            Please check your account settings.
          </Text>
        </View>
      ) : loading && items.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text className="mt-4 text-base" style={{ color: COLORS.textSecondary }}>
            Loading bookings...
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => String(it._id)}
          renderItem={renderItem}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View className="items-center mt-20 px-6">
              <Ionicons name="file-tray-outline" size={64} color={COLORS.textTertiary} />
              <Text className="mt-4 text-lg font-medium text-center" style={{ color: COLORS.textSecondary }}>
                No booking requests
              </Text>
              <Text className="mt-2 text-sm text-center" style={{ color: COLORS.textTertiary }}>
                New requests will appear here when tenants contact you.
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
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