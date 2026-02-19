import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Flame, Smile, Angry, ImageIcon, X } from 'lucide-react';
import { useChatStore, type RudenessMode } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { aiService } from '../services/aiService';
import { AI_MODELS } from '../config/models';
import { useCompareMode } from './Header';

const RUDENESS_MODES: { id: RudenessMode; label: string; icon: typeof Flame; desc: string; activeColor: string; dotColor: string; iconActive: string; hoverBorder: string }[] = [
  { id: 'very_rude', label: 'Очень грубый', icon: Angry, desc: 'Мат и прямота', activeColor: 'bg-red-500/20', dotColor: 'bg-red-500', iconActive: 'text-red-400', hoverBorder: 'hover:border-red-500/30' },
  { id: 'rude', label: 'Грубый', icon: Flame, desc: 'Дерзкий сарказм', activeColor: 'bg-orange-500/20', dotColor: 'bg-orange-500', iconActive: 'text-orange-400', hoverBorder: 'hover:border-orange-500/30' },
  { id: 'polite', label: 'Вежливый', icon: Smile, desc: 'Без мата и грубости', activeColor: 'bg-green-500/20', dotColor: 'bg-green-500', iconActive: 'text-green-400', hoverBorder: 'hover:border-green-500/30' },
];

const UNLIMITED_EMAILS = ['energoferon41@gmail.com'];
const CHAR_LIMIT = 10000;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function ChatInput() {
  const [input, setInput] = useState('');
  const [showRudeness, setShowRudeness] = useState(false);
  const [showCharLimitWarning, setShowCharLimitWarning] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const rudenessRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    addMessage, updateMessage, getCurrentMessages, responseMode, rudenessMode,
    setRudenessMode, selectedModel, setGeneratingChat, isCurrentChatGenerating,
  } = useChatStore();

  const { user } = useAuthStore();

  const generating = isCurrentChatGenerating();
  const isUnlimitedUser = user?.email && UNLIMITED_EMAILS.includes(user.email);
  const charCount = input.length;
  const isOverLimit = !isUnlimitedUser && charCount > CHAR_LIMIT;

  const currentModel = AI_MODELS.find(m => m.id === selectedModel);
  const supportsImages = currentModel?.supportsImage || false;

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

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Можно загружать только изображения');
      setTimeout(() => setImageError(null), 3000);
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError('Размер изображения не должен превышать 5 МБ');
      setTimeout(() => setImageError(null), 3000);
      return;
    }

    setSelectedImage(file);
    setImageError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const clearImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmedInput = input.trim();
    if ((!trimmedInput && !selectedImage) || generating || isOverLimit) return;

    if (selectedImage && !supportsImages) {
      setImageError('Эта модель не поддерживает изображения. Выберите модель с поддержкой изображений.');
      setTimeout(() => setImageError(null), 4000);
      return;
    }

    const { isDual, secondModelId } = useCompareMode();

    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = '36px';

    let imageUrl: string | undefined;
    if (selectedImage && imagePreview) {
      imageUrl = imagePreview;
      clearImage();
    }

    addMessage({ role: 'user', content: trimmedInput || (imageUrl ? 'Что на этом изображении?' : ''), imageUrl });

    const chatId = useChatStore.getState().currentChatId;
    if (!chatId) return;

    setGeneratingChat(chatId, true);

    const model1Data = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0];
    const allMessages = [...getCurrentMessages()];

    if (isDual) {
      const model2Data = AI_MODELS.find(m => m.id === secondModelId) || AI_MODELS[1] || AI_MODELS[0];
      const pairId = `pair-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      const assistantId1 = addMessage({ role: 'assistant', content: '', isLoading: true, model: model1Data.name, thinking: 'Печатаю...', dualPosition: 'left', dualPairId: pairId });
      const assistantId2 = addMessage({ role: 'assistant', content: '', isLoading: true, model: model2Data.name, thinking: 'Печатаю...', dualPosition: 'right', dualPairId: pairId });

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
      const assistantId = addMessage({ role: 'assistant', content: '', isLoading: true, model: model1Data.name, thinking: 'Печатаю...' });

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

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    if (!supportsImages) return;

    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          if (file.size > MAX_IMAGE_SIZE) {
            setImageError('Размер изображения не должен превышать 5 МБ');
            setTimeout(() => setImageError(null), 3000);
            return;
          }
          setSelectedImage(file);
          setImageError(null);
          const reader = new FileReader();
          reader.onload = (event) => {
            setImagePreview(event.target?.result as string);
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  }, [supportsImages]);

  const currentRudeness = RUDENESS_MODES.find(m => m.id === rudenessMode) || RUDENESS_MODES[1];

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <AnimatePresence>
        {showCharLimitWarning && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2 px-4 py-3 mb-3 rounded-xl bg-red-500/10 border border-red-500/20"
          >
            <p className="text-sm text-red-300">Лимит {CHAR_LIMIT} символов достигнут.</p>
          </motion.div>
        )}
        {imageError && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2 px-4 py-3 mb-3 rounded-xl bg-red-500/10 border border-red-500/20"
          >
            <p className="text-sm text-red-300">{imageError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            className="mb-3 flex items-center gap-3 px-4 py-3 rounded-xl glass-strong border border-white/10"
          >
            <img src={imagePreview} alt="Превью" className="h-20 w-20 rounded-lg object-cover border border-white/10" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-zinc-300 truncate">{selectedImage?.name}</p>
              <p className="text-xs text-zinc-500">
                {selectedImage && (selectedImage.size / 1024).toFixed(0)} КБ
              </p>
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={clearImage}
              className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
            >
              <X className="w-4 h-4 text-red-400" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2">
        <div className="relative" ref={rudenessRef}>
          <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setShowRudeness(!showRudeness)}
            className={`flex items-center justify-center w-[52px] h-[52px] rounded-2xl glass-strong transition-all border border-white/5 hover:bg-white/10 ${currentRudeness.hoverBorder}`}
          >
            <currentRudeness.icon className={`w-5 h-5 ${currentRudeness.iconActive}`} />
          </motion.button>

          <AnimatePresence>
            {showRudeness && (
              <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-0 mb-2 w-52 glass-strong rounded-xl border border-white/10 overflow-hidden z-50"
              >
                <div className="p-2 border-b border-white/5">
                  <p className="text-xs text-zinc-500 px-2">Режим общения</p>
                </div>
                {RUDENESS_MODES.map((mode) => {
                  const isActive = rudenessMode === mode.id;
                  return (
                    <button key={mode.id} type="button" onClick={() => handleRudenessSwitch(mode.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-all ${isActive ? mode.activeColor : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? mode.activeColor : 'bg-white/5'}`}>
                        <mode.icon className={`w-4 h-4 ${isActive ? mode.iconActive : 'text-zinc-500'}`} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${isActive ? 'text-white font-medium' : 'text-zinc-400'}`}>{mode.label}</p>
                        <p className="text-[10px] text-zinc-600">{mode.desc}</p>
                      </div>
                      {isActive && <div className={`w-2 h-2 rounded-full ${mode.dotColor}`} />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: supportsImages ? 1.02 : 1 }}
          whileTap={{ scale: supportsImages ? 0.98 : 1 }}
          onClick={() => {
            if (supportsImages && fileInputRef.current) {
              fileInputRef.current.click();
            } else if (!supportsImages) {
              setImageError('Эта модель не поддерживает изображения. Выберите другую модель.');
              setTimeout(() => setImageError(null), 3000);
            }
          }}
          className={`flex items-center justify-center w-[52px] h-[52px] rounded-2xl glass-strong transition-all border border-white/5 ${
            supportsImages
              ? 'hover:bg-white/10 hover:border-violet-500/30'
              : 'opacity-40 cursor-not-allowed'
          }`}
          disabled={generating}
        >
          <ImageIcon className={`w-5 h-5 ${supportsImages ? 'text-violet-400' : 'text-zinc-600'}`} />
        </motion.button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          onChange={handleImageSelect}
          className="hidden"
        />

        <form onSubmit={handleSubmit}
          className={`flex-1 relative rounded-2xl glass-strong border ${isOverLimit ? 'border-red-500/50' : 'border-white/5'}`}
        >
          <div className="relative flex items-center min-h-[52px] pl-4 pr-2">
            <div className="flex-1 flex items-center">
              <textarea ref={textareaRef} value={input} onChange={handleInputChange} onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder={selectedImage ? 'Опишите что нужно сделать с изображением...' : 'Напиши что-нибудь...'}
                disabled={generating}
                maxLength={isUnlimitedUser ? undefined : CHAR_LIMIT} rows={1}
                className="w-full bg-transparent text-white placeholder-zinc-600 resize-none text-[15px] leading-9 max-h-[160px] focus:outline-none"
                style={{ outline: 'none', border: 'none', boxShadow: 'none', height: '36px', minHeight: '36px' }}
              />
            </div>

            {!isUnlimitedUser && input.length > 0 && (
              <span className={`text-[11px] mr-1 flex-shrink-0 ${charCount >= CHAR_LIMIT ? 'text-red-400' : charCount > CHAR_LIMIT * 0.8 ? 'text-orange-400' : 'text-zinc-600'}`}>
                {charCount}/{CHAR_LIMIT}
              </span>
            )}

            <motion.button type="submit" disabled={(!input.trim() && !selectedImage) || generating || isOverLimit}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className={`flex-shrink-0 w-10 h-10 rounded-xl transition-all duration-200 ml-1 flex items-center justify-center ${
                (input.trim() || selectedImage) && !generating && !isOverLimit
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                  : 'bg-white/5 text-zinc-600 cursor-not-allowed'
              }`}
            >
              <Send className={`w-5 h-5 ${generating ? 'animate-pulse' : ''}`} />
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
