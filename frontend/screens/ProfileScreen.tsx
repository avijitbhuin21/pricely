import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Define RootStackParamList type for navigation
type RootStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  EditAddresses: undefined;
  Member: undefined;
  ContactUs: undefined;
  privacy: undefined;
  Terms: undefined;
  Notifications: undefined;
  aboutus: undefined;
};

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Check out Pricely - Compare quick commerce prices easily! [Your App Link Here]',
      });
    } catch (error: any) {
      console.error('Error sharing app:', error.message);
    }
  };

  // Navigation Functions
  const navigateToEditProfile = () => navigation.navigate('EditProfile');
  const navigateToEditAddresses = () => navigation.navigate('EditAddresses');
  const navigateToCheckUpdate = () => {
    // TODO: Implement update check logic
    console.log('Checking for updates...');
  };
  const navigateToMemberPlus = () => navigation.navigate('Member');
  const navigateToContactUs = () => navigation.navigate('ContactUs');
  const navigateToPrivacyPolicy = () => navigation.navigate('privacy');
  const navigateToTerms = () => navigation.navigate('Terms');
  const navigateToNotifications = () => navigation.navigate('Notifications');
  const navigateToAboutUs = () => navigation.navigate('aboutus');

  // Define gradient colors as a readonly tuple
  const gradientColors = ['#F8F9FA', '#FFFFFF', '#FFF2F7', '#F8C8DC'] as const;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={gradientColors[0]} />
      <LinearGradient colors={gradientColors} style={styles.gradient}>
        <ScrollView style={styles.scrollView}>
            {/* Header */}
            <View style={styles.headerBar}>
              <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                <Ionicons name="chevron-back" size={28} color="#000000" />
              </TouchableOpacity>
              <View style={styles.headerPlaceholder} />
            </View>

            {/* Profile Info Section */}
            <View style={styles.profileInfoContainer}>
              <Image
                source={require('../assets/member_icon.png')}
                style={styles.avatar}
              />
              <View style={styles.profileTextContainer}>
                <Text style={styles.profileName}>Melvin</Text>
                <Text style={styles.profilePhone}>+91 12345 67890</Text>
                <TouchableOpacity onPress={navigateToEditProfile}>
                  <Text style={styles.editProfileLink}>Edit Profile ›</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Main Options Section */}
            <View style={styles.optionsSection}>
              {/* Edit Addresses Row */}
              <TouchableOpacity style={styles.optionRow} onPress={navigateToEditAddresses}>
                <View style={styles.optionIconText}>
                  <MaterialIcons name="location-on" size={24} color="#555" />
                  <Text style={styles.optionText}>Edit Addresses</Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color="#AAAAAA" />
              </TouchableOpacity>

              {/* Appearance Row */}
              <View style={[styles.optionRow, styles.appearanceRow]}>
                <View style={styles.optionIconText}>
                  <Ionicons name="sunny-outline" size={24} color="#555" />
                  <Text style={styles.optionText}>Appearance</Text>
                </View>
                <View style={styles.appearanceToggle}>
                  <TouchableOpacity
                    style={styles.toggleOption}
                    onPress={() => setAppearance('light')}
                  >
                    <Ionicons
                      name={appearance === 'light' ? 'radio-button-on' : 'radio-button-off'}
                      size={22}
                      color={appearance === 'light' ? '#000000' : '#AAAAAA'}
                    />
                    <Text style={[styles.toggleText, appearance === 'light' && styles.toggleTextActive]}>Light</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.toggleOption}
                    onPress={() => setAppearance('dark')}
                  >
                    <Ionicons
                      name={appearance === 'dark' ? 'radio-button-on' : 'radio-button-off'}
                      size={22}
                      color={appearance === 'dark' ? '#000000' : '#AAAAAA'}
                    />
                    <Text style={[styles.toggleText, appearance === 'dark' && styles.toggleTextActive]}>Dark</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Member+ Banner */}
              <TouchableOpacity style={styles.memberBanner} onPress={navigateToMemberPlus}>
                <Text style={styles.memberTextHighlight}>MEMBER+</Text>
                <View>
                  <Text style={styles.memberTextMain}>Join Now at ₹29</Text>
                  <Text style={styles.memberTextSub}>For 1 Month</Text>
                </View>
              </TouchableOpacity>

              {/* Check App Update Row */}
              <TouchableOpacity style={styles.optionRow} onPress={navigateToCheckUpdate}>
                <View style={styles.optionIconText}>
                  <Ionicons name="sync-circle-outline" size={24} color="#555" />
                  <Text style={styles.optionText}>Check App Update</Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color="#AAAAAA" />
              </TouchableOpacity>
            </View>

            {/* Help & Support Section */}
            <View style={styles.helpSection}>
              <Text style={styles.helpTitle}>Help & Support</Text>

              <TouchableOpacity style={styles.helpRow} onPress={navigateToContactUs}>
                <Ionicons name="call-outline" size={24} color="#555" style={styles.helpIcon} />
                <Text style={styles.helpText}>Contact Us</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.helpRow} onPress={navigateToPrivacyPolicy}>
                <Ionicons name="lock-closed-outline" size={24} color="#555" style={styles.helpIcon} />
                <Text style={styles.helpText}>Privacy Policy</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.helpRow} onPress={navigateToTerms}>
                <Ionicons name="document-text-outline" size={24} color="#555" style={styles.helpIcon} />
                <Text style={styles.helpText}>Terms & Conditions</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.helpRow} onPress={navigateToNotifications}>
                <Ionicons name="notifications-outline" size={24} color="#555" style={styles.helpIcon} />
                <Text style={styles.helpText}>Notifications</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.helpRow} onPress={navigateToAboutUs}>
                <Ionicons name="information-circle-outline" size={24} color="#555" style={styles.helpIcon} />
                <Text style={styles.helpText}>About us</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.helpRow} onPress={handleShare}>
                <Ionicons name="share-social-outline" size={24} color="#555" style={styles.helpIcon} />
                <Text style={styles.helpText}>Share the app</Text>
              </TouchableOpacity>
            </View>
        </ScrollView>
        {/* Footer Branding */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>PRICELY</Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  gradient: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '4%',
    paddingTop: Platform.OS === 'android' ? '3%' : '2%',
    marginBottom: '2%',
  },
  backButton: {
    padding: '2%',
  },
  headerPlaceholder: {
    flex: 1,
  },
  profileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '5%',
    paddingVertical: '4%',
    marginBottom: '3%',
    backgroundColor: '#F0F0F0',
    borderRadius: 15,
    marginHorizontal: '4%',
  },
  avatar: {
    width: '15%',
    aspectRatio: 1,
    borderRadius: 50,
    marginRight: '4%',
    backgroundColor: '#DDD',
  },
  profileTextContainer: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: '1%',
  },
  profilePhone: {
    fontSize: 16,
    color: '#555555',
    marginBottom: '2%',
  },
  editProfileLink: {
    fontSize: 14,
    color: '#888888',
    paddingVertical: '1%',
  },
  optionsSection: {
    paddingHorizontal: '4%',
    marginBottom: '3%',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: '3%',
    paddingHorizontal: '4%',
    borderRadius: 12,
    marginBottom: '2%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  optionIconText: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: '3%',
    flex: 1,
  },
  appearanceRow: {
    paddingVertical: '2%',
  },
  appearanceToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    padding: '1%',
  },
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '2%',
    paddingVertical: '1%',
    marginHorizontal: '1%',
  },
  toggleText: {
    fontSize: 15,
    color: '#AAAAAA',
    marginLeft: '2%',
  },
  toggleTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  memberBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000000',
    paddingVertical: '3%',
    paddingHorizontal: '5%',
    borderRadius: 12,
    marginBottom: '2%',
  },
  memberTextHighlight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  memberTextMain: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'right',
  },
  memberTextSub: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'right',
    marginTop: '1%',
  },
  helpSection: {
    paddingHorizontal: '4%',
    marginTop: '2%',
    marginHorizontal: '4%',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: '3%',
  },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '2%',
  },
  helpIcon: {
    marginRight: '4%',
  },
  helpText: {
    fontSize: 15,
    color: '#333333',
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    paddingVertical: '3%',
  },
  scrollView: {
    flex: 1,
    paddingBottom: 80,
  },
  footerText: {
    fontSize: Platform.OS === 'ios' ? 32 : 28,
    fontWeight: '700',
    color: '#555555',
    textAlign: 'center',
    letterSpacing: 3,
    textTransform: 'uppercase',
    opacity: 0.9,
  }
});

export default ProfileScreen;