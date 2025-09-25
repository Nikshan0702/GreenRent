// ApartmentSuggestions.js
import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image,
  RefreshControl, StyleSheet, Platform
} from "react-native";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";

// For dev: use your LAN IP so physical devices can reach it too
const API_BASE =
  Platform.OS === 'ios'
    ? 'http://192.168.x.x:4000/PropertyOperations' // replace with your Mac's LAN IP
    : 'http://10.0.2.2:4000/PropertyOperations';   // Android emulator special
const placeholder = "https://via.placeholder.com/600x400.png?text=No+Image";

export default function ApartmentSuggestions() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  const fetchSuggestions = useCallback(async () => {
    setError("");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission denied.");
        setItems([]);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      const res = await fetch(`${API_BASE}/suggestions?lat=${lat}&lng=${lng}&maxDistance=5000`);
      if (!res.ok) throw new Error((await res.text()) || "API error");
      const json = await res.json();
      if (!json?.success) throw new Error(json?.message || "Failed to fetch suggestions");

      setItems(Array.isArray(json.data) ? json.data : []);
    } catch (e) {
      console.error("Suggestions fetch error:", e);
      setError(e?.message || "Failed to load nearby apartments.");
      setItems([]);
    }
  }, []);

  useEffect(() => {
    (async () => { setLoading(true); await fetchSuggestions(); setLoading(false); })();
  }, [fetchSuggestions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSuggestions();
    setRefreshing(false);
  }, [fetchSuggestions]);

  const onRetry = async () => { setFetching(true); await fetchSuggestions(); setFetching(false); };

  const renderItem = ({ item }) => {
    const img = item?.imageUrl || item?.images?.[0]?.url || placeholder;
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={() => navigation.navigate("PropertyDetails", { id: item._id })}
      >
        <Image source={{ uri: img }} style={styles.image} resizeMode="cover" />
        <View style={styles.cardBody}>
          <Text style={styles.title} numberOfLines={1}>{item?.title || "Untitled"}</Text>
          <Text style={styles.address} numberOfLines={2}>{item?.address || "Address unavailable"}</Text>
          <Text style={styles.price}>{formatCurrency(item?.rentPrice)} / mo</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator /><Text style={styles.muted}>Finding nearby apartments…</Text></View>;
  }
  if (error) {
    return (
      <View style={styles.centerPad}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry} disabled={fetching}>
          <Text style={styles.retryText}>{fetching ? "Retrying…" : "Try again"}</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (!items.length) {
    return (
      <View style={styles.centerPad}>
        <Text style={styles.muted}>No nearby apartments found.</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry}><Text style={styles.retryText}>Refresh</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={items}
        keyExtractor={(it) => it._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listPad}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
}

function formatCurrency(n) {
  const num = Number(n || 0);
  try {
    return new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(num);
  } catch { return `LKR ${Math.round(num).toLocaleString()}`; }
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f7f9fc" },
  listPad: { padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f7f9fc" },
  centerPad: { flex: 1, padding: 24, alignItems: "center", justifyContent: "center", backgroundColor: "#f7f9fc" },
  muted: { marginTop: 8, color: "#6b7280" },
  error: { color: "#b91c1c", textAlign: "center", marginBottom: 12 },
  retryBtn: { backgroundColor: "#111827", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  retryText: { color: "#fff", fontWeight: "600" },
  card: {
    backgroundColor: "#fff", borderRadius: 14, overflow: "hidden",
    borderWidth: 1, borderColor: "#e5e7eb", shadowColor: "#000",
    shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  image: { width: "100%", height: 160, backgroundColor: "#eef2f7" },
  cardBody: { padding: 12 },
  title: { fontSize: 16, fontWeight: "700", color: "#111827" },
  address: { marginTop: 4, fontSize: 12, color: "#6b7280" },
  price: { marginTop: 8, fontSize: 13, fontWeight: "700", color: "#0f766e" },
});