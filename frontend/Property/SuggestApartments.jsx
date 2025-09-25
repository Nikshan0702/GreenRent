// screens/SuggestApartments.js
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View, Text, FlatList, Image, TouchableOpacity, TextInput,
  ActivityIndicator, RefreshControl, Alert, Platform, ScrollView, Modal, Pressable
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const API_BASE = Platform.OS === "ios" ? "http://localhost:4000" : "http://10.0.2.2:4000";
const SUGGEST_URL = (page, limit, params={}) => {
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  qs.set("limit", String(limit));
  Object.entries(params).forEach(([k, v]) => {
    if (v !== "" && v !== undefined && v !== null) qs.set(k, String(v));
  });
  return `${API_BASE}/ReviewOperations/suggest?${qs.toString()}`;
};

const ensureAbsolute = (u) =>
  !u ? u : /^https?:\/\//.test(u) ? u : `${API_BASE}/${String(u).replace(/^\/?/, "").replace(/\\/g, "/")}`;

const currency = (n) =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(Number(n || 0));

const BADGE_STYLES = {
  Platinum:   { bg: "#e0f2fe", text: "#0369a1", icon: "diamond-outline",    border: "#bae6fd" },
  Gold:       { bg: "#fef3c7", text: "#92400e", icon: "trophy-outline",     border: "#fde68a" },
  Silver:     { bg: "#f8fafc", text: "#475569", icon: "medal-outline",      border: "#cbd5e1" },
  Bronze:     { bg: "#fff7ed", text: "#9a3412", icon: "ribbon-outline",     border: "#fed7aa" },
  Unverified: { bg: "#f3f4f6", text: "#6b7280", icon: "alert-circle-outline", border: "#e5e7eb" },
};

const TYPES   = ["Apartment", "House", "Studio", "Villa", "Townhouse"];
const PRICES  = [
  { label: "≤ 100k", min: "", max: 100000 },
  { label: "≤ 200k", min: "", max: 200000 },
  { label: "≤ 300k", min: "", max: 300000 },
  { label: "Any", min: "", max: "" },
];
const RATINGS = [
  { label: "All Ratings", val: "" },
  { label: "≥ 4.0", val: 4 },
  { label: "≥ 3.0", val: 3 },
];

const getLocationLabel = (item) => {
  if (item?.locationName && typeof item.locationName === "string") return item.locationName;
  if (item?.address && typeof item.address === "string") {
    const first = item.address.split(",").map(s => s.trim()).filter(Boolean)[0];
    return first || "Location";
  }
  return "Location";
};

export default function SuggestApartments() {
  const navigation = useNavigation();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // filters for suggestion
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState(PRICES[3]);
  const [ratingFilter, setRatingFilter] = useState(RATINGS[0]);
  const [minSentiment, setMinSentiment] = useState(0.2); // default same as backend

  const LIMIT = 16;
  const searchTimer = useRef(null);

  const fetchPage = useCallback(
    async (p = 1, replace = false) => {
      const min = priceFilter?.min ?? "";
      const max = priceFilter?.max ?? "";
      const params = {
        q: search,
        type: typeFilter || "",
        maxPrice: max !== "" ? max : "",
        minRating: ratingFilter?.val ?? "",
        minSentiment: minSentiment,
      };
      const res = await fetch(SUGGEST_URL(p, LIMIT, params));
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setPages(data.pages || 1);
      setItems(prev => (replace ? data.data : [...prev, ...data.data]));
    },
    [search, typeFilter, priceFilter, ratingFilter, minSentiment]
  );

  // initial + filters (except search which is debounced)
  useEffect(() => {
    (async () => {
      setLoading(true);
      try { await fetchPage(1, true); setPage(1); }
      catch (e) { Alert.alert("Error", e.message); }
      finally { setLoading(false); }
    })();
  }, [fetchPage]);

  // debounced search
  const onSearchChange = (v) => {
    setSearch(v);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      try { await fetchPage(1, true); setPage(1); } catch {}
    }, 350);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await fetchPage(1, true); setPage(1); }
    finally { setRefreshing(false); }
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (loadingMore || loading || page >= pages) return;
    setLoadingMore(true);
    try { const next = page + 1; await fetchPage(next, false); setPage(next); }
    finally { setLoadingMore(false); }
  }, [loadingMore, loading, page, pages, fetchPage]);

  const onCardPress = (item) => navigation.navigate("PropertyDetail", { property: item });

  const renderItem = ({ item, index }) => {
    const img = ensureAbsolute(item?.images?.[0]?.url || item?.images?.[0]);
    const badge = item?.ecoBadge || "Unverified";
    const pal = BADGE_STYLES[badge] || BADGE_STYLES.Unverified;
    const locLabel = getLocationLabel(item);
    const avg = Number(item?.avgRating ?? 0);
    const rc  = Number(item?.reviewCount ?? 0);
    const sa  = typeof item?.sentimentAvg === "number" ? item.sentimentAvg : null;

    return (
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => onCardPress(item)}
        className="rounded-2xl overflow-hidden"
        style={{
          width: "48%",
          marginTop: index < 2 ? 0 : 12,
          backgroundColor: "#fff",
          borderColor: "#eef2f7",
          borderWidth: 1,
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        }}
      >
        <View style={{ position: "relative" }}>
          {img ? (
            <Image source={{ uri: img }} style={{ width: "100%", height: 120 }} resizeMode="cover" />
          ) : (
            <View style={{ width: "100%", height: 120 }} className="bg-gray-100 items-center justify-center">
              <Ionicons name="image-outline" size={18} color="#9ca3af" />
            </View>
          )}

          {/* eco badge chip */}
          <View
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: pal.bg,
              borderColor: pal.border,
              borderWidth: 1,
              borderRadius: 999,
              paddingHorizontal: 8,
              paddingVertical: 4,
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 3,
              shadowOffset: { width: 0, height: 1 },
            }}
          >
            <Ionicons name={pal.icon} size={12} color={pal.text} style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 11, fontWeight: "700", color: pal.text }}>{badge}</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 10, paddingVertical: 8 }}>
          <Text className="text-[14px] font-semibold text-gray-900" numberOfLines={1}>
            {item.title}
          </Text>

          <View className="flex-row items-center mt-1">
            <Ionicons name="location-outline" size={12} color="#6b7280" />
            <Text className="text-[11px] text-gray-600 ml-1" numberOfLines={1}>
              {locLabel}
            </Text>
          </View>

          {/* rating + reviews + sentiment */}
          <View className="flex-row items-center mt-1.5">
            <Stars value={avg} />
            <Text className="text-[11px] text-gray-600 ml-1">
              {avg ? avg.toFixed(1) : "—"}{rc ? ` (${rc})` : ""}
            </Text>
          </View>
          {sa !== null && (
            <Text className="text-[10px] text-emerald-700 mt-0.5">
              Sentiment: {sa.toFixed(2)}
            </Text>
          )}

          <View className="flex-row items-center mt-2">
            <View className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 mr-1.5">
              <Text className="text-indigo-700 text-[10px] font-semibold">{currency(item.rentPrice)}/mo</Text>
            </View>
            <View className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
              <Text className="text-emerald-700 text-[10px] font-semibold">{item.propertyType}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator />
        <Text className="mt-2 text-gray-600">Loading suggestions…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 mt-20 bg-[#f7f9fc]">
      {/* Header */}
      <View className={`${Platform.OS === "android" ? "pt-8" : "pt-12"} pb-3 px-4 bg-white border-b border-gray-100`}>
        <View className="flex-row items-center justify-between mb-2">
          <TouchableOpacity onPress={() => navigation.goBack()} className="px-3 py-2 rounded-xl bg-gray-100 border border-gray-200" activeOpacity={0.9}>
            <Ionicons name="arrow-back" size={18} color="#111827" />
          </TouchableOpacity>
          <Text className="text-lg font-extrabold text-gray-900">Suggested</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search */}
        <View
          className="flex-row items-center"
          style={{
            backgroundColor: "#f1f5f9",
            borderRadius: 14,
            paddingHorizontal: 10,
            paddingVertical: Platform.OS === "android" ? 6 : 8,
            borderWidth: 1,
            borderColor: "#e5e7eb",
          }}
        >
          <Ionicons name="search" size={18} color="#6b7280" />
          <TextInput
            value={search}
            onChangeText={onSearchChange}
            placeholder="Search properties, locations…"
            className="flex-1 ml-2"
            style={{ fontSize: 14 }}
            returnKeyType="search"
          />
          {search ? (
            <TouchableOpacity
              onPress={() => {
                setSearch("");
                fetchPage(1, true).then(() => setPage(1));
              }}
            >
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filters */}
        <View className="mt-2">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 8 }}>
            {/* Types */}
            <Chip label="All Types" active={!typeFilter} onPress={() => setTypeFilter("")} />
            {TYPES.map(t => (
              <Chip key={t} label={t} active={typeFilter === t} onPress={() => setTypeFilter(prev => prev === t ? "" : t)} />
            ))}

            {/* Prices */}
            {PRICES.map(p => (
              <Chip key={p.label} label={p.label} active={priceFilter?.label === p.label} onPress={() => setPriceFilter(p)} />
            ))}

            {/* Ratings */}
            {RATINGS.map(r => (
              <Chip key={r.label} label={r.label} active={ratingFilter?.label === r.label} onPress={() => setRatingFilter(r)} />
            ))}

            {/* Sentiment threshold quick toggles */}
            <Chip label="🙂 Sent≥0.2" active={minSentiment === 0.2} onPress={() => setMinSentiment(0.2)} />
            <Chip label="😄 Sent≥0.4" active={minSentiment === 0.4} onPress={() => setMinSentiment(0.4)} />
            <Chip label="🤩 Sent≥0.6" active={minSentiment === 0.6} onPress={() => setMinSentiment(0.6)} />
          </ScrollView>

          <TouchableOpacity
            onPress={() => fetchPage(1, true).then(() => setPage(1))}
            className="mt-2 px-3 py-2 rounded-xl bg-gray-900 self-start"
            activeOpacity={0.9}
          >
            <Text className="text-white text-[12px] font-semibold">Apply</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Grid */}
      {items.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-600">No suggested properties found.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it._id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 12 }}
          contentContainerStyle={{ paddingTop: 10, paddingBottom: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReachedThreshold={0.3}
          onEndReached={loadMore}
          ListFooterComponent={loadingMore ? (<View className="py-4 items-center"><ActivityIndicator /></View>) : null}
        />
      )}
    </View>
  );
}

/* ---------- Small UI helpers ---------- */
function Chip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="mr-2"
      style={{
        backgroundColor: active ? "#e0e7ff" : "#f3f4f6",
        borderColor: active ? "#c7d2fe" : "#e5e7eb",
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 999,
      }}
      activeOpacity={0.9}
    >
      <Text style={{ fontSize: 12, fontWeight: "700", color: active ? "#3730a3" : "#374151" }}>{label}</Text>
    </TouchableOpacity>
  );
}

function Stars({ value = 0, size = 11 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const empties = 5 - full - (half ? 1 : 0);
  const Icon = ({ name }) => <Ionicons name={name} size={size} color="#f59e0b" />;
  return (
    <View className="flex-row items-center">
      {[...Array(full)].map((_, i) => <Icon key={`f${i}`} name="star" />)}
      {half ? <Icon name="star-half" /> : null}
      {[...Array(empties)].map((_, i) => <Icon key={`e${i}`} name="star-outline" />)}
    </View>
  );
}