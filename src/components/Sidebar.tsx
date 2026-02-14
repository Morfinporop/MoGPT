import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Plus, LogOut, Loader2, Camera, Sun, Moon } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useState, useRef, useEffect } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

const TURNSTILE_SITE_KEY = '0x4AAAAAACa5EobYKh_TrmuZ';
const DISCORD_URL = 'https://discord.gg/qjnyAr7YXe';

type ModalType = 'terms' | 'privacy' | 'cookies' | 'profile' | 'auth' | null;

const MODAL_CONTENT = {
  terms: {
    title: 'Условия использования',
    content: [
      { type: 'meta', text: 'Последнее обновление: Январь 2026' },
      { type: 'section', title: '1. Принятие условий', text: 'Используя сервис MoSeek и нейросеть MoGPT, вы безоговорочно принимаете настоящие Условия использования в полном объёме. Если вы не согласны с какими-либо положениями — вы обязаны немедленно прекратить использование сервиса.' },
      { type: 'section', title: '2. Описание сервиса', text: 'MoSeek — интеллектуальная AI-платформа нового поколения. MoGPT — нейросеть, разработанная командой MoSeek. Сервис предоставляет: генерацию текста, написание и анализ программного кода, ответы на вопросы, помощь в решении задач, визуальный дизайн интерфейсов.' },
      { type: 'section', title: '3. Интеллектуальная собственность', text: 'Название "MoSeek", "MoGPT", логотипы, дизайн интерфейса, исходный код платформы являются объектами авторского права и интеллектуальной собственности команды MoSeek. Любое копирование, воспроизведение, модификация без письменного разрешения запрещено.' },
      { type: 'important', text: 'Нарушение авторских прав влечёт ответственность в соответствии с законодательством.' },
      { type: 'section', title: '4. Правила использования', text: 'Запрещено: создание вредоносного контента; попытки взлома сервиса; автоматизированные массовые запросы; использование для нарушения прав третьих лиц; распространение запрещённой информации.' },
      { type: 'section', title: '5. Ограничение ответственности', text: 'Сервис предоставляется на условиях «как есть». MoSeek не гарантирует бесперебойную работу и абсолютную точность ответов.' },
      { type: 'copyright', text: '© 2026 MoSeek. Все права защищены.' },
    ]
  },
  privacy: {
    title: 'Политика конфиденциальности',
    content: [
      { type: 'meta', text: 'Последнее обновление: Январь 2026' },
      { type: 'section', title: '1. Общие положения', text: 'Мы серьёзно относимся к защите вашей приватности и обрабатываем данные в соответствии с законодательством.' },
      { type: 'section', title: '2. Какие данные мы собираем', text: 'Имя пользователя, email, пароль (в зашифрованном виде). История чатов хранится локально в вашем браузере.' },
      { type: 'important', text: 'Мы НЕ собираем: геолокацию, IP-адреса для отслеживания, биометрические данные, финансовую информацию.' },
      { type: 'section', title: '3. Хранение данных', text: 'История сообщений хранится в облаке и синхронизируется между устройствами. Данные защищены шифрованием.' },
      { type: 'section', title: '4. Ваши права', text: 'Вы имеете право запросить удаление данных, отозвать согласие на обработку, экспортировать свои данные.' },
      { type: 'copyright', text: '© 2026 MoSeek. Все права защищены.' },
    ]
  },
  cookies: {
    title: 'Политика Cookie',
    content: [
      { type: 'meta', text: 'Последнее обновление: Январь 2026' },
      { type: 'section', title: '1. Что мы храним', text: 'Настройки интерфейса, кеш данных, токен аутентификации — в localStorage вашего браузера.' },
      { type: 'important', text: 'Мы НЕ используем рекламные и трекинговые Cookie, пиксели отслеживания, fingerprinting.' },
      { type: 'section', title: '2. Управление', text: 'Вы полностью контролируете свои данные. Очистка localStorage удалит локальный кеш.' },
      { type: 'copyright', text: '© 2026 MoSeek. Ваши данные — ваша собственность.' },
    ]
  }
};

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

export function Sidebar() {
  const {
    chats,
    currentChatId,
    sidebarOpen,
    toggleSidebar,
    setCurrentChat,
    deleteChat,
    createNewChat,
  } = useChatStore();

  const { user, isAuthenticated, logout, updateAvatar } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches
      );
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleNewChat = () => {
    const newChatId = createNewChat();
    if (newChatId) {
      setCurrentChat(newChatId);
    }
    toggleSidebar();
  };

  const handleDeleteChat = (chatId: string) => {
    const chatIndex = chats.findIndex(c => c.id === chatId);
    const remainingChats = chats.filter(c => c.id !== chatId);

    deleteChat(chatId);

    if (currentChatId === chatId && remainingChats.length > 0) {
      const newIndex = Math.min(chatIndex, remainingChats.length - 1);
      setCurrentChat(remainingChats[newIndex].id);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (result) updateAvatar(result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          <motion.aside
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'spring', damping: 35, stiffness: 500 }}
            className="fixed left-0 top-0 bottom-0 w-72 glass-strong border-r border-white/5 z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white">Меню</h2>
              <div className="flex items-center gap-1">
                <motion.a
                  href={DISCORD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <DiscordIcon className="w-5 h-5 text-[#5865F2]" />
                </motion.a>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-violet-400" />
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleSidebar}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </motion.button>
              </div>
            </div>

            <div className="p-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNewChat}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 hover:border-violet-500/50 transition-all"
              >
                <Plus className="w-5 h-5 text-violet-400" />
                <span className="text-sm text-violet-300">Новый чат</span>
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {chats.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                  <p className="text-sm text-zinc-600">Нет чатов</p>
                  <p className="text-xs text-zinc-700 mt-1">Начни новый диалог</p>
                </div>
              ) : (
                chats.map((chat) => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`group relative rounded-xl transition-all cursor-pointer ${
                      currentChatId === chat.id
                        ? 'bg-violet-500/15 border border-violet-500/30'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center">
                      <button
                        onClick={() => {
                          setCurrentChat(chat.id);
                          toggleSidebar();
                        }}
                        className="flex-1 min-w-0 text-left px-3 py-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <MessageSquare className={`w-4 h-4 flex-shrink-0 ${
                            currentChatId === chat.id ? 'text-violet-400' : 'text-zinc-600'
                          }`} />
                          <p className={`text-sm truncate max-w-[140px] ${
                            currentChatId === chat.id ? 'text-white' : 'text-zinc-400'
                          }`}>
                            {chat.title}
                          </p>
                        </div>
                      </button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(chat.id);
                        }}
                        className={`flex-shrink-0 p-2 mr-1 rounded-lg hover:bg-red-500/20 transition-all ${
                          isTouchDevice ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-white/5">
              {isAuthenticated ? (
                <div
                  onClick={() => setActiveModal('profile')}
                  className="flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer mb-4"
                >
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="w-10 h-10 rounded-full flex-shrink-0 border-2 border-violet-500/30 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{user?.name}</p>
                    <p className="text-[11px] text-zinc-500 truncate">{user?.email}</p>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="flex items-center gap-3 px-2 py-2 mb-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 border border-white/5">
                      <span className="text-zinc-500 text-sm">👤</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-400 font-medium">Гость</p>
                      <p className="text-[11px] text-zinc-600">Безлимитный доступ</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveModal('auth')}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 text-sm text-violet-300 font-medium hover:border-violet-500/50 transition-all"
                  >
                    Войти / Регистрация
                  </motion.button>
                </div>
              )}

              <div className="flex items-center gap-3 text-[10px] pl-1">
                <button onClick={() => setActiveModal('terms')} className="text-zinc-500 hover:text-violet-400 transition-colors">
                  Terms of Use
                </button>
                <span className="text-zinc-700">•</span>
                <button onClick={() => setActiveModal('privacy')} className="text-zinc-500 hover:text-violet-400 transition-colors">
                  Privacy Policy
                </button>
                <span className="text-zinc-700">•</span>
                <button onClick={() => setActiveModal('cookies')} className="text-zinc-500 hover:text-violet-400 transition-colors">
                  Cookies
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />

      <AnimatePresence>
        {activeModal === 'profile' && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveModal(null)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] glass-strong border border-white/10 rounded-2xl z-[70] overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <h2 className="text-sm font-semibold text-white">Профиль</h2>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setActiveModal(null)} className="p-1.5 rounded-md hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4 text-zinc-400" />
                </motion.button>
              </div>
              <div className="px-5 py-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative group flex-shrink-0">
                    <img src={user?.avatar} alt={user?.name} className="w-16 h-16 rounded-full border-2 border-violet-500/30 object-cover" />
                    <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  <div className="min-w-0">
                    <p className="text-base text-white font-semibold truncate">{user?.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { logout(); setActiveModal(null); }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400 font-medium">Выйти из аккаунта</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeModal === 'auth' && <AuthModal onClose={() => setActiveModal(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {activeModal && activeModal !== 'profile' && activeModal !== 'auth' && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveModal(null)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] max-w-[calc(100vw-32px)] max-h-[85vh] glass-strong border border-white/10 rounded-2xl z-[70] flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <h2 className="text-base font-bold text-white">{MODAL_CONTENT[activeModal].title}</h2>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setActiveModal(null)} className="p-1.5 rounded-md hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4 text-zinc-400" />
                </motion.button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <div className="space-y-4">
                  {MODAL_CONTENT[activeModal].content.map((block, i) => {
                    if (block.type === 'meta') return <p key={i} className="text-[11px] text-zinc-500 italic">{block.text}</p>;
                    if (block.type === 'copyright') return <p key={i} className="text-[11px] text-zinc-600 pt-3 mt-4 border-t border-white/5 font-medium">{block.text}</p>;
                    if (block.type === 'important') return (
                      <div key={i} className="px-4 py-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                        <p className="text-[12px] text-violet-300 leading-relaxed font-medium">{block.text}</p>
                      </div>
                    );
                    return (
                      <div key={i}>
                        <h3 className="text-[13px] font-semibold text-white mb-1.5">{block.title}</h3>
                        <p className="text-[12px] text-zinc-400 leading-[1.7]">{block.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="px-6 py-4 border-t border-white/5">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveModal(null)}
                  className="w-full py-3 rounded-xl bg-violet-500/20 border border-violet-500/30 text-sm text-violet-300 font-medium hover:bg-violet-500/30 transition-all"
                >
                  Понятно
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}

// ==========================================
// ИСПРАВЛЕННАЯ ФОРМА АВТОРИЗАЦИИ
// ==========================================

type AuthStep = 'form' | 'verify';

function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<AuthStep>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileComplete, setTurnstileComplete] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const codeInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const turnstileRef = useRef<any>(null);

  const { register, login, sendVerificationCode, verifyCode } = useAuthStore();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleTurnstileSuccess = (token: string) => {
    setTurnstileToken(token);
    setTurnstileComplete(true);
  };

  const handleSubmit = async () => {
    setError('');

    if (!email.trim()) { setError('Введи email'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setError('Некорректный email'); return; }

    if (mode === 'register') {
      if (!name.trim() || name.trim().length < 2) { setError('Имя слишком короткое'); return; }
      if (!password || password.length < 6) { setError('Пароль минимум 6 символов'); return; }

      const VALID_DOMAINS = [
        'gmail.com','yahoo.com','outlook.com','hotmail.com','mail.ru','yandex.ru','ya.ru','icloud.com',
        'protonmail.com','proton.me','bk.ru','inbox.ru','list.ru','rambler.ru','live.com','aol.com',
        'zoho.com','gmx.com','tutanota.com','fastmail.com','me.com','mac.com','msn.com','qq.com','163.com',
        'ukr.net','i.ua','meta.ua','email.ua','bigmir.net',
      ];
      const domain = email.split('@')[1]?.toLowerCase();
      if (!domain || !VALID_DOMAINS.includes(domain)) {
        setError('Используй настоящий email (Gmail, Outlook, Mail.ru и т.д.)');
        return;
      }
    } else {
      if (!password) { setError('Введи пароль'); return; }
    }

    // Cloudflare проверка — только если ещё не пройдена
    if (!turnstileComplete) {
      setError('Пройди проверку безопасности');
      return;
    }

    setIsLoading(true);

    if (mode === 'login') {
      // ASYNC login
      try {
        const loginResult = await login(email, password);
        if (!loginResult.success) {
          setError(loginResult.error || 'Ошибка входа');
          setIsLoading(false);
          return;
        }
        setIsLoading(false);
        onClose();
      } catch (e) {
        console.error('Login error:', e);
        setError('Ошибка сети. Проверь интернет');
        setIsLoading(false);
      }
      return;
    }

    // Регистрация — отправляем код
    try {
      const result = await sendVerificationCode(email, turnstileToken);
      if (result.success) {
        setStep('verify');
        setCountdown(60);
        setCode('');
        setError('');
        setTimeout(() => codeInputsRef.current[0]?.focus(), 100);
      } else {
        setError(result.error || 'Ошибка отправки кода');
      }
    } catch (e) {
      console.error('Send code error:', e);
      setError('Ошибка сети');
    }

    setIsLoading(false);
  };

  const handleVerifyAndComplete = async () => {
    setError('');
    if (code.length !== 6) { setError('Введи 6-значный код'); return; }

    setIsLoading(true);

    try {
      const verifyResult = await verifyCode(email, code);
      if (!verifyResult.success) {
        setError(verifyResult.error || 'Неверный код');
        setIsLoading(false);
        return;
      }

      // ASYNC register
      const regResult = await register(name, email, password);
      if (!regResult.success) {
        setError(regResult.error || 'Ошибка регистрации');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onClose();
    } catch (e) {
      console.error('Register error:', e);
      setError('Ошибка сети. Проверь интернет');
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;
    const newCode = code.split('');
    while (newCode.length < 6) newCode.push('');
    newCode[index] = value;
    const joined = newCode.join('').slice(0, 6);
    setCode(joined);
    if (value && index < 5) codeInputsRef.current[index + 1]?.focus();
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) codeInputsRef.current[index - 1]?.focus();
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    setCode(pasted);
    codeInputsRef.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setIsLoading(true);
    setError('');

    try {
      // Используем сохранённый токен — НЕ требуем повторной проверки Cloudflare
      const result = await sendVerificationCode(email, turnstileToken || 'resend');
      if (result.success) {
        setCountdown(60);
        setCode('');
      } else {
        setError(result.error || 'Ошибка повторной отправки');
      }
    } catch (e) {
      setError('Ошибка сети');
    }

    setIsLoading(false);
  };

  const handleBack = () => {
    setStep('form');
    setCode('');
    setError('');
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] max-w-[calc(100vw-32px)] glass-strong border border-white/10 rounded-2xl z-[70] overflow-hidden"
      >
        <div className="p-6 text-center border-b border-white/5">
          <h2 className="text-2xl font-bold text-white mb-1">MoSeek</h2>
          <p className="text-sm text-zinc-400">
            {step === 'verify' ? `Код отправлен на ${email}` : mode === 'login' ? 'Войди в аккаунт' : 'Создай аккаунт'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
              <div className="flex rounded-xl bg-white/5 p-1 mb-6">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    mode === 'login' ? 'bg-violet-500 text-white shadow-lg' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Вход
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    mode === 'register' ? 'bg-violet-500 text-white shadow-lg' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Регистрация
                </button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20"
                >
                  <span className="text-sm text-red-300">{error}</span>
                </motion.div>
              )}

              <div className="space-y-4">
                {mode === 'register' && (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Имя"
                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all"
                  />
                )}

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all"
                />

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Пароль"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
                    className="w-full h-12 px-4 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <span className="text-lg">{showPassword ? '🙈' : '👁'}</span>
                  </button>
                </div>

                {/* Cloudflare — показываем только если ещё не пройден */}
                {!turnstileComplete && (
                  <div className="flex justify-center py-2">
                    <Turnstile
                      ref={turnstileRef}
                      siteKey={TURNSTILE_SITE_KEY}
                      onSuccess={handleTurnstileSuccess}
                      onError={() => { setTurnstileToken(''); setTurnstileComplete(false); }}
                      onExpire={() => { setTurnstileToken(''); setTurnstileComplete(false); }}
                      options={{ theme: 'dark', size: 'flexible' }}
                    />
                  </div>
                )}

                {/* Показываем галочку если Cloudflare пройден */}
                {turnstileComplete && (
                  <div className="flex items-center justify-center gap-2 py-2">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
                      <span className="text-green-400 text-xs">✓</span>
                    </div>
                    <span className="text-xs text-green-400/80">Проверка пройдена</span>
                  </div>
                )}

                <motion.button
                  type="button"
                  disabled={isLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleSubmit}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium text-sm shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>{mode === 'login' ? 'Войти' : 'Продолжить'}</span>}
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 'verify' && (
            <motion.div key="verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20"
                >
                  <span className="text-sm text-red-300">{error}</span>
                </motion.div>
              )}

              <div className="flex justify-center gap-2 mb-6" onPaste={handleCodePaste}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <input
                    key={i}
                    ref={(el) => { codeInputsRef.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={code[i] || ''}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-white/5 border border-white/10 text-white focus:border-violet-500 focus:bg-white/10 focus:outline-none transition-all"
                  />
                ))}
              </div>

              <motion.button
                type="button"
                disabled={isLoading || code.length !== 6}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleVerifyAndComplete}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium text-sm shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-4"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Подтвердить</span>}
              </motion.button>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  ← Назад
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={countdown > 0 || isLoading}
                  className={`text-sm transition-colors ${countdown > 0 ? 'text-zinc-600 cursor-not-allowed' : 'text-violet-400 hover:text-violet-300'}`}
                >
                  {countdown > 0 ? `Повторить через ${countdown}с` : 'Отправить снова'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
