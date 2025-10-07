// import {
//   KeyboardAvoidingView,
//   Platform,
//   TextInput,
//   TouchableOpacity,
//   ActivityIndicator,
//   View,
//   Image,
//   Text,
//   Alert,
// } from 'react-native';
// import { StatusBar } from 'expo-status-bar';
// import { useState, useEffect, useCallback } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { configureGoogle, googleSignIn } from '../Auth/googleAuth.js';

// // ---- CONFIG: update this once in one place ----
// const API_BASE = 'http://10.0.2.2:4000';
// const LOGIN_URL = `${API_BASE}/UserOperations/login`;
// const GOOGLE_AUTH_URL = `${API_BASE}/UserOperations/google-auth`;

// // Simple email regex for client-side validation
// const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// const LoginScreen = ({ navigation }) => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => { configureGoogle(); }, []);

//   const showError = useCallback((msg) => {
//     setError(msg || 'Something went wrong. Please try again.');
//   }, []);

//   const handleLogin = useCallback(async () => {
//     // Guard: prevent double-press
//     if (isLoading) return;

//     // Client-side validation
//     if (!email || !password) {
//       return showError('Please enter both email and password.');
//     }
//     if (!emailOk(email)) {
//       return showError('Please enter a valid email address.');
//     }

//     try {
//       setIsLoading(true);
//       setError('');

//       const res = await fetch(LOGIN_URL, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         // Your backend lowercases email; do it here too to be consistent
//         body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
//       });

//       const data = await res.json().catch(() => ({}));

//       if (!res.ok) {
//         // Specific message from backend if present
//         // e.g. 401 + 'Please use Google Sign-In for this account'
//         showError(data?.message || 'Login failed.');
//         return;
//       }

//       // Expecting: { success, message, data: { user, token } }
//       const token = data?.data?.token;
//       const user = data?.data?.user;

//       if (!token || !user) {
//         showError('Invalid server response. Please try again.');
//         return;
//       }

//       // Persist auth
//       await AsyncStorage.multiSet([
//         ['auth_token', token],
//         ['auth_user', JSON.stringify(user)],
//       ]);

//       // Optional: navigate to your app’s home screen
//       navigation.replace('Home'); // change to your actual route
//     } catch (e) {
//       showError('Network error. Check that your phone and server are on the same LAN.');
//     } finally {
//       setIsLoading(false);
//     }
//   }, [email, password, isLoading, showError, navigation]);

//   const handleGoogleSignIn = useCallback(async () => {
//     if (isLoading) return;

//     try {
//       setIsLoading(true);
//       setError('');

//       // Your googleSignIn() should return at least { idToken } on success
//       const userInfo = await googleSignIn();
//       if (!userInfo?.idToken) {
//         showError('Google sign-in failed. Please try again.');
//         return;
//       }

//       const res = await fetch(GOOGLE_AUTH_URL, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ idToken: userInfo.idToken }),
//       });

//       const data = await res.json().catch(() => ({}));

//       if (!res.ok) {
//         showError(data?.message || 'Google authentication failed.');
//         return;
//       }

//       const token = data?.data?.token;
//       const user = data?.data?.user;

//       if (!token || !user) {
//         showError('Invalid server response. Please try again.');
//         return;
//       }

//       await AsyncStorage.multiSet([
//         ['auth_token', token],
//         ['auth_user', JSON.stringify(user)],
//       ]);

//       navigation.replace('homeScreen'); // change to your actual route
//     } catch (e) {
//       showError('Google sign-in error. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   }, [isLoading, showError, navigation]);

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       className="flex-1 bg-white"
//     >
//       <StatusBar style="dark" />

//       <View className="flex-1 justify-center items-center px-6">
//         {/* Logo */}
//         <Image
//           source={require('../GreenAssets/1.png')}
//           className="w-48 h-48 mb-6"
//           resizeMode="contain"
//         />

//         {/* Title */}
//         <Text className="text-[#3cc172] text-3xl font-bold mb-6 text-center">
//           Welcome Back
//         </Text>

//         {/* Error Message */}
//         {error ? (
//           <View className="bg-red-100 p-3 rounded-lg mb-6 w-full">
//             <Text className="text-red-700 text-center">{error}</Text>
//           </View>
//         ) : null}

//         {/* Email Input */}
//         <View className="w-full mb-4">
//           <Text className="text-gray-700 text-sm font-semibold mb-2">
//             Email Address
//           </Text>
//           <TextInput
//             className="bg-gray-50 rounded-xl p-4 text-base text-gray-900 border border-gray-200"
//             placeholder="Enter your email"
//             placeholderTextColor="#9ca3af"
//             value={email}
//             onChangeText={(t) => { setEmail(t); if (error) setError(''); }}
//             keyboardType="email-address"
//             autoCapitalize="none"
//             autoCorrect={false}
//             inputMode="email"
//           />
//         </View>

//         {/* Password Input */}
//         <View className="w-full mb-2">
//           <Text className="text-gray-700 text-sm font-semibold mb-2">
//             Password
//           </Text>
//           <TextInput
//             className="bg-gray-50 rounded-xl p-4 text-base text-gray-900 border border-gray-200"
//             placeholder="Enter your password"
//             placeholderTextColor="#9ca3af"
//             value={password}
//             onChangeText={(t) => { setPassword(t); if (error) setError(''); }}
//             secureTextEntry
//             autoCapitalize="none"
//             autoCorrect={false}
//             textContentType="password"
//           />
//         </View>

//         {/* Forgot Password */}
//         <TouchableOpacity
//           className="self-end mb-6"
//           onPress={() => navigation.navigate('forgotPasswordScreen')}
//         >
//           <Text className="text-[#3cc172] font-medium">Forgot Password?</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Footer */}
//       <View className="p-6 bg-white border-t border-gray-100">
//         {/* Login Button */}
//         <TouchableOpacity
//           onPress={handleLogin}
//           className={`py-4 rounded-xl items-center mb-4 ${isLoading ? 'bg-[#3cc172]/60' : 'bg-[#3cc172]'}`}
//           disabled={isLoading}
//         >
//           {isLoading ? (
//             <ActivityIndicator color="white" />
//           ) : (
//             <Text className="text-white font-bold text-lg">Login</Text>
//           )}
//         </TouchableOpacity>

//         {/* Divider */}
//         <View className="flex-row items-center my-4">
//           <View className="flex-1 h-px bg-gray-200" />
//           <Text className="w-10 text-center text-gray-500 text-sm">OR</Text>
//           <View className="flex-1 h-px bg-gray-200" />
//         </View>

//         {/* Google Login */}
//         <TouchableOpacity
//           className={`bg-white py-4 rounded-xl items-center mb-4 border ${isLoading ? 'border-gray-300' : 'border-gray-200'}`}
//           onPress={handleGoogleSignIn}
//           disabled={isLoading}
//         >
//           {isLoading ? (
//             <ActivityIndicator />
//           ) : (
//             <Text className="text-gray-700 font-bold text-base">Sign in with Google</Text>
//           )}
//         </TouchableOpacity>

//         {/* Sign Up Link */}
//         <View className="flex-row justify-center items-center">
//           <Text className="text-gray-500 text-sm">Don't have an account? </Text>
//           <TouchableOpacity onPress={() => navigation.navigate('signupScreen')}>
//             <Text className="text-[#3cc172] font-semibold text-sm">Sign up</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </KeyboardAvoidingView>
//   );
// };

// export default LoginScreen;




import {
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  View,
  Image,
  Text,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureGoogle, googleSignIn } from '../Auth/googleAuth.js';

// ---- CONFIG ----
const API_BASE = 'http://10.0.2.2:4000';
const LOGIN_URL = `${API_BASE}/UserOperations/login`;
const GOOGLE_AUTH_URL = `${API_BASE}/UserOperations/google-auth`;
const GREEN = '#3cc172';

// Simple email regex
const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    configureGoogle();
  }, []);

  const showError = useCallback((msg) => {
    setError(msg || 'Something went wrong. Please try again.');
  }, []);

  const handleLogin = useCallback(async () => {
    if (isLoading) return;

    if (!email || !password) {
      return showError('Please enter both email and password.');
    }
    if (!emailOk(email)) {
      return showError('Please enter a valid email address.');
    }

    try {
      setIsLoading(true);
      setError('');

      const res = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        showError(data?.message || 'Login failed.');
        return;
      }

      const token = data?.data?.token;
      const user = data?.data?.user;

      if (!token || !user) {
        showError('Invalid server response. Please try again.');
        return;
      }

      await AsyncStorage.multiSet([
        ['auth_token', token],
        ['auth_user', JSON.stringify(user)],
      ]);

      navigation.replace('Home');
    } catch (e) {
      showError('Network error. Check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, isLoading, showError, navigation]);

  const handleGoogleSignIn = useCallback(async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      setError('');

      const userInfo = await googleSignIn();
      if (!userInfo?.idToken) {
        showError('Google sign-in failed. Please try again.');
        return;
      }

      const res = await fetch(GOOGLE_AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: userInfo.idToken }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        showError(data?.message || 'Google authentication failed.');
        return;
      }

      const token = data?.data?.token;
      const user = data?.data?.user;

      if (!token || !user) {
        showError('Invalid server response.');
        return;
      }

      await AsyncStorage.multiSet([
        ['auth_token', token],
        ['auth_user', JSON.stringify(user)],
      ]);

      navigation.replace('homeScreen');
    } catch (e) {
      showError('Google sign-in error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, showError, navigation]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <StatusBar style="dark" />
      <View className="flex-1 justify-center items-center px-6">
        {/* Logo */}
        <Image
          source={require('../GreenAssets/1.png')}
          className="w-40 h-40 mb-4"
          resizeMode="contain"
        />

        {/* Title */}
        <Text className="text-[#3cc172] text-3xl font-bold mb-2 text-center">
          Welcome Back
        </Text>
        <Text className="text-gray-500 mb-6 text-base text-center">
          Sign in to continue
        </Text>

        {/* Error Message */}
        {error ? (
          <View className="bg-red-100 border border-red-200 px-3 py-2 rounded-lg mb-5 w-full">
            <Text className="text-red-700 text-center text-sm">{error}</Text>
          </View>
        ) : null}

        {/* Email */}
        <View className="w-full mb-4">
          <Text className="text-gray-700 text-sm font-semibold mb-2">Email</Text>
          <TextInput
            className="bg-gray-50 rounded-lg p-4 text-base text-gray-900 border border-gray-200"
            placeholder="Enter your email"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (error) setError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password */}
        <View className="w-full mb-2">
          <Text className="text-gray-700 text-sm font-semibold mb-2">
            Password
          </Text>
          <TextInput
            className="bg-gray-50 rounded-lg p-4 text-base text-gray-900 border border-gray-200"
            placeholder="Enter your password"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (error) setError('');
            }}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        {/* Forgot Password */}
        <TouchableOpacity
          className="self-end mb-5"
          onPress={() => navigation.navigate('forgotPasswordScreen')}
        >
          <Text className="text-[#3cc172] font-medium">Forgot Password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          className={`py-4 rounded-lg w-full items-center mb-4 ${
            isLoading ? 'bg-[#3cc172]/60' : 'bg-[#3cc172]'
          }`}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Login</Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View className="flex-row items-center my-4 w-full">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="px-2 text-gray-500 text-sm">OR</Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>

        {/* Google Sign-in */}
        <TouchableOpacity
          onPress={handleGoogleSignIn}
          className={`bg-white py-4 rounded-lg items-center w-full border ${
            isLoading ? 'border-gray-300' : 'border-gray-200'
          } mb-4`}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <Text className="text-gray-800 font-semibold text-base">
              Sign in with Google
            </Text>
          )}
        </TouchableOpacity>

        {/* Signup Link */}
        <View className="flex-row justify-center items-center mt-2">
          <Text className="text-gray-500 text-sm">Don’t have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('signupScreen')}
          >
            <Text className="text-[#3cc172] font-semibold text-sm">Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;