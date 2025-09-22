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

// // ---- CONFIG ----
// const API_BASE = 'http://10.0.2.2:4000'; // Android emulator? use http://10.0.2.2:4000
// const GET_USER_URL = `${API_BASE}/UserOperations/getUser`;

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
//     // add any fields your backend returns
//   });

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
//     <Animated.View className="absolute top-0 left-0 bottom-0 w-72 bg-white z-20 shadow-xl"
//       style={{ transform: [{ translateX: sidebarAnim }] }}
//     >
//       <TouchableOpacity className="absolute top-4 right-4 p-2" onPress={toggleSidebar}>
//         <Ionicons name="close" size={24} color="#1f2937" />
//       </TouchableOpacity>

//       <View className="mt-16 px-6">
//         <Text className="text-[#3cc172] text-2xl font-bold mb-8">EcoRent Menu</Text>

//         <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-100"
//           onPress={() => { toggleSidebar(); navigation.navigate('Home'); }}>
//           <Ionicons name="home" size={20} color="#3cc172" />
//           <Text className="text-gray-800 text-lg ml-3">Home</Text>
//         </TouchableOpacity>

//         <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-100"
//           onPress={() => { toggleSidebar(); }}>
//           <Ionicons name="person" size={20} color="#3cc172" />
//           <Text className="text-gray-800 text-lg ml-3">Profile</Text>
//         </TouchableOpacity>

//         <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-100"
//           onPress={() => { toggleSidebar(); navigation.navigate('AddProperty'); }}>
//           <Ionicons name="business" size={20} color="#3cc172" />
//           <Text className="text-gray-800 text-lg ml-3">Sell</Text>
//         </TouchableOpacity>

//         <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-100"
//           onPress={() => { toggleSidebar(); navigation.navigate('EcoRating'); }}>
//           <Ionicons name="leaf" size={20} color="#3cc172" />
//           <Text className="text-gray-800 text-lg ml-3">Eco Rating</Text>
//         </TouchableOpacity>

//         <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-100"
//           onPress={() => { toggleSidebar(); navigation.navigate('Contact'); }}>
//           <Ionicons name="document-text" size={20} color="#3cc172" />
//           <Text className="text-gray-800 text-lg ml-3">Contact</Text>
//         </TouchableOpacity>
//       </View>
//     </Animated.View>
//   );

//   const handleLogout = useCallback(async () => {
//     try {
//       await AsyncStorage.multiRemove(['auth_token', 'auth_user']);
//     } finally {
//       navigation.reset({
//         index: 0,
//         routes: [{ name: 'loginScreen' }],
//       });
//     }
//   }, [navigation]);

//   const fetchProfile = useCallback(async () => {
//     setError('');
//     try {
//       const token = await AsyncStorage.getItem('auth_token');
//       if (!token) {
//         // No token -> force login
//         return handleLogout();
//       }

//       const res = await fetch(GET_USER_URL, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           // authenticateUser middleware typically reads Bearer token
//           'Authorization': `Bearer ${token}`,
//         },
//       });

//       // If server sends non-JSON errors, guard parsing
//       const data = await res.json().catch(() => ({}));

//       if (res.status === 401 || res.status === 403) {
//         // Token invalid/expired -> logout
//         return handleLogout();
//       }

//       if (!res.ok || !data?.success) {
//         throw new Error(data?.message || 'Failed to fetch profile.');
//       }

//       // data.data is userData with sensitive fields removed (per backend)
//       const u = data.data || {};
//       setProfile({
//         uname: u.uname || u.name || 'Guest User',
//         email: u.email || '',
//         number: u.number || u.phone || '',
//         address: u.address || '',
//         ecoRating: typeof u.ecoRating === 'number' ? u.ecoRating : 0,
//         // add any fields you expose on the backend
//       });
//     } catch (e) {
//       setError(e.message || 'Network error. Please pull to refresh.');
//     } finally {
//       setIsLoading(false);
//     }
//   }, [handleLogout]);

//   // initial load
//   useEffect(() => { fetchProfile(); }, [fetchProfile]);

//   // refresh when screen regains focus
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

//   // eco helpers
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

//   return (
//     <View className="flex-1 mt-14 bg-white">
//       {/* overlay */}
//       {sidebarOpen && (
//         <TouchableOpacity 
//           className="absolute inset-0 bg-black opacity-50 z-10"
//           activeOpacity={1}
//           onPress={toggleSidebar}
//         />
//       )}

//       {/* sidebar */}
//       <Sidebar />

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
//           <Text className="text-gray-900 text-xl font-semibold">My Eco Profile</Text>
//           <TouchableOpacity className="p-2" onPress={() => navigation.navigate('Settings')}>
//             <Ionicons name="settings-outline" size={24} color="#1f2937" />
//           </TouchableOpacity>
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
//                   source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }} 
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
//               <View className={`flex-row items-center px-4 py-2 rounded-full border mb-3 ${getEcoBadgeColor()}`}>
//                 <Ionicons name="leaf" size={16} color="#3cc172" />
//                 <Text className={`ml-2 font-semibold ${getEcoBadgeText()}`}>
//                   {getEcoLevel()} • {profile.ecoRating}%
//                 </Text>
//               </View>

//               {profile.number ? (
//                 <Text className="text-gray-500 text-sm mb-1">Phone: {profile.number}</Text>
//               ) : null}
//               {profile.address ? (
//                 <Text className="text-gray-500 text-sm text-center">Address: {profile.address}</Text>
//               ) : null}
//             </View>

//             {/* Actions */}
//             <View className="mx-5 mt-6">
//               <Text className="text-gray-900 text-lg font-semibold mb-4">Quick Actions</Text>
//               <View className="flex-row flex-wrap justify-between">
//                 <TouchableOpacity 
//                   className="flex-row items-center bg-gray-50 py-4 px-4 rounded-xl mb-3 w-[48%]"
//                   onPress={() => navigation.navigate('MyApartments')}
//                 >
//                   <Ionicons name="business" size={20} color="#3cc172" />
//                   <Text className="text-gray-700 font-medium ml-2 text-sm">My Apartments</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity 
//                   className="flex-row items-center bg-gray-50 py-4 px-4 rounded-xl mb-3 w-[48%]"
//                   onPress={() => navigation.navigate('AddProperty')}
//                 >
//                   <Ionicons name="calendar" size={20} color="#3cc172" />
//                   <Text className="text-gray-700 font-medium ml-2 text-sm">Sell Property</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity 
//                   className="flex-row items-center bg-gray-50 py-4 px-4 rounded-xl w-[48%]"
//                   onPress={() => navigation.navigate('EcoTips')}
//                 >
//                   <Ionicons name="bulb" size={20} color="#3cc172" />
//                   <Text className="text-gray-700 font-medium ml-2 text-sm">Eco Tips</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity 
//                   className="flex-row items-center bg-gray-50 py-4 px-4 rounded-xl w-[48%]"
//                   onPress={() => navigation.navigate('Support')}
//                 >
//                   <Ionicons name="help-circle" size={20} color="#3cc172" />
//                   <Text className="text-gray-700 font-medium ml-2 text-sm">Support</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>

//             {/* Stats */}
//             <View className="mx-5 mt-6 bg-green-50 p-5 rounded-xl">
//               <Text className="text-[#3cc172] font-bold text-lg mb-4">Eco Benefits</Text>
//               <View className="flex-row justify-between">
//                 <View className="items-center">
//                   <Text className="text-[#3cc172] text-2xl font-bold">{profile.ecoRating}%</Text>
//                   <Text className="text-gray-600 text-xs text-center">Current Rating</Text>
//                 </View>
//                 <View className="items-center">
//                   <Text className="text-[#3cc172] text-2xl font-bold">12%</Text>
//                   <Text className="text-gray-600 text-xs text-center">Rent Discount</Text>
//                 </View>
//                 <View className="items-center">
//                   <Text className="text-[#3cc172] text-2xl font-bold">8</Text>
//                   <Text className="text-gray-600 text-xs text-center">Eco Points</Text>
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ---- CONFIG ----
const API_BASE = 'http://10.0.2.2:4000'; // Android emulator
const GET_USER_URL = `${API_BASE}/UserOperations/getUser`;
const GREEN = '#3cc172';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const sidebarAnim = useRef(new Animated.Value(-300)).current;

  const [profile, setProfile] = useState({
    uname: '',
    email: '',
    number: '',
    address: '',
    ecoRating: 0,
  });

  // === SIDEBAR TOGGLE ===
  const toggleSidebar = () => {
    if (sidebarOpen) {
      Animated.timing(sidebarAnim, {
        toValue: -300,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => setSidebarOpen(false));
    } else {
      setSidebarOpen(true);
      Animated.timing(sidebarAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  };

  // === SIDEBAR CONTENT (plain View; animation applied in wrapper) ===
  const Sidebar = () => (
    <View className="flex-1 pt-14 bg-white">
      {/* Close */}
      <TouchableOpacity
        onPress={toggleSidebar}
        className="absolute right-4 top-4 p-2 rounded-full bg-gray-100"
        activeOpacity={0.8}
      >
        <Ionicons name="close" size={22} color="#111827" />
      </TouchableOpacity>

      <View className="px-5">
        <Text className="text-2xl font-bold text-gray-900 mb-6">Menu</Text>

        <TouchableOpacity
          className="flex-row items-center py-4 border-b border-gray-100"
          onPress={() => {
            toggleSidebar();
            navigation.navigate('Home');
          }}
        >
          <Ionicons name="home" size={20} color={GREEN} />
          <Text className="ml-3 text-base text-gray-800">Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center py-4 border-b border-gray-100"
          onPress={() => {
            toggleSidebar();
          }}
        >
          <Ionicons name="person" size={20} color={GREEN} />
          <Text className="ml-3 text-base text-gray-800">Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center py-4 border-b border-gray-100"
          onPress={() => {
            toggleSidebar();
            navigation.navigate('Contact');
          }}
        >
          <Ionicons name="document-text" size={20} color={GREEN} />
          <Text className="ml-3 text-base text-gray-800">Contact</Text>
        </TouchableOpacity>

        <TouchableOpacity
         className="flex-row items-center py-4"
         onPress={() => {
         toggleSidebar();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          }}>
        <Ionicons name="log-out-outline" size={20} color={GREEN} />
        <Text className="ml-3 text-base font-semibold text-red-600">Log Out</Text>
       </TouchableOpacity>

       
      </View>
    </View>
  );

  // === AUTH/PROFILE ===
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) return handleLogout();

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to fetch profile.');
      }

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

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  }, [fetchProfile]);

  // === ECO HELPERS ===
  const getEcoBadgeColor = () => {
    if (profile.ecoRating >= 80) return 'bg-green-100 border-green-300';
    if (profile.ecoRating >= 60) return 'bg-amber-100 border-amber-300';
    return 'bg-red-100 border-red-300';
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
    <View className="flex-1 mt-16 bg-white relative">
      {/* overlay */}
      {sidebarOpen && (
        <TouchableOpacity
          className="absolute inset-0 z-10"
          activeOpacity={1}
          onPress={toggleSidebar}
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        />
      )}

      {/* animated sidebar container */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 300,
          height: '100%',
          transform: [{ translateX: sidebarAnim }],
          zIndex: 20,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 2, height: 0 },
          shadowOpacity: 0.12,
          shadowRadius: 6,
          backgroundColor: 'white',
        }}
      >
        <Sidebar />
      </Animated.View>

      {/* main */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* header */}
        <View className="flex-row items-center justify-between p-5 border-b border-gray-100">
          <TouchableOpacity onPress={toggleSidebar} className="p-2">
            <Ionicons name="menu" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Ionicons name="person" size={20} color={GREEN} />
          <Text className="ml-3 text-base text-gray-800">Profile</Text>

        </View>

        {/* loading / error */}
        {isLoading ? (
          <View className="mx-5 mt-6 p-6 rounded-xl border border-gray-100 bg-white items-center">
            <ActivityIndicator />
            <Text className="text-gray-500 mt-3">Loading profile…</Text>
          </View>
        ) : error ? (
          <View className="mx-5 mt-6 p-4 rounded-xl bg-red-50 border border-red-200">
            <Text className="text-red-700 text-center">{error}</Text>
            <TouchableOpacity
              onPress={fetchProfile}
              className="mt-3 bg-[#3cc172] py-2 rounded-lg items-center"
            >
              <Text className="text-white font-semibold">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Profile Card */}
            <View className="bg-white mx-5 mt-6 p-6 rounded-xl shadow-sm border border-gray-100 items-center">
              <View className="relative mb-4">
                <Image
                  source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
                  className="w-24 h-24 rounded-full"
                />
                <TouchableOpacity
                  className="absolute bottom-0 right-0 bg-[#3cc172] w-8 h-8 rounded-full items-center justify-center"
                  onPress={() => navigation.navigate('EditProfile')}
                >
                  <Ionicons name="pencil" size={14} color="white" />
                </TouchableOpacity>
              </View>

              <Text className="text-gray-900 text-xl font-bold mb-1">
                {profile.uname || 'Guest User'}
              </Text>
              <Text className="text-gray-600 text-base mb-3">
                {profile.email || 'No email provided'}
              </Text>

              {/* Eco Rating Badge */}
              <View
                className={`flex-row items-center px-4 py-2 rounded-full border mb-3 ${getEcoBadgeColor()}`}
              >
                <Ionicons name="leaf" size={16} color={GREEN} />
                <Text className={`ml-2 font-semibold ${getEcoBadgeText()}`}>
                  {getEcoLevel()} • {profile.ecoRating}%
                </Text>
              </View>

              {profile.number ? (
                <Text className="text-gray-500 text-sm mb-1">
                  Phone: {profile.number}
                </Text>
              ) : null}
              {profile.address ? (
                <Text className="text-gray-500 text-sm text-center">
                  Address: {profile.address}
                </Text>
              ) : null}
            </View>

            {/* Actions */}
            <View className="mx-5 mt-6">
              <Text className="text-gray-900 text-lg font-semibold mb-4">
                Quick Actions
              </Text>
              <View className="flex-row flex-wrap justify-between">
                <TouchableOpacity
                  className="flex-row items-center bg-gray-50 py-4 px-4 rounded-xl mb-3 w-[48%]"
                  onPress={() => navigation.navigate('Myproperties')}
                >
                  <Ionicons name="business" size={20} color={GREEN} />
                  <Text className="text-gray-700 font-medium ml-2 text-sm">
                    My Apartments
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center bg-gray-50 py-4 px-4 rounded-xl mb-3 w-[48%]"
                  onPress={() => navigation.navigate('AddProperty')}
                >
                  <Ionicons name="calendar" size={20} color={GREEN} />
                  <Text className="text-gray-700 font-medium ml-2 text-sm">
                    Sell Property
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center bg-gray-50 py-4 px-4 rounded-xl w-[48%]"
                  onPress={() => navigation.navigate('EcoTipsScreen')}
                >
                  <Ionicons name="bulb" size={20} color={GREEN} />
                  <Text className="text-gray-700 font-medium ml-2 text-sm">
                    Eco Tips
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center bg-gray-50 py-4 px-4 rounded-xl w-[48%]"
                  onPress={() => navigation.navigate('Support')}
                >
                  <Ionicons name="help-circle" size={20} color={GREEN} />
                  <Text className="text-gray-700 font-medium ml-2 text-sm">
                    Support
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Stats */}
            <View className="mx-5 mt-6 bg-green-50 p-5 rounded-xl">
              <Text className="text-[#3cc172] font-bold text-lg mb-4">
                Eco Benefits
              </Text>
              <View className="flex-row justify-between">
                <View className="items-center">
                  <Text className="text-[#3cc172] text-2xl font-bold">
                    {profile.ecoRating}%
                  </Text>
                  <Text className="text-gray-600 text-xs text-center">
                    Current Rating
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="text-[#3cc172] text-2xl font-bold">12%</Text>
                  <Text className="text-gray-600 text-xs text-center">
                    Rent Discount
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="text-[#3cc172] text-2xl font-bold">8</Text>
                  <Text className="text-gray-600 text-xs text-center">
                    Eco Points
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="text-[#3cc172] text-2xl font-bold">4</Text>
                  <Text className="text-gray-600 text-xs text-center">Badges</Text>
                </View>
              </View>
            </View>

            {/* Sign out */}
            <View className="mx-5 mt-6 mb-8">
              <TouchableOpacity
                className="bg-[#3cc172] py-4 rounded-xl items-center mb-4"
                onPress={handleLogout}
              >
                <Text className="text-white font-medium">Sign Out</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;