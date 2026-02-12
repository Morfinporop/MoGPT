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
  "Придумаем что-то интересное?",
  "Мозговой штурм начинается",
  "Сегодня будет продуктивно",
  "Открыт для любых задач",
  "Погнали кодить?",
  "Какой проект делаем?",
  "Расскажи, что на уме",
  "Помогу разобраться в чём угодно",
  "Вперёд к новым решениям",
  "Сегодня без ограничений",
  "Что будем строить?",
  "Идеи уже ждут реализации",
];

export function WelcomeScreen() {
  const [text, setText] = useState('');

  useEffect(() => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
    );
    const index = dayOfYear % GREETING_TEXTS.length;
    setText(GREETING_TEXTS[index]);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center"
      style={{ minHeight: 'calc(100vh - 180px)', paddingTop: '10vh' }}
    >
      <motion.h1
        initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        className="text-3xl md:text-4xl lg:text-5xl font-bold text-center px-4 text-white"
      >
        {text}
      </motion.h1>
    </motion.div>
  );
}
