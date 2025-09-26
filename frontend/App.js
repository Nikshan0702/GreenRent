import './global.css'; // Make sure this is imported
import { Text, View, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import signupScreen from './UserScreens/signupScreen';
import onboardingScreen from './components/onboardingScreen';
import loginScreen from './UserScreens/loginScreen';
import ProfileScreen from './UserScreens/ProfileScreen';
import OnboardingScreens from './components/OnboardingScreen1';
import AddProperty from './Property/AddProperty';
import Home from './screens/Home';
// import PropertyDetailsScreen from './Property/PropertyDetailsScreen';
import PropertyList from './Property/PropertyList';
import Myproperties from './Property/Myproperties';
import AppTipsScreen from './screens/AppTipsScreen';
import EcoTipsScreen from './screens/ecoTips';

import AddCertificate from './Property/AddCertificate';
import PropertyDetail from './Property/PropertyDetail';
import SuggestApartments from './Property/SuggestApartments';
import ApartmentSuggestions from './Property/ApartmentSuggestions';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="onboardingScreen"
        // screenOptions={{
        //   headerStyle: {
        //     backgroundColor: '#f59e0b',
        //   },
        //   headerTintColor: '#fff',
        //   headerTitleStyle: {
        //     fontWeight: 'bold',
        //   },
        // }}
      >
        <Stack.Screen 
          name="signupScreen" 
          component={signupScreen}
          options={{ headerShown: false }}
        />

         <Stack.Screen 
          name="onboardingScreen" 
          component={onboardingScreen}
          options={{ headerShown: false }}
        />
         <Stack.Screen 
          name="OnboardingScreens" 
          component={OnboardingScreens}
          options={{ headerShown: false }}
        />

          <Stack.Screen 
          name="loginScreen" 
          component={loginScreen}
          options={{ headerShown: false }}
        />

          <Stack.Screen 
          name="ProfileScreen" 
          component={ProfileScreen}
          options={{ headerShown: false }}
        />

          <Stack.Screen 
          name="AddProperty" 
          component={AddProperty}
          options={{ headerShown: false }}
        />

          <Stack.Screen 
          name="Home" 
          component={Home}
          options={{ headerShown: false }}
        />

          {/* <Stack.Screen 
          name="PropertyDetailsScreen" 
          component={PropertyDetailsScreen}
          options={{ headerShown: false }}
        /> */}

           <Stack.Screen 
          name="PropertyList" 
          component={PropertyList}
          options={{ headerShown: false }}
        />
           <Stack.Screen 
          name="Myproperties" 
          component={Myproperties}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="AppTipsScreen" 
          component={AppTipsScreen}
          options={{ headerShown: false }}
        />
        
        <Stack.Screen 
          name="EcoTipsScreen" 
          component={EcoTipsScreen}
          options={{ headerShown: false }}
        />


         <Stack.Screen 
          name="AddCertificate" 
          component={AddCertificate}
          options={{ headerShown: false }}
        />
         <Stack.Screen 
          name="PropertyDetail" 
          component={PropertyDetail}
          options={{ headerShown: false }}
        />

          <Stack.Screen 
          name="SuggestApartments" 
          component={SuggestApartments}
          options={{ headerShown: false }}
        />


          <Stack.Screen 
          name="ApartmentSuggestions" 
          component={ApartmentSuggestions}
          options={{ headerShown: false }}
          />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}