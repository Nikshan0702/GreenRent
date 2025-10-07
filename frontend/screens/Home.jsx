// import React, { useState, useRef } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   Animated,
//   Easing,
//   Platform,
//   SafeAreaView, // ✅ added for proper insets
// } from 'react-native';
// import { StatusBar } from 'expo-status-bar';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import Banner from './Banner';
// import Banners from './Banners';

// const GREEN = '#3cc172';

// export default function Home() {
//   const navigation = useNavigation();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const sidebarAnim = useRef(new Animated.Value(-300)).current;

//   // ✅ subtle page entrance (UI-only; no logic change)
//   const pageFade = useRef(new Animated.Value(0)).current;
//   const pageTranslate = useRef(new Animated.Value(10)).current;

//   React.useEffect(() => {
//     Animated.parallel([
//       Animated.timing(pageFade, { toValue: 1, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
//       Animated.timing(pageTranslate, { toValue: 0, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
//     ]).start();
//   }, [pageFade, pageTranslate]);

//   const toggleSidebar = () => {
//     if (sidebarOpen) {
//       Animated.timing(sidebarAnim, {
//         toValue: -300,
//         duration: 280,
//         easing: Easing.out(Easing.cubic),
//         useNativeDriver: true,
//       }).start(() => setSidebarOpen(false));
//     } else {
//       setSidebarOpen(true);
//       Animated.spring(sidebarAnim, {
//         toValue: 0,
//         damping: 18,
//         stiffness: 180,
//         mass: 0.9,
//         useNativeDriver: true,
//       }).start();
//     }
//   };

//   // ===== Sidebar (visual tweaks only) =====
//   const Sidebar = () => (
//     <View className="flex-1 bg-white mt-10">
//       {/* Header */}
//       <View className="pt-14 pb-3 px-5 border-b border-gray-100 flex-row items-center justify-between">
//         <Text className="text-xl font-extrabold text-gray-900">Menu</Text>
//         <TouchableOpacity
//           onPress={toggleSidebar}
//           className="p-2 rounded-full bg-gray-100"
//           activeOpacity={0.8}
//           accessibilityRole="button"
//           accessibilityLabel="Close menu"
//         >
//           <Ionicons name="close" size={22} color="#111827" />
//         </TouchableOpacity>
//       </View>

//       {/* Items */}
//       <View className="px-5">
//         <TouchableOpacity
//           className="flex-row items-center py-4 border-b border-gray-100"
//           onPress={() => { toggleSidebar(); navigation.navigate('Home'); }}
//           accessibilityRole="button"
//         >
//           <View className="w-9 h-9 rounded-xl bg-green-50 items-center justify-center">
//             <Ionicons name="home" size={18} color={GREEN} />
//           </View>
//           <Text className="ml-3 text-base text-gray-900">Home</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           className="flex-row items-center py-4 border-b border-gray-100"
//           onPress={() => { toggleSidebar(); navigation.navigate('ProfileScreen'); }}
//           accessibilityRole="button"
//         >
//           <View className="w-9 h-9 rounded-xl bg-green-50 items-center justify-center">
//             <Ionicons name="person" size={18} color={GREEN} />
//           </View>
//           <Text className="ml-3 text-base text-gray-900">Profile</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           className="flex-row items-center py-4 border-b border-gray-100"
//           onPress={() => { toggleSidebar(); navigation.navigate('EcoTipsScreen'); }}
//           accessibilityRole="button"
//         >
//           <View className="w-9 h-9 rounded-xl bg-green-50 items-center justify-center">
//             <Ionicons name="leaf" size={18} color={GREEN} />
//           </View>
//           <Text className="ml-3 text-base text-gray-900">Eco Tips</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           className="flex-row items-center py-4"
//           onPress={() => { toggleSidebar(); navigation.navigate('Contact'); }}
//           accessibilityRole="button"
//         >
//           <View className="w-9 h-9 rounded-xl bg-green-50 items-center justify-center">
//             <Ionicons name="document-text" size={18} color={GREEN} />
//           </View>
//           <Text className="ml-3 text-base text-gray-900">Contact</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   return (
//     <SafeAreaView className={`${Platform.OS === 'android' ? 'pt-2' : ''} flex-1 bg-white`}>
//       <StatusBar style="dark" />

//       {/* Dim overlay */}
//       {sidebarOpen && (
//         <TouchableOpacity
//           activeOpacity={1}
//           onPress={toggleSidebar}
//           className="absolute inset-0 bg-black/45 z-10"
//           accessibilityLabel="Close menu overlay"
//         />
//       )}

//       {/* Sliding sidebar (shadow & border polish) */}
//       <Animated.View
//         style={{
//           position: 'absolute',
//           top: 0,
//           left: 0,
//           width: 300,
//           height: '100%',
//           transform: [{ translateX: sidebarAnim }],
//           zIndex: 20,
//           elevation: 10,
//           shadowColor: '#000',
//           shadowOffset: { width: 2, height: 2 },
//           shadowOpacity: 0.15,
//           shadowRadius: 12,
//           backgroundColor: 'white',
//           borderRightWidth: 1,
//           borderRightColor: '#F1F5F9',
//         }}
//       >
//         <Sidebar />
//       </Animated.View>

//       {/* Content */}
//       <Animated.View style={{ flex: 1, opacity: pageFade, transform: [{ translateY: pageTranslate }] }}>
//         <ScrollView
//           className="flex-1"
//           contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28 }}
//           showsVerticalScrollIndicator={false}
//         >
//           {/* Top bar (balanced alignment) */}
//           <View className="flex-row items-center justify-between py-4 mt-5">
//             <TouchableOpacity
//               onPress={toggleSidebar}
//               className="p-2 rounded-xl bg-gray-50"
//               accessibilityRole="button"
//               accessibilityLabel="Open menu"
//               hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//             >
//               <Ionicons name="menu" size={22} color="#111827" />
//             </TouchableOpacity>

//             <View className="items-center mt-10">
//               <Text className="text-[22px] font-extrabold text-gray-900">Green Rent</Text>
//               <View className="h-1 w-10 mt-1 rounded bg-[#3cc172]" />
//             </View>

//             {/* spacer for symmetry */}
//             <View style={{ width: 38, height: 38 }} />
//           </View>

//           {/* Banner */}
//           <View className="mb-5">
//             <Banner />
//           </View>

//           {/* Quick Actions (consistent cards) */}
//           {/* <View className="flex-row flex-wrap justify-between mb-2">
//             <TouchableOpacity
//               className="flex-row items-center bg-gray-50 py-4 px-4 rounded-2xl mb-3 w-[48%] border border-gray-200"
//               onPress={() => navigation.navigate('PropertyList')}
//               activeOpacity={0.9}
//               accessibilityRole="button"
//               accessibilityLabel="Open apartments list"
//             >
//               <View className="w-10 h-10 rounded-xl bg-white border border-gray-100 items-center justify-center">
//                 <Ionicons name="business" size={18} color={GREEN} />
//               </View>
//               <Text className="ml-3 text-[15px] font-semibold text-gray-900">Apartments</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               className="flex-row items-center bg-gray-50 py-4 px-4 rounded-2xl mb-3 w-[48%] border border-gray-200"
//               onPress={() => navigation.navigate('SuggestApartments')}
//               activeOpacity={0.9}
//               accessibilityRole="button"
//               accessibilityLabel="Find nearby apartments"
//             >
//               <View className="w-10 h-10 rounded-xl bg-white border border-gray-100 items-center justify-center">
//                 <Ionicons name="business-outline" size={18} color={GREEN} />
//               </View>
//               <Text className="ml-3 text-[15px] font-semibold text-gray-900">rating</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               className="flex-row items-center bg-gray-50 py-4 px-4 rounded-2xl mb-3 w-[48%] border border-gray-200"
//               onPress={() => navigation.navigate('AppTipsScreen')}
//               activeOpacity={0.9}
//               accessibilityRole="button"
//               accessibilityLabel="Open app tips"
//             >
//               <View className="w-10 h-10 rounded-xl bg-white border border-gray-100 items-center justify-center">
//                 <Ionicons name="bulb-outline" size={18} color={GREEN} />
//               </View>
//               <Text className="ml-3 text-[15px] font-semibold text-gray-900">App Tips</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               className="flex-row items-center bg-gray-50 py-4 px-4 rounded-2xl mb-1 w-[48%] border border-gray-200"
//               onPress={() => navigation.navigate('ApartmentSuggestions')}
//               activeOpacity={0.9}
//               accessibilityRole="button"
//               accessibilityLabel="Open suggestions"
//             >
//               <View className="w-10 h-10 rounded-xl bg-white border border-gray-100 items-center justify-center">
//                 <Ionicons name="document-text" size={18} color={GREEN} />
//               </View>
//               <Text className="ml-3 text-[15px] font-semibold text-gray-900">Near</Text>
//             </TouchableOpacity>
//           </View> */}
//                                               {/* Quick Actions — compact & professional layout */}
// <View className="flex-row flex-wrap justify-between mb-4">
//   {[
//     {
//       title: "Apartments",
//       subtitle: "All listings",
//       icon: "business",
//       screen: "PropertyList",
//       tint: "#ECFDF5", // light green
//     },
//     {
//       title: "Rating",
//       subtitle: "Top rated",
//       icon: "star-outline",
//       screen: "SuggestApartments",
//       tint: "#ECFDF5",
//     },
//     {
//       title: "App Tips",
//       subtitle: "Smart guides",
//       icon: "bulb-outline",
//       screen: "AppTipsScreen",
//       tint: "#ECFDF5",
//     },
//     {
//       title: "Nearby",
//       subtitle: "Close to you",
//       icon: "location-outline",
//       screen: "ApartmentSuggestions",
//       tint: "#ECFDF5",
//     },
//   ].map((btn, idx) => (
//     <TouchableOpacity
//       key={idx}
//       onPress={() => navigation.navigate(btn.screen)}
//       activeOpacity={0.9}
//       accessibilityRole="button"
//       accessibilityLabel={btn.title}
//       className="w-[47%] mb-3"
//     >
//       <View
//         className="flex-col items-center justify-center p-4 rounded-2xl bg-white border border-gray-100"
//         style={{
//           height: 110,
//           shadowColor: "#000",
//           shadowOpacity: 0.05,
//           shadowRadius: 8,
//           shadowOffset: { width: 0, height: 3 },
//           elevation: 2,
//         }}
//       >
//         <View
//           className="w-10 h-10 rounded-xl items-center justify-center mb-2"
//           style={{ backgroundColor: btn.tint }}
//         >
//           <Ionicons name={btn.icon} size={18} color={GREEN} />
//         </View>

//         <Text className="text-[14px] font-semibold text-gray-900 text-center">
//           {btn.title}
//         </Text>
//         <Text className="text-[10px] text-gray-500 text-center mt-0.5">
//           {btn.subtitle}
//         </Text>
//       </View>
//     </TouchableOpacity>
//   ))}
// </View>
          

//           {/* Section header */}
//           <View className="px-1 py-5">
//             <Text className="text-2xl font-extrabold text-gray-900">Latest</Text>
//             <View className="h-1.5 w-14 mt-2 rounded bg-[#3cc172]" />
//           </View>

//           {/* Secondary banners */}
//           <View className="mb-4">
//             <Banners />
//           </View>
//         </ScrollView>
//       </Animated.View>
//     </SafeAreaView>
//   );
// }
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
            Green Rent v1.0
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