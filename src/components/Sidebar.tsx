import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Plus } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useState } from 'react';

type ModalType = 'terms' | 'privacy' | 'cookies' | null;

const MODAL_CONTENT = {
  terms: {
    title: 'Условия использования',
    content: `
# Условия использования MoSeek

**Последнее обновление: Январь 2026**

## 1. Принятие условий

Используя MoSeek, вы соглашаетесь с настоящими условиями. Если вы не согласны — не используйте сервис.

## 2. Описание сервиса

MoSeek — это AI-ассистент нового поколения, предоставляющий:
- Генерацию текста и кода
- Ответы на вопросы
- Помощь в решении задач

## 3. Правила использования

Запрещено использовать сервис для:
- Создания вредоносного контента
- Нарушения законодательства
- Спама и автоматизированных запросов
- Попыток взлома системы

## 4. Интеллектуальная собственность

Контент, созданный AI, может использоваться вами свободно. Однако мы не гарантируем его уникальность.

## 5. Ограничение ответственности

MoSeek предоставляется "как есть". Мы не несём ответственности за:
- Неточности в ответах
- Перебои в работе
- Любой ущерб от использования

## 6. Изменения условий

Мы можем изменять условия в любое время. Продолжение использования означает согласие с изменениями.

---

© 2026 MoSeek. Все права защищены.
    `
  },
  privacy: {
    title: 'Политика конфиденциальности',
    content: `
# Политика конфиденциальности MoSeek

**Последнее обновление: Январь 2026**

## 1. Какие данные мы собираем

### Автоматически собираемые данные:
- История сообщений (хранится локально в браузере)
- Технические данные (тип браузера, устройство)

### Данные, которые вы предоставляете:
- Текст ваших запросов
- Загруженные файлы (если применимо)

## 2. Как мы используем данные

Ваши данные используются для:
- Предоставления ответов на запросы
- Улучшения качества сервиса
- Технической поддержки

## 3. Хранение данных

- Сообщения хранятся **локально** в вашем браузере
- Мы **не храним** вашу переписку на серверах
- Вы можете удалить все данные в любой момент

## 4. Передача данных третьим лицам

Мы **не продаём** ваши данные. Запросы обрабатываются через API партнёров с соблюдением их политик конфиденциальности.

## 5. Безопасность

Мы применяем современные методы защиты:
- Шифрование соединения (HTTPS)
- Обфускация чувствительных данных
- Регулярные проверки безопасности

## 6. Ваши права

Вы имеете право:
- Удалить свои данные
- Запросить копию данных
- Отказаться от использования сервиса

## 7. Контакты

По вопросам конфиденциальности: privacy@mogpt.ai

---

© 2026 MoGPT. Все права защищены.
    `
  },
  cookies: {
    title: 'Политика Cookie',
    content: `
# Политика использования Cookie

**Последнее обновление: Январь 2026**

## Что такое Cookie?

Cookie — это небольшие текстовые файлы, которые сохраняются в вашем браузере при посещении сайта.

## Какие Cookie мы используем

### Необходимые Cookie
- **Хранение настроек** — запоминаем ваши предпочтения
- **История чатов** — сохраняем переписку локально
- **Выбранный режим** — код, визуал, обычный

### Функциональные Cookie
- **Тема оформления** — тёмная тема
- **Языковые настройки** — русский язык

## Мы НЕ используем

❌ Рекламные Cookie
❌ Трекинговые Cookie
❌ Cookie третьих лиц для аналитики
❌ Cookie для профилирования

## Управление Cookie

Вы можете:
- **Очистить Cookie** в настройках браузера
- **Заблокировать Cookie** (сайт продолжит работать)
- **Удалить историю** через кнопку очистки чата

## Локальное хранилище (LocalStorage)

Помимо Cookie, мы используем LocalStorage для:
- Сохранения истории сообщений
- Хранения настроек интерфейса
- Кэширования данных для быстрой загрузки

Все данные хранятся **только на вашем устройстве**.

## Согласие

Продолжая использовать MoGPT, вы соглашаетесь с нашей политикой Cookie.

---

© 2026 MoGPT. Все права защищены.
    `
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
  
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'spring', damping: 35, stiffness: 500 }}
            className="fixed left-0 top-0 bottom-0 w-72 glass-strong border-r border-white/5 z-50 flex flex-col"
          >
            {/* Header */}
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

            {/* New Chat Button */}
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

            {/* Chat List */}
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

                      {/* Delete Button */}
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

            {/* Footer with Links */}
            <div className="p-4 border-t border-white/5">
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

      {/* Modal for Terms/Privacy/Cookies */}
      <AnimatePresence>
        {activeModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-4 md:inset-12 lg:inset-24 bg-zinc-900/95 border border-white/10 rounded-2xl z-[70] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10">
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  {MODAL_CONTENT[activeModal].title}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setActiveModal(null)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-6 h-6 text-zinc-400" />
                </motion.button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="prose prose-invert prose-violet max-w-none">
                  {MODAL_CONTENT[activeModal].content.split('\n').map((line, i) => {
                    if (line.startsWith('# ')) {
                      return <h1 key={i} className="text-2xl md:text-3xl font-bold text-white mb-4">{line.slice(2)}</h1>;
                    }
                    if (line.startsWith('## ')) {
                      return <h2 key={i} className="text-xl md:text-2xl font-semibold text-violet-400 mt-6 mb-3">{line.slice(3)}</h2>;
                    }
                    if (line.startsWith('### ')) {
                      return <h3 key={i} className="text-lg font-semibold text-purple-400 mt-4 mb-2">{line.slice(4)}</h3>;
                    }
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <p key={i} className="text-white font-semibold my-2">{line.slice(2, -2)}</p>;
                    }
                    if (line.startsWith('- ')) {
                      return <li key={i} className="text-zinc-300 ml-4 my-1">{line.slice(2)}</li>;
                    }
                    if (line.startsWith('❌')) {
                      return <p key={i} className="text-red-400 my-1">{line}</p>;
                    }
                    if (line.startsWith('---')) {
                      return <hr key={i} className="border-white/10 my-6" />;
                    }
                    if (line.trim() === '') {
                      return <br key={i} />;
                    }
                    return <p key={i} className="text-zinc-400 my-2">{line}</p>;
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 md:p-6 border-t border-white/10">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveModal(null)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium hover:from-violet-600 hover:to-purple-600 transition-all"
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
