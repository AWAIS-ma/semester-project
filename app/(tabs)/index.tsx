// Home Screen - Minimalistic design
import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <ThemedText type="title" style={[styles.title, { color: colors.primary }]}>
              TriviAI
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Test your knowledge
            </ThemedText>
          </View>

          {user ? (
            <View style={styles.userSection}>
              <View style={[styles.welcomeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <ThemedText style={styles.welcomeText}>
                  <ThemedText style={[styles.usernameText, { color: colors.primary }]}>{user.username}</ThemedText>
                </ThemedText>
                <ThemedText style={styles.statsText}>
                  {user.xp} XP · Level {Math.min(Math.floor(user.xp / 100), 10)}
                </ThemedText>
              </View>

              <View style={styles.featuresContainer}>
                <TouchableOpacity
                  style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => router.push('/(tabs)/quiz')}>
                  <ThemedText style={[styles.featureTitle, { color: colors.primary }]}>Start Quiz</ThemedText>
                  <ThemedText style={styles.featureDescription}>
                    Challenge yourself with various quiz types
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => router.push('/(tabs)/leaderboard')}>
                  <ThemedText style={[styles.featureTitle, { color: colors.accent }]}>Leaderboard</ThemedText>
                  <ThemedText style={styles.featureDescription}>
                    See how you rank against others
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => router.push('/(tabs)/profile')}>
                  <ThemedText style={[styles.featureTitle, { color: colors.secondary }]}>Profile</ThemedText>
                  <ThemedText style={styles.featureDescription}>
                    View your stats and progress
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.authSection}>
              <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <ThemedText style={styles.infoTitle}>Get Started</ThemedText>
                <ThemedText style={styles.infoText}>
                  Sign up or login to start playing quizzes and earning XP
                </ThemedText>
              </View>

              <TouchableOpacity
                style={[styles.authButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/(auth)/login')}>
                <ThemedText style={styles.authButtonText}>Login</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.authButton, { backgroundColor: colors.secondary }]}
                onPress={() => router.push('/(auth)/signup')}>
                <ThemedText style={styles.authButtonText}>Sign Up</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.6,
  },
  userSection: {
    marginBottom: 24,
  },
  welcomeCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  usernameText: {
    fontWeight: '600',
  },
  statsText: {
    fontSize: 14,
    opacity: 0.6,
  },
  featuresContainer: {
    gap: 12,
  },
  featureCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    alignItems: 'flex-start',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  authSection: {
    marginBottom: 24,
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
  authButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
