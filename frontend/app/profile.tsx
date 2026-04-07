import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAppStore } from '../store/useAppStore';
import { getLanguageStrings } from '../lib/languages';
import { updateUserProfile } from '../lib/firestore';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, userProfile, language, setLanguage, resetAll } = useAppStore();
  const strings = getLanguageStrings(language);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false);

  const getInitials = () => {
    if (!userProfile) return 'U';
    return `${userProfile.firstName[0]}${userProfile.surname[0]}`.toUpperCase();
  };

  const handleLogout = async () => {
    Alert.alert(
      'लॉगआउट',
      'तुम्हाला खात्री आहे का तुम्ही लॉगआउट करू इच्छिता?',
      [
        { text: 'रद्द करा', style: 'cancel' },
        {
          text: 'लॉगआउट',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              resetAll();
              router.replace('/auth');
            } catch (error: any) {
              Alert.alert('त्रुटी', 'लॉगआउट करण्यात अयशस्वी: ' + error.message);
            }
          },
        },
      ]
    );
  };

  const handleLanguageChange = async () => {
    Alert.alert(
      'भाषा बदला',
      'भाषा निवडा:',
      [
        {
          text: 'मराठी',
          onPress: async () => {
            if (user && userProfile) {
              await updateUserProfile(user.uid, { language: 'mr' });
              setLanguage('mr');
            }
          },
        },
        {
          text: 'हिंदी',
          onPress: async () => {
            if (user && userProfile) {
              await updateUserProfile(user.uid, { language: 'hi' });
              setLanguage('hi');
            }
          },
        },
        {
          text: 'English',
          onPress: async () => {
            if (user && userProfile) {
              await updateUserProfile(user.uid, { language: 'en' });
              setLanguage('en');
            }
          },
        },
        { text: 'रद्द करा', style: 'cancel' },
      ]
    );
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
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{getInitials()}</Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={24} color="#FF6B00" />
            </View>
          </View>
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
            <Text style={styles.statNumber}>{userProfile?.totalCases || 0}</Text>
            <Text style={styles.statLabel}>प्रकरणे</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userProfile?.totalDocs || 0}</Text>
            <Text style={styles.statLabel}>कागदपत्रे</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile-setup')}>
            <Ionicons name="person-outline" size={24} color="#FF6B00" />
            <Text style={styles.menuText}>प्रोफाइल संपादित करा</Text>
            <Ionicons name="chevron-forward" size={20} color="#A0785A" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleLanguageChange}>
            <Ionicons name="language-outline" size={24} color="#FF6B00" />
            <View style={{ flex: 1 }}>
              <Text style={styles.menuText}>भाषा: {getLanguageName()}</Text>
              <Text style={styles.menuSubtext}>(बदला)</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#A0785A" />
          </TouchableOpacity>

          <View style={styles.menuItem}>
            <Ionicons name="notifications-outline" size={24} color="#FF6B00" />
            <Text style={styles.menuText}>सूचना</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#3A3A3A', true: '#FF6B00' }}
              thumbColor={notificationsEnabled ? '#FFF' : '#A0785A'}
            />
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert('About NyAI-Setu', 'AI-powered legal guidance for rural Indian citizens.')}
          >
            <Ionicons name="information-circle-outline" size={24} color="#FF6B00" />
            <Text style={styles.menuText}>NyAI-Setu बद्दल</Text>
            <Ionicons name="chevron-forward" size={20} color="#A0785A" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert('Privacy Policy', 'Your data is encrypted and secure.')}
          >
            <Ionicons name="shield-checkmark-outline" size={24} color="#FF6B00" />
            <Text style={styles.menuText}>गोपनीयता धोरण</Text>
            <Ionicons name="chevron-forward" size={20} color="#A0785A" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert('Help & Support', 'DLSA Nagpur: 0712-2560123')}
          >
            <Ionicons name="help-circle-outline" size={24} color="#FF6B00" />
            <Text style={styles.menuText}>मदत आणि समर्थन</Text>
            <Ionicons name="chevron-forward" size={20} color="#A0785A" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FF6B00" />
          <Text style={styles.logoutText}>लॉगआउट</Text>
        </TouchableOpacity>
      </ScrollView>
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
});