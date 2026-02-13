import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Code, Sparkles, MessageCircle, Flame, Smile, Angry, Zap } from 'lucide-react';
import { useChatStore, type ResponseMode, type RudenessMode } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { aiService } from '../services/aiService';
import { AI_MODELS } from '../config/models';
import { useCompareMode } from './Header';

const MODES: { id: ResponseMode; label: string; icon: typeof Code; desc: string; color: string }[] = [
  { id: 'normal', label: 'Обычный', icon: MessageCircle, desc: 'Текст и код', color: 'violet' },
  { id: 'code', label: 'Код', icon: Code, desc: 'Только чистый код', color: 'emerald' },
  { id: 'visual', label: 'Визуал', icon: Sparkles, desc: 'Красивый UI', color: 'pink' },
];

const RUDENESS_MODES: { id: RudenessMode; label: string; icon: typeof Flame; desc: string; color: string; activeColor: string; dotColor: string }[] = [
  { id: 'very_rude', label: 'Очень грубый', icon: Angry, desc: 'Мат и прямота', color: 'red', activeColor: 'bg-red-500/20', dotColor: 'bg-red-500' },
  { id: 'rude', label: 'Грубый', icon: Flame, desc: 'Дерзкий сарказм', color: 'orange', activeColor: 'bg-orange-500/20', dotColor: 'bg-orange-500' },
  { id: 'polite', label: 'Вежливый', icon: Smile, desc: 'Без мата и грубости', color: 'green', activeColor: 'bg-green-500/20', dotColor: 'bg-green-500' },
];

const UNLIMITED_EMAILS = ['energoferon41@gmail.com'];
const CHAR_LIMIT = 1500;

const MODE_SWITCH_NOTIFICATIONS: Record<ResponseMode, Record<RudenessMode, string>> = {
  normal: {
    polite: '💬 Обычный режим — отвечаю текстом и кодом по необходимости.',
    rude: '💬 Обычный режим. Болтаем и кодим.',
    very_rude: '💬 Обычный режим. Давай.',
  },
  code: {
    polite: '⌨️ Режим кода — только чистый рабочий код, без лишних слов.',
    rude: '⌨️ Режим кода. Только код, никакой болтовни.',
    very_rude: '⌨️ Режим кода. Заткнись и кодь.',
  },
  visual: {
    polite: '🎨 Режим визуала — красивый UI на React + Tailwind + Framer Motion.',
    rude: '🎨 Визуал. Делаю красоту, не мешай.',
    very_rude: '🎨 Визуал. Красиво будет, не ссы.',
  },
};

const RUDENESS_SWITCH_NOTIFICATIONS: Record<RudenessMode, string> = {
  polite: '😊 Вежливый режим активирован. Буду корректным и профессиональным.',
  rude: '😏 Дерзкий режим включён. Готовься к сарказму.',
  very_rude: '🤬 Режим без цензуры. Можно материться.',
};

export function ChatInput() {
  const [input, setInput] = useState('');
  const [showModes, setShowModes] = useState(false);
  const [showRudeness, setShowRudeness] = useState(false);
  const [showCharLimitWarning, setShowCharLimitWarning] = useState(false);
  const [switchNotification, setSwitchNotification] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modesRef = useRef<HTMLDivElement>(null);
  const rudenessRef = useRef<HTMLDivElement>(null);
  const prevResponseModeRef = useRef<ResponseMode | null>(null);
  const prevRudenessModeRef = useRef<RudenessMode | null>(null);

  const {
    addMessage,
    updateMessage,
    getCurrentMessages,
    responseMode,
    setResponseMode,
    rudenessMode,
    setRudenessMode,
    selectedModel,
    setGeneratingChat,
    isCurrentChatGenerating,
  } = useChatStore();

  const { user } = useAuthStore();

  const generating = isCurrentChatGenerating();
  const isUnlimitedUser = user?.email && UNLIMITED_EMAILS.includes(user.email);
  const charCount = input.length;
  const isOverLimit = !isUnlimitedUser && charCount > CHAR_LIMIT;

  const showNotification = useCallback((text: string) => {
    setSwitchNotification(text);
    setTimeout(() => setSwitchNotification(null), 2500);
  }, []);

  const handleModeSwitch = useCallback((newMode: ResponseMode) => {
    if (newMode === responseMode) {
      setShowModes(false);
      return;
    }
    setResponseMode(newMode);
    setShowModes(false);
    showNotification(MODE_SWITCH_NOTIFICATIONS[newMode][rudenessMode]);
  }, [responseMode, rudenessMode, setResponseMode, showNotification]);

  const handleRudenessSwitch = useCallback((newRudeness: RudenessMode) => {
    if (newRudeness === rudenessMode) {
      setShowRudeness(false);
      return;
    }
    setRudenessMode(newRudeness);
    setShowRudeness(false);
    showNotification(RUDENESS_SWITCH_NOTIFICATIONS[newRudeness]);
  }, [rudenessMode, setRudenessMode, showNotification]);

  useEffect(() => {
    prevResponseModeRef.current = responseMode;
  }, [responseMode]);

  useEffect(() => {
    prevRudenessModeRef.current = rudenessMode;
  }, [rudenessMode]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '36px';
      if (textareaRef.current.scrollHeight > 52) {
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
      } else {
        textareaRef.current.style.height = '36px';
      }
    }
  }, [input]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modesRef.current && !modesRef.current.contains(e.target as Node)) setShowModes(false);
      if (rudenessRef.current && !rudenessRef.current.contains(e.target as Node)) setShowRudeness(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (!isUnlimitedUser && value.length > CHAR_LIMIT) {
      setShowCharLimitWarning(true);
      setTimeout(() => setShowCharLimitWarning(false), 3000);
      setInput(value.slice(0, CHAR_LIMIT));
      return;
    }
    setShowCharLimitWarning(false);
    setInput(value);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || generating || isOverLimit) return;

    const { isDual, secondModelId } = useCompareMode();

    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = '36px';

    addMessage({ role: 'user', content: trimmedInput });

    const chatId = useChatStore.getState().currentChatId;
    if (!chatId) return;

    setGeneratingChat(chatId, true);

    const model1Data = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0];
    const allMessages = [...getCurrentMessages()];

    if (isDual) {
      const model2Data = AI_MODELS.find(m => m.id === secondModelId) || AI_MODELS[1] || AI_MODELS[0];
      const pairId = `pair-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      const assistantId1 = addMessage({
        role: 'assistant',
        content: '',
        isLoading: true,
        model: model1Data.name,
        thinking: 'Печатаю...',
        dualPosition: 'left',
        dualPairId: pairId,
      });

      const assistantId2 = addMessage({
        role: 'assistant',
        content: '',
        isLoading: true,
        model: model2Data.name,
        thinking: 'Печатаю...',
        dualPosition: 'right',
        dualPairId: pairId,
      });

      try {
        const [response1, response2] = await Promise.all([
          aiService.generateResponse(allMessages, responseMode, rudenessMode, selectedModel),
          aiService.generateResponse(allMessages, responseMode, rudenessMode, secondModelId),
        ]);

        updateMessage(assistantId1, '', 'Печатаю...');
        updateMessage(assistantId2, '', 'Печатаю...');

        const words1 = response1.content.split(' ');
        const words2 = response2.content.split(' ');
        const maxLen = Math.max(words1.length, words2.length);

        let content1 = '';
        let content2 = '';

        for (let i = 0; i < maxLen; i++) {
          if (i < words1.length) {
            content1 += (i > 0 ? ' ' : '') + words1[i];
            updateMessage(assistantId1, content1, 'Печатаю...');
          }
          if (i < words2.length) {
            content2 += (i > 0 ? ' ' : '') + words2[i];
            updateMessage(assistantId2, content2, 'Печатаю...');
          }
          await new Promise(resolve => setTimeout(resolve, 10));
        }

        updateMessage(assistantId1, content1, '');
        updateMessage(assistantId2, content2, '');
      } catch (error) {
        console.error('Error:', error);
        updateMessage(assistantId1, 'Ошибка. Попробуй ещё раз.', '');
        updateMessage(assistantId2, 'Ошибка. Попробуй ещё раз.', '');
      } finally {
        setGeneratingChat(chatId, false);
      }
    } else {
      const assistantId = addMessage({
        role: 'assistant',
        content: '',
        isLoading: true,
        model: model1Data.name,
        thinking: 'Печатаю...',
      });

      try {
        const response = await aiService.generateResponse(allMessages, responseMode, rudenessMode, selectedModel);

        updateMessage(assistantId, '', 'Печатаю...');

        let currentContent = '';
        const words = response.content.split(' ');

        for (let i = 0; i < words.length; i++) {
          currentContent += (i > 0 ? ' ' : '') + words[i];
          updateMessage(assistantId, currentContent, 'Печатаю...');
          await new Promise(resolve => setTimeout(resolve, 10));
        }

        updateMessage(assistantId, currentContent, '');
      } catch (error) {
        console.error('Error:', error);
        updateMessage(assistantId, 'Что-то пошло не так. Попробуй ещё раз.', '');
      } finally {
        setGeneratingChat(chatId, false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const currentMode = MODES.find(m => m.id === responseMode) || MODES[0];
  const currentRudeness = RUDENESS_MODES.find(m => m.id === rudenessMode) || RUDENESS_MODES[1];

  const getModeIconColor = (): string => {
    switch (currentMode.color) {
      case 'violet': return 'text-violet-400';
      case 'emerald': return 'text-emerald-400';
      case 'pink': return 'text-pink-400';
      default: return 'text-violet-400';
    }
  };

  const getModeHoverBorder = (): string => {
    switch (currentMode.color) {
      case 'violet': return 'hover:border-violet-500/30';
      case 'emerald': return 'hover:border-emerald-500/30';
      case 'pink': return 'hover:border-pink-500/30';
      default: return 'hover:border-violet-500/30';
    }
  };

  const getRudenessIconColor = (): string => {
    switch (rudenessMode) {
      case 'very_rude': return 'text-red-400';
      case 'rude': return 'text-orange-400';
      case 'polite': return 'text-green-400';
      default: return 'text-orange-400';
    }
  };

  const getRudenessHoverBorder = (): string => {
    switch (rudenessMode) {
      case 'very_rude': return 'hover:border-red-500/30';
      case 'rude': return 'hover:border-orange-500/30';
      case 'polite': return 'hover:border-green-500/30';
      default: return 'hover:border-orange-500/30';
    }
  };

  const getModeActiveBg = (modeId: ResponseMode): string => {
    if (responseMode !== modeId) return '';
    const mode = MODES.find(m => m.id === modeId);
    switch (mode?.color) {
      case 'violet': return 'bg-violet-500/10';
      case 'emerald': return 'bg-emerald-500/10';
      case 'pink': return 'bg-pink-500/10';
      default: return 'bg-violet-500/10';
    }
  };

  const getModeIconBg = (modeId: ResponseMode): string => {
    if (responseMode !== modeId) return 'bg-white/5';
    const mode = MODES.find(m => m.id === modeId);
    switch (mode?.color) {
      case 'violet': return 'bg-violet-500/20';
      case 'emerald': return 'bg-emerald-500/20';
      case 'pink': return 'bg-pink-500/20';
      default: return 'bg-violet-500/20';
    }
  };

  const getModeIconColorForItem = (modeId: ResponseMode): string => {
    if (responseMode !== modeId) return 'text-zinc-500';
    const mode = MODES.find(m => m.id === modeId);
    switch (mode?.color) {
      case 'violet': return 'text-violet-400';
      case 'emerald': return 'text-emerald-400';
      case 'pink': return 'text-pink-400';
      default: return 'text-violet-400';
    }
  };

  const getModeDotColor = (modeId: ResponseMode): string => {
    const mode = MODES.find(m => m.id === modeId);
    switch (mode?.color) {
      case 'violet': return 'bg-violet-500';
      case 'emerald': return 'bg-emerald-500';
      case 'pink': return 'bg-pink-500';
      default: return 'bg-violet-500';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <AnimatePresence>
        {switchNotification && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 px-4 py-2.5 mb-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
          >
            <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <p className="text-sm text-zinc-300">{switchNotification}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCharLimitWarning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2 px-4 py-3 mb-3 rounded-xl bg-red-500/10 border border-red-500/20"
          >
            <p className="text-sm text-red-300">Лимит {CHAR_LIMIT} символов достигнут.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2">
        <div className="relative" ref={modesRef}>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setShowModes(!showModes); setShowRudeness(false); }}
            className={`flex items-center justify-center w-[52px] h-[52px] rounded-2xl glass-strong transition-all border border-white/5 hover:bg-white/10 ${getModeHoverBorder()}`}
          >
            <currentMode.icon className={`w-5 h-5 ${getModeIconColor()}`} />
          </motion.button>

          <AnimatePresence>
            {showModes && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-0 mb-2 w-56 glass-strong rounded-xl border border-white/10 overflow-hidden z-50"
              >
                <div className="p-2 border-b border-white/5">
                  <p className="text-xs text-zinc-500 px-2">Режим ответа</p>
                </div>
                {MODES.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => handleModeSwitch(mode.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-all ${getModeActiveBg(mode.id)}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getModeIconBg(mode.id)}`}>
                      <mode.icon className={`w-4 h-4 ${getModeIconColorForItem(mode.id)}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${responseMode === mode.id ? 'text-white font-medium' : 'text-zinc-400'}`}>{mode.label}</p>
                      <p className="text-[10px] text-zinc-600">{mode.desc}</p>
                    </div>
                    {responseMode === mode.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`w-2 h-2 rounded-full ${getModeDotColor(mode.id)}`}
                      />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative" ref={rudenessRef}>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setShowRudeness(!showRudeness); setShowModes(false); }}
            className={`flex items-center justify-center w-[52px] h-[52px] rounded-2xl glass-strong transition-all border border-white/5 hover:bg-white/10 ${getRudenessHoverBorder()}`}
          >
            <currentRudeness.icon className={`w-5 h-5 ${getRudenessIconColor()}`} />
          </motion.button>

          <AnimatePresence>
            {showRudeness && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-0 mb-2 w-56 glass-strong rounded-xl border border-white/10 overflow-hidden z-50"
              >
                <div className="p-2 border-b border-white/5">
                  <p className="text-xs text-zinc-500 px-2">Режим общения</p>
                </div>
                {RUDENESS_MODES.map((mode) => {
                  const isActive = rudenessMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => handleRudenessSwitch(mode.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-all ${
                        isActive ? `${mode.activeColor}` : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isActive ? mode.activeColor : 'bg-white/5'
                      }`}>
                        <mode.icon className={`w-4 h-4 ${
                          isActive
                            ? mode.color === 'red' ? 'text-red-400'
                            : mode.color === 'orange' ? 'text-orange-400'
                            : 'text-green-400'
                            : 'text-zinc-500'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${isActive ? 'text-white font-medium' : 'text-zinc-400'}`}>{mode.label}</p>
                        <p className="text-[10px] text-zinc-600">{mode.desc}</p>
                      </div>
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`w-2 h-2 rounded-full ${mode.dotColor}`}
                        />
                      )}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <form
          onSubmit={handleSubmit}
          className={`flex-1 relative rounded-2xl glass-strong shadow-lg shadow-violet-500/5 border ${
            isOverLimit ? 'border-red-500/50' : 'border-white/5'
          }`}
        >
          <div className="relative flex items-center min-h-[52px] pl-4 pr-2">
            <div className="flex-1 flex items-center">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={
                  responseMode === 'code'
                    ? 'Опиши что нужно закодить...'
                    : responseMode === 'visual'
                    ? 'Опиши какой UI хочешь...'
                    : 'Напиши что-нибудь...'
                }
                disabled={generating}
                maxLength={isUnlimitedUser ? undefined : CHAR_LIMIT}
                rows={1}
                className="w-full bg-transparent text-white placeholder-zinc-600 resize-none text-[15px] leading-9 max-h-[160px] focus:outline-none"
                style={{ outline: 'none', border: 'none', boxShadow: 'none', height: '36px', minHeight: '36px' }}
              />
            </div>

            {!isUnlimitedUser && input.length > 0 && (
              <span className={`text-[11px] mr-1 flex-shrink-0 ${
                charCount >= CHAR_LIMIT ? 'text-red-400' : charCount > CHAR_LIMIT * 0.8 ? 'text-orange-400' : 'text-zinc-600'
              }`}>
                {charCount}/{CHAR_LIMIT}
              </span>
            )}

            <motion.button
              type="submit"
              disabled={!input.trim() || generating || isOverLimit}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-shrink-0 w-10 h-10 rounded-xl transition-all duration-200 ml-1 flex items-center justify-center ${
                input.trim() && !generating && !isOverLimit
                  ? responseMode === 'code'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25'
                    : responseMode === 'visual'
                    ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/25'
                    : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                  : 'bg-white/5 text-zinc-600 cursor-not-allowed'
              }`}
            >
              <Send className={`w-5 h-5 ${generating ? 'animate-pulse' : ''}`} />
            </motion.button>
          </div>
        </form>
      </div>

      <div className="flex items-center justify-center gap-3 mt-3">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${
            responseMode === 'code' ? 'bg-emerald-500'
            : responseMode === 'visual' ? 'bg-pink-500'
            : 'bg-violet-500'
          }`} />
          <span className="text-[11px] text-zinc-600">{currentMode.label}</span>
        </div>

        <span className="text-zinc-700">·</span>

        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${
            rudenessMode === 'very_rude' ? 'bg-red-500'
            : rudenessMode === 'rude' ? 'bg-orange-500'
            : 'bg-green-500'
          }`} />
          <span className="text-[11px] text-zinc-600">{currentRudeness.label}</span>
        </div>

        <span className="text-zinc-700">·</span>

        <span className="text-[11px] text-zinc-600">
          MoSeek может ошибаться
        </span>
      </div>
    </div>
  );
}
