import React, { useEffect, useState } from 'react';
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
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { updateUserProfile } from '../lib/firestore';
import { useAppStore } from '../store/useAppStore';
import { MAHARASHTRA_DISTRICTS } from '../lib/languages';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, userProfile, setUserProfile } = useAppStore();
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [district, setDistrict] = useState('Nagpur');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.firstName || '');
      setSurname(userProfile.surname || '');
      setDistrict(userProfile.district || 'Nagpur');
      setDateOfBirth(userProfile.dateOfBirth || '');
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!user || !userProfile) return;
    if (!firstName.trim() || !surname.trim() || !district || !dateOfBirth.trim()) {
      Alert.alert('त्रुटी', 'कृपया सर्व फील्ड भरा');
      return;
    }

    setLoading(true);
    try {
      await updateUserProfile(user.uid, {
        firstName: firstName.trim(),
        surname: surname.trim(),
        district,
        dateOfBirth: dateOfBirth.trim(),
      });

      setUserProfile({
        ...userProfile,
        firstName: firstName.trim(),
        surname: surname.trim(),
        district,
        dateOfBirth: dateOfBirth.trim(),
      });

      Alert.alert('यश', 'प्रोफाइल अपडेट झाले');
      router.back();
    } catch (error: any) {
      Alert.alert('त्रुटी', error.message || 'प्रोफाइल अपडेट करण्यात अयशस्वी');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user?.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      Alert.alert('यश', 'पासवर्ड बदलण्यासाठी ईमेल पाठवली आहे.');
    } catch (error: any) {
      Alert.alert('त्रुटी', error.message || 'ईमेल पाठवता आली नाही');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FF6B00" />
            </TouchableOpacity>
            <Text style={styles.title}>प्रोफाइल संपादित करा</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="नाव"
              placeholderTextColor="#A0785A"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              style={styles.input}
              placeholder="आडनाव"
              placeholderTextColor="#A0785A"
              value={surname}
              onChangeText={setSurname}
            />
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={user?.email || ''}
              editable={false}
            />
            <View style={styles.pickerContainer}>
              <Picker selectedValue={district} onValueChange={(value) => setDistrict(value)} style={styles.picker} mode="dialog">
                {MAHARASHTRA_DISTRICTS.map((d) => (
                  <Picker.Item key={d} label={d} value={d} color="#111111" />
                ))}
              </Picker>
            </View>
            <TextInput
              style={styles.input}
              placeholder="जन्मतारीख (dd/mm/yyyy)"
              placeholderTextColor="#A0785A"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
            />

            <TouchableOpacity style={styles.outlinedButton} onPress={handleChangePassword}>
              <Text style={styles.outlinedButtonText}>पासवर्ड बदला</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitButton} onPress={handleSave} disabled={loading}>
              {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.submitButtonText}>सेव्ह करा</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A0A00' },
  scrollContent: { padding: 24, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FF6B00' },
  form: { gap: 14 },
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
  disabledInput: { opacity: 0.7 },
  pickerContainer: {
    backgroundColor: '#2A1500',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.3)',
    overflow: 'hidden',
  },
  picker: { color: '#FFF', height: 50 },
  outlinedButton: {
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#FF6B00',
    paddingVertical: 14,
    alignItems: 'center',
  },
  outlinedButtonText: { color: '#FF6B00', fontSize: 16, fontWeight: '700' },
  submitButton: {
    backgroundColor: '#FF6B00',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: { color: '#000', fontSize: 18, fontWeight: '700' },
});
