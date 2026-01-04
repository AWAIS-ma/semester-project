// Profile Screen - Minimalistic design
import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { calculateLevel } from '@/utils/quiz';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ThemedView style={styles.container}>
          <View style={styles.centerContent}>
            <ThemedText type="title" style={styles.notLoggedInTitle}>
              Not Logged In
            </ThemedText>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(auth)/login')}>
              <ThemedText style={styles.buttonText}>Login</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const level = calculateLevel(user.xp);
  const xpForNextLevel = (level + 1) * 100;
  const currentLevelXp = level * 100;
  const progress = ((user.xp - currentLevelXp) / (xpForNextLevel - currentLevelXp)) * 100;

  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login');
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <ThemedText style={styles.avatarText}>
              {user.username.charAt(0).toUpperCase()}
            </ThemedText>
          </View>
          <ThemedText type="title" style={styles.username}>
            {user.username}
          </ThemedText>
          <ThemedText style={styles.email}>{user.email}</ThemedText>
        </View>

        {/* Stats Card */}
        <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statValue, { color: colors.primary }]}>
              {user.xp}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Total XP</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={[styles.statValue, { color: colors.accent }]}>
              {level}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Level</ThemedText>
          </View>
        </View>

        {/* Level Progress */}
        <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={styles.progressTitle}>Progress to Level {level + 1}</ThemedText>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(progress, 100)}%`,
                  backgroundColor: colors.success,
                },
              ]}
            />
          </View>
          <ThemedText style={styles.progressText}>
            {user.xp - currentLevelXp} / {xpForNextLevel - currentLevelXp} XP
          </ThemedText>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.error }]}
          onPress={handleLogout}>
          <ThemedText style={styles.logoutButtonText}>Logout</ThemedText>
        </TouchableOpacity>
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notLoggedInTitle: {
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  username: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    opacity: 0.6,
  },
  statsCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    opacity: 0.6,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  progressCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    opacity: 0.6,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

