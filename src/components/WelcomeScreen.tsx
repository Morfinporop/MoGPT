import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';

const GREETINGS = [
  "С чего начнём?", "Какой запрос первым?", "Что интересует?",
  "Чем помочь?", "Готов. Что делаем?", "О чём поговорим?",
  "Какую задачу решаем?", "Давай создадим что-то", "Новый день — новые идеи",
  "Спрашивай", "Начнём?", "Что придумаем?",
  "Какие планы?", "Разберёмся вместе", "Готов помочь",
  "Задавай вопрос", "Погнали кодить?", "Расскажи, что на уме",
];

export function WelcomeScreen() {
  const [text, setText] = useState('');
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  useEffect(() => {
    const key = `moseek_g_${Math.floor(Date.now() / 3600000)}`;
    const saved = localStorage.getItem('moseek_g_key');
    if (saved === key) { const t = localStorage.getItem('moseek_g_txt'); if (t) { setText(t); return; } }
    const t = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
    localStorage.setItem('moseek_g_key', key);
    localStorage.setItem('moseek_g_txt', t);
    setText(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center px-6"
      style={{ minHeight: 'calc(100vh - 240px)' }}
    >
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`text-2xl sm:text-3xl md:text-4xl font-semibold text-center leading-snug ${isDark ? 'text-white' : 'text-black'}`}
      >
        {text}
      </motion.h1>
    </motion.div>
  );
}
