import { View, Text, Image, TouchableOpacity } from 'react-native';

const OnboardingScreen = ({ navigation }) => {
  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Image
        source={require('../GreenAssets/1.png')}
        className="w-64 h-64 mb-8"
        resizeMode="contain"
      />
      

      
      <Text className="text-gray-600 text-lg text-center mb-12 px-4" style={{ fontFamily: 'Norwester' }}>
        Eco-rated apartments for sustainable living
      </Text>

      <TouchableOpacity
        className="bg-[#3cc172] py-4 px-8 rounded-xl w-full max-w-xs"
        onPress={() => navigation.navigate('OnboardingScreens')}
      >
        <Text className="text-white font-bold text-lg text-center">
          Get Started
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default OnboardingScreen;