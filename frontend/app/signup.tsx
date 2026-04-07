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
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useAppStore } from '../store/useAppStore';
import {
  NAGPUR_CITIES,
  MAHARASHTRA_DISTRICTS,
  getVillagesByPincode,
  getCityByPincode,
  getDistrictByPincode,
} from '../lib/locationData';

export default function SignUpScreen() {
  const router = useRouter();
  const { language } = useAppStore();

  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [pincode, setPincode] = useState('');
  const [village, setVillage] = useState('');
  const [city, setCity] = useState('Nagpur');
  const [district, setDistrict] = useState('Nagpur');
  const [villages, setVillages] = useState<string[]>([]);

  const handlePincodeChange = (pin: string) => {
    setPincode(pin);
    if (pin.length === 6) {
      const foundVillages = getVillagesByPincode(pin);
      const foundCity = getCityByPincode(pin);
      const foundDistrict = getDistrictByPincode(pin);
      
      if (foundVillages.length > 0) {
        setVillages(foundVillages);
        setCity(foundCity);
        setDistrict(foundDistrict);
        setVillage(foundVillages[0]);
      } else {
        Alert.alert('माहिती', 'या पिनकोडसाठी गावे आढळली नाहीत');
        setVillages([]);
      }
    }
  };

  const handleSubmit = () => {
    if (!firstName || !surname || !email || !dateOfBirth || !pincode || !village) {
      Alert.alert('त्रुटी', 'कृपया सर्व फील्ड भरा');
      return;
    }

    // Validate email
    if (!email.includes('@')) {
      Alert.alert('त्रुटी', 'कृपया वैध ईमेल पत्ता प्रविष्ट करा');
      return;
    }

    // Navigate to password setup
    router.push({
      pathname: '/verify-otp',
      params: {
        firstName,
        surname,
        email,
        dateOfBirth,
        pincode,
        village,
        city,
        district,
        state: 'Maharashtra',
      },
    });
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
          <Text style={styles.title}>Create Profile</Text>
          <Text style={styles.subtitle}>SECURE DIGITAL DHARMA IDENTITY</Text>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="नाव (First Name)"
              placeholderTextColor="#A0785A"
              value={firstName}
              onChangeText={setFirstName}
            />

            <TextInput
              style={styles.input}
              placeholder="आडनाव (Surname)"
              placeholderTextColor="#A0785A"
              value={surname}
              onChangeText={setSurname}
            />

            <TextInput
              style={styles.input}
              placeholder="ईमेल पत्ता"
              placeholderTextColor="#A0785A"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="जन्मतारीख (dd/mm/yyyy)"
              placeholderTextColor="#A0785A"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
            />

            <Text style={styles.label}>पिनकोड</Text>
            <TextInput
              style={styles.input}
              placeholder="6-अंकी पिनकोड"
              placeholderTextColor="#A0785A"
              value={pincode}
              onChangeText={handlePincodeChange}
              keyboardType="number-pad"
              maxLength={6}
            />

            {villages.length > 0 && (
              <>
                <Text style={styles.label}>गाव/शहर</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={village}
                    onValueChange={(value) => setVillage(value)}
                    style={styles.picker}
                    mode="dialog"
                    dropdownIconColor="#FF6B00"
                    itemStyle={styles.pickerItem}
                  >
                    {villages.map((v) => (
                      <Picker.Item key={v} label={v} value={v} color="#111111" />
                    ))}
                  </Picker>
                </View>
              </>
            )}

            <Text style={styles.label}>शहर</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={city}
                onValueChange={(value) => setCity(value)}
                style={styles.picker}
                mode="dialog"
                dropdownIconColor="#FF6B00"
                itemStyle={styles.pickerItem}
              >
                {NAGPUR_CITIES.map((c) => (
                  <Picker.Item key={c} label={c} value={c} color="#111111" />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>जिल्हा</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={district}
                onValueChange={(value) => setDistrict(value)}
                style={styles.picker}
                mode="dialog"
                dropdownIconColor="#FF6B00"
                itemStyle={styles.pickerItem}
              >
                {MAHARASHTRA_DISTRICTS.map((d) => (
                  <Picker.Item key={d} label={d} value={d} color="#111111" />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>राज्य</Text>
            <View style={styles.stateDisplay}>
              <Text style={styles.stateText}>Maharashtra</Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>आधीच खाते आहे? लॉगिन</Text>
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
    fontSize: 12,
    color: '#A0785A',
    marginBottom: 32,
    letterSpacing: 1,
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
  pickerContainer: {
    backgroundColor: '#2A1500',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.3)',
    overflow: 'hidden',
  },
  picker: {
    color: '#FFF',
    backgroundColor: '#2A1500',
    height: 50,
  },
  pickerItem: {
    backgroundColor: '#1E1E1E',
    color: '#111111',
  },
  stateDisplay: {
    backgroundColor: '#2A1500',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.3)',
  },
  stateText: {
    fontSize: 16,
    color: '#A0785A',
  },
  submitButton: {
    backgroundColor: '#FF6B00',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 1,
  },
  backLink: {
    fontSize: 14,
    color: '#FF6B00',
    textAlign: 'center',
  },
});