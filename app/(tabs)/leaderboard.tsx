// Leaderboard Screen - Minimalistic design
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getLeaderboard } from '@/utils/quiz';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface LeaderboardEntry {
  rank: number;
  username: string;
  xp: number;
  level: number;
}

export default function LeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  async function loadLeaderboard() {
    try {
      const data = await getLeaderboard();
      setLeaderboard(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadLeaderboard();
  }, []);

  function onRefresh() {
    setRefreshing(true);
    loadLeaderboard();
  }

  function getRankColor(rank: number): string {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return colors.primary;
  }

  function getRankLabel(rank: number): string {
    if (rank === 1) return '1st';
    if (rank === 2) return '2nd';
    if (rank === 3) return '3rd';
    return `#${rank}`;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ThemedView style={styles.container}>
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.primary} />
            <ThemedText style={styles.loadingText}>Loading</ThemedText>
          </View>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title" style={[styles.title, { color: colors.primary }]}>
            Leaderboard
          </ThemedText>
          <ThemedText style={styles.subtitle}>Top 100</ThemedText>
        </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {leaderboard.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>No players yet!</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Be the first to join the leaderboard!
            </ThemedText>
          </View>
        ) : (
          leaderboard.map((entry, index) => (
            <View
              key={index}
              style={[
                styles.leaderboardItem,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderLeftWidth: entry.rank <= 3 ? 4 : 2,
                  borderLeftColor: entry.rank <= 3 ? getRankColor(entry.rank) : colors.border,
                },
              ]}>
              <View style={styles.rankContainer}>
                <ThemedText style={[styles.rankLabel, { color: entry.rank <= 3 ? getRankColor(entry.rank) : colors.text }]}>
                  {getRankLabel(entry.rank)}
                </ThemedText>
              </View>

              <View style={styles.userInfo}>
                <ThemedText style={styles.username}>{entry.username}</ThemedText>
                <ThemedText style={styles.levelText}>Level {entry.level}</ThemedText>
              </View>

              <View style={styles.xpContainer}>
                <ThemedText style={[styles.xpText, { color: colors.text, opacity: 0.7 }]}>
                  {entry.xp} XP
                </ThemedText>
              </View>
            </View>
          ))
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    opacity: 0.6,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  levelText: {
    fontSize: 13,
    opacity: 0.6,
  },
  xpContainer: {
    alignItems: 'flex-end',
  },
  xpText: {
    fontSize: 15,
    fontWeight: '500',
  },
});

