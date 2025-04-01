import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { SignupResponse, UserData, ApiError } from '../types/api';
import API_CONFIG from '../config/api';

type SignUpScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SignUp'>;
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

const SignUp = () => {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleNext = async () => {
    try {
      // Clear any previous errors
      setError('');
      setLoading(true);

      // Basic validation
      if (!name.trim()) {
        setError('Username is required');
        Toast.show({
          type: 'error',
          text1: 'Invalid Input',
          text2: 'Username is required',
        });
        return;
      }
      if (!phoneNumber.trim() || phoneNumber.length !== 10) {
        setError('Please enter a valid 10-digit phone number');
        Toast.show({
          type: 'error',
          text1: 'Invalid Input',
          text2: 'Please enter a valid 10-digit phone number',
        });
        return;
      }
      if (!password.trim() || password.length < 6) {
        setError('Password must be at least 6 characters');
        Toast.show({
          type: 'error',
          text1: 'Invalid Input',
          text2: 'Password must be at least 6 characters',
        });
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SIGNUP}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          mobile: phoneNumber.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      // Validate response data structure
      if (!data || typeof data.status !== 'string' || typeof data.message !== 'string') {
        throw new Error('Invalid server response format');
      }

      const typedData = data as SignupResponse;

      if (typedData.status === 'success') {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: typedData.message
        });

        const userData: UserData = {
          name: name.trim(),
          phoneNumber: phoneNumber.trim(),
        };

        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        
        // Navigate to verification screen
        navigation.replace('SignUpVerification', userData);
      } else {
        setError(typedData.message);
        Toast.show({
          type: 'error',
          text1: 'Signup Failed',
          text2: typedData.message
        });
      }
    } catch (err) {
      let errorMessage = 'Network error. Please check your connection and try again.';
      
      if (err instanceof Error) {
        // Handle specific error cases
        if (err.message === 'Invalid server response format') {
          errorMessage = 'Unexpected server response. Please try again later.';
        } else if (err instanceof TypeError) {
          errorMessage = 'Unable to connect to server. Please check your internet connection.';
        }
        
        const apiError = err as ApiError;
        if (apiError.status === 429) {
          errorMessage = 'Too many attempts. Please try again later.';
        }
        
        console.error('Signup error:', err.message);
      }

      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LinearGradient
        colors={['#c60053', '#e8099c']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1.25, y: 0 }}
        style={styles.container}
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.topSection}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.appName}>PRICELY</Text>
        </View>
        
        <View style={styles.bottomSection}>
          <Text style={styles.signUpText}>Sign Up</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Your Name"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { flex: 1, borderWidth: 0 }]}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#666"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
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
              <Text style={styles.nextButtonText}>Next</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.signInLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
      <Toast />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    elevation: 10, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  signUpText: {
    fontSize: width * 0.07,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#c60053', // Updated header text color
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
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  nextButton: {
    backgroundColor: '#e8099c',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
    color: '#e8099c',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#f598d0', // Lighter pink when disabled
    opacity: 0.7,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 10,
    backgroundColor: 'white',
  },
  eyeIcon: {
    padding: 10,
    marginRight: 5,
  },
});

export default SignUp;
