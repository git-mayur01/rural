import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { getLanguageStrings } from '../lib/languages';

const BottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const language = useAppStore((state) => state.language);
  const strings = getLanguageStrings(language);

  // Don't show on auth screens
  if (pathname === '/auth' || pathname === '/signup' || pathname === '/verify-otp' || pathname === '/forgot-password' || pathname === '/profile-setup' || pathname === '/edit-profile' || pathname === '/about' || pathname === '/privacy' || pathname === '/help-support' || pathname === '/') {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  const tabs = [
    { path: '/chat', icon: 'chatbubble', label: 'CHAT' },
    { path: '/cases', icon: 'business', label: strings.cases },
    { path: '/vault', icon: 'folder', label: 'VAULT' },
    { path: '/profile', icon: 'person', label: 'PROFILE' },
  ];

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {tabs.map((tab) => {
        const active = isActive(tab.path);
        return (
          <TouchableOpacity
            key={tab.path}
            style={styles.tab}
            onPress={() => router.push(tab.path as any)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={active ? tab.icon : `${tab.icon}-outline`}
              size={24}
              color={active ? '#FF6B00' : '#A0785A'}
            />
            <Text style={[styles.label, active && styles.activeLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#1A0A00',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 107, 0, 0.2)',
    paddingTop: 8,
    height: 64,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    color: '#A0785A',
    letterSpacing: 0.5,
  },
  activeLabel: {
    color: '#FF6B00',
  },
});

export default BottomNav;