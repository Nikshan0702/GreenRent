// import {
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ActivityIndicator,
//   Image,
//   Alert,
// } from 'react-native';
// import { StatusBar } from 'expo-status-bar';
// import { useEffect, useState, useCallback, memo } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as ImagePicker from 'expo-image-picker';
// import * as Location from 'expo-location';
// import { Ionicons } from '@expo/vector-icons';

// const API_BASE = 'http://10.0.2.2:4000'; // Android emulator -> host(Mac)
// const CREATE_URL = `${API_BASE}/PropertyOperations/AddProp`;

// const PROPERTY_TYPES = ['Apartment', 'House', 'Studio', 'Villa', 'Townhouse'];

// export default function AddProperty({ navigation }) {
//   // ---- form fields ----
//   const [title, setTitle] = useState('');
//   const [desc, setDesc] = useState('');
//   const [address, setAddress] = useState('');
//   const [lat, setLat] = useState('');
//   const [lng, setLng] = useState('');
//   const [price, setPrice] = useState('');
//   const [ptype, setPtype] = useState(PROPERTY_TYPES[0]);
//   const [ownerId, setOwnerId] = useState('');

//   const [images, setImages] = useState([]);

//   // ---- ui state ----
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState('');

//   // Prefill ownerId from stored user
//   useEffect(() => {
//     (async () => {
//       const userStr = await AsyncStorage.getItem('auth_user');
//       if (userStr) {
//         const u = JSON.parse(userStr);
//         const id = u?._id || u?.id || u?.userId;
//         if (id) setOwnerId(String(id));
//       }
//     })();
//   }, []);

//   const reqLocationPerms = async () => {
//     const { status } = await Location.requestForegroundPermissionsAsync();
//     if (status !== 'granted') {
//       Alert.alert('Permission required', 'Location permission is needed to fetch your coordinates.');
//       return false;
//     }
//     return true;
//   };

//   const handleUseCurrentLocation = useCallback(async () => {
//     try {
//       const ok = await reqLocationPerms();
//       if (!ok) return;
//       const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
//       const { latitude, longitude } = loc.coords;
//       setLat(String(latitude));
//       setLng(String(longitude));

//       const rev = await Location.reverseGeocodeAsync({ latitude, longitude });
//       if (rev?.length) {
//         const a = rev[0];
//         const line = [a.name, a.street, a.subregion, a.city || a.district, a.region, a.postalCode, a.country]
//           .filter(Boolean)
//           .join(', ');
//         setAddress(line);
//       }
//     } catch {
//       Alert.alert('Location error', 'Could not fetch location. Try again.');
//     }
//   }, []);

//   const pickImages = async () => {
//     const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (!perm.granted) {
//       Alert.alert('Permission required', 'We need media permissions to select images.');
//       return;
//     }
//     const result = await ImagePicker.launchImageLibraryAsync({
//       allowsMultipleSelection: true,
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       quality: 0.9,
//       selectionLimit: 8,
//     });
//     if (!result.canceled) {
//       const selected = (result.assets || []).map((a, i) => ({
//         uri: a.uri,
//         name: a.fileName || `image_${Date.now()}_${i}.jpg`,
//         type: a.mimeType || 'image/jpeg',
//       }));
//       setImages((prev) => [...prev, ...selected].slice(0, 12));
//     }
//   };

//   const removeImage = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx));

//   const isObjectId = (s) => /^[0-9a-fA-F]{24}$/.test(String(s || ''));

//   // ---- validation (property-only) ----
//   const validate = () => {
//     if (!title.trim()) return 'Title/Name is required';
//     if (!desc.trim()) return 'Description is required';
//     if (!address.trim()) return 'Address is required';
//     if (!lat || !lng) return 'Please include geolocation (lat & lng)';
//     if (!price || Number.isNaN(Number(price))) return 'Rent Price must be a number';
//     if (!ptype) return 'Property type is required';
//     if (!ownerId.trim()) return 'Owner ID is required';
//     if (!isObjectId(ownerId)) return 'Owner ID is invalid';
//     if (!images.length) return 'Please add at least one image';
//     return '';
//   };

//   // ---- submit (no eco/certificate fields) ----
//   const handleSubmit = async () => {
//     if (isSubmitting) return;

//     const v = validate();
//     if (v) {
//       setError(v);
//       return;
//     }
//     setError('');
//     setIsSubmitting(true);

//     try {
//       const fd = new FormData();
//       fd.append('title', title.trim());
//       fd.append('description', desc.trim());
//       fd.append('address', address.trim());
//       fd.append('lat', String(lat).trim());
//       fd.append('lng', String(lng).trim());
//       fd.append('rentPrice', String(price).trim());
//       fd.append('propertyType', ptype);
//       fd.append('ownerId', ownerId.trim());

//       images.forEach((img, idx) => {
//         fd.append('images', {
//           uri: img.uri,
//           name: img.name || `image_${idx}.jpg`,
//           type: img.type || 'image/jpeg',
//         });
//       });

//       const token = await AsyncStorage.getItem('auth_token');
//       const controller = new AbortController();
//       const timeout = setTimeout(() => controller.abort(), 25000);

//       const res = await fetch(CREATE_URL, {
//         method: 'POST',
//         headers: {
//           Accept: 'application/json',
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//         body: fd,
//         signal: controller.signal,
//       }).catch((err) => {
//         throw new Error(err?.name === 'AbortError'
//           ? 'Request timed out. Check network/server.'
//           : 'Network error. Is the API reachable from emulator?');
//       });

//       clearTimeout(timeout);

//       let data = {};
//       try { data = await res.json(); } catch {}

//       if (!res.ok) {
//         const msg = data?.message || `Failed to create listing (HTTP ${res.status})`;
//         throw new Error(msg);
//       }

//       Alert.alert('Success', 'Property listing created!', [
//         {
//           text: 'OK',
//           onPress: () => {
//             setTitle('');
//             setDesc('');
//             setAddress('');
//             setLat('');
//             setLng('');
//             setPrice('');
//             setPtype(PROPERTY_TYPES[0]);
//             // keep ownerId for subsequent listings
//             setImages([]);
//             navigation?.goBack?.();
//           },
//         },
//       ]);
//     } catch (e) {
//       setError(e?.message || 'Something went wrong');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // ----- UI bits (local) -----
//   const Card = ({ title: t, subtitle, children, footer, className = '' }) => (
//     <View className={`bg-white rounded-2xl p-6 mb-6 border border-gray-100 shadow-sm ${className}`}>
//       {t ? (
//         <View className="mb-5">
//           <Text className="text-xl font-semibold text-gray-900">{t}</Text>
//           {subtitle ? <Text className="text-gray-500 mt-2">{subtitle}</Text> : null}
//         </View>
//       ) : null}
//       {children}
//       {footer}
//     </View>
//   );

//   const Label = ({ children }) => (
//     <Text className="text-gray-700 text-base font-medium mb-3">{children}</Text>
//   );

//   const Input = memo(function Input({ value, onChangeText, placeholder, multiline, numberOfLines, inputMode, left, right }) {
//     return (
//       <View className="flex-row items-center bg-gray-50 rounded-xl px-4 border border-gray-200">
//         {left}
//         <TextInput
//           className={`flex-1 py-4 text-base text-gray-900 ${multiline ? 'min-h-[100px]' : ''}`}
//           placeholder={placeholder}
//           value={value}
//           onChangeText={onChangeText}
//           multiline={multiline}
//           numberOfLines={numberOfLines}
//           textAlignVertical={multiline ? 'top' : 'center'}
//           inputMode={inputMode}
//         />
//         {right}
//       </View>
//     );
//   });

//   const Chip = ({ active, children, onPress }) => (
//     <TouchableOpacity
//       onPress={onPress}
//       className={`px-4 py-2.5 mr-3 mb-3 rounded-full border ${active ? 'bg-[#3cc172] border-[#3cc172]' : 'bg-gray-50 border-gray-200'}`}
//     >
//       <Text className={`${active ? 'text-white font-semibold' : 'text-gray-700'}`}>{children}</Text>
//     </TouchableOpacity>
//   );

//   const ErrorBanner = ({ message }) => (
//     <View className="bg-red-50 p-4 rounded-xl mb-5 border border-red-200">
//       <View className="flex-row items-center">
//         <Ionicons name="alert-circle" size={20} color="#ef4444" />
//         <Text className="text-red-700 ml-2 font-medium flex-1">{message}</Text>
//       </View>
//     </View>
//   );

//   return (
//     <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-gray-50">
//       <StatusBar style="dark" />
//       <ScrollView
//         className="flex-1"
//         contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
//         keyboardShouldPersistTaps="handled"
//         showsVerticalScrollIndicator={false}
//       >
//         {error ? <ErrorBanner message={error} /> : null}
//         <View className="mt-10 mb-6 flex-row items-center">
//         <TouchableOpacity
//         onPress={() => navigation.goBack()}
//         className="p-2 rounded-xl bg-gray-50 border border-gray-200 mr-3"
//        activeOpacity={0.8} > <Ionicons name="arrow-back" size={20} color="#111827" /> </TouchableOpacity>

//   {/* Title */}
//          <View>
//          <Text className="text-xl font-bold text-gray-800">Add New Property</Text>
//        </View>
//       </View>

//         {/* Property form only */}
//         <Card>
//           <View className="gap-6">
//             <View>
//               <Label>Title / Name of Listing</Label>
//               <Input
//                 placeholder="e.g., Sunny 2BR Apartment in Kalmunai"
//                 value={title}
//                 onChangeText={setTitle}
//               />
//             </View>

//             <View>
//               <Label>Description</Label>
//               <Input
//                 placeholder="Describe the property, neighborhood, amenities…"
//                 value={desc}
//                 onChangeText={setDesc}
//                 multiline
//                 numberOfLines={4}
//               />
//             </View>

//             <View>
//               <Label>Property Type</Label>
//               <View className="flex-row flex-wrap mt-1">
//                 {PROPERTY_TYPES.map((t) => (
//                   <Chip key={t} active={ptype === t} onPress={() => setPtype(t)}>
//                     {t}
//                   </Chip>
//                 ))}
//               </View>
//             </View>

//             <View>
//               <Label>Rent Price (per month)</Label>
//               <Input
//                 placeholder="e.g., 45000"
//                 value={price}
//                 onChangeText={setPrice}
//                 inputMode="numeric"
//                 left={<Text className="text-gray-500 mr-2">LKR</Text>}
//               />
//             </View>
//           </View>
//         </Card>

//         <Card title="Location Details">
//           <View className="gap-6">
//             <View>
//               <Label>Address</Label>
//               <Input placeholder="Street, city, region" value={address} onChangeText={setAddress} />
//             </View>

//             <View>
//               <Label>Coordinates</Label>
//               <View className="flex-row gap-3 mt-1">
//                 <View className="flex-1">
//                   <Text className="text-gray-500 text-sm mb-2">Latitude</Text>
//                   <Input placeholder="Latitude" value={lat} onChangeText={setLat} inputMode="decimal" />
//                 </View>
//                 <View className="flex-1">
//                   <Text className="text-gray-500 text-sm mb-2">Longitude</Text>
//                   <Input placeholder="Longitude" value={lng} onChangeText={setLng} inputMode="decimal" />
//                 </View>
//               </View>
//             </View>

//             <TouchableOpacity
//               className="flex-row items-center mt-14 justify-center bg-gray-100 px-4 py-4 rounded-xl border border-gray-200"
//               onPress={handleUseCurrentLocation}
//             >
//               <Ionicons name="location" size={18} color="#3cc172" />
//               <Text className="text-gray-700 font-medium ml-2">Use Current Location</Text>
//             </TouchableOpacity>
//           </View>
//         </Card>

//         <Card title="Property Images" subtitle="Add at least one image of your property">
//           <View className="flex-row flex-wrap mt-2">
//             {images.map((img, idx) => (
//               <View key={`${img.uri}-${idx}`} className="mr-3 mb-3 relative">
//                 <Image source={{ uri: img.uri }} className="w-24 h-24 rounded-xl" />
//                 <TouchableOpacity
//                   className="absolute -top-2 -right-2 bg-red-500 w-6 h-6 rounded-full items-center justify-center shadow"
//                   onPress={() => removeImage(idx)}
//                 >
//                   <Ionicons name="close" color="#fff" size={14} />
//                 </TouchableOpacity>
//               </View>
//             ))}
//             <TouchableOpacity
//               onPress={pickImages}
//               className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 items-center justify-center bg-gray-50"
//             >
//               <Ionicons name="add" size={28} color="#9ca3af" />
//               <Text className="text-gray-500 text-xs mt-1">Add Images</Text>
//             </TouchableOpacity>
//           </View>
//         </Card>
//       </ScrollView>

//       {/* Single submit button footer */}
//       {/* <View className="absolute bottom-0 left-0 right-0 mb-10  px-0 py-4">
//         <View className="items-center">
//           <TouchableOpacity
//             onPress={handleSubmit}
//             className={`py-3 rounded-xl items-center w-64 ${isSubmitting ? 'bg-[#3cc172]/70' : 'bg-[#3cc172]'}`}
//             disabled={isSubmitting}
//           >
//             {isSubmitting
//               ? <ActivityIndicator color="#fff" />
//               : <Text className="text-white font-bold text-base">Submit Listing</Text>}
//           </TouchableOpacity>
//         </View>
//       </View> */}


//      <View className="items-center">
//     <TouchableOpacity
//       onPress={handleSubmit}
//       disabled={isSubmitting}
//       className={`w-64 py-3 rounded-xl items-center ${
//         isSubmitting ? 'bg-[#3cc172]/70' : 'bg-[#3cc172]'
//       }`}
//       activeOpacity={0.9}
//     >
//       {isSubmitting ? (
//         <ActivityIndicator color="#fff" />
//       ) : (
//         <Text className="text-white font-bold text-base">Submit Listing</Text>
//       )}
//     </TouchableOpacity>
//   </View>
//     </KeyboardAvoidingView>
//   );
// }


// screens/AddProperty.jsx
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useCallback, memo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

const API_BASE = 'http://10.0.2.2:4000'; // Android emulator -> host(Mac)
const CREATE_URL = `${API_BASE}/PropertyOperations/AddProp`;

const PROPERTY_TYPES = ['Apartment', 'House', 'Studio', 'Villa', 'Townhouse'];

export default function AddProperty({ navigation }) {
  // ---- form fields ----
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [price, setPrice] = useState('');
  const [ptype, setPtype] = useState(PROPERTY_TYPES[0]);
  const [ownerId, setOwnerId] = useState('');
  const [images, setImages] = useState([]);

  // ---- ui state ----
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Prefill ownerId from stored user
  useEffect(() => {
    (async () => {
      const userStr = await AsyncStorage.getItem('auth_user');
      if (userStr) {
        const u = JSON.parse(userStr);
        const id = u?._id || u?.id || u?.userId;
        if (id) setOwnerId(String(id));
      }
    })();
  }, []);

  const reqLocationPerms = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Location permission is needed to fetch your coordinates.');
      return false;
    }
    return true;
  };

  const handleUseCurrentLocation = useCallback(async () => {
    try {
      const ok = await reqLocationPerms();
      if (!ok) return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;
      setLat(String(latitude));
      setLng(String(longitude));

      const rev = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (rev?.length) {
        const a = rev[0];
        const line = [a.name, a.street, a.subregion, a.city || a.district, a.region, a.postalCode, a.country]
          .filter(Boolean)
          .join(', ');
        setAddress(line);
      }
    } catch {
      Alert.alert('Location error', 'Could not fetch location. Try again.');
    }
  }, []);

  const pickImages = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission required', 'We need media permissions to select images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      selectionLimit: 8,
    });
    if (!result.canceled) {
      const selected = (result.assets || []).map((a, i) => ({
        uri: a.uri,
        name: a.fileName || `image_${Date.now()}_${i}.jpg`,
        type: a.mimeType || 'image/jpeg',
      }));
      setImages((prev) => [...prev, ...selected].slice(0, 12));
    }
  };

  const removeImage = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx));
  const isObjectId = (s) => /^[0-9a-fA-F]{24}$/.test(String(s || ''));

  // ---- validation (property-only) ----
  const validate = () => {
    if (!title.trim()) return 'Title/Name is required';
    if (!desc.trim()) return 'Description is required';
    if (!address.trim()) return 'Address is required';
    if (!lat || !lng) return 'Please include geolocation (lat & lng)';
    if (!price || Number.isNaN(Number(price))) return 'Rent Price must be a number';
    if (!ptype) return 'Property type is required';
    if (!ownerId.trim()) return 'Owner ID is required';
    if (!isObjectId(ownerId)) return 'Owner ID is invalid';
    if (!images.length) return 'Please add at least one image';
    return '';
  };

  // ---- submit (no eco/certificate fields) ----
  const handleSubmit = async () => {
    if (isSubmitting) return;

    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const fd = new FormData();
      fd.append('title', title.trim());
      fd.append('description', desc.trim());
      fd.append('address', address.trim());
      fd.append('lat', String(lat).trim());
      fd.append('lng', String(lng).trim());
      fd.append('rentPrice', String(price).trim());
      fd.append('propertyType', ptype);
      fd.append('ownerId', ownerId.trim());

      images.forEach((img, idx) => {
        fd.append('images', {
          uri: img.uri,
          name: img.name || `image_${idx}.jpg`,
          type: img.type || 'image/jpeg',
        });
      });

      const token = await AsyncStorage.getItem('auth_token');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);

      const res = await fetch(CREATE_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: fd,
        signal: controller.signal,
      }).catch((err) => {
        throw new Error(err?.name === 'AbortError'
          ? 'Request timed out. Check network/server.'
          : 'Network error. Is the API reachable from emulator?');
      });

      clearTimeout(timeout);

      let data = {};
      try { data = await res.json(); } catch {}

      if (!res.ok) {
        const msg = data?.message || `Failed to create listing (HTTP ${res.status})`;
        throw new Error(msg);
      }

      Alert.alert('Success', 'Property listing created!', [
        {
          text: 'OK',
          onPress: () => {
            setTitle('');
            setDesc('');
            setAddress('');
            setLat('');
            setLng('');
            setPrice('');
            setPtype(PROPERTY_TYPES[0]);
            setImages([]);
            navigation?.goBack?.();
          },
        },
      ]);
    } catch (e) {
      setError(e?.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----- UI bits -----
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

  const Input = memo(function Input({ value, onChangeText, placeholder, multiline, numberOfLines, inputMode, left, right }) {
    return (
      <View className="flex-row items-center bg-gray-50 rounded-xl px-4 border border-gray-200">
        {left}
        <TextInput
          className={`flex-1 py-4 text-base text-gray-900 ${multiline ? 'min-h-[100px]' : ''}`}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
          inputMode={inputMode}
        />
        {right}
      </View>
    );
  });

  const Chip = ({ active, children, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-2.5 mr-3 mb-3 rounded-full border ${active ? 'bg-[#3cc172] border-[#3cc172]' : 'bg-gray-50 border-gray-200'}`}
    >
      <Text className={`${active ? 'text-white font-semibold' : 'text-gray-700'}`}>{children}</Text>
    </TouchableOpacity>
  );

  const ErrorBanner = ({ message }) => (
    <View className="bg-red-50 p-4 rounded-xl mb-5 border border-red-200">
      <View className="flex-row items-center">
        <Ionicons name="alert-circle" size={20} color="#ef4444" />
        <Text className="text-red-700 ml-2 font-medium flex-1">{message}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <StatusBar style="dark" />

      {/* Fixed header */}
      <View style={{ backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-2 rounded-xl bg-gray-50 border border-gray-200"
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Add New Property</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      {/* KeyboardAvoiding around the scrollable form */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 160 }} // leave room for fixed footer
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {error ? <ErrorBanner message={error} /> : null}

          {/* Property form only */}
          <Card>
            <View className="gap-6">
              <View>
                <Label>Title / Name of Listing</Label>
                <Input
                  placeholder="e.g., Sunny 2BR Apartment in Kalmunai"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View>
                <Label>Description</Label>
                <Input
                  placeholder="Describe the property, neighborhood, amenities…"
                  value={desc}
                  onChangeText={setDesc}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View>
                <Label>Property Type</Label>
                <View className="flex-row flex-wrap mt-1">
                  {PROPERTY_TYPES.map((t) => (
                    <Chip key={t} active={ptype === t} onPress={() => setPtype(t)}>
                      {t}
                    </Chip>
                  ))}
                </View>
              </View>

              <View>
                <Label>Rent Price (per month)</Label>
                <Input
                  placeholder="e.g., 45000"
                  value={price}
                  onChangeText={setPrice}
                  inputMode="numeric"
                  left={<Text className="text-gray-500 mr-2">LKR</Text>}
                />
              </View>
            </View>
          </Card>

          <Card title="Location Details">
            <View className="gap-6">
              <View>
                <Label>Address</Label>
                <Input placeholder="Street, city, region" value={address} onChangeText={setAddress} />
              </View>

              <View>
                <Label>Coordinates</Label>
                <View className="flex-row gap-3 mt-1">
                  <View className="flex-1">
                    <Text className="text-gray-500 text-sm mb-2">Latitude</Text>
                    <Input placeholder="Latitude" value={lat} onChangeText={setLat} inputMode="decimal" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-500 text-sm mb-2">Longitude</Text>
                    <Input placeholder="Longitude" value={lng} onChangeText={setLng} inputMode="decimal" />
                  </View>
                </View>
              </View>

              <TouchableOpacity
                className="flex-row items-center mt-2 justify-center bg-gray-100 px-4 py-4 rounded-xl border border-gray-200"
                onPress={handleUseCurrentLocation}
              >
                <Ionicons name="location" size={18} color="#3cc172" />
                <Text className="text-gray-700 font-medium ml-2">Use Current Location</Text>
              </TouchableOpacity>
            </View>
          </Card>

          <Card title="Property Images" subtitle="Add at least one image of your property">
            <View className="flex-row flex-wrap mt-2">
              {images.map((img, idx) => (
                <View key={`${img.uri}-${idx}`} className="mr-3 mb-3 relative">
                  <Image source={{ uri: img.uri }} className="w-24 h-24 rounded-xl" />
                  <TouchableOpacity
                    className="absolute -top-2 -right-2 bg-red-500 w-6 h-6 rounded-full items-center justify-center shadow"
                    onPress={() => removeImage(idx)}
                  >
                    <Ionicons name="close" color="#fff" size={14} />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                onPress={pickImages}
                className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 items-center justify-center bg-gray-50"
              >
                <Ionicons name="add" size={28} color="#9ca3af" />
                <Text className="text-gray-500 text-xs mt-1">Add Images</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </ScrollView>

        {/* Fixed bottom submit bar */}
        <SafeAreaView
          edges={['bottom']}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
            paddingVertical: 12,
            paddingHorizontal: 16,
          }}
        >
          <View className="items-center">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              className={`w-64 py-3 rounded-xl items-center ${
                isSubmitting ? 'bg-[#3cc172]/70' : 'bg-[#3cc172]'
              }`}
              activeOpacity={0.9}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-base">Submit Listing</Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}