import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar, // Import StatusBar
  Platform, // Import Platform for OS-specific adjustments
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // Hook for navigation

// If using TypeScript with React Navigation, you might have a specific type
// for your navigation prop, e.g., StackNavigationProp<RootStackParamList, 'Terms'>
// For simplicity, we'll use the general type here.
// import { NavigationProp } from '@react-navigation/native';
// type TermsNavigationProp = NavigationProp<any>; // Replace 'any' with your ParamList if defined

const TermsScreen = () => {
  // Use the useNavigation hook to get the navigation object
  const navigation = useNavigation(); // Add type if needed: useNavigation<TermsNavigationProp>();

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
    // Optional: Add fallback behavior if navigation.canGoBack() is false
    // else { console.log("Cannot go back further."); }
  };

  // Define gradient colors based on the image
  const gradientColors = ['#FFFFFF', '#FFF2F7', '#F8C8DC'] as const; // Start White, gentle pink transition, end pink

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Make status bar content dark for better visibility on light background */}
      <StatusBar barStyle="dark-content" backgroundColor={gradientColors[0]} />
      <LinearGradient colors={gradientColors} style={styles.gradient}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false} // Hide scroll bar if desired
        >
          {/* Header Section */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
              {/* Use chevron-back icon */}
              <Ionicons name="chevron-back" size={32} color="#000000" />
            </TouchableOpacity>
            {/* Updated Title */}
            <Text style={styles.title}>Terms and Conditions</Text>
            {/* Empty view for centering title */}
             <View style={styles.backButtonPlaceholder} />
          </View>

          {/* --- Updated Content Section --- */}
          <View style={styles.content}>
            <Text style={styles.paragraph}>
              Welcome to Pricely, an app designed to help you compare product
              prices across various quick commerce platforms in India.
            </Text>

            <Text style={styles.paragraph}>
              By using our services, you agree to the following terms and
              conditions. Please read them carefully.
            </Text>

            {/* Section 1: Eligibility */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                1. Eligibility & Registration
              </Text>
              <Text style={styles.bulletPoint}>
                • To use Pricely, you must register with a valid Indian phone
                number.
              </Text>
              <Text style={styles.bulletPoint}>
                • You are responsible for maintaining the confidentiality of your
                login credentials and for all activities under your account.
              </Text>
            </View>

            {/* Section 2: Services */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Services Provided</Text>
              <Text style={styles.bulletPoint}>
                • Pricely allows users to search and compare prices of products
                across multiple quick commerce platforms.
              </Text>
              <Text style={styles.bulletPoint}>
                • We redirect users to third-party platforms to complete
                purchases. Pricely does not sell any products directly.
              </Text>
            </View>

            {/* Section 3: Subscription */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. Subscription & Usage</Text>
              <Text style={styles.bulletPoint}>
                • All users receive 3 free searches per day.
              </Text>
              <Text style={styles.bulletPoint}>
                • To unlock unlimited searches, users can subscribe to our
                premium plan:
              </Text>
              {/* Indent the sub-bullets */}
              <Text style={[styles.bulletPoint, styles.subBulletPoint]}>
                • First month free for new users
              </Text>
              <Text style={[styles.bulletPoint, styles.subBulletPoint]}>
                • ₹29/month thereafter
              </Text>
              <Text style={[styles.bulletPoint, styles.subBulletPoint]}>
                • Subscription payments are non-refundable once processed.
              </Text>
            </View>

            {/* Section 4: Cart Comparison */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>4. Cart Comparison Feature</Text>
                <Text style={styles.bulletPoint}>
                    • Users can create a virtual cart within Pricely to compare total prices of multiple items across platforms.
                </Text>
                <Text style={styles.bulletPoint}>
                    • This feature is for convenience only. Final prices, delivery charges, and availability may vary on the third-party platform.
                </Text>
            </View>

            {/* Section 5: Third-Party Services */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>5. Third-Party Services</Text>
                <Text style={styles.bulletPoint}>
                    • Pricely is not responsible for the content, pricing, availability, or policies of any third-party apps or websites.
                </Text>
                <Text style={styles.bulletPoint}>
                    • Users must comply with the respective terms and policies of those third-party services.
                </Text>
            </View>

            {/* Section 6: User Conduct */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>6. User Conduct</Text>
                <Text style={styles.paragraphNoMargin}> {/* Using a slightly different style for the intro sentence */}
                    You agree not to:
                </Text>
                <Text style={styles.bulletPoint}>
                    • Use the app for any illegal or unauthorized purpose
                </Text>
                <Text style={styles.bulletPoint}>
                    • Attempt to disrupt or interfere with the app’s functionality
                </Text>
                <Text style={styles.bulletPoint}>
                    • Use bots or automated methods to perform excessive searches
                </Text>
            </View>

            {/* Section 7: Data & Privacy */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>7. Data & Privacy</Text>
                <Text style={styles.bulletPoint}>
                    • We collect basic information such as your phone number and app usage details.
                </Text>
                <Text style={styles.bulletPoint}>
                    • We do not store or process any payment or order data from third-party platforms.
                </Text>
                <Text style={styles.bulletPoint}>
                    • For more, refer to our Privacy Policy.
                </Text>
            </View>

            {/* Section 8: Termination */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>8. Termination</Text>
                <Text style={styles.bulletPoint}>
                    • We reserve the right to suspend or terminate your account if you violate these terms or misuse the service.
                </Text>
            </View>

            {/* Section 9: Changes to Terms */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>9. Changes to Terms</Text>
                <Text style={styles.bulletPoint}>
                    • We may update these terms from time to time. Continued use of the app after such changes means you accept the new terms.
                </Text>
            </View>

            {/* Section 10: Contact Us */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>10. Contact Us</Text>
                 <Text style={styles.paragraphNoMargin}> {/* Using paragraph style without bottom margin */}
                    For any questions, feedback, or support, contact us at:
                </Text>
                <Text style={styles.paragraph}> {/* Standard paragraph for the email */}
                    Email: support@pricely.com
                </Text>
            </View>

          </View>
          {/* --- End of Updated Content Section --- */}

        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Match top gradient color for consistency
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1, // Ensure content can grow to fill space
    paddingBottom: 40, // Add padding at the bottom
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Space out items
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? 15 : 10, // Adjust top padding for OS
    paddingBottom: 10,
    width: '100%',
  },
  backButton: {
    padding: 5, // Increase tap area
    zIndex: 1, // Ensure button is tappable
  },
   backButtonPlaceholder: { // To balance the title correctly with space-between
    width: 32 + (5*2), // Match the icon size + padding of the actual button
    height: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    // flex: 1, // Allow title to take available space if needed for centering
  },
  content: {
    paddingHorizontal: 20, // Horizontal padding for the main text content
    paddingTop: 15,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24, // Improve readability
    color: '#333333', // Slightly softer black
    marginBottom: 20, // Space after paragraphs
  },
  paragraphNoMargin: { // New style for paragraphs without bottom margin (like intro sentences before lists)
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
    marginBottom: 8, // Reduced margin for tighter spacing before a list
  },
  section: {
    marginBottom: 25, // Space between sections
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12, // Space after section title
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
    marginBottom: 8, // Space between bullet points
    // Using paddingLeft instead of marginLeft for reliable alignment with the bullet character
    paddingLeft: 5, // Adjust space between bullet and text start if needed
  },
  subBulletPoint: {
    // Add extra indentation for the sub-items under premium plan
    marginLeft: 15, // Adjust this value for desired indentation
    paddingLeft: 0, // Reset paddingLeft if marginLeft is used
  },
});

export default TermsScreen;