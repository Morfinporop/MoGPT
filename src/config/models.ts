import type { AIModel } from '../types';

export const MODEL_ICON = 'https://img.icons8.com/?size=100&id=77iHQnb2ZTjZ&format=png&color=1A1A1A';

export const AI_MODELS: AIModel[] = [
  {
    id: 'deepseek/deepseek-chat',
    name: 'MoSeek V1',
    description: 'Основная модель для всех задач',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-violet-500 to-purple-600',
  },
  {
    id: 'deepseek/deepseek-r1',
    name: 'MoSeek R1',
    description: 'Думающая модель с рассуждением',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'google/gemini-2.5-flash-preview',
    name: 'MoSeek Flash 2.5',
    description: 'Новейшая быстрая модель Google',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'google/gemini-2.5-pro-preview',
    name: 'MoSeek Pro 2.5',
    description: 'Самая мощная модель Google',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'meta-llama/llama-4-maverick',
    name: 'MoSeek Maverick',
    description: 'Креативная модель Meta',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-orange-500 to-red-600',
  },
  {
    id: 'qwen/qwen3-235b-a22b',
    name: 'MoSeek Qwen 235B',
    description: 'Гигантская модель Qwen3 для кода',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-sky-500 to-blue-600',
  },
  {
    id: 'qwen/qwen3-30b-a3b',
    name: 'MoSeek Qwen 30B',
    description: 'Быстрая модель Qwen3',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-sky-400 to-cyan-500',
  },
  {
    id: 'microsoft/mai-ds-r1',
    name: 'MoSeek MAI-R1',
    description: 'Microsoft рассуждающая модель',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-blue-400 to-indigo-500',
  },
  {
    id: 'google/gemma-3-27b-it',
    name: 'MoSeek Gemma',
    description: 'Компактная и умная Google',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-amber-500 to-yellow-600',
  },
  {
    id: 'mistralai/devstral-small',
    name: 'MoSeek Devstral',
    description: 'Модель Mistral для кода',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-rose-500 to-pink-600',
  },
  {
    id: 'openai/gpt-4.1-mini',
    name: 'Test 1 — GPT-4.1 Mini',
    description: 'Тест: платная модель OpenAI',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 'openai/o3-mini',
    name: 'Test 2 — O3 Mini',
    description: 'Тест: рассуждающая модель OpenAI',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-lime-500 to-green-600',
  },
];

export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
