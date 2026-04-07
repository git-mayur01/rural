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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { createUserProfile } from '../lib/firestore';
import { useAppStore } from '../store/useAppStore';

export default function VerifyOTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { setUser, setUserProfile } = useAppStore();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleVerify = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('त्रुटी', 'कृपया पासवर्ड प्रविष्ट करा');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('त्रुटी', 'पासवर्ड जुळत नाहीत');
      return;
    }

    if (password.length < 6) {
      Alert.alert('त्रुटी', 'पासवर्ड किमान 6 अक्षरांचा असावा');
      return;
    }

    setLoading(true);
    try {
      // Create Firebase user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        params.email as string,
        password
      );

      // Create user profile in Firestore
      const profile = await createUserProfile(userCredential.user.uid, {
        firstName: params.firstName as string,
        surname: params.surname as string,
        email: params.email as string,
        district: params.district as string,
        dateOfBirth: params.dateOfBirth as string,
        language: 'mr',
      });

      setUser(userCredential.user);
      setUserProfile(profile);

      Alert.alert('यश!', 'तुमचे खाते यशस्वीरित्या तयार झाले!', [
        { text: 'OK', onPress: () => router.replace('/chat') },
      ]);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('त्रुटी', 'हा ईमेल आधीच वापरला जात आहे');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('त्रुटी', 'अवैध ईमेल पत्ता');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('त्रुटी', 'पासवर्ड खूप कमकुवत आहे');
      } else {
        Alert.alert('नोंदणी अयशस्वी', error.message);
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
          <Text style={styles.title}>Set Password</Text>
          <Text style={styles.subtitle}>आपला खाता सुरक्षित करा</Text>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons name="mail" size={24} color="#FF6B00" />
            <Text style={styles.infoText}>
              {params.email} साठी पासवर्ड सेट करा
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.label}>पासवर्ड सेट करा</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="किमान 6 अक्षरे"
                placeholderTextColor="#A0785A"
                value={password}
                onChangeText={setPassword}
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

            <Text style={styles.label}>पासवर्डची पुष्टी करा</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="पासवर्ड पुन्हा प्रविष्ट करा"
                placeholderTextColor="#A0785A"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={24}
                  color="#A0785A"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Illustration */}
          <View style={styles.illustration}>
            <Ionicons name="shield-checkmark" size={80} color="rgba(255, 107, 0, 0.3)" />
          </View>

          {/* Create Account Button */}
          <TouchableOpacity
            style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
            onPress={handleVerify}
            disabled={loading}
          >
            <Text style={styles.verifyButtonText}>
              {loading ? 'खाते तयार करत आहे...' : 'खाते तयार करा'}
            </Text>
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
    marginTop: 8,
    letterSpacing: 1,
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
  verifyButton: {
    backgroundColor: '#FF6B00',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 1,
  },
});