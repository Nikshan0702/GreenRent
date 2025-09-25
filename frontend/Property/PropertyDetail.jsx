// screens/PropertyDetail.js
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
     View, Text, Image, TouchableOpacity, ScrollView, Platform, Modal,
    Pressable, ActivityIndicator, Alert, Animated, Linking, TextInput
  } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';

const API_BASE = Platform.OS === 'ios' ? 'http://localhost:4000' : 'http://10.0.2.2:4000';
const REVIEW_BASE = `${API_BASE}/ReviewOperations`;

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

const getLocationLabel = (item) => {
  if (item?.locationName && typeof item.locationName === 'string') return item.locationName;
  if (item?.address && typeof item.address === 'string') {
    const first = item.address.split(',').map(s => s.trim()).filter(Boolean)[0];
    return first || 'Location';
  }
  return 'Location';
};

export default function PropertyDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  const prop = route.params?.property || {};

  const [commentModal, setCommentModal] = useState({ visible: false, property: prop });
  const [commentsTick, setCommentsTick] = useState(0);

  const img = ensureAbsolute(prop?.images?.[0]?.url || prop?.images?.[0]);
  const badge = prop?.ecoBadge || 'Unverified';
  const pal = BADGE_STYLES[badge] || BADGE_STYLES.Unverified;

  const lat = prop?.location?.coordinates?.[1];
  const lng = prop?.location?.coordinates?.[0];
  const locLabel = getLocationLabel(prop);

  const [zoom, setZoom] = useState(false);

  return (
    <View className="flex-1 mt-16 bg-white">
      {/* Header */}
      <View className={`${Platform.OS === 'android' ? 'pt-8' : 'pt-12'} pb-3 px-4 bg-white border-b border-gray-100 flex-row items-center justify-between`}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 rounded-xl bg-gray-100 border border-gray-200" activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>
        <Text className="text-lg font-extrabold text-gray-900" numberOfLines={1}>Property</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Image */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => setZoom(true)}>
          {img ? (
            <Image source={{ uri: img }} style={{ width: '100%', height: 260 }} resizeMode="cover" />
          ) : (
            <View style={{ width: '100%', height: 260 }} className="bg-gray-100 items-center justify-center">
              <Ionicons name="image-outline" size={24} color="#9ca3af" />
            </View>
          )}
        </TouchableOpacity>

        {/* Badge + title + summary */}
        <View className="px-4 pt-3">
          <View
            style={{
              alignSelf: 'flex-start',
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: pal.bg,
              borderColor: pal.border,
              borderWidth: 1,
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 5,
            }}
          >
            <Ionicons name={pal.icon} size={14} color={pal.text} style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 12, fontWeight: '700', color: pal.text }}>{badge}</Text>
          </View>

          <Text className="text-xl font-extrabold text-gray-900 mt-2">{prop?.title}</Text>

          <View className="flex-row items-center mt-1">
            <Ionicons name="location-outline" size={14} color="#6b7280" />
            <Text className="text-[12px] text-gray-700 ml-1" numberOfLines={1}>
              {locLabel}
            </Text>
          </View>

          <Text className="text-[12px] text-gray-600 mt-1">{prop?.address}</Text>

          <View className="flex-row items-center mt-2">
            <View className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 mr-1.5">
              <Text className="text-indigo-700 text-[12px] font-semibold">{currency(prop?.rentPrice)}/mo</Text>
            </View>
            <View className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
              <Text className="text-emerald-700 text-[12px] font-semibold">{prop?.propertyType}</Text>
            </View>
          </View>

          {prop?.avgRating !== undefined && (
            <View className="mt-2">
              <Text className="text-[12px] text-gray-700">⭐ {prop.avgRating || 0} · {prop.reviewCount || 0} reviews</Text>
            </View>
          )}

          {/* Description */}
          <Text className="text-gray-700 text-[13px] mt-3">{prop?.description}</Text>

          {/* Maps shortcut */}
          {!!lat && !!lng && (
            <View className="flex-row items-center mt-3">
              <Ionicons name="navigate-outline" size={16} color="#111827" />
              <Text className="ml-1 text-[12px] text-gray-700">
                {lat.toFixed(5)}, {lng.toFixed(5)}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  const url = Platform.select({
                    ios: `maps://?q=${encodeURIComponent(prop.title)}&ll=${lat},${lng}`,
                    android: `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(prop.title)})`,
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
        </View>

        {/* Reviews Section */}
        <View className="px-4 mt-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-semibold text-gray-900 text-[14px]">Reviews</Text>
            <TouchableOpacity
              onPress={() => setCommentModal({ visible: true, property: prop })}
              className="px-3 py-1.5 rounded-xl"
              style={{ backgroundColor: '#111827' }}
            >
              <Text className="text-white text-[12px] font-semibold">Write a review</Text>
            </TouchableOpacity>
          </View>

          <CommentsBlock propertyId={prop?._id} title="Reviews" reloadKey={commentsTick} />
        </View>
      </ScrollView>

      {/* Zoom modal (image) */}
      <ZoomImage visible={zoom} onClose={() => setZoom(false)} src={img} />

      {/* Comment Modal */}
      <CommentModal
        modal={{ ...commentModal, property: prop }}
        setModal={setCommentModal}
        onPosted={() => setCommentsTick((t) => t + 1)}
      />
    </View>
  );
}

/* ---------- Comments block (with sentiment) ---------- */
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
    } catch {} // ignore
    setLoading(false);
  }, [propertyId]);

  useEffect(() => { load(); }, [load, reloadKey]);

  if (loading && !items) return <View className="mt-2"><ActivityIndicator /></View>;
  if (!items || items.length === 0) return <Text className="text-gray-500 mt-2 text-[11px]">No reviews yet.</Text>;

  const slice = compact ? items.slice(0, 2) : items;

  return (
    <View className="mt-1">
      <Text className="font-semibold text-gray-900 mb-1 text-[12px]">{title}</Text>
      {slice.map((c) => {
        const mood = c?.sentiment?.label;
        const conf = typeof c?.sentiment?.confidence === 'number' ? ` (${Math.round(c.sentiment.confidence * 100)}%)` : '';
        return (
          <View key={c._id} className="bg-gray-50 border border-gray-200 rounded-lg p-2 mb-1.5">
            <Text className="text-[10px] text-gray-500">
              {c.userId?.uname || 'User'} • {new Date(c.createdAt).toLocaleDateString()}
            </Text>
            {c.rating ? <Text className="text-amber-600 text-[11px] mt-0.5">⭐ {c.rating}/5</Text> : null}
            {mood ? <Text className="text-[10px] text-gray-500 mt-0.5">Mood: {mood}{conf}</Text> : null}
            <Text className="text-[12px] text-gray-800 mt-0.5">{c.text}</Text>
          </View>
        );
      })}
      {items.length > slice.length && (
        <Text className="text-[11px] text-gray-500 mt-0.5">+ {items.length - slice.length} more…</Text>
      )}
    </View>
  );
}

/* ---------- Comment modal ---------- */
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
      <View className="flex-1 bg-black/40 justify-end">
        <View className="bg-white rounded-t-2xl p-4">
          <Text className="text-lg font-bold mb-2" numberOfLines={1}>
            Review {prop?.title}
          </Text>
          <View className="bg-gray-100 rounded-xl px-3 py-2 mb-2">
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Write your review…"
              multiline
              style={{ minHeight: 96 }}
            />
          </View>
          <View className="bg-gray-100 rounded-xl px-3 py-2 mb-3">
            <TextInput
              value={rating}
              onChangeText={setRating}
              placeholder="Rating (1-5)"
              keyboardType="number-pad"
            />
          </View>

          <View className="flex-row">
            <Pressable onPress={() => setModal({ visible: false, property: prop })} className="flex-1 mr-2 bg-gray-200 rounded-xl py-3 items-center">
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

/* ---------- Simple zoom for image ---------- */
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
          <Animated.View style={{ transform: [{ scale }], borderRadius: 16, overflow: 'hidden', backgroundColor: '#fff' }}>
            {src ? (
              <Image source={{ uri: src }} style={{ width: '100%', height: 320 }} resizeMode="cover" />
            ) : (
              <View style={{ width: '100%', height: 320 }} className="bg-gray-100 items-center justify-center">
                <Ionicons name="image-outline" size={24} color="#9ca3af" />
              </View>
            )}
            <TouchableOpacity onPress={onClose} className="m-3 py-3 rounded-xl items-center" style={{ backgroundColor: '#111827' }} activeOpacity={0.9}>
              <Text className="text-white font-semibold">Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>
    </Modal>
  );
}