import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false, // Oculta o cabeçalho em todas as telas
          presentation: 'transparentModal', // Aplica uma transição mais suave
          animation: 'fade', // Define a animação como fade
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="cadastro" />
        <Stack.Screen name="reset" />
        <Stack.Screen name="document_guincho" />
        <Stack.Screen name="document_motorista" />
        <Stack.Screen name="home_guincho" />
        <Stack.Screen name="home_motorista" />
        <Stack.Screen name="popup" />
        <Stack.Screen name="home" />
        <Stack.Screen name="Msolicitacao" />
        <Stack.Screen name="pesquisa" />
        <Stack.Screen name="route.tsx" />
        <Stack.Screen name="solicitacao" />
        <Stack.Screen name="tracking.tsx" />
      </Stack>
    </ThemeProvider>
  );
}
