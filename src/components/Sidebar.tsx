import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Plus, LogOut, Loader2, Camera, Sun, Moon, Trash2, ChevronDown, Pencil, Lock, User, AlertTriangle, Check, ArrowLeft, Shield, Eye, EyeOff } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

const TURNSTILE_SITE_KEY = '0x4AAAAAACa5EobYKh_TrmuZ';
const DISCORD_URL = 'https://discord.gg/qjnyAr7YXe';

type ModalType = 'terms' | 'privacy' | 'cookies' | 'profile' | 'auth' | null;
type ProfileView = 'main' | 'editName' | 'changePassword' | 'deleteAccount' | 'deleteVerify';
type AuthStep = 'form' | 'verify';

const VALID_EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'mail.ru',
  'yandex.ru', 'ya.ru', 'icloud.com', 'protonmail.com', 'proton.me',
  'bk.ru', 'inbox.ru', 'list.ru', 'rambler.ru', 'live.com', 'aol.com',
  'zoho.com', 'gmx.com', 'tutanota.com', 'fastmail.com', 'me.com',
  'mac.com', 'msn.com', 'qq.com', '163.com', 'ukr.net', 'i.ua',
  'meta.ua', 'email.ua', 'bigmir.net'
];

const MODAL_CONTENT: Record<'terms' | 'privacy' | 'cookies', { title: string; content: Array<{ type: string; title?: string; text: string }> }> = {
  terms: {
    title: 'Условия использования',
    content: [
      { type: 'meta', text: 'Последнее обновление: январь 2026' },
      { type: 'section', title: '1. Принятие условий', text: 'Используя MoSeek и MoGPT, вы принимаете настоящие условия. Если не согласны — прекратите использование.' },
      { type: 'section', title: '2. Сервис', text: 'MoSeek — AI-платформа. MoGPT — нейросеть от MoSeek. Генерация текста, код, ответы на вопросы, дизайн интерфейсов.' },
      { type: 'section', title: '3. Собственность', text: '"MoSeek", "MoGPT", логотипы, дизайн, код — интеллектуальная собственность MoSeek. Копирование запрещено.' },
      { type: 'important', text: 'Нарушение авторских прав влечёт ответственность по закону.' },
      { type: 'section', title: '4. Правила', text: 'Запрещено: вредоносный контент, взлом, массовые запросы, нарушение прав третьих лиц.' },
      { type: 'section', title: '5. Ответственность', text: 'Сервис «как есть». MoSeek не гарантирует бесперебойность и абсолютную точность.' },
      { type: 'copyright', text: '© 2026 MoSeek. Все права защищены.' },
    ]
  },
  privacy: {
    title: 'Конфиденциальность',
    content: [
      { type: 'meta', text: 'Последнее обновление: январь 2026' },
      { type: 'section', title: '1. Данные', text: 'Имя, email, пароль (SHA-256). Чаты синхронизируются в облаке между устройствами.' },
      { type: 'important', text: 'Мы НЕ собираем: геолокацию, IP для слежки, биометрию, финансы.' },
      { type: 'section', title: '2. Хранение', text: 'Данные в защищённой базе. Локальный кеш в браузере для быстродействия.' },
      { type: 'section', title: '3. Права', text: 'Удаление данных, отзыв согласия, экспорт — по запросу.' },
      { type: 'copyright', text: '© 2026 MoSeek. Все права защищены.' },
    ]
  },
  cookies: {
    title: 'Политика Cookie',
    content: [
      { type: 'meta', text: 'Последнее обновление: январь 2026' },
      { type: 'section', title: '1. Хранение', text: 'Настройки, кеш чатов, токен авторизации — в localStorage браузера.' },
      { type: 'important', text: 'Без рекламных Cookie, трекеров, fingerprinting.' },
      { type: 'section', title: '2. Контроль', text: 'Очистка localStorage удаляет локальный кеш. Данные в облаке сохраняются.' },
      { type: 'copyright', text: '© 2026 MoSeek. Ваши данные — ваша собственность.' },
    ]
  }
};

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   Компонент ввода 6-значного кода
   ═══════════════════════════════════════════ */
function CodeInput({
  code,
  setCode,
  isDark,
  autoFocus = true
}: {
  code: string;
  setCode: (v: string) => void;
  isDark: boolean;
  autoFocus?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus) setTimeout(() => refs.current[0]?.focus(), 100);
  }, [autoFocus]);

  const handleChange = (i: number, v: string) => {
    if (v.length > 1) v = v[v.length - 1];
    if (!/^\d*$/.test(v)) return;
    const arr = code.split('');
    while (arr.length < 6) arr.push('');
    arr[i] = v;
    setCode(arr.join('').slice(0, 6));
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    setCode(p);
    refs.current[Math.min(p.length, 5)]?.focus();
  };

  return (
    <div className="flex justify-center gap-2" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={code[i] || ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          className={`w-11 h-13 text-center text-xl font-bold rounded-xl focus:outline-none transition-all ${
            isDark
              ? 'bg-white/5 border border-white/10 text-white focus:border-violet-500 focus:bg-white/10'
              : 'bg-zinc-50 border border-zinc-200 text-zinc-900 focus:border-violet-400 focus:bg-white'
          }`}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Sidebar
   ═══════════════════════════════════════════ */
export function Sidebar() {
  const { chats, currentChatId, sidebarOpen, toggleSidebar, setCurrentChat, deleteChat, createNewChat } = useChatStore();
  const { user, isAuthenticated, logout, updateAvatar } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [showHeaderExtras, setShowHeaderExtras] = useState(false);

  useEffect(() => {
    const check = () => setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleNewChat = () => {
    const id = createNewChat();
    if (id) setCurrentChat(id);
    toggleSidebar();
  };

  const handleDeleteChat = (chatId: string) => {
    const idx = chats.findIndex(c => c.id === chatId);
    const remaining = chats.filter(c => c.id !== chatId);
    deleteChat(chatId);
    if (currentChatId === chatId && remaining.length > 0) {
      setCurrentChat(remaining[Math.min(idx, remaining.length - 1)].id);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 2 * 1024 * 1024) return;
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
            className={`fixed left-0 top-0 bottom-0 w-72 z-50 flex flex-col border-r ${
              isDark
                ? 'bg-[#0a0a0f]/95 backdrop-blur-xl border-white/5'
                : 'bg-white/95 backdrop-blur-xl border-zinc-200'
            }`}
          >
            {/* ─── Шапка ─── */}
            <div className={`border-b ${isDark ? 'border-white/5' : 'border-zinc-100'}`}>
              <div className="flex items-center justify-between p-4">
                <button
                  onClick={() => setShowHeaderExtras(!showHeaderExtras)}
                  className={`flex items-center gap-1.5 text-lg font-semibold transition-colors ${
                    isDark ? 'text-white hover:text-violet-400' : 'text-zinc-900 hover:text-violet-600'
                  }`}
                >
                  Меню
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                    isDark ? 'text-zinc-500' : 'text-zinc-400'
                  } ${showHeaderExtras ? 'rotate-180' : ''}`} />
                </button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleSidebar}
                  className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-zinc-100'}`}
                >
                  <X className={`w-5 h-5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
                </motion.button>
              </div>

              <AnimatePresence>
                {showHeaderExtras && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className={`flex items-center gap-2 px-4 pb-3 ${
                      isDark ? 'bg-white/[0.02]' : 'bg-zinc-50/50'
                    }`}>
                      <motion.a
                        href={DISCORD_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
                          isDark
                            ? 'bg-[#5865F2]/10 border border-[#5865F2]/20 text-[#5865F2] hover:bg-[#5865F2]/20'
                            : 'bg-[#5865F2]/5 border border-[#5865F2]/15 text-[#5865F2] hover:bg-[#5865F2]/10'
                        }`}
                      >
                        <DiscordIcon className="w-4 h-4" />
                        <span className="font-medium">Discord</span>
                      </motion.a>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleTheme}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
                          isDark
                            ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                            : 'bg-violet-500/5 border border-violet-500/15 text-violet-500 hover:bg-violet-500/10'
                        }`}
                      >
                        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        <span className="font-medium">{isDark ? 'Светлая' : 'Тёмная'}</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ─── Новый чат ─── */}
            <div className="p-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNewChat}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isDark
                    ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 hover:border-violet-500/50 text-violet-300'
                    : 'bg-violet-50 border border-violet-200 hover:border-violet-300 text-violet-600'
                }`}
              >
                <Plus className="w-5 h-5" />
                <span className="text-sm font-medium">Новый чат</span>
              </motion.button>
            </div>

            {/* ─── Список чатов ─── */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {chats.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-zinc-700' : 'text-zinc-300'}`} />
                  <p className={`text-sm ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Нет чатов</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-zinc-700' : 'text-zinc-400'}`}>Начни новый диалог</p>
                </div>
              ) : (
                chats.map((chat) => {
                  const isActive = currentChatId === chat.id;
                  return (
                    <motion.div
                      key={chat.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`group relative rounded-xl transition-all cursor-pointer ${
                        isActive
                          ? isDark ? 'bg-violet-500/15 border border-violet-500/30' : 'bg-violet-50 border border-violet-200'
                          : isDark ? 'hover:bg-white/5 border border-transparent' : 'hover:bg-zinc-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center">
                        <button
                          onClick={() => { setCurrentChat(chat.id); toggleSidebar(); }}
                          className="flex-1 min-w-0 text-left px-3 py-2.5"
                        >
                          <div className="flex items-center gap-2">
                            <MessageSquare className={`w-4 h-4 flex-shrink-0 ${
                              isActive
                                ? isDark ? 'text-violet-400' : 'text-violet-500'
                                : isDark ? 'text-zinc-600' : 'text-zinc-400'
                            }`} />
                            <p className={`text-sm truncate max-w-[140px] ${
                              isActive
                                ? isDark ? 'text-white' : 'text-zinc-900'
                                : isDark ? 'text-zinc-400' : 'text-zinc-600'
                            }`}>
                              {chat.title}
                            </p>
                          </div>
                        </button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => { e.stopPropagation(); handleDeleteChat(chat.id); }}
                          className={`flex-shrink-0 p-2 mr-1 rounded-lg transition-all ${
                            isDark ? 'hover:bg-red-500/20' : 'hover:bg-red-50'
                          } ${isTouchDevice ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* ─── Нижняя панель ─── */}
            <div className={`p-4 border-t ${isDark ? 'border-white/5' : 'border-zinc-100'}`}>
              {isAuthenticated ? (
                <div
                  onClick={() => setActiveModal('profile')}
                  className={`flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer mb-4 transition-colors ${
                    isDark ? 'hover:bg-white/5' : 'hover:bg-zinc-50'
                  }`}
                >
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className={`w-10 h-10 rounded-full flex-shrink-0 object-cover border-2 ${
                      isDark ? 'border-violet-500/30' : 'border-violet-300'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>{user?.name}</p>
                    <p className={`text-[11px] truncate ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{user?.email}</p>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="flex items-center gap-3 px-2 py-2 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isDark ? 'bg-zinc-800 border border-white/5' : 'bg-zinc-100 border border-zinc-200'
                    }`}>
                      <span className="text-zinc-500 text-sm">👤</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Гость</p>
                      <p className={`text-[11px] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Безлимитный доступ</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveModal('auth')}
                    className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isDark
                        ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 text-violet-300 hover:border-violet-500/50'
                        : 'bg-violet-50 border border-violet-200 text-violet-600 hover:bg-violet-100'
                    }`}
                  >
                    Войти / Регистрация
                  </motion.button>
                </div>
              )}

              <div className="flex items-center gap-3 text-[10px] pl-1">
                <button onClick={() => setActiveModal('terms')} className={`transition-colors ${isDark ? 'text-zinc-500 hover:text-violet-400' : 'text-zinc-400 hover:text-violet-500'}`}>
                  Terms of Use
                </button>
                <span className={isDark ? 'text-zinc-700' : 'text-zinc-300'}>•</span>
                <button onClick={() => setActiveModal('privacy')} className={`transition-colors ${isDark ? 'text-zinc-500 hover:text-violet-400' : 'text-zinc-400 hover:text-violet-500'}`}>
                  Privacy Policy
                </button>
                <span className={isDark ? 'text-zinc-700' : 'text-zinc-300'}>•</span>
                <button onClick={() => setActiveModal('cookies')} className={`transition-colors ${isDark ? 'text-zinc-500 hover:text-violet-400' : 'text-zinc-400 hover:text-violet-500'}`}>
                  Cookies
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />

      {/* ═══ Профиль ═══ */}
      <AnimatePresence>
        {activeModal === 'profile' && (
          <ProfileModal onClose={() => setActiveModal(null)} isDark={isDark} fileInputRef={fileInputRef} />
        )}
      </AnimatePresence>

      {/* ═══ Авторизация ═══ */}
      <AnimatePresence>
        {activeModal === 'auth' && (
          <AuthModal onClose={() => setActiveModal(null)} isDark={isDark} />
        )}
      </AnimatePresence>

      {/* ═══ Документы ═══ */}
      <AnimatePresence>
        {activeModal && activeModal !== 'profile' && activeModal !== 'auth' && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveModal(null)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] max-w-[calc(100vw-32px)] max-h-[85vh] rounded-2xl z-[70] flex flex-col overflow-hidden border ${
                isDark ? 'bg-[#0f0f15] border-white/10' : 'bg-white border-zinc-200'
              }`}
            >
              <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-white/5' : 'border-zinc-100'}`}>
                <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{MODAL_CONTENT[activeModal].title}</h2>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setActiveModal(null)} className={`p-1.5 rounded-md ${isDark ? 'hover:bg-white/10' : 'hover:bg-zinc-100'}`}>
                  <X className={`w-4 h-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
                </motion.button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <div className="space-y-4">
                  {MODAL_CONTENT[activeModal].content.map((block, i) => {
                    if (block.type === 'meta') return <p key={i} className={`text-[11px] italic ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{block.text}</p>;
                    if (block.type === 'copyright') return <p key={i} className={`text-[11px] font-medium pt-3 mt-4 border-t ${isDark ? 'text-zinc-600 border-white/5' : 'text-zinc-400 border-zinc-100'}`}>{block.text}</p>;
                    if (block.type === 'important') return (
                      <div key={i} className={`px-4 py-3 rounded-xl ${isDark ? 'bg-violet-500/10 border border-violet-500/20' : 'bg-violet-50 border border-violet-200'}`}>
                        <p className={`text-[12px] leading-relaxed font-medium ${isDark ? 'text-violet-300' : 'text-violet-700'}`}>{block.text}</p>
                      </div>
                    );
                    return (
                      <div key={i}>
                        <h3 className={`text-[13px] font-semibold mb-1.5 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{block.title}</h3>
                        <p className={`text-[12px] leading-[1.7] ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{block.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className={`px-6 py-4 border-t ${isDark ? 'border-white/5' : 'border-zinc-100'}`}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveModal(null)}
                  className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${
                    isDark
                      ? 'bg-violet-500/20 border border-violet-500/30 text-violet-300 hover:bg-violet-500/30'
                      : 'bg-violet-50 border border-violet-200 text-violet-600 hover:bg-violet-100'
                  }`}
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

/* ═══════════════════════════════════════════
   ProfileModal
   ═══════════════════════════════════════════ */
function ProfileModal({
  onClose,
  isDark,
  fileInputRef
}: {
  onClose: () => void;
  isDark: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const { user, logout, updateName, updatePassword, sendVerificationCode, verifyCode, deleteAccount } = useAuthStore();
  const [view, setView] = useState<ProfileView>('main');
  const [newName, setNewName] = useState(user?.name || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const resetState = useCallback(() => {
    setError('');
    setSuccess('');
    setCode('');
    setIsLoading(false);
    setTurnstileToken('');
    setDeleteConfirmText('');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  }, []);

  const goBack = useCallback(() => {
    resetState();
    setView('main');
  }, [resetState]);

  const inputClass = `w-full h-12 px-4 rounded-xl text-sm focus:outline-none transition-all ${
    isDark
      ? 'bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-violet-500/50 focus:bg-white/10'
      : 'bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-violet-400 focus:bg-white'
  }`;

  /* ─── Сохранить имя ─── */
  const handleSaveName = async () => {
    setError('');
    if (!newName.trim() || newName.trim().length < 2) {
      setError('Имя должно быть минимум 2 символа');
      return;
    }
    if (newName.trim() === user?.name) {
      setError('Новое имя совпадает с текущим');
      return;
    }
    setIsLoading(true);
    try {
      const res = await updateName(newName.trim());
      if (res.success) {
        setSuccess('Имя обновлено');
        setTimeout(() => goBack(), 1200);
      } else {
        setError(res.error || 'Ошибка обновления');
      }
    } catch {
      setError('Ошибка сети');
    }
    setIsLoading(false);
  };

  /* ─── Сменить пароль ─── */
  const handleChangePassword = async () => {
    setError('');

    if (!oldPassword) {
      setError('Введи текущий пароль');
      return;
    }
    if (!newPassword) {
      setError('Введи новый пароль');
      return;
    }
    if (newPassword.length < 6) {
      setError('Новый пароль минимум 6 символов');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    if (oldPassword === newPassword) {
      setError('Новый пароль совпадает со старым');
      return;
    }

    setIsLoading(true);
    try {
      const res = await updatePassword(oldPassword, newPassword);
      if (res.success) {
        setSuccess('Пароль обновлён');
        setTimeout(() => goBack(), 1200);
      } else {
        setError(res.error || 'Ошибка обновления');
      }
    } catch {
      setError('Ошибка сети');
    }
    setIsLoading(false);
  };

  /* ─── Удаление: отправить код ─── */
  const handleDeleteSendCode = async () => {
    setError('');
    if (deleteConfirmText !== 'УДАЛИТЬ') {
      setError('Напиши УДАЛИТЬ для подтверждения');
      return;
    }
    if (!turnstileToken) {
      setError('Пройди проверку безопасности');
      return;
    }
    setIsLoading(true);
    try {
      const res = await sendVerificationCode(user?.email || '', turnstileToken);
      if (res.success) {
        setView('deleteVerify');
        setCountdown(60);
        setCode('');
        setError('');
      } else {
        setError(res.error || 'Ошибка отправки кода');
      }
    } catch {
      setError('Ошибка сети');
    }
    setIsLoading(false);
  };

  /* ─── Удаление: подтвердить код ─── */
  const handleDeleteVerify = async () => {
    setError('');
    if (code.length !== 6) {
      setError('Введи 6-значный код');
      return;
    }
    setIsLoading(true);
    try {
      const v = await verifyCode(user?.email || '', code);
      if (!v.success) {
        setError(v.error || 'Неверный код');
        setIsLoading(false);
        return;
      }
      const res = await deleteAccount();
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Ошибка удаления');
      }
    } catch {
      setError('Ошибка сети');
    }
    setIsLoading(false);
  };

  /* ─── Повтор кода ─── */
  const handleResend = async () => {
    if (countdown > 0) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await sendVerificationCode(user?.email || '', turnstileToken || 'resend');
      if (res.success) { setCountdown(60); setCode(''); }
      else setError(res.error || 'Ошибка');
    } catch { setError('Ошибка сети'); }
    setIsLoading(false);
  };

  /* ─── Поле пароля с глазом ─── */
  const PasswordField = ({
    value,
    onChange,
    placeholder,
    show,
    toggleShow,
    onKeyDown,
  }: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    show: boolean;
    toggleShow: () => void;
    onKeyDown?: (e: React.KeyboardEvent) => void;
  }) => (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={`${inputClass} pr-12`}
      />
      <button
        type="button"
        onClick={toggleShow}
        className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors ${
          isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-600'
        }`}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] max-w-[calc(100vw-32px)] max-h-[90vh] rounded-2xl z-[70] overflow-hidden border flex flex-col ${
          isDark ? 'bg-[#0f0f15] border-white/10' : 'bg-white border-zinc-200'
        }`}
      >
        <AnimatePresence mode="wait">

          {/* ═══ ГЛАВНЫЙ ВИД ═══ */}
          {view === 'main' && (
            <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-white/5' : 'border-zinc-100'}`}>
                <h2 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Профиль</h2>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className={`p-1.5 rounded-md ${isDark ? 'hover:bg-white/10' : 'hover:bg-zinc-100'}`}>
                  <X className={`w-4 h-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
                </motion.button>
              </div>

              <div className="px-5 py-5 overflow-y-auto">
                {/* Аватар */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative group flex-shrink-0">
                    <img src={user?.avatar} alt={user?.name} className={`w-16 h-16 rounded-full object-cover border-2 ${isDark ? 'border-violet-500/30' : 'border-violet-300'}`} />
                    <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-base font-semibold truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>{user?.name}</p>
                    <p className={`text-xs truncate ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{user?.email}</p>
                  </div>
                </div>

                {/* Кнопки */}
                <div className="space-y-2 mb-6">
                  {/* Изменить имя */}
                  <button
                    onClick={() => { resetState(); setNewName(user?.name || ''); setView('editName'); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                      isDark
                        ? 'bg-white/[0.03] hover:bg-white/[0.06] border border-white/5'
                        : 'bg-zinc-50 hover:bg-zinc-100 border border-zinc-100'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDark ? 'bg-violet-500/15' : 'bg-violet-50'}`}>
                      <User className={`w-4 h-4 ${isDark ? 'text-violet-400' : 'text-violet-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>Изменить имя</p>
                      <p className={`text-[11px] truncate ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{user?.name}</p>
                    </div>
                    <Pencil className={`w-4 h-4 ${isDark ? 'text-zinc-600' : 'text-zinc-300'}`} />
                  </button>

                  {/* Сменить пароль */}
                  <button
                    onClick={() => { resetState(); setView('changePassword'); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                      isDark
                        ? 'bg-white/[0.03] hover:bg-white/[0.06] border border-white/5'
                        : 'bg-zinc-50 hover:bg-zinc-100 border border-zinc-100'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDark ? 'bg-amber-500/15' : 'bg-amber-50'}`}>
                      <Lock className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>Сменить пароль</p>
                      <p className={`text-[11px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Обновить пароль аккаунта</p>
                    </div>
                    <Pencil className={`w-4 h-4 ${isDark ? 'text-zinc-600' : 'text-zinc-300'}`} />
                  </button>
                </div>

                {/* Выход */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { logout(); onClose(); }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all mb-3"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400 font-medium">Выйти из аккаунта</span>
                </motion.button>

                {/* Удалить */}
                <button
                  onClick={() => { resetState(); setView('deleteAccount'); }}
                  className={`w-full text-center text-xs py-2 transition-colors ${isDark ? 'text-zinc-600 hover:text-red-400' : 'text-zinc-400 hover:text-red-500'}`}
                >
                  Удалить аккаунт
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══ РЕДАКТИРОВАНИЕ ИМЕНИ ═══ */}
          {view === 'editName' && (
            <motion.div key="editName" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className={`flex items-center gap-3 px-5 py-4 border-b ${isDark ? 'border-white/5' : 'border-zinc-100'}`}>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={goBack} className={`p-1.5 rounded-md ${isDark ? 'hover:bg-white/10' : 'hover:bg-zinc-100'}`}>
                  <ArrowLeft className={`w-4 h-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
                </motion.button>
                <h2 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Изменить имя</h2>
              </div>

              <div className="px-5 py-5">
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <span className="text-sm text-red-400">{error}</span>
                  </motion.div>
                )}
                {success && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
                    <span className="text-sm text-green-400 flex items-center gap-2"><Check className="w-4 h-4" />{success}</span>
                  </motion.div>
                )}

                <label className={`text-xs font-medium mb-2 block ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Новое имя</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); }}
                  placeholder="Введи новое имя"
                  className={`${inputClass} mb-4`}
                  autoFocus
                />

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={isLoading}
                  onClick={handleSaveName}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium text-sm shadow-xl shadow-violet-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Сохранить'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ═══ СМЕНА ПАРОЛЯ ═══ */}
          {view === 'changePassword' && (
            <motion.div key="changePassword" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className={`flex items-center gap-3 px-5 py-4 border-b ${isDark ? 'border-white/5' : 'border-zinc-100'}`}>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={goBack} className={`p-1.5 rounded-md ${isDark ? 'hover:bg-white/10' : 'hover:bg-zinc-100'}`}>
                  <ArrowLeft className={`w-4 h-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
                </motion.button>
                <h2 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Сменить пароль</h2>
              </div>

              <div className="px-5 py-5">
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <span className="text-sm text-red-400">{error}</span>
                  </motion.div>
                )}
                {success && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
                    <span className="text-sm text-green-400 flex items-center gap-2"><Check className="w-4 h-4" />{success}</span>
                  </motion.div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className={`text-xs font-medium mb-2 block ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Текущий пароль</label>
                    <PasswordField
                      value={oldPassword}
                      onChange={setOldPassword}
                      placeholder="Введи текущий пароль"
                      show={showOldPassword}
                      toggleShow={() => setShowOldPassword(!showOldPassword)}
                    />
                  </div>

                  <div>
                    <label className={`text-xs font-medium mb-2 block ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Новый пароль</label>
                    <PasswordField
                      value={newPassword}
                      onChange={setNewPassword}
                      placeholder="Минимум 6 символов"
                      show={showNewPassword}
                      toggleShow={() => setShowNewPassword(!showNewPassword)}
                    />
                  </div>

                  <div>
                    <label className={`text-xs font-medium mb-2 block ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Повтори новый пароль</label>
                    <PasswordField
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      placeholder="Повтори пароль"
                      show={showConfirmPassword}
                      toggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
                      onKeyDown={e => { if (e.key === 'Enter') handleChangePassword(); }}
                    />
                  </div>

                  {/* Индикатор надёжности */}
                  {newPassword && (
                    <div className="space-y-1.5">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map(level => {
                          const strength = getPasswordStrength(newPassword);
                          return (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full transition-all ${
                                level <= strength
                                  ? strength <= 1 ? 'bg-red-500' : strength <= 2 ? 'bg-orange-500' : strength <= 3 ? 'bg-yellow-500' : 'bg-green-500'
                                  : isDark ? 'bg-white/10' : 'bg-zinc-200'
                              }`}
                            />
                          );
                        })}
                      </div>
                      <p className={`text-[11px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        {getPasswordLabel(newPassword)}
                      </p>
                    </div>
                  )}

                  {/* Совпадение паролей */}
                  {confirmPassword && (
                    <div className={`flex items-center gap-2 text-xs ${
                      newPassword === confirmPassword
                        ? 'text-green-400'
                        : isDark ? 'text-red-400' : 'text-red-500'
                    }`}>
                      {newPassword === confirmPassword ? (
                        <><Check className="w-3.5 h-3.5" /> Пароли совпадают</>
                      ) : (
                        <><X className="w-3.5 h-3.5" /> Пароли не совпадают</>
                      )}
                    </div>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={isLoading || !oldPassword || !newPassword || newPassword !== confirmPassword}
                  onClick={handleChangePassword}
                  className="w-full h-12 mt-5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium text-sm shadow-xl shadow-violet-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Сменить пароль'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ═══ УДАЛЕНИЕ АККАУНТА ═══ */}
          {view === 'deleteAccount' && (
            <motion.div key="deleteAccount" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className={`flex items-center gap-3 px-5 py-4 border-b ${isDark ? 'border-white/5' : 'border-zinc-100'}`}>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={goBack} className={`p-1.5 rounded-md ${isDark ? 'hover:bg-white/10' : 'hover:bg-zinc-100'}`}>
                  <ArrowLeft className={`w-4 h-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
                </motion.button>
                <h2 className="text-sm font-semibold text-red-400">Удаление аккаунта</h2>
              </div>

              <div className="px-5 py-5">
                <div className={`flex items-start gap-3 px-4 py-4 rounded-xl mb-5 ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className={`text-sm font-medium mb-1 ${isDark ? 'text-red-300' : 'text-red-700'}`}>Это действие необратимо</p>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-red-400/70' : 'text-red-600/70'}`}>
                      Все данные, чаты и настройки будут удалены навсегда. Восстановить аккаунт будет невозможно.
                    </p>
                  </div>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <span className="text-sm text-red-400">{error}</span>
                  </motion.div>
                )}

                <label className={`text-xs font-medium mb-2 block ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Напиши <span className="text-red-400 font-bold">УДАЛИТЬ</span> для подтверждения
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={e => setDeleteConfirmText(e.target.value)}
                  placeholder="УДАЛИТЬ"
                  className={`${inputClass} mb-4`}
                  autoFocus
                />

                <div className="flex justify-center py-2 mb-4">
                  <Turnstile
                    siteKey={TURNSTILE_SITE_KEY}
                    onSuccess={t => setTurnstileToken(t)}
                    onError={() => setTurnstileToken('')}
                    onExpire={() => setTurnstileToken('')}
                    options={{ theme: isDark ? 'dark' : 'light', size: 'flexible' }}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={isLoading || deleteConfirmText !== 'УДАЛИТЬ'}
                  onClick={handleDeleteSendCode}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium text-sm shadow-xl shadow-red-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Отправить код подтверждения'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ═══ УДАЛЕНИЕ: ВЕРИФИКАЦИЯ ═══ */}
          {view === 'deleteVerify' && (
            <motion.div key="deleteVerify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className={`flex items-center gap-3 px-5 py-4 border-b ${isDark ? 'border-white/5' : 'border-zinc-100'}`}>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { setView('deleteAccount'); setCode(''); setError(''); }} className={`p-1.5 rounded-md ${isDark ? 'hover:bg-white/10' : 'hover:bg-zinc-100'}`}>
                  <ArrowLeft className={`w-4 h-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
                </motion.button>
                <h2 className="text-sm font-semibold text-red-400">Подтверждение удаления</h2>
              </div>

              <div className="px-5 py-5">
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-5 ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
                  <Shield className="w-5 h-5 flex-shrink-0 text-red-400" />
                  <p className={`text-xs ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                    Код отправлен на <span className="font-semibold">{user?.email}</span>
                  </p>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <span className="text-sm text-red-400">{error}</span>
                  </motion.div>
                )}

                <div className="mb-5">
                  <CodeInput code={code} setCode={setCode} isDark={isDark} />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={isLoading || code.length !== 6}
                  onClick={handleDeleteVerify}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium text-sm shadow-xl shadow-red-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-4"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Удалить аккаунт навсегда'}
                </motion.button>

                <div className="flex justify-end">
                  <button onClick={handleResend} disabled={countdown > 0 || isLoading}
                    className={`text-sm transition-colors ${countdown > 0 ? isDark ? 'text-zinc-600 cursor-not-allowed' : 'text-zinc-400 cursor-not-allowed' : 'text-red-400 hover:text-red-300'}`}
                  >
                    {countdown > 0 ? `Повторить через ${countdown}с` : 'Отправить снова'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </>
  );
}

/* ═══════════════════════════════════════════
   Хелперы для пароля
   ═══════════════════════════════════════════ */
function getPasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

function getPasswordLabel(password: string): string {
  const s = getPasswordStrength(password);
  if (s <= 1) return 'Слабый пароль';
  if (s === 2) return 'Средний пароль';
  if (s === 3) return 'Хороший пароль';
  return 'Надёжный пароль';
}

/* ═══════════════════════════════════════════
   AuthModal — вход + регистрация + 2FA
   ═══════════════════════════════════════════ */
function AuthModal({ onClose, isDark }: { onClose: () => void; isDark: boolean }) {
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
  const [countdown, setCountdown] = useState(0);
  const [pendingAction, setPendingAction] = useState<'register' | 'login'>('register');

  const { register, login, sendVerificationCode, verifyCode } = useAuthStore();

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const inputClass = `w-full h-12 px-4 rounded-xl text-sm focus:outline-none transition-all ${
    isDark
      ? 'bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-violet-500/50 focus:bg-white/10'
      : 'bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-violet-400 focus:bg-white'
  }`;

  const validateForm = (): boolean => {
    setError('');
    if (!email.trim()) { setError('Введи email'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Некорректный email'); return false; }

    if (mode === 'register') {
      if (!name.trim() || name.trim().length < 2) { setError('Имя слишком короткое'); return false; }
      if (!password || password.length < 6) { setError('Пароль минимум 6 символов'); return false; }
      const domain = email.split('@')[1]?.toLowerCase();
      if (!domain || !VALID_EMAIL_DOMAINS.includes(domain)) { setError('Используй настоящий email'); return false; }
    } else {
      if (!password) { setError('Введи пароль'); return false; }
    }

    if (!turnstileToken) { setError('Пройди проверку безопасности'); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const res = await sendVerificationCode(email, turnstileToken);
      if (res.success) {
        setPendingAction(mode === 'login' ? 'login' : 'register');
        setStep('verify');
        setCountdown(60);
        setCode('');
        setError('');
      } else {
        setError(res.error || 'Ошибка отправки кода');
      }
    } catch {
      setError('Ошибка сети');
    }
    setIsLoading(false);
  };

  const handleVerify = async () => {
    setError('');
    if (code.length !== 6) { setError('Введи 6-значный код'); return; }
    setIsLoading(true);

    try {
      const v = await verifyCode(email, code);
      if (!v.success) { setError(v.error || 'Неверный код'); setIsLoading(false); return; }

      if (pendingAction === 'login') {
        const res = await login(email, password);
        if (!res.success) { setError(res.error || 'Ошибка входа'); setIsLoading(false); return; }
      } else {
        const res = await register(name, email, password);
        if (!res.success) { setError(res.error || 'Ошибка регистрации'); setIsLoading(false); return; }
      }
      setIsLoading(false);
      onClose();
    } catch {
      setError('Ошибка сети');
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await sendVerificationCode(email, turnstileToken || 'resend');
      if (res.success) { setCountdown(60); setCode(''); }
      else setError(res.error || 'Ошибка');
    } catch { setError('Ошибка сети'); }
    setIsLoading(false);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] max-w-[calc(100vw-32px)] rounded-2xl z-[70] overflow-hidden border ${
          isDark ? 'bg-[#0f0f15] border-white/10' : 'bg-white border-zinc-200'
        }`}
      >
        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
              <div className={`flex rounded-xl p-1 mb-6 ${isDark ? 'bg-white/5' : 'bg-zinc-100'}`}>
                {(['login', 'register'] as const).map(m => (
                  <button key={m} type="button" onClick={() => { setMode(m); setError(''); }}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      mode === m ? 'bg-violet-500 text-white shadow-lg' : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    {m === 'login' ? 'Вход' : 'Регистрация'}
                  </button>
                ))}
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <span className="text-sm text-red-400">{error}</span>
                </motion.div>
              )}

              <div className="space-y-4">
                {mode === 'register' && (
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Имя" className={inputClass} />
                )}
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className={inputClass} />
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                    placeholder="Пароль"
                    className={`${inputClass} pr-12`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors ${isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-600'}`}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex justify-center py-2">
                  <Turnstile
                    siteKey={TURNSTILE_SITE_KEY}
                    onSuccess={t => setTurnstileToken(t)}
                    onError={() => setTurnstileToken('')}
                    onExpire={() => setTurnstileToken('')}
                    options={{ theme: isDark ? 'dark' : 'light', size: 'flexible' }}
                  />
                </div>

                <motion.button
                  type="button"
                  disabled={isLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleSubmit}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium text-sm shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Продолжить</span>}
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 'verify' && (
            <motion.div key="verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-5 ${isDark ? 'bg-violet-500/10 border border-violet-500/20' : 'bg-violet-50 border border-violet-200'}`}>
                <Shield className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-violet-400' : 'text-violet-500'}`} />
                <p className={`text-xs ${isDark ? 'text-violet-300' : 'text-violet-700'}`}>
                  Код отправлен на <span className="font-semibold">{email}</span>
                </p>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <span className="text-sm text-red-400">{error}</span>
                </motion.div>
              )}

              <div className="mb-6">
                <CodeInput code={code} setCode={setCode} isDark={isDark} />
              </div>

              <motion.button
                type="button"
                disabled={isLoading || code.length !== 6}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleVerify}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium text-sm shadow-xl shadow-violet-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-4"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : pendingAction === 'login' ? 'Войти' : 'Зарегистрироваться'}
              </motion.button>

              <div className="flex items-center justify-between">
                <button type="button" onClick={() => { setStep('form'); setCode(''); setError(''); }} className={`text-sm ${isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-600'} transition-colors`}>
                  ← Назад
                </button>
                <button type="button" onClick={handleResend} disabled={countdown > 0 || isLoading}
                  className={`text-sm transition-colors ${countdown > 0 ? isDark ? 'text-zinc-600 cursor-not-allowed' : 'text-zinc-400 cursor-not-allowed' : 'text-violet-400 hover:text-violet-300'}`}
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
