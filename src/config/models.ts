import type { AIModel } from '../types';

export const MODEL_ICON = 'https://img.icons8.com/?size=100&id=77iHQnb2ZTjZ&format=png&color=1A1A1A';

export const AI_MODELS: AIModel[] = [
  {
    id: 'deepseek/deepseek-chat',
    name: 'MoSeek V3',
    description: 'Мощная модель',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-violet-500 to-purple-600',
  },
  {
    id: 'deepseek/deepseek-r1',
    name: 'MoSeek R1',
    description: 'Продвинутая модель с рассуждениями',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-cyan-500 to-blue-600',
  },
];

export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
