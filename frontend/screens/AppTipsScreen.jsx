import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const GREEN = '#3cc172';

const Row = ({ icon, title, children }) => (
  <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-100">
    <View className="flex-row items-center mb-2">
      <Ionicons name={icon} size={18} color={GREEN} />
      <Text className="ml-2 text-base font-semibold text-gray-900">{title}</Text>
    </View>
    <Text className="text-gray-700 leading-6">{children}</Text>
  </View>
);

export default function AppTipsScreen({ navigation }) {
  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      {/* Header */}
      <View className="bg-white border-b border-gray-100">
        <View className="flex-row mt-14 items-center justify-between px-4 py-3">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-2 rounded-xl bg-gray-50 border border-gray-200"
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">App Tips</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-5">
          <Text className="text-indigo-800">
            Master Green Rent features: verified eco-scores, smart filters, map view, reviews, and
            scheduled visits — all geared to sustainable renting.
          </Text>
        </View>

        <Row icon="ribbon-outline" title="Trust the Eco-Badge">
          Listings can show verified eco-certificates and an easy color badge so you can scan and
          compare quickly. Tap into details to understand how the score was calculated.  
        </Row>

        <Row icon="funnel-outline" title="Filter Like a Pro">
          Use filters for price, property type, and eco features (e.g., solar, transit-friendly).
          You’ll spend less time scrolling and more time deciding. 
        </Row>

        <Row icon="map-outline" title="Map View for Context">
          Switch to the map to see apartments relative to parks, transit lines, and amenities — a
          faster way to shortlist suitable neighborhoods.  
        </Row>

        <Row icon="chatbubbles-outline" title="Leverage Reviews (and Sentiment)">
          Reviews help you gauge comfort and sustainability. The platform encourages high-quality,
          moderated feedback so you can trust what you read.
        </Row>

        <Row icon="calendar-outline" title="Book Smart, Never Miss">
          Book in-person or virtual visits, receive confirmations and reminders, and avoid conflicts
          with managed scheduling.  
        </Row>

        <Row icon="construct-outline" title="For Landlords: Keep Eco Data Fresh">
          Update eco certificates when you have new paperwork so renters see accurate scores — it
          boosts trust and visibility. 
        </Row>
      </ScrollView>
    </View>
  );
}