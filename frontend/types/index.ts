// Type definitions for NyAI-Setu

export interface UserProfile {
  uid: string;
  firstName: string;
  surname: string;
  email: string;
  district: string;
  dateOfBirth: string;
  language: 'mr' | 'hi' | 'en'; // Marathi, Hindi, English
  photoURL?: string;
  notificationsEnabled?: boolean;
  createdAt: number;
  totalCases: number;
  totalDocs: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Case {
  caseId: string;
  userId: string;
  title: string;
  status: 'fact_gathering' | 'analyzing' | 'action_plan_ready' | 'documents_ready';
  analysisProgress: number;
  legalSections: string[];
  actionSteps: string[];
  caseStrength: number;
  messages: Message[];
  documents: {
    fir: string;
    nhrc: string;
    magistrate: string;
  };
  createdAt: number;
  updatedAt: number;
}

export interface VaultFile {
  fileId: string;
  userId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  downloadURL: string;
  uploadedAt: number;
}

export interface GeminiResponse {
  message: string;
  analysisProgress: number;
  legalSections: string[];
  actionSteps: string[];
  caseStrength: number;
  stage: 'empathy' | 'gathering' | 'analysis' | 'action_plan' | 'documents';
  fir: string;
  nhrc: string;
  magistrate: string;
}

export type Language = 'mr' | 'hi' | 'en';

export interface LanguageStrings {
  // Auth
  loginTitle: string;
  signUpTitle: string;
  emailOrPhone: string;
  getOTP: string;
  password: string;
  forgotCredentials: string;
  continue: string;
  orContinueWith: string;
  dontHaveAccount: string;
  alreadyHaveAccount: string;
  
  // Profile Setup
  createProfile: string;
  firstName: string;
  surname: string;
  email: string;
  enterOTP: string;
  setPassword: string;
  confirmPassword: string;
  district: string;
  dateOfBirth: string;
  submitVerify: string;
  termsOfService: string;
  
  // Chat
  vakilSahabAI: string;
  statusFactGathering: string;
  statusAnalyzing: string;
  statusActionPlanReady: string;
  statusDocumentsReady: string;
  analysis: string;
  newCase: string;
  describeQuery: string;
  
  // Cases
  myCases: string;
  noCases: string;
  startNewCase: string;
  stepsCompleted: string;
  deleteCase: string;
  deleteCaseConfirm: string;
  cancel: string;
  delete: string;
  noCasesHint: string;
  
  // Vault
  documentVault: string;
  secureRecords: string;
  uploadNewDocument: string;
  vaultStatus: string;
  encryptedProtocol: string;
  storageUsage: string;
  uploaded: string;
  
  // Profile
  profileEditKarein: string;
  language: string;
  change: string;
  notifications: string;
  aboutNyAISetu: string;
  privacyPolicy: string;
  helpSupport: string;
  logout: string;
  cases: string;
  docs: string;
  you: string;
  vakilSahab: string;
  uploadPhotoSuccess: string;
  uploadPhotoFailed: string;
  languageChanged: string;
}
