

// API Configuration - same as main.py
export const API_CONFIG = {
  API_URL: 'https://openrouter.ai/api/v1/chat/completions',
  MODEL: 'meta-llama/llama-4-maverick',
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

