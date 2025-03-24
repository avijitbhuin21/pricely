import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const userData = route.params as { name: string; phoneNumber: string; password: string };
  
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
      // Store login status
      await AsyncStorage.setItem('isLoggedIn', 'true');

      // Navigate to SignIn screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' }],
      });
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
    <View style={styles.container}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF1493',
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
  },
  headerText: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    marginBottom: 10,
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
  },
  codeBoxFilled: {
    borderColor: '#FF1493',
    backgroundColor: '#fff',
  },
  codeBoxActive: {
    borderColor: '#FF1493',
    borderWidth: 3,
  },
  codeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  resendText: {
    color: '#FF1493',
    marginBottom: 20,
    fontSize: 16,
    fontWeight: '600',
  },
  verifyButton: {
    backgroundColor: '#FF1493',
    width: width * 0.7,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
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
    backgroundColor: '#ffb6c1',
    opacity: 0.7,
  },
  disabledText: {
    opacity: 0.7,
  },
});

export default SignUpVerification;
