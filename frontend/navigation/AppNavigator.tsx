import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import SignUp from '../screens/SignUp';
import SignUpVerification from '../screens/singUpVerification';
import SignIn from '../screens/SignIn';
import CompareResultScreen from '../screens/CompareResultScreen';
import ResetPassword from '../screens/ResetPassword';
import ProfileScreen from '../screens/ProfileScreen';
import CartScreen from '../screens/Cart';
import OffersScreen from '../screens/OffersScreen';
import MemberScreen from '../screens/Member';
import SplashScreen from '../screens/SplashScreen';
import TermsScreen from '../components/terms';
import ContactUsScreen from '../components/contactUs';
import PrivacyPolicyScreen from '../components/privacy';
import AboutUsScreen from '../components/aboutUs';


// Define the root stack parameter list
export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  CompareResult: {
    query: string;
    onSearchComplete?: (imageUrl: string) => void;
  };
  Profile: undefined;
  Cart: undefined;
  Offers: undefined;
  SignUp: undefined;
  SignUpVerification: {
    phoneNumber: string;
    name?: string;
    password?: string;
    newPassword?: string;
    isResettingPassword?: boolean;
  };
  SignIn: undefined;
  ResetPassword: undefined;
  Member: undefined;
  Terms: undefined;
  ContactUs: undefined;
  privacy: undefined;
  aboutus: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignIn"
          component={SignIn}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ResetPassword"
          component={ResetPassword}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUp}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUpVerification"
          component={SignUpVerification}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CompareResult"
          component={CompareResultScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Offers"
          component={OffersScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Member"
          component={MemberScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Terms"
          component={TermsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ContactUs"
          component={ContactUsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="privacy"
          component={PrivacyPolicyScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="aboutus"
          component={AboutUsScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}