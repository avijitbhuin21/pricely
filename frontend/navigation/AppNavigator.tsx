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

// Define the root stack parameter list
export type RootStackParamList = {
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
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignIn">
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}