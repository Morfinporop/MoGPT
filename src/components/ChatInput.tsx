import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Flame, Smile, Angry } from 'lucide-react';
import { useChatStore, type RudenessMode } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { aiService } from '../services/aiService';
import { AI_MODELS } from '../config/models';
import { useCompareMode } from './Header';

const RUDENESS_MODES: { id: RudenessMode; label: string; icon: typeof Flame; desc: string; color: string }[] = [
  { id: 'very_rude', label: 'Очень грубый', icon: Angry, desc: 'Мат и прямота', color: 'text-red-400' },
  { id: 'rude', label: 'Грубый', icon: Flame, desc: 'Дерзкий сарказм', color: 'text-orange-400' },
  { id: 'polite', label: 'Вежливый', icon: Smile, desc: 'Без мата и грубости', color: 'text-green-400' },
];

const UNLIMITED_EMAILS = ['energoferon41@gmail.com'];
const CHAR_LIMIT = 10000;

export function ChatInput() {
  const [input, setInput] = useState('');
  const [showRudeness, setShowRudeness] = useState(false);
  const [showCharLimitWarning, setShowCharLimitWarning] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const rudenessRef = useRef<HTMLDivElement>(null);

  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const {
    addMessage,
    updateMessage,
    getCurrentMessages,
    responseMode,
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

  const handleRudenessSwitch = useCallback((newRudeness: RudenessMode) => {
    if (newRudeness === rudenessMode) { setShowRudeness(false); return; }
    setRudenessMode(newRudeness);
    setShowRudeness(false);
  }, [rudenessMode, setRudenessMode]);

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
        role: 'assistant', content: '', isLoading: true, model: model1Data.name,
        thinking: 'Печатаю...', dualPosition: 'left', dualPairId: pairId,
      });

      const assistantId2 = addMessage({
        role: 'assistant', content: '', isLoading: true, model: model2Data.name,
        thinking: 'Печатаю...', dualPosition: 'right', dualPairId: pairId,
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
          if (i < words1.length) { content1 += (i > 0 ? ' ' : '') + words1[i]; updateMessage(assistantId1, content1, 'Печатаю...'); }
          if (i < words2.length) { content2 += (i > 0 ? ' ' : '') + words2[i]; updateMessage(assistantId2, content2, 'Печатаю...'); }
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
        const authUser = useAuthStore.getState().user;
        if (authUser) { useChatStore.getState().syncToCloud(authUser.id).catch(() => {}); }
      }
    } else {
      const assistantId = addMessage({
        role: 'assistant', content: '', isLoading: true, model: model1Data.name, thinking: 'Печатаю...',
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
        const authUser = useAuthStore.getState().user;
        if (authUser) { useChatStore.getState().syncToCloud(authUser.id).catch(() => {}); }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const currentRudeness = RUDENESS_MODES.find(m => m.id === rudenessMode) || RUDENESS_MODES[1];

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <AnimatePresence>
        {showCharLimitWarning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`flex items-center gap-2 px-4 py-3 mb-3 rounded-xl ${
              isDark ? 'bg-red-500/10 border border-red-500/15' : 'bg-red-50 border border-red-200'
            }`}
          >
            <p className="text-sm text-red-400">Лимит {CHAR_LIMIT} символов достигнут.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2">
        {/* Rudeness button */}
        <div className="relative" ref={rudenessRef}>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowRudeness(!showRudeness)}
            className={`flex items-center justify-center w-[48px] h-[48px] rounded-2xl transition-all border ${
              isDark
                ? 'bg-[#1c1c1e] border-white/[0.06] hover:bg-[#2c2c2e]'
                : 'bg-[#f2f2f7] border-black/[0.06] hover:bg-[#e5e5ea]'
            }`}
          >
            <currentRudeness.icon className={`w-5 h-5 ${currentRudeness.color}`} />
          </motion.button>

          <AnimatePresence>
            {showRudeness && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.12 }}
                className={`absolute bottom-full left-0 mb-2 w-52 rounded-xl overflow-hidden z-50 shadow-xl ${
                  isDark ? 'bg-[#1c1c1e] border border-white/[0.08]' : 'bg-white border border-black/[0.06] shadow-lg'
                }`}
              >
                <div className={`px-3 py-2 border-b ${isDark ? 'border-white/[0.06]' : 'border-black/[0.04]'}`}>
                  <p className={`text-[11px] font-medium ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Режим общения</p>
                </div>
                {RUDENESS_MODES.map((mode) => {
                  const isActive = rudenessMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => handleRudenessSwitch(mode.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all ${
                        isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-black/[0.03]'
                      } ${isActive ? isDark ? 'bg-white/[0.04]' : 'bg-black/[0.02]' : ''}`}
                    >
                      <mode.icon className={`w-4 h-4 ${isActive ? mode.color : isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
                      <div className="flex-1">
                        <p className={`text-sm ${isActive ? isDark ? 'text-white font-medium' : 'text-black font-medium' : isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{mode.label}</p>
                        <p className={`text-[10px] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{mode.desc}</p>
                      </div>
                      {isActive && <div className="w-2 h-2 rounded-full bg-[#2196F3]" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input form */}
        <form
          onSubmit={handleSubmit}
          className={`flex-1 relative rounded-2xl border ${
            isOverLimit
              ? 'border-red-500/50'
              : isDark
                ? 'bg-[#1c1c1e] border-white/[0.06]'
                : 'bg-[#f2f2f7] border-black/[0.06]'
          }`}
        >
          <div className="relative flex items-center min-h-[48px] pl-4 pr-2">
            <div className="flex-1 flex items-center">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Напиши что-нибудь..."
                disabled={generating}
                maxLength={isUnlimitedUser ? undefined : CHAR_LIMIT}
                rows={1}
                className={`w-full bg-transparent resize-none text-[15px] leading-9 max-h-[160px] focus:outline-none ${
                  isDark
                    ? 'text-white placeholder-zinc-600'
                    : 'text-black placeholder-zinc-400'
                }`}
                style={{ outline: 'none', border: 'none', boxShadow: 'none', height: '36px', minHeight: '36px' }}
              />
            </div>

            {!isUnlimitedUser && input.length > 0 && (
              <span className={`text-[11px] mr-1 flex-shrink-0 ${charCount >= CHAR_LIMIT ? 'text-red-400' : charCount > CHAR_LIMIT * 0.8 ? 'text-orange-400' : isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                {charCount}/{CHAR_LIMIT}
              </span>
            )}

            <motion.button
              type="submit"
              disabled={!input.trim() || generating || isOverLimit}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-shrink-0 w-9 h-9 rounded-xl transition-all duration-200 ml-1 flex items-center justify-center ${
                input.trim() && !generating && !isOverLimit
                  ? 'bg-[#2196F3] text-white'
                  : isDark
                    ? 'bg-white/[0.04] text-zinc-600 cursor-not-allowed'
                    : 'bg-black/[0.04] text-zinc-400 cursor-not-allowed'
              }`}
            >
              <Send className={`w-4 h-4 ${generating ? 'animate-pulse' : ''}`} />
            </motion.button>
          </div>
        </form>
      </div>

      <p className={`text-center text-[11px] mt-2.5 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
        MoSeek может ошибаться
      </p>
    </div>
  );
}
