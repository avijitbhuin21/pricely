import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

const { width, height } = Dimensions.get('window');

type SignUpVerificationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'SignUpVerification'
>;

const SignUpVerification = () => {
  const navigation = useNavigation<SignUpVerificationScreenNavigationProp>();
  const [code, setCode] = useState('');

  const handleVerify = () => {
    // Check if code is 4 digits
    if (code.length === 4) {
      // Navigate to HomeScreen
      navigation.navigate('Home');
    }
  };

  const handleResendCode = () => {
    // Mock resend logic
    setCode('');
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
          Please enter the 4 digit code sent to Your Number
        </Text>
        
        <View style={styles.codeInputContainer}>
          {[...Array(4)].map((_, index) => (
            <View
              key={index}
              style={styles.codeBox}
            />
          ))}
          <TextInput
            style={styles.codeInput}
            value={code}
            onChangeText={(text) => {
              // Only allow numbers and max 4 digits
              if (/^\d*$/.test(text) && text.length <= 4) {
                setCode(text);
              }
            }}
            keyboardType="number-pad"
            maxLength={4}
            autoFocus={true}
            placeholder="0000"
            placeholderTextColor="#ccc"
            textAlign="center"
          />
        </View>
        
        <TouchableOpacity onPress={handleResendCode}>
          <Text style={styles.resendText}>Resend Code</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
          <Text style={styles.verifyButtonText}>Verify</Text>
        </TouchableOpacity>
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
    marginBottom: 20,
    textAlign: 'center',
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width * 0.7,
    marginBottom: 20,
  },
  codeBox: {
    width: width * 0.15,
    height: width * 0.15,
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 10,
  },
  resendText: {
    color: '#FF1493',
    marginBottom: 20,
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
    fontSize: 24,
    letterSpacing: width * 0.13,
    paddingHorizontal: width * 0.04,
    color: '#000',
    backgroundColor: 'transparent',
  },
});

export default SignUpVerification;