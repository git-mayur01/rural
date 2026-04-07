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
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSendResetEmail = async () => {
    if (!email) {
      Alert.alert('त्रुटी', 'कृपया ईमेल प्रविष्ट करा');
      return;
    }

    // Basic email validation
    if (!email.includes('@')) {
      Alert.alert('त्रुटी', 'कृपया वैध ईमेल पत्ता प्रविष्ट करा');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
      Alert.alert(
        'यश!',
        `पासवर्ड रीसेट लिंक ${email} वर पाठवली आहे. कृपया आपला ईमेल तपासा.`,
        [
          {
            text: 'OK',
            onPress: () => router.replace('/auth'),
          },
        ]
      );
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        Alert.alert('त्रुटी', 'या ईमेलसह कोणतेही खाते आढळले नाही');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('त्रुटी', 'अवैध ईमेल पत्ता');
      } else {
        Alert.alert('त्रुटी', error.message);
      }
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.subtitle}>पासवर्ड पुनर्स्थापित करा</Text>

          {/* Info */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={24} color="#FF6B00" />
            <Text style={styles.infoText}>
              तुमच्या नोंदणीकृत ईमेलवर पासवर्ड रीसेट लिंक पाठवली जाईल
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.label}>नोंदणीकृत ईमेल पत्ता</Text>
            <TextInput
              style={styles.input}
              placeholder="ईमेल प्रविष्ट करा"
              placeholderTextColor="#A0785A"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!emailSent}
            />
          </View>

          {/* Illustration */}
          <View style={styles.illustration}>
            <Ionicons name="key" size={80} color="rgba(255, 107, 0, 0.3)" />
          </View>

          {/* Send Reset Email Button */}
          <TouchableOpacity
            style={[styles.submitButton, (loading || emailSent) && styles.submitButtonDisabled]}
            onPress={handleSendResetEmail}
            disabled={loading || emailSent}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.submitButtonText}>
                {emailSent ? 'ईमेल पाठवली' : 'रीसेट लिंक पाठवा'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>लॉगिन वर परत जा</Text>
          </TouchableOpacity>
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
    marginBottom: 24,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#FF6B00',
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A0785A',
    letterSpacing: 1,
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
  illustration: {
    alignItems: 'center',
    marginVertical: 32,
  },
  submitButton: {
    backgroundColor: '#FF6B00',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 1,
  },
  backLink: {
    alignItems: 'center',
  },
  backLinkText: {
    fontSize: 14,
    color: '#FF6B00',
  },
});