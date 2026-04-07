import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { useAppStore } from '../store/useAppStore';
import { getLanguageStrings } from '../lib/languages';
import { Case } from '../types';
import ThemedModal from '../components/ThemedModal';
import { db } from '../lib/firebase';

export default function CasesScreen() {
  const router = useRouter();
  const { user, userProfile, language, setCurrentCase, setMessages, updateAnalysis, setDocuments } = useAppStore();
  const strings = getLanguageStrings(language);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Case | null>(null);
  const [activeTabByCase, setActiveTabByCase] = useState<Record<string, 'chat' | 'summary' | 'steps'>>({});

  useEffect(() => {
    loadCases();
  }, [user]);

  const loadCases = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userCasesRef = collection(db, 'users', user.uid, 'cases');
      const snap = await getDocs(query(userCasesRef, orderBy('updatedAt', 'desc')));
      const mapped: Case[] = snap.docs.map((c) => {
        const data = c.data() as any;
        return {
          caseId: c.id,
          userId: user.uid,
          title: data.title || 'Analyzing case...',
          status: data.status || 'fact_gathering',
          analysisProgress: data.progress || 0,
          legalSections: data.legalSections || [],
          actionSteps: Array.isArray(data.steps) ? data.steps.map((s: any) => s.title || '') : [],
          caseStrength: data.caseStrength || 0,
          messages: [],
          documents: data.documents || { fir: '', nhrc: '', magistrate: '' },
          createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
          updatedAt: data.updatedAt?.toMillis ? data.updatedAt.toMillis() : Date.now(),
          summary: data.summary || '',
          steps: data.steps || [],
        } as Case & { summary?: string; steps?: any[] };
      });
      setCases(mapped);
    } catch (error) {
      console.error('Error loading cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToChat = () => {
    setCurrentCase(null);
    setMessages([]);
    router.push('/chat');
  };

  const handleCasePress = (caseItem: Case) => {
    setCurrentCase(caseItem.caseId);
    setMessages([]);
    updateAnalysis(caseItem.analysisProgress, caseItem.legalSections, caseItem.actionSteps, caseItem.caseStrength, caseItem.status as any);
    setDocuments(caseItem.documents);
    router.push('/chat');
  };

  const handleDeleteCase = async () => {
    if (!user || !deleteTarget) return;
    const targetId = deleteTarget.caseId;
    setCases((prev) => prev.filter((item) => item.caseId !== targetId));
    setDeleteTarget(null);
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'cases', targetId));
    } catch (error) {
      console.error('Delete failed, reloading cases:', error);
      loadCases();
    }
  };

  const toggleStep = async (caseItem: any, stepId: string) => {
    if (!user) return;
    const steps = Array.isArray(caseItem.steps) ? [...caseItem.steps] : [];
    const nextSteps = steps.map((s: any) => (s.id === stepId ? { ...s, completed: !s.completed } : s));
    const done = nextSteps.filter((s: any) => s.completed).length;
    const progress = nextSteps.length ? Math.round((done / nextSteps.length) * 100) : 0;
    await updateDoc(doc(db, 'users', user.uid, 'cases', caseItem.caseId), {
      steps: nextSteps,
      progress,
      updatedAt: new Date(),
    });
    setCases((prev: any[]) => prev.map((c: any) => (c.caseId === caseItem.caseId ? { ...c, steps: nextSteps, analysisProgress: progress } : c)));
  };

  const closeCase = async (caseItem: any) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'cases', caseItem.caseId), {
      status: 'completed',
      updatedAt: new Date(),
    });
    setCases((prev: any[]) => prev.map((c: any) => (c.caseId === caseItem.caseId ? { ...c, status: 'completed' } : c)));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fact_gathering':
        return '#FF7A00';
      case 'analyzing':
        return '#FFB800';
      case 'action_plan_ready':
        return '#00B8FF';
      case 'documents_ready':
        return '#00FF88';
      default:
        return '#B9A38F';
    }
  };

  const getStatusText = (status: string) => {
    if (status === 'fact_gathering') return strings.statusFactGathering;
    if (status === 'analyzing') return strings.statusAnalyzing;
    if (status === 'action_plan_ready') return strings.statusActionPlanReady;
    if (status === 'documents_ready') return strings.statusDocumentsReady;
    return status;
  };

  const getInitials = () => {
    if (!userProfile) return 'U';
    const first = userProfile.firstName?.[0] || '';
    const second = userProfile.surname?.[0] || '';
    return `${first}${second}`.toUpperCase() || 'U';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="scale" size={24} color="#FF7A00" />
          <Text style={styles.logoText}>NyAI-Setu</Text>
        </View>
        <Text style={styles.headerTitle}>{strings.myCases}</Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials()}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF7A00" />
          </View>
        ) : cases.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={80} color="rgba(255, 122, 0, 0.35)" />
            <Text style={styles.emptyTitle}>{strings.noCases}</Text>
            <Text style={styles.emptyText}>{strings.noCasesHint}</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={goToChat}>
              <Text style={styles.emptyButtonText}>{strings.startNewCase}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          cases.map((caseItem: any) => (
            <TouchableOpacity key={caseItem.caseId} style={styles.caseCard} onPress={() => handleCasePress(caseItem)}>
              <View style={styles.caseHeader}>
                <Text style={styles.caseTitle} numberOfLines={2}>
                  {caseItem.title}
                </Text>
                <Pressable onPress={(e) => { e.stopPropagation(); setDeleteTarget(caseItem); }} style={styles.deleteIcon}>
                  <Ionicons name="trash-outline" size={18} color="#FF7A00" />
                </Pressable>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(caseItem.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(caseItem.status) }]}>{getStatusText(caseItem.status)}</Text>
                </View>
              </View>

              <View style={styles.progressRow}>
                <Text style={styles.progressText}>{caseItem.analysisProgress}% {strings.analysis}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${caseItem.analysisProgress}%` }]} />
                </View>
              </View>

              <View style={styles.tabsRow}>
                {(['chat', 'summary', 'steps'] as const).map((tab) => (
                  <Pressable
                    key={tab}
                    style={[styles.tabBtn, (activeTabByCase[caseItem.caseId] || 'chat') === tab && styles.tabBtnActive]}
                    onPress={(e) => {
                      e.stopPropagation();
                      setActiveTabByCase((prev) => ({ ...prev, [caseItem.caseId]: tab }));
                    }}
                  >
                    <Text style={[styles.tabText, (activeTabByCase[caseItem.caseId] || 'chat') === tab && styles.tabTextActive]}>
                      {tab === 'chat' ? 'Chat' : tab === 'summary' ? 'Summary' : 'Steps'}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {(activeTabByCase[caseItem.caseId] || 'chat') === 'summary' && (
                <Text style={styles.summaryText}>{caseItem.summary || '-'}</Text>
              )}

              {(activeTabByCase[caseItem.caseId] || 'chat') === 'steps' && (
                <View style={styles.stepsWrap}>
                  {(caseItem.steps || []).map((step: any) => (
                    <Pressable key={step.id} style={styles.stepRow} onPress={(e) => { e.stopPropagation(); toggleStep(caseItem, step.id); }}>
                      <Ionicons name={step.completed ? 'checkbox' : 'square-outline'} size={18} color="#FF7A00" />
                      <Text style={styles.stepText}>{step.title}</Text>
                    </Pressable>
                  ))}
                  {!!(caseItem.steps || []).length && (
                    <TouchableOpacity style={styles.closeCaseBtn} onPress={(e) => { e.stopPropagation(); closeCase(caseItem); }}>
                      <Text style={styles.closeCaseTxt}>Close Case</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <View style={styles.caseFooter}>
                <Text style={styles.footerText}>{format(caseItem.createdAt, 'dd MMM yyyy')}</Text>
                <Text style={styles.footerText}>{caseItem.actionSteps.length} {strings.stepsCompleted}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <ThemedModal
        visible={!!deleteTarget}
        title={strings.deleteCase}
        message={strings.deleteCaseConfirm}
        onClose={() => setDeleteTarget(null)}
        actions={[
          { label: strings.cancel, onPress: () => setDeleteTarget(null), variant: 'secondary' },
          { label: strings.delete, onPress: handleDeleteCase, variant: 'primary' },
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0E0E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 122, 0, 0.2)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF7A00',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF7A00',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FF7A00',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF7A00',
  },
  newCaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#FF7A00',
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
    backgroundColor: '#FF7A00',
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
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 0, 0.35)',
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  deleteIcon: {
    padding: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  tabBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#2B2B2B',
  },
  tabBtnActive: {
    backgroundColor: '#FF7A00',
  },
  tabText: {
    color: '#D0D0D0',
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#000',
  },
  summaryText: {
    color: '#E2E2E2',
    fontSize: 13,
    marginBottom: 10,
  },
  stepsWrap: {
    marginBottom: 10,
    gap: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepText: {
    color: '#FFF',
    flex: 1,
  },
  closeCaseBtn: {
    marginTop: 8,
    backgroundColor: '#2B2B2B',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  closeCaseTxt: {
    color: '#FF7A00',
    fontWeight: '700',
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