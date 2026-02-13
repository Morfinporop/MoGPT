import type { AIModel } from '../types';

export const MODEL_ICON = 'https://img.icons8.com/?size=100&id=77iHQnb2ZTjZ&format=png&color=1A1A1A';

export const AI_MODELS: AIModel[] = [
  {
    id: 'google/gemma-3-27b-it',
    name: 'MoSeek Gemma',
    description: 'Компактная и умная',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-amber-500 to-yellow-600',
  },
  {
    id: 'qwen/qwen3-30b-a3b',
    name: 'MoSeek Qwen',
    description: 'Быстрая модель Qwen3',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-sky-400 to-cyan-500',
  },
  {
    id: 'mistralai/devstral-small',
    name: 'MoSeek Devstral',
    description: 'Модель специально для кода',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-rose-500 to-pink-600',
  },
];

export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
