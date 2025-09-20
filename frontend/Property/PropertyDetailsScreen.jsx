// screens/PropertyDetailsScreen.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView,
  Linking, Alert, ActivityIndicator
} from 'react-native';
import { useRoute as useRouteHook, useNavigation as useNavigationHook } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// ANDROID emulator: http://10.0.2.2:4000
// iOS simulator:    http://localhost:4000
// Physical device:  http://<your-computer-LAN-IP>:4000
const API_BASE = 'http://10.0.2.2:4000';
const GET_BY_ID = (id) => `${API_BASE}/PropertyOperations/${id}`;
const LIST_URL = `${API_BASE}/PropertyOperations/list?page=1&limit=100`;

// Safe wrappers: call the hooks, but fall back if not inside a navigator
const useRouteSafe = () => {
  try { return useRouteHook(); } catch { return { params: {} }; }
};
const useNavigationSafe = () => {
  try { return useNavigationHook(); } catch { return { goBack: () => {}, navigate: () => {} }; }
};

const currency = (n) => {
  if (n === null || n === undefined || isNaN(Number(n))) return '-';
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0,
  }).format(Number(n));
};

const ensureAbsolute = (uri) => {
  if (!uri) return uri;
  uri = String(uri).replace(/\\/g, '/'); // normalize backslashes
  if (uri.startsWith('http://') || uri.startsWith('https://')) return uri;
  // Make sure server serves uploads: app.use('/uploads', express.static('uploads'))
  return `${API_BASE}/${uri.replace(/^\/?/, '')}`;
};

export default function PropertyDetailsScreen(props) {
  // Prefer props from navigator; otherwise use safe hooks
  const route = props?.route ?? useRouteSafe();
  const navigation = props?.navigation ?? useNavigationSafe();

  // ---- Robust param handling ----
  const params = route?.params ?? {};

  // Accept common shapes: { property }, { item }, or the whole params is the object
  const passedProperty =
    (typeof params.property === 'object' && params.property) ? params.property
    : (typeof params.item === 'object' && params.item) ? params.item
    : (typeof params === 'object' && params._id) ? params
    : {};

  // Try multiple keys for ID, or the entire params being a string id
  const derivedId =
    params.propertyId
    || params._id
    || params.id
    || params.item?._id
    || passedProperty?._id
    || (typeof params === 'string' ? params : null);

  const [prop, setProp] = useState(passedProperty?._id ? passedProperty : null);
  const [loading, setLoading] = useState(!passedProperty?._id && !!derivedId);
  const [error, setError] = useState('');

  // ---- API fetch helpers ----
  const fetchById = useCallback(async (id) => {
    // 1) Try /:id
    try {
      const res = await fetch(GET_BY_ID(id));
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const got = data?.data?.property || data?.data || data?.property || data;
        if (got && got._id) return got;
      } else if (res.status !== 404) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || `Failed (HTTP ${res.status})`);
      }
      // if 404, fall through to list
    } catch (e) {
      if (!String(e.message).includes('404')) throw e;
    }

    // 2) Fallback: fetch list & find
    const listRes = await fetch(LIST_URL);
    const listData = await listRes.json().catch(() => ({}));
    const items = listData?.data || [];
    const found = items.find((x) => String(x._id) === String(id));
    if (!found) throw new Error('Property not found');
    return found;
  }, []);

  // ---- Initial load / refresh ----
  useEffect(() => {
    let active = true;
    const load = async () => {
      // If nothing to load, show empty state
      if (!derivedId && !passedProperty?._id) return;

      // Optimistic show first
      if (passedProperty?._id) setProp(passedProperty);

      setLoading(true);
      setError('');
      try {
        const id = derivedId || passedProperty._id;
        const fresh = await fetchById(id);
        if (active) setProp(fresh);
      } catch (e) {
        if (active) setError(e?.message || 'Failed to load property');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [derivedId, passedProperty?._id, fetchById]);

  // ---- Empty state when NO data / NO id at all ----
  if (!derivedId && !passedProperty?._id) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-6">
        <Text className="text-lg font-semibold text-gray-800 mb-2">No property selected</Text>
        <Text className="text-gray-600 text-center mb-4">
          Pass a property object or a propertyId / id / _id via route params.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack?.()}
          className="px-4 py-2 rounded-xl bg-gray-200"
        >
          <Text className="text-gray-800 font-medium">Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator />
        <Text className="mt-2 text-gray-600">Loading property…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-6">
        <Text className="text-lg font-semibold text-gray-800 mb-2">Failed to load</Text>
        <Text className="text-gray-600 text-center mb-4">{error}</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack?.()}
          className="px-4 py-2 rounded-xl bg-gray-200"
        >
          <Text className="text-gray-800 font-medium">Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ---- Render ----
  const p = prop || passedProperty || {};
  const {
    title,
    description,
    propertyType,
    rentPrice,
    address,
    location,
    images = [],
    owner = {},   // normalized: { name, email, phone }
    phone,
    email,
  } = p;

  const lat = useMemo(
    () => location?.coordinates?.[1] ?? p.lat ?? '',
    [location, p]
  );
  const lng = useMemo(
    () => location?.coordinates?.[0] ?? p.lng ?? '',
    [location, p]
  );

  const imageList = Array.isArray(images)
    ? images.map((img, i) => ({
        id: `${i}`,
        uri: ensureAbsolute(img?.url || img?.uri || img),
      }))
    : (images ? [{ id: '0', uri: ensureAbsolute(images?.url || images?.uri || images) }] : []);

  const mapsUrl = useMemo(() => {
    if (lat && lng) return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    if (address) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    return null;
  }, [lat, lng, address]);

  const openMaps = async () => {
    if (mapsUrl && (await Linking.canOpenURL(mapsUrl))) {
      Linking.openURL(mapsUrl);
    } else {
      Alert.alert('Maps not available');
    }
  };

  const callOwner = () => {
    const tel = owner?.phone || phone;
    if (tel) Linking.openURL(`tel:${tel}`);
    else Alert.alert('No phone number available');
  };

  const mailOwner = () => {
    const mail = owner?.email || email;
    if (mail) Linking.openURL(`mailto:${mail}`);
    else Alert.alert('No email available');
  };

  const Card = ({ title, subtitle, children }) => (
    <View className="bg-white rounded-2xl p-6 mb-6 border border-gray-100 shadow-sm">
      {title && (
        <View className="mb-4">
          <Text className="text-xl font-semibold text-gray-900">{title}</Text>
          {subtitle ? <Text className="text-gray-500 mt-1">{subtitle}</Text> : null}
        </View>
      )}
      {children}
    </View>
  );

  const Row = ({ icon, label, value, onPress }) => (
    <TouchableOpacity
      disabled={!onPress}
      onPress={onPress}
      className="flex-row items-start py-3 border-b border-gray-100"
    >
      {icon && <Ionicons name={icon} size={18} color="#6b7280" style={{ marginTop: 2, marginRight: 8 }} />}
      <View className="flex-1">
        <Text className="text-gray-500 text-xs">{label}</Text>
        <Text className="text-gray-900 font-medium mt-0.5">{value || '-'}</Text>
      </View>
      {onPress && <Ionicons name="open-outline" size={18} color="#9ca3af" />}
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Header */}
      <View className="mb-3 mt-4">
        <Text className="text-2xl font-bold text-gray-900">{title || 'Property'}</Text>
        <View className="flex-row items-center mt-2">
          <View className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 mr-2">
            <Text className="text-emerald-700 text-xs font-semibold">{propertyType || '—'}</Text>
          </View>
          <View className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200">
            <Text className="text-indigo-700 text-xs font-semibold">{currency(rentPrice)}/mo</Text>
          </View>
        </View>
      </View>

      {/* Gallery */}
      {!!imageList.length && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          {imageList.map((img) => (
            <Image key={img.id} source={{ uri: img.uri }} className="w-56 h-36 rounded-xl mr-3" resizeMode="cover" />
          ))}
        </ScrollView>
      )}

      {/* Quick Actions */}
      <View className="flex-row mb-4">
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center bg-[#3cc172] rounded-xl py-3 mr-2"
          onPress={() => Alert.alert('Visit', 'Booking flow coming soon')}
        >
          <Ionicons name="calendar-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text className="text-white font-semibold">Book a Visit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="w-12 h-12 rounded-xl bg-white border border-gray-200 items-center justify-center mr-2"
          onPress={callOwner}
        >
          <Ionicons name="call-outline" size={20} color="#10b981" />
        </TouchableOpacity>
        <TouchableOpacity
          className="w-12 h-12 rounded-xl bg-white border border-gray-200 items-center justify-center"
          onPress={mailOwner}
        >
          <Ionicons name="mail-outline" size={20} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {/* About */}
      <Card title="About this place">
        <Text className="text-gray-700 leading-6">{description || 'No description provided.'}</Text>
      </Card>

      {/* Details */}
      <Card title="Details">
        <Row icon="home-outline" label="Property Type" value={propertyType || '—'} />
        <Row icon="cash-outline" label="Rent (per month)" value={currency(rentPrice)} />
        <Row icon="location-outline" label="Address" value={address || '—'} onPress={mapsUrl ? openMaps : undefined} />
        <Row
          label="Coordinates"
          value={lat && lng ? `${lat}, ${lng}` : '—'}
          onPress={mapsUrl ? openMaps : undefined}
        />
      </Card>

      {/* Owner */}
      {(owner?.name || owner?.phone || owner?.email) && (
        <Card title="Listed by">
          {owner?.name && (
            <View className="flex-row items-center mb-3">
              <Ionicons name="person-circle-outline" size={22} color="#6b7280" />
              <Text className="ml-2 text-gray-900 font-medium">{owner.name}</Text>
            </View>
          )}
          {owner?.phone && <Row icon="call-outline" label="Phone" value={owner.phone} onPress={callOwner} />}
          {owner?.email && <Row icon="mail-outline" label="Email" value={owner.email} onPress={mailOwner} />}
        </Card>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}