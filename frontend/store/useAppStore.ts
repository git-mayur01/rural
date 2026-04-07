import { create } from 'zustand';
import { User } from 'firebase/auth';
import { UserProfile, Message, Language } from '../types';

interface AppState {
  // Auth
  user: User | null;
  userProfile: UserProfile | null;
  language: Language;

  // Current case
  currentCaseId: string | null;
  messages: Message[];
  analysisProgress: number;
  legalSections: string[];
  actionSteps: string[];
  caseStrength: number;
  caseStatus: 'fact_gathering' | 'analyzing' | 'action_plan_ready' | 'documents_ready';
  documents: { fir: string; nhrc: string; magistrate: string };

  // Actions
  setUser: (user: User | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setLanguage: (lang: Language) => void;
  setCurrentCase: (caseId: string | null) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  updateAnalysis: (
    progress: number,
    sections: string[],
    steps: string[],
    strength: number,
    status: 'fact_gathering' | 'analyzing' | 'action_plan_ready' | 'documents_ready'
  ) => void;
  setDocuments: (docs: { fir: string; nhrc: string; magistrate: string }) => void;
  clearCurrentCase: () => void;
  resetAll: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  user: null,
  userProfile: null,
  language: 'mr',
  currentCaseId: null,
  messages: [],
  analysisProgress: 0,
  legalSections: [],
  actionSteps: [],
  caseStrength: 0,
  caseStatus: 'fact_gathering',
  documents: { fir: '', nhrc: '', magistrate: '' },

  // Actions
  setUser: (user) => set({ user }),
  setUserProfile: (profile) => set({ userProfile, language: profile?.language || 'mr' }),
  setLanguage: (lang) => set({ language: lang }),
  setCurrentCase: (caseId) => set({ currentCaseId: caseId }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) => set({ messages }),
  updateAnalysis: (progress, sections, steps, strength, status) =>
    set({
      analysisProgress: progress,
      legalSections: sections,
      actionSteps: steps,
      caseStrength: strength,
      caseStatus: status,
    }),
  setDocuments: (docs) => set({ documents: docs }),
  clearCurrentCase: () =>
    set({
      currentCaseId: null,
      messages: [],
      analysisProgress: 0,
      legalSections: [],
      actionSteps: [],
      caseStrength: 0,
      caseStatus: 'fact_gathering',
      documents: { fir: '', nhrc: '', magistrate: '' },
    }),
  resetAll: () =>
    set({
      user: null,
      userProfile: null,
      language: 'mr',
      currentCaseId: null,
      messages: [],
      analysisProgress: 0,
      legalSections: [],
      actionSteps: [],
      caseStrength: 0,
      caseStatus: 'fact_gathering',
      documents: { fir: '', nhrc: '', magistrate: '' },
    }),
}));