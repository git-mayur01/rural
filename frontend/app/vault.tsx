import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useAppStore } from '../store/useAppStore';
import { getLanguageStrings } from '../lib/languages';
import { uploadVaultFile, getUserVaultFiles, deleteVaultFile } from '../lib/firestore';
import { VaultFile } from '../types';
import { format } from 'date-fns';

export default function VaultScreen() {
  const { user, userProfile, language } = useAppStore();
  const strings = getLanguageStrings(language);
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const vaultFiles = await getUserVaultFiles(user.uid);
      setFiles(vaultFiles);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const file = result.assets[0];
      if (!user) return;

      setUploading(true);

      // Convert to blob
      const response = await fetch(file.uri);
      const blob = await response.blob();

      await uploadVaultFile(user.uid, blob, file.name, file.mimeType || 'application/pdf');
      Alert.alert('यश', 'फाइल यशस्वीरित्या अपलोड केली');
      loadFiles();
    } catch (error: any) {
      Alert.alert('त्रुटी', 'फाइल अपलोड करण्यात अयशस्वी: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (file: VaultFile) => {
    Alert.alert(
      'फाइल हटवा',
      'तुम्हाला खात्री आहे का तुम्ही ही फाइल हटवू इच्छिता?',
      [
        { text: 'रद्द करा', style: 'cancel' },
        {
          text: 'हटवा',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            try {
              await deleteVaultFile(user.uid, file.fileId, file.downloadURL);
              loadFiles();
            } catch (error: any) {
              Alert.alert('त्रुटी', 'फाइल हटवण्यात अयशस्वी: ' + error.message);
            }
          },
        },
      ]
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getTotalSize = () => {
    const total = files.reduce((sum, file) => sum + file.fileSize, 0);
    return formatFileSize(total);
  };

  const getStoragePercentage = () => {
    const total = files.reduce((sum, file) => sum + file.fileSize, 0);
    const maxStorage = 500 * 1024 * 1024; // 500 MB
    return Math.min((total / maxStorage) * 100, 100);
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
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials()}</Text>
        </View>
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Document Vault</Text>
        <Text style={styles.subtitle}>SECURE LEGAL RECORDS</Text>
      </View>

      {/* Upload Button */}
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={handleUpload}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <>
            <Ionicons name="add-circle" size={24} color="#000" />
            <Text style={styles.uploadButtonText}>+ नवीन कागदपत्र अपलोड करा</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Files List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B00" />
          </View>
        ) : files.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={80} color="rgba(255, 107, 0, 0.3)" />
            <Text style={styles.emptyText}>अद्याप कागदपत्रे नाहीत</Text>
          </View>
        ) : (
          files.map((file) => (
            <View key={file.fileId} style={styles.fileCard}>
              <View style={styles.fileIcon}>
                <Ionicons name="document" size={32} color="#FF6B00" />
              </View>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {file.fileName}
                </Text>
                <Text style={styles.fileSize}>{formatFileSize(file.fileSize)}</Text>
                <Text style={styles.fileDate}>
                  अपलोड केले {format(file.uploadedAt, 'dd MMM yyyy')}
                </Text>
              </View>
              <View style={styles.fileActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="download-outline" size={24} color="#FF6B00" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(file)}
                >
                  <Ionicons name="trash-outline" size={24} color="#FF6B00" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Vault Status */}
        <View style={styles.vaultStatus}>
          <View style={styles.statusIcon}>
            <Ionicons name="shield-checkmark" size={48} color="#FF6B00" />
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>Vault Status</Text>
            <Text style={styles.statusSubtitle}>धर्म प्रोटोकॉलसह एन्क्रिप्ट केलेले</Text>
            <Text style={styles.storageLabel}>STORAGE USAGE</Text>
            <Text style={styles.storageText}>
              {getTotalSize()} OF 500 MB
            </Text>
            <View style={styles.storageBar}>
              <View style={[styles.storageFill, { width: `${getStoragePercentage()}%` }]} />
            </View>
          </View>
        </View>
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
  titleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginBottom: 4,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#A0785A',
    letterSpacing: 1,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#FF6B00',
    marginHorizontal: 20,
    marginBottom: 24,
    paddingVertical: 16,
    borderRadius: 28,
  },
  uploadButtonText: {
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
    alignItems: 'center',
    marginTop: 60,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#A0785A',
    marginTop: 16,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A1500',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.3)',
  },
  fileIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 107, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
    color: '#A0785A',
    marginBottom: 2,
  },
  fileDate: {
    fontSize: 12,
    color: '#A0785A',
  },
  fileActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  vaultStatus: {
    flexDirection: 'row',
    backgroundColor: '#2A1500',
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.3)',
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 107, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#A0785A',
    marginBottom: 16,
  },
  storageLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A0785A',
    marginBottom: 6,
    letterSpacing: 1,
  },
  storageText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginBottom: 8,
  },
  storageBar: {
    height: 8,
    backgroundColor: 'rgba(255, 107, 0, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  storageFill: {
    height: '100%',
    backgroundColor: '#FF6B00',
    borderRadius: 4,
  },
});