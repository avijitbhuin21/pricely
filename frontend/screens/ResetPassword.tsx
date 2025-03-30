import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type ResetPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ResetPassword'>;
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const ResetPassword = () => {
  const navigation = useNavigation<ResetPasswordScreenNavigationProp>();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleNext = async () => {
    try {
      setLoading(true);
      // Basic validation
      if (!phoneNumber.trim() || phoneNumber.length !== 10) {
        setError('Please enter a valid phone number');
        return;
      }
      if (!newPassword.trim() || newPassword.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      // Clear any previous errors
      setError('');

      // Get stored user data to verify phone number
      const storedUserData = await AsyncStorage.getItem('userData');
      if (!storedUserData) {
        setError('No account found with this phone number');
        return;
      }

      const userData = JSON.parse(storedUserData);
      if (userData.phoneNumber !== phoneNumber) {
        setError('No account found with this phone number');
        return;
      }

      // Navigate to verification screen with reset data
      navigation.navigate('SignUpVerification', {
        phoneNumber: phoneNumber.trim(),
        newPassword: newPassword.trim(),
        isResettingPassword: true
      } as any); // Type assertion needed due to navigation params complexity
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Reset Password error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
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
        <Text style={styles.resetText}>Reset Password</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number</Text>
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
          <Text style={styles.label}>New Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1, borderWidth: 0 }]}
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
              placeholderTextColor="#666"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <Ionicons
                name={showNewPassword ? "eye-off" : "eye"}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm New Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1, borderWidth: 0 }]}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              placeholderTextColor="#666"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-off" : "eye"}
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
          <Text style={styles.signInText}>Remember your password? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.signInLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
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
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  resetText: {
    fontSize: width * 0.07,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#c60053',
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
    elevation: 5,
    shadowColor: '#000',
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
    backgroundColor: '#f598d0',
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

export default ResetPassword;