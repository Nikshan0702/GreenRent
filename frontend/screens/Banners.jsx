// ApartmentCarousel.jsx (NativeWind version)
import React, { useMemo, useState } from 'react';
import { View, Text, Image, Dimensions, TouchableOpacity } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

const { width } = Dimensions.get('window');
const CARD_W = width * 0.9;
const CARD_H = 210;
const GREEN = '#3cc172';

const FallbackImage = require('../GreenAssets/banner1.jpg');
const FallbackImage1 = require('../GreenAssets/banner2.jpg');
const FallbackImage2 = require('../GreenAssets/banner3.webp');


function getEcoBand(rating = 0) {
  if (rating >= 80) {
    return {
      label: 'Platinum Eco',
      bg: 'rgba(16,185,129,0.18)',   // emerald-500 ~
      border: '#34d399',             // emerald-400
      text: '#065f46',               // emerald-900
    };
  }
  if (rating >= 60) {
    return {
      label: 'Gold Eco',
      bg: 'rgba(245,158,11,0.16)',   // amber-500 ~
      border: '#fbbf24',             // amber-400
      text: '#92400e',               // amber-900
    };
  }
  return {
    label: 'Standard Eco',
    bg: 'rgba(239,68,68,0.16)',      // red-500 ~
    border: '#f87171',               // red-400
    text: '#7f1d1d',                 // red-900
  };
}

export default function ApartmentCarousel({
  data = [],
  autoPlay = true,
  autoPlayInterval = 3800,
  onPressItem,
}) {
  const [index, setIndex] = useState(0);

  const slides = useMemo(() => {
    if (data?.length) return data;
    return [
      {
        id: 'demo-1',
        title: 'Green View Apartments',
        location: 'Kollupitiya, Colombo',
        image: FallbackImage,
        ecoRating: 82,
        rent: 'Rs. 120,000 / mo',
        bedrooms: 2,
      },
      {
        id: 'demo-2',
        title: 'City Eco Loft',
        location: 'Nugegoda',
        image: FallbackImage1,
        ecoRating: 68,
        rent: 'Rs. 95,000 / mo',
        bedrooms: 1,
      },
      {
        id: 'demo-3',
        title: 'Sunrise Villas',
        location: 'Rajagiriya',
        image: FallbackImage2,
        ecoRating: 54,
        rent: 'Rs. 150,000 / mo',
        bedrooms: 3,
      },
    ];
  }, [data]);

  const renderItem = ({ item }) => {
    const band = getEcoBand(item.ecoRating);
    const src =
      item?.image && (item.image.uri || typeof item.image === 'number')
        ? item.image
        : FallbackImage;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        className="w-full h-full rounded-2xl overflow-hidden bg-white shadow-md"
        onPress={() => onPressItem && onPressItem(item)}
      >
        <Image source={src} className="w-full h-full" resizeMode="cover" />

        {/* Eco badge */}
        <View
          className="absolute top-2.5 left-2.5 rounded-full border px-3 py-1.5"
          style={{ backgroundColor: band.bg, borderColor: band.border }}
        >
          <Text className="text-xs font-extrabold" style={{ color: band.text }}>
            {band.label} • {Math.round(item.ecoRating || 0)}%
          </Text>
        </View>

        {/* Rent chip */}
        {item.rent ? (
          <View className="absolute top-2.5 right-2.5 bg-white/95 border border-gray-200 rounded-lg px-3 py-1.5">
            <Text className="text-gray-900 font-bold text-xs">{item.rent}</Text>
          </View>
        ) : null}

        {/* Bottom info bar */}
        <View
          className="absolute bottom-0 left-0 right-0 flex-row items-center gap-2 px-3.5 py-3"
          style={{ backgroundColor: 'rgba(60,193,114,0.86)' }} // GREEN with opacity
        >
          <View className="flex-1">
            <Text className="text-white text-base font-extrabold" numberOfLines={1}>
              {item.title || 'Apartment'}
            </Text>
            <Text className="text-white/90 text-xs" numberOfLines={1}>
              {item.location || '—'}
            </Text>
          </View>

          <View className="px-2.5 py-1 rounded-full bg-white/20 border border-white/40">
            <Text className="text-white text-xs font-bold">{item.bedrooms ?? '-'} BR</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="my-4">
      <Carousel
        data={slides}
        renderItem={renderItem}
        width={CARD_W}
        height={CARD_H}
        loop
        autoPlay={autoPlay}
        autoPlayInterval={autoPlayInterval}
        style={{ alignSelf: 'center' }}
        onProgressChange={(_, absoluteProgress) =>
          setIndex(Math.round(absoluteProgress))
        }
      />

      {/* Pagination dots */}
      <View className="mt-2 self-center flex-row gap-1.5">
        {slides.map((_, i) => {
          const active = i === index % slides.length;
          return (
            <View
              key={`dot-${i}`}
              className={`w-2 h-2 rounded-full ${active ? '' : 'bg-gray-200'}`}
              style={{
                backgroundColor: active ? GREEN : undefined,
                transform: [{ scale: active ? 1.2 : 1 }],
              }}
            />
          );
        })}
      </View>
    </View>
  );
}