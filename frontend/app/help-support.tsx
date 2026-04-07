import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ThemedModal from '../components/ThemedModal';

export default function HelpSupportScreen() {
  const router = useRouter();
  const [modal, setModal] = React.useState({ visible: false, title: '', message: '' });

  const handleCall = async (number: string) => {
    const clean = number.replace(/[^\d+]/g, '');
    const url = `tel:${clean}`;
    try {
      await Linking.openURL(url);
    } catch {
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
          return;
        }
      } catch {
        // no-op
      }
      setModal({ visible: true, title: 'त्रुटी', message: 'कॉल करणे शक्य नाही.' });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FF6B00" />
          </TouchableOpacity>
          <Text style={styles.title}>मदत आणि समर्थन</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>फ्री कायदेशीर मदत</Text>
          <Text style={styles.text}>DLSA (District Legal Services Authority) कडून मोफत कायदेशीर मदत मिळते.</Text>

          <Text style={styles.label}>Nagpur DLSA</Text>
          <TouchableOpacity style={styles.callButton} onPress={() => handleCall('07122560123')}>
            <Ionicons name="call" size={18} color="#000" />
            <Text style={styles.callText}>0712-2560123 वर कॉल करा</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Emergency</Text>
          <TouchableOpacity style={styles.callButton} onPress={() => handleCall('112')}>
            <Ionicons name="warning" size={18} color="#000" />
            <Text style={styles.callText}>112 वर कॉल करा</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ThemedModal
        visible={modal.visible}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal({ visible: false, title: '', message: '' })}
        actions={[{ label: 'OK', onPress: () => setModal({ visible: false, title: '', message: '' }), variant: 'primary' }]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A0A00' },
  content: { padding: 24, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#FF6B00' },
  card: {
    backgroundColor: '#2A1500',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.3)',
    padding: 20,
    gap: 12,
  },
  heading: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  text: { fontSize: 15, lineHeight: 22, color: '#E6D5C6' },
  label: { fontSize: 14, fontWeight: '700', color: '#FFB173', marginTop: 4 },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF6B00',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  callText: { color: '#000', fontSize: 15, fontWeight: '700' },
});
