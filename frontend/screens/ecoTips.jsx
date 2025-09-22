import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const GREEN = '#3cc172';

const Tip = ({ icon, title, children }) => (
  <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-100">
    <View className="flex-row items-center mb-2">
      <Ionicons name={icon} size={18} color={GREEN} />
      <Text className="ml-2 text-base font-semibold text-gray-900">{title}</Text>
    </View>
    <Text className="text-gray-700 leading-6">{children}</Text>
  </View>
);

export default function EcoTipsScreen({ navigation }) {
  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      {/* Header */}
      <View className="bg-white border-b mt-14 border-gray-100">
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-2 rounded-xl bg-gray-50 border border-gray-200"
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Eco Tips</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-5">
          <Text className="text-emerald-800">
            Make your next home greener and save on utilities with these practical tips inspired by
            Green Rent’s eco-verification and search features.
          </Text>
        </View>

        {/* Tips */}
        <Tip icon="ribbon-outline" title="Look for Verified Eco-Scores">
          Prefer listings that show verified eco-certificates and a color-coded badge (e.g., Platinum,
          Gold). Trusted verification makes it easier to compare properties on energy and water
          efficiency.
        </Tip>

        <Tip icon="leaf-outline" title="Prioritize Real Impact Features">
          Focus on features like solar panels, good insulation, energy-efficient lighting/appliances,
          and grey-water systems. These reduce your footprint and your monthly bills. (These are the
          same eco features your listings capture.)
        </Tip>

        <Tip icon="options-outline" title="Use Smart Filters to Narrow Search">
          Filter by eco-friendly features and proximity to public transport so you only view places
          that match your green goals and reduce travel emissions.  
        </Tip>

        <Tip icon="map-outline" title="Check the Location on a Map">
          Explore nearby eco amenities like recycling points, parks, and transit. A great location can
          cut commute time and energy use. (Your app’s map view is designed for this.) 
        </Tip>

        <Tip icon="water-outline" title="Ask About Water-Saving Fixtures">
          Low-flow taps, dual-flush toilets, and rain/grey-water use add up to big savings over time —
          great for the planet and your wallet.
        </Tip>

        <Tip icon="flash-outline" title="Review Energy Bills or Estimates">
          If available, glance at historical utility costs or an energy rating to gauge real-world
          efficiency and comfort across seasons.
        </Tip>

        <Tip icon="chatbubbles-outline" title="Read Reviews for Sustainability Clues">
          Reviews often mention insulation quality, noise, sunlight, and indoor comfort — all useful
          proxies for efficient design and responsible upkeep. (Your platform encourages helpful,
          well-managed reviews.) 
        </Tip>

        <Tip icon="calendar-outline" title="Book Visits With Reminders">
          Schedule a visit and enable reminders so you don’t miss it — and check for eco features
          in person (window seals, airflow, natural light). Landlords get confirmations; admins can
          monitor schedules to avoid conflicts.
        </Tip>
      </ScrollView>
    </View>
  );
}