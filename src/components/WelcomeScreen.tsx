import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const GREETING_TEXTS = [
  "С чего сегодня начнем?",
  "Какой запрос будет первым?",
  "Что тебя интересует?",
  "Чем могу помочь?",
  "Готов к работе. Что делаем?",
  "Жду твой запрос...",
  "О чём поговорим?",
  "Какую задачу решаем?",
];

export function WelcomeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % GREETING_TEXTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-24"
    >
      <AnimatePresence mode="wait">
        <motion.h1
          key={currentIndex}
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-center px-4"
        >
          <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {GREETING_TEXTS[currentIndex]}
          </span>
        </motion.h1>
      </AnimatePresence>
    </motion.div>
  );
}
