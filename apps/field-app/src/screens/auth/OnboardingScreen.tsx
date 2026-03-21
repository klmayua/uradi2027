import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation();

  const features = [
    {
      icon: 'shield-checkmark',
      title: 'Blockchain Verified Evidence',
      description: 'Every photo is geotagged and anchored to the blockchain for immutable proof.',
    },
    {
      icon: 'location',
      title: 'GPS Verification',
      description: 'Ensure you are at the correct polling unit before capturing evidence.',
    },
    {
      icon: 'cloud-offline',
      title: 'Works Offline',
      description: 'Capture evidence without internet. Sync automatically when connected.',
    },
    {
      icon: 'people',
      title: 'Election Monitoring',
      description: 'Track accreditation, vote tallies, and incidents in real-time.',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="shield-checkmark" size={64} color="#D4AF37" />
          </View>
          <Text style={styles.title}>Uradi Monitor</Text>
          <Text style={styles.subtitle}>
            The citizen-owned election transparency platform
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name={feature.icon as any} size={28} color="#D4AF37" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login' as never)}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          By using this app, you agree to help ensure free and fair elections.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 48,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  featuresContainer: {
    marginBottom: 48,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#222222',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
});

export default OnboardingScreen;
