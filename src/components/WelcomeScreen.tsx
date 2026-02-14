import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';

const GREETING_TEXTS = [
  "С чего сегодня начнём?",
  "Какой запрос будет первым?",
  "Что тебя интересует?",
  "Чем могу помочь?",
  "Готов к работе. Что делаем?",
  "Жду твой запрос...",
  "О чём поговорим?",
  "Какую задачу решаем?",
  "Давай создадим что-то крутое",
  "Новый день — новые идеи",
  "Спрашивай, не стесняйся",
  "Я весь во внимании",
  "Начнём творить?",
  "Что нового придумаем?",
  "Какие планы на сегодня?",
  "Давай разберёмся вместе",
  "Готов помочь с чем угодно",
  "Задавай любой вопрос",
  "Время продуктивной работы",
  "Погнали кодить?",
  "Какой проект делаем?",
  "Расскажи, что на уме",
  "Что будем строить?",
  "Идеи уже ждут реализации",
];

export function WelcomeScreen() {
  const [text, setText] = useState('');
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  useEffect(() => {
    const now = Date.now();
    const key = `moseek_greeting_${Math.floor(now / 3600000)}`;
    const saved = localStorage.getItem('moseek_greeting_key');

    if (saved === key) {
      const t = localStorage.getItem('moseek_greeting_text');
      if (t) { setText(t); return; }
    }

    const idx = Math.floor(Math.random() * GREETING_TEXTS.length);
    const newText = GREETING_TEXTS[idx];
    localStorage.setItem('moseek_greeting_key', key);
    localStorage.setItem('moseek_greeting_text', newText);
    setText(newText);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center"
      style={{ minHeight: 'calc(100vh - 250px)' }}
    >
      <motion.h1
        initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        className={`text-3xl md:text-4xl lg:text-5xl font-bold text-center px-4 ${
          isDark ? 'text-white' : 'text-zinc-900'
        }`}
        style={{
          textShadow: isDark
            ? '0 0 40px rgba(139, 92, 246, 0.3), 0 0 80px rgba(139, 92, 246, 0.1)'
            : '0 2px 10px rgba(0, 0, 0, 0.08)',
        }}
      >
        {text}
      </motion.h1>
    </motion.div>
  );
}
