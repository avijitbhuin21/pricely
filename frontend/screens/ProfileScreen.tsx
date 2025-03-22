import React, { useContext, useRef, useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Platform,
  Switch,
  StatusBar,
  TextInput
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { UserContext, UserContextType } from '../contexts/UserContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

type RootStackParamList = {
  Home: undefined;
  CompareResult: { query: string };
  Profile: undefined;
};

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { userName, location, setLocation, setUserName } = useContext(UserContext) as UserContextType;
  const navigation = useNavigation<NavigationProp<RootStackParamList, 'Profile'>>();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const spinValue = useRef(new Animated.Value(0)).current;

  // Toggle states
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationTrackingEnabled, setLocationTrackingEnabled] = useState(true);

  // Demo profile details
  const userId = 'USER12345';
  const [email, setEmail] = useState('Demo@example.com');
  const phoneNumber = '+91 98765 43210';
  const memberSince = 'May 2023';

  const [avatarUri, setAvatarUri] = useState('https://source.unsplash.com/random/300x300?face');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [tempName, setTempName] = useState("Demo");

  useEffect(() => {
    setTempName(userName);
  }, [userName]);
  const [tempEmail, setTempEmail] = useState(email);

  useEffect(() => {
    // Create sequential animations for a more polished experience
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.back(1.7)),
          useNativeDriver: true,
        })
      ]),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();

    // Create a continuous rotation animation for the edit button
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Interpolate the spin value to rotate from 0 to 360 degrees
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            // Animation before navigating away
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(translateY, {
                toValue: 20,
                duration: 300,
                useNativeDriver: true,
              })
            ]).start(() => console.log("Logged out"));
          }
        }
      ]
    );
  };

  const handleAvatarPress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Needed',
          'Please grant camera roll permissions to change your profile picture.'
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        // Save image to app's permanent storage
        const fileName = result.assets[0].uri.split('/').pop();
        const newPath = `${FileSystem.documentDirectory}profile/${fileName}`;

        await FileSystem.makeDirectoryAsync(
          `${FileSystem.documentDirectory}profile/`,
          { intermediates: true }
        );

        await FileSystem.copyAsync({
          from: result.assets[0].uri,
          to: newPath
        });

        setAvatarUri(newPath);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile picture');
    }
  };

  const handleNameEdit = () => {
    if (isEditingName) {
      // Save name changes
      // You would typically make an API call here
      setUserName(tempName);
    }
    setIsEditingName(!isEditingName);
  };

  const handleEmailEdit = () => {
    if (isEditingEmail) {
      // Save email changes
      // You would typically make an API call here
      setEmail(tempEmail); // Assume setEmail is from UserContext
    }
    setIsEditingEmail(!isEditingEmail);
  };

  const renderBadge = (text: string, color: string) => {
    return (
      <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={styles.badgeText}>{text}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      <AnimatedBackground />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Simplified header with only logo and app name */}
          <Animated.View
            style={[
              styles.headerContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: translateY }]
              }
            ]}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.95)', 'rgba(240,249,255,0.93)']}
              style={styles.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.logoContainer}>
                <Image
                  source={require('../assets/logo_rengoku.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <View>
                  <Text style={styles.appName}>Compare It</Text>
                  <Text style={styles.appTagline}>Smart shopping decisions</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Profile card with animation */}
          <Animated.View style={[
            styles.profileCard,
            {
              opacity: cardOpacity,
              transform: [{ scale: scaleAnim }]
            }
          ]}>
            <LinearGradient
              colors={['#ffffff', '#f7f9fc']}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              <View style={styles.avatarContainer}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={handleAvatarPress}
                >
                  <Animated.View style={[styles.avatarInner, { transform: [{ scale: scaleAnim }] }]}>
                    <Image
                      source={{ uri: avatarUri }}
                      style={styles.avatar}
                    />
                  </Animated.View>
                </TouchableOpacity>
                <Animated.View style={[styles.editButtonWrapper, { transform: [{ rotate: spin }] }]}>
                  <TouchableOpacity style={styles.editButton} onPress={pickImage}>
                    <Ionicons name="pencil" size={16} color="#fff" />
                  </TouchableOpacity>
                </Animated.View>
              </View>

              <View style={styles.nameContainer}>
                {isEditingName ? (
                  <TextInput
                    style={styles.editInput}
                    value={tempName}
                    onChangeText={setTempName}
                    autoFocus
                  />
                ) : (
                  <Text style={styles.name}>{tempName}</Text>
                )}
                <TouchableOpacity style={styles.editFieldButton} onPress={handleNameEdit}>
                  <Ionicons
                    name={isEditingName ? "checkmark" : "pencil"}
                    size={16}
                    color="#2196F3"
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.badgeRow}>
                {renderBadge('Premium', '#FFD700')}
                {renderBadge('Verified', '#4CAF50')}
              </View>

              <View style={styles.divider} />

              {/* Profile details with icons - with ripple effect */}
              <View style={styles.infoContainer}>
                <TouchableOpacity style={styles.infoRow} activeOpacity={0.7}>
                  <Ionicons name="person-circle-outline" size={24} color="#2196F3" style={styles.infoIcon} />
                  <View>
                    <Text style={styles.infoLabel}>User ID</Text>
                    <Text style={styles.infoValue}>{userId}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" style={styles.infoArrow} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.infoRow} activeOpacity={0.7}>
                  <Ionicons name="mail-outline" size={24} color="#2196F3" style={styles.infoIcon} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Email Address</Text>
                    {isEditingEmail ? (
                      <TextInput
                        style={styles.editInput}
                        value={tempEmail}
                        onChangeText={setTempEmail}
                        autoFocus
                        keyboardType="email-address"
                      />
                    ) : (
                      <Text style={styles.infoValue}>{email}</Text>
                    )}
                  </View>
                  <TouchableOpacity style={styles.editFieldButton} onPress={handleEmailEdit}>
                    <Ionicons
                      name={isEditingEmail ? "checkmark" : "pencil"}
                      size={16}
                      color="#2196F3"
                    />
                  </TouchableOpacity>
                </TouchableOpacity>

                <TouchableOpacity style={styles.infoRow} activeOpacity={0.7}>
                  <Ionicons name="call-outline" size={24} color="#2196F3" style={styles.infoIcon} />
                  <View>
                    <Text style={styles.infoLabel}>Phone Number</Text>
                    <Text style={styles.infoValue}>{phoneNumber}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" style={styles.infoArrow} />
                </TouchableOpacity>

                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={24} color="#2196F3" style={styles.infoIcon} />
                  <View>
                    <Text style={styles.infoLabel}>Member Since</Text>
                    <Text style={styles.infoValue}>{memberSince}</Text>
                  </View>
                </View>
              </View>

              {/* Settings section */}
              <View style={styles.settingsSection}>
                <Text style={styles.sectionTitle}>Settings</Text>

                {/* <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <MaterialIcons name="notifications" size={24} color="#2196F3" />
                    <Text style={styles.settingText}>Notifications</Text>
                  </View>
                  <Switch
                    trackColor={{ false: "#D1D1D6", true: "#81b0ff" }}
                    thumbColor={notificationsEnabled ? "#2196F3" : "#f4f3f4"}
                    ios_backgroundColor="#D1D1D6"
                    onValueChange={() => setNotificationsEnabled(prev => !prev)}
                    value={notificationsEnabled}
                  />
                </View> */}

                {/* <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <MaterialIcons name="dark-mode" size={24} color="#2196F3" />
                    <Text style={styles.settingText}>Dark Mode</Text>
                  </View>
                  <Switch
                    trackColor={{ false: "#D1D1D6", true: "#81b0ff" }}
                    thumbColor={darkMode ? "#2196F3" : "#f4f3f4"}
                    ios_backgroundColor="#D1D1D6"
                    onValueChange={() => setDarkMode(prev => !prev)}
                    value={darkMode}
                  />
                </View> */}

                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <MaterialIcons name="location-on" size={24} color="#2196F3" />
                    <Text style={styles.settingText}>Location Tracking</Text>
                  </View>
                  <Switch
                    trackColor={{ false: "#D1D1D6", true: "#81b0ff" }}
                    thumbColor={locationTrackingEnabled ? "#2196F3" : "#f4f3f4"}
                    ios_backgroundColor="#D1D1D6"
                    onValueChange={() => setLocationTrackingEnabled(prev => !prev)}
                    value={locationTrackingEnabled}
                  />
                </View>
              </View>

              {/* Additional options */}
              {/* <View style={styles.optionsContainer}>
                <TouchableOpacity style={styles.optionButton}>
                  <FontAwesome5 name="history" size={20} color="#2196F3" />
                  <Text style={styles.optionText}>Order History</Text>
                  <View style={styles.optionBadge}>
                    <Text style={styles.optionBadgeText}>3</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionButton}>
                  <MaterialCommunityIcons name="compass-outline" size={24} color="#2196F3" />
                  <Text style={styles.optionText}>Saved Locations</Text>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionButton}>
                  <Ionicons name="settings-outline" size={24} color="#2196F3" />
                  <Text style={styles.optionText}>Settings</Text>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
              </View> */}

              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#FF5252', '#FF1A1A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.logoutGradient}
                >
                  <Ionicons name="log-out-outline" size={22} color="#fff" />
                  <Text style={styles.logoutText}>Logout</Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.versionContainer}>
                <Text style={styles.versionText}>Version 1.0.0</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* Bottom navigation with only Home and Profile buttons */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.7}
        >
          <View style={styles.navButtonContent}>
            <Ionicons name="home-outline" size={26} color="#757575" />
            <Text style={styles.navText}>Home</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.activeNavButton]}
          activeOpacity={0.7}
        >
          <View style={styles.navButtonContent}>
            <Ionicons name="person" size={26} color="#2196F3" />
            <Text style={[styles.navText, styles.activeNavText]}>Profile</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  headerContainer: {
    width: '100%',
    marginVertical: 15,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerGradient: {
    padding: 15,
    borderRadius: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 52,
    height: 42,
    marginRight: 20,
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2196F3',
    letterSpacing: 0.5,
  },
  appTagline: {
    fontSize: 12,
    color: '#757575',
    fontStyle: 'italic',
  },
  profileCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardGradient: {
    padding: 25,
    borderRadius: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  avatarInner: {
    borderRadius: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#2196F3',
  },
  editButtonWrapper: {
    position: 'absolute',
    right: '30%',
    bottom: 0,
  },
  editButton: {
    backgroundColor: '#2196F3',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 12,
    width: '100%',
    position: 'relative',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 5,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  badgeText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    width: '100%',
    marginVertical: 16,
  },
  infoContainer: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  infoIcon: {
    marginRight: 12,
    width: 24,
  },
  infoArrow: {
    marginLeft: 'auto',
  },
  infoLabel: {
    fontSize: 14,
    color: '#757575',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  settingsSection: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  optionsContainer: {
    marginTop: 15,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  optionBadge: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 25,
    borderRadius: 12,
    overflow: 'hidden',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
    fontWeight: '600',
  },
  versionContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#999',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  navButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  navButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  activeNavButton: {
    borderTopWidth: 3,
    borderTopColor: '#2196F3',
  },
  navText: {
    fontSize: 12,
    color: '#757575',
    marginTop: 5,
    fontWeight: '500',
  },
  activeNavText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  editInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#2196F3',
    paddingVertical: 4,
    minWidth: 150,
    textAlign: 'center',
  },
  editFieldButton: {
    padding: 8,
    position: 'absolute',
    right: 16,
  },
  infoContent: {
    flex: 1,
  },
});

