import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function OnboardingScreens() {
  const navigation = useNavigation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: require('../GreenAssets/1.png'),
      title: 'Find Eco-Rated Apartments',
      description: 'Discover apartments with sustainability ratings that match your environmental values',
      color: '#3cc172'
    },
    {
      id: 2,
      image: require('../GreenAssets/1.png'),
      title: 'Save on Rent',
      description: 'Earn discounts based on your eco-friendly lifestyle choices and apartment ratings',
      color: '#2aa15a'
    },
    {
      id: 3,
      image: require('../GreenAssets/1.png'),
      title: 'Live Sustainably',
      description: 'Track your environmental impact and contribute to a greener community',
      color: '#218c4d'
    }
  ];

  const goToNextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigation.navigate('OnboardingScreen');
    }
  };

  const goToPreviousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const skipOnboarding = () => {
    navigation.navigate('loginScreen');
  };

  return (
    <View className="flex-1 bg-white">
      {/* Skip Button */}
      <TouchableOpacity 
        onPress={skipOnboarding}
        className="absolute top-12 right-6 z-10"
      >
        <Text className="text-gray-500 font-medium">Skip</Text>
      </TouchableOpacity>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const slide = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentSlide(slide);
        }}
        scrollEventThrottle={16}
      >
        {slides.map((slide) => (
          <View key={slide.id} className="flex-1 justify-center items-center px-6" style={{ width }}>
            <Image
              source={slide.image}
              className="w-72 h-72 mb-8"
              resizeMode="contain"
            />
            
            <Text className="text-2xl font-bold text-center mb-4 px-4" style={{ color: slide.color }}>
              {slide.title}
            </Text>
            
            <Text className="text-gray-600 text-lg text-center mb-12 px-4">
              {slide.description}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View className="flex-row justify-center mb-8">
        {slides.map((_, index) => (
          <View
            key={index}
            className={`h-2 w-2 mx-1 rounded-full ${
              currentSlide === index ? 'bg-[#3cc172]' : 'bg-gray-300'
            }`}
          />
        ))}
      </View>

      {/* Navigation Buttons */}
      <View className="flex-row justify-between items-center px-6 pb-8">
        <TouchableOpacity
          onPress={goToPreviousSlide}
          className={`py-3 px-6 ${currentSlide === 0 ? 'opacity-0' : 'opacity-100'}`}
          disabled={currentSlide === 0}
        >
          <Text className="text-gray-600 font-medium">Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={goToNextSlide}
          className="bg-[#3cc172] py-4 px-8 rounded-xl min-w-[120px] items-center"
        >
          <Text className="text-white font-bold text-lg">
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}