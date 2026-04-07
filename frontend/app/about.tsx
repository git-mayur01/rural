import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FF6B00" />
          </TouchableOpacity>
          <Text style={styles.title}>NyAI-Setu बद्दल</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>NyAI-Setu (Legal AI Bridge)</Text>
          <Text style={styles.text}>
            ग्रामीण भारतातील नागरिकांना मोफत, सोप्या भाषेत कायदेशीर मार्गदर्शन देण्यासाठी NyAI-Setu तयार केले आहे.
          </Text>
          <Text style={styles.text}>
            हे अॅप तुमची समस्या समजून घेते, टप्प्याटप्प्याने मार्गदर्शन करते, आणि FIR/तक्रार मसुदे तयार करण्यात मदत करते.
          </Text>
          <Text style={styles.note}>
            टीप: हे अॅप कायदेशीर माहिती देते, अंतिम कायदेशीर सल्ला नाही.
          </Text>
        </View>
      </ScrollView>
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
  text: { fontSize: 16, lineHeight: 24, color: '#E6D5C6' },
  note: { fontSize: 14, color: '#FFB173' },
});
