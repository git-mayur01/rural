import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '../store/useAppStore';
import { getLanguageStrings } from '../lib/languages';
import { getUserCases } from '../lib/firestore';
import { Case } from '../types';
import { format } from 'date-fns';

export default function CasesScreen() {
  const router = useRouter();
  const { user, userProfile, language, setCurrentCase, setMessages, updateAnalysis, setDocuments } = useAppStore();
  const strings = getLanguageStrings(language);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userCases = await getUserCases(user.uid);
      setCases(userCases);
    } catch (error) {
      console.error('Error loading cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewCase = () => {
    setCurrentCase(null);
    router.push('/chat');
  };

  const handleCasePress = (caseItem: Case) => {
    setCurrentCase(caseItem.caseId);
    setMessages(caseItem.messages);
    updateAnalysis(
      caseItem.analysisProgress,
      caseItem.legalSections,
      caseItem.actionSteps,
      caseItem.caseStrength,
      caseItem.status
    );
    setDocuments(caseItem.documents);
    router.push('/chat');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fact_gathering':
        return '#FF6B00';
      case 'analyzing':
        return '#FFB800';
      case 'action_plan_ready':
        return '#00B8FF';
      case 'documents_ready':
        return '#00FF88';
      default:
        return '#A0785A';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'fact_gathering':
        return 'तथ्य संकलन';
      case 'analyzing':
        return 'विश्लेषण';
      case 'action_plan_ready':
        return 'कृती योजना तयार';
      case 'documents_ready':
        return 'कागदपत्रे तयार';
      default:
        return status;
    }
  };

  const getInitials = () => {
    if (!userProfile) return 'U';
    return `${userProfile.firstName[0]}${userProfile.surname[0]}`.toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="scale" size={24} color="#FF6B00" />
          <Text style={styles.logoText}>NyAI-Setu</Text>
        </View>
        <Text style={styles.headerTitle}>माझे प्रकरण</Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials()}</Text>
        </View>
      </View>

      {/* New Case Button */}
      <TouchableOpacity style={styles.newCaseButton} onPress={handleNewCase}>
        <Ionicons name="add-circle" size={24} color="#000" />
        <Text style={styles.newCaseButtonText}>+ नवीन प्रकरण</Text>
      </TouchableOpacity>

      {/* Cases List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B00" />
          </View>
        ) : cases.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={80} color="rgba(255, 107, 0, 0.3)" />
            <Text style={styles.emptyTitle}>अद्याप प्रकरण नाहीत</Text>
            <Text style={styles.emptyText}>
              वकील साहब AI ला तुमची समस्या सांगून सुरुवात करा
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleNewCase}>
              <Text style={styles.emptyButtonText}>नवीन प्रकरण सुरू करा</Text>
            </TouchableOpacity>
          </View>
        ) : (
          cases.map((caseItem) => (
            <TouchableOpacity
              key={caseItem.caseId}
              style={styles.caseCard}
              onPress={() => handleCasePress(caseItem)}
            >
              <View style={styles.caseHeader}>
                <Text style={styles.caseTitle} numberOfLines={2}>
                  {caseItem.title}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(caseItem.status) + '20' },
                  ]}
                >
                  <Text style={[styles.statusText, { color: getStatusColor(caseItem.status) }]}>
                    {getStatusText(caseItem.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.progressRow}>
                <Text style={styles.progressText}>{caseItem.analysisProgress}% विश्लेषण</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${caseItem.analysisProgress}%` },
                    ]}
                  />
                </View>
              </View>

              {caseItem.legalSections.length > 0 && (
                <View style={styles.sectionsContainer}>
                  {caseItem.legalSections.slice(0, 3).map((section, index) => (
                    <View key={index} style={styles.sectionPill}>
                      <Text style={styles.sectionText}>{section}</Text>
                    </View>
                  ))}
                  {caseItem.legalSections.length > 3 && (
                    <Text style={styles.moreSections}>+{caseItem.legalSections.length - 3}</Text>
                  )}
                </View>
              )}

              <View style={styles.caseFooter}>
                <Text style={styles.footerText}>
                  {format(caseItem.createdAt, 'dd MMM yyyy')}
                </Text>
                <Text style={styles.footerText}>
                  {caseItem.actionSteps.length} पायऱ्या पूर्ण
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A0A00',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 107, 0, 0.2)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A1500',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FF6B00',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  newCaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#FF6B00',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 16,
    borderRadius: 28,
  },
  newCaseButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#A0785A',
    marginTop: 8,
    textAlign: 'center',
    maxWidth: '80%',
  },
  emptyButton: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
    marginTop: 24,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  caseCard: {
    backgroundColor: '#2A1500',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.3)',
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  caseTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B00',
    minWidth: 80,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 107, 0, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B00',
    borderRadius: 3,
  },
  sectionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  sectionPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B00',
  },
  sectionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B00',
  },
  moreSections: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A0785A',
  },
  caseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#A0785A',
  },
});