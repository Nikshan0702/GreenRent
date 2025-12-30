import { 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { useState, useEffect } from 'react';
import { configureGoogle, googleSignIn } from '../Auth/googleAuth.js';
import axios from 'axios';
import { Alert } from 'react-native';
import { API_BASE }from '../config/api.js';

export default function RegisterScreen({ navigation }) {

  useEffect(() => {
    configureGoogle();
    console.log('[API_BASE]', API_BASE);
  }, []);

  const handleGoogleSignUp = async () => {
    try {
      const userInfo = await googleSignIn(); // opens Google login
      console.log('Google User Info:', userInfo);

      // Send idToken to your backend for registration
      const response = await fetch('http://10.0.2.2:4000/UserOperations/google-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: userInfo.idToken }),
      });

      const data = await response.json();
      console.log('Backend response:', data);

      // TODO: Save your JWT / navigate to home screen
    } catch (error) {
      console.error('Google sign-up error:', error);
    }
  };

  const [formData, setFormData] = useState({
    uname: '',
    address: '',
    number: '',
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

const handleSubmit = async () => {
  setError('');
  
  // Basic validation
  if (!formData.uname || !formData.email || !formData.password) {
    setError('Please fill in all required fields');
    Alert.alert('Validation Error', 'Please fill in all required fields');
    return;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    setError('Please enter a valid email address');
    Alert.alert('Validation Error', 'Please enter a valid email address');
    return;
  }

  setLoading(true);
  
  try {
    console.log('Attempting to register with:', formData);
    
    // Use API_BASE instead of hardcoded IP
    const response = await axios.post(
      `${API_BASE}/UserOperations/register`, 
      formData,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000 // Increased timeout
      }
    );
    
    console.log('Registration response:', response.data);
    
    if (response.data.success) {
      Alert.alert('Success', 'Registration Successful!');
      navigation.navigate('loginScreen');
    } else {
      const errorMsg = response.data.message || "Registration failed";
      setError(errorMsg);
      Alert.alert('Registration Failed', errorMsg);
    }
  } catch (error) {
    console.error('Registration error:', error);
    
    // More specific error handling
    if (error.code === 'ECONNABORTED') {
      const errorMsg = "Connection timeout. Please check your network connection.";
      setError(errorMsg);
      Alert.alert('Network Timeout', errorMsg);
    } else if (error.response) {
      const errorMsg = error.response.data?.message || 
                       error.response.data?.error || 
                       `Registration failed (Status: ${error.response.status})`;
      setError(errorMsg);
      Alert.alert('Registration Failed', errorMsg);
    } else if (error.request) {
      const errorMsg = "Cannot connect to server. Please make sure the backend is running.";
      setError(errorMsg);
      Alert.alert('Connection Error', errorMsg);
    } else {
      const errorMsg = "Error setting up registration request";
      setError(errorMsg);
      Alert.alert('Error', errorMsg);
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <StatusBar style="dark" />
      
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 mt-28 pt-2 pb-4">
          {/* Title */}
          <Text className="text-[#3cc172] text-3xl font-bold mb-2 text-center">
            Create Account
          </Text>
          <Text className="text-gray-500 text-base mb-6 text-center">
            Join us and start your journey
          </Text>

          {/* Error */}
          {error ? (
            <View className="bg-red-100 border border-red-200 px-3 py-2 rounded-lg mb-4">
              <Text className="text-red-700 text-center text-sm">{error}</Text>
            </View>
          ) : null}

          {/* Full Name */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-semibold mb-2">
              Full name
            </Text>
            <TextInput
              className="bg-gray-50 rounded-lg p-4 text-base text-gray-900 border border-gray-200"
              placeholder="Enter your name"
              placeholderTextColor="#9ca3af"
              value={formData.uname}
              onChangeText={(text) => handleChange('uname', text)}
              keyboardType="default"
              autoCapitalize="words"
              accessibilityLabel="Full name"
            />
          </View>

          {/* Address */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-semibold mb-2">
              Address
            </Text>
            <TextInput
              className="bg-gray-50 rounded-lg p-4 text-base text-gray-900 border border-gray-200"
              placeholder="Enter your address"
              placeholderTextColor="#9ca3af"
              value={formData.address}
              onChangeText={(text) => handleChange('address', text)}
              keyboardType="default"
              autoCapitalize="words"
              accessibilityLabel="Address"
            />
          </View>
          
          {/* Mobile */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-semibold mb-2">
              Mobile number
            </Text>
            <TextInput
              className="bg-gray-50 rounded-lg p-4 text-base text-gray-900 border border-gray-200"
              placeholder="+94 - 77 XX XX XXX"
              placeholderTextColor="#9ca3af"
              value={formData.number}
              onChangeText={(text) => handleChange('number', text)}
              keyboardType="phone-pad"
              accessibilityLabel="Mobile number"
            />
          </View>

          {/* Email */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-semibold mb-2">
              Email
            </Text>
            <TextInput
              className="bg-gray-50 rounded-lg p-4 text-base text-gray-900 border border-gray-200"
              placeholder="Enter your email"
              placeholderTextColor="#9ca3af"
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              accessibilityLabel="Email"
            />
          </View>

          {/* Password */}
          <View className="mb-6">
            <Text className="text-gray-700 text-sm font-semibold mb-2">
              Password
            </Text>
            <TextInput
              className="bg-gray-50 rounded-lg p-4 text-base text-gray-900 border border-gray-200"
              placeholder="Enter your password"
              placeholderTextColor="#9ca3af"
              value={formData.password}
              onChangeText={(text) => handleChange('password', text)}
              secureTextEntry
              autoCapitalize="none"
              accessibilityLabel="Password"
            />
          </View>  
        </View>
      </ScrollView>
      
      {/* Footer CTA */}
      <View className="p-6 bg-white border-t border-gray-100">
        <TouchableOpacity
          className={`py-4 rounded-lg items-center mb-4 ${loading ? 'bg-[#3cc172]/60' : 'bg-[#3cc172]'}`}
          onPress={handleSubmit}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Sign up"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Sign Up</Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View className="flex-row items-center my-4">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="w-10 text-center text-gray-500 text-sm">OR</Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>

        {/* Google Sign up */}
        <TouchableOpacity
          className={`bg-white py-4 rounded-lg items-center mb-4 border ${loading ? 'border-gray-300' : 'border-gray-200'}`}
          onPress={handleGoogleSignUp}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Sign up with Google"
        >
          <Text className="text-gray-800 font-semibold text-base">
            Sign up with Google
          </Text>
        </TouchableOpacity>

        {/* Nav to Login */}
        <View className="flex-row justify-center items-center">
          <Text className="text-gray-500 text-sm">Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('loginScreen')}>
            <Text className="text-[#3cc172] font-semibold text-sm">Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}






