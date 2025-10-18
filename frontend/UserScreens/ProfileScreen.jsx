// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   ScrollView,
//   RefreshControl,
//   Animated,
//   Easing,
//   ActivityIndicator,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useState, useRef, useEffect, useCallback } from 'react';
// import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import dp from '../GreenAssets/dp.jpeg';
// // ---- CONFIG ----
// const API_BASE = 'http://10.0.2.2:4000'; // Android emulator
// const GET_USER_URL = `${API_BASE}/UserOperations/getUser`;
// const GREEN = '#3cc172';

// const ProfileScreen = () => {
//   const navigation = useNavigation();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const sidebarAnim = useRef(new Animated.Value(-300)).current;

//   const [profile, setProfile] = useState({
//     uname: '',
//     email: '',
//     number: '',
//     address: '',
//     ecoRating: 0,
//   });

//   // === SIDEBAR TOGGLE ===
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

//   // === SIDEBAR CONTENT (plain View; animation applied in wrapper) ===
//   const Sidebar = () => (
//     <View className="flex-1 pt-14 bg-white">
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
//           }}
//         >
//           <Ionicons name="person" size={20} color={GREEN} />
//           <Text className="ml-3 text-base text-gray-800">Profile</Text>
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

//         <TouchableOpacity
//          className="flex-row items-center py-4"
//          onPress={() => {
//          toggleSidebar();
//           navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
//           }}>
//         <Ionicons name="log-out-outline" size={20} color={GREEN} />
//         <Text className="ml-3 text-base font-semibold text-red-600">Log Out</Text>
//        </TouchableOpacity>

       
//       </View>
//     </View>
//   );

//   // === AUTH/PROFILE ===
//   const handleLogout = useCallback(async () => {
//     try {
//       await AsyncStorage.multiRemove(['auth_token', 'auth_user']);
//     } finally {
//       navigation.reset({ index: 0, routes: [{ name: 'loginScreen' }] });
//     }
//   }, [navigation]);

//   const fetchProfile = useCallback(async () => {
//     setError('');
//     try {
//       const token = await AsyncStorage.getItem('auth_token');
//       if (!token) return handleLogout();

//       const res = await fetch(GET_USER_URL, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const data = await res.json().catch(() => ({}));

//       if (res.status === 401 || res.status === 403) return handleLogout();

//       if (!res.ok || !data?.success) {
//         throw new Error(data?.message || 'Failed to fetch profile.');
//       }

//       const u = data.data || {};
//       setProfile({
//         uname: u.uname || u.name || 'Guest User',
//         email: u.email || '',
//         number: u.number || u.phone || '',
//         address: u.address || '',
//         ecoRating: typeof u.ecoRating === 'number' ? u.ecoRating : 0,
//       });
//     } catch (e) {
//       setError(e.message || 'Network error. Please pull to refresh.');
//     } finally {
//       setIsLoading(false);
//     }
//   }, [handleLogout]);

//   useEffect(() => {
//     fetchProfile();
//   }, [fetchProfile]);

//   useFocusEffect(
//     useCallback(() => {
//       fetchProfile();
//     }, [fetchProfile])
//   );

//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     await fetchProfile();
//     setRefreshing(false);
//   }, [fetchProfile]);

//   // === ECO HELPERS ===
//   const getEcoBadgeColor = () => {
//     if (profile.ecoRating >= 80) return 'bg-green-100 border-green-300';
//     if (profile.ecoRating >= 60) return 'bg-amber-100 border-amber-300';
//     return 'bg-red-100 border-red-300';
//   };
//   const getEcoBadgeText = () => {
//     if (profile.ecoRating >= 80) return 'text-green-800';
//     if (profile.ecoRating >= 60) return 'text-amber-800';
//     return 'text-red-800';
//   };
//   const getEcoLevel = () => {
//     if (profile.ecoRating >= 80) return 'Platinum Eco';
//     if (profile.ecoRating >= 60) return 'Gold Eco';
//     return 'Standard Eco';
//   };

//   // === RENDER ===
//   return (
//     <View className="flex-1 mt-16 bg-white relative">
//       {/* overlay */}
//       {sidebarOpen && (
//         <TouchableOpacity
//           className="absolute inset-0 z-10"
//           activeOpacity={1}
//           onPress={toggleSidebar}
//           style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
//         />
//       )}

//       {/* animated sidebar container */}
//       <Animated.View
//         style={{
//           position: 'absolute',
//           top: 0,
//           left: 0,
//           width: 300,
//           height: '100%',
//           transform: [{ translateX: sidebarAnim }],
//           zIndex: 20,
//           elevation: 8,
//           shadowColor: '#000',
//           shadowOffset: { width: 2, height: 0 },
//           shadowOpacity: 0.12,
//           shadowRadius: 6,
//           backgroundColor: 'white',
//         }}
//       >
//         <Sidebar />
//       </Animated.View>

//       {/* main */}
//       <ScrollView
//         className="flex-1"
//         contentContainerStyle={{ paddingBottom: 24 }}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//       >
//         {/* header */}
//         <View className="flex-row items-center justify-between p-5 border-b border-gray-100">
//           <TouchableOpacity onPress={toggleSidebar} className="p-2">
//             <Ionicons name="menu" size={24} color="#1f2937" />
//           </TouchableOpacity>
//           <Ionicons name="person" size={20} color={GREEN} />
//           <Text className="ml-3 text-base text-gray-800">Profile</Text>

//         </View>

//         {/* loading / error */}
//         {isLoading ? (
//           <View className="mx-5 mt-6 p-6 rounded-xl border border-gray-100 bg-white items-center">
//             <ActivityIndicator />
//             <Text className="text-gray-500 mt-3">Loading profile…</Text>
//           </View>
//         ) : error ? (
//           <View className="mx-5 mt-6 p-4 rounded-xl bg-red-50 border border-red-200">
//             <Text className="text-red-700 text-center">{error}</Text>
//             <TouchableOpacity
//               onPress={fetchProfile}
//               className="mt-3 bg-[#3cc172] py-2 rounded-lg items-center"
//             >
//               <Text className="text-white font-semibold">Retry</Text>
//             </TouchableOpacity>
//           </View>
//         ) : (
//           <>
//             {/* Profile Card */}
//             <View className="bg-white mx-5 mt-6 p-6 rounded-xl shadow-sm border border-gray-100 items-center">
//               <View className="relative mb-4">
//                 <Image
//                   source={dp}
//                   className="w-24 h-24 rounded-full"
//                 />
//                 <TouchableOpacity
//                   className="absolute bottom-0 right-0 bg-[#3cc172] w-8 h-8 rounded-full items-center justify-center"
//                   onPress={() => navigation.navigate('EditProfile')}
//                 >
//                   <Ionicons name="pencil" size={14} color="white" />
//                 </TouchableOpacity>
//               </View>

//               <Text className="text-gray-900 text-xl font-bold mb-1">
//                 {profile.uname || 'Guest User'}
//               </Text>
//               <Text className="text-gray-600 text-base mb-3">
//                 {profile.email || 'No email provided'}
//               </Text>

//               {/* Eco Rating Badge */}
//               <View
//                 className={`flex-row items-center px-4 py-2 rounded-full border mb-3 ${getEcoBadgeColor()}`}
//               >
//                 <Ionicons name="leaf" size={16} color={GREEN} />
//                 <Text className={`ml-2 font-semibold ${getEcoBadgeText()}`}>
//                   {getEcoLevel()} • {profile.ecoRating}%
//                 </Text>
//               </View>

//               {profile.number ? (
//                 <Text className="text-gray-500 text-sm mb-1">
//                   Phone: {profile.number}
//                 </Text>
//               ) : null}
//               {profile.address ? (
//                 <Text className="text-gray-500 text-sm text-center">
//                   Address: {profile.address}
//                 </Text>
//               ) : null}
//             </View>

//             {/* Actions */}
//             <View className="mx-5 mt-6">
//               <Text className="text-gray-900 text-lg font-semibold mb-4">
//                 Quick Actions
//               </Text>
//               <View className="flex-row flex-wrap justify-between">
//                 <TouchableOpacity
//                   className="flex-row items-center bg-gray-50 py-4 px-4 rounded-xl mb-3 w-[48%]"
//                   onPress={() => navigation.navigate('Myproperties')}
//                 >
//                   <Ionicons name="business" size={20} color={GREEN} />
//                   <Text className="text-gray-700 font-medium ml-2 text-sm">
//                     My Apartments
//                   </Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   className="flex-row items-center bg-gray-50 py-4 px-4 rounded-xl mb-3 w-[48%]"
//                   onPress={() => navigation.navigate('AddProperty')}
//                 >
//                   <Ionicons name="calendar" size={20} color={GREEN} />
//                   <Text className="text-gray-700 font-medium ml-2 text-sm">
//                     Sell Property
//                   </Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   className="flex-row items-center bg-gray-50 py-4 px-4 rounded-xl w-[48%]"
//                   onPress={() => navigation.navigate('EcoTipsScreen')}
//                 >
//                   <Ionicons name="bulb" size={20} color={GREEN} />
//                   <Text className="text-gray-700 font-medium ml-2 text-sm">
//                     Eco Tips
//                   </Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   className="flex-row items-center bg-gray-50 py-4 px-4 rounded-xl w-[48%]"
//                   onPress={() => navigation.navigate('LandlordBookings')}
//                 >
//                   <Ionicons name="help-circle" size={20} color={GREEN} />
//                   <Text className="text-gray-700 font-medium ml-2 text-sm">
//                     Bookings
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </View>

//             {/* Stats */}
//             <View className="mx-5 mt-6 bg-green-50 p-5 rounded-xl">
//               <Text className="text-[#3cc172] font-bold text-lg mb-4">
//                 Eco Benefits
//               </Text>
//               <View className="flex-row justify-between">
//                 <View className="items-center">
//                   <Text className="text-[#3cc172] text-2xl font-bold">
//                     {profile.ecoRating}%
//                   </Text>
//                   <Text className="text-gray-600 text-xs text-center">
//                     Current Rating
//                   </Text>
//                 </View>
//                 <View className="items-center">
//                   <Text className="text-[#3cc172] text-2xl font-bold">12%</Text>
//                   <Text className="text-gray-600 text-xs text-center">
//                     Rent Discount
//                   </Text>
//                 </View>
//                 <View className="items-center">
//                   <Text className="text-[#3cc172] text-2xl font-bold">8</Text>
//                   <Text className="text-gray-600 text-xs text-center">
//                     Eco Points
//                   </Text>
//                 </View>
//                 <View className="items-center">
//                   <Text className="text-[#3cc172] text-2xl font-bold">4</Text>
//                   <Text className="text-gray-600 text-xs text-center">Badges</Text>
//                 </View>
//               </View>
//             </View>

//             {/* Sign out */}
//             <View className="mx-5 mt-6 mb-8">
//               <TouchableOpacity
//                 className="bg-[#3cc172] py-4 rounded-xl items-center mb-4"
//                 onPress={handleLogout}
//               >
//                 <Text className="text-white font-medium">Sign Out</Text>
//               </TouchableOpacity>
//             </View>
//           </>
//         )}
//       </ScrollView>
//     </View>
//   );
// };

// export default ProfileScreen;


import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Animated,
  Easing,
  ActivityIndicator,
  SafeAreaView,        // ✅ for iOS notch & consistent insets
  StatusBar,          // ✅ unified status bar styling
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dp from '../GreenAssets/dp.jpeg';
import { API_BASE }from '../config/api.js';

// ---- CONFIG (unchanged) ----
// const API_BASE = 'http://10.0.2.2:4000'; // Android emulator
const GET_USER_URL = `${API_BASE}/UserOperations/getUser`;
const GREEN = '#3cc172';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('[API_BASE]', API_BASE); 
  }, []);

  const sidebarAnim = useRef(new Animated.Value(-300)).current;

  // ✅ subtle page entrance animation (UI-only, no logic change)
  const pageFade = useRef(new Animated.Value(0)).current;
  const pageTranslate = useRef(new Animated.Value(12)).current;

  const [profile, setProfile] = useState({
    uname: '',
    email: '',
    number: '',
    address: '',
    ecoRating: 0,
  });

  // === SIDEBAR TOGGLE (unchanged logic) ===
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

  // ✅ gentle entrance on mount (purely visual)
  useEffect(() => {
    Animated.parallel([
      Animated.timing(pageFade, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(pageTranslate, { toValue: 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [pageFade, pageTranslate]);

  // === SIDEBAR CONTENT (presentation only) ===
  const Sidebar = () => (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-14 pb-3 px-5 border-b border-gray-100 flex-row items-center justify-between">
        <Text className="text-xl font-extrabold text-gray-900">Menu</Text>
        <TouchableOpacity
          onPress={toggleSidebar}
          className="p-2 rounded-full bg-gray-100"
          accessibilityRole="button"
          accessibilityLabel="Close menu"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.8}
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
          onPress={() => { toggleSidebar(); }}
          accessibilityRole="button"
        >
          <View className="w-9 h-9 rounded-xl bg-green-50 items-center justify-center">
            <Ionicons name="person" size={18} color={GREEN} />
          </View>
          <Text className="ml-3 text-base text-gray-900">Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center py-4 border-b border-gray-100"
          onPress={() => { toggleSidebar(); navigation.navigate('Contact'); }}
          accessibilityRole="button"
        >
          <View className="w-9 h-9 rounded-xl bg-green-50 items-center justify-center">
            <Ionicons name="document-text" size={18} color={GREEN} />
          </View>
          <Text className="ml-3 text-base text-gray-900">Contact</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center py-4"
          onPress={handleLogout}
          accessibilityRole="button"
        >
          <View className="w-9 h-9 rounded-xl bg-red-50 items-center justify-center">
            <Ionicons name="log-out-outline" size={18} color={GREEN} />
          </View>
          <Text className="ml-3 text-base font-semibold text-red-600">Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // === AUTH/PROFILE (logic unchanged) ===
  const handleLogout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove(['auth_token', 'auth_user']);
    } finally {
      navigation.reset({ index: 0, routes: [{ name: 'loginScreen' }] });
    }
  }, [navigation]);

  const fetchProfile = useCallback(async () => {
    setError('');
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) return handleLogout();

      const res = await fetch(GET_USER_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) return handleLogout();
      if (!res.ok || !data?.success) throw new Error(data?.message || 'Failed to fetch profile.');

      const u = data.data || {};
      setProfile({
        uname: u.uname || u.name || 'Guest User',
        email: u.email || '',
        number: u.number || u.phone || '',
        address: u.address || '',
        ecoRating: typeof u.ecoRating === 'number' ? u.ecoRating : 0,
      });
    } catch (e) {
      setError(e.message || 'Network error. Please pull to refresh.');
    } finally {
      setIsLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  useFocusEffect(useCallback(() => { fetchProfile(); }, [fetchProfile]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  }, [fetchProfile]);

  // === ECO HELPERS (unchanged) ===
  const getEcoBadgeColor = () => {
    if (profile.ecoRating >= 80) return 'bg-green-50 border-green-200';
    if (profile.ecoRating >= 60) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };
  const getEcoBadgeText = () => {
    if (profile.ecoRating >= 80) return 'text-green-800';
    if (profile.ecoRating >= 60) return 'text-amber-800';
    return 'text-red-800';
  };
  const getEcoLevel = () => {
    if (profile.ecoRating >= 80) return 'Platinum Eco';
    if (profile.ecoRating >= 60) return 'Gold Eco';
    return 'Standard Eco';
  };

  // === RENDER ===
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Status bar to match light background */}
      <StatusBar barStyle="dark-content" />

      {/* overlay (tap to close) */}
      {sidebarOpen && (
        <TouchableOpacity
          className="absolute inset-0 z-10"
          activeOpacity={1}
          onPress={toggleSidebar}
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          accessibilityLabel="Close menu overlay"
        />
      )}

      {/* animated sidebar container (unchanged logic, polished shadow) */}
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

      {/* main content with subtle entrance */}
      <Animated.View style={{ flex: 1, opacity: pageFade, transform: [{ translateY: pageTranslate }] }}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* ===== Top App Bar (UI polish, same actions) ===== */}
          <View className="flex-row items-center justify-between px-5 pt-2 pb-3 border-b border-gray-100">
            <TouchableOpacity
              onPress={toggleSidebar}
              className="p-2 rounded-xl bg-gray-50"
              accessibilityRole="button"
              accessibilityLabel="Open menu"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="menu" size={22} color="#111827" />
            </TouchableOpacity>

            <View className="flex-row items-center mt-10">
              <Ionicons name="person-circle" size={22} color={GREEN} />
              <Text className="ml-2 text-lg font-semibold text-gray-900">Profile</Text>
            </View>

            {/* Placeholder for symmetry */}
            <View style={{ width: 38, height: 38 }} />
          </View>

          {/* ===== Loading / Error ===== */}
          {isLoading ? (
            <View className="mx-5 mt-6 p-6 rounded-2xl border border-gray-100 bg-white items-center">
              <ActivityIndicator />
              <Text className="text-gray-600 mt-3">Loading profile…</Text>
            </View>
          ) : error ? (
            <View className="mx-5 mt-6 p-4 rounded-2xl bg-red-50 border border-red-200">
              <Text className="text-red-700 text-center leading-5">{error}</Text>
              <TouchableOpacity
                onPress={fetchProfile}
                className="mt-3 bg-[#3cc172] py-3 rounded-xl items-center"
                accessibilityRole="button"
                accessibilityLabel="Retry loading profile"
              >
                <Text className="text-white font-semibold">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* ===== Profile Card (visual only) ===== */}
              <View
                className="bg-white mx-5 mt-6 p-6 rounded-2xl border border-gray-100"
                style={{
                  elevation: 2,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                }}
              >
                <View className="items-center">
                  <View className="relative mb-4">
                    <Image source={dp} className="w-24 h-24 rounded-full" />
                    <TouchableOpacity
                      className="absolute bottom-0 right-0 bg-[#3cc172] w-8 h-8 rounded-full items-center justify-center"
                      onPress={() => navigation.navigate('EditProfile')}
                      accessibilityRole="button"
                      accessibilityLabel="Edit profile"
                      activeOpacity={0.85}
                    >
                      <Ionicons name="pencil" size={14} color="white" />
                    </TouchableOpacity>
                  </View>

                  <Text className="text-gray-900 text-2xl font-extrabold mb-1">
                    {profile.uname || 'Guest User'}
                  </Text>
                  <Text className="text-gray-600 text-sm mb-3">
                    {profile.email || 'No email provided'}
                  </Text>

                  {/* Eco Rating Badge */}
                  <View className={`flex-row items-center px-4 py-2 rounded-full border ${getEcoBadgeColor()}`}>
                    <Ionicons name="leaf" size={16} color={GREEN} />
                    <Text className={`ml-2 font-semibold ${getEcoBadgeText()}`}>
                      {getEcoLevel()} • {profile.ecoRating}%
                    </Text>
                  </View>
                </View>

                {/* Contact details */}
                <View className="mt-5 border-t border-gray-100 pt-4">
                  {profile.number ? (
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="call" size={16} color="#64748b" />
                      <Text className="text-gray-700 text-sm ml-2">Phone: {profile.number}</Text>
                    </View>
                  ) : null}
                  {profile.address ? (
                    <View className="flex-row items-center">
                      <Ionicons name="location" size={16} color="#64748b" />
                      <Text className="text-gray-700 text-sm ml-2 flex-1">{profile.address}</Text>
                    </View>
                  ) : null}
                </View>
              </View>

              {/* ===== Quick Actions (consistent cards) ===== */}
              <View className="mx-5 mt-7">
                <Text className="text-gray-900 text-lg font-semibold mb-4">Quick Actions</Text>

                <View className="flex-row flex-wrap justify-between">
                  <TouchableOpacity
                    className="flex-row items-center bg-gray-50 py-4 px-4 rounded-2xl mb-3 w-[48%] border border-gray-100"
                    onPress={() => navigation.navigate('Myproperties')}
                    accessibilityRole="button"
                  >
                    <View className="w-10 h-10 rounded-xl bg-white border border-gray-100 items-center justify-center">
                      <Ionicons name="business" size={18} color={GREEN} />
                    </View>
                    <Text className="text-gray-800 font-medium ml-3 text-sm">My Apartments</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-row items-center bg-gray-50 py-4 px-4 rounded-2xl mb-3 w-[48%] border border-gray-100"
                    onPress={() => navigation.navigate('AddProperty')}
                    accessibilityRole="button"
                  >
                    <View className="w-10 h-10 rounded-xl bg-white border border-gray-100 items-center justify-center">
                      <Ionicons name="calendar" size={18} color={GREEN} />
                    </View>
                    <Text className="text-gray-800 font-medium ml-3 text-sm">Sell Property</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-row items-center bg-gray-50 py-4 px-4 rounded-2xl mb-3 w-[48%] border border-gray-100"
                    onPress={() => navigation.navigate('EcoTipsScreen')}
                    accessibilityRole="button"
                  >
                    <View className="w-10 h-10 rounded-xl bg-white border border-gray-100 items-center justify-center">
                      <Ionicons name="bulb" size={18} color={GREEN} />
                    </View>
                    <Text className="text-gray-800 font-medium ml-3 text-sm">Eco Tips</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-row items-center bg-gray-50 py-4 px-4 rounded-2xl mb-3 w-[48%] border border-gray-100"
                    onPress={() => navigation.navigate('MyBookings')}
                    accessibilityRole="button"
                  >
                    <View className="w-10 h-10 rounded-xl bg-white border border-gray-100 items-center justify-center">
                    <Ionicons name="bookmark" size={24} color={GREEN} />
                    </View>
                    <Text className="text-gray-800 font-medium ml-3 text-sm">MyBookings</Text>
                  </TouchableOpacity>


                  <TouchableOpacity
                    className="flex-row items-center bg-gray-50 py-4 px-4 rounded-2xl mb-3 w-[48%] border border-gray-100"
                    onPress={() => navigation.navigate('LandlordBookings')}
                    accessibilityRole="button"
                  >
                    <View className="w-10 h-10 rounded-xl bg-white border border-gray-100 items-center justify-center">
                    <Ionicons name="calendar" size={24} color={GREEN} />
                    </View>
                    <Text className="text-gray-800 font-medium ml-3 text-sm">Requests</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-row items-center bg-gray-50 py-4 px-4 rounded-2xl mb-3 w-[48%] border border-gray-100"
                    onPress={() => navigation.navigate('LandlordBookings')}
                    accessibilityRole="button"
                  >
                    <View className="w-10 h-10 rounded-xl bg-white border border-gray-100 items-center justify-center">
                    <Ionicons name="mail" size={24} color={GREEN} />
                    </View>
                    <Text className="text-gray-800 font-medium ml-3 text-sm">Inbox</Text>
                  </TouchableOpacity>


                </View>
              </View>

              {/* ===== Stats banner ===== */}
              <View
                className="mx-5 mt-7 p-5 rounded-2xl border border-green-100"
                style={{ backgroundColor: '#F0FDF4' /* green-50 */ }}
              >
                <Text className="text-[#16a34a] font-bold text-lg mb-4">Eco Benefits</Text>
                <View className="flex-row justify-between">
                  <View className="items-center">
                    <Text className="text-[#16a34a] text-2xl font-extrabold">{profile.ecoRating}%</Text>
                    <Text className="text-gray-600 text-xs text-center mt-1">Current Rating</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-[#16a34a] text-2xl font-extrabold">12%</Text>
                    <Text className="text-gray-600 text-xs text-center mt-1">Rent Discount</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-[#16a34a] text-2xl font-extrabold">8</Text>
                    <Text className="text-gray-600 text-xs text-center mt-1">Eco Points</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-[#16a34a] text-2xl font-extrabold">4</Text>
                    <Text className="text-gray-600 text-xs text-center mt-1">Badges</Text>
                  </View>
                </View>
              </View>

              {/* ===== Sign out (unchanged logic, polished UI) ===== */}
              <View className="mx-5 mt-7 mb-10">
                <TouchableOpacity
                  className="bg-[#3cc172] py-4 rounded-2xl items-center"
                  onPress={handleLogout}
                  accessibilityRole="button"
                  accessibilityLabel="Sign out"
                >
                  <Text className="text-white font-semibold">Sign Out</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

export default ProfileScreen;