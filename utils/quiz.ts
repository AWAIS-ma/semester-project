// Quiz utilities - same logic as main.py
import { executeQuery, executeCommand } from '@/database/db';
import { API_CONFIG, HEADERS } from '@/config/api';

// Quiz types (same as main.py)
export type QuizType = 'MCQ' | 'True/False' | 'Programming' | 'Riddle';
export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Very Hard';

// Quiz question interface
export interface QuizQuestion {
  question: string;
  type: QuizType;
  options?: string[]; // For MCQ and True/False
  answer: string;
}

// Calculate level from XP (same as main.py)
export function calculateLevel(xp: number): number {
  return Math.min(Math.floor(xp / 100), 10);
}

// Extract JSON from AI response (same as main.py extract_json function)
function extractJson(text: string): any {
  // Match JSON object in the text (same regex as main.py: r"\{(?:.|\n)*\}")
  const jsonMatch = text.match(/\{(?:.|\n)*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid JSON from AI');
  }
  try {
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    throw new Error('Invalid JSON from AI');
  }
}

// Call LLM API (same as main.py call_llm function)
async function callLLM(prompt: string): Promise<any> {
  const payload = {
    model: API_CONFIG.MODEL,
    messages: [
      { role: 'system', content: API_CONFIG.SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    max_tokens: API_CONFIG.MAX_TOKENS,
  };

  try {
    console.log('Calling OpenRouter API...');
    console.log('API URL:', API_CONFIG.API_URL);
    console.log('Model:', API_CONFIG.MODEL);
    console.log('API Key (first 20 chars):', API_CONFIG.API_KEY.substring(0, 20) + '...');
    console.log('Headers:', { ...HEADERS, Authorization: `Bearer ${HEADERS.Authorization.substring(7, 27)}...` });
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    const response = await fetch(API_CONFIG.API_URL, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(payload),
    });

    // Check response status (same as main.py: r.raise_for_status())
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: { message: errorText } };
      }
      
      // Handle specific error codes
      if (response.status === 401) {
        throw new Error('API authentication failed. Please check your API key.');
      } else if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please try again later.');
      } else {
        throw new Error(
          errorData?.error?.message || 
          `API request failed: ${response.status} ${response.statusText}`
        );
      }
    }

    const data = await response.json();
    console.log('API Response received:', JSON.stringify(data, null, 2));
    
    // Same as main.py: content = r.json()["choices"][0]["message"]["content"]
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid API response format');
    }
    
    const content = data.choices[0].message.content;
    console.log('API Content:', content);
    
    if (!content) {
      throw new Error('Empty response from API');
    }
    
    // Same as main.py: return extract_json(content)
    return extractJson(content);
  } catch (error: any) {
    console.error('LLM API Error:', error);
    if (error.message?.includes('fetch') || error.message?.includes('Network')) {
      throw new Error('Network error: Please check your internet connection');
    }
    throw new Error(error.message || 'Failed to generate question. Please try again.');
  }
}

// Generate quiz question using OpenRouter API (same logic as main.py generate_quiz)
export async function generateQuizQuestion(
  topic: string,
  quizType: QuizType,
  difficulty: Difficulty,
  askedQuestions: string[] = []
): Promise<QuizQuestion> {
  let prompt: string;

  // Build prompt exactly as in main.py (lines 256-282)
  if (quizType === 'Programming') {
    prompt = `
Generate exactly one short programming quiz question.
Return JSON only.
Keys: question, type, answer
Programming Language: ${topic}
Difficulty: ${difficulty}
Do not repeat: ${askedQuestions.join(', ')}
`;
  } else if (quizType === 'Riddle') {
    prompt = `
Generate exactly one fun riddle.
Return JSON only.
Keys: question, type, answer
Difficulty: ${difficulty}
Do not repeat: ${askedQuestions.join(', ')}
`;
  } else {
    // MCQ or True/False
    prompt = `
Generate exactly one quiz question.
Return JSON only.
Keys: question, options, answer, type
Topic: ${topic}
Difficulty: ${difficulty}
Type: ${quizType}
Do not repeat: ${askedQuestions.join(', ')}
`;
  }

  try {
    console.log('Generating question for:', { topic, quizType, difficulty, askedQuestions });
    console.log('Prompt:', prompt);
    
    // Same as main.py: return call_llm(prompt)
    const result = await callLLM(prompt);
    console.log('Question generated:', JSON.stringify(result, null, 2));
    
    // Validate the result
    if (!result || typeof result !== 'object') {
      throw new Error('Invalid response from AI');
    }
    
    // Ensure the result has the correct structure
    const question: QuizQuestion = {
      question: result.question || '',
      type: (result.type || quizType) as QuizType,
      answer: result.answer || '',
    };

    // Validate required fields
    if (!question.question || question.question.trim() === '') {
      throw new Error('Question is empty or missing');
    }
    
    if (!question.answer || question.answer.trim() === '') {
      throw new Error('Answer is empty or missing');
    }

    // Add options if they exist (for MCQ and True/False)
    if (result.options && Array.isArray(result.options) && result.options.length > 0) {
      question.options = result.options;
    } else if (quizType === 'MCQ' || quizType === 'True/False') {
      // If options are missing but required, create default options
      if (quizType === 'True/False') {
        question.options = ['True', 'False'];
      } else {
        question.options = ['Option A', 'Option B', 'Option C', 'Option D'];
      }
    }

    return question;
  } catch (error: any) {
    console.error('Question generation error:', error);
    // Same as main.py: raise HTTPException(status_code=500, detail=str(e))
    throw new Error(error.message || 'Failed to generate question. Please try again.');
  }
}

// Submit answer and update XP (same logic as main.py)
export async function submitAnswer(
  userId: number,
  userAnswer: string,
  correctAnswer: string
): Promise<{ correct: boolean; xp_earned: number; level: number; new_xp: number }> {
  const correct =
    userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
  const xp_earned = correct ? 10 : 0;

  // Get current user
  const users = await executeQuery<{ xp: number }>(
    'SELECT xp FROM users WHERE id = ?',
    [userId]
  );

  if (users.length === 0) {
    throw new Error('User not found');
  }

  const currentXp = users[0].xp;
  const new_xp = currentXp + xp_earned;

  // Update XP
  await executeCommand('UPDATE users SET xp = ? WHERE id = ?', [new_xp, userId]);

  const level = calculateLevel(new_xp);

  return {
    correct,
    xp_earned,
    level,
    new_xp,
  };
}

// Get leaderboard (same as main.py)
export async function getLeaderboard(): Promise<
  Array<{ rank: number; username: string; xp: number; level: number }>
> {
  const users = await executeQuery<{ username: string; xp: number }>(
    'SELECT username, xp FROM users ORDER BY xp DESC LIMIT 100'
  );

  return users.map((user, index) => ({
    rank: index + 1,
    username: user.username,
    xp: user.xp,
    level: calculateLevel(user.xp),
  }));
}

