import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/contexts/AuthContext';
import { initDatabase } from '@/database/db';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [dbReady, setDbReady] = useState(false);

  // Initialize database on app start - MUST complete before rendering AuthProvider
  useEffect(() => {
    async function setupDatabase() {
      try {
        await initDatabase();
        console.log('Database initialized successfully');
        setDbReady(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        // Retry once after a short delay
        setTimeout(async () => {
          try {
            await initDatabase();
            console.log('Database initialized on retry');
            setDbReady(true);
          } catch (retryError) {
            console.error('Database initialization failed on retry:', retryError);
            // Still set ready to prevent infinite loading, but log error
            setDbReady(true);
          }
        }, 1000);
      }
    }
    setupDatabase();
  }, []);

  // Don't render AuthProvider until database is ready
  if (!dbReady) {
    return null; // Or a loading screen
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="quiz-attempt" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
