import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Code, MessageSquare, Sparkles, Zap, Globe, Brain } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';

const GREETING_TEXTS = [
  "С чего сегодня начнём?",
  "Какой запрос будет первым?",
  "Что тебя интересует?",
  "Чем могу помочь?",
  "Готов к работе. Что делаем?",
  "О чём поговорим?",
  "Какую задачу решаем?",
  "Давай создадим что-то крутое",
  "Новый день — новые идеи",
  "Я весь во внимании",
  "Начнём творить?",
  "Какие планы на сегодня?",
  "Готов помочь с чем угодно",
  "Задавай любой вопрос",
  "Погнали кодить?",
  "Расскажи, что на уме",
  "Что будем строить?",
  "Идеи ждут реализации",
  "Мозговой штурм начинается",
  "Время продуктивной работы",
];

const QUICK_ACTIONS = [
  { icon: Code, label: 'Написать код', prompt: 'Напиши код на', color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/20 hover:border-blue-500/40', iconColor: 'text-blue-400' },
  { icon: MessageSquare, label: 'Объяснить тему', prompt: 'Объясни простыми словами', color: 'from-violet-500/20 to-purple-500/20', border: 'border-violet-500/20 hover:border-violet-500/40', iconColor: 'text-violet-400' },
  { icon: Sparkles, label: 'Сгенерировать идею', prompt: 'Придумай идею для', color: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/20 hover:border-amber-500/40', iconColor: 'text-amber-400' },
  { icon: Globe, label: 'Найти информацию', prompt: 'Найди информацию о', color: 'from-emerald-500/20 to-green-500/20', border: 'border-emerald-500/20 hover:border-emerald-500/40', iconColor: 'text-emerald-400' },
  { icon: Zap, label: 'Решить задачу', prompt: 'Помоги решить задачу:', color: 'from-rose-500/20 to-pink-500/20', border: 'border-rose-500/20 hover:border-rose-500/40', iconColor: 'text-rose-400' },
  { icon: Brain, label: 'Мозговой штурм', prompt: 'Давай проведём мозговой штурм на тему', color: 'from-indigo-500/20 to-blue-500/20', border: 'border-indigo-500/20 hover:border-indigo-500/40', iconColor: 'text-indigo-400' },
];

export function WelcomeScreen() {
  const [text, setText] = useState('');
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
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

  const getTimeGreeting = () => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return 'Доброе утро';
    if (h >= 12 && h < 17) return 'Добрый день';
    if (h >= 17 && h < 22) return 'Добрый вечер';
    return 'Доброй ночи';
  };

  const handleQuickAction = (prompt: string) => {
    const input = document.querySelector('textarea') as HTMLTextAreaElement;
    if (input) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
      nativeInputValueSetter?.call(input, prompt + ' ');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.focus();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center px-4 sm:px-6"
      style={{ minHeight: 'calc(100vh - 280px)' }}
    >
      {/* Логотип */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mb-6"
      >
        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-violet-500/30`}>
          <span className="text-white text-2xl sm:text-3xl font-bold">M</span>
        </div>
      </motion.div>

      {/* Приветствие */}
      {user && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`text-base sm:text-lg mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}
        >
          {getTimeGreeting()}, <span className={`font-semibold ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>{user.name}</span>
        </motion.p>
      )}

      {/* Основной текст */}
      <motion.h1
        initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, delay: 0.1, ease: 'easeInOut' }}
        className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-10 sm:mb-12 max-w-2xl leading-tight ${
          isDark ? 'text-white' : 'text-zinc-900'
        }`}
      >
        {text}
      </motion.h1>

      {/* Быстрые действия */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="w-full max-w-2xl"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {QUICK_ACTIONS.map((action, i) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.07 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleQuickAction(action.prompt)}
              className={`group flex flex-col items-center gap-2.5 p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
                isDark
                  ? `bg-gradient-to-br ${action.color} ${action.border} hover:bg-white/5`
                  : `bg-white/80 ${action.border} hover:bg-white shadow-sm hover:shadow-md`
              }`}
            >
              <action.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${action.iconColor} transition-transform group-hover:scale-110`} />
              <span className={`text-xs sm:text-sm font-medium text-center leading-tight ${
                isDark ? 'text-zinc-300 group-hover:text-white' : 'text-zinc-600 group-hover:text-zinc-900'
              } transition-colors`}>
                {action.label}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Подсказка */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className={`mt-8 sm:mt-10 text-xs sm:text-[13px] text-center max-w-md ${
          isDark ? 'text-zinc-600' : 'text-zinc-400'
        }`}
      >
        Напиши запрос или выбери действие выше. MoGPT поддерживает код, поиск, мозговой штурм и 50+ языков.
      </motion.p>
    </motion.div>
  );
}
