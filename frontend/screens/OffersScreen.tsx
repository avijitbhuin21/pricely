import React, { useState } from 'react';
import { View, Text, StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import Footer from '../components/Footer';

const OffersScreen: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<string>('Select Location');
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState('');

  const handleLocationSelect = (location: string) => {
    setCurrentLocation(location);
  };

  const handleAutoLocate = () => {
    setCurrentLocation('Detecting location...');
    // Simulate location detection
    setTimeout(() => {
      setCurrentLocation('Current Location');
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.content}>
          <Header
            userName="User"
            currentLocation={currentLocation}
            onLocationSelect={handleLocationSelect}
            onAutoLocate={handleAutoLocate}
          />
          <View style={styles.innerContent}>
            <Text style={styles.text}>Offers Screen</Text>
          </View>
          <Footer navigation={navigation} activeTab={activeTab} setActiveTab={setActiveTab} />
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'snow',
  },
  content: {
    flex: 1,
  },
  innerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    color: '#333',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
});

export default OffersScreen;