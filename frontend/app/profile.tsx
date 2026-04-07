import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAppStore } from '../store/useAppStore';
import { getLanguageStrings } from '../lib/languages';
import { getUserCases, getUserVaultFiles, updateUserProfile } from '../lib/firestore';
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../lib/firebase';
import ThemedModal from '../components/ThemedModal';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, userProfile, language, setLanguage, resetAll } = useAppStore();
  const strings = getLanguageStrings(language);
  const { setUserProfile } = useAppStore();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(userProfile?.notificationsEnabled ?? false);
  const [casesCount, setCasesCount] = React.useState(0);
  const [docsCount, setDocsCount] = React.useState(0);
  const [isUploadingPhoto, setIsUploadingPhoto] = React.useState(false);
  const [languageModalVisible, setLanguageModalVisible] = React.useState(false);
  const [feedbackModal, setFeedbackModal] = React.useState<{ visible: boolean; title: string; message: string }>({
    visible: false,
    title: '',
    message: '',
  });

  React.useEffect(() => {
    const loadCounts = async () => {
      if (!user) return;
      try {
        const [cases, docs] = await Promise.all([getUserCases(user.uid), getUserVaultFiles(user.uid)]);
        setCasesCount(cases.length);
        setDocsCount(docs.length);
      } catch (error) {
        console.log('Error loading profile counts:', error);
      }
    };
    loadCounts();
  }, [user]);

  React.useEffect(() => {
    setNotificationsEnabled(userProfile?.notificationsEnabled ?? false);
  }, [userProfile?.notificationsEnabled]);

  const getInitials = () => {
    const first = userProfile?.firstName?.[0] || '';
    const last = userProfile?.surname?.[0] || '';
    const initials = `${first}${last}`.toUpperCase();
    return initials || 'U';
  };
  const handleProfilePhotoUpload = async () => {
    if (!user || !userProfile) return;
    setIsUploadingPhoto(true);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setFeedbackModal({
        visible: true,
        title: 'परवानगी आवश्यक',
        message: 'प्रोफाइल फोटो अपलोड करण्यासाठी गॅलरी परवानगी द्या.',
      });
      setIsUploadingPhoto(false);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      aspect: [1, 1],
    });

    if (result.canceled || !result.assets?.length) {
      setIsUploadingPhoto(false);
      return;
    }

    try {
      const uri = result.assets[0].uri;
      const res = await fetch(uri);
      const blob = await res.blob();
      const imageRef = ref(storage, `users/${user.uid}/profile/profile.jpg`);
      await uploadBytes(imageRef, blob);
      const photoURL = await getDownloadURL(imageRef);
      await updateUserProfile(user.uid, { photoURL });
      setUserProfile({ ...userProfile, photoURL });
      setFeedbackModal({
        visible: true,
        title: 'यश',
        message: strings.uploadPhotoSuccess,
      });
    } catch (error: any) {
      setFeedbackModal({
        visible: true,
        title: 'त्रुटी',
        message:
          error?.code === 'storage/unauthorized'
            ? (language === 'en'
                ? 'Upload denied by Storage rules. Allow authenticated writes in Firebase Storage rules.'
                : 'Storage नियमांमुळे अपलोड नाकारले गेले. Firebase Storage rules मध्ये authenticated write परवानगी द्या.')
            : error.message || strings.uploadPhotoFailed,
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };


  const handleLogout = async () => {
    setFeedbackModal({
      visible: true,
      title: 'लॉगआउट',
      message: 'तुम्हाला खात्री आहे का तुम्ही लॉगआउट करू इच्छिता?',
    });
  };

  const handleLanguageChange = () => {
    setLanguageModalVisible(true);
  };

  const selectLanguage = async (lang: 'mr' | 'hi' | 'en') => {
    try {
      if (user && userProfile) {
        await updateUserProfile(user.uid, { language: lang });
        setUserProfile({ ...userProfile, language: lang });
      }
      setLanguage(lang);
      setLanguageModalVisible(false);
    } catch (error: any) {
      setLanguageModalVisible(false);
      setFeedbackModal({ visible: true, title: 'त्रुटी', message: error.message || 'भाषा बदलण्यात अयशस्वी' });
    }
  };

  const getLanguageName = () => {
    switch (language) {
      case 'mr':
        return 'मराठी';
      case 'hi':
        return 'हिंदी';
      case 'en':
        return 'English';
      default:
        return 'मराठी';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="scale" size={24} color="#FF6B00" />
            <Text style={styles.logoText}>NyAI-Setu</Text>
          </View>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.avatarLarge} onPress={handleProfilePhotoUpload} activeOpacity={0.8}>
            {userProfile?.photoURL ? (
              <Image source={{ uri: userProfile.photoURL }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarLargeText}>{getInitials()}</Text>
            )}
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={24} color="#FF6B00" />
            </View>
          </TouchableOpacity>
          <Text style={styles.profileName}>
            {userProfile?.firstName} {userProfile?.surname}
          </Text>
          <Text style={styles.profileLocation}>
            {userProfile?.district}, Maharashtra
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{casesCount}</Text>
            <Text style={styles.statLabel}>{strings.cases}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{docsCount}</Text>
            <Text style={styles.statLabel}>{strings.docs}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/edit-profile')}>
            <Ionicons name="person-outline" size={24} color="#FF6B00" />
            <Text style={styles.menuText}>{strings.profileEditKarein}</Text>
            <Ionicons name="chevron-forward" size={20} color="#A0785A" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleLanguageChange}>
            <Ionicons name="language-outline" size={24} color="#FF6B00" />
            <View style={{ flex: 1 }}>
              <Text style={styles.menuText}>{strings.language.replace(/:.*/, '')}: {getLanguageName()}</Text>
              <Text style={styles.menuSubtext}>{strings.change}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#A0785A" />
          </TouchableOpacity>

          <View style={styles.menuItem}>
            <Ionicons name="notifications-outline" size={24} color="#FF6B00" />
            <Text style={styles.menuText}>{strings.notifications}</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={async (value) => {
                setNotificationsEnabled(value);
                if (user && userProfile) {
                  await updateUserProfile(user.uid, { notificationsEnabled: value });
                  setUserProfile({ ...userProfile, notificationsEnabled: value });
                }
              }}
              trackColor={{ false: '#3A3A3A', true: '#FF6B00' }}
              thumbColor={notificationsEnabled ? '#FFF' : '#A0785A'}
            />
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/about')}
          >
            <Ionicons name="information-circle-outline" size={24} color="#FF6B00" />
            <Text style={styles.menuText}>{strings.aboutNyAISetu}</Text>
            <Ionicons name="chevron-forward" size={20} color="#A0785A" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/privacy')}
          >
            <Ionicons name="shield-checkmark-outline" size={24} color="#FF6B00" />
            <Text style={styles.menuText}>{strings.privacyPolicy}</Text>
            <Ionicons name="chevron-forward" size={20} color="#A0785A" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/help-support')}
          >
            <Ionicons name="help-circle-outline" size={24} color="#FF6B00" />
            <Text style={styles.menuText}>{strings.helpSupport}</Text>
            <Ionicons name="chevron-forward" size={20} color="#A0785A" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FF6B00" />
          <Text style={styles.logoutText}>{strings.logout}</Text>
        </TouchableOpacity>
      </ScrollView>

      {isUploadingPhoto && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF6B00" />
          <Text style={styles.loadingText}>फोटो अपलोड होत आहे...</Text>
        </View>
      )}

      <ThemedModal
        visible={languageModalVisible}
        title={language === 'en' ? 'Change Language' : 'भाषा बदला'}
        message={language === 'en' ? 'Select language:' : 'भाषा निवडा:'}
        onClose={() => setLanguageModalVisible(false)}
        actions={[
          { label: 'मराठी', onPress: () => selectLanguage('mr'), variant: 'primary' },
          { label: 'हिंदी', onPress: () => selectLanguage('hi'), variant: 'secondary' },
          { label: 'English', onPress: () => selectLanguage('en'), variant: 'secondary' },
          { label: 'रद्द करा', onPress: () => setLanguageModalVisible(false), variant: 'secondary' },
        ]}
      />

      <ThemedModal
        visible={feedbackModal.visible}
        title={feedbackModal.title}
        message={feedbackModal.message}
        onClose={() => setFeedbackModal({ visible: false, title: '', message: '' })}
        actions={
          feedbackModal.title === 'लॉगआउट'
            ? [
                { label: 'रद्द करा', onPress: () => setFeedbackModal({ visible: false, title: '', message: '' }), variant: 'secondary' },
                {
                  label: 'लॉगआउट',
                  onPress: async () => {
                    try {
                      await signOut(auth);
                      resetAll();
                      setFeedbackModal({ visible: false, title: '', message: '' });
                      router.replace('/auth');
                    } catch (error: any) {
                      setFeedbackModal({
                        visible: true,
                        title: 'त्रुटी',
                        message: 'लॉगआउट करण्यात अयशस्वी: ' + error.message,
                      });
                    }
                  },
                  variant: 'primary',
                },
              ]
            : [{ label: 'OK', onPress: () => setFeedbackModal({ visible: false, title: '', message: '' }), variant: 'primary' }]
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A0A00',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2A1500',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FF6B00',
    marginBottom: 16,
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  avatarLargeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1A0A00',
    borderRadius: 12,
  },
  profileName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  profileLocation: {
    fontSize: 16,
    color: '#A0785A',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#2A1500',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.3)',
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A0785A',
  },
  menuContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A1500',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.3)',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 16,
  },
  menuSubtext: {
    fontSize: 12,
    color: '#A0785A',
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#FF6B00',
  },
  logoutText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B00',
    letterSpacing: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});