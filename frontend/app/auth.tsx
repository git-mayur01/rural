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
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getUserProfile } from '../lib/firestore';
import { useAppStore } from '../store/useAppStore';
import { getLanguageStrings } from '../lib/languages';

export default function AuthScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser, setUserProfile, language } = useAppStore();
  const strings = getLanguageStrings(language);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('त्रुटी', 'कृपया ईमेल आणि पासवर्ड प्रविष्ट करा');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const profile = await getUserProfile(userCredential.user.uid);
      
      setUser(userCredential.user);
      setUserProfile(profile);

      if (!profile) {
        router.replace('/signup');
      } else {
        router.replace('/chat');
      }
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        Alert.alert('त्रुटी', 'खाते आढळले नाही. कृपया साइन अप करा.');
      } else if (error.code === 'auth/wrong-password') {
        Alert.alert('त्रुटी', 'चुकीचा पासवर्ड');
      } else {
        Alert.alert('लॉगिन अयशस्वी', error.message);
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
            <View style={styles.logoContainer}>
              <Ionicons name="hammer" size={32} color="#FF6B00" />
              <Text style={styles.logoText}>NyAI-Setu</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Join the Digital Justice Initiative</Text>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Email/Mobile */}
            <Text style={styles.label}>ईमेल/मोबाइल नंबर</Text>
            <TextInput
              style={styles.input}
              placeholder="ईमेल किंवा फोन नंबर"
              placeholderTextColor="#A0785A"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Password */}
            <Text style={styles.label}>PASSWORD</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
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

            <TouchableOpacity onPress={() => router.push('/forgot-password')}>
              <Text style={styles.forgotText}>ओळखपत्र विसरलात?</Text>
            </TouchableOpacity>

            {/* Continue Button */}
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.continueButtonText}>पुढे चला</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>किंवा सुरू ठेवा</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Buttons */}
            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-google" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-apple" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Bottom Link */}
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={styles.bottomText}>
                खाते नाही? <Text style={styles.bottomLink}>साइन अप</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>PRIVACY POLICY</Text>
            <Text style={styles.footerText}>TERMS OF DHARMA</Text>
            <Text style={styles.footerText}>REGULATORY COMPLIANCE</Text>
          </View>

          <Text style={styles.copyright}>© 2024 NYAI-SETU. BUILT FOR SOVEREIGN JUSTICE</Text>
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
    marginTop: 20,
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B00',
    letterSpacing: 1,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#A0785A',
    marginBottom: 32,
    letterSpacing: 1,
  },
  formContainer: {
    backgroundColor: '#2A1500',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A0785A',
    marginBottom: 12,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#1E1200',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.3)',
    marginBottom: 24,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1200',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.3)',
    marginBottom: 12,
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
  forgotText: {
    fontSize: 14,
    color: '#FF6B00',
    textAlign: 'right',
    marginBottom: 24,
  },
  continueButton: {
    backgroundColor: '#FF6B00',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 1,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 107, 0, 0.3)',
  },
  dividerText: {
    fontSize: 12,
    color: '#A0785A',
    marginHorizontal: 12,
    letterSpacing: 1,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  socialButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1E1200',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.3)',
  },
  bottomText: {
    fontSize: 14,
    color: '#A0785A',
    textAlign: 'center',
  },
  bottomLink: {
    color: '#FF6B00',
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 16,
  },
  footerText: {
    fontSize: 10,
    color: '#A0785A',
    letterSpacing: 1,
  },
  copyright: {
    fontSize: 10,
    color: '#A0785A',
    textAlign: 'center',
    letterSpacing: 1,
  },
});