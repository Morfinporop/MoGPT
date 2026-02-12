import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Plus } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useState } from 'react';

type ModalType = 'terms' | 'privacy' | 'cookies' | null;

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

  const [activeModal, setActiveModal] = useState<ModalType>(null);

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
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: 'spring', damping: 35, stiffness: 500 }}
            className="fixed left-0 top-0 bottom-0 w-64 glass-strong border-r border-white/5 z-50 flex flex-col"
          >
            <div className="flex items-center justify-between px-3 py-3 border-b border-white/5">
              <h2 className="text-sm font-semibold text-white">Чаты</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-zinc-400" />
              </motion.button>
            </div>

            <div className="px-2 py-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  createNewChat();
                  toggleSidebar();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-500/15 border border-violet-500/25 hover:border-violet-500/40 transition-all"
              >
                <Plus className="w-4 h-4 text-violet-400" />
                <span className="text-xs text-violet-300">Новый чат</span>
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
              {chats.length === 0 ? (
                <div className="text-center py-6">
                  <MessageSquare className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-xs text-zinc-600">Нет чатов</p>
                  <p className="text-[10px] text-zinc-700 mt-0.5">Начни новый диалог</p>
                </div>
              ) : (
                chats.map((chat) => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`group relative rounded-lg transition-all cursor-pointer ${
                      currentChatId === chat.id
                        ? 'bg-violet-500/15 border border-violet-500/25'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center">
                      <button
                        onClick={() => {
                          setCurrentChat(chat.id);
                          toggleSidebar();
                        }}
                        className="flex-1 min-w-0 text-left px-2.5 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${
                            currentChatId === chat.id ? 'text-violet-400' : 'text-zinc-600'
                          }`} />
                          <p className={`text-xs truncate max-w-[150px] ${
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
                        className="flex-shrink-0 p-1.5 mr-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all"
                      >
                        <X className="w-3 h-3 text-red-400" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="px-3 py-2.5 border-t border-white/5">
              <div className="flex items-center justify-center gap-2 text-[9px]">
                <button
                  onClick={() => setActiveModal('terms')}
                  className="text-zinc-600 hover:text-violet-400 transition-colors"
                >
                  Terms
                </button>
                <span className="text-zinc-700">·</span>
                <button
                  onClick={() => setActiveModal('privacy')}
                  className="text-zinc-600 hover:text-violet-400 transition-colors"
                >
                  Privacy
                </button>
                <span className="text-zinc-700">·</span>
                <button
                  onClick={() => setActiveModal('cookies')}
                  className="text-zinc-600 hover:text-violet-400 transition-colors"
                >
                  Cookies
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}

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
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-6 md:inset-x-[20%] md:inset-y-[10%] lg:inset-x-[28%] lg:inset-y-[8%] bg-zinc-900/95 border border-white/10 rounded-xl z-[70] flex flex-col overflow-hidden max-w-lg mx-auto"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
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

              <div className="flex-1 overflow-y-auto px-4 py-3">
                <div className="space-y-3">
                  {MODAL_CONTENT[activeModal].content.split('\n\n').map((block, i) => {
                    const lines = block.trim();
                    if (!lines) return null;

                    if (lines.startsWith('©')) {
                      return (
                        <p key={i} className="text-[10px] text-zinc-600 pt-2 border-t border-white/5">
                          {lines}
                        </p>
                      );
                    }

                    if (lines.startsWith('Последнее')) {
                      return (
                        <p key={i} className="text-[10px] text-zinc-500 italic">
                          {lines}
                        </p>
                      );
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

                    return (
                      <p key={i} className="text-[11px] text-zinc-400 leading-relaxed">{lines}</p>
                    );
                  })}
                </div>
              </div>

              <div className="px-4 py-3 border-t border-white/10">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveModal(null)}
                  className="w-full py-2 rounded-lg bg-violet-500/20 border border-violet-500/30 text-xs text-violet-300 font-medium hover:bg-violet-500/30 transition-all"
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
