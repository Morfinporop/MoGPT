import type { AIModel } from '../types';

export const MODEL_ICON = 'https://img.icons8.com/?size=100&id=77iHQnb2ZTjZ&format=png&color=1A1A1A';

export const AI_MODELS: AIModel[] = [
  {
    id: 'deepseek/deepseek-chat',
    name: 'MoSeek V1',
    description: 'Мощная модель для всех задач',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-violet-500 to-purple-600',
  },
  {
    id: 'google/gemini-2.0-flash-001',
    name: 'MoSeek Flash',
    description: 'Быстрая и точная',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'meta-llama/llama-4-maverick',
    name: 'MoSeek Maverick',
    description: 'Креативная и мощная',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-orange-500 to-red-600',
  },
  {
    id: 'google/gemma-3-27b-it',
    name: 'MoSeek Gemma',
    description: 'Компактная и умная',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-amber-500 to-yellow-600',
  },
];

export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
