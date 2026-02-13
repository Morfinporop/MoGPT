import type { AIModel } from '../types';

export const MODEL_ICON = 'https://img.icons8.com/?size=100&id=77iHQnb2ZTjZ&format=png&color=1A1A1A';

export type ModelCapability = 'text' | 'image' | 'video';

export interface ExtendedAIModel extends AIModel {
  capabilities: ModelCapability[];
}

export const AI_MODELS: ExtendedAIModel[] = [
  // Изображения + текст
  {
    id: 'nvidia/nemotron-nano-12b-v2-vl:free',
    name: 'MoSeek Vision Pro',
    description: 'Nemotron 12B — фото + видео',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-green-400 to-emerald-500',
    capabilities: ['text', 'image', 'video'],
  },
  {
    id: 'mistralai/mistral-small-3.1-24b-instruct:free',
    name: 'MoSeek Vision 24B',
    description: 'Mistral Small 24B — фото',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-orange-400 to-red-500',
    capabilities: ['text', 'image'],
  },
  {
    id: 'google/gemma-3-27b-it:free',
    name: 'MoSeek Gemma 27B',
    description: 'Gemma 3 27B — фото',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-blue-400 to-indigo-500',
    capabilities: ['text', 'image'],
  },
  {
    id: 'google/gemma-3-12b-it:free',
    name: 'MoSeek Gemma 12B',
    description: 'Gemma 3 12B — фото',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-cyan-400 to-blue-500',
    capabilities: ['text', 'image'],
  },
  {
    id: 'google/gemma-3-4b-it:free',
    name: 'MoSeek Gemma 4B',
    description: 'Gemma 3 4B — фото, быстрая',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-teal-400 to-cyan-500',
    capabilities: ['text', 'image'],
  },

  // Текстовые резервные
  {
    id: 'z-ai/glm-4.5-air:free',
    name: 'MoSeek GLM 4.5',
    description: 'GLM 4.5 Air — текст',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-violet-400 to-purple-500',
    capabilities: ['text'],
  },
  {
    id: 'stepfun/step-3.5-flash:free',
    name: 'MoSeek GLM 3.5',
    description: 'GLM 3.5 Flash — текст',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-purple-400 to-fuchsia-500',
    capabilities: ['text'],
  },
];

export function getModelsWithCapability(capability: ModelCapability): ExtendedAIModel[] {
  return AI_MODELS.filter(m => m.capabilities.includes(capability));
}

export function modelSupportsImages(modelId: string): boolean {
  const model = AI_MODELS.find(m => m.id === modelId);
  return model?.capabilities.includes('image') ?? false;
}

export function modelSupportsVideo(modelId: string): boolean {
  const model = AI_MODELS.find(m => m.id === modelId);
  return model?.capabilities.includes('video') ?? false;
}

export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
