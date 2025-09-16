import { 
    View, 
    Text, 
    Image, 
    TouchableOpacity, 
    ScrollView,
    Animated,
    Easing
  } from 'react-native';
  import { Ionicons } from '@expo/vector-icons';
  import { useState, useRef } from 'react';
  import { useNavigation } from '@react-navigation/native';
  
  const ProfileScreen = () => {
    const navigation = useNavigation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [error, setError] = useState('');
    const sidebarAnim = useRef(new Animated.Value(-300)).current;
    
    const [profile, setProfile] = useState({
      uname: 'Nikshan',
      email: 'Nikshan@example.com',
      number: '+94 7711121314',
      address: 'kalmunai, Sri Lanka',
      ecoRating: 87
    });
  
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
      <Animated.View className="absolute top-0 left-0 bottom-0 w-72 bg-white z-20 shadow-xl"
        style={{ transform: [{ translateX: sidebarAnim }] }}
      >
        <TouchableOpacity 
          className="absolute top-4 right-4 p-2"
          onPress={toggleSidebar}
        >
          <Ionicons name="close" size={24} color="#1f2937" />
        </TouchableOpacity>
        
        <View className="mt-16 px-6">
          <Text className="text-[#3cc172] text-2xl font-bold mb-8">EcoRent Menu</Text>
          
          <TouchableOpacity 
            className="flex-row items-center py-4 border-b border-gray-100"
            onPress={() => {
              toggleSidebar();
              navigation.navigate('Home');
            }}
          >
            <Ionicons name="home" size={20} color="#3cc172" />
            <Text className="text-gray-800 text-lg ml-3">Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-row items-center py-4 border-b border-gray-100"
            onPress={() => {
              toggleSidebar();
              navigation.navigate('Profile');
            }}
          >
            <Ionicons name="person" size={20} color="#3cc172" />
            <Text className="text-gray-800 text-lg ml-3">Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-row items-center py-4 border-b border-gray-100"
            onPress={() => {
              toggleSidebar();
              navigation.navigate('Apartments');
            }}
          >
            <Ionicons name="business" size={20} color="#3cc172" />
            <Text className="text-gray-800 text-lg ml-3">Apartments</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-row items-center py-4 border-b border-gray-100"
            onPress={() => {
              toggleSidebar();
              navigation.navigate('EcoRating');
            }}
          >
            <Ionicons name="leaf" size={20} color="#3cc172" />
            <Text className="text-gray-800 text-lg ml-3">Eco Rating</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-row items-center py-4 border-b border-gray-100"
            onPress={() => {
              toggleSidebar();
              navigation.navigate('Contact');
            }}
          >
            <Ionicons name="document-text" size={20} color="#3cc172" />
            <Text className="text-gray-800 text-lg ml-3">Contact</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  
    const handleLogout = () => {
      // Logout logic here
    };
  
    // Determine eco rating badge color
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
  
    return (
      <View className="flex-1 mt-14 bg-white">
        {/* Sidebar overlay when open */}
        {sidebarOpen && (
          <TouchableOpacity 
            className="absolute inset-0 bg-black opacity-50 z-10"
            activeOpacity={1}
            onPress={toggleSidebar}
          />
        )}
        
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main content */}
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with menu button */}
          <View className="flex-row items-center justify-between p-5 border-b border-gray-100">
            <TouchableOpacity onPress={toggleSidebar} className="p-2">
              <Ionicons name="menu" size={24} color="#1f2937" />
            </TouchableOpacity>
            <Text className="text-gray-900 text-xl font-semibold">My Eco Profile</Text>
            <TouchableOpacity className="p-2">
              <Ionicons name="settings-outline" size={24} color="#1f2937" />
            </TouchableOpacity>
          </View>
  
          {error ? (
            <Text className="text-red-600 text-center p-3 bg-red-50 mx-5 mt-4 rounded-lg">{error}</Text>
          ) : null}
  
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
            
            <Text className="text-gray-900 text-xl font-bold mb-1">{profile.uname || 'Guest User'}</Text>
            <Text className="text-gray-600 text-base mb-3">{profile.email || 'No email provided'}</Text>
            
            {/* Eco Rating Badge */}
            <View className={`flex-row items-center px-4 py-2 rounded-full border mb-3 ${getEcoBadgeColor()}`}>
              <Ionicons name="leaf" size={16} color="#3cc172" />
              <Text className={`ml-2 font-semibold ${getEcoBadgeText()}`}>
                {getEcoLevel()} • {profile.ecoRating}%
              </Text>
            </View>
            
            {profile.number ? (
              <Text className="text-gray-500 text-sm mb-1">Phone: {profile.number}</Text>
            ) : null}
            {profile.address ? (
              <Text className="text-gray-500 text-sm text-center">Address: {profile.address}</Text>
            ) : null}
          </View>
  
          {/* Action Buttons - 2x2 Grid */}
          <View className="mx-5 mt-6">
            <Text className="text-gray-900 text-lg font-semibold mb-4">Quick Actions</Text>
            <View className="flex-row flex-wrap justify-between">
              {/* Row 1 */}
              <TouchableOpacity 
                className="flex-row items-center bg-gray-50 py-4 px-4 rounded-xl mb-3 w-[48%]"
                onPress={() => navigation.navigate('MyApartments')}
              >
                <Ionicons name="business" size={20} color="#3cc172" />
                <Text className="text-gray-700 font-medium ml-2 text-sm">My Apartments</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-row items-center bg-gray-50 py-4 px-4 rounded-xl mb-3 w-[48%]"
                onPress={() => navigation.navigate('Bookings')}
              >
                <Ionicons name="calendar" size={20} color="#3cc172" />
                <Text className="text-gray-700 font-medium ml-2 text-sm">My Bookings</Text>
              </TouchableOpacity>
              
              {/* Row 2 */}
              <TouchableOpacity 
                className="flex-row items-center bg-gray-50 py-4 px-4 rounded-xl w-[48%]"
                onPress={() => navigation.navigate('EcoTips')}
              >
                <Ionicons name="bulb" size={20} color="#3cc172" />
                <Text className="text-gray-700 font-medium ml-2 text-sm">Eco Tips</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-row items-center bg-gray-50 py-4 px-4 rounded-xl w-[48%]"
                onPress={() => navigation.navigate('Support')}
              >
                <Ionicons name="help-circle" size={20} color="#3cc172" />
                <Text className="text-gray-700 font-medium ml-2 text-sm">Support</Text>
              </TouchableOpacity>
            </View>
          </View>
  
          {/* Stats Section */}
          <View className="mx-5 mt-6 bg-green-50 p-5 rounded-xl">
            <Text className="text-[#3cc172] font-bold text-lg mb-4">Eco Benefits</Text>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-[#3cc172] text-2xl font-bold">{profile.ecoRating}%</Text>
                <Text className="text-gray-600 text-xs text-center">Current Rating</Text>
              </View>
              <View className="items-center">
                <Text className="text-[#3cc172] text-2xl font-bold">12%</Text>
                <Text className="text-gray-600 text-xs text-center">Rent Discount</Text>
              </View>
              <View className="items-center">
                <Text className="text-[#3cc172] text-2xl font-bold">8</Text>
                <Text className="text-gray-600 text-xs text-center">Eco Points</Text>
              </View>
              <View className="items-center">
                <Text className="text-[#3cc172] text-2xl font-bold">4</Text>
                <Text className="text-gray-600 text-xs text-center">Badges</Text>
              </View>
            </View>
          </View>

  
          {/* Bottom Buttons */}
          <View className="mx-5 mt-6">

            
            <TouchableOpacity 
            className="bg-[#3cc172] py-4 rounded-xl items-center mb-4"
              onPress={handleLogout}
            >
              <Text className="text-white font-medium">Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };
  
  export default ProfileScreen;