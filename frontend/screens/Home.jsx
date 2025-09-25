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
// import Banner from './Banner'
// import Banners from './Banners'
// // import News from './News';

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
//             navigation.navigate('EcoTips');
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

//           {/* Placeholder to balance layout */}
//           <View style={{ width: 40 }} />
//         </View>

//         {/* Banner */}
//         <View className="mb-4">
//           <Banner />
//         </View>

//         {/* Replaced Quick Actions with Apartments / Sell / Eco Tips / Contact */}
//         <View className="flex-row flex-wrap justify-between mb-4">
//           {/* <TouchableOpacity
//             className="flex-row items-center bg-gray-50 py-4 px-4 rounded-2xl mb-3 w-[48%] border border-gray-200"
//             onPress={() => navigation.navigate("PropertyDetailsScreen", { property: item })}
//             activeOpacity={0.9}
//           >
//             <Ionicons name="business" size={22} color={GREEN} />
//             <Text className="ml-2 text-[15px] font-semibold text-gray-900">Apartments</Text>
//           </TouchableOpacity> */}


// <TouchableOpacity
//   className="flex-row items-center bg-gray-50 py-4 px-4 rounded-2xl mb-3 w-[48%] border border-gray-200"
//   onPress={() => navigation.navigate('PropertyList')}
//   activeOpacity={0.9}
// >
//   <Ionicons name="business" size={22} color={GREEN} />
//   <Text className="ml-2 text-[15px] font-semibold text-gray-900">Apartments</Text>
// </TouchableOpacity>

//           <TouchableOpacity
//             className="flex-row items-center bg-gray-50 py-4 px-4 rounded-2xl mb-3 w-[48%] border border-gray-200"
//             onPress={() => navigation.navigate('AddProperty')}
//             activeOpacity={0.9}
//           >
//             <Ionicons name="pricetag" size={22} color={GREEN} />
//             <Text className="ml-2 text-[15px] font-semibold text-gray-900">Sell</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             className="flex-row items-center bg-gray-50 py-4 px-4 rounded-2xl mb-3 w-[48%] border border-gray-200"
//             onPress={() => navigation.navigate('EcoTips')}
//             activeOpacity={0.9}
//           >
//             <Ionicons name="leaf" size={22} color={GREEN} />
//             <Text className="ml-2 text-[15px] font-semibold text-gray-900">Eco Tips</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             className="flex-row items-center bg-gray-50 py-4 px-4 rounded-2xl mb-3 w-[48%] border border-gray-200"
//             onPress={() => navigation.navigate('Contact')}
//             activeOpacity={0.9}
//           >
//             <Ionicons name="document-text" size={22} color={GREEN} />
//             <Text className="ml-2 text-[15px] font-semibold text-gray-900">Contact</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Section header styled like login accents */}
//         <View className="px-1 py-5">
//           <Text className="text-2xl font-bold text-gray-900">Latest</Text>
//           <View className="h-1.5 w-14 mt-2 rounded bg-[#3cc172]" />
//         </View>


//         <View className="mb-4">
//           <Banners />
//         </View>

//         {/* FAB — same green theme, bottom-right */}
//         {/* <TouchableOpacity
//           onPress={() => navigation.navigate('Complaint')}
//           activeOpacity={0.9}
//           className="absolute bottom-6 right-6 w-16 h-16 rounded-full items-center justify-center"
//           style={{
//             backgroundColor: GREEN,
//             shadowColor: '#000',
//             shadowOffset: { width: 0, height: 6 },
//             shadowOpacity: 0.25,
//             shadowRadius: 8,
//             elevation: 8,
//           }}
//         >
//           <Ionicons name="add" size={28} color="#ffffff" />
//         </TouchableOpacity> */}
//       </ScrollView>
//     </View>
//   );
// }

// screens/Home.jsx
import React, { useState, useRef } from 'react';
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
import Banner from './Banner';
import Banners from './Banners';

const GREEN = '#3cc172';

export default function Home() {
  const navigation = useNavigation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarAnim = useRef(new Animated.Value(-300)).current;

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

  const Sidebar = () => (
    <View className="flex-1 mt-10 pt-14 bg-white">
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
            navigation.navigate('ProfileScreen');
          }}
        >
          <Ionicons name="person" size={20} color={GREEN} />
          <Text className="ml-3 text-base text-gray-800">Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center py-4 border-b border-gray-100"
          onPress={() => {
            toggleSidebar();
            navigation.navigate('EcoTipsScreen');
          }}
        >
          <Ionicons name="leaf" size={20} color={GREEN} />
          <Text className="ml-3 text-base text-gray-800">Eco Tips</Text>
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
      </View>
    </View>
  );

  return (
    <View className={`${Platform.OS === 'android' ? 'pt-8' : ''} flex-1 bg-white`}>
      <StatusBar style="dark" />

      {/* Dim overlay */}
      {sidebarOpen && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={toggleSidebar}
          className="absolute inset-0 bg-black/30 z-10"
        />
      )}

      {/* Sliding sidebar */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 300,
          height: '100%',
          transform: [{ translateX: sidebarAnim }],
          zIndex: 20,
          elevation: 6,
          shadowColor: '#000',
          shadowOffset: { width: 2, height: 0 },
          shadowOpacity: 0.12,
          shadowRadius: 6,
          backgroundColor: 'white',
        }}
      >
        <Sidebar />
      </Animated.View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View className="flex-row items-center mt-10 justify-between py-5">
          <TouchableOpacity onPress={toggleSidebar} className="p-2 rounded-xl bg-gray-50">
            <Ionicons name="menu" size={24} color="#111827" />
          </TouchableOpacity>

          <Text className="text-2xl font-bold text-gray-900">Green Rent</Text>

          {/* Spacer */}
          <View style={{ width: 40 }} />
        </View>

        {/* Banner */}
        <View className="mb-4">
          <Banner />
        </View>

        {/* Quick Actions */}
        <View className="flex-row flex-wrap justify-between mb-4">
          {/* Apartments -> PropertyList (fetches all from backend) */}
          <TouchableOpacity
            className="flex-row items-center bg-gray-50 py-4 px-4 rounded-2xl mb-3 w-[48%] border border-gray-200"
            onPress={() => navigation.navigate('PropertyList')}
            activeOpacity={0.9}
          >
            <Ionicons name="business" size={22} color={GREEN} />
            <Text className="ml-2 text-[15px] font-semibold text-gray-900">Apartments</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center bg-gray-50 py-4 px-4 rounded-2xl mb-3 w-[48%] border border-gray-200"
            onPress={() => navigation.navigate('SuggestApartments')}
            activeOpacity={0.9}
          >
            <Ionicons name="business-outline" size={22} color={GREEN} />
            <Text className="ml-2 text-[15px] font-semibold text-gray-900">Near</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center bg-gray-50 py-4 px-4 rounded-2xl mb-3 w-[48%] border border-gray-200"
            onPress={() => navigation.navigate('AppTipsScreen')}
            activeOpacity={0.9}
          >
           <Ionicons name="bulb-outline" size={22} color={GREEN} />
            <Text className="ml-2 text-[15px] font-semibold text-gray-900">App Tips</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center bg-gray-50 py-4 px-4 rounded-2xl mb-3 w-[48%] border border-gray-200"
            onPress={() => navigation.navigate('Contact')}
            activeOpacity={0.9}
          >
            <Ionicons name="document-text" size={22} color={GREEN} />
            <Text className="ml-2 text-[15px] font-semibold text-gray-900">Contact</Text>
          </TouchableOpacity>
        </View>

        {/* Section header */}
        <View className="px-1 py-5">
          <Text className="text-2xl font-bold text-gray-900">Latest</Text>
          <View className="h-1.5 w-14 mt-2 rounded bg-[#3cc172]" />
        </View>

        <View className="mb-4">
          <Banners />
        </View>
      </ScrollView>
    </View>
  );
}