import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Demo OTP for testing
  const DEMO_OTP = '1234';

  const handleGetOTP = async () => {
    if (!email) {
      Alert.alert('त्रुटी', 'कृपया ईमेल प्रविष्ट करा');
      return;
    }

    setLoading(true);
    try {
      // In real app, send OTP via email service
      // For now, using Firebase Password Reset
      await sendPasswordResetEmail(auth, email);
      setOtpSent(true);
      Alert.alert('यश!', `OTP ${email} वर पाठवली (Demo: 1234)`);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        Alert.alert('त्रुटी', 'या ईमेलसह कोणतेही खाते आढळले नाही');
      } else {
        Alert.alert('त्रुटी', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
    }
  };

  const handleSubmit = async () => {
    const enteredOtp = otp.join('');

    if (enteredOtp.length !== 4) {
      Alert.alert('त्रुटी', 'कृपया 4-अंकी OTP प्रविष्ट करा');
      return;
    }

    if (enteredOtp !== DEMO_OTP) {
      Alert.alert('चुकीचा OTP', 'OTP चुकीचा आहे. कृपया योग्य OTP प्रविष्ट करा.');
      return;
    }

    if (!newPassword) {
      Alert.alert('त्रुटी', 'कृपया नवीन पासवर्ड प्रविष्ट करा');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('त्रुटी', 'पासवर्ड किमान 6 अक्षरांचा असावा');
      return;
    }

    // In real app, update password in Firebase
    Alert.alert('यश!', 'तुमचा पासवर्ड यशस्वीरित्या अपडेट झाला!', [
      {
        text: 'OK',
        onPress: () => router.replace('/auth'),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FF6B00" />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <Ionicons name="hammer" size={24} color="#FF6B00" />
              <Text style={styles.logoText}>NyAI-Setu</Text>
            </View>
            <View style={{ width: 24 }} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>पासवर्द पुनर्स्थापित करा</Text>

          {/* Form */}
          <View style={styles.form}>
            {/* Email with GET OTP button */}
            <Text style={styles.label}>नोंदणीकृत ईमेल/मोबाइल नंबर</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="ईमेल प्रविष्ट करा"
                placeholderTextColor="#A0785A"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!otpSent}
              />
              <TouchableOpacity
                style={styles.otpButton}
                onPress={handleGetOTP}
                disabled={loading || otpSent}
              >
                {loading ? (
                  <ActivityIndicator color="#000" size="small" />
                ) : (
                  <Text style={styles.otpButtonText}>
                    {otpSent ? 'पाठवले' : 'GET OTP'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {otpSent && (
              <>
                {/* OTP Boxes */}
                <Text style={styles.label}>4-अंकी OTP</Text>
                <View style={styles.otpContainer}>
                  {[0, 1, 2, 3].map((index) => (
                    <TextInput
                      key={index}
                      style={styles.otpBox}
                      value={otp[index]}
                      onChangeText={(value) => handleOtpChange(index, value)}
                      keyboardType="number-pad"
                      maxLength={1}
                      placeholderTextColor="#A0785A"
                    />
                  ))}
                </View>

                {/* New Password */}
                <Text style={styles.label}>नवीन पासवर्ड सेट करा</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="किमान 6 अक्षरे"
                    placeholderTextColor="#A0785A"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={24}
                      color="#A0785A"
                    />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          {/* Illustration */}
          <View style={styles.illustration}>
            <Ionicons name="key" size={80} color="rgba(255, 107, 0, 0.3)" />
          </View>

          {/* Submit Button */}
          {otpSent && (
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A0A00',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#A0785A',
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A0785A',
    marginTop: 8,
    letterSpacing: 1,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    backgroundColor: '#2A1500',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.3)',
  },
  otpButton: {
    backgroundColor: '#FF6B00',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: 'center',
    minWidth: 100,
  },
  otpButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginVertical: 16,
  },
  otpBox: {
    width: 64,
    height: 64,
    backgroundColor: '#2A1500',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.3)',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A1500',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.3)',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFF',
  },
  eyeButton: {
    paddingHorizontal: 16,
  },
  illustration: {
    alignItems: 'center',
    marginVertical: 32,
  },
  submitButton: {
    backgroundColor: '#FF6B00',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 1,
  },
});