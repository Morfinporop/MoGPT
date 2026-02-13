import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Code, Sparkles, MessageCircle, Flame, Smile, Angry, Lock, Image } from 'lucide-react';
import { useChatStore, type ResponseMode, type RudenessMode } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { aiService } from '../services/aiService';
import { AI_MODELS } from '../config/models';

const MODES: { id: ResponseMode; label: string; icon: typeof Code; desc: string }[] = [
  { id: 'normal', label: 'Обычный', icon: MessageCircle, desc: 'Код и общение' },
  { id: 'code', label: 'Код', icon: Code, desc: 'Только чистый код' },
  { id: 'visual', label: 'Визуал', icon: Sparkles, desc: 'Красивый UI 2026' },
];

const RUDENESS_MODES: { id: RudenessMode; label: string; icon: typeof Flame; desc: string }[] = [
  { id: 'very_rude', label: 'Очень грубый', icon: Angry, desc: 'Мат на мате' },
  { id: 'rude', label: 'Грубый', icon: Flame, desc: 'Дерзкий с матом' },
  { id: 'polite', label: 'Вежливый', icon: Smile, desc: 'Без мата и грубости' },
];

const VISION_MODELS = [
  'google/gemini-2.5-flash-preview',
  'google/gemini-2.5-pro-preview',
  'openai/gpt-4.1-mini',
  'meta-llama/llama-4-maverick',
  'google/gemma-3-27b-it',
];

const UNLIMITED_EMAILS = ['energoferon41@gmail.com'];
const CHAR_LIMIT = 1500;

export function ChatInput() {
  const [input, setInput] = useState('');
  const [showModes, setShowModes] = useState(false);
  const [showRudeness, setShowRudeness] = useState(false);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [showCharLimitWarning, setShowCharLimitWarning] = useState(false);
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modesRef = useRef<HTMLDivElement>(null);
  const rudenessRef = useRef<HTMLDivElement>(null);

  const {
    addMessage,
    updateMessage,
    getCurrentMessages,
    currentChatId,
    responseMode,
    setResponseMode,
    rudenessMode,
    setRudenessMode,
    selectedModel,
    setGeneratingChat,
    isCurrentChatGenerating,
  } = useChatStore();

  const { canSendMessage, incrementGuestMessages, isAuthenticated, user } = useAuthStore();

  const generating = isCurrentChatGenerating();
  const isUnlimitedUser = user?.email && UNLIMITED_EMAILS.includes(user.email);
  const charCount = input.length;
  const isOverLimit = !isUnlimitedUser && charCount > CHAR_LIMIT;
  const currentModelData = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0];
  const supportsVision = VISION_MODELS.includes(selectedModel);

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
      if (modesRef.current && !modesRef.current.contains(e.target as Node)) {
        setShowModes(false);
      }
      if (rudenessRef.current && !rudenessRef.current.contains(e.target as Node)) {
        setShowRudeness(false);
      }
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

  const handleImageAttach = () => {
    if (supportsVision && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.size > 10 * 1024 * 1024) return;
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAttachedImages(prev => [...prev.slice(0, 3), reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setAttachedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmedInput = input.trim();
    if ((!trimmedInput && attachedImages.length === 0) || generating || isOverLimit) return;

    if (!canSendMessage()) {
      setShowLimitWarning(true);
      setTimeout(() => setShowLimitWarning(false), 5000);
      return;
    }

    setInput('');
    const images = [...attachedImages];
    setAttachedImages([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = '36px';
    }

    if (!isAuthenticated) {
      incrementGuestMessages();
    }

    let userContent: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;

    if (images.length > 0 && supportsVision) {
      const parts: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];
      if (trimmedInput) {
        parts.push({ type: 'text', text: trimmedInput });
      }
      images.forEach(img => {
        parts.push({ type: 'image_url', image_url: { url: img } });
      });
      userContent = parts;
    } else {
      userContent = trimmedInput;
    }

    addMessage({
      role: 'user',
      content: typeof userContent === 'string' ? userContent : trimmedInput || 'Изображение',
      images: images.length > 0 ? images : undefined,
    });

    const chatId = useChatStore.getState().currentChatId;
    if (!chatId) return;

    setGeneratingChat(chatId, true);

    const assistantId = addMessage({
      role: 'assistant',
      content: '',
      isLoading: true,
      model: currentModelData.name,
      thinking: 'Печатаю...',
    });

    try {
      const allMessages = [...getCurrentMessages()];

      if (images.length > 0 && supportsVision) {
        const lastMsg = allMessages[allMessages.length - 1];
        if (lastMsg) {
          (lastMsg as Record<string, unknown>).content = userContent;
        }
      }

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
      updateMessage(assistantId, 'Бля, что-то пошло не так. Попробуй ещё раз.', '');
    } finally {
      setGeneratingChat(chatId, false);
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
  const limitReached = !canSendMessage();

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <AnimatePresence>
        {showLimitWarning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2 px-4 py-3 mb-3 rounded-xl bg-orange-500/10 border border-orange-500/20"
          >
            <Lock className="w-4 h-4 text-orange-400 flex-shrink-0" />
            <p className="text-sm text-orange-300">
              Лимит исчерпан. Зарегистрируйся для безлимитного доступа.
            </p>
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
            <Lock className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-300">
              Лимит {CHAR_LIMIT} символов достигнут.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {attachedImages.length > 0 && (
        <div className="flex gap-2 mb-2 flex-wrap">
          {attachedImages.map((img, idx) => (
            <div key={idx} className="relative group">
              <img
                src={img}
                alt={`Attached ${idx + 1}`}
                className="w-16 h-16 rounded-xl object-cover border border-white/10"
              />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="relative" ref={modesRef}>
          <motion.button
            type="button"
            whileHover={{ scale: limitReached ? 1 : 1.02 }}
            whileTap={{ scale: limitReached ? 1 : 0.98 }}
            onClick={() => { if (!limitReached) { setShowModes(!showModes); setShowRudeness(false); } }}
            disabled={limitReached}
            className={`flex items-center justify-center w-[52px] h-[52px] rounded-2xl glass-strong transition-all border border-white/5 ${
              limitReached ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 hover:border-violet-500/30'
            }`}
          >
            <currentMode.icon className="w-5 h-5 text-violet-400" />
          </motion.button>

          <AnimatePresence>
            {showModes && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-0 mb-2 w-52 glass-strong rounded-xl border border-white/10 overflow-hidden z-50"
              >
                <div className="p-2 border-b border-white/5">
                  <p className="text-xs text-zinc-500 px-2">Режим ответа</p>
                </div>
                {MODES.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => { setResponseMode(mode.id); setShowModes(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-all ${
                      responseMode === mode.id ? 'bg-violet-500/10' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      responseMode === mode.id ? 'bg-violet-500/20' : 'bg-white/5'
                    }`}>
                      <mode.icon className={`w-4 h-4 ${responseMode === mode.id ? 'text-violet-400' : 'text-zinc-500'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${responseMode === mode.id ? 'text-white' : 'text-zinc-400'}`}>{mode.label}</p>
                      <p className="text-[10px] text-zinc-600">{mode.desc}</p>
                    </div>
                    {responseMode === mode.id && <div className="w-2 h-2 rounded-full bg-violet-500" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative" ref={rudenessRef}>
          <motion.button
            type="button"
            whileHover={{ scale: limitReached ? 1 : 1.02 }}
            whileTap={{ scale: limitReached ? 1 : 0.98 }}
            onClick={() => { if (!limitReached) { setShowRudeness(!showRudeness); setShowModes(false); } }}
            disabled={limitReached}
            className={`flex items-center justify-center w-[52px] h-[52px] rounded-2xl glass-strong transition-all border border-white/5 ${
              limitReached ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 hover:border-orange-500/30'
            }`}
          >
            <currentRudeness.icon className={`w-5 h-5 ${
              rudenessMode === 'very_rude' ? 'text-red-400' :
              rudenessMode === 'rude' ? 'text-orange-400' : 'text-green-400'
            }`} />
          </motion.button>

          <AnimatePresence>
            {showRudeness && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-0 mb-2 w-52 glass-strong rounded-xl border border-white/10 overflow-hidden z-50"
              >
                <div className="p-2 border-b border-white/5">
                  <p className="text-xs text-zinc-500 px-2">Режим общения</p>
                </div>
                {RUDENESS_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => { setRudenessMode(mode.id); setShowRudeness(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-all ${
                      rudenessMode === mode.id ? 'bg-orange-500/10' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      rudenessMode === mode.id ?
                        mode.id === 'very_rude' ? 'bg-red-500/20' :
                        mode.id === 'rude' ? 'bg-orange-500/20' : 'bg-green-500/20'
                      : 'bg-white/5'
                    }`}>
                      <mode.icon className={`w-4 h-4 ${
                        rudenessMode === mode.id ?
                          mode.id === 'very_rude' ? 'text-red-400' :
                          mode.id === 'rude' ? 'text-orange-400' : 'text-green-400'
                        : 'text-zinc-500'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${rudenessMode === mode.id ? 'text-white' : 'text-zinc-400'}`}>{mode.label}</p>
                      <p className="text-[10px] text-zinc-600">{mode.desc}</p>
                    </div>
                    {rudenessMode === mode.id && (
                      <div className={`w-2 h-2 rounded-full ${
                        mode.id === 'very_rude' ? 'bg-red-500' :
                        mode.id === 'rude' ? 'bg-orange-500' : 'bg-green-500'
                      }`} />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <form
          onSubmit={handleSubmit}
          className={`flex-1 relative rounded-2xl glass-strong shadow-lg shadow-violet-500/5 border ${
            isOverLimit ? 'border-red-500/50' : 'border-white/5'
          } ${limitReached ? 'opacity-50' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="relative flex items-center min-h-[52px] pl-4 pr-2">
            {supportsVision && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleImageAttach}
                disabled={generating || limitReached}
                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mr-2 transition-all ${
                  generating || limitReached
                    ? 'opacity-30 cursor-not-allowed'
                    : 'hover:bg-white/10 text-zinc-500 hover:text-violet-400'
                }`}
                title="Прикрепить изображение"
              >
                <Image className="w-4 h-4" />
              </motion.button>
            )}

            <div className="flex-1 flex items-center">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={limitReached ? 'Зарегистрируйся для продолжения...' : supportsVision ? 'Напиши или прикрепи картинку...' : 'Напиши что-нибудь...'}
                disabled={generating || limitReached}
                maxLength={isUnlimitedUser ? undefined : CHAR_LIMIT}
                rows={1}
                className="w-full bg-transparent text-white placeholder-zinc-600 resize-none text-[15px] leading-9 max-h-[160px] focus:outline-none"
                style={{
                  outline: 'none',
                  border: 'none',
                  boxShadow: 'none',
                  height: '36px',
                  minHeight: '36px',
                }}
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
              disabled={(!input.trim() && attachedImages.length === 0) || generating || limitReached || isOverLimit}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-shrink-0 w-10 h-10 rounded-xl transition-all duration-200 ml-1 flex items-center justify-center ${
                (input.trim() || attachedImages.length > 0) && !generating && !limitReached && !isOverLimit
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                  : 'bg-white/5 text-zinc-600 cursor-not-allowed'
              }`}
            >
              {limitReached ? (
                <Lock className="w-5 h-5" />
              ) : (
                <Send className={`w-5 h-5 ${generating ? 'animate-pulse' : ''}`} />
              )}
            </motion.button>
          </div>
        </form>
      </div>

      <p className="text-center text-[11px] text-zinc-600 mt-3">
        MoSeek может ошибаться
      </p>
    </div>
  );
}
