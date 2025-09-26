import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ECO_FEATURES = [
  { key: "solarPanels", label: "Solar Panels", icon: "sunny-outline" },
  { key: "recycling", label: "Recycling Facilities", icon: "leaf-outline" },
  { key: "energyRating", label: "Energy Rating", icon: "speedometer-outline" },
  { key: "insulation", label: "Insulation", icon: "home-outline" },
  { key: "greyWater", label: "Grey Water System", icon: "water-outline" },
];

export default function EcoFeaturesSelector({ selected = [], onChange }) {
  const toggle = (key) => {
    if (selected.includes(key)) onChange(selected.filter((f) => f !== key));
    else onChange([...selected, key]);
  };

  return (
    <View className="mt-1">
      {ECO_FEATURES.map((f) => {
        const active = selected.includes(f.key);
        return (
          <TouchableOpacity
            key={f.key}
            onPress={() => toggle(f.key)}
            className="flex-row items-center mb-2"
            activeOpacity={0.8}
          >
            <Ionicons
              name={f.icon}
              size={20}
              color={active ? "#059669" : "#9ca3af"}
              style={{ marginRight: 8 }}
            />
            <Text className={`text-[14px] ${active ? "text-emerald-700 font-semibold" : "text-gray-600"}`}>
              {f.label}
            </Text>
            <Ionicons
              name={active ? "checkbox-outline" : "square-outline"}
              size={20}
              color={active ? "#059669" : "#9ca3af"}
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}