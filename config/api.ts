

// API Configuration - same as main.py
export const API_CONFIG = {
  API_URL: 'https://openrouter.ai/api/v1/chat/completions',
  MODEL: 'anthropic/claude-sonnet-4',
  API_KEY: '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',
  MAX_TOKENS: 300,
  SYSTEM_PROMPT: `You are a professional quiz master AI.
Rules:
- Respond ONLY in valid JSON
- Never repeat a question
- Match difficulty strictly`,
};

export const HEADERS = {
  Authorization: `Bearer ${API_CONFIG.API_KEY}`,
  'Content-Type': 'application/json',
};

