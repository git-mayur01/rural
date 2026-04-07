import React, { useEffect } from 'react';
import { auth } from '../lib/firebase';
import { getUserProfile } from '../lib/firestore';
import { useAppStore } from '../store/useAppStore';
import { useRouter, usePathname } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import BottomNav from './BottomNav';
import { View, StyleSheet } from 'react-native';

interface Props {
  children: React.ReactNode;
}

const AppLayoutWrapper: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { setUser, setUserProfile } = useAppStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        // Fetch user profile
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);

        // Routing logic
        if (
          !profile &&
          pathname !== '/profile-setup' &&
          pathname !== '/signup' &&
          pathname !== '/verify-otp'
        ) {
          router.replace('/profile-setup');
        } else if (
          profile &&
          (pathname === '/' ||
            pathname === '/auth' ||
            pathname === '/signup' ||
            pathname === '/verify-otp')
        ) {
          router.replace('/chat');
        }
      } else {
        setUserProfile(null);
        // Not logged in
        if (
          pathname !== '/auth' &&
          pathname !== '/signup' &&
          pathname !== '/verify-otp' &&
          pathname !== '/forgot-password' &&
          pathname !== '/'
        ) {
          router.replace('/auth');
        }
      }
    });

    return () => unsubscribe();
  }, [pathname, router, setUser, setUserProfile]);

  return (
    <View style={styles.container}>
      {children}
      <BottomNav />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A0A00',
  },
});

export default AppLayoutWrapper;