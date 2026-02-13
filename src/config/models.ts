import type { AIModel } from '../types';

export const MODEL_ICON = 'https://img.icons8.com/?size=100&id=77iHQnb2ZTjZ&format=png&color=1A1A1A';

export const AI_MODELS: AIModel[] = [
  {
    id: 'mistralai/mistral-nemo',
    name: 'MoSeek Nemo',
    description: 'Mistral Nemo 12B',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-rose-400 to-pink-500',
  },
];

export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
