import { motion, AnimatePresence } from 'framer-motion';
import {
  X, MessageSquare, Plus, LogOut, Loader2, Camera, Sun, Moon,
  Trash2, ChevronDown, Pencil, Lock, AlertTriangle, Check,
  ArrowLeft, Shield, Eye, EyeOff, HelpCircle, Archive, ArchiveRestore,
  Coffee, Sparkles, Settings, User
} from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

const TURNSTILE_SITE_KEY = '0x4AAAAAACa5EobYKh_TrmuZ';
const DISCORD_URL = 'https://discord.gg/qjnyAr7YXe';

type ModalType = 'terms' | 'privacy' | 'cookies' | 'profile' | 'auth' | 'about' | null;
type ProfileView = 'main' | 'changePassword' | 'deleteAccount' | 'deleteVerify';
type AuthStep = 'form' | 'verify';

const VALID_EMAIL_DOMAINS = ['gmail.com','yahoo.com','outlook.com','hotmail.com','mail.ru','yandex.ru','ya.ru','icloud.com','protonmail.com','proton.me','bk.ru','inbox.ru','list.ru','rambler.ru','live.com','aol.com','zoho.com','gmx.com','tutanota.com','fastmail.com','me.com','mac.com','msn.com','qq.com','163.com','ukr.net','i.ua','meta.ua','email.ua','bigmir.net'];

const MODAL_CONTENT: Record<'terms'|'privacy'|'cookies', { title: string; content: Array<{ type: string; title?: string; text: string }> }> = {
  terms: { title: 'Условия использования', content: [
    { type: 'meta', text: 'Последнее обновление: январь 2026' },
    { type: 'section', title: '1. Принятие условий', text: 'Используя MoSeek и MoGPT, вы принимаете настоящие условия. Если не согласны — прекратите использование.' },
    { type: 'section', title: '2. Сервис', text: 'MoSeek — AI-платформа. MoGPT — нейросеть от MoSeek. Генерация текста, код, ответы на вопросы, дизайн интерфейсов.' },
    { type: 'section', title: '3. Собственность', text: '"MoSeek", "MoGPT", логотипы, дизайн, код — интеллектуальная собственность MoSeek. Копирование запрещено.' },
    { type: 'important', text: 'Нарушение авторских прав влечёт ответственность по закону.' },
    { type: 'section', title: '4. Правила', text: 'Запрещено: вредоносный контент, взлом, массовые запросы, нарушение прав третьих лиц.' },
    { type: 'section', title: '5. Ответственность', text: 'Сервис «как есть». MoSeek не гарантирует бесперебойность и абсолютную точность.' },
    { type: 'copyright', text: '© 2026 MoSeek. Все права защищены.' },
  ]},
  privacy: { title: 'Конфиденциальность', content: [
    { type: 'meta', text: 'Последнее обновление: январь 2026' },
    { type: 'section', title: '1. Какие данные мы храним', text: 'Имя пользователя, email-адрес и хеш пароля (SHA-256). Чаты синхронизируются в зашифрованном облачном хранилище между вашими устройствами.' },
    { type: 'section', title: '2. Как мы защищаем данные', text: 'Все данные хранятся в защищённой базе данных с шифрованием на уровне сервера. Пароли никогда не хранятся в открытом виде — только криптографические хеши.' },
    { type: 'important', text: 'Мы НЕ собираем: геолокацию, IP-адреса для слежки, биометрические данные, финансовую информацию. Мы НЕ продаём и НЕ передаём ваши данные третьим лицам.' },
    { type: 'section', title: '3. Безопасность хранения', text: 'База данных размещена на защищённых серверах с SSL/TLS шифрованием. Все соединения зашифрованы. Резервные копии создаются автоматически и также зашифрованы.' },
    { type: 'section', title: '4. Локальное хранение', text: 'На вашем устройстве в localStorage хранятся только: настройки темы, кеш текущей сессии и токен авторизации.' },
    { type: 'section', title: '5. Ваши права', text: 'Вы можете в любой момент: удалить свой аккаунт и все связанные данные, запросить экспорт данных, отозвать согласие на обработку.' },
    { type: 'copyright', text: '© 2026 MoSeek. Ваши данные под надёжной защитой.' },
  ]},
  cookies: { title: 'Политика хранения данных', content: [
    { type: 'meta', text: 'Последнее обновление: январь 2026' },
    { type: 'section', title: '1. Что мы храним локально', text: 'Настройки интерфейса (тема, язык), кеш текущих чатов для быстрой загрузки и токен авторизации для автоматического входа.' },
    { type: 'important', text: 'Мы не используем рекламные Cookie, трекеры, fingerprinting или любые другие технологии отслеживания.' },
    { type: 'section', title: '2. Управление данными', text: 'Очистка localStorage в браузере удалит локальный кеш и настройки. Ваши чаты и данные аккаунта в облаке сохранятся.' },
    { type: 'section', title: '3. Сторонние сервисы', text: 'Cloudflare Turnstile для защиты от ботов. EmailJS для отправки кодов подтверждения.' },
    { type: 'copyright', text: '© 2026 MoSeek. Ваши данные — ваша собственность.' },
  ]}
};

const ABOUT_CONTENT = { title: 'О MoGPT', content: [
  { type: 'section', title: 'Что такое MoGPT?', text: 'MoGPT — это нейросеть, разработанная командой MoSeek. Она способна генерировать текст, писать код, отвечать на вопросы, помогать с дизайном и решать творческие задачи.' },
  { type: 'section', title: 'Возможности', text: '• Генерация текста на любую тему\n• Написание и отладка кода на 50+ языках\n• Ответы на вопросы с контекстом беседы\n• Помощь с переводами и редактированием\n• Дизайн интерфейсов и креативные задачи\n• Запоминание контекста диалога' },
  { type: 'section', title: 'Как это работает?', text: 'MoGPT обрабатывает ваши сообщения, анализирует контекст беседы и генерирует релевантные ответы. Каждый чат — это отдельный диалог со своим контекстом.' },
  { type: 'important', text: 'MoGPT — это инструмент-помощник. Всегда проверяйте важную информацию из независимых источников.' },
  { type: 'section', title: 'Безлимитный доступ', text: 'MoGPT доступен бесплатно и без ограничений. Регистрация даёт синхронизацию чатов между устройствами.' },
  { type: 'copyright', text: '© 2026 MoSeek. Создано с ❤️' },
]};

const d = (isDark: boolean, dark: string, light: string) => isDark ? dark : light;

const cls = {
  overlay: 'fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]',
  modal: (isDark: boolean, w = 'w-[420px]') =>
    `fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${w} max-w-[calc(100vw-32px)] max-h-[90vh] rounded-2xl z-[70] overflow-hidden border flex flex-col shadow-2xl ${
      d(isDark, 'bg-[#0d0a08] border-amber-900/20 shadow-black/50', 'bg-white border-amber-200/50 shadow-amber-900/10')
    }`,
  headerBar: (isDark: boolean) =>
    `flex items-center justify-between px-5 py-4 border-b ${d(isDark, 'border-amber-900/15', 'border-amber-100')}`,
  headerBarBack: (isDark: boolean) =>
    `flex items-center gap-3 px-5 py-4 border-b ${d(isDark, 'border-amber-900/15', 'border-amber-100')}`,
  title: (isDark: boolean) =>
    `text-[15px] font-bold ${d(isDark, 'text-amber-50', 'text-amber-900')}`,
  closeBtn: (isDark: boolean) =>
    `p-1.5 rounded-lg transition-colors ${d(isDark, 'hover:bg-amber-500/10', 'hover:bg-amber-100')}`,
  closeIcon: (isDark: boolean) =>
    `w-4 h-4 ${d(isDark, 'text-amber-600', 'text-amber-400')}`,
  input: (isDark: boolean) =>
    `w-full h-12 px-4 rounded-xl text-sm focus:outline-none transition-all ${
      d(isDark,
        'bg-amber-950/30 border border-amber-800/20 text-amber-50 placeholder-amber-700 focus:border-amber-600/50 focus:bg-amber-950/50',
        'bg-amber-50 border border-amber-200 text-amber-900 placeholder-amber-400 focus:border-amber-400 focus:bg-white'
      )}`,
  accentBtn: (isDark: boolean) =>
    `w-full py-3 rounded-xl text-sm font-semibold transition-all ${
      d(isDark,
        'bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/25 text-amber-300 hover:from-amber-600/30 hover:to-orange-600/30',
        'bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300 text-amber-700 hover:from-amber-200 hover:to-orange-200'
      )}`,
  gradBtn: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm shadow-lg shadow-amber-500/25 disabled:opacity-50',
  gradBtnRed: 'bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold text-sm shadow-lg shadow-red-500/20 disabled:opacity-50',
  errBox: (isDark: boolean) =>
    `mb-4 px-4 py-3 rounded-xl ${d(isDark, 'bg-red-500/10 border border-red-500/20', 'bg-red-50 border border-red-200')}`,
  okBox: (isDark: boolean) =>
    `mb-4 px-4 py-3 rounded-xl ${d(isDark, 'bg-emerald-500/10 border border-emerald-500/20', 'bg-emerald-50 border border-emerald-200')}`,
  importantBox: (isDark: boolean) =>
    `px-4 py-3 rounded-xl ${d(isDark, 'bg-amber-500/10 border border-amber-500/20', 'bg-amber-50 border border-amber-200')}`,
  cardBtn: (isDark: boolean) =>
    `w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-left ${
      d(isDark, 'bg-amber-950/20 hover:bg-amber-900/30 border border-amber-800/15', 'bg-amber-50 hover:bg-amber-100 border border-amber-100')
    }`,
  footerBorder: (isDark: boolean) =>
    `px-6 py-4 border-t ${d(isDark, 'border-amber-900/15', 'border-amber-100')}`,
  text1: (isDark: boolean) => d(isDark, 'text-amber-50', 'text-amber-900'),
  text2: (isDark: boolean) => d(isDark, 'text-amber-300', 'text-amber-700'),
  text3: (isDark: boolean) => d(isDark, 'text-amber-500', 'text-amber-500'),
  text4: (isDark: boolean) => d(isDark, 'text-amber-700', 'text-amber-300'),
  accent: (isDark: boolean) => d(isDark, 'text-amber-400', 'text-amber-600'),
  accentHover: (isDark: boolean) => d(isDark, 'hover:text-amber-300', 'hover:text-amber-700'),
  hoverBg: (isDark: boolean) => d(isDark, 'hover:bg-amber-900/20', 'hover:bg-amber-50'),
  surface: (isDark: boolean) => d(isDark, 'bg-amber-950/30', 'bg-amber-50'),
  border: (isDark: boolean) => d(isDark, 'border-amber-800/20', 'border-amber-200'),
  borderLight: (isDark: boolean) => d(isDark, 'border-amber-900/15', 'border-amber-100'),
};

function DiscordIcon({ className }: { className?: string }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>);
}

function CodeInput({ code, setCode, isDark, autoFocus = true }: { code: string; setCode: (v: string) => void; isDark: boolean; autoFocus?: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => { if (autoFocus) setTimeout(() => refs.current[0]?.focus(), 100); }, [autoFocus]);
  const hc = (i: number, v: string) => { if(v.length>1)v=v[v.length-1]; if(!/^\d*$/.test(v))return; const a=code.split(''); while(a.length<6)a.push(''); a[i]=v; setCode(a.join('').slice(0,6)); if(v&&i<5)refs.current[i+1]?.focus(); };
  const hk = (i: number, e: React.KeyboardEvent) => { if(e.key==='Backspace'&&!code[i]&&i>0)refs.current[i-1]?.focus(); };
  const hp = (e: React.ClipboardEvent) => { e.preventDefault(); const p=e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6); setCode(p); refs.current[Math.min(p.length,5)]?.focus(); };
  return (
    <div className="flex justify-center gap-2" onPaste={hp}>
      {Array.from({length:6}).map((_,i)=>(
        <input key={i} ref={el=>{refs.current[i]=el;}} type="text" inputMode="numeric" maxLength={1} value={code[i]||''}
          onChange={e=>hc(i,e.target.value)} onKeyDown={e=>hk(i,e)}
          className={`w-11 h-13 text-center text-xl font-bold rounded-xl focus:outline-none transition-all ${
            d(isDark,
              'bg-amber-950/30 border border-amber-800/20 text-amber-50 focus:border-amber-500/50 focus:bg-amber-950/50',
              'bg-amber-50 border border-amber-200 text-amber-900 focus:border-amber-400 focus:bg-white'
            )}`}/>
      ))}
    </div>
  );
}

function PasswordField({ value, onChange, placeholder, show, toggle, onKeyDown, isDark }: {
  value: string; onChange: (v: string) => void; placeholder: string; show: boolean; toggle: () => void; onKeyDown?: (e: React.KeyboardEvent) => void; isDark: boolean;
}) {
  return (
    <div className="relative">
      <input type={show?'text':'password'} value={value} onChange={e=>onChange(e.target.value)} onKeyDown={onKeyDown}
        placeholder={placeholder} className={`${cls.input(isDark)} pr-12`}/>
      <button type="button" onClick={toggle}
        className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${d(isDark,'text-amber-600 hover:text-amber-400','text-amber-400 hover:text-amber-600')}`}>
        {show?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
      </button>
    </div>
  );
}

export function Sidebar() {
  const { currentChatId, sidebarOpen, toggleSidebar, setCurrentChat, deleteChat, createNewChat, getActiveChats, getArchivedChats, unarchiveChat } = useChatStore();
  const { user, isAuthenticated, logout, updateAvatar } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [showArchive, setShowArchive] = useState(false);

  const activeChats = getActiveChats();
  const archivedChats = getArchivedChats();

  useEffect(() => {
    const check = () => setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches);
    check(); window.addEventListener('resize', check); return () => window.removeEventListener('resize', check);
  }, []);

  const handleNewChat = () => { const id = createNewChat(); if (id) setCurrentChat(id); toggleSidebar(); };
  const handleDeleteChat = (chatId: string) => {
    const idx = activeChats.findIndex(c => c.id === chatId);
    const remaining = activeChats.filter(c => c.id !== chatId);
    deleteChat(chatId);
    if (currentChatId === chatId && remaining.length > 0) setCurrentChat(remaining[Math.min(idx, remaining.length - 1)].id);
  };
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || file.size > 2*1024*1024) return;
    const reader = new FileReader();
    reader.onload = (ev) => { const r = ev.target?.result as string; if (r) updateAvatar(r); };
    reader.readAsDataURL(file); e.target.value = '';
  };

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.2}}
            onClick={toggleSidebar} className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"/>

          <motion.aside initial={{x:-300,opacity:0}} animate={{x:0,opacity:1}} exit={{x:-300,opacity:0}}
            transition={{type:'spring',damping:28,stiffness:350}}
            className={`fixed left-0 top-0 bottom-0 w-[280px] z-50 flex flex-col ${
              d(isDark,
                'bg-gradient-to-b from-[#0d0a08] via-[#0a0806] to-[#080604] border-r border-amber-900/15',
                'bg-gradient-to-b from-white via-amber-50/30 to-white border-r border-amber-200/50'
              )
            }`}>

            <div className={`px-4 py-4 border-b ${d(isDark, 'border-amber-900/15', 'border-amber-100')}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    d(isDark, 'bg-gradient-to-br from-amber-500/20 to-orange-600/20', 'bg-gradient-to-br from-amber-100 to-orange-100')
                  }`}>
                    <Coffee className={`w-4 h-4 ${d(isDark, 'text-amber-400', 'text-amber-600')}`}/>
                  </div>
                  <span className={`text-base font-bold tracking-tight ${d(isDark, 'text-amber-50', 'text-amber-900')}`}>MoGPT</span>
                </div>
                <motion.button whileHover={{scale:1.1,rotate:90}} whileTap={{scale:0.9}} onClick={toggleSidebar}
                  className={`p-2 rounded-lg transition-colors ${d(isDark, 'hover:bg-amber-900/30 text-amber-500', 'hover:bg-amber-100 text-amber-400')}`}>
                  <X className="w-4 h-4"/>
                </motion.button>
              </div>

              <div className="flex items-center gap-2">
                <motion.a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" whileHover={{scale:1.05}} whileTap={{scale:0.95}}
                  className={`flex-1 h-9 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    d(isDark, 'bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/20', 'bg-[#5865F2]/5 hover:bg-[#5865F2]/10 border border-[#5865F2]/15')
                  }`}>
                  <DiscordIcon className="w-3.5 h-3.5 text-[#5865F2]"/>
                  <span className="text-xs font-medium text-[#5865F2]">Discord</span>
                </motion.a>
                <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={toggleTheme}
                  className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all ${
                    d(isDark, 'bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20', 'bg-amber-100 hover:bg-amber-200 border border-amber-200')
                  }`}>
                  {isDark?<Sun className="w-4 h-4 text-amber-400"/>:<Moon className="w-4 h-4 text-amber-600"/>}
                </motion.button>
                <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={()=>setActiveModal('about')}
                  className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all ${
                    d(isDark, 'bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20', 'bg-amber-100 hover:bg-amber-200 border border-amber-200')
                  }`}>
                  <HelpCircle className={`w-4 h-4 ${d(isDark, 'text-amber-400', 'text-amber-600')}`}/>
                </motion.button>
              </div>
            </div>

            <div className="px-3 py-3">
              <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} onClick={handleNewChat}
                className={`w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  d(isDark,
                    'bg-gradient-to-r from-amber-500/15 to-orange-500/15 hover:from-amber-500/25 hover:to-orange-500/25 border border-amber-500/25 text-amber-300',
                    'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/20'
                  )}`}>
                <Sparkles className="w-4 h-4"/>
                <span>Новый чат</span>
              </motion.button>
            </div>

            {archivedChats.length>0 && (
              <div className="px-3 pb-2">
                <button onClick={()=>setShowArchive(!showArchive)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${cls.hoverBg(isDark)}`}>
                  <Archive className={`w-3.5 h-3.5 ${cls.text3(isDark)}`}/>
                  <span className={`text-xs font-medium flex-1 text-left ${cls.text2(isDark)}`}>Архив</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${d(isDark,'bg-amber-900/30 text-amber-500','bg-amber-100 text-amber-600')}`}>{archivedChats.length}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${cls.text4(isDark)} ${showArchive?'rotate-180':''}`}/>
                </button>
                <AnimatePresence>
                  {showArchive && (
                    <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.2}} className="overflow-hidden">
                      <div className="space-y-1 pt-1 pb-1">
                        {archivedChats.map((chat)=>{
                          const isActive=currentChatId===chat.id;
                          return (
                            <motion.div key={chat.id} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}}
                              className={`group relative rounded-lg transition-all cursor-pointer ${
                                isActive
                                  ? d(isDark,'bg-amber-500/15 border border-amber-500/25','bg-amber-100 border border-amber-200')
                                  : `${cls.hoverBg(isDark)} border border-transparent`
                              }`}>
                              <div className="flex items-center">
                                <button onClick={()=>{setCurrentChat(chat.id);toggleSidebar();}} className="flex-1 min-w-0 text-left px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    <Archive className={`w-3 h-3 flex-shrink-0 ${isActive?cls.accent(isDark):cls.text4(isDark)}`}/>
                                    <p className={`text-xs truncate max-w-[110px] ${isActive?cls.text1(isDark):cls.text3(isDark)}`}>{chat.title}</p>
                                  </div>
                                </button>
                                <div className={`flex items-center mr-1 ${isTouchDevice?'opacity-100':'opacity-0 group-hover:opacity-100'} transition-all`}>
                                  <motion.button whileHover={{scale:1.1}} whileTap={{scale:0.9}}
                                    onClick={(e)=>{e.stopPropagation();unarchiveChat(chat.id);}}
                                    className={`p-1.5 rounded-md ${d(isDark,'hover:bg-amber-500/20','hover:bg-amber-100')}`} title="Восстановить">
                                    <ArchiveRestore className={`w-3 h-3 ${cls.accent(isDark)}`}/>
                                  </motion.button>
                                  <motion.button whileHover={{scale:1.1}} whileTap={{scale:0.9}}
                                    onClick={(e)=>{e.stopPropagation();deleteChat(chat.id);}}
                                    className={`p-1.5 rounded-md ${d(isDark,'hover:bg-red-500/20','hover:bg-red-50')}`} title="Удалить">
                                    <Trash2 className="w-3 h-3 text-red-400"/>
                                  </motion.button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className={`mx-3 mb-2 flex items-center gap-2 ${activeChats.length>0?'':'hidden'}`}>
              <div className={`flex-1 h-px ${d(isDark,'bg-amber-900/20','bg-amber-200/50')}`}/>
              <span className={`text-[10px] font-medium uppercase tracking-wider ${cls.text4(isDark)}`}>Чаты</span>
              <div className={`flex-1 h-px ${d(isDark,'bg-amber-900/20','bg-amber-200/50')}`}/>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
              {activeChats.length===0?(
                <div className="text-center py-12">
                  <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                    d(isDark,'bg-amber-900/20','bg-amber-100')
                  }`}>
                    <MessageSquare className={`w-6 h-6 ${cls.text4(isDark)}`}/>
                  </div>
                  <p className={`text-sm font-medium ${cls.text2(isDark)}`}>Нет чатов</p>
                  <p className={`text-xs mt-1 ${cls.text4(isDark)}`}>Начни новый диалог</p>
                </div>
              ):(
                activeChats.map((chat)=>{
                  const isActive=currentChatId===chat.id;
                  return (
                    <motion.div key={chat.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
                      className={`group relative rounded-xl transition-all cursor-pointer ${
                        isActive
                          ? d(isDark,'bg-gradient-to-r from-amber-500/15 to-orange-500/10 border border-amber-500/30','bg-gradient-to-r from-amber-100 to-orange-50 border border-amber-200')
                          : `${cls.hoverBg(isDark)} border border-transparent`
                      }`}>
                      <div className="flex items-center">
                        <button onClick={()=>{setCurrentChat(chat.id);toggleSidebar();}} className="flex-1 min-w-0 text-left px-3.5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isActive
                                ? d(isDark,'bg-amber-500/20','bg-amber-200')
                                : d(isDark,'bg-amber-900/20','bg-amber-100')
                            }`}>
                              <MessageSquare className={`w-3.5 h-3.5 ${isActive?cls.accent(isDark):cls.text3(isDark)}`}/>
                            </div>
                            <p className={`text-sm truncate max-w-[130px] font-medium ${isActive?cls.text1(isDark):cls.text2(isDark)}`}>{chat.title}</p>
                          </div>
                        </button>
                        <motion.button whileHover={{scale:1.1}} whileTap={{scale:0.9}}
                          onClick={(e)=>{e.stopPropagation();handleDeleteChat(chat.id);}}
                          className={`flex-shrink-0 p-2 mr-2 rounded-lg transition-all ${d(isDark,'hover:bg-red-500/20','hover:bg-red-50')} ${isTouchDevice?'opacity-100':'opacity-0 group-hover:opacity-100'}`}>
                          <Trash2 className="w-3.5 h-3.5 text-red-400"/>
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            <div className={`p-4 border-t ${d(isDark, 'border-amber-900/15 bg-gradient-to-t from-[#080604] to-transparent', 'border-amber-100 bg-gradient-to-t from-amber-50/50 to-transparent')}`}>
              {isAuthenticated?(
                <motion.div whileHover={{scale:1.01}} onClick={()=>setActiveModal('profile')}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer mb-3 transition-all ${
                    d(isDark, 'bg-amber-900/20 hover:bg-amber-900/30 border border-amber-800/20', 'bg-white hover:bg-amber-50 border border-amber-200 shadow-sm')
                  }`}>
                  <div className="relative">
                    <img src={user?.avatar} alt={user?.name} className={`w-10 h-10 rounded-xl flex-shrink-0 object-cover ring-2 ${d(isDark,'ring-amber-500/30','ring-amber-300')}`}/>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${d(isDark,'bg-emerald-500 border-[#0d0a08]','bg-emerald-500 border-white')}`}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${cls.text1(isDark)}`}>{user?.name}</p>
                    <p className={`text-[10px] truncate ${cls.text3(isDark)}`}>{user?.email}</p>
                  </div>
                  <Settings className={`w-4 h-4 ${cls.text4(isDark)}`}/>
                </motion.div>
              ):(
                <div className="mb-3">
                  <div className={`flex items-center gap-3 p-3 rounded-xl mb-3 ${
                    d(isDark, 'bg-amber-900/15 border border-amber-800/15', 'bg-amber-50 border border-amber-100')
                  }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      d(isDark,'bg-amber-900/30','bg-amber-100')
                    }`}>
                      <User className={`w-5 h-5 ${cls.text3(isDark)}`}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${cls.text2(isDark)}`}>Гость</p>
                      <p className={`text-[10px] ${cls.text4(isDark)}`}>Безлимитный доступ</p>
                    </div>
                  </div>
                  <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} onClick={()=>setActiveModal('auth')}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      d(isDark,
                        'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25',
                        'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25'
                      )
                    }`}>
                    Войти / Регистрация
                  </motion.button>
                </div>
              )}
              <div className="flex items-center justify-center gap-2 text-[9px]">
                {(['terms','privacy','cookies'] as const).map((k,i)=>(
                  <span key={k} className="contents">
                    {i>0&&<span className={cls.text4(isDark)}>•</span>}
                    <button onClick={()=>setActiveModal(k)} className={`transition-colors ${cls.text4(isDark)} ${cls.accentHover(isDark)}`}>
                      {k==='terms'?'Условия':k==='privacy'?'Приватность':'Данные'}
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </motion.aside>
        </>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden"/>
      <AnimatePresence>{activeModal==='profile'&&<ProfileModal onClose={()=>setActiveModal(null)} isDark={isDark} fileInputRef={fileInputRef} isTouchDevice={isTouchDevice}/>}</AnimatePresence>
      <AnimatePresence>{activeModal==='auth'&&<AuthModal onClose={()=>setActiveModal(null)} isDark={isDark}/>}</AnimatePresence>
      <AnimatePresence>{activeModal==='about'&&renderDocModal(ABOUT_CONTENT.title,ABOUT_CONTENT.content,isDark,()=>setActiveModal(null))}</AnimatePresence>
      <AnimatePresence>
        {activeModal&&activeModal!=='profile'&&activeModal!=='auth'&&activeModal!=='about'&&(
          renderDocModal(MODAL_CONTENT[activeModal].title,MODAL_CONTENT[activeModal].content,isDark,()=>setActiveModal(null))
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}

function renderDocModal(title: string, content: Array<{type:string;title?:string;text:string}>, isDark: boolean, onClose: ()=>void) {
  return (
    <>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} className={cls.overlay}/>
      <motion.div initial={{opacity:0,scale:0.95,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95,y:20}}
        className={cls.modal(isDark,'w-[480px]')}>
        <div className={cls.headerBar(isDark)}>
          <h2 className={cls.title(isDark)}>{title}</h2>
          <motion.button whileHover={{scale:1.1}} whileTap={{scale:0.9}} onClick={onClose} className={cls.closeBtn(isDark)}><X className={cls.closeIcon(isDark)}/></motion.button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-4">
            {content.map((b,i)=>{
              if(b.type==='meta') return <p key={i} className={`text-[11px] italic ${cls.text3(isDark)}`}>{b.text}</p>;
              if(b.type==='copyright') return <p key={i} className={`text-[11px] font-medium pt-3 mt-4 border-t ${cls.text4(isDark)} ${cls.borderLight(isDark)}`}>{b.text}</p>;
              if(b.type==='important') return (
                <div key={i} className={cls.importantBox(isDark)}>
                  <p className={`text-[12px] leading-relaxed font-medium ${d(isDark,'text-amber-300','text-amber-700')}`}>{b.text}</p>
                </div>
              );
              return (
                <div key={i}>
                  <h3 className={`text-[13px] font-semibold mb-1.5 ${cls.text1(isDark)}`}>{b.title}</h3>
                  <p className={`text-[12px] leading-[1.7] whitespace-pre-line ${cls.text2(isDark)}`}>{b.text}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className={cls.footerBorder(isDark)}>
          <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} onClick={onClose} className={cls.accentBtn(isDark)}>Понятно</motion.button>
        </div>
      </motion.div>
    </>
  );
}

function ProfileModal({onClose,isDark,fileInputRef,isTouchDevice}:{onClose:()=>void;isDark:boolean;fileInputRef:React.RefObject<HTMLInputElement|null>;isTouchDevice:boolean}) {
  const {user,logout,updateName,updatePassword,sendVerificationCode,verifyCode,deleteAccount}=useAuthStore();
  const [view,setView]=useState<ProfileView>('main');
  const [isEditingName,setIsEditingName]=useState(false);
  const [editName,setEditName]=useState(user?.name||'');
  const [nameLoading,setNameLoading]=useState(false);
  const [nameError,setNameError]=useState('');
  const nameInputRef=useRef<HTMLInputElement>(null);
  const [oldPw,setOldPw]=useState('');const [newPw,setNewPw]=useState('');const [confirmPw,setConfirmPw]=useState('');
  const [sOld,setSO]=useState(false);const [sNew,setSN]=useState(false);const [sCon,setSC]=useState(false);
  const [code,setCode]=useState('');const [error,setError]=useState('');const [success,setSuccess]=useState('');
  const [isLoading,setIsLoading]=useState(false);const [countdown,setCountdown]=useState(0);
  const [turnstileToken,setTurnstileToken]=useState('');const [delText,setDelText]=useState('');

  useEffect(()=>{if(countdown>0){const t=setTimeout(()=>setCountdown(countdown-1),1000);return()=>clearTimeout(t);}},[countdown]);
  useEffect(()=>{if(isEditingName)setTimeout(()=>{nameInputRef.current?.focus();nameInputRef.current?.select();},50);},[isEditingName]);

  const reset=useCallback(()=>{setError('');setSuccess('');setCode('');setIsLoading(false);setTurnstileToken('');setDelText('');setOldPw('');setNewPw('');setConfirmPw('');setSO(false);setSN(false);setSC(false);},[]);
  const goBack=useCallback(()=>{reset();setView('main');},[reset]);

  const saveName=async()=>{setNameError('');const t=editName.trim();if(!t||t.length<2){setNameError('Минимум 2 символа');return;}if(t===user?.name){setIsEditingName(false);return;}setNameLoading(true);try{const r=await updateName(t);if(r.success)setIsEditingName(false);else setNameError(r.error||'Ошибка');}catch{setNameError('Ошибка сети');}setNameLoading(false);};
  const changePw=async()=>{setError('');if(!oldPw){setError('Введи текущий пароль');return;}if(!newPw||newPw.length<6){setError('Минимум 6 символов');return;}if(newPw!==confirmPw){setError('Пароли не совпадают');return;}if(oldPw===newPw){setError('Совпадает со старым');return;}setIsLoading(true);try{const r=await updatePassword(oldPw,newPw);if(r.success){setSuccess('Пароль обновлён');setTimeout(()=>goBack(),1200);}else setError(r.error||'Ошибка');}catch{setError('Ошибка сети');}setIsLoading(false);};
  const delSend=async()=>{setError('');if(delText!=='УДАЛИТЬ'){setError('Напиши УДАЛИТЬ');return;}if(!turnstileToken){setError('Пройди проверку');return;}setIsLoading(true);try{const r=await sendVerificationCode(user?.email||'',turnstileToken);if(r.success){setView('deleteVerify');setCountdown(60);setCode('');setError('');}else setError(r.error||'Ошибка');}catch{setError('Ошибка сети');}setIsLoading(false);};
  const delVerify=async()=>{setError('');if(code.length!==6){setError('6-значный код');return;}setIsLoading(true);try{const v=await verifyCode(user?.email||'',code);if(!v.success){setError(v.error||'Неверный код');setIsLoading(false);return;}const r=await deleteAccount();if(r.success)onClose();else setError(r.error||'Ошибка');}catch{setError('Ошибка сети');}setIsLoading(false);};
  const resend=async()=>{if(countdown>0)return;setIsLoading(true);setError('');try{const r=await sendVerificationCode(user?.email||'',turnstileToken||'resend');if(r.success){setCountdown(60);setCode('');}else setError(r.error||'Ошибка');}catch{setError('Ошибка сети');}setIsLoading(false);};

  return (
    <>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} className={cls.overlay}/>
      <motion.div initial={{opacity:0,scale:0.95,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95,y:20}}
        className={cls.modal(isDark,'w-[380px]')}>
        <AnimatePresence mode="wait">

          {view==='main'&&(
            <motion.div key="main" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              <div className={cls.headerBar(isDark)}>
                <h2 className={cls.title(isDark)}>Профиль</h2>
                <motion.button whileHover={{scale:1.1}} whileTap={{scale:0.9}} onClick={onClose} className={cls.closeBtn(isDark)}><X className={cls.closeIcon(isDark)}/></motion.button>
              </div>
              <div className="px-5 py-5">
                <div className="flex flex-col items-center mb-6">
                  <div className="relative group mb-3">
                    <img src={user?.avatar} alt={user?.name} className={`w-20 h-20 rounded-2xl object-cover ring-2 ${d(isDark,'ring-amber-500/30','ring-amber-300')}`}/>
                    <button onClick={()=>fileInputRef.current?.click()} className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera className="w-5 h-5 text-white"/></button>
                  </div>
                  {isEditingName?(
                    <div className="w-full flex flex-col items-center"><div className="relative w-full max-w-[220px]">
                      <input ref={nameInputRef} type="text" value={editName} onChange={e=>setEditName(e.target.value)}
                        onKeyDown={e=>{if(e.key==='Enter')saveName();if(e.key==='Escape'){setIsEditingName(false);setEditName(user?.name||'');setNameError('');}}}
                        className={`w-full text-center text-lg font-semibold py-1.5 px-3 rounded-xl focus:outline-none transition-all ${
                          d(isDark,'bg-amber-950/30 border border-amber-500/30 text-amber-50','bg-amber-50 border border-amber-200 text-amber-900')
                        }`}/>
                      {nameLoading&&<Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-amber-400"/>}</div>
                      {nameError&&<p className="text-xs text-red-400 text-center mt-1.5">{nameError}</p>}
                      <p className={`text-[10px] text-center mt-1.5 ${cls.text4(isDark)}`}>Enter — сохранить · Esc — отмена</p></div>
                  ):(
                    <div className="flex items-center justify-center w-full">
                      <button onClick={()=>{setIsEditingName(true);setEditName(user?.name||'');setNameError('');}} className="group/name flex items-center gap-2">
                        <span className={`text-lg font-semibold ${cls.text1(isDark)}`}>{user?.name}</span>
                        <Pencil className={`w-3.5 h-3.5 transition-opacity ${cls.text3(isDark)} ${isTouchDevice?'opacity-60':'opacity-0 group-hover/name:opacity-60'}`}/>
                      </button></div>
                  )}
                  <p className={`text-xs mt-1 ${cls.text3(isDark)}`}>{user?.email}</p>
                </div>
                <div className="space-y-2 mb-5">
                  <button onClick={()=>{reset();setView('changePassword');}} className={cls.cardBtn(isDark)}>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${d(isDark,'bg-amber-500/15','bg-amber-100')}`}>
                      <Lock className={`w-4 h-4 ${d(isDark,'text-amber-400','text-amber-600')}`}/></div>
                    <div className="flex-1"><p className={`text-sm font-medium ${cls.text1(isDark)}`}>Сменить пароль</p><p className={`text-[11px] ${cls.text3(isDark)}`}>Обновить пароль аккаунта</p></div>
                  </button>
                </div>
                <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} onClick={()=>{logout();onClose();}}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-all mb-3 ${
                    d(isDark,'bg-red-500/10 border border-red-500/20 hover:bg-red-500/20','bg-red-50 border border-red-200 hover:bg-red-100')
                  }`}>
                  <LogOut className="w-4 h-4 text-red-400"/><span className="text-sm text-red-400 font-medium">Выйти из аккаунта</span>
                </motion.button>
                <button onClick={()=>{reset();setView('deleteAccount');}} className={`w-full text-center text-xs py-2 transition-colors ${cls.text4(isDark)} hover:text-red-400`}>Удалить аккаунт</button>
              </div>
            </motion.div>
          )}

          {view==='changePassword'&&(
            <motion.div key="pw" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
              <div className={cls.headerBarBack(isDark)}>
                <motion.button whileHover={{scale:1.1}} whileTap={{scale:0.9}} onClick={goBack} className={cls.closeBtn(isDark)}><ArrowLeft className={cls.closeIcon(isDark)}/></motion.button>
                <h2 className={cls.title(isDark)}>Сменить пароль</h2>
              </div>
              <div className="px-5 py-5">
                {error&&<motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} className={cls.errBox(isDark)}><span className="text-sm text-red-400">{error}</span></motion.div>}
                {success&&<motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} className={cls.okBox(isDark)}><span className="text-sm text-emerald-400 flex items-center gap-2"><Check className="w-4 h-4"/>{success}</span></motion.div>}
                <div className="space-y-4">
                  <div><label className={`text-xs font-medium mb-2 block ${cls.text2(isDark)}`}>Текущий пароль</label><PasswordField value={oldPw} onChange={setOldPw} placeholder="Введи текущий пароль" show={sOld} toggle={()=>setSO(!sOld)} isDark={isDark}/></div>
                  <div><label className={`text-xs font-medium mb-2 block ${cls.text2(isDark)}`}>Новый пароль</label><PasswordField value={newPw} onChange={setNewPw} placeholder="Минимум 6 символов" show={sNew} toggle={()=>setSN(!sNew)} isDark={isDark}/></div>
                  <div><label className={`text-xs font-medium mb-2 block ${cls.text2(isDark)}`}>Повтори новый пароль</label><PasswordField value={confirmPw} onChange={setConfirmPw} placeholder="Повтори пароль" show={sCon} toggle={()=>setSC(!sCon)} onKeyDown={e=>{if(e.key==='Enter')changePw();}} isDark={isDark}/></div>
                  {newPw&&<div className="space-y-1.5"><div className="flex gap-1">{[1,2,3,4].map(l=>{const s=gpS(newPw);return<div key={l} className={`h-1 flex-1 rounded-full transition-all ${l<=s?s<=1?'bg-red-500':s<=2?'bg-orange-500':s<=3?'bg-amber-500':'bg-emerald-500':d(isDark,'bg-amber-900/30','bg-amber-200')}`}/>;})}</div><p className={`text-[11px] ${cls.text3(isDark)}`}>{gpL(newPw)}</p></div>}
                  {confirmPw&&<p className={`text-xs flex items-center gap-1.5 ${newPw===confirmPw?'text-emerald-400':'text-red-400'}`}>{newPw===confirmPw?<><Check className="w-3.5 h-3.5"/>Пароли совпадают</>:<><X className="w-3.5 h-3.5"/>Пароли не совпадают</>}</p>}
                </div>
                <motion.button whileHover={{scale:1.01}} whileTap={{scale:0.99}} disabled={isLoading||!oldPw||!newPw||newPw!==confirmPw} onClick={changePw}
                  className={`w-full h-12 mt-5 rounded-xl ${cls.gradBtn} transition-all flex items-center justify-center gap-2`}>
                  {isLoading?<Loader2 className="w-4 h-4 animate-spin"/>:'Сменить пароль'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {view==='deleteAccount'&&(
            <motion.div key="del" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
              <div className={cls.headerBarBack(isDark)}>
                <motion.button whileHover={{scale:1.1}} whileTap={{scale:0.9}} onClick={goBack} className={cls.closeBtn(isDark)}><ArrowLeft className={cls.closeIcon(isDark)}/></motion.button>
                <h2 className="text-[15px] font-bold text-red-400">Удаление аккаунта</h2>
              </div>
              <div className="px-5 py-5">
                <div className={`flex items-start gap-3 px-4 py-4 rounded-xl mb-5 ${cls.errBox(isDark).replace('mb-4 ','')}`}>
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"/>
                  <div><p className={`text-sm font-medium mb-1 ${d(isDark,'text-red-300','text-red-700')}`}>Это действие необратимо</p><p className={`text-xs leading-relaxed ${d(isDark,'text-red-400/70','text-red-600/70')}`}>Все данные будут удалены навсегда.</p></div>
                </div>
                {error&&<motion.div initial={{opacity:0}} animate={{opacity:1}} className={cls.errBox(isDark)}><span className="text-sm text-red-400">{error}</span></motion.div>}
                <label className={`text-xs font-medium mb-2 block ${cls.text2(isDark)}`}>Напиши <span className="text-red-400 font-bold">УДАЛИТЬ</span></label>
                <input type="text" value={delText} onChange={e=>setDelText(e.target.value)} placeholder="УДАЛИТЬ" className={`${cls.input(isDark)} mb-4`} autoFocus/>
                <div className="flex justify-center py-2 mb-4"><Turnstile siteKey={TURNSTILE_SITE_KEY} onSuccess={t=>setTurnstileToken(t)} onError={()=>setTurnstileToken('')} onExpire={()=>setTurnstileToken('')} options={{theme:isDark?'dark':'light',size:'flexible'}}/></div>
                <motion.button whileHover={{scale:1.01}} whileTap={{scale:0.99}} disabled={isLoading||delText!=='УДАЛИТЬ'} onClick={delSend}
                  className={`w-full h-12 rounded-xl ${cls.gradBtnRed} transition-all flex items-center justify-center gap-2`}>
                  {isLoading?<Loader2 className="w-4 h-4 animate-spin"/>:'Отправить код'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {view==='deleteVerify'&&(
            <motion.div key="delv" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
              <div className={cls.headerBarBack(isDark)}>
                <motion.button whileHover={{scale:1.1}} whileTap={{scale:0.9}} onClick={()=>{setView('deleteAccount');setCode('');setError('');}} className={cls.closeBtn(isDark)}><ArrowLeft className={cls.closeIcon(isDark)}/></motion.button>
                <h2 className="text-[15px] font-bold text-red-400">Подтверждение</h2>
              </div>
              <div className="px-5 py-5">
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-5 ${d(isDark,'bg-red-500/10 border border-red-500/20','bg-red-50 border border-red-200')}`}>
                  <Shield className="w-5 h-5 flex-shrink-0 text-red-400"/><p className={`text-xs ${d(isDark,'text-red-300','text-red-700')}`}>Код → <span className="font-semibold">{user?.email}</span></p>
                </div>
                {error&&<motion.div initial={{opacity:0}} animate={{opacity:1}} className={cls.errBox(isDark)}><span className="text-sm text-red-400">{error}</span></motion.div>}
                <div className="mb-5"><CodeInput code={code} setCode={setCode} isDark={isDark}/></div>
                <motion.button whileHover={{scale:1.01}} whileTap={{scale:0.99}} disabled={isLoading||code.length!==6} onClick={delVerify}
                  className={`w-full h-12 rounded-xl ${cls.gradBtnRed} transition-all flex items-center justify-center gap-2 mb-4`}>
                  {isLoading?<Loader2 className="w-4 h-4 animate-spin"/>:'Удалить навсегда'}
                </motion.button>
                <div className="flex justify-end"><button onClick={resend} disabled={countdown>0||isLoading}
                  className={`text-sm transition-colors ${countdown>0?`${cls.text4(isDark)} cursor-not-allowed`:'text-red-400 hover:text-red-300'}`}>
                  {countdown>0?`${countdown}с`:'Ещё раз'}</button></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

function gpS(p:string):number{let s=0;if(p.length>=6)s++;if(p.length>=10)s++;if(/[A-Z]/.test(p)&&/[a-z]/.test(p))s++;if(/\d/.test(p))s++;if(/[^A-Za-z0-9]/.test(p))s++;return Math.min(s,4);}
function gpL(p:string):string{const s=gpS(p);return s<=1?'Слабый пароль':s===2?'Средний пароль':s===3?'Хороший пароль':'Надёжный пароль';}

function AuthModal({onClose,isDark}:{onClose:()=>void;isDark:boolean}) {
  const [mode,setMode]=useState<'login'|'register'>('login');
  const [step,setStep]=useState<AuthStep>('form');
  const [name,setName]=useState('');const [email,setEmail]=useState('');const [password,setPassword]=useState('');
  const [showPw,setShowPw]=useState(false);const [code,setCode]=useState('');const [error,setError]=useState('');
  const [isLoading,setIsLoading]=useState(false);const [turnstileToken,setTurnstileToken]=useState('');
  const [countdown,setCountdown]=useState(0);const [pending,setPending]=useState<'register'|'login'>('register');
  const {register,login,sendVerificationCode,verifyCode}=useAuthStore();

  useEffect(()=>{if(countdown>0){const t=setTimeout(()=>setCountdown(countdown-1),1000);return()=>clearTimeout(t);}},[countdown]);

  const val=():boolean=>{setError('');if(!email.trim()){setError('Введи email');return false;}if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){setError('Некорректный email');return false;}if(mode==='register'){if(!name.trim()||name.trim().length<2){setError('Имя слишком короткое');return false;}if(!password||password.length<6){setError('Пароль минимум 6 символов');return false;}const dd=email.split('@')[1]?.toLowerCase();if(!dd||!VALID_EMAIL_DOMAINS.includes(dd)){setError('Используй настоящий email');return false;}}else{if(!password){setError('Введи пароль');return false;}}if(!turnstileToken){setError('Пройди проверку');return false;}return true;};
  const submit=async()=>{if(!val())return;setIsLoading(true);try{const r=await sendVerificationCode(email,turnstileToken);if(r.success){setPending(mode==='login'?'login':'register');setStep('verify');setCountdown(60);setCode('');setError('');}else setError(r.error||'Ошибка');}catch{setError('Ошибка сети');}setIsLoading(false);};
  const verify=async()=>{setError('');if(code.length!==6){setError('6-значный код');return;}setIsLoading(true);try{const v=await verifyCode(email,code);if(!v.success){setError(v.error||'Неверный код');setIsLoading(false);return;}const r=pending==='login'?await login(email,password):await register(name,email,password);if(!r.success){setError(r.error||'Ошибка');setIsLoading(false);return;}setIsLoading(false);onClose();}catch{setError('Ошибка сети');setIsLoading(false);}};
  const resend=async()=>{if(countdown>0)return;setIsLoading(true);setError('');try{const r=await sendVerificationCode(email,turnstileToken||'resend');if(r.success){setCountdown(60);setCode('');}else setError(r.error||'Ошибка');}catch{setError('Ошибка сети');}setIsLoading(false);};

  return (
    <>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} className={cls.overlay}/>
      <motion.div initial={{opacity:0,scale:0.95,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95,y:20}}
        className={cls.modal(isDark)}>
        <AnimatePresence mode="wait">
          {step==='form'&&(
            <motion.div key="form" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="p-6">
              <div className={`flex rounded-xl p-1 mb-6 ${d(isDark,'bg-amber-950/30','bg-amber-100')}`}>
                {(['login','register'] as const).map(m=>(<button key={m} onClick={()=>{setMode(m);setError('');}}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    mode===m?`${cls.gradBtn} shadow-lg`:`${cls.text2(isDark)} ${d(isDark,'hover:text-amber-50','hover:text-amber-900')}`
                  }`}>{m==='login'?'Вход':'Регистрация'}</button>))}
              </div>
              {error&&<motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} className={cls.errBox(isDark)}><span className="text-sm text-red-400">{error}</span></motion.div>}
              <div className="space-y-4">
                {mode==='register'&&<input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Имя" className={cls.input(isDark)}/>}
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className={cls.input(isDark)}/>
                <div className="relative"><input type={showPw?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')submit();}} placeholder="Пароль" className={`${cls.input(isDark)} pr-12`}/>
                  <button onClick={()=>setShowPw(!showPw)} className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${d(isDark,'text-amber-600 hover:text-amber-400','text-amber-400 hover:text-amber-600')}`}>{showPw?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button></div>
                <div className="flex justify-center py-2"><Turnstile siteKey={TURNSTILE_SITE_KEY} onSuccess={t=>setTurnstileToken(t)} onError={()=>setTurnstileToken('')} onExpire={()=>setTurnstileToken('')} options={{theme:isDark?'dark':'light',size:'flexible'}}/></div>
                <motion.button disabled={isLoading} whileHover={{scale:1.01}} whileTap={{scale:0.99}} onClick={submit}
                  className={`w-full h-12 rounded-xl ${cls.gradBtn} transition-all flex items-center justify-center gap-2`}>
                  {isLoading?<Loader2 className="w-4 h-4 animate-spin"/>:'Продолжить'}
                </motion.button>
              </div>
            </motion.div>
          )}
          {step==='verify'&&(
            <motion.div key="verify" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="p-6">
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-5 ${cls.importantBox(isDark)}`}>
                <Shield className={`w-5 h-5 flex-shrink-0 ${cls.accent(isDark)}`}/><p className={`text-xs ${d(isDark,'text-amber-300','text-amber-700')}`}>Код → <span className="font-semibold">{email}</span></p>
              </div>
              {error&&<motion.div initial={{opacity:0}} animate={{opacity:1}} className={cls.errBox(isDark)}><span className="text-sm text-red-400">{error}</span></motion.div>}
              <div className="mb-6"><CodeInput code={code} setCode={setCode} isDark={isDark}/></div>
              <motion.button disabled={isLoading||code.length!==6} whileHover={{scale:1.01}} whileTap={{scale:0.99}} onClick={verify}
                className={`w-full h-12 rounded-xl ${cls.gradBtn} transition-all flex items-center justify-center gap-2 mb-4`}>
                {isLoading?<Loader2 className="w-4 h-4 animate-spin"/>:pending==='login'?'Войти':'Зарегистрироваться'}
              </motion.button>
              <div className="flex items-center justify-between">
                <button onClick={()=>{setStep('form');setCode('');setError('');}} className={`text-sm transition-colors ${cls.text3(isDark)} ${d(isDark,'hover:text-amber-300','hover:text-amber-600')}`}>← Назад</button>
                <button onClick={resend} disabled={countdown>0||isLoading}
                  className={`text-sm transition-colors ${countdown>0?`${cls.text4(isDark)} cursor-not-allowed`:`${cls.accent(isDark)} hover:opacity-80`}`}>
                  {countdown>0?`${countdown}с`:'Ещё раз'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
