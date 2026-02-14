import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Plus, LogOut, Loader2, Camera, Sun, Moon, Trash2, Shield, FileText, Cookie, ExternalLink } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useState, useRef, useEffect } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

const TURNSTILE_SITE_KEY = '0x4AAAAAACa5EobYKh_TrmuZ';
const DISCORD_URL = 'https://discord.gg/qjnyAr7YXe';

type ModalType = 'terms' | 'privacy' | 'cookies' | 'profile' | 'auth' | null;

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
      { type: 'section', title: '2. Хранение', text: 'Данные в защищённой базе Supabase. Локальный кеш в браузере для быстродействия.' },
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
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

export function Sidebar() {
  const { chats, currentChatId, sidebarOpen, toggleSidebar, setCurrentChat, deleteChat, createNewChat } = useChatStore();
  const { user, isAuthenticated, logout, updateAvatar } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

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

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return 'Сегодня';
    if (diff < 172800000) return 'Вчера';
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  // Группировка чатов по дате
  const groupedChats = chats.reduce<Record<string, typeof chats>>((acc, chat) => {
    const label = formatDate(chat.updatedAt);
    if (!acc[label]) acc[label] = [];
    acc[label].push(chat);
    return acc;
  }, {});

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          {/* Оверлей */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Сайдбар */}
          <motion.aside
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className={`fixed left-0 top-0 bottom-0 w-[280px] sm:w-[300px] z-50 flex flex-col border-r ${
              isDark
                ? 'bg-[#0a0a0f]/95 backdrop-blur-xl border-white/5'
                : 'bg-white/95 backdrop-blur-xl border-zinc-200'
            }`}
          >
            {/* Шапка */}
            <div className={`flex items-center justify-between px-4 py-3.5 border-b ${isDark ? 'border-white/5' : 'border-zinc-100'}`}>
              <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                MoSeek
              </h2>
              <div className="flex items-center gap-0.5">
                <motion.a
                  href={DISCORD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-zinc-100'}`}
                  title="Discord"
                >
                  <DiscordIcon className="w-[18px] h-[18px] text-[#5865F2]" />
                </motion.a>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleTheme}
                  className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-zinc-100'}`}
                  title={isDark ? 'Светлая тема' : 'Тёмная тема'}
                >
                  {isDark
                    ? <Sun className="w-[18px] h-[18px] text-amber-400" />
                    : <Moon className="w-[18px] h-[18px] text-violet-500" />
                  }
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleSidebar}
                  className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-zinc-100'}`}
                >
                  <X className={`w-[18px] h-[18px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
                </motion.button>
              </div>
            </div>

            {/* Кнопка нового чата */}
            <div className="px-3 py-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNewChat}
                className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  isDark
                    ? 'bg-violet-500/15 border border-violet-500/25 text-violet-300 hover:bg-violet-500/25 hover:border-violet-500/40'
                    : 'bg-violet-50 border border-violet-200 text-violet-600 hover:bg-violet-100 hover:border-violet-300'
                }`}
              >
                <Plus className="w-4.5 h-4.5" />
                <span>Новый чат</span>
              </motion.button>
            </div>

            {/* Список чатов */}
            <div className="flex-1 overflow-y-auto px-3 pb-2">
              {chats.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${
                    isDark ? 'bg-white/5' : 'bg-zinc-100'
                  }`}>
                    <MessageSquare className={`w-6 h-6 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`} />
                  </div>
                  <p className={`text-sm font-medium mb-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Нет чатов</p>
                  <p className={`text-xs text-center ${isDark ? 'text-zinc-700' : 'text-zinc-400'}`}>
                    Начни новый диалог
                  </p>
                </div>
              ) : (
                Object.entries(groupedChats).map(([dateLabel, dateChats]) => (
                  <div key={dateLabel} className="mb-2">
                    <p className={`text-[10px] font-semibold uppercase tracking-wider px-3 py-2 ${
                      isDark ? 'text-zinc-600' : 'text-zinc-400'
                    }`}>
                      {dateLabel}
                    </p>
                    <div className="space-y-0.5">
                      {dateChats.map((chat) => {
                        const isActive = currentChatId === chat.id;
                        return (
                          <motion.div
                            key={chat.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`group relative rounded-xl transition-all ${
                              isActive
                                ? isDark ? 'bg-violet-500/15 border border-violet-500/25' : 'bg-violet-50 border border-violet-200'
                                : isDark ? 'hover:bg-white/5 border border-transparent' : 'hover:bg-zinc-50 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center">
                              <button
                                onClick={() => { setCurrentChat(chat.id); toggleSidebar(); }}
                                className="flex-1 min-w-0 text-left px-3 py-2.5"
                              >
                                <div className="flex items-center gap-2">
                                  <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${
                                    isActive
                                      ? isDark ? 'text-violet-400' : 'text-violet-500'
                                      : isDark ? 'text-zinc-600' : 'text-zinc-400'
                                  }`} />
                                  <p className={`text-[13px] truncate max-w-[160px] ${
                                    isActive
                                      ? isDark ? 'text-white font-medium' : 'text-zinc-900 font-medium'
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
                                className={`flex-shrink-0 p-1.5 mr-1.5 rounded-lg transition-all ${
                                  isDark ? 'hover:bg-red-500/20' : 'hover:bg-red-50'
                                } ${isTouchDevice ? 'opacity-70' : 'opacity-0 group-hover:opacity-70'}`}
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                              </motion.button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Нижняя панель */}
            <div className={`border-t px-4 py-3 ${isDark ? 'border-white/5' : 'border-zinc-100'}`}>
              {isAuthenticated ? (
                <div
                  onClick={() => setActiveModal('profile')}
                  className={`flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer mb-3 transition-colors ${
                    isDark ? 'hover:bg-white/5' : 'hover:bg-zinc-50'
                  }`}
                >
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className={`w-9 h-9 rounded-xl flex-shrink-0 object-cover border-2 ${
                      isDark ? 'border-violet-500/30' : 'border-violet-300'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>{user?.name}</p>
                    <p className={`text-[11px] truncate ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{user?.email}</p>
                  </div>
                </div>
              ) : (
                <div className="mb-3">
                  <div className="flex items-center gap-3 px-2 py-2 mb-2">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isDark ? 'bg-zinc-800 border border-white/5' : 'bg-zinc-100 border border-zinc-200'
                    }`}>
                      <span className="text-sm">👤</span>
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
                        ? 'bg-violet-500/15 border border-violet-500/25 text-violet-300 hover:bg-violet-500/25'
                        : 'bg-violet-50 border border-violet-200 text-violet-600 hover:bg-violet-100'
                    }`}
                  >
                    Войти / Регистрация
                  </motion.button>
                </div>
              )}

              {/* Ссылки */}
              <div className="flex items-center justify-center gap-2 text-[10px] flex-wrap">
                {[
                  { key: 'terms' as const, label: 'Условия', icon: FileText },
                  { key: 'privacy' as const, label: 'Приватность', icon: Shield },
                  { key: 'cookies' as const, label: 'Cookie', icon: Cookie },
                ].map((item, i) => (
                  <span key={item.key} className="flex items-center gap-1">
                    {i > 0 && <span className={isDark ? 'text-zinc-800' : 'text-zinc-300'}>·</span>}
                    <button
                      onClick={() => setActiveModal(item.key)}
                      className={`transition-colors ${isDark ? 'text-zinc-600 hover:text-violet-400' : 'text-zinc-400 hover:text-violet-500'}`}
                    >
                      {item.label}
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </motion.aside>
        </>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />

      {/* Модалка профиля */}
      <AnimatePresence>
        {activeModal === 'profile' && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveModal(null)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] max-w-[calc(100vw-32px)] rounded-2xl z-[70] overflow-hidden border ${
                isDark ? 'bg-[#0f0f15] border-white/10' : 'bg-white border-zinc-200'
              }`}
            >
              <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-white/5' : 'border-zinc-100'}`}>
                <h2 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Профиль</h2>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setActiveModal(null)} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-zinc-100'}`}>
                  <X className={`w-4 h-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
                </motion.button>
              </div>
              <div className="px-5 py-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative group flex-shrink-0">
                    <img src={user?.avatar} alt={user?.name} className={`w-16 h-16 rounded-2xl object-cover border-2 ${isDark ? 'border-violet-500/30' : 'border-violet-300'}`} />
                    <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  <div className="min-w-0">
                    <p className={`text-base font-semibold truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>{user?.name}</p>
                    <p className={`text-xs truncate ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{user?.email}</p>
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

      {/* Модалка авторизации */}
      <AnimatePresence>
        {activeModal === 'auth' && <AuthModal onClose={() => setActiveModal(null)} isDark={isDark} />}
      </AnimatePresence>

      {/* Модалки документов */}
      <AnimatePresence>
        {activeModal && activeModal !== 'profile' && activeModal !== 'auth' && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveModal(null)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] max-w-[calc(100vw-32px)] max-h-[80vh] rounded-2xl z-[70] flex flex-col overflow-hidden border ${
                isDark ? 'bg-[#0f0f15] border-white/10' : 'bg-white border-zinc-200'
              }`}
            >
              <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-white/5' : 'border-zinc-100'}`}>
                <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{MODAL_CONTENT[activeModal].title}</h2>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setActiveModal(null)} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-zinc-100'}`}>
                  <X className={`w-4 h-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
                </motion.button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-5">
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
                        <h3 className={`text-[13px] font-semibold mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{block.title}</h3>
                        <p className={`text-[12px] leading-[1.7] ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{block.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className={`px-5 py-4 border-t ${isDark ? 'border-white/5' : 'border-zinc-100'}`}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveModal(null)}
                  className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
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

// ==========================================
// AuthModal
// ==========================================
type AuthStep = 'form' | 'verify';

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
  const [turnstileComplete, setTurnstileComplete] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const codeInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const turnstileRef = useRef<any>(null);

  const { register, login, sendVerificationCode, verifyCode } = useAuthStore();

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleSubmit = async () => {
    setError('');
    if (!email.trim()) { setError('Введи email'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Некорректный email'); return; }

    if (mode === 'register') {
      if (!name.trim() || name.trim().length < 2) { setError('Имя слишком короткое'); return; }
      if (!password || password.length < 6) { setError('Пароль минимум 6 символов'); return; }
      const DOMAINS = ['gmail.com','yahoo.com','outlook.com','hotmail.com','mail.ru','yandex.ru','ya.ru','icloud.com','protonmail.com','proton.me','bk.ru','inbox.ru','list.ru','rambler.ru','live.com','aol.com','zoho.com','gmx.com','tutanota.com','fastmail.com','me.com','mac.com','msn.com','qq.com','163.com','ukr.net','i.ua','meta.ua','email.ua','bigmir.net'];
      const domain = email.split('@')[1]?.toLowerCase();
      if (!domain || !DOMAINS.includes(domain)) { setError('Используй настоящий email'); return; }
    } else {
      if (!password) { setError('Введи пароль'); return; }
    }

    if (!turnstileComplete) { setError('Пройди проверку безопасности'); return; }

    setIsLoading(true);

    if (mode === 'login') {
      try {
        const res = await login(email, password);
        if (!res.success) { setError(res.error || 'Ошибка входа'); setIsLoading(false); return; }
        setIsLoading(false);
        onClose();
      } catch { setError('Ошибка сети'); setIsLoading(false); }
      return;
    }

    try {
      const res = await sendVerificationCode(email, turnstileToken);
      if (res.success) { setStep('verify'); setCountdown(60); setCode(''); setError(''); setTimeout(() => codeInputsRef.current[0]?.focus(), 100); }
      else setError(res.error || 'Ошибка отправки кода');
    } catch { setError('Ошибка сети'); }
    setIsLoading(false);
  };

  const handleVerify = async () => {
    setError('');
    if (code.length !== 6) { setError('Введи 6-значный код'); return; }
    setIsLoading(true);
    try {
      const v = await verifyCode(email, code);
      if (!v.success) { setError(v.error || 'Неверный код'); setIsLoading(false); return; }
      const r = await register(name, email, password);
      if (!r.success) { setError(r.error || 'Ошибка регистрации'); setIsLoading(false); return; }
      setIsLoading(false);
      onClose();
    } catch { setError('Ошибка сети'); setIsLoading(false); }
  };

  const handleCodeChange = (i: number, v: string) => {
    if (v.length > 1) v = v[v.length - 1];
    if (!/^\d*$/.test(v)) return;
    const arr = code.split('');
    while (arr.length < 6) arr.push('');
    arr[i] = v;
    setCode(arr.join('').slice(0, 6));
    if (v && i < 5) codeInputsRef.current[i + 1]?.focus();
  };

  const handleCodeKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) codeInputsRef.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    setCode(p);
    codeInputsRef.current[Math.min(p.length, 5)]?.focus();
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

  const inputClass = `w-full h-12 px-4 rounded-xl text-sm focus:outline-none transition-all ${
    isDark
      ? 'bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-violet-500/50 focus:bg-white/10'
      : 'bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-violet-400 focus:bg-white'
  }`;

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] max-w-[calc(100vw-32px)] rounded-2xl z-[70] overflow-hidden border ${
          isDark ? 'bg-[#0f0f15] border-white/10' : 'bg-white border-zinc-200'
        }`}
      >
        {/* Заголовок */}
        <div className={`p-6 text-center border-b ${isDark ? 'border-white/5' : 'border-zinc-100'}`}>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-violet-500/20">
            <span className="text-white text-lg font-bold">M</span>
          </div>
          <h2 className={`text-xl font-bold mb-0.5 ${isDark ? 'text-white' : 'text-zinc-900'}`}>MoSeek</h2>
          <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {step === 'verify' ? `Код отправлен на ${email}` : mode === 'login' ? 'Войди в аккаунт' : 'Создай аккаунт'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
              {/* Табы */}
              <div className={`flex rounded-xl p-1 mb-5 ${isDark ? 'bg-white/5' : 'bg-zinc-100'}`}>
                {(['login', 'register'] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setMode(m); setError(''); }}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      mode === m
                        ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20'
                        : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
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

              <div className="space-y-3">
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
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-600'}`}>
                    <span className="text-lg">{showPassword ? '🙈' : '👁'}</span>
                  </button>
                </div>

                {!turnstileComplete ? (
                  <div className="flex justify-center py-1">
                    <Turnstile ref={turnstileRef} siteKey={TURNSTILE_SITE_KEY}
                      onSuccess={t => { setTurnstileToken(t); setTurnstileComplete(true); }}
                      onError={() => { setTurnstileToken(''); setTurnstileComplete(false); }}
                      onExpire={() => { setTurnstileToken(''); setTurnstileComplete(false); }}
                      options={{ theme: isDark ? 'dark' : 'light', size: 'flexible' }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 py-2">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
                      <span className="text-green-400 text-xs">✓</span>
                    </div>
                    <span className="text-xs text-green-500">Проверка пройдена</span>
                  </div>
                )}

                <motion.button
                  type="button" disabled={isLoading}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
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
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <span className="text-sm text-red-400">{error}</span>
                </motion.div>
              )}

              <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <input
                    key={i}
                    ref={el => { codeInputsRef.current[i] = el; }}
                    type="text" inputMode="numeric" maxLength={1}
                    value={code[i] || ''}
                    onChange={e => handleCodeChange(i, e.target.value)}
                    onKeyDown={e => handleCodeKey(i, e)}
                    className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl focus:outline-none transition-all ${
                      isDark
                        ? 'bg-white/5 border border-white/10 text-white focus:border-violet-500 focus:bg-white/10'
                        : 'bg-zinc-50 border border-zinc-200 text-zinc-900 focus:border-violet-400 focus:bg-white'
                    }`}
                  />
                ))}
              </div>

              <motion.button
                type="button" disabled={isLoading || code.length !== 6}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={handleVerify}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium text-sm shadow-xl shadow-violet-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-4"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Подтвердить'}
              </motion.button>

              <div className="flex items-center justify-between">
                <button type="button" onClick={() => { setStep('form'); setCode(''); setError(''); }} className={`text-sm transition-colors ${isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-600'}`}>
                  ← Назад
                </button>
                <button type="button" onClick={handleResend} disabled={countdown > 0 || isLoading}
                  className={`text-sm transition-colors ${countdown > 0 ? isDark ? 'text-zinc-600' : 'text-zinc-400' : 'text-violet-400 hover:text-violet-300'} ${countdown > 0 ? 'cursor-not-allowed' : ''}`}
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
