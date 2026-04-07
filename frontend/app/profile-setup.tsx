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
import { Picker } from '@react-native-picker/picker';
import { createUserProfile } from '../lib/firestore';
import { useAppStore } from '../store/useAppStore';
import { getLanguageStrings, MAHARASHTRA_DISTRICTS } from '../lib/languages';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { user, setUserProfile, language } = useAppStore();
  const strings = getLanguageStrings(language);

  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [district, setDistrict] = useState('Nagpur');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
    }
  };

  const handleSubmit = async () => {
    if (!firstName || !surname || !district || !dateOfBirth) {
      Alert.alert('त्रुटी', 'कृपया सर्व फील्ड भरा');
      return;
    }

    if (!user) {
      Alert.alert('त्रुटी', 'वापरकर्ता आढळला नाही');
      return;
    }

    setLoading(true);
    try {
      const profile = await createUserProfile(user.uid, {
        firstName,
        surname,
        email,
        district,
        dateOfBirth,
        language: 'mr',
      });

      setUserProfile(profile);
      router.replace('/chat');
    } catch (error: any) {
      Alert.alert('प्रोफाइल तयार करण्यात अयशस्वी', error.message);
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
              <Ionicons name="scale" size={28} color="#FF6B00" />
              <Text style={styles.logoText}>NyAI-Setu</Text>
            </View>
            <View style={styles.avatar}>
              <Ionicons name="person" size={32} color="#FF6B00" />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Create Profile</Text>
          <Text style={styles.subtitle}>SECURE DIGITAL DHARMA IDENTITY</Text>

          {/* Form */}
          <View style={styles.form}>
            {/* First Name */}
            <TextInput
              style={styles.input}
              placeholder={strings.firstName}
              placeholderTextColor="#A0785A"
              value={firstName}
              onChangeText={setFirstName}
            />

            {/* Surname */}
            <TextInput
              style={styles.input}
              placeholder={strings.surname}
              placeholderTextColor="#A0785A"
              value={surname}
              onChangeText={setSurname}
            />

            {/* Email with OTP */}
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder={strings.email}
                placeholderTextColor="#A0785A"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.otpButton}>
                <Text style={styles.otpButtonText}>{strings.getOTP}</Text>
              </TouchableOpacity>
            </View>

            {/* OTP Input */}
            <Text style={styles.label}>{strings.enterOTP}</Text>
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

            {/* Security Credentials */}
            <Text style={styles.sectionTitle}>SECURITY CREDENTIALS</Text>

            <TextInput
              style={styles.input}
              placeholder={strings.setPassword}
              placeholderTextColor="#A0785A"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder={strings.confirmPassword}
              placeholderTextColor="#A0785A"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            {/* District */}
            <Text style={styles.label}>{strings.district}</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={district}
                onValueChange={(value) => setDistrict(value)}
                style={styles.picker}
                mode="dialog"
                dropdownIconColor="#FF6B00"
              >
                {MAHARASHTRA_DISTRICTS.map((d) => (
                  <Picker.Item key={d} label={d} value={d} color="#111111" />
                ))}
              </Picker>
            </View>

            {/* Date of Birth */}
            <Text style={styles.label}>{strings.dateOfBirth}</Text>
            <TextInput
              style={styles.input}
              placeholder="mm/dd/yyyy"
              placeholderTextColor="#A0785A"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
            />
          </View>

          {/* Illustration */}
          <View style={styles.illustration}>
            <Ionicons name="scale" size={80} color="rgba(255, 107, 0, 0.3)" />
            <Text style={styles.quote}>
              "Justice is the bridge between human action and cosmic order."
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.submitButtonText}>{strings.submitVerify}</Text>
            )}
          </TouchableOpacity>

          {/* Terms */}
          <TouchableOpacity>
            <Text style={styles.terms}>
              By continuing, you agree to the{' '}
              <Text style={styles.termsLink}>{strings.termsOfService}</Text>
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2A1500',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FF6B00',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#A0785A',
    marginBottom: 32,
    letterSpacing: 1,
  },
  form: {
    gap: 16,
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
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  otpButton: {
    backgroundColor: '#FF6B00',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  otpButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A0785A',
    marginTop: 8,
    letterSpacing: 1,
  },
  otpContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 8,
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
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A0785A',
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: 1,
  },
  pickerContainer: {
    backgroundColor: '#2A1500',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.3)',
    overflow: 'hidden',
  },
  picker: {
    color: '#FFF',
    height: 50,
  },
  illustration: {
    alignItems: 'center',
    marginVertical: 32,
  },
  quote: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#A0785A',
    textAlign: 'center',
    marginTop: 16,
    maxWidth: '80%',
  },
  submitButton: {
    backgroundColor: '#FF6B00',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 1,
  },
  terms: {
    fontSize: 12,
    color: '#A0785A',
    textAlign: 'center',
  },
  termsLink: {
    color: '#FF6B00',
    textDecorationLine: 'underline',
  },
});
