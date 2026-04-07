import { LanguageStrings, Language } from '../types';

// Marathi strings (primary)
const marathi: LanguageStrings = {
  // Auth
  loginTitle: 'लॉगिन',
  signUpTitle: 'साइन अप',
  emailOrPhone: 'ईमेल किंवा फोन नंबर',
  getOTP: 'OTP मिळवा',
  password: 'पासवर्ड',
  forgotCredentials: 'ओळखपत्र विसरलात?',
  continue: 'पुढे चला',
  orContinueWith: 'किंवा सुरू ठेवा',
  dontHaveAccount: 'खाते नाही?',
  alreadyHaveAccount: 'आधीच खाते आहे?',
  
  // Profile Setup
  createProfile: 'प्रोफाइल तयार करा',
  firstName: 'नाव',
  surname: 'आडनाव',
  email: 'ईमेल पत्ता',
  enterOTP: '४-अंकी OTP प्रविष्ट करा',
  setPassword: 'पासवर्ड सेट करा',
  confirmPassword: 'पासवर्डची पुष्टी करा',
  district: 'जिल्हा',
  dateOfBirth: 'जन्मतारीख',
  submitVerify: 'सबमिट आणि सत्यापित करा',
  termsOfService: 'धर्म सेवा अटी',
  
  // Chat
  vakilSahabAI: 'वकील साहब AI',
  statusFactGathering: 'स्थिती: तथ्य संकलन',
  statusAnalyzing: 'स्थिती: विश्लेषण',
  statusActionPlanReady: 'स्थिती: कृती योजना तयार',
  statusDocumentsReady: 'स्थिती: कागदपत्रे तयार',
  analysis: 'विश्लेषण',
  newCase: 'नवीन प्रकरण',
  describeQuery: 'तुमचा कायदेशीर प्रश्न सांगा...',
  
  // Cases
  myCases: 'माझे प्रकरण',
  noCases: 'अद्याप प्रकरण नाहीत',
  startNewCase: 'नवीन प्रकरण सुरू करा',
  stepsCompleted: 'पायऱ्या पूर्ण',
  deleteCase: 'प्रकरण हटवा',
  deleteCaseConfirm: 'हे प्रकरण कायमचे हटवायचे आहे का?',
  cancel: 'रद्द करा',
  delete: 'हटवा',
  noCasesHint: 'वकील साहब AI ला तुमची समस्या सांगून सुरुवात करा',
  
  // Vault
  documentVault: 'कागदपत्र तिजोरी',
  secureRecords: 'सुरक्षित कायदेशीर नोंदी',
  uploadNewDocument: '+ नवीन कागदपत्र अपलोड करा',
  vaultStatus: 'तिजोरी स्थिती',
  encryptedProtocol: 'धर्म प्रोटोकॉलसह एन्क्रिप्ट केलेले',
  storageUsage: 'स्टोरेज वापर',
  uploaded: 'अपलोड केले',
  
  // Profile
  profileEditKarein: 'प्रोफाइल संपादित करा',
  language: 'भाषा: मराठी',
  change: '(बदला)',
  notifications: 'सूचना',
  aboutNyAISetu: 'NyAI-Setu बद्दल',
  privacyPolicy: 'गोपनीयता धोरण',
  helpSupport: 'मदत आणि समर्थन',
  logout: 'लॉगआउट',
  cases: 'प्रकरणे',
  docs: 'कागदपत्रे',
  you: 'तुम्ही',
  vakilSahab: 'वकील साहब',
  uploadPhotoSuccess: 'प्रोफाइल फोटो अपडेट झाला.',
  uploadPhotoFailed: 'फोटो अपलोड करण्यात अयशस्वी',
  languageChanged: 'भाषा अपडेट झाली.',
};

// Hindi strings (secondary)
const hindi: LanguageStrings = {
  // Auth
  loginTitle: 'लॉगिन',
  signUpTitle: 'साइन अप',
  emailOrPhone: 'ईमेल या फोन नंबर',
  getOTP: 'OTP प्राप्त करें',
  password: 'पासवर्ड',
  forgotCredentials: 'क्रेडेंशियल भूल गए?',
  continue: 'जारी रखें',
  orContinueWith: 'या जारी रखें',
  dontHaveAccount: 'खाता नहीं है?',
  alreadyHaveAccount: 'पहले से खाता है?',
  
  // Profile Setup
  createProfile: 'प्रोफ़ाइल बनाएं',
  firstName: 'नाम',
  surname: 'उपनाम',
  email: 'ईमेल पता',
  enterOTP: '४-अंक OTP दर्ज करें',
  setPassword: 'पासवर्ड सेट करें',
  confirmPassword: 'पासवर्ड की पुष्टि करें',
  district: 'जिला',
  dateOfBirth: 'जन्म तिथि',
  submitVerify: 'सबमिट और सत्यापित करें',
  termsOfService: 'धर्म सेवा शर्तें',
  
  // Chat
  vakilSahabAI: 'वकील साहब AI',
  statusFactGathering: 'स्थिति: तथ्य संग्रह',
  statusAnalyzing: 'स्थिति: विश्लेषण',
  statusActionPlanReady: 'स्थिति: कार्य योजना तैयार',
  statusDocumentsReady: 'स्थिति: दस्तावेज़ तैयार',
  analysis: 'विश्लेषण',
  newCase: 'नया मामला',
  describeQuery: 'अपना कानूनी प्रश्न बताएं...',
  
  // Cases
  myCases: 'मेरे मामले',
  noCases: 'अभी तक कोई मामला नहीं',
  startNewCase: 'नया मामला शुरू करें',
  stepsCompleted: 'कदम पूरे',
  deleteCase: 'मामला हटाएं',
  deleteCaseConfirm: 'क्या आप इस मामले को स्थायी रूप से हटाना चाहते हैं?',
  cancel: 'रद्द करें',
  delete: 'हटाएं',
  noCasesHint: 'वकील साहब AI को अपनी समस्या बताकर शुरुआत करें',
  
  // Vault
  documentVault: 'दस्तावेज़ तिजोरी',
  secureRecords: 'सुरक्षित कानूनी रिकॉर्ड',
  uploadNewDocument: '+ नया दस्तावेज़ अपलोड करें',
  vaultStatus: 'तिजोरी स्थिति',
  encryptedProtocol: 'धर्म प्रोटोकॉल से एन्क्रिप्ट',
  storageUsage: 'स्टोरेज उपयोग',
  uploaded: 'अपलोड किया',
  
  // Profile
  profileEditKarein: 'प्रोफाइल संपादित करें',
  language: 'भाषा: हिंदी',
  change: '(बदलें)',
  notifications: 'सूचनाएं',
  aboutNyAISetu: 'NyAI-Setu के बारे में',
  privacyPolicy: 'गोपनीयता नीति',
  helpSupport: 'सहायता और समर्थन',
  logout: 'लॉगआउट',
  cases: 'मामले',
  docs: 'दस्तावेज़',
  you: 'आप',
  vakilSahab: 'वकील साहब',
  uploadPhotoSuccess: 'प्रोफाइल फोटो अपडेट हो गया।',
  uploadPhotoFailed: 'फोटो अपलोड विफल',
  languageChanged: 'भाषा अपडेट हुई।',
};

// English strings (tertiary)
const english: LanguageStrings = {
  // Auth
  loginTitle: 'Login',
  signUpTitle: 'Sign Up',
  emailOrPhone: 'Email or Phone Number',
  getOTP: 'GET OTP',
  password: 'Password',
  forgotCredentials: 'Forgot credentials?',
  continue: 'Continue',
  orContinueWith: 'OR CONTINUE WITH',
  dontHaveAccount: "Don't have account?",
  alreadyHaveAccount: 'Already have account?',
  
  // Profile Setup
  createProfile: 'Create Profile',
  firstName: 'First Name',
  surname: 'Surname',
  email: 'Email Address',
  enterOTP: 'Enter 4-digit OTP',
  setPassword: 'Set Password',
  confirmPassword: 'Confirm Password',
  district: 'District',
  dateOfBirth: 'Date of Birth',
  submitVerify: 'Submit & Verify',
  termsOfService: 'Dharma Terms of Service',
  
  // Chat
  vakilSahabAI: 'Vakil Sahab AI',
  statusFactGathering: 'STATUS: FACT GATHERING',
  statusAnalyzing: 'STATUS: ANALYZING',
  statusActionPlanReady: 'STATUS: ACTION PLAN READY',
  statusDocumentsReady: 'STATUS: DOCUMENTS READY',
  analysis: 'Analysis',
  newCase: 'New Case',
  describeQuery: 'Describe your legal query...',
  
  // Cases
  myCases: 'My Cases',
  noCases: 'No cases yet',
  startNewCase: 'Start New Case',
  stepsCompleted: 'steps completed',
  deleteCase: 'Delete Case',
  deleteCaseConfirm: 'Do you want to permanently delete this case?',
  cancel: 'Cancel',
  delete: 'Delete',
  noCasesHint: 'Start by describing your problem to Vakil Sahab AI',
  
  // Vault
  documentVault: 'Document Vault',
  secureRecords: 'SECURE LEGAL RECORDS',
  uploadNewDocument: '+ Upload New Document',
  vaultStatus: 'Vault Status',
  encryptedProtocol: 'Encrypted with Dharma Protocol',
  storageUsage: 'STORAGE USAGE',
  uploaded: 'Uploaded',
  
  // Profile
  profileEditKarein: 'Edit Profile',
  language: 'Language: English',
  change: '(Change)',
  notifications: 'Notifications',
  aboutNyAISetu: 'About NyAI-Setu',
  privacyPolicy: 'Privacy Policy',
  helpSupport: 'Help & Support',
  logout: 'LOGOUT',
  cases: 'CASES',
  docs: 'DOCS',
  you: 'You',
  vakilSahab: 'Vakil Sahab',
  uploadPhotoSuccess: 'Profile photo updated successfully.',
  uploadPhotoFailed: 'Failed to upload profile photo',
  languageChanged: 'Language updated successfully.',
};

const languages: Record<Language, LanguageStrings> = {
  mr: marathi,
  hi: hindi,
  en: english,
};

export const getLanguageStrings = (lang: Language): LanguageStrings => {
  return languages[lang] || marathi;
};

export const MAHARASHTRA_DISTRICTS = [
  'Nagpur', 'Mumbai', 'Pune', 'Nashik', 'Aurangabad', 'Solapur', 'Amravati',
  'Kolhapur', 'Thane', 'Nanded', 'Akola', 'Latur', 'Ahmednagar', 'Dhule',
  'Jalgaon', 'Satara', 'Yavatmal', 'Sangli', 'Beed', 'Buldhana', 'Parbhani',
  'Jalna', 'Osmanabad', 'Wardha', 'Raigad', 'Gondia', 'Washim', 'Gadchiroli',
  'Chandrapur', 'Ratnagiri', 'Sindhudurg', 'Bhandara', 'Hingoli', 'Nandurbar'
];