import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import useAuthStore from '@stores/authStore';

const LoginScreen: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuthStore();

  const handleSendOTP = async () => {
    if (!phone || phone.length < 11) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Phone',
        text2: 'Please enter a valid phone number',
      });
      return;
    }

    setIsLoading(true);

    // In production: Call API to send OTP
    // For now, simulate OTP sending
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      Toast.show({
        type: 'success',
        text1: 'OTP Sent',
        text2: 'Check your SMS for the verification code',
      });
    }, 1500);
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Invalid OTP',
        text2: 'Please enter the 6-digit code',
      });
      return;
    }

    setIsLoading(true);

    try {
      await login(phone, otp);
      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: 'Welcome to Uradi Monitor',
      });
    } catch (error) {
      setIsLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error instanceof Error ? error.message : 'Invalid OTP',
      });
    }
  };

  const formatPhone = (text: string) => {
    // Remove non-digits
    const cleaned = text.replace(/\D/g, '');
    // Limit to 11 digits (Nigerian format)
    return cleaned.slice(0, 11);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {/* Logo/Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="shield-checkmark" size={60} color="#D4AF37" />
          </View>
          <Text style={styles.title}>Uradi Monitor</Text>
          <Text style={styles.subtitle}>
            {step === 'phone'
              ? 'Enter your phone number to continue'
              : 'Enter the verification code sent to your phone'}
          </Text>
        </View>

        {/* Input Section */}
        <View style={styles.form}>
          {step === 'phone' ? (
            <>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number (e.g., 08012345678)"
                  placeholderTextColor="#666666"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={(text) => setPhone(formatPhone(text))}
                  maxLength={11}
                  editable={!isLoading}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSendOTP}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <Text style={styles.buttonText}>Send OTP</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <Ionicons name="key-outline" size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter 6-digit OTP"
                  placeholderTextColor="#666666"
                  keyboardType="number-pad"
                  value={otp}
                  onChangeText={setOtp}
                  maxLength={6}
                  editable={!isLoading}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleVerifyOTP}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <Text style={styles.buttonText}>Verify &amp; Login</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep('phone')}
                disabled={isLoading}
              >
                <Text style={styles.backButtonText}>Back to Phone Number</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    color: '#FFFFFF',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  backButtonText: {
    color: '#D4AF37',
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
});

export default LoginScreen;
