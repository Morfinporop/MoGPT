import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Plus, LogOut, Loader2, Camera, ChevronLeft } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { useState, useRef, useEffect } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

const TURNSTILE_SITE_KEY = '0x4AAAAAACa5EobYKh_TrmuZ';

type ModalType = 'terms' | 'privacy' | 'cookies' | 'profile' | 'auth' | null;

const MODAL_CONTENT = {
  terms: {
    title: 'Условия использования',
    content: [
      { type: 'meta', text: 'Последнее обновление: Январь 2026' },
      { type: 'section', title: '1. Принятие условий', text: 'Используя сервис MoSeek и нейросеть MoGPT, вы безоговорочно принимаете настоящие Условия использования в полном объёме. Если вы не согласны с какими-либо положениями — вы обязаны немедленно прекратить использование сервиса. Продолжение использования после публикации изменений означает ваше согласие с обновлёнными условиями.' },
      { type: 'section', title: '2. Описание сервиса', text: 'MoSeek — интеллектуальная AI-платформа нового поколения. MoGPT — проприетарная нейросеть, разработанная Кириллом (16 лет). Сервис предоставляет: генерацию текста, написание и анализ программного кода, ответы на вопросы, помощь в решении задач, визуальный дизайн интерфейсов. Все технологии, алгоритмы и архитектурные решения являются исключительной собственностью создателя.' },
      { type: 'section', title: '3. Интеллектуальная собственность', text: 'Название "MoSeek", "MoGPT", логотипы, дизайн интерфейса, исходный код платформы, системные промпты, алгоритмы обработки запросов и все связанные материалы являются объектами авторского права и интеллектуальной собственности создателя. Любое копирование, воспроизведение, модификация, декомпиляция, реверс-инжиниринг, распространение или коммерческое использование без письменного разрешения создателя категорически запрещено и преследуется по закону.' },
      { type: 'important', text: 'Нарушение авторских прав влечёт ответственность в соответствии с Гражданским кодексом РФ (часть IV), Законом об авторском праве, а также международными соглашениями WIPO и Бернской конвенцией.' },
      { type: 'section', title: '4. Права на сгенерированный контент', text: 'Контент, созданный MoGPT по вашему запросу, может использоваться вами свободно для личных и коммерческих целей. Однако MoSeek не гарантирует уникальность сгенерированного контента и не несёт ответственности за совпадения с существующими материалами третьих лиц. Ответственность за использование сгенерированного контента лежит на пользователе.' },
      { type: 'section', title: '5. Правила использования', text: 'Строго запрещено: создание вредоносного, незаконного или деструктивного контента; попытки взлома, декомпиляции или реверс-инжиниринга сервиса; автоматизированные массовые запросы (спам, DoS); использование для нарушения прав третьих лиц; распространение запрещённой информации (наркотики, оружие, экстремизм); попытки обхода систем безопасности и ограничений; создание клонов, форков или производных сервисов.' },
      { type: 'section', title: '6. Ограничение ответственности', text: 'Сервис предоставляется на условиях «как есть» (as is). MoSeek не гарантирует бесперебойную работу, абсолютную точность ответов и пригодность для конкретных целей. Создатель не несёт ответственности за: прямые или косвенные убытки от использования сервиса; неточности в сгенерированном контенте; перебои в работе; действия третьих лиц.' },
      { type: 'section', title: '7. Блокировка доступа', text: 'MoSeek оставляет за собой право заблокировать доступ любому пользователю без объяснения причин в случае нарушения настоящих Условий, злоупотребления сервисом или по решению администрации.' },
      { type: 'section', title: '8. Изменение условий', text: 'Создатель вправе изменять настоящие Условия в любое время. Актуальная версия всегда доступна в интерфейсе сервиса. Продолжение использования сервиса после изменений означает согласие с новой редакцией.' },
      { type: 'copyright', text: '© 2026 MoSeek. Все права защищены. Создатель — Кирилл. Любое несанкционированное использование преследуется по закону.' },
    ]
  },
  privacy: {
    title: 'Политика конфиденциальности',
    content: [
      { type: 'meta', text: 'Последнее обновление: Январь 2026' },
      { type: 'section', title: '1. Общие положения', text: 'Настоящая Политика конфиденциальности описывает порядок сбора, использования, хранения и защиты персональных данных пользователей сервиса MoSeek. Мы серьёзно относимся к защите вашей приватности и обрабатываем данные в соответствии с Федеральным законом №152-ФЗ «О персональных данных» и Регламентом GDPR.' },
      { type: 'section', title: '2. Какие данные мы собираем', text: 'Данные, предоставленные вами: имя пользователя, адрес электронной почты, пароль (хранится в зашифрованном виде). Автоматически собираемые данные: текст запросов к нейросети (обрабатывается в реальном времени, не сохраняется на серверах), тип устройства и браузера (для оптимизации работы), история чатов (хранится исключительно локально в вашем браузере).' },
      { type: 'important', text: 'Мы НЕ собираем: геолокацию, IP-адреса для отслеживания, данные о посещении сторонних сайтов, биометрические данные, финансовую информацию.' },
      { type: 'section', title: '3. Как мы используем данные', text: 'Собранные данные используются исключительно для: обеспечения работы сервиса и обработки ваших запросов; аутентификации и защиты аккаунта; улучшения качества ответов нейросети; технической поддержки. Мы не используем ваши данные для таргетированной рекламы, профилирования или продажи третьим лицам.' },
      { type: 'section', title: '4. Хранение данных', text: 'История сообщений хранится локально в localStorage вашего браузера. На серверах MoSeek переписка не сохраняется. Данные аккаунта (имя, email, хеш пароля) хранятся в зашифрованном виде. Вы можете удалить все данные в любой момент через очистку истории или удаление аккаунта.' },
      { type: 'section', title: '5. Передача третьим лицам', text: 'Ваши данные не продаются и не передаются третьим лицам за исключением: обработки запросов через API-партнёров (передаётся только текст запроса без идентификации пользователя); требований законодательства (по решению суда или запросу уполномоченных органов).' },
      { type: 'section', title: '6. Безопасность', text: 'Мы применяем: HTTPS-шифрование всех соединений; обфускацию и хеширование чувствительных данных; верификацию через Cloudflare Turnstile; регулярные проверки безопасности. Несмотря на принимаемые меры, абсолютная безопасность в интернете невозможна.' },
      { type: 'section', title: '7. Ваши права', text: 'Вы имеете право: запросить информацию о хранимых данных; потребовать удаления ваших данных; отозвать согласие на обработку; экспортировать свои данные; подать жалобу в уполномоченный орган по защите данных.' },
      { type: 'section', title: '8. Данные несовершеннолетних', text: 'Сервис не предназначен для лиц младше 13 лет. Если мы обнаружим, что собрали данные ребёнка младше 13 лет, они будут немедленно удалены.' },
      { type: 'copyright', text: '© 2026 MoSeek. Все права защищены. По вопросам конфиденциальности обращайтесь через интерфейс сервиса.' },
    ]
  },
  cookies: {
    title: 'Политика Cookie и хранения данных',
    content: [
      { type: 'meta', text: 'Последнее обновление: Январь 2026' },
      { type: 'section', title: '1. Что такое Cookie и LocalStorage', text: 'Cookie — небольшие текстовые файлы, сохраняемые в вашем браузере. LocalStorage — механизм хранения данных на стороне клиента. Оба механизма используются для сохранения ваших настроек и обеспечения корректной работы сервиса.' },
      { type: 'section', title: '2. Какие данные мы храним', text: 'Необходимые данные: настройки интерфейса (тема, режим грубости, режим ответов); история чатов и сообщений; данные аутентификации (токен сессии); выбранные пользовательские предпочтения; аватар пользователя (в формате Base64).' },
      { type: 'important', text: 'Мы НЕ используем: рекламные и трекинговые Cookie; Cookie третьих лиц для отслеживания; пиксели отслеживания; fingerprinting браузера; любые механизмы профилирования и слежки.' },
      { type: 'section', title: '3. Цели использования', text: 'Все хранимые данные используются исключительно для: сохранения ваших настроек между сессиями; обеспечения работы системы аутентификации; хранения истории чатов для вашего удобства; корректного отображения интерфейса.' },
      { type: 'section', title: '4. Срок хранения', text: 'Данные в LocalStorage хранятся бессрочно до момента их удаления вами. Вы можете удалить все данные: через кнопку очистки истории в интерфейсе; через настройки браузера (очистка данных сайта); через удаление аккаунта.' },
      { type: 'section', title: '5. Управление данными', text: 'Вы полностью контролируете свои данные. Очистка localStorage удалит: все чаты и сообщения; настройки интерфейса; данные аккаунта (потребуется повторный вход). Блокировка Cookie может ограничить функциональность сервиса.' },
      { type: 'section', title: '6. Согласие', text: 'Используя MoSeek, вы соглашаетесь с данной политикой хранения данных. Все данные хранятся исключительно на вашем устройстве и не передаются на серверы MoSeek без вашего явного согласия.' },
      { type: 'copyright', text: '© 2026 MoSeek. Все права защищены. Ваши данные — ваша собственность.' },
    ]
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

  const handleNewChat = () => {
    const newChatId = createNewChat();
    if (newChatId) {
      setCurrentChat(newChatId);
    }
    toggleSidebar();
  };

  const handleDeleteChat = (chatId: string) => {
    const chatIndex = chats.findIndex(c => c.id === chatId);
    deleteChat(chatId);

    const remainingChats = chats.filter(c => c.id !== chatId);
    if (remainingChats.length > 0) {
      if (currentChatId === chatId) {
        const newIndex = Math.min(chatIndex, remainingChats.length - 1);
        setCurrentChat(remainingChats[newIndex].id);
      }
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
                    if (block.type === 'meta') {
                      return <p key={i} className="text-[11px] text-zinc-500 italic">{block.text}</p>;
                    }
                    if (block.type === 'copyright') {
                      return <p key={i} className="text-[11px] text-zinc-600 pt-3 mt-4 border-t border-white/5 font-medium">{block.text}</p>;
                    }
                    if (block.type === 'important') {
                      return (
                        <div key={i} className="px-4 py-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                          <p className="text-[12px] text-violet-300 leading-relaxed font-medium">{block.text}</p>
                        </div>
                      );
                    }
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
  const [countdown, setCountdown] = useState(0);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const turnstileRef = useRef<any>(null);

  const { register, login, sendVerificationCode, verifyCode } = useAuthStore();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

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
      if (!domain || !VALID_DOMAINS.includes(domain)) { setError('Используй настоящий email'); return; }
      if (!checkExisting()) return;
    } else {
      if (!password) { setError('Введи пароль'); return; }
    }

    if (!turnstileToken) { setError('Пройди проверку безопасности'); return; }

    setIsLoading(true);

    if (mode === 'login') {
      const loginResult = login(email, password);
      if (!loginResult.success) { setError(loginResult.error || 'Ошибка входа'); setIsLoading(false); return; }
      setIsLoading(false);
      onClose();
      return;
    }

    const result = await sendVerificationCode(email, turnstileToken);
    if (result.success) {
      setStep('verify');
      setCountdown(60);
      setCode('');
      setTimeout(() => codeInputRef.current?.focus(), 200);
    } else {
      setError(result.error || 'Ошибка отправки кода');
      if (turnstileRef.current) { turnstileRef.current.reset(); setTurnstileToken(''); }
    }
    setIsLoading(false);
  };

  const handleVerifyAndComplete = async () => {
    setError('');
    if (code.length !== 6) { setError('Введи 6-значный код'); return; }
    setIsLoading(true);
    const verifyResult = await verifyCode(email, code);
    if (!verifyResult.success) { setError(verifyResult.error || 'Неверный код'); setIsLoading(false); return; }
    const regResult = register(name, email, password);
    if (!regResult.success) { setError(regResult.error || 'Ошибка регистрации'); setIsLoading(false); return; }
    setIsLoading(false);
    onClose();
  };

  const handleCodeInput = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    setCode(cleaned);
  };

  const handleResend = async () => {
    if (countdown > 0 || !turnstileToken) return;
    setIsLoading(true);
    setError('');
    const result = await sendVerificationCode(email, turnstileToken);
    if (result.success) { setCountdown(60); setCode(''); }
    else { setError(result.error || 'Ошибка повторной отправки'); }
    setIsLoading(false);
  };

  const renderCodeDots = () => {
    const dots = [];
    for (let i = 0; i < 6; i++) {
      const filled = i < code.length;
      const digit = code[i];
      dots.push(
        <motion.div
          key={i}
          initial={{ scale: 0.8 }}
          animate={{ scale: filled ? 1.1 : 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
            filled
              ? 'bg-violet-500 border-2 border-violet-400 shadow-lg shadow-violet-500/30'
              : 'bg-zinc-800/80 border-2 border-zinc-700/50'
          }`}
        >
          {filled ? (
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="text-white font-bold text-lg"
            >
              {digit}
            </motion.span>
          ) : (
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
          )}
        </motion.div>
      );
    }
    return dots;
  };

  return (
    <>
      <style>{`
        .turnstile-wrap, .turnstile-wrap > div, .turnstile-wrap > div > div, .turnstile-wrap iframe {
          border-radius: 12px !important; overflow: hidden !important; background: transparent !important;
        }
      `}</style>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] max-w-[calc(100vw-32px)] max-h-[90vh] overflow-y-auto glass-strong border border-white/10 rounded-2xl z-[70]"
      >
        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <div className="px-6 pt-6 pb-2 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-violet-500/20">
                  <span className="text-white font-black text-xl">M</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-1">MoSeek</h2>
                <p className="text-xs text-zinc-500">
                  {mode === 'login' ? 'Войди в свой аккаунт' : 'Создай новый аккаунт'}
                </p>
              </div>

              <div className="flex mx-6 mt-4 mb-5 rounded-xl bg-zinc-800/50 p-1">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                    mode === 'login' ? 'bg-violet-500/20 text-violet-300 shadow-sm' : 'text-zinc-500 hover:text-zinc-400'
                  }`}
                >
                  Вход
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                    mode === 'register' ? 'bg-violet-500/20 text-violet-300 shadow-sm' : 'text-zinc-500 hover:text-zinc-400'
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
                      className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20"
                    >
                      <span className="text-xs text-red-300">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  initial={false}
                  animate={{
                    height: mode === 'register' ? 56 : 0,
                    opacity: mode === 'register' ? 1 : 0,
                    marginBottom: mode === 'register' ? 0 : -12,
                  }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Имя"
                    tabIndex={mode === 'register' ? 0 : -1}
                    className="w-full h-[48px] px-4 rounded-xl bg-zinc-800/50 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 border border-zinc-700/50 focus:border-violet-500/30 transition-all"
                  />
                </motion.div>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full h-[48px] px-4 rounded-xl bg-zinc-800/50 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 border border-zinc-700/50 focus:border-violet-500/30 transition-all"
                />

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Пароль"
                    className="w-full h-[48px] px-4 pr-12 rounded-xl bg-zinc-800/50 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 border border-zinc-700/50 focus:border-violet-500/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <span className="text-zinc-500 text-xs font-medium">{showPassword ? 'Скрыть' : 'Показать'}</span>
                  </button>
                </div>

                <div className="turnstile-wrap flex justify-center pt-1">
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
                  className="w-full h-[48px] rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold text-sm shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>{mode === 'login' ? 'Войти' : 'Продолжить'}</span>}
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 'verify' && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <div className="px-6 pt-5 pb-2">
                <button
                  onClick={() => { setStep('form'); setError(''); setCode(''); }}
                  className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-xs font-medium">Назад</span>
                </button>

                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-violet-500/15 border border-violet-500/30 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Проверка почты</h3>
                  <p className="text-xs text-zinc-500">
                    Введи 6-значный код, отправленный на
                  </p>
                  <p className="text-xs text-violet-400 font-medium mt-0.5">{email}</p>
                </div>
              </div>

              <div className="px-6 pb-6 space-y-5">
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      key="verify-error"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20"
                    >
                      <span className="text-xs text-red-300">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative">
                  <div className="flex justify-center gap-3">
                    {renderCodeDots()}
                  </div>
                  <input
                    ref={codeInputRef}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => handleCodeInput(e.target.value)}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                      setCode(pasted);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    autoFocus
                  />
                </div>

                <p className="text-center text-[11px] text-zinc-600">Нажми на кружки и введи код</p>

                <motion.button
                  type="button"
                  disabled={isLoading || code.length !== 6}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleVerifyAndComplete}
                  className="w-full h-[48px] rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold text-sm shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Подтвердить</span>}
                </motion.button>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={countdown > 0 || isLoading}
                    className={`text-xs font-medium transition-colors ${
                      countdown > 0 ? 'text-zinc-600 cursor-not-allowed' : 'text-violet-400 hover:text-violet-300'
                    }`}
                  >
                    {countdown > 0 ? `Отправить повторно через ${countdown}с` : 'Отправить код повторно'}
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
