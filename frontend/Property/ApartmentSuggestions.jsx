// // screens/ApartmentSuggestions.js
// import React, { useEffect, useState, useCallback } from "react";
// import {
//   View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image,
//   RefreshControl, StyleSheet, Platform
// } from "react-native";
// import * as Location from "expo-location";
// import Constants from "expo-constants";
// import { Ionicons } from "@expo/vector-icons";
// import { useNavigation } from "@react-navigation/native";
// import { API_BASE }from '../config/api.js';

// const placeholder = "https://via.placeholder.com/600x400.png?text=No+Image";

// // Auto-detect LAN host for Expo dev
// function resolveHost() {
//   const hostFromExpo = Constants?.expoConfig?.hostUri?.split(":")?.[0];
//   if (hostFromExpo) return hostFromExpo;
//   const legacy = Constants?.manifest?.debuggerHost?.split(":")?.[0];
//   if (legacy) return legacy;
//   return null;
// }

// const HOST = resolveHost();
// const BASE =
//   HOST
//     ? `http://${HOST}:4000`
//     : Platform.OS === "android"
//       ? "http://10.0.2.2:4000"
//       : "http://localhost:4000";

// // ✅ EXACT path your backend mounted:
// const API_BASE = `${BASE}/PropertySuggestOperation`;

// export default function ApartmentSuggestions() {
//   const navigation = useNavigation();
//   const [loading, setLoading] = useState(true);
//   const [fetching, setFetching] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState("");
//   const [items, setItems] = useState([]);

//   const fetchSuggestions = useCallback(async () => {
//     setError("");
//     try {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         setError("Location permission denied.");
//         setItems([]);
//         return;
//       }

//       const pos = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.Balanced,
//       });
//       const lat = pos.coords.latitude;
//       const lng = pos.coords.longitude;

//       const controller = new AbortController();
//       const to = setTimeout(() => controller.abort(), 10000);

//       const res = await fetch(
//         `${API_BASE}/locationsuggestions?lat=${lat}&lng=${lng}&maxDistance=5000`,
//         { signal: controller.signal }
//       );
//       clearTimeout(to);

//       const text = await res.text();
//       let json = {};
//       try { json = JSON.parse(text); } catch {}

//       if (!res.ok || json?.success === false) {
//         throw new Error(json?.message || text || `HTTP ${res.status}`);
//       }

//       setItems(Array.isArray(json.data) ? json.data : []);
//     } catch (e) {
//       console.error("Suggestions fetch error:", e);
//       setError(e?.message || "Failed to load nearby apartments.");
//       setItems([]);
//     }
//   }, []);

//   useEffect(() => {
//     (async () => {
//       setLoading(true);
//       await fetchSuggestions();
//       setLoading(false);
//     })();
//   }, [fetchSuggestions]);

//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     await fetchSuggestions();
//     setRefreshing(false);
//   }, [fetchSuggestions]);

//   const onRetry = async () => {
//     setFetching(true);
//     await fetchSuggestions();
//     setFetching(false);
//   };

//   const renderItem = ({ item }) => {
//     const img = item?.imageUrl || placeholder;
//     return (
//       <TouchableOpacity
//         activeOpacity={0.9}
//         style={styles.card}
//         onPress={() => navigation.navigate("PropertyDetails", { id: item._id })}
//       >
//         <Image source={{ uri: img }} style={styles.image} resizeMode="cover" />
//         <View style={styles.cardBody}>
//           <Text style={styles.title} numberOfLines={1}>{item?.title || "Untitled"}</Text>
//           <Text style={styles.address} numberOfLines={2}>{item?.address || "Address unavailable"}</Text>
//           <Text style={styles.price}>{formatCurrency(item?.rentPrice)} / mo</Text>
//           {typeof item?.distanceMeters === "number" ? (
//             <Text style={styles.distance}>{(item.distanceMeters / 1000).toFixed(1)} km away</Text>
//           ) : null}
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   const Header = (
//     <View style={styles.header}>
//       <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//         <Ionicons name="chevron-back" size={22} color="#111827" />
//       </TouchableOpacity>
//       <Text style={styles.headerTitle}>Nearby Apartments</Text>
//       <View style={{ width: 40 }} />
//     </View>
//   );

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         {Header}
//         <ActivityIndicator />
//         <Text style={styles.muted}>Finding nearby apartments…</Text>
//       </View>
//     );
//   }
//   if (error) {
//     return (
//       <View style={styles.centerPad}>
//         {Header}
//         <Text style={styles.error}>{error}</Text>
//         <TouchableOpacity style={styles.retryBtn} onPress={onRetry} disabled={fetching}>
//           <Text style={styles.retryText}>{fetching ? "Retrying…" : "Try again"}</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }
//   if (!items.length) {
//     return (
//       <View style={styles.centerPad}>
//         {Header}
//         <Ionicons name="file-tray-outline" size={32} color="#9ca3af" />
//         <Text style={styles.muted}>No nearby apartments found.</Text>
//         <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
//           <Text style={styles.retryText}>Refresh</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.screen}>
//       {Header}
//       <FlatList
//         data={items}
//         keyExtractor={(it) => it._id}
//         renderItem={renderItem}
//         contentContainerStyle={styles.listPad}
//         ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//       />
//     </View>
//   );
// }

// function formatCurrency(n) {
//   const num = Number(n || 0);
//   try {
//     return new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(num);
//   } catch { return `LKR ${Math.round(num).toLocaleString()}`; }
// }

// const styles = StyleSheet.create({
//   screen: { flex: 1, backgroundColor: "#f7f9fc" },
//   header: {
//     paddingTop: 16, paddingHorizontal: 16, paddingBottom: 8,
//     backgroundColor: "#fff", borderBottomColor: "#e5e7eb", borderBottomWidth: 1,
//     flexDirection: "row", alignItems: "center", justifyContent: "space-between",
//   },
//   backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center" },
//   headerTitle: { fontSize: 20, fontWeight: "800", color: "#111827" },

//   listPad: { padding: 16, paddingBottom: 24 },
//   center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f7f9fc" },
//   centerPad: { flex: 1, padding: 24, alignItems: "center", justifyContent: "center", backgroundColor: "#f7f9fc" },
//   muted: { marginTop: 8, color: "#6b7280" },
//   error: { color: "#b91c1c", textAlign: "center", marginBottom: 12 },
//   retryBtn: { backgroundColor: "#111827", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, marginTop: 6 },
//   retryText: { color: "#fff", fontWeight: "600" },

//   card: {
//     backgroundColor: "#fff", borderRadius: 14, overflow: "hidden",
//     borderWidth: 1, borderColor: "#e5e7eb",
//     shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
//   },
//   image: { width: "100%", height: 160, backgroundColor: "#eef2f7" },
//   cardBody: { padding: 12 },
//   title: { fontSize: 16, fontWeight: "700", color: "#111827" },
//   address: { marginTop: 4, fontSize: 12, color: "#6b7280" },
//   price: { marginTop: 8, fontSize: 13, fontWeight: "700", color: "#0f766e" },
//   distance: { marginTop: 4, fontSize: 12, color: "#4b5563" },
// });



// screens/ApartmentSuggestions.js
import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image,
  RefreshControl, StyleSheet
} from "react-native";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { API_BASE } from "../config/api.js";

const placeholder = "https://via.placeholder.com/600x400.png?text=No+Image";

// Use the shared API_BASE and just append the controller path
const SUGGEST_BASE = `${API_BASE}/PropertySuggestOperation`;

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

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      const controller = new AbortController();
      const to = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(
        `${SUGGEST_BASE}/locationsuggestions?lat=${lat}&lng=${lng}&maxDistance=5000`,
        { signal: controller.signal }
      );
      clearTimeout(to);

      const text = await res.text();
      let json = {};
      try { json = JSON.parse(text); } catch {}

      if (!res.ok || json?.success === false) {
        throw new Error(json?.message || text || `HTTP ${res.status}`);
      }

      setItems(Array.isArray(json.data) ? json.data : []);
    } catch (e) {
      console.error("Suggestions fetch error:", e);
      setError(e?.message || "Failed to load nearby apartments.");
      setItems([]);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchSuggestions();
      setLoading(false);
    })();
  }, [fetchSuggestions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSuggestions();
    setRefreshing(false);
  }, [fetchSuggestions]);

  const onRetry = async () => {
    setFetching(true);
    await fetchSuggestions();
    setFetching(false);
  };

  const renderItem = ({ item }) => {
    const img = item?.imageUrl || placeholder;
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
          {typeof item?.distanceMeters === "number" ? (
            <Text style={styles.distance}>{(item.distanceMeters / 1000).toFixed(1)} km away</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  const Header = (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={22} color="#111827" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Nearby Apartments</Text>
      <View style={{ width: 40 }} />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        {Header}
        <ActivityIndicator />
        <Text style={styles.muted}>Finding nearby apartments…</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.centerPad}>
        {Header}
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
        {Header}
        <Ionicons name="file-tray-outline" size={32} color="#9ca3af" />
        <Text style={styles.muted}>No nearby apartments found.</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
          <Text style={styles.retryText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {Header}
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
  header: {
    paddingTop: 16, paddingHorizontal: 16, paddingBottom: 8,
    backgroundColor: "#fff", borderBottomColor: "#e5e7eb", borderBottomWidth: 1,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#111827" },

  listPad: { padding: 16, paddingBottom: 24 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f7f9fc" },
  centerPad: { flex: 1, padding: 24, alignItems: "center", justifyContent: "center", backgroundColor: "#f7f9fc" },
  muted: { marginTop: 8, color: "#6b7280" },
  error: { color: "#b91c1c", textAlign: "center", marginBottom: 12 },
  retryBtn: { backgroundColor: "#111827", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, marginTop: 6 },
  retryText: { color: "#fff", fontWeight: "600" },

  card: {
    backgroundColor: "#fff", borderRadius: 14, overflow: "hidden",
    borderWidth: 1, borderColor: "#e5e7eb",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  image: { width: "100%", height: 160, backgroundColor: "#eef2f7" },
  cardBody: { padding: 12 },
  title: { fontSize: 16, fontWeight: "700", color: "#111827" },
  address: { marginTop: 4, fontSize: 12, color: "#6b7280" },
  price: { marginTop: 8, fontSize: 13, fontWeight: "700", color: "#0f766e" },
  distance: { marginTop: 4, fontSize: 12, color: "#4b5563" },
});