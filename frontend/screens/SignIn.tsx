import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SignInScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SignIn'>;
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const SignIn = () => {
  const navigation = useNavigation<SignInScreenNavigationProp>();
  const [number, setNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    try {
      // Clear any previous errors
      setError('');
      setLoading(true);

      // Basic validation
      if (!number.trim() || number.length !== 10) {
        setError('Please enter a valid 10-digit phone number');
        return;
      }
      if (!password.trim() || password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      // Get stored user data
      const storedUserData = await AsyncStorage.getItem('userData');
      if (!storedUserData) {
        setError('No account found. Please sign up first.');
        return;
      }

      const userData = JSON.parse(storedUserData);
      
      // Validate credentials
      if (userData.phoneNumber === number.trim() && userData.password === password.trim()) {
        // Store login status
        await AsyncStorage.setItem('isLoggedIn', 'true');
        
        // Navigate to Home screen
        navigation.replace('Home');
      } else {
        setError('Invalid phone number or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.topSection}>
        <Text style={styles.welcomeText}>Welcome to</Text>
        <Text style={styles.appName}>PRICELY</Text>
      </View>
      
      <View style={styles.bottomSection}>
        <Text style={styles.signUpText}>Sign In</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            value={number}
            onChangeText={setNumber}
            keyboardType="phone-pad"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#666"
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.nextButton, loading && styles.disabledButton]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.nextButtonText}>Log In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signInLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF1493', // Hot pink background
  },
  topSection: {
    flex: 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: height * 0.05,
  },
  welcomeText: {
    color: 'white',
    fontSize: width * 0.05,
  },
  appName: {
    color: 'white',
    fontSize: width * 0.1,
    fontWeight: 'bold',
  },
  bottomSection: {
    flex: 0.7,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: width * 0.1,
    paddingTop: height * 0.05,
  },
  signUpText: {
    fontSize: width * 0.07,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    color: 'gray',
  },
  input: {
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 10,
    padding: 15,
    backgroundColor: 'white',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  nextButton: {
    backgroundColor: '#FF1493',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  nextButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: width * 0.05,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signInText: {
    color: 'gray',
  },
  signInLink: {
    color: '#FF1493',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ffb6c1', // Lighter pink when disabled
    opacity: 0.7,
  },
});

export default SignIn;