import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Constants from 'expo-constants';
import { useAppStore } from '../store/useAppStore';
import { getLanguageStrings } from '../lib/languages';
import { sendLegalMessage } from '../lib/gemini';
import { Message } from '../types';
import { format } from 'date-fns';
import ThemedModal from '../components/ThemedModal';
import { db } from '../lib/firebase';

export default function ChatScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const {
    user,
    userProfile,
    language,
    currentCaseId,
    messages,
    analysisProgress,
    caseStatus,
    setCurrentCase,
    addMessage,
    setMessages,
    updateAnalysis,
    setDocuments,
    clearCurrentCase,
  } = useAppStore();

  const strings = getLanguageStrings(language);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading] = useState(false);
  const [errorModal, setErrorModal] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    if (currentCaseId) {
      loadCase();
    }
  }, [currentCaseId]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const loadCase = async () => {
    if (!currentCaseId || !user) return;
    const caseRef = doc(db, 'users', user.uid, 'cases', currentCaseId);
    const caseSnap = await getDoc(caseRef);
    if (!caseSnap.exists()) return;

    const caseData = caseSnap.data() as any;
    const messagesRef = collection(db, 'users', user.uid, 'cases', currentCaseId, 'messages');
    const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
    const messagesSnap = await getDocs(messagesQuery);

    const loadedMessages: Message[] = messagesSnap.docs.map((m) => {
      const data = m.data() as any;
      return {
        id: m.id,
        role: data.sender === 'user' ? 'user' : 'assistant',
        content: data.text || '',
        timestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : Date.now(),
      };
    });

    setMessages(loadedMessages);
    const steps = Array.isArray(caseData.steps) ? caseData.steps : [];
    updateAnalysis(
      caseData.progress ?? 0,
      caseData.legalSections ?? [],
      steps.map((s: any) => s.title).filter(Boolean),
      caseData.caseStrength ?? 0,
      caseData.status ?? 'fact_gathering'
    );
    setDocuments(caseData.documents ?? { fir: '', nhrc: '', magistrate: '' });
  };

  const createCaseOnFirstMessage = async () => {
    if (!user) return;
    try {
      const caseRef = await addDoc(collection(db, 'users', user.uid, 'cases'), {
        title: 'Analyzing case...',
        summary: '',
        status: 'fact_gathering',
        progress: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        steps: [],
        legalSections: [],
        documents: { fir: '', nhrc: '', magistrate: '' },
        caseStrength: 0,
      });
      setCurrentCase(caseRef.id);
      return caseRef.id;
    } catch (error) {
      console.error('Error creating case:', error);
      return null;
    }
  };

  const handleNewCase = async () => {
    clearCurrentCase();
    const caseId = await createCaseOnFirstMessage();
    if (!caseId) {
      setErrorModal({
        visible: true,
        message: language === 'en' ? 'Unable to create case.' : 'प्रकरण तयार करण्यात अयशस्वी.',
      });
    }
  };

  const storeMessage = async (caseId: string, sender: 'user' | 'ai', text: string) => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'cases', caseId, 'messages'), {
      sender,
      text,
      timestamp: serverTimestamp(),
    });
  };

  const handleSend = async () => {
    if (!inputText.trim() || !user) return;

    const activeCaseId = currentCaseId;
    if (!activeCaseId) {
      setErrorModal({
        visible: true,
        message: language === 'en' ? 'Please tap "New Case" first.' : 'कृपया आधी "नवीन प्रकरण" दाबा.',
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: Date.now(),
    };

    addMessage(userMessage);
    setInputText('');
    setIsTyping(true);

    // Scroll to bottom
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      await storeMessage(activeCaseId, 'user', userMessage.content);

      // Send to Gemini
      const allMessages = [...messages, userMessage];
      let response;
      try {
        response = await sendLegalMessage(allMessages, language);
      } catch {
        response = null;
      }

      if (!response?.message) {
        const geminiKey =
          Constants.expoConfig?.extra?.EXPO_PUBLIC_GEMINI_API_KEY ||
          process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
          '';
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(allMessages.map((m) => `${m.role}: ${m.content}`).join('\n'));
        const text = result.response.text();
        response = {
          message: text,
          analysisProgress: 20,
          legalSections: [],
          actionSteps: [],
          caseStrength: 0,
          stage: 'gathering',
          fir: '',
          nhrc: '',
          magistrate: '',
        };
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: Date.now(),
      };

      addMessage(assistantMessage);
      await storeMessage(activeCaseId, 'ai', assistantMessage.content);

      const structuredSteps = (response.actionSteps || []).map((step, idx) => ({
        id: `${Date.now()}-${idx}`,
        title: step,
        description: step,
        completed: false,
      }));
      const completedSteps = structuredSteps.filter((s) => s.completed).length;
      const progress = structuredSteps.length ? Math.round((completedSteps / structuredSteps.length) * 100) : (response.analysisProgress || 0);

      // Update case with analysis
      updateAnalysis(
        progress,
        response.legalSections,
        response.actionSteps,
        response.caseStrength,
        response.stage === 'documents' ? 'documents_ready' : 'fact_gathering'
      );

      if (response.fir || response.nhrc || response.magistrate) {
        setDocuments({
          fir: response.fir,
          nhrc: response.nhrc,
          magistrate: response.magistrate,
        });
      }

      await updateDoc(doc(db, 'users', user.uid, 'cases', activeCaseId), {
        title:
          allMessages.length === 1
            ? allMessages[0].content.slice(0, 50) + (allMessages[0].content.length > 50 ? '...' : '')
            : undefined,
        summary: response.message.slice(0, 260),
        progress,
        legalSections: response.legalSections,
        steps: structuredSteps,
        caseStrength: response.caseStrength,
        status: response.stage === 'documents' ? 'completed' : 'fact_gathering',
        documents: {
          fir: response.fir,
          nhrc: response.nhrc,
          magistrate: response.magistrate,
        },
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      setErrorModal({
        visible: true,
        message: `${language === 'en' ? 'AI response failed' : 'AI प्रतिसाद अयशस्वी'}: ${error.message}`,
      });
    } finally {
      setIsTyping(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const getStatusText = () => {
    if (analysisProgress < 20) return strings.statusFactGathering;
    if (analysisProgress < 65) return strings.statusFactGathering;
    if (analysisProgress < 85) return strings.statusAnalyzing;
    if (analysisProgress < 100) return strings.statusActionPlanReady;
    return strings.statusDocumentsReady;
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
        <Text style={styles.headerTitle}>{strings.vakilSahabAI}</Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials()}</Text>
        </View>
      </View>

      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusLeft}>
          <Text style={styles.statusText}>{getStatusText().toUpperCase()}</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${analysisProgress}%` }]} />
          </View>
        </View>
        <Text style={styles.progressText}>{analysisProgress}% {strings.analysis}</Text>
      </View>

      <View style={styles.caseActionRow}>
        <TouchableOpacity style={[styles.caseActionBtn, currentCaseId ? styles.caseActionActive : null]}>
          <Ionicons name="document-text-outline" size={18} color={currentCaseId ? '#000' : '#FF6B00'} />
          <Text style={[styles.caseActionText, currentCaseId ? styles.caseActionTextActive : null]}>
            {language === 'en' ? 'Active Case' : 'सक्रिय प्रकरण'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.caseActionBtnPrimary} onPress={handleNewCase}>
          <Ionicons name="add-circle-outline" size={18} color="#000" />
          <Text style={styles.caseActionTextPrimary}>{strings.newCase}</Text>
        </TouchableOpacity>
      </View>

      {/* Chat Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={isKeyboardVisible ? 0 : 64}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="scale" size={64} color="rgba(255, 107, 0, 0.3)" />
              <Text style={styles.emptyText}>{strings.describeQuery}</Text>
            </View>
          )}

          {messages.map((message, index) => (
            <View
              key={message.id || index}
              style={[
                styles.messageContainer,
                message.role === 'user' ? styles.userMessage : styles.aiMessage,
              ]}
            >
              {message.role === 'assistant' && (
                <View style={styles.messageHeader}>
                  <Ionicons name="scale" size={16} color="#FF6B00" />
                  <Text style={styles.messageSender}>{strings.vakilSahab}</Text>
                  <Text style={styles.messageTime}>
                    {format(message.timestamp, 'HH:mm')}
                  </Text>
                </View>
              )}
              {message.role === 'user' && (
                <View style={styles.messageHeader}>
                  <Text style={styles.messageSender}>
                    {userProfile?.firstName || strings.you}
                  </Text>
                  <Text style={styles.messageTime}>
                    {format(message.timestamp, 'HH:mm')}
                  </Text>
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  message.role === 'user' ? styles.userBubble : styles.aiBubble,
                ]}
              >
                <Text style={styles.messageText}>{message.content}</Text>
              </View>
            </View>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <View style={[styles.messageContainer, styles.aiMessage]}>
              <View style={styles.messageHeader}>
                <Ionicons name="scale" size={16} color="#FF6B00" />
                <Text style={styles.messageSender}>{strings.vakilSahab}</Text>
              </View>
              <View style={[styles.messageBubble, styles.aiBubble, styles.typingBubble]}>
                <View style={styles.typingIndicator}>
                  <View style={styles.typingDot} />
                  <View style={[styles.typingDot, { animationDelay: '0.2s' }]} />
                  <View style={[styles.typingDot, { animationDelay: '0.4s' }]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="attach" size={24} color="#A0785A" />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder={strings.describeQuery}
            placeholderTextColor="#A0785A"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="mic-outline" size={24} color="#A0785A" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={!inputText.trim() || loading}
          >
            <Ionicons name="send" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <ThemedModal
        visible={errorModal.visible}
        title={language === 'en' ? 'Error' : 'त्रुटी'}
        message={errorModal.message}
        onClose={() => setErrorModal({ visible: false, message: '' })}
        actions={[
          {
            label: 'OK',
            onPress: () => setErrorModal({ visible: false, message: '' }),
            variant: 'primary',
          },
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
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
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#1A1A1A',
  },
  statusLeft: {
    flex: 1,
    marginRight: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF6B00',
    marginBottom: 6,
    letterSpacing: 1,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255, 107, 0, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF6B00',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B00',
  },
  newCaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.3)',
  },
  newCaseText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B00',
  },
  caseActionRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  caseActionBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: 'rgba(255,122,0,0.35)',
    borderRadius: 16,
    paddingVertical: 12,
  },
  caseActionActive: {
    backgroundColor: '#FF7A00',
  },
  caseActionText: {
    color: '#FF7A00',
    fontWeight: '700',
  },
  caseActionTextActive: {
    color: '#000',
  },
  caseActionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FF7A00',
    borderRadius: 16,
    paddingVertical: 12,
  },
  caseActionTextPrimary: {
    color: '#000',
    fontWeight: '700',
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#A0785A',
    marginTop: 16,
  },
  messageContainer: {
    marginBottom: 20,
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A0785A',
  },
  messageTime: {
    fontSize: 10,
    color: '#A0785A',
  },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  aiBubble: {
    backgroundColor: '#2A1500',
  },
  userBubble: {
    backgroundColor: '#3A3A3A',
  },
  messageText: {
    fontSize: 16,
    color: '#FFF',
    lineHeight: 24,
  },
  typingBubble: {
    paddingVertical: 16,
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 6,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B00',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#2A1500',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 107, 0, 0.2)',
    marginBottom: 0,
  },
  iconButton: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#FFF',
    maxHeight: 100,
    marginHorizontal: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B00',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
