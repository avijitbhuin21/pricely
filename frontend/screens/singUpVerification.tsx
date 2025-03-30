import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

const { width, height } = Dimensions.get('window');

type SignUpVerificationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'SignUpVerification'
>;

const SignUpVerification = () => {
  const navigation = useNavigation<SignUpVerificationScreenNavigationProp>();
  const route = useRoute();
  const userData = route.params as {
    name?: string;
    phoneNumber: string;
    password?: string;
    newPassword?: string;
    isResettingPassword?: boolean;
  };
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    try {
      // Check if code is 4 digits
      if (code.length !== 4) {
        setError('Please enter a valid 4-digit code');
        return;
      }

      setLoading(true);
      setError('');

      // Mock verification delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For demo purposes, any 4-digit code works
      if (userData.isResettingPassword && userData.newPassword) {
        // Get stored user data
        const storedUserData = await AsyncStorage.getItem('userData');
        if (!storedUserData) {
          setError('User data not found');
          return;
        }

        const existingData = JSON.parse(storedUserData);
        // Update the password
        const updatedData = {
          ...existingData,
          password: userData.newPassword
        };
        await AsyncStorage.setItem('userData', JSON.stringify(updatedData));
        
        // Show success message and navigate to SignIn
        Alert.alert('Success', 'Your password has been reset', [
          {
            text: 'OK',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'SignIn' }],
              });
            },
          },
        ]);
      } else {
        // Regular signup flow
        await AsyncStorage.setItem('isLoggedIn', 'true');
        navigation.reset({
          index: 0,
          routes: [{ name: 'SignIn' }],
        });
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
      console.error('Verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Mock resend delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCode('');
      Alert.alert('Success', 'Verification code has been resent.');
    } catch (err) {
      setError('Failed to resend code. Please try again.');
      console.error('Resend error:', err);
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
        <Text style={styles.verifyText}>Verify Your Number</Text>
        <Text style={styles.brandName}>PRICELY</Text>
      </View>
      
      <View style={styles.bottomSection}>
        <Text style={styles.headerText}>Account Verification</Text>
        <Text style={styles.instructionText}>
          Please enter the 4 digit code sent to {userData.phoneNumber}
        </Text>
        
        <View style={styles.codeInputContainer}>
          {[...Array(4)].map((_, index) => (
            <View
              key={index}
              style={[
                styles.codeBox,
                code.length > index && styles.codeBoxFilled,
                code.length === index && styles.codeBoxActive
              ]}
            >
              <Text style={styles.codeText}>
                {code[index] || ''}
              </Text>
            </View>
          ))}
          <TextInput
            style={styles.codeInput}
            value={code}
            onChangeText={(text) => {
              // Only allow numbers and max 4 digits
              if (/^\d*$/.test(text) && text.length <= 4) {
                setCode(text);
                setError('');
              }
            }}
            keyboardType="number-pad"
            maxLength={4}
            autoFocus={true}
            caretHidden={true}
            editable={!loading}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <TouchableOpacity 
          onPress={handleResendCode}
          disabled={loading}
        >
          <Text style={[styles.resendText, loading && styles.disabledText]}>
            Resend Code
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.verifyButton, loading && styles.disabledButton]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify</Text>
          )}
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: height * 0.05,
  },
  verifyText: {
    color: 'white',
    fontSize: width * 0.05,
    marginBottom: 10,
  },
  brandName: {
    color: 'white',
    fontSize: width * 0.1,
    fontWeight: 'bold',
  },
  bottomSection: {
    flex: 0.6,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: width * 0.1,
    paddingTop: height * 0.05,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  headerText: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#c60053',
  },
  instructionText: {
    color: 'gray',
    marginBottom: 30,
    textAlign: 'center',
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width * 0.7,
    marginBottom: 30,
  },
  codeBox: {
    width: width * 0.15,
    height: width * 0.15,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    backgroundColor: 'white',
  },
  codeBoxFilled: {
    borderColor: '#c60053',
    backgroundColor: 'white',
  },
  codeBoxActive: {
    borderColor: '#e8099c',
    borderWidth: 3,
  },
  codeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  resendText: {
    color: '#e8099c',
    marginBottom: 20,
    fontSize: 16,
    fontWeight: '600',
  },
  verifyButton: {
    backgroundColor: '#e8099c',
    width: width * 0.7,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  verifyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: width * 0.05,
  },
  codeInput: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.15,
    opacity: 0,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#f598d0',
    opacity: 0.7,
  },
  disabledText: {
    opacity: 0.7,
  },
});

export default SignUpVerification;
