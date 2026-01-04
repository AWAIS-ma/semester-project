// Quiz Attempt Screen - Minimalistic design
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import {
  generateQuizQuestion,
  submitAnswer,
  QuizType,
  Difficulty,
  QuizQuestion,
} from '@/utils/quiz';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function QuizAttemptScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, updateUser } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Get quiz parameters from navigation
  const topic = (params.topic as string) || '';
  const quizType = (params.quizType as QuizType) || 'MCQ';
  const difficulty = (params.difficulty as Difficulty) || 'Easy';

  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [questionNumber, setQuestionNumber] = useState(1);

  // Load first question on mount
  useEffect(() => {
    if (user && topic) {
      loadQuestion();
    } else {
      Alert.alert('Error', 'Missing quiz parameters', [
        { text: 'Go Back', onPress: () => router.back() },
      ]);
    }
  }, []);

  async function loadQuestion() {
    if (!user || !topic) return;

    setLoading(true);
    try {
      const question = await generateQuizQuestion(topic, quizType, difficulty, askedQuestions);
      console.log('Question loaded - Type:', question.type, 'Full question:', JSON.stringify(question, null, 2));
      setCurrentQuestion(question);
      setSelectedAnswer('');
    } catch (error: any) {
      console.error('Question generation error:', error);
      Alert.alert('Error', error.message || 'Failed to generate question. Please try again.', [
        { text: 'Go Back', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitAnswer() {
    if (!user || !currentQuestion || !selectedAnswer) {
      Alert.alert('Error', 'Please enter your answer');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitAnswer(user.id, selectedAnswer, currentQuestion.answer);

      Alert.alert(
        result.correct ? 'Correct' : 'Wrong Answer',
        result.correct
          ? `You earned ${result.xp_earned} XP\nLevel: ${result.level}`
          : `Correct answer: ${currentQuestion.answer}\nLevel: ${result.level}`,
        [
          {
            text: 'Next Question',
            onPress: () => {
              updateUser({ ...user, xp: result.new_xp });
              setAskedQuestions([...askedQuestions, currentQuestion.question]);
              setQuestionNumber(questionNumber + 1);
              loadQuestion();
            },
          },
          {
            text: 'Finish Quiz',
            style: 'cancel',
            onPress: () => {
              updateUser({ ...user, xp: result.new_xp });
              router.back();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading && !currentQuestion) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ThemedView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <ThemedText style={styles.loadingText}>Loading</ThemedText>
          </View>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ThemedView style={styles.container}>
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>No question available</ThemedText>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: colors.primary }]}
              onPress={() => router.back()}>
              <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButtonHeader}
            onPress={() => router.back()}>
            <ThemedText style={[styles.backText, { color: colors.primary }]}>Back</ThemedText>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <ThemedText style={[styles.topicBadge, { backgroundColor: colors.card, borderColor: colors.primary, color: colors.primary }]}>
              {topic}
            </ThemedText>
            <ThemedText style={styles.questionNumber}>Question {questionNumber}</ThemedText>
          </View>
        </View>

        {/* Question Card */}
        <View style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={styles.questionText}>{currentQuestion.question}</ThemedText>
        </View>

        {/* Options for MCQ and True/False */}
        {(currentQuestion.type === 'MCQ' || currentQuestion.type === 'True/False') &&
          currentQuestion.options && (
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor:
                        selectedAnswer === option ? colors.primary : colors.card,
                      borderColor: selectedAnswer === option ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedAnswer(option)}>
                  <ThemedText
                    style={[
                      styles.optionText,
                      {
                        color: selectedAnswer === option ? '#FFFFFF' : colors.text,
                      },
                    ]}>
                    {option}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          )}

        {/* Text Input for Programming and Riddle */}
        {currentQuestion && 
         (currentQuestion.type === 'Programming' || 
          currentQuestion.type === 'Riddle' || 
          (quizType === 'Programming' || quizType === 'Riddle')) && (
          <View style={styles.textInputContainer}>
            <ThemedText style={styles.inputLabel}>Your Answer</ThemedText>
            <TextInput
              style={[
                styles.answerInput,
                {
                  backgroundColor: colors.card,
                  borderColor: selectedAnswer ? colors.primary : colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Type your answer here..."
              placeholderTextColor={colors.icon}
              value={selectedAnswer}
              onChangeText={setSelectedAnswer}
              multiline={true}
              textAlignVertical="top"
            />
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: selectedAnswer ? colors.success : colors.border,
            },
          ]}
          onPress={handleSubmitAnswer}
          disabled={submitting || !selectedAnswer}>
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.submitButtonText}>
              {selectedAnswer ? 'Submit Answer' : 'Enter Answer'}
            </ThemedText>
          )}
        </TouchableOpacity>

        {/* Quiz Info */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={styles.infoText}>
            Type: <ThemedText style={styles.infoBold}>{quizType}</ThemedText>
          </ThemedText>
          <ThemedText style={styles.infoText}>
            Difficulty: <ThemedText style={styles.infoBold}>{difficulty}</ThemedText>
          </ThemedText>
          {user && (
            <ThemedText style={styles.infoText}>
              XP: <ThemedText style={styles.infoBold}>{user.xp}</ThemedText> | Level:{' '}
              <ThemedText style={styles.infoBold}>
                {Math.min(Math.floor(user.xp / 100), 10)}
              </ThemedText>
            </ThemedText>
          )}
        </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    opacity: 0.6,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 20,
    opacity: 0.7,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  backButtonHeader: {
    marginBottom: 12,
  },
  backText: {
    fontSize: 15,
    fontWeight: '500',
  },
  headerInfo: {
    alignItems: 'center',
  },
  topicBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
    borderWidth: 1,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.6,
  },
  questionCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    minHeight: 100,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 10,
    marginBottom: 20,
  },
  optionButton: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  textInputContainer: {
    marginBottom: 20,
    width: '100%',
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
    opacity: 0.7,
  },
  answerInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 120,
    maxHeight: 200,
    textAlignVertical: 'top',
    width: '100%',
  },
  submitButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    opacity: 0.7,
  },
  infoBold: {
    fontWeight: '600',
    opacity: 1,
  },
  backButton: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

