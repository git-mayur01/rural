import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../store/useAppStore';

export default function Index() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const userProfile = useAppStore((state) => state.userProfile);

  useEffect(() => {
    // Wait a moment for auth state to load
    const timer = setTimeout(() => {
      if (!user) {
        router.replace('/auth');
      } else if (!userProfile) {
        router.replace('/profile-setup');
      } else {
        router.replace('/chat');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [user, userProfile]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FF6B00" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A0A00',
    alignItems: 'center',
    justifyContent: 'center',
  },
});