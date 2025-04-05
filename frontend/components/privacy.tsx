import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const PrivacyPolicyScreen = () => { // Renamed component for clarity
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const gradientColors = ['#FFFFFF', '#FFF2F7', '#F8C8DC'] as const;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={gradientColors[0]} />
      <LinearGradient colors={gradientColors} style={styles.gradient}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
              <Ionicons name="chevron-back" size={32} color="#000000" />
            </TouchableOpacity>
            {/* Updated Title */}
            <Text style={styles.title}>Privacy Policy</Text>
            <View style={styles.backButtonPlaceholder} />
          </View>

          {/* --- Updated Content Section (Privacy Policy) --- */}
          <View style={styles.content}>
            <Text style={styles.paragraph}>
              This Privacy Policy explains how Pricely (we) collects, uses, and
              protects your information when you use our app. By using Pricely,
              you agree to the practices described in this policy.
            </Text>

            {/* Section 1: Information We Collect */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Information We Collect</Text>
              <Text style={styles.paragraphNoMargin}>
                We collect the following types of information:
              </Text>
              {/* Sub-section a */}
              <Text style={styles.subSectionTitle}>a. Personal Information</Text>
              <Text style={styles.bulletPoint}>
                • Phone Number: Required for registration and login.
              </Text>
              {/* Sub-section b */}
              <Text style={styles.subSectionTitle}>b. Usage Data</Text>
              <Text style={styles.bulletPoint}>
                • App interactions such as searches performed, cart activity, and
                subscription status.
              </Text>
              <Text style={styles.bulletPoint}>
                • Device type, operating system, and version (used to optimize
                app performance).
              </Text>
              <Text style={styles.paragraph}>
                 We do not collect payment information, order data, or any sensitive personal details.
              </Text>
            </View>

            {/* Section 2: How We Use Your Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
              <Text style={styles.paragraphNoMargin}>
                We use your information to:
              </Text>
              <Text style={styles.bulletPoint}>
                • Provide and improve the Pricely experience
              </Text>
              <Text style={styles.bulletPoint}>
                • Track your daily free searches and subscription status
              </Text>
              <Text style={styles.bulletPoint}>
                • Send notifications related to your account, subscription, or
                updates (only if enabled)
              </Text>
              <Text style={styles.bulletPoint}>
                • Analyze user behavior to improve features and user experience
              </Text>
            </View>

            {/* Section 3: Data Sharing */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>3. Data Sharing</Text>
                <Text style={styles.paragraphNoMargin}>
                    We do not sell or rent your personal data.
                </Text>
                 <Text style={styles.paragraph}>
                    We may share limited data with trusted service providers for app infrastructure (like SMS verification or analytics), but they are bound by strict confidentiality obligations.
                 </Text>
            </View>

            {/* Section 4: Security */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>4. Security</Text>
                <Text style={styles.paragraph}>
                    We use standard security practices to protect your information. However, no system is 100% secure, so we recommend using a secure device and keeping your login information confidential.
                </Text>
            </View>

            {/* Section 5: Third-Party Links */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>5. Third-Party Links</Text>
                <Text style={styles.paragraph}>
                    Our app redirects users to third-party platforms (like quick commerce apps). We are not responsible for their content or data practices. Please review their privacy policies before using their services.
                </Text>
            </View>

            {/* Section 6: Data Retention */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>6. Data Retention</Text>
              <Text style={styles.paragraph}>
                We retain your data only as long as your account is active or as needed to provide services. You may request deletion of your data by contacting us.
              </Text>
            </View>

            {/* Section 7: Children’s Privacy */}
             <View style={styles.section}>
                <Text style={styles.sectionTitle}>7. Children’s Privacy</Text>
                <Text style={styles.paragraph}>
                    Pricely is not intended for users under the age of 13. We do not knowingly collect personal data from children.
                </Text>
            </View>

           {/* Section 8: Your Rights */}
           <View style={styles.section}>
             <Text style={styles.sectionTitle}>8. Your Rights</Text>
             <Text style={styles.paragraphNoMargin}>
               As a user, you have the right to:
             </Text>
             <Text style={styles.bulletPoint}>
               • Access the data we hold about you
             </Text>
             <Text style={styles.bulletPoint}>
               • Request correction or deletion of your data
             </Text>
             <Text style={styles.bulletPoint}>
               • Opt out of promotional communications (if any)
             </Text>
           </View>

           {/* Section 9: Changes to This Policy */}
           <View style={styles.section}>
             <Text style={styles.sectionTitle}>9. Changes to This Policy</Text>
             <Text style={styles.paragraph}>
               We may update this Privacy Policy periodically. Any changes will be posted within the app or our website. Continued use of the app constitutes your acceptance of the revised policy.
             </Text>
           </View>

            {/* Section 10: Contact Us */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>10. Contact Us</Text>
              <Text style={styles.paragraphNoMargin}>
                For any questions or concerns about this policy or your data, please contact:
              </Text>
              <Text style={styles.paragraph}>Email: support@pricely.com</Text>
            </View>
          </View>
          {/* --- End of Updated Content Section --- */}

        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

// Styles are reused, added subSectionTitle for clarity
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? 15 : 10,
    paddingBottom: 10,
    width: '100%',
  },
  backButton: {
    padding: 5,
    zIndex: 1,
  },
  backButtonPlaceholder: {
    width: 32 + 5 * 2,
    height: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
    marginBottom: 20,
  },
  paragraphNoMargin: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
    marginBottom: 8, // Less margin before lists or next item
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: { // For main numbered headings
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  subSectionTitle: { // For sub-headings like 'a. Personal Information'
      fontSize: 16,
      fontWeight: 'bold',
      color: '#111111', // Slightly less prominent than main title
      marginTop: 10, // Add some space above sub-section title
      marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
    marginBottom: 8,
    paddingLeft: 5, // Space after the bullet character
  },
});

export default PrivacyPolicyScreen;