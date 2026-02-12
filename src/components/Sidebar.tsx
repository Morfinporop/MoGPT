import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Plus, LogOut, Loader2, Camera } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { useState, useRef, useEffect } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

const TURNSTILE_SITE_KEY = '0x4AAAAAACa5EobYKh_TrmuZ';
const AI_ICON = 'https://img.icons8.com/ios-filled/50/FFFFFF/artificial-intelligence.png';

type ModalType = 'terms' | 'privacy' | 'cookies' | 'profile' | 'auth' | null;

const MODAL_CONTENT = {
  terms: {
    title: 'Условия использования',
    content: `Последнее обновление: Январь 2026

Принятие условий
Используя MoSeek, вы принимаете данные условия. Если не согласны — прекратите использование сервиса.

Описание сервиса
MoSeek — AI-ассистент нового поколения. Генерация текста, кода, ответы на вопросы, помощь в решении задач.

Правила использования
Запрещено: создание вредоносного контента, нарушение законов, спам, попытки взлома.

Интеллектуальная собственность
Сгенерированный контент можно использовать свободно. Уникальность не гарантируется.

Ответственность
Сервис предоставляется «как есть». Мы не несём ответственности за неточности, перебои и любой ущерб.

Изменения
Условия могут меняться. Продолжение использования означает согласие.

© 2026 MoSeek`
  },
  privacy: {
    title: 'Конфиденциальность',
    content: `Последнее обновление: Январь 2026

Сбор данных
Автоматически: история сообщений (локально в браузере), тип устройства. От вас: текст запросов.

Использование
Данные нужны для ответов на запросы и улучшения сервиса.

Хранение
Сообщения хранятся локально в вашем браузере. На серверах переписка не сохраняется. Удалить можно в любой момент.

Третьи лица
Данные не продаются. Запросы обрабатываются через API партнёров.

Безопасность
HTTPS-шифрование, обфускация данных, регулярные проверки.

Ваши права
Удаление данных, запрос копии, отказ от сервиса.

© 2026 MoSeek`
  },
  cookies: {
    title: 'Политика Cookie',
    content: `Последнее обновление: Январь 2026

Что такое Cookie
Небольшие файлы в браузере для сохранения настроек.

Используем
Хранение настроек, история чатов (локально), выбранный режим, тема оформления.

Не используем
Рекламные, трекинговые Cookie, Cookie третьих лиц, профилирование.

LocalStorage
История сообщений, настройки интерфейса, кэш — всё только на вашем устройстве.

Управление
Очистка в настройках браузера, блокировка, удаление истории через кнопку очистки.

© 2026 MoSeek`
  }
};

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

  const { user, isAuthenticated, logout, guestMessages, maxGuestMessages, updateAvatar } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (result) {
        updateAvatar(result);
      }
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
              <h2 className="text-lg font-semibold text-white">Чаты</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </motion.button>
            </div>

            <div className="p-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  createNewChat();
                  toggleSidebar();
                }}
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
                          deleteChat(chat.id);
                        }}
                        className="flex-shrink-0 p-2 mr-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all"
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
                      <p className="text-[11px] text-zinc-600">{guestMessages}/{maxGuestMessages} запросов</p>
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

              <div className="flex items-center justify-center gap-3 text-[10px]">
                <button
                  onClick={() => setActiveModal('terms')}
                  className="text-zinc-500 hover:text-violet-400 transition-colors"
                >
                  Terms of Use
                </button>
                <span className="text-zinc-700">•</span>
                <button
                  onClick={() => setActiveModal('privacy')}
                  className="text-zinc-500 hover:text-violet-400 transition-colors"
                >
                  Privacy Policy
                </button>
                <span className="text-zinc-700">•</span>
                <button
                  onClick={() => setActiveModal('cookies')}
                  className="text-zinc-500 hover:text-violet-400 transition-colors"
                >
                  Cookies
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        className="hidden"
      />

      <AnimatePresence>
        {activeModal === 'profile' && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] glass-strong border border-white/10 rounded-2xl z-[70] overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <h2 className="text-sm font-semibold text-white">Профиль</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setActiveModal(null)}
                  className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </motion.button>
              </div>

              <div className="px-5 py-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative group flex-shrink-0">
                    <img
                      src={user?.avatar}
                      alt={user?.name}
                      className="w-16 h-16 rounded-full border-2 border-violet-500/30 object-cover"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
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
                  onClick={() => {
                    logout();
                    setActiveModal(null);
                  }}
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
        {activeModal === 'auth' && (
          <AuthModal onClose={() => setActiveModal(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeModal && activeModal !== 'profile' && activeModal !== 'auth' && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] max-w-[calc(100vw-32px)] max-h-[80vh] glass-strong border border-white/10 rounded-2xl z-[70] flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
                <h2 className="text-sm font-semibold text-white">
                  {MODAL_CONTENT[activeModal].title}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setActiveModal(null)}
                  className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </motion.button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="space-y-3">
                  {MODAL_CONTENT[activeModal].content.split('\n\n').map((block, i) => {
                    const lines = block.trim();
                    if (!lines) return null;
                    if (lines.startsWith('©')) {
                      return <p key={i} className="text-[10px] text-zinc-600 pt-2 border-t border-white/5">{lines}</p>;
                    }
                    if (lines.startsWith('Последнее')) {
                      return <p key={i} className="text-[10px] text-zinc-500 italic">{lines}</p>;
                    }
                    const firstLine = lines.split('\n')[0];
                    const rest = lines.split('\n').slice(1).join(' ');
                    if (rest) {
                      return (
                        <div key={i}>
                          <h3 className="text-xs font-semibold text-violet-400 mb-1">{firstLine}</h3>
                          <p className="text-[11px] text-zinc-400 leading-relaxed">{rest}</p>
                        </div>
                      );
                    }
                    return <p key={i} className="text-[11px] text-zinc-400 leading-relaxed">{lines}</p>;
                  })}
                </div>
              </div>

              <div className="px-5 py-3.5 border-t border-white/5">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveModal(null)}
                  className="w-full py-2.5 rounded-xl bg-violet-500/20 border border-violet-500/30 text-xs text-violet-300 font-medium hover:bg-violet-500/30 transition-all"
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
  const [shake, setShake] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
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

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const checkExisting = (): boolean => {
    const storedRaw = localStorage.getItem('moseek_users_db');
    if (!storedRaw) return true;
    try {
      const users = JSON.parse(storedRaw) as any[];
      if (users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase().trim())) {
        setError('Этот email уже зарегистрирован');
        return false;
      }
      if (users.find((u: any) => u.name?.toLowerCase() === name.trim().toLowerCase())) {
        setError('Это имя уже занято');
        return false;
      }
    } catch {}
    return true;
  };

  const handleSubmit = async () => {
    setError('');

    if (!email.trim()) {
      setError('Введи email');
      triggerShake();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Некорректный email');
      triggerShake();
      return;
    }

    if (mode === 'register') {
      if (!name.trim() || name.trim().length < 2) {
        setError('Имя слишком короткое');
        triggerShake();
        return;
      }
      if (!password || password.length < 6) {
        setError('Пароль минимум 6 символов');
        triggerShake();
        return;
      }

      const VALID_DOMAINS = [
        'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
        'mail.ru', 'yandex.ru', 'ya.ru', 'icloud.com',
        'protonmail.com', 'proton.me', 'bk.ru', 'inbox.ru',
        'list.ru', 'rambler.ru', 'live.com', 'aol.com',
        'zoho.com', 'gmx.com', 'tutanota.com', 'fastmail.com',
        'me.com', 'mac.com', 'msn.com', 'qq.com', '163.com',
        'ukr.net', 'i.ua', 'meta.ua', 'email.ua', 'bigmir.net',
      ];
      const domain = email.split('@')[1]?.toLowerCase();
      if (!domain || !VALID_DOMAINS.includes(domain)) {
        setError('Используй настоящий email (Gmail, Outlook, Mail.ru и т.д.)');
        triggerShake();
        return;
      }

      if (!checkExisting()) return;
    } else {
      if (!password) {
        setError('Введи пароль');
        triggerShake();
        return;
      }
    }

    if (!turnstileToken) {
      setError('Пройди проверку безопасности');
      triggerShake();
      return;
    }

    setIsLoading(true);

    if (mode === 'login') {
      const loginResult = login(email, password);
      if (!loginResult.success) {
        setError(loginResult.error || 'Ошибка входа');
        triggerShake();
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      onClose();
      return;
    }

    const result = await sendVerificationCode(email, turnstileToken);

    if (result.success) {
      setStep('verify');
      setCountdown(60);
      setCode('');
      setTimeout(() => codeInputsRef.current[0]?.focus(), 100);
    } else {
      setError(result.error || 'Ошибка отправки кода');
      triggerShake();
      if (turnstileRef.current) {
        turnstileRef.current.reset();
        setTurnstileToken('');
      }
    }

    setIsLoading(false);
  };

  const handleVerifyAndComplete = async () => {
    setError('');

    if (code.length !== 6) {
      setError('Введи 6-значный код');
      triggerShake();
      return;
    }

    setIsLoading(true);

    const verifyResult = await verifyCode(email, code);

    if (!verifyResult.success) {
      setError(verifyResult.error || 'Неверный код');
      triggerShake();
      setIsLoading(false);
      return;
    }

    const regResult = register(name, email, password);
    if (!regResult.success) {
      setError(regResult.error || 'Ошибка регистрации');
      triggerShake();
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    onClose();
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;
    const newCode = code.split('');
    while (newCode.length < 6) newCode.push('');
    newCode[index] = value;
    const joined = newCode.join('').slice(0, 6);
    setCode(joined);
    if (value && index < 5) {
      codeInputsRef.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeInputsRef.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    setCode(pasted);
    codeInputsRef.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleResend = async () => {
    if (countdown > 0 || !turnstileToken) return;
    setIsLoading(true);
    setError('');
    const result = await sendVerificationCode(email, turnstileToken);
    if (result.success) {
      setCountdown(60);
      setCode('');
    } else {
      setError(result.error || 'Ошибка повторной отправки');
    }
    setIsLoading(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] max-w-[calc(100vw-32px)] max-h-[90vh] overflow-y-auto glass-strong border border-white/10 rounded-2xl z-[70]"
      >
        <motion.div
          animate={shake ? { x: [-4, 4, -4, 4, 0] } : {}}
          transition={{ duration: 0.3 }}
        >
          <div className="px-6 pt-8 pb-4 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-violet-500/30 glow-soft"
            >
              <img src={AI_ICON} alt="AI" className="w-8 h-8 object-contain" />
            </motion.div>
            <h2 className="text-xl font-bold text-white mb-1">MoSeek</h2>
            <p className="text-xs text-zinc-500">
              {step === 'verify'
                ? `Код отправлен на ${email}`
                : mode === 'login' ? 'Войди в аккаунт' : 'Создай аккаунт'
              }
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex mx-6 mb-4 rounded-xl glass-light p-1">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      mode === 'login' ? 'bg-violet-500/20 text-violet-300' : 'text-zinc-500 hover:text-zinc-400'
                    }`}
                  >
                    Вход
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(''); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      mode === 'register' ? 'bg-violet-500/20 text-violet-300' : 'text-zinc-500 hover:text-zinc-400'
                    }`}
                  >
                    Регистрация
                  </button>
                </div>

                <div className="px-6 pb-6 space-y-3">
                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div
                        key="error"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20"
                      >
                        <span className="text-xs text-red-300">{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div
                    initial={false}
                    animate={{
                      height: mode === 'register' ? 60 : 0,
                      opacity: mode === 'register' ? 1 : 0,
                      marginBottom: mode === 'register' ? 0 : -12,
                    }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="pb-3">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Имя"
                        tabIndex={mode === 'register' ? 0 : -1}
                        className="w-full h-[48px] px-4 rounded-xl glass-light text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 border border-white/5 focus:border-violet-500/30 transition-colors"
                      />
                    </div>
                  </motion.div>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full h-[48px] px-4 rounded-xl glass-light text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 border border-white/5 focus:border-violet-500/30 transition-colors"
                  />

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Пароль"
                      className="w-full h-[48px] px-4 pr-11 rounded-xl glass-light text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 border border-white/5 focus:border-violet-500/30 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                    >
                      <span className="text-sm">{showPassword ? '🙈' : '👁'}</span>
                    </button>
                  </div>

                  <div className="flex justify-center pt-1 overflow-hidden rounded-xl [&_iframe]:!w-full [&>div]:!w-full [&_div]:!w-full">
                    <Turnstile
                      ref={turnstileRef}
                      siteKey={TURNSTILE_SITE_KEY}
                      onSuccess={(token) => setTurnstileToken(token)}
                      onError={() => setTurnstileToken('')}
                      onExpire={() => setTurnstileToken('')}
                      options={{ theme: 'dark', size: 'flexible' }}
                    />
                  </div>

                  <motion.button
                    type="button"
                    disabled={isLoading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleSubmit}
                    className="w-full h-[48px] rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium text-sm shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>{mode === 'login' ? 'Войти' : 'Отправить код на почту'}</span>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 'verify' && (
              <motion.div
                key="verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="px-6 pb-6 space-y-4"
              >
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      key="verify-error"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20"
                    >
                      <span className="text-xs text-red-300">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-center gap-2.5" onPaste={handleCodePaste}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <motion.input
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      ref={(el) => { codeInputsRef.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={code[i] || ''}
                      onChange={(e) => handleCodeChange(i, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(i, e)}
                      className="w-12 h-14 text-center text-xl font-bold rounded-xl glass-light text-white border border-white/10 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/30 focus:outline-none transition-all"
                    />
                  ))}
                </div>

                <motion.button
                  type="button"
                  disabled={isLoading || code.length !== 6}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleVerifyAndComplete}
                  className="w-full h-[48px] rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium text-sm shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Подтвердить</span>}
                </motion.button>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={countdown > 0 || isLoading}
                    className={`text-xs transition-colors ${
                      countdown > 0 ? 'text-zinc-600 cursor-not-allowed' : 'text-violet-400 hover:text-violet-300'
                    }`}
                  >
                    {countdown > 0 ? `Повторить через ${countdown}с` : 'Отправить снова'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  );
}
