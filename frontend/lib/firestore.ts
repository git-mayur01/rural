import { db, storage } from './firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  deleteDoc,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { UserProfile, Case, Message, VaultFile } from '../types';

// ============= USER PROFILE =============

export async function createUserProfile(uid: string, profileData: Partial<UserProfile>) {
  const userRef = doc(db, 'users', uid);
  const userData: UserProfile = {
    uid,
    firstName: profileData.firstName || '',
    surname: profileData.surname || '',
    email: profileData.email || '',
    district: profileData.district || 'Nagpur',
    dateOfBirth: profileData.dateOfBirth || '',
    language: profileData.language || 'mr',
    createdAt: Date.now(),
    totalCases: 0,
    totalDocs: 0,
  };
  await setDoc(userRef, userData);
  return userData;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }
  return null;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, data);
}

// ============= CASES =============

export async function createCase(userId: string, title: string = 'नवीन प्रकरण'): Promise<string> {
  const caseData: Omit<Case, 'caseId'> = {
    userId,
    title,
    status: 'fact_gathering',
    analysisProgress: 0,
    legalSections: [],
    actionSteps: [],
    caseStrength: 0,
    messages: [],
    documents: {
      fir: '',
      nhrc: '',
      magistrate: '',
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const casesRef = collection(db, 'cases');
  const docRef = await addDoc(casesRef, caseData);
  
  // Update user's total cases
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const currentTotal = userSnap.data().totalCases || 0;
    await updateDoc(userRef, { totalCases: currentTotal + 1 });
  }

  return docRef.id;
}

export async function getCase(caseId: string): Promise<Case | null> {
  const caseRef = doc(db, 'cases', caseId);
  const caseSnap = await getDoc(caseRef);
  if (caseSnap.exists()) {
    return { caseId: caseSnap.id, ...caseSnap.data() } as Case;
  }
  return null;
}

export async function updateCase(caseId: string, data: Partial<Case>) {
  const caseRef = doc(db, 'cases', caseId);
  await updateDoc(caseRef, {
    ...data,
    updatedAt: Date.now(),
  });
}

export async function getUserCases(userId: string): Promise<Case[]> {
  const casesRef = collection(db, 'cases');
  const q = query(
    casesRef,
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  const cases: Case[] = [];
  querySnapshot.forEach((doc) => {
    cases.push({ caseId: doc.id, ...doc.data() } as Case);
  });
  return cases;
}

export async function addMessageToCase(caseId: string, message: Message) {
  const caseRef = doc(db, 'cases', caseId);
  await updateDoc(caseRef, {
    messages: arrayUnion(message),
    updatedAt: Date.now(),
  });
}

// ============= VAULT (FILE STORAGE) =============

export async function uploadVaultFile(
  userId: string,
  file: Blob,
  fileName: string,
  fileType: string
): Promise<VaultFile> {
  // Upload to Firebase Storage
  const storageRef = ref(storage, `users/${userId}/vault/${Date.now()}_${fileName}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  // Save metadata to Firestore
  const vaultData: Omit<VaultFile, 'fileId'> = {
    userId,
    fileName,
    fileSize: file.size,
    fileType,
    downloadURL,
    uploadedAt: Date.now(),
  };

  const vaultRef = collection(db, 'vault');
  const docRef = await addDoc(vaultRef, vaultData);

  // Update user's total docs
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const currentTotal = userSnap.data().totalDocs || 0;
    await updateDoc(userRef, { totalDocs: currentTotal + 1 });
  }

  return { fileId: docRef.id, ...vaultData };
}

export async function getUserVaultFiles(userId: string): Promise<VaultFile[]> {
  const vaultRef = collection(db, 'vault');
  const q = query(
    vaultRef,
    where('userId', '==', userId),
    orderBy('uploadedAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  const files: VaultFile[] = [];
  querySnapshot.forEach((doc) => {
    files.push({ fileId: doc.id, ...doc.data() } as VaultFile);
  });
  return files;
}

export async function deleteVaultFile(userId: string, fileId: string, downloadURL: string) {
  // Delete from Firestore
  const fileRef = doc(db, 'vault', fileId);
  await deleteDoc(fileRef);

  // Delete from Storage
  try {
    const storageRef = ref(storage, downloadURL);
    await deleteObject(storageRef);
  } catch (error) {
    console.log('Storage delete error (may not exist):', error);
  }

  // Update user's total docs
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const currentTotal = userSnap.data().totalDocs || 0;
    await updateDoc(userRef, { totalDocs: Math.max(0, currentTotal - 1) });
  }
}