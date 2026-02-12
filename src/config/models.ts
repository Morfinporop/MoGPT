import type { AIModel } from '../types';

// Светлая иконка для MoSeek
export const MODEL_ICON = 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png';

export const AI_MODELS: AIModel[] = [
  {
    id: 'deepseek/deepseek-chat',
    name: 'MoSeek V3',
    description: 'Мощная модель',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-violet-500 to-purple-600',
  },
];

export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
