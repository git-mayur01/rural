import React, { useState, useEffect, useRef } from 'react';
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
import { useAppStore } from '../store/useAppStore';
import { getLanguageStrings } from '../lib/languages';
import { createCase, updateCase, getCase } from '../lib/firestore';
import { sendLegalMessage } from '../lib/gemini';
import { Message } from '../types';
import { format } from 'date-fns';

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load existing case if currentCaseId exists
    if (currentCaseId) {
      loadCase();
    } else if (user) {
      // Create new case
      createNewCase();
    }
  }, []);

  const loadCase = async () => {
    if (!currentCaseId) return;
    const caseData = await getCase(currentCaseId);
    if (caseData) {
      setMessages(caseData.messages);
      updateAnalysis(
        caseData.analysisProgress,
        caseData.legalSections,
        caseData.actionSteps,
        caseData.caseStrength,
        caseData.status
      );
      setDocuments(caseData.documents);
    }
  };

  const createNewCase = async () => {
    if (!user) return;
    try {
      const caseId = await createCase(user.uid, 'नवीन प्रकरण');
      setCurrentCase(caseId);
    } catch (error) {
      console.error('Error creating case:', error);
    }
  };

  const handleNewCase = async () => {
    clearCurrentCase();
    await createNewCase();
  };

  const handleSend = async () => {
    if (!inputText.trim() || !currentCaseId || !user) return;

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
      // Send to Gemini
      const allMessages = [...messages, userMessage];
      const response = await sendLegalMessage(allMessages, language);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: Date.now(),
      };

      addMessage(assistantMessage);

      // Update case with analysis
      updateAnalysis(
        response.analysisProgress,
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

      // Update in Firestore
      await updateCase(currentCaseId, {
        messages: [...allMessages, assistantMessage],
        analysisProgress: response.analysisProgress,
        legalSections: response.legalSections,
        actionSteps: response.actionSteps,
        caseStrength: response.caseStrength,
        status: response.stage === 'documents' ? 'documents_ready' : 'fact_gathering',
        documents: {
          fir: response.fir,
          nhrc: response.nhrc,
          magistrate: response.magistrate,
        },
      });

      // Auto-set title from first message
      if (messages.length === 0) {
        await updateCase(currentCaseId, {
          title: inputText.trim().slice(0, 50) + (inputText.trim().length > 50 ? '...' : ''),
        });
      }
    } catch (error: any) {
      Alert.alert('त्रुटी', 'AI प्रतिसाद पाठवण्यात अयशस्वी: ' + error.message);
    } finally {
      setIsTyping(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const getStatusText = () => {
    if (analysisProgress < 20) return 'स्थिती: तथ्य संकलन';
    if (analysisProgress < 65) return 'स्थिती: तथ्य संकलन';
    if (analysisProgress < 85) return 'स्थिती: विश्लेषण';
    if (analysisProgress < 100) return 'स्थिती: कृती योजना तयार';
    return 'स्थिती: कागदपत्रे तयार';
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
        <Text style={styles.headerTitle}>वकील साहब AI</Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials()}</Text>
        </View>
      </View>

      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusLeft}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${analysisProgress}%` }]} />
          </View>
        </View>
        <Text style={styles.progressText}>{analysisProgress}% विश्लेषण</Text>
      </View>

      {/* New Case Button */}
      <TouchableOpacity style={styles.newCaseButton} onPress={handleNewCase}>
        <Ionicons name="add-circle-outline" size={20} color="#FF6B00" />
        <Text style={styles.newCaseText}>नवीन प्रकरण</Text>
      </TouchableOpacity>

      {/* Chat Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={90}
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
              <Text style={styles.emptyText}>तुमचा कायदेशीर प्रश्न येथे सांगा...</Text>
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
                  <Text style={styles.messageSender}>वकील साहब</Text>
                  <Text style={styles.messageTime}>
                    {format(message.timestamp, 'HH:mm')}
                  </Text>
                </View>
              )}
              {message.role === 'user' && (
                <View style={styles.messageHeader}>
                  <Text style={styles.messageSender}>
                    {userProfile?.firstName || 'तुम्ही'}
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
                <Text style={styles.messageSender}>वकील साहब</Text>
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
            placeholder="तुमचा कायदेशीर प्रश्न सांगा..."
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
    fontSize: 18,
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
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#2A1500',
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
    backgroundColor: '#2A1500',
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
    marginBottom: 64,
  },
  iconButton: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1E1200',
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
