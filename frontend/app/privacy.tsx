import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FF6B00" />
          </TouchableOpacity>
          <Text style={styles.title}>गोपनीयता धोरण</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.card}>
          <Text style={styles.itemTitle}>1) डेटा संकलन</Text>
          <Text style={styles.text}>आम्ही फक्त अॅप वापरासाठी आवश्यक माहिती जसे नाव, ईमेल, जिल्हा आणि केस डेटा साठवतो.</Text>

          <Text style={styles.itemTitle}>2) डेटा सुरक्षा</Text>
          <Text style={styles.text}>वापरकर्ता डेटा Firebase वर सुरक्षितरीत्या साठवला जातो. अनधिकृत प्रवेश रोखण्यासाठी सुरक्षा नियम लागू आहेत.</Text>

          <Text style={styles.itemTitle}>3) डेटा वापर</Text>
          <Text style={styles.text}>तुमच्या अनुभवासाठी भाषेची निवड, केस प्रगती आणि दस्तऐवज निर्मिती यासाठीच डेटा वापरला जातो.</Text>

          <Text style={styles.itemTitle}>4) कायदेशीर सूचना</Text>
          <Text style={styles.text}>NyAI-Setu कायदेशीर माहिती देते; हे वैयक्तिक वकील सल्ल्याचा पर्याय नाही.</Text>
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
  itemTitle: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  text: { fontSize: 15, lineHeight: 22, color: '#E6D5C6' },
});
