import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
    zIndex: 100,
  },
  toastContainer: {
    width: '100%',
    backgroundColor: '#1a1a1a', // Dark theme background
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#00ff00', // Neon green border
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  toastText1: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ff00', // Neon green text
    marginRight: 24, // Space for close button
  },
  toastText2: {
    fontSize: 16,
    color: '#ffffff',
    marginTop: 4,
    marginRight: 24,
  },
  dismissButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  glowAnimation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  }
});

interface CustomToastProps {
  isVisible: boolean;
  onDismiss: () => void;
  text1: string;
  text2: string;
}

const CustomToast = (props: CustomToastProps) => {
const { isVisible, onDismiss, text1, text2 } = props;
const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
const glowAnim = new Animated.Value(0);

useEffect(() => {
    if (isVisible) {
      // Create glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      const id = setTimeout(() => {
        onDismiss();
      }, 5000);
      setTimerId(id);
    }
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [isVisible, onDismiss]);

  const handleDismiss = () => {
    if (timerId) {
      clearTimeout(timerId);
    }
    onDismiss();
  };

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.toastContainer}>
        <Animated.View
          style={[
            styles.glowAnimation,
            {
              backgroundColor: '#00ff00',
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.1, 0.3],
              }),
            },
          ]}
        />
        <Text style={styles.toastText1}>{text1}</Text>
        <Text style={styles.toastText2}>{text2}</Text>
        <TouchableOpacity onPress={handleDismiss} style={styles.dismissButton}>
          <Ionicons name="close-circle" size={24} color="#00ff00" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function Notifications() {
  const [showNotification, setShowNotification] = useState(true);

  const showToast = () => {
    setShowNotification(true);
  };

  useEffect(() => {
    showToast();
    return () => {};
  }, []);

  return (
    <CustomToast
      isVisible={showNotification}
      onDismiss={() => setShowNotification(false)}
      text1="Special Offer! 🎉"
      text2="Monthly subscription for the first month is ₹100 only!"
    />
  );
}