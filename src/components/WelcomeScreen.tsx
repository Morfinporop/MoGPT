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
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full min-h-[60vh]"
    >
      <AnimatePresence mode="wait">
        <motion.h1
          key={currentIndex}
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-center px-4 text-white"
        >
          {GREETING_TEXTS[currentIndex]}
        </motion.h1>
      </AnimatePresence>
    </motion.div>
  );
}
