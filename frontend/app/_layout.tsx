import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppLayoutWrapper from '../components/AppLayoutWrapper';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { NotoSansDevanagari_400Regular, NotoSansDevanagari_700Bold } from '@expo-google-fonts/noto-sans-devanagari';
import { Text, TextInput } from 'react-native';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    NotoSansDevanagari_400Regular,
    NotoSansDevanagari_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      // Ensure Marathi/Hindi glyphs render correctly across the app.
      Text.defaultProps = Text.defaultProps || {};
      Text.defaultProps.style = [{ fontFamily: 'NotoSansDevanagari_400Regular' }, Text.defaultProps.style];
      TextInput.defaultProps = TextInput.defaultProps || {};
      TextInput.defaultProps.style = [{ fontFamily: 'NotoSansDevanagari_400Regular' }, TextInput.defaultProps.style];
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AppLayoutWrapper>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#1A0A00' },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="verify-otp" />
          <Stack.Screen name="forgot-password" />
          <Stack.Screen name="profile-setup" />
          <Stack.Screen name="edit-profile" />
          <Stack.Screen name="about" />
          <Stack.Screen name="privacy" />
          <Stack.Screen name="help-support" />
          <Stack.Screen name="chat" />
          <Stack.Screen name="cases" />
          <Stack.Screen name="vault" />
          <Stack.Screen name="profile" />
        </Stack>
      </AppLayoutWrapper>
    </SafeAreaProvider>
  );
}