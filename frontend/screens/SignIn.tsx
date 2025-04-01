import React, { useState } from 'react';
import API_CONFIG from '../config/api';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';

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
  const [phonenumber, setPhoneNumber] = useState('');
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
      if (!phonenumber.trim()) {
        setError('phonenumber is required');
        Toast.show({
          type: 'error',
          text1: 'Invalid Input',
          text2: 'phonenumber is required',
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

      // Make API request to login
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SIGNIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phonenumber: phonenumber.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful - store credentials and login state
        await Promise.all([
          AsyncStorage.setItem('isLoggedIn', 'true'),
          AsyncStorage.setItem('userNumber', phonenumber.trim()),
          AsyncStorage.setItem('userPassword', password.trim())
        ]);
        
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Login successful!',
        });
        navigation.replace('Home');
      } else {
        // Handle different error cases
        let errorMessage = '';
        switch (response.status) {
          case 400:
            errorMessage = 'Phone number and password required';
            break;
          case 401:
            errorMessage = 'Invalid credentials';
            break;
          default:
            errorMessage = data.message || 'An error occurred. Please try again.';
        }
        setError(errorMessage);
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: errorMessage,
        });
      }
    } catch (err) {
      const errorMessage = 'Network error. Please check your connection and try again.';
      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: errorMessage,
      });
      console.error('Login error:', err);
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
          <Text style={styles.signUpText}>Sign In</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your Phone Number"
              value={phonenumber}
              onChangeText={setPhoneNumber}
              autoCapitalize="none"
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
              <Text style={styles.nextButtonText}>Log In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signInContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signInLink}>Sign up</Text>
            </TouchableOpacity>
            <Text style={styles.signInText}> • </Text>
            <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
              <Text style={styles.signInLink}>Forgot password</Text>
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

export default SignIn;