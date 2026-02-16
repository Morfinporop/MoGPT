// src/store/moodStore.ts

import { create } from 'zustand';

export type Mood = 'neutral' | 'calm' | 'positive' | 'excited' | 'focused' | 'frustrated' | 'angry' | 'sad' | 'creative';

interface MoodConfig {
  colors: [string, string, string]; // primary, secondary, accent
  pulseSpeed: number;       // скорость пульсации
  intensity: number;        // яркость 0-1
  size: number;             // множитель размера
  breatheSpeed: number;     // скорость "дыхания"
}

export const MOOD_CONFIGS: Record<Mood, MoodConfig> = {
  neutral: {
    colors: ['139, 92, 246', '99, 102, 241', '168, 85, 247'],
    pulseSpeed: 0.15,
    intensity: 0.05,
    size: 1,
    breatheSpeed: 0.08,
  },
  calm: {
    colors: ['59, 130, 246', '99, 102, 241', '96, 165, 250'],
    pulseSpeed: 0.08,
    intensity: 0.04,
    size: 1.1,
    breatheSpeed: 0.05,
  },
  positive: {
    colors: ['34, 197, 94', '74, 222, 128', '22, 163, 74'],
    pulseSpeed: 0.18,
    intensity: 0.06,
    size: 1.05,
    breatheSpeed: 0.1,
  },
  excited: {
    colors: ['249, 115, 22', '251, 146, 60', '234, 88, 12'],
    pulseSpeed: 0.3,
    intensity: 0.08,
    size: 1.2,
    breatheSpeed: 0.15,
  },
  focused: {
    colors: ['99, 102, 241', '79, 70, 229', '129, 140, 248'],
    pulseSpeed: 0.1,
    intensity: 0.045,
    size: 0.9,
    breatheSpeed: 0.06,
  },
  frustrated: {
    colors: ['239, 68, 68', '248, 113, 113', '185, 28, 28'],
    pulseSpeed: 0.25,
    intensity: 0.07,
    size: 1.1,
    breatheSpeed: 0.2,
  },
  angry: {
    colors: ['220, 38, 38', '239, 68, 68', '153, 27, 27'],
    pulseSpeed: 0.35,
    intensity: 0.09,
    size: 1.3,
    breatheSpeed: 0.25,
  },
  sad: {
    colors: ['100, 116, 139', '71, 85, 105', '148, 163, 184'],
    pulseSpeed: 0.06,
    intensity: 0.035,
    size: 0.85,
    breatheSpeed: 0.04,
  },
  creative: {
    colors: ['168, 85, 247', '236, 72, 153', '192, 132, 252'],
    pulseSpeed: 0.2,
    intensity: 0.07,
    size: 1.15,
    breatheSpeed: 0.12,
  },
};

interface MoodState {
  mood: Mood;
  previousMood: Mood;
  transitionProgress: number; // 0-1 плавный переход
  isTransitioning: boolean;
  setMood: (mood: Mood) => void;
  updateTransition: (delta: number) => void;
}

export const useMoodStore = create<MoodState>((set, get) => ({
  mood: 'neutral',
  previousMood: 'neutral',
  transitionProgress: 1,
  isTransitioning: false,

  setMood: (newMood: Mood) => {
    const current = get();
    if (current.mood === newMood) return;

    set({
      previousMood: current.mood,
      mood: newMood,
      transitionProgress: 0,
      isTransitioning: true,
    });
  },

  updateTransition: (delta: number) => {
    const current = get();
    if (!current.isTransitioning) return;

    const speed = 0.4; // секунды на переход ~2.5с
    const newProgress = Math.min(current.transitionProgress + delta * speed, 1);

    set({
      transitionProgress: newProgress,
      isTransitioning: newProgress < 1,
    });
  },
}));
