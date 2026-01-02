
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Banner from './Banner';
import Banners from './Banners';

const GREEN = '#3cc172';
const COLORS = {
  primary: GREEN,
  background: '#ffffff',
  textPrimary: '#111827',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  border: '#f3f4f6',
  borderStrong: '#e5e7eb',
  overlay: 'rgba(0,0,0,0.5)',
  notification: '#ef4444',
};

export default function Home() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // Sidebar settings
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const SIDEBAR_WIDTH = 320;

  const sidebarAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  // Page animation
  const pageFade = useRef(new Animated.Value(0)).current;
  const pageTranslate = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(pageFade, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(pageTranslate, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
    sidebarAnim.setValue(-SIDEBAR_WIDTH);
    overlayAnim.setValue(0);
  }, []);

  const toggleSidebar = () => {
    if (sidebarOpen) {
      Animated.parallel([
        Animated.timing(sidebarAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => setSidebarOpen(false));
    } else {
      setSidebarOpen(true);
      Animated.parallel([
        Animated.spring(sidebarAnim, {
          toValue: 0,
          damping: 20,
          stiffness: 200,
          mass: 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  // Sidebar content
  const Sidebar = () => (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View
        className="pb-5 px-6 border-b"
        style={{ paddingTop: Math.max(insets.top, 16), borderBottomColor: COLORS.border }}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold" style={{ color: COLORS.textPrimary }}>
              Menu
            </Text>
            <Text className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
              Navigation
            </Text>
          </View>
          <TouchableOpacity
            onPress={toggleSidebar}
            className="w-10 h-10 rounded-xl items-center justify-center bg-gray-50"
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Items */}
      <View className="px-4 mt-2">
        {[
          { name: 'Home', icon: 'home', screen: 'Home' },
          { name: 'Profile', icon: 'person', screen: 'ProfileScreen' },
          { name: 'Eco Tips', icon: 'leaf', screen: 'EcoTipsScreen' },
          { name: 'Contact', icon: 'document-text', screen: 'Contact' },
        ].map((item, index) => (
          <TouchableOpacity
            key={item.name}
            className="flex-row items-center py-4 rounded-2xl"
            onPress={() => {
              toggleSidebar();
              navigation.navigate(item.screen);
            }}
            activeOpacity={0.9}
            style={{ marginBottom: index === 3 ? 0 : 4, paddingHorizontal: 12 }}
          >
            <View
              className="w-12 h-12 rounded-xl items-center justify-center"
              style={{ backgroundColor: `${COLORS.primary}15` }}
            >
              <Ionicons name={item.icon} size={20} color={COLORS.primary} />
            </View>
            <View className="ml-4">
              <Text className="text-base font-semibold" style={{ color: COLORS.textPrimary }}>
                {item.name}
              </Text>
              <Text className="text-sm mt-0.5" style={{ color: COLORS.textSecondary }}>
                {item.screen === 'Home' ? 'Dashboard' : `Go to ${item.name}`}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={COLORS.textTertiary}
              style={{ marginLeft: 'auto' }}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer */}
      <View style={{ position: 'absolute', left: 24, right: 24, bottom: Math.max(insets.bottom, 16) }}>
        <View className="p-4 rounded-2xl" style={{ backgroundColor: `${COLORS.primary}08` }}>
          <Text className="text-sm font-medium text-center" style={{ color: COLORS.textSecondary }}>
            Dattreo
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.background }}>
      <StatusBar style="dark" />

      {/* Overlay */}
      <Animated.View
        pointerEvents={sidebarOpen ? 'auto' : 'none'}
        className="absolute inset-0 z-10"
        style={{ backgroundColor: COLORS.overlay, opacity: overlayAnim }}
      >
        <TouchableOpacity activeOpacity={1} onPress={toggleSidebar} className="flex-1" />
      </Animated.View>

      {/* Sliding Sidebar */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: SIDEBAR_WIDTH,
          height: '100%',
          transform: [{ translateX: sidebarAnim }],
          zIndex: 20,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 2, height: 0 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          backgroundColor: 'white',
          borderRightWidth: 1,
          borderRightColor: COLORS.borderStrong,
        }}
      >
        <Sidebar />
      </Animated.View>

      {/* Main Content */}
      <Animated.View
        style={{ flex: 1, opacity: pageFade, transform: [{ translateY: pageTranslate }] }}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 32) }}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bar with Menu + Centered Logo + Right Icons */}
          <View className="px-6 pt-6 pb-2">
            <View className="flex-row items-center justify-between">
              {/* Menu Button */}
              <TouchableOpacity
                onPress={toggleSidebar}
                className="w-12 h-12 rounded-2xl items-center justify-center bg-gray-50"
                accessibilityRole="button"
              >
                <Ionicons name="menu" size={22} color={COLORS.textPrimary} />
              </TouchableOpacity>

              {/* Center Title */}
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold" style={{ color: COLORS.textPrimary }}>
                  Green Rent
                </Text>
                <View
                  className="h-1.5 w-12 mt-2 rounded-full"
                  style={{ backgroundColor: COLORS.primary }}
                />
              </View>

              {/* Right Icons */}
              <View className="flex-row items-center" style={{ gap: 8 }}>
                {/* Notification Icon */}
                <TouchableOpacity
                  onPress={() => navigation.navigate('Notifications')}
                  className="w-12 h-12 rounded-2xl items-center justify-center bg-gray-50 relative"
                  accessibilityRole="button"
                >
                  <Ionicons
                    name="notifications-outline"
                    size={22}
                    color={COLORS.textPrimary}
                  />
                  {/* Red Badge */}
                  <View
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full items-center justify-center border-2 border-white"
                    style={{ backgroundColor: COLORS.notification }}
                  >
                    <Text className="text-[10px] font-bold text-white">3</Text>
                  </View>
                </TouchableOpacity>

                {/* Profile Icon */}
                <TouchableOpacity
                  onPress={() => navigation.navigate('ProfileScreen')}
                  className="w-12 h-12 rounded-2xl items-center justify-center bg-gray-50"
                  accessibilityRole="button"
                >
                  <Ionicons
                    name="person-circle-outline"
                    size={26}
                    color={COLORS.textPrimary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Banner */}
          <View className="px-6 mb-6">
            <Banner />
          </View>

          {/* Hero CTA */}
          <View className="px-6 mb-8">
            <View
              className="rounded-3xl border p-5"
              style={{
                backgroundColor: '#ffffff',
                borderColor: COLORS.border,
                shadowColor: '#000',
                shadowOpacity: 0.06,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 3,
              }}
            >
              <Text className="text-xl font-bold mb-1" style={{ color: COLORS.textPrimary }}>
                Find your next eco‑friendly home
              </Text>
              <Text className="text-sm mb-4" style={{ color: COLORS.textSecondary }}>
                Browse verified listings with sustainability features and ratings.
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('PropertyList')}
                className="py-3 rounded-2xl items-center"
                activeOpacity={0.9}
                style={{ backgroundColor: COLORS.primary }}
              >
                <Text className="text-white font-semibold">Explore Apartments</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Access Section */}
          <View className="px-6 mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-xl font-bold" style={{ color: COLORS.textPrimary }}>
                  Quick Access
                </Text>
                <Text className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
                  Essential features
                </Text>
              </View>
              <View className="h-1 w-8 rounded-full" style={{ backgroundColor: COLORS.primary }} />
            </View>

            <View className="flex-row flex-wrap justify-between">
              {[
                { title: 'Apartments', subtitle: 'All listings', icon: 'business', screen: 'PropertyList' },
                { title: 'Rating', subtitle: 'Top rated', icon: 'star-outline', screen: 'SuggestApartments' },
                { title: 'App Tips', subtitle: 'Smart guides', icon: 'bulb-outline', screen: 'AppTipsScreen' },
                { title: 'Nearby', subtitle: 'Close to you', icon: 'location-outline', screen: 'ApartmentSuggestions' },
              ].map((btn, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => navigation.navigate(btn.screen)}
                  className="w-[48%] mb-4"
                  activeOpacity={0.9}
                >
                  <View
                    className="items-center justify-center p-5 rounded-3xl bg-white border"
                    style={{
                      height: 120,
                      borderColor: COLORS.border,
                      shadowColor: '#000',
                      shadowOpacity: 0.06,
                      shadowRadius: 12,
                      shadowOffset: { width: 0, height: 4 },
                      elevation: 3,
                    }}
                  >
                    <View
                      className="w-12 h-12 rounded-2xl items-center justify-center mb-3"
                      style={{ backgroundColor: '#ECFDF5' }}
                    >
                      <Ionicons name={btn.icon} size={20} color={COLORS.primary} />
                    </View>
                    <Text
                      className="text-[15px] font-semibold text-center"
                      style={{ color: COLORS.textPrimary }}
                    >
                      {btn.title}
                    </Text>
                    <Text
                      className="text-[11px] text-center mt-1"
                      style={{ color: COLORS.textSecondary }}
                    >
                      {btn.subtitle}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Latest Section */}
          <View className="px-6">
            <View className="flex-row items-center justify-between mb-5">
              <View>
                <Text className="text-xl font-bold" style={{ color: COLORS.textPrimary }}>
                  Latest Updates
                </Text>
                <Text className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
                  New listings and features
                </Text>
              </View>
              <View className="h-1.5 w-10 rounded-full" style={{ backgroundColor: COLORS.primary }} />
            </View>

            <View className="mb-2">
              <Banners />
            </View>
          </View>

          <View style={{ height: Math.max(insets.bottom, 24) }} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}