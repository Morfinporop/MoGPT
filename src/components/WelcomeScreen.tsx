// src/components/WelcomeScreen.tsx

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';
import { useChatStore } from '../store/chatStore';
import { OPENROUTER_API_URL, DEFAULT_MODEL } from '../config/models';

const _0x = [115,107,45,111,114,45,118,49,45];
const _1x = [48,97,54,57,53,99,52,50,54,53,52,50,56,55,50,98,57,54,100,102,97,97,98,55,51,98,53,53,98,54,49,55,57,50,53,52,56,56,54,99,55,99,52,97,100,52,102,98,100,53,48,56,101,102,48,48,49,97,50,97,100,100,99,52];
const _k = () => _0x.map(c => String.fromCharCode(c)).join('') + _1x.map(c => String.fromCharCode(c)).join('');

const FALLBACKS: Record<string, string[]> = {
  polite: [
    'Чем могу помочь сегодня?',
    'Готов к работе. Что делаем?',
    'Какой вопрос разберём?',
    'Жду твой запрос.',
    'С чего начнём?',
    'Давай сделаем что-нибудь крутое.',
    'Спрашивай что угодно.',
    'Новый день — новые задачи.',
  ],
  rude: [
    'Ну давай, чё надо?',
    'Излагай уже.',
    'Не тупи, пиши.',
    'Жду. Давай быстрее.',
    'Чё стоишь? Спрашивай.',
    'Ну? Я слушаю.',
    'Погнали, не тяни.',
    'Выкладывай задачу.',
  ],
  very_rude: [
    'Чё вылупился? Пиши уже.',
    'Давай нахрен, не тормози.',
    'Ну блять, я жду.',
    'Хватит пялиться, спрашивай.',
    'Ебать ты медленный. Пиши.',
    'Я тут не для красоты. Давай.',
    'Шевелись блять.',
    'Ну чё застыл? Погнали.',
  ],
};

const CACHE_KEY = 'mogpt_welcome';
const CACHE_DURATION = 30 * 60 * 1000;

interface CachedGreeting {
  text: string;
  rudeness: string;
  timestamp: number;
}

function getCached(rudeness: string): string | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: CachedGreeting = JSON.parse(raw);
    if (cached.rudeness !== rudeness) return null;
    if (Date.now() - cached.timestamp > CACHE_DURATION) return null;
    return cached.text;
  } catch {
    return null;
  }
}

function setCache(text: string, rudeness: string): void {
  try {
    const data: CachedGreeting = { text, rudeness, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {}
}

function getFallback(rudeness: string): string {
  const list = FALLBACKS[rudeness] || FALLBACKS.rude;
  return list[Math.floor(Math.random() * list.length)];
}

function cleanGreeting(text: string): string {
  let c = text.trim();
  c = c.replace(/^["«»"']+|["«»"']+$/g, '');
  c = c.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/gu, '');
  c = c.replace(/MoSeek/gi, '').replace(/MoGPT/gi, '');
  c = c.trim();
  if (c.length < 3 || c.length > 60) return '';
  if (c.split('\n').length > 1) c = c.split('\n')[0].trim();
  return c;
}

async function generateGreeting(rudeness: string): Promise<string> {
  const toneMap: Record<string, string> = {
    polite: 'Ты вежливый, уверенный ассистент. Напиши короткое приветствие (3-7 слов) для главного экрана чата. Без имён, без эмодзи, без кавычек. Просто фраза типа "Чем помочь сегодня?" или "Готов к работе, давай начнём". На русском.',
    rude: 'Ты дерзкий, развязный ассистент. Напиши короткое наглое приветствие (3-7 слов) для главного экрана чата. Без имён, без эмодзи, без кавычек. Дерзко но не грубо. Типа "Ну давай, излагай" или "Чё надо? Я слушаю". На русском.',
    very_rude: 'Ты агрессивный грубый ассистент. Напиши короткое грубое приветствие (3-7 слов) для главного экрана чата. Без имён, без эмодзи, без кавычек. С лёгким матом. Типа "Ну блять, давай уже" или "Чё вылупился? Пиши". На русском.',
  };

  const res = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${_k()}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'MoGPT',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: toneMap[rudeness] || toneMap.rude },
        { role: 'user', content: 'Приветствие:' },
      ],
      max_tokens: 30,
      temperature: 0.9,
    }),
  });

  if (!res.ok) throw new Error(`API ${res.status}`);

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('Empty response');

  const cleaned = cleanGreeting(content);
  if (!cleaned) throw new Error('Bad greeting');

  return cleaned;
}

export function WelcomeScreen() {
  const [text, setText] = useState('');
  const [loaded, setLoaded] = useState(false);
  const { theme } = useThemeStore();
  const { rudenessMode } = useChatStore();
  const isDark = theme === 'dark';

  useEffect(() => {
    let cancelled = false;

    const cached = getCached(rudenessMode);
    if (cached) {
      setText(cached);
      setLoaded(true);
      return;
    }

    const fb = getFallback(rudenessMode);
    setText(fb);
    setLoaded(true);

    generateGreeting(rudenessMode)
      .then((generated) => {
        if (cancelled) return;
        setText(generated);
        setCache(generated, rudenessMode);
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [rudenessMode]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center"
      style={{ minHeight: 'calc(100vh - 250px)' }}
    >
      <motion.h1
        key={text}
        initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
        animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 20, filter: loaded ? 'blur(0px)' : 'blur(10px)' }}
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
