import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View, Text, FlatList, Image, TouchableOpacity, TextInput,
  ActivityIndicator, RefreshControl, Alert, Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { API_BASE }from '../config/api.js';

// const API_BASE = Platform.OS === "ios" ? "http://localhost:4000" : "http://10.0.2.2:4000";

// Uses the reviews-driven suggest endpoint
const SUGGEST_URL = (page, limit, params = {}) => {
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
  Platinum:   { bg: "#e0f2fe", text: "#0369a1", icon: "diamond-outline",     border: "#bae6fd" },
  Gold:       { bg: "#fef3c7", text: "#92400e", icon: "trophy-outline",      border: "#fde68a" },
  Silver:     { bg: "#f8fafc", text: "#475569", icon: "medal-outline",       border: "#cbd5e1" },
  Bronze:     { bg: "#fff7ed", text: "#9a3412", icon: "ribbon-outline",      border: "#fed7aa" },
  Unverified: { bg: "#f3f4f6", text: "#6b7280", icon: "alert-circle-outline", border: "#e5e7eb" },
};

// Filter chip options
const SENTIMENT = [
  { label: "🙂 Sent≥0.2", val: 0.2 },
  { label: "😄 Sent≥0.4", val: 0.4 },
  { label: "🤩 Sent≥0.6", val: 0.6 },
];

const RATINGS = [
  { label: "All ratings", val: "" },
  { label: "≥ 4.0", val: 4 },
  { label: "≥ 3.0", val: 3 },
];

const REVIEWS = [
  { label: "All reviews", val: 0 },
  { label: "≥ 5 reviews", val: 5 },
  { label: "≥ 10 reviews", val: 10 },
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

  // sentiment + review filters + search (all server-side now)
  const [search, setSearch] = useState("");
  const [minSentiment, setMinSentiment] = useState(0.2);
  const [minRating, setMinRating]       = useState("");
  const [minReviews, setMinReviews]     = useState(0);

  const LIMIT = 16;
  const searchTimer = useRef(null);

  useEffect(() => {
    console.log("[API_BASE]", API_BASE);
  }, []);

  const fetchPage = useCallback(
    async (p = 1, replace = false) => {
      const params = {
        q: search,
        minSentiment,
        ...(minRating !== "" ? { minRating } : {}),
        ...(minReviews ? { minReviews } : {}),
      };

      const res = await fetch(SUGGEST_URL(p, LIMIT, params));
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();

      setPages(data.pages || 1);
      const pageItems = data.data || [];
      setItems(prev => (replace ? pageItems : [...prev, ...pageItems]));
    },
    [search, minSentiment, minRating, minReviews]
  );

  // initial + filter changes (debounce handled for search)
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        setItems([]);
        await fetchPage(1, true);
        setPage(1);
      } catch (e) {
        Alert.alert("Error", e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchPage]);

  // debounced search
  const onSearchChange = (v) => {
    setSearch(v);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      try {
        setItems([]);
        await fetchPage(1, true);
        setPage(1);
      } catch {}
    }, 350);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setItems([]);
      await fetchPage(1, true);
      setPage(1);
    } finally {
      setRefreshing(false);
    }
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (loadingMore || loading || page >= pages) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      await fetchPage(next, false);
      setPage(next);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, loading, page, pages, fetchPage]);

  const onCardPress = (item) => navigation.navigate("PropertyDetail", { property: item });

  const sentimentLabel = (s) => {
    if (typeof s !== "number") return "—";
    if (s > 0.25) return "Positive";
    if (s < -0.25) return "Negative";
    return "Neutral";
  };

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
          marginTop: index < 2 ? 10 : 12,          // tighter top row
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
            <Image source={{ uri: img }} style={{ width: "100%", height: 126, backgroundColor: "#f3f4f6" }} resizeMode="cover" />
          ) : (
            <View style={{ width: "100%", height: 126 }} className="bg-gray-100 items-center justify-center">
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

          {/* concise location */}
          <View className="flex-row items-center mt-1">
            <Ionicons name="location-outline" size={12} color="#6b7280" />
            <Text className="text-[11px] text-gray-600 ml-1" numberOfLines={1}>
              {locLabel}
            </Text>
          </View>

          {/* customer comments summary (reviews + sentiment) */}
          <View className="mt-1.5">
            <View className="flex-row items-center">
              <Stars value={avg} />
              <Text className="text-[11px] text-gray-600 ml-1">
                {avg ? avg.toFixed(1) : "—"}{rc ? ` (${rc})` : ""}
              </Text>
            </View>
            {sa !== null && (
              <Text className="text-[10px] text-emerald-700 mt-0.5">
                Customer sentiment: {sentimentLabel(sa)} {`(${sa.toFixed(2)})`}
              </Text>
            )}
          </View>

          {/* price & type */}
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
    <View className="flex-1 mt-0 bg-[#f7f9fc]">
      {/* Header */}
      <View
        className={`${Platform.OS === "android" ? "pt-8" : "pt-12"} pb-3 px-4 bg-white border-b border-gray-100`}
        style={{ paddingBottom: 10 }}
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="rounded-xl"
            style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "#F3F4F6", borderWidth: 1, borderColor: "#E5E7EB" }}
            activeOpacity={0.9}
          >
            <Ionicons name="arrow-back" size={18} color="#111827" />
          </TouchableOpacity>

          <Text className="text-lg font-extrabold text-gray-900">Suggested</Text>

          {/* Spacer to center title */}
          <View style={{ width: 40 }} />
        </View>

        {/* Search */}
        <View
          className="flex-row items-center mt-3"
          style={{
            backgroundColor: "#F8FAFC",
            borderRadius: 14,
            paddingHorizontal: 10,
            paddingVertical: Platform.OS === "android" ? 6 : 8,
            borderWidth: 1,
            borderColor: "#E5E7EB",
          }}
        >
          <Ionicons name="search" size={18} color="#6b7280" />
          <TextInput
            value={search}
            onChangeText={onSearchChange}
            placeholder="Search properties, locations…"
            className="flex-1 ml-2"
            style={{ fontSize: 14, paddingVertical: Platform.OS === "android" ? 2 : 4 }}
            returnKeyType="search"
          />
          {search ? (
            <TouchableOpacity
              onPress={() => {
                setSearch("");
                setItems([]);
                fetchPage(1, true).then(() => setPage(1));
              }}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Sentiment / Rating / Reviews chips */}
        <View
          className="mt-2"
          style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center" }}
        >
          {/* Sentiment */}
          {SENTIMENT.map(opt => (
            <Chip
              key={opt.val}
              label={opt.label}
              active={minSentiment === opt.val}
              onPress={() => setMinSentiment(opt.val)}
            />
          ))}
          {/* Rating */}
          {RATINGS.map(opt => (
            <Chip
              key={opt.label}
              label={opt.label}
              active={minRating === opt.val}
              onPress={() => setMinRating(opt.val)}
            />
          ))}
          {/* Reviews */}
          {REVIEWS.map(opt => (
            <Chip
              key={opt.label}
              label={opt.label}
              active={minReviews === opt.val}
              onPress={() => setMinReviews(opt.val)}
            />
          ))}

          <TouchableOpacity
            disabled={loading}
            onPress={() => { setItems([]); fetchPage(1, true).then(() => setPage(1)); }}
            className="ml-2 px-3 py-2 rounded-xl bg-gray-900"
            activeOpacity={0.9}
          >
            <Text className="text-white text-[12px] font-semibold">{loading ? "Applying…" : "Apply"}</Text>
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
          contentContainerStyle={{ paddingTop: 10, paddingBottom: 18 }}
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
      className="mr-2 mb-2"
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