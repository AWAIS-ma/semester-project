// Quiz Screen - Minimalistic design
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import {
  QuizType,
  Difficulty,
} from '@/utils/quiz';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Popular topic badges
const TOPIC_BADGES = [
  'JavaScript', 'Python', 'React', 'Java', 'C++', 
  'History', 'Science', 'Math', 'Geography', 'Sports',
  'Movies', 'Music', 'Art', 'Literature', 'Technology'
];

export default function QuizScreen() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [quizType, setQuizType] = useState<QuizType>('MCQ');
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Get current topic (from badge or custom input)
  const currentTopic = topic || customTopic;

  // Handle badge selection
  function handleBadgeSelect(badgeTopic: string) {
    setTopic(badgeTopic);
    setCustomTopic(''); // Clear custom input when badge is selected
  }

  // Quiz type buttons
  const quizTypes: QuizType[] = ['MCQ', 'True/False', 'Programming', 'Riddle'];
  const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard', 'Very Hard'];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <ThemedText type="title" style={[styles.title, { color: colors.primary }]}>
              Quiz
            </ThemedText>
            {user && (
              <ThemedText style={styles.xpText}>
                {user.xp} XP · Level {Math.min(Math.floor(user.xp / 100), 10)}
              </ThemedText>
            )}
          </View>

          {/* Topic Selection */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Topic</ThemedText>
          
          {/* Topic Badges */}
          <View style={styles.badgesContainer}>
            {TOPIC_BADGES.map((badge, index) => {
              const badgeColors = [
                colors.badge1, colors.badge2, colors.badge3, colors.badge4,
                colors.badge5, colors.badge6, colors.badge7, colors.badge8
              ];
              const badgeColor = badgeColors[index % badgeColors.length];
              const isSelected = topic === badge;
              
              return (
                <TouchableOpacity
                  key={badge}
                  style={[
                    styles.badge,
                    {
                      backgroundColor: isSelected ? badgeColor : colors.card,
                      borderColor: isSelected ? badgeColor : colors.border,
                      borderWidth: isSelected ? 3 : 2,
                    },
                  ]}
                  onPress={() => handleBadgeSelect(badge)}>
                  <ThemedText
                    style={[
                      styles.badgeText,
                      { color: isSelected ? '#FFFFFF' : colors.text },
                    ]}>
                    {badge}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom Topic Input */}
          <View style={styles.customInputContainer}>
            <ThemedText style={styles.customInputLabel}>Custom Topic</ThemedText>
            <TextInput
              style={[
                styles.customInput,
                {
                  backgroundColor: colors.card,
                  borderColor: customTopic ? colors.primary : colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Type your topic here..."
              placeholderTextColor={colors.icon}
              value={customTopic}
              onChangeText={(text) => {
                setCustomTopic(text);
                setTopic(''); // Clear badge selection when typing
              }}
            />
          </View>

          {/* Current Topic Display */}
          {currentTopic && (
            <View style={[styles.currentTopicBox, { backgroundColor: colors.card, borderColor: colors.primary }]}>
              <ThemedText style={[styles.currentTopicText, { color: colors.primary }]}>
                {currentTopic}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Quiz Type Selection */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Quiz Type</ThemedText>
          <View style={styles.buttonRow}>
            {quizTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor:
                      quizType === type ? colors.primary : colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setQuizType(type)}>
                <ThemedText
                  style={[
                    styles.typeButtonText,
                    { color: quizType === type ? '#FFFFFF' : colors.text },
                  ]}>
                  {type}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Difficulty Selection */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Difficulty</ThemedText>
          <View style={styles.buttonRow}>
            {difficulties.map((diff) => (
              <TouchableOpacity
                key={diff}
                style={[
                  styles.difficultyButton,
                  {
                    backgroundColor:
                      difficulty === diff ? colors.accent : colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setDifficulty(diff)}>
                <ThemedText
                  style={[
                    styles.difficultyButtonText,
                    { color: difficulty === diff ? '#FFFFFF' : colors.text },
                  ]}>
                  {diff}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Start Quiz Button */}
        <TouchableOpacity
          style={[
            styles.generateButton,
            {
              backgroundColor: currentTopic ? colors.success : colors.border,
            },
          ]}
          onPress={() => {
            if (!currentTopic.trim()) {
              Alert.alert('Error', 'Please select a topic badge or enter a custom topic');
              return;
            }
            router.push({
              pathname: '/quiz-attempt',
              params: {
                topic: currentTopic,
                quizType: quizType,
                difficulty: difficulty,
              },
            });
          }}
          disabled={!currentTopic}>
          <ThemedText style={styles.generateButtonText}>
            {currentTopic ? 'Start Quiz' : 'Select Topic'}
          </ThemedText>
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 8,
  },
  xpText: {
    fontSize: 14,
    opacity: 0.6,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    opacity: 0.8,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  customInputContainer: {
    marginTop: 8,
  },
  customInputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    opacity: 0.7,
  },
  customInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  currentTopicBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  currentTopicText: {
    fontSize: 15,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  difficultyButton: {
    flex: 1,
    minWidth: '22%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  difficultyButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  generateButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  questionCard: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  optionButton: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 15,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  textInputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  answerInput: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 15,
    minHeight: 50,
    fontSize: 16,
  },
  submitButton: {
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

