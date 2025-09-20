import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/* Local UI bits for this component */
const Card = ({ title: t, subtitle, children, footer, className = '' }) => (
  <View className={`bg-white rounded-2xl p-6 mb-6 border border-gray-100 shadow-sm ${className}`}>
    {t ? (
      <View className="mb-5">
        <Text className="text-xl font-semibold text-gray-900">{t}</Text>
        {subtitle ? <Text className="text-gray-500 mt-2">{subtitle}</Text> : null}
      </View>
    ) : null}
    {children}
    {footer}
  </View>
);

const Label = ({ children }) => (
  <Text className="text-gray-700 text-base font-medium mb-3">{children}</Text>
);

const IconBadge = ({ checked, icon, label, onPress }) => (
  <TouchableOpacity
    className={`flex-row items-center mr-3 mb-3 px-4 py-2.5 rounded-full border ${checked ? 'bg-green-50 border-[#3cc172]' : 'bg-gray-50 border-gray-200'}`}
    onPress={onPress}
  >
    <Ionicons name={checked ? 'checkbox' : 'square-outline'} size={18} color={checked ? '#3cc172' : '#6b7280'} />
    <Ionicons name={icon} size={16} color={checked ? '#3cc172' : '#6b7280'} style={{ marginLeft: 8, marginRight: 4 }} />
    <Text className="ml-1 text-gray-700 text-sm">{label}</Text>
  </TouchableOpacity>
);

const Row = ({ label, value }) => (
  <View className="flex-row justify-between items-start py-2 border-b border-gray-100">
    <Text className="text-gray-600 font-medium flex-1">{label}</Text>
    <Text className="text-gray-800 font-semibold flex-1 text-right" numberOfLines={2}>
      {value}
    </Text>
  </View>
);

function EcoAndCertificateSection({
  ECO_FEATURES = [],
  ECO_RATINGS = [],
  ecoChecks, toggleEco,
  ecoRating, setEcoRating,
  onPickCertificate,
  certificate,
  reviewData,
}) {
  return (
    <>
      <Card title="Eco Features">
        <View className="gap-6">
          <View>
            <Label>Select Eco Features</Label>
            <View className="flex-row flex-wrap mt-2">
              {ECO_FEATURES.map((f) => {
                const checked = !!ecoChecks[f.key];
                return (
                  <IconBadge
                    key={f.key}
                    checked={checked}
                    icon={f.icon}
                    label={f.label}
                    onPress={() => toggleEco(f.key)}
                  />
                );
              })}
            </View>
          </View>

          <View>
            <Label>Eco Rating</Label>
            <View className="flex-row justify-center mt-3">
              {ECO_RATINGS.map((r) => {
                const active = ecoRating === r;
                return (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setEcoRating(r)}
                    className={`px-6 py-3 rounded-full mx-2 ${active ? 'bg-[#3cc172]' : 'bg-gray-100'}`}
                  >
                    <Text className={`text-base ${active ? 'text-white font-bold' : 'text-gray-700'}`}>{r}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Card>

      <Card title="Certificate Verification" subtitle="Upload an eco certificate (PDF or image). This helps verify your eco claims.">
        <View className="flex-row items-center mt-2">
          <TouchableOpacity onPress={onPickCertificate} className="bg-gray-100 px-4 py-3 rounded-xl border border-gray-200">
            <Text className="text-gray-700 font-medium">Choose file</Text>
          </TouchableOpacity>
          <Text className="ml-3 text-gray-600 flex-1" numberOfLines={1}>
            {certificate?.name ? certificate.name : 'No file selected'}
          </Text>
        </View>
      </Card>

      <Card title="Review">
        <View className="gap-4">
          <Row label="Title" value={reviewData.title || '-'} />
          <Row label="Type" value={reviewData.ptype} />
          <Row label="Price" value={`LKR ${reviewData.price || '-'}`} />
          <Row label="Address" value={reviewData.address || '-'} />
          <Row label="Coords" value={`${reviewData.lat || '-'}, ${reviewData.lng || '-'}`} />
          <Row label="Owner" value={reviewData.ownerId || '-'} />
          <Row label="Eco Rating" value={reviewData.ecoRating} />
          <Row
            label="Eco Features"
            value={Object.entries(reviewData.ecoChecks).filter(([, v]) => v).map(([k]) => k).join(', ') || '-'}
          />
          <Row label="Images" value={`${reviewData.imagesCount}`} />
          <Row label="Certificate" value={reviewData.certificateName || '—'} />
        </View>
      </Card>
    </>
  );
}

export default memo(EcoAndCertificateSection);