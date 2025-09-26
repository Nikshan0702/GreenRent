// screens/BookingsInbox.js
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator, Platform, RefreshControl, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = Platform.OS === "ios" ? "http://localhost:4000" : "http://10.0.2.2:4000";

export default function BookingsInbox() {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE}/bookings`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const js = await res.json();
      if (!res.ok || js?.success === false) throw new Error(js?.message || "Failed to load");
      setItems(js?.data || []);
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to load bookings");
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(it) => it._id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      renderItem={({ item }) => (
        <View style={{ padding: 12, borderBottomWidth: 1, borderColor: "#eee" }}>
          <Text style={{ fontWeight: "700" }}>{item.name}</Text>
          {!!item.email && <Text>{item.email}</Text>}
          {!!item.phone && <Text>{item.phone}</Text>}
          {!!item.message && <Text numberOfLines={1} style={{ color: "#555" }}>{item.message}</Text>}
          <Text style={{ marginTop: 4, fontSize:12, color:"#666" }}>
            {item?.propertyId?.title} • {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>
      )}
      ListEmptyComponent={<View style={{ padding: 24, alignItems: "center" }}><Text>No requests yet.</Text></View>}
    />
  );
}