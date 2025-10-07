// import React, { useState, useRef } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   Animated,
//   Easing,
//   Platform,
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

//   const toggleSidebar = () => {
//     if (sidebarOpen) {
//       Animated.timing(sidebarAnim, {
//         toValue: -300,
//         duration: 300,
//         easing: Easing.out(Easing.ease),
//         useNativeDriver: true,
//       }).start(() => setSidebarOpen(false));
//     } else {
//       setSidebarOpen(true);
//       Animated.timing(sidebarAnim, {
//         toValue: 0,
//         duration: 300,
//         easing: Easing.out(Easing.ease),
//         useNativeDriver: true,
//       }).start();
//     }
//   };

//   const Sidebar = () => (
//     <View className="flex-1 mt-10 pt-14 bg-white">
//       {/* Close */}
//       <TouchableOpacity
//         onPress={toggleSidebar}
//         className="absolute right-4 top-4 p-2 rounded-full bg-gray-100"
//         activeOpacity={0.8}
//       >
//         <Ionicons name="close" size={22} color="#111827" />
//       </TouchableOpacity>

//       <View className="px-5">
//         <Text className="text-2xl font-bold text-gray-900 mb-6">Menu</Text>

//         <TouchableOpacity
//           className="flex-row items-center py-4 border-b border-gray-100"
//           onPress={() => {
//             toggleSidebar();
//             navigation.navigate('Home');
//           }}
//         >
//           <Ionicons name="home" size={20} color={GREEN} />
//           <Text className="ml-3 text-base text-gray-800">Home</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           className="flex-row items-center py-4 border-b border-gray-100"
//           onPress={() => {
//             toggleSidebar();
//             navigation.navigate('ProfileScreen');
//           }}
//         >
//           <Ionicons name="person" size={20} color={GREEN} />
//           <Text className="ml-3 text-base text-gray-800">Profile</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           className="flex-row items-center py-4 border-b border-gray-100"
//           onPress={() => {
//             toggleSidebar();
//             navigation.navigate('EcoTipsScreen');
//           }}
//         >
//           <Ionicons name="leaf" size={20} color={GREEN} />
//           <Text className="ml-3 text-base text-gray-800">Eco Tips</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           className="flex-row items-center py-4 border-b border-gray-100"
//           onPress={() => {
//             toggleSidebar();
//             navigation.navigate('Contact');
//           }}
//         >
//           <Ionicons name="document-text" size={20} color={GREEN} />
//           <Text className="ml-3 text-base text-gray-800">Contact</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   return (
//     <View className={`${Platform.OS === 'android' ? 'pt-8' : ''} flex-1 bg-white`}>
//       <StatusBar style="dark" />

//       {/* Dim overlay */}
//       {sidebarOpen && (
//         <TouchableOpacity
//           activeOpacity={1}
//           onPress={toggleSidebar}
//           className="absolute inset-0 bg-black/30 z-10"
//         />
//       )}

//       {/* Sliding sidebar */}
//       <Animated.View
//         style={{
//           position: 'absolute',
//           top: 0,
//           left: 0,
//           width: 300,
//           height: '100%',
//           transform: [{ translateX: sidebarAnim }],
//           zIndex: 20,
//           elevation: 6,
//           shadowColor: '#000',
//           shadowOffset: { width: 2, height: 0 },
//           shadowOpacity: 0.12,
//           shadowRadius: 6,
//           backgroundColor: 'white',
//         }}
//       >
//         <Sidebar />
//       </Animated.View>

//       {/* Content */}
//       <ScrollView
//         className="flex-1"
//         contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28 }}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Top bar */}
//         <View className="flex-row items-center mt-10 justify-between py-5">
//           <TouchableOpacity onPress={toggleSidebar} className="p-2 rounded-xl bg-gray-50">
//             <Ionicons name="menu" size={24} color="#111827" />
//           </TouchableOpacity>

//           <Text className="text-2xl font-bold text-gray-900">Green Rent</Text>

//           {/* Spacer */}
//           <View style={{ width: 40 }} />
//         </View>

//         {/* Banner */}
//         <View className="mb-4">
//           <Banner />
//         </View>

//         {/* Quick Actions */}
//         <View className="flex-row flex-wrap justify-between mb-4">
//           {/* Apartments -> PropertyList (fetches all from backend) */}
//           <TouchableOpacity
//             className="flex-row items-center bg-gray-50 py-4 px-4 rounded-2xl mb-3 w-[48%] border border-gray-200"
//             onPress={() => navigation.navigate('PropertyList')}
//             activeOpacity={0.9}
//           >
//             <Ionicons name="business" size={22} color={GREEN} />
//             <Text className="ml-2 text-[15px] font-semibold text-gray-900">Apartments</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             className="flex-row items-center bg-gray-50 py-4 px-4 rounded-2xl mb-3 w-[48%] border border-gray-200"
//             onPress={() => navigation.navigate('SuggestApartments')}
//             activeOpacity={0.9}
//           >
//             <Ionicons name="business-outline" size={22} color={GREEN} />
//             <Text className="ml-2 text-[15px] font-semibold text-gray-900">Near</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             className="flex-row items-center bg-gray-50 py-4 px-4 rounded-2xl mb-3 w-[48%] border border-gray-200"
//             onPress={() => navigation.navigate('AppTipsScreen')}
//             activeOpacity={0.9}
//           >
//            <Ionicons name="bulb-outline" size={22} color={GREEN} />
//             <Text className="ml-2 text-[15px] font-semibold text-gray-900">App Tips</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             className="flex-row items-center bg-gray-50 py-4 px-4 rounded-2xl mb-3 w-[48%] border border-gray-200"
//             onPress={() => navigation.navigate('ApartmentSuggestions')}
//             activeOpacity={0.9}
//           >
//             <Ionicons name="document-text" size={22} color={GREEN} />
//             <Text className="ml-2 text-[15px] font-semibold text-gray-900">Near</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Section header */}
//         <View className="px-1 py-5">
//           <Text className="text-2xl font-bold text-gray-900">Latest</Text>
//           <View className="h-1.5 w-14 mt-2 rounded bg-[#3cc172]" />
//         </View>

//         <View className="mb-4">
//           <Banners />
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Platform,
  SafeAreaView, // ✅ added for proper insets
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Banner from './Banner';
import Banners from './Banners';

const GREEN = '#3cc172';

export default function Home() {
  const navigation = useNavigation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarAnim = useRef(new Animated.Value(-300)).current;

  // ✅ subtle page entrance (UI-only; no logic change)
  const pageFade = useRef(new Animated.Value(0)).current;
  const pageTranslate = useRef(new Animated.Value(10)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(pageFade, { toValue: 1, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(pageTranslate, { toValue: 0, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [pageFade, pageTranslate]);

  const toggleSidebar = () => {
    if (sidebarOpen) {
      Animated.timing(sidebarAnim, {
        toValue: -300,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => setSidebarOpen(false));
    } else {
      setSidebarOpen(true);
      Animated.spring(sidebarAnim, {
        toValue: 0,
        damping: 18,
        stiffness: 180,
        mass: 0.9,
        useNativeDriver: true,
      }).start();
    }
  };

  // ===== Sidebar (visual tweaks only) =====
  const Sidebar = () => (
    <View className="flex-1 bg-white mt-10">
      {/* Header */}
      <View className="pt-14 pb-3 px-5 border-b border-gray-100 flex-row items-center justify-between">
        <Text className="text-xl font-extrabold text-gray-900">Menu</Text>
        <TouchableOpacity
          onPress={toggleSidebar}
          className="p-2 rounded-full bg-gray-100"
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Close menu"
        >
          <Ionicons name="close" size={22} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Items */}
      <View className="px-5">
        <TouchableOpacity
          className="flex-row items-center py-4 border-b border-gray-100"
          onPress={() => { toggleSidebar(); navigation.navigate('Home'); }}
          accessibilityRole="button"
        >
          <View className="w-9 h-9 rounded-xl bg-green-50 items-center justify-center">
            <Ionicons name="home" size={18} color={GREEN} />
          </View>
          <Text className="ml-3 text-base text-gray-900">Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center py-4 border-b border-gray-100"
          onPress={() => { toggleSidebar(); navigation.navigate('ProfileScreen'); }}
          accessibilityRole="button"
        >
          <View className="w-9 h-9 rounded-xl bg-green-50 items-center justify-center">
            <Ionicons name="person" size={18} color={GREEN} />
          </View>
          <Text className="ml-3 text-base text-gray-900">Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center py-4 border-b border-gray-100"
          onPress={() => { toggleSidebar(); navigation.navigate('EcoTipsScreen'); }}
          accessibilityRole="button"
        >
          <View className="w-9 h-9 rounded-xl bg-green-50 items-center justify-center">
            <Ionicons name="leaf" size={18} color={GREEN} />
          </View>
          <Text className="ml-3 text-base text-gray-900">Eco Tips</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center py-4"
          onPress={() => { toggleSidebar(); navigation.navigate('Contact'); }}
          accessibilityRole="button"
        >
          <View className="w-9 h-9 rounded-xl bg-green-50 items-center justify-center">
            <Ionicons name="document-text" size={18} color={GREEN} />
          </View>
          <Text className="ml-3 text-base text-gray-900">Contact</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className={`${Platform.OS === 'android' ? 'pt-2' : ''} flex-1 bg-white`}>
      <StatusBar style="dark" />

      {/* Dim overlay */}
      {sidebarOpen && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={toggleSidebar}
          className="absolute inset-0 bg-black/45 z-10"
          accessibilityLabel="Close menu overlay"
        />
      )}

      {/* Sliding sidebar (shadow & border polish) */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 300,
          height: '100%',
          transform: [{ translateX: sidebarAnim }],
          zIndex: 20,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 2, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          backgroundColor: 'white',
          borderRightWidth: 1,
          borderRightColor: '#F1F5F9',
        }}
      >
        <Sidebar />
      </Animated.View>

      {/* Content */}
      <Animated.View style={{ flex: 1, opacity: pageFade, transform: [{ translateY: pageTranslate }] }}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Top bar (balanced alignment) */}
          <View className="flex-row items-center justify-between py-4 mt-10">
            <TouchableOpacity
              onPress={toggleSidebar}
              className="p-2 rounded-xl bg-gray-50"
              accessibilityRole="button"
              accessibilityLabel="Open menu"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="menu" size={22} color="#111827" />
            </TouchableOpacity>

            <View className="items-center mt-10">
              <Text className="text-[22px] font-extrabold text-gray-900">Green Rent</Text>
              <View className="h-1 w-10 mt-1 rounded bg-[#3cc172]" />
            </View>

            {/* spacer for symmetry */}
            <View style={{ width: 38, height: 38 }} />
          </View>

          {/* Banner */}
          <View className="mb-5">
            <Banner />
          </View>

          {/* Quick Actions (consistent cards) */}
          {/* <View className="flex-row flex-wrap justify-between mb-2">
            <TouchableOpacity
              className="flex-row items-center bg-gray-50 py-4 px-4 rounded-2xl mb-3 w-[48%] border border-gray-200"
              onPress={() => navigation.navigate('PropertyList')}
              activeOpacity={0.9}
              accessibilityRole="button"
              accessibilityLabel="Open apartments list"
            >
              <View className="w-10 h-10 rounded-xl bg-white border border-gray-100 items-center justify-center">
                <Ionicons name="business" size={18} color={GREEN} />
              </View>
              <Text className="ml-3 text-[15px] font-semibold text-gray-900">Apartments</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center bg-gray-50 py-4 px-4 rounded-2xl mb-3 w-[48%] border border-gray-200"
              onPress={() => navigation.navigate('SuggestApartments')}
              activeOpacity={0.9}
              accessibilityRole="button"
              accessibilityLabel="Find nearby apartments"
            >
              <View className="w-10 h-10 rounded-xl bg-white border border-gray-100 items-center justify-center">
                <Ionicons name="business-outline" size={18} color={GREEN} />
              </View>
              <Text className="ml-3 text-[15px] font-semibold text-gray-900">rating</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center bg-gray-50 py-4 px-4 rounded-2xl mb-3 w-[48%] border border-gray-200"
              onPress={() => navigation.navigate('AppTipsScreen')}
              activeOpacity={0.9}
              accessibilityRole="button"
              accessibilityLabel="Open app tips"
            >
              <View className="w-10 h-10 rounded-xl bg-white border border-gray-100 items-center justify-center">
                <Ionicons name="bulb-outline" size={18} color={GREEN} />
              </View>
              <Text className="ml-3 text-[15px] font-semibold text-gray-900">App Tips</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center bg-gray-50 py-4 px-4 rounded-2xl mb-1 w-[48%] border border-gray-200"
              onPress={() => navigation.navigate('ApartmentSuggestions')}
              activeOpacity={0.9}
              accessibilityRole="button"
              accessibilityLabel="Open suggestions"
            >
              <View className="w-10 h-10 rounded-xl bg-white border border-gray-100 items-center justify-center">
                <Ionicons name="document-text" size={18} color={GREEN} />
              </View>
              <Text className="ml-3 text-[15px] font-semibold text-gray-900">Near</Text>
            </TouchableOpacity>
          </View> */}
                                              {/* Quick Actions — compact & professional layout */}
<View className="flex-row flex-wrap justify-between mb-4">
  {[
    {
      title: "Apartments",
      subtitle: "All listings",
      icon: "business",
      screen: "PropertyList",
      tint: "#ECFDF5", // light green
    },
    {
      title: "Rating",
      subtitle: "Top rated",
      icon: "star-outline",
      screen: "SuggestApartments",
      tint: "#ECFDF5",
    },
    {
      title: "App Tips",
      subtitle: "Smart guides",
      icon: "bulb-outline",
      screen: "AppTipsScreen",
      tint: "#ECFDF5",
    },
    {
      title: "Nearby",
      subtitle: "Close to you",
      icon: "location-outline",
      screen: "ApartmentSuggestions",
      tint: "#ECFDF5",
    },
  ].map((btn, idx) => (
    <TouchableOpacity
      key={idx}
      onPress={() => navigation.navigate(btn.screen)}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={btn.title}
      className="w-[47%] mb-3"
    >
      <View
        className="flex-col items-center justify-center p-4 rounded-2xl bg-white border border-gray-100"
        style={{
          height: 110,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: 2,
        }}
      >
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mb-2"
          style={{ backgroundColor: btn.tint }}
        >
          <Ionicons name={btn.icon} size={18} color={GREEN} />
        </View>

        <Text className="text-[14px] font-semibold text-gray-900 text-center">
          {btn.title}
        </Text>
        <Text className="text-[10px] text-gray-500 text-center mt-0.5">
          {btn.subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  ))}
</View>
          

          {/* Section header */}
          <View className="px-1 py-5">
            <Text className="text-2xl font-extrabold text-gray-900">Latest</Text>
            <View className="h-1.5 w-14 mt-2 rounded bg-[#3cc172]" />
          </View>

          {/* Secondary banners */}
          <View className="mb-4">
            <Banners />
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}