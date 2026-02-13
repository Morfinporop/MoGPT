import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Flame, Smile, Angry, ImagePlus, X, Film, AlertCircle } from 'lucide-react';
import { useChatStore, type RudenessMode } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { aiService } from '../services/aiService';
import { AI_MODELS, modelSupportsImages, modelSupportsVideo } from '../config/models';
import { useCompareMode } from './Header';
import type { MediaAttachment } from '../types';

const RUDENESS_MODES: { id: RudenessMode; label: string; icon: typeof Flame; desc: string; activeColor: string; dotColor: string; iconActive: string; hoverBorder: string }[] = [
  { id: 'very_rude', label: 'Очень грубый', icon: Angry, desc: 'Мат и прямота', activeColor: 'bg-red-500/20', dotColor: 'bg-red-500', iconActive: 'text-red-400', hoverBorder: 'hover:border-red-500/30' },
  { id: 'rude', label: 'Грубый', icon: Flame, desc: 'Дерзкий сарказм', activeColor: 'bg-orange-500/20', dotColor: 'bg-orange-500', iconActive: 'text-orange-400', hoverBorder: 'hover:border-orange-500/30' },
  { id: 'polite', label: 'Вежливый', icon: Smile, desc: 'Без мата и грубости', activeColor: 'bg-green-500/20', dotColor: 'bg-green-500', iconActive: 'text-green-400', hoverBorder: 'hover:border-green-500/30' },
];

const UNLIMITED_EMAILS = ['energoferon41@gmail.com'];
const CHAR_LIMIT = 5000;
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_ATTACHMENTS = 5;

const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/mpeg'];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Убираем prefix "data:image/png;base64," -> оставляем только base64
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function ChatInput() {
  const [input, setInput] = useState('');
  const [showRudeness, setShowRudeness] = useState(false);
  const [showCharLimitWarning, setShowCharLimitWarning] = useState(false);
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const rudenessRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Проверка поддержки медиа текущей моделью
  const supportsImages = modelSupportsImages(selectedModel);
  const supportsVideo = modelSupportsVideo(selectedModel);
  const supportsMedia = supportsImages || supportsVideo;

  const handleRudenessSwitch = useCallback((newRudeness: RudenessMode) => {
    if (newRudeness === rudenessMode) {
      setShowRudeness(false);
      return;
    }
    setRudenessMode(newRudeness);
    setShowRudeness(false);
  }, [rudenessMode, setRudenessMode]);

  // Автовысота textarea
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

  // Клик вне меню грубости
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (rudenessRef.current && !rudenessRef.current.contains(e.target as Node)) setShowRudeness(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Очистка URL объектов при размонтировании
  useEffect(() => {
    return () => {
      attachments.forEach(a => URL.revokeObjectURL(a.url));
    };
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setMediaError(null);

    // Проверка количества
    if (attachments.length + files.length > MAX_ATTACHMENTS) {
      setMediaError(`Максимум ${MAX_ATTACHMENTS} файлов`);
      setTimeout(() => setMediaError(null), 3000);
      return;
    }

    const newAttachments: MediaAttachment[] = [];

    for (const file of files) {
      // Проверка размера
      if (file.size > MAX_FILE_SIZE) {
        setMediaError(`${file.name} слишком большой (макс. 20MB)`);
        setTimeout(() => setMediaError(null), 3000);
        continue;
      }

      const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type);
      const isVideo = SUPPORTED_VIDEO_TYPES.includes(file.type);

      if (!isImage && !isVideo) {
        setMediaError(`${file.name} — неподдерживаемый формат`);
        setTimeout(() => setMediaError(null), 3000);
        continue;
      }

      if (isImage && !supportsImages) {
        setMediaError('Эта модель не поддерживает изображения. Выбери Vision модель.');
        setTimeout(() => setMediaError(null), 4000);
        continue;
      }

      if (isVideo && !supportsVideo) {
        setMediaError('Эта модель не поддерживает видео. Выбери MoSeek Vision Pro.');
        setTimeout(() => setMediaError(null), 4000);
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        const url = URL.createObjectURL(file);

        newAttachments.push({
          id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type: isImage ? 'image' : 'video',
          file,
          url,
          base64,
          mimeType: file.type,
          name: file.name,
          size: file.size,
        });
      } catch (err) {
        console.error('File read error:', err);
        setMediaError(`Ошибка чтения ${file.name}`);
        setTimeout(() => setMediaError(null), 3000);
      }
    }

    setAttachments(prev => [...prev, ...newAttachments]);

    // Сброс input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === id);
      if (attachment) {
        URL.revokeObjectURL(attachment.url);
      }
      return prev.filter(a => a.id !== id);
    });
  };

  const handleMediaButtonClick = () => {
    if (!supportsMedia) {
      setMediaError('Выбери Vision модель для отправки изображений/видео');
      setTimeout(() => setMediaError(null), 4000);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmedInput = input.trim();
    const hasAttachments = attachments.length > 0;

    if ((!trimmedInput && !hasAttachments) || generating || isOverLimit) return;

    const { isDual, secondModelId } = useCompareMode();

    const currentAttachments = [...attachments];

    setInput('');
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = '36px';

    // Добавляем сообщение пользователя с аттачментами
    addMessage({
      role: 'user',
      content: trimmedInput || (hasAttachments ? '(медиа файл)' : ''),
      attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
    });

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

  // Drag & Drop
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (supportsMedia) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (!supportsMedia) {
      setMediaError('Выбери Vision модель для медиа файлов');
      setTimeout(() => setMediaError(null), 4000);
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    if (!files.length) return;

    // Имитируем выбор файлов
    const fakeEvent = {
      target: { files: e.dataTransfer.files },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    await handleFileSelect(fakeEvent);
  };

  // Paste изображений
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.items || []);
      const mediaItems = items.filter(item =>
        SUPPORTED_IMAGE_TYPES.includes(item.type) || SUPPORTED_VIDEO_TYPES.includes(item.type)
      );

      if (mediaItems.length === 0) return;
      if (!supportsMedia) {
        setMediaError('Выбери Vision модель для вставки изображений');
        setTimeout(() => setMediaError(null), 4000);
        return;
      }

      e.preventDefault();

      for (const item of mediaItems) {
        const file = item.getAsFile();
        if (!file) continue;

        if (attachments.length >= MAX_ATTACHMENTS) {
          setMediaError(`Максимум ${MAX_ATTACHMENTS} файлов`);
          setTimeout(() => setMediaError(null), 3000);
          break;
        }

        try {
          const base64 = await fileToBase64(file);
          const url = URL.createObjectURL(file);

          setAttachments(prev => [...prev, {
            id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            type: file.type.startsWith('image/') ? 'image' : 'video',
            file,
            url,
            base64,
            mimeType: file.type,
            name: file.name || 'pasted-image.png',
            size: file.size,
          }]);
        } catch (err) {
          console.error('Paste error:', err);
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [supportsMedia, attachments.length]);

  const currentRudeness = RUDENESS_MODES.find(m => m.id === rudenessMode) || RUDENESS_MODES[1];

  // Принятые форматы для input
  const acceptedFormats = [
    ...(supportsImages ? SUPPORTED_IMAGE_TYPES : []),
    ...(supportsVideo ? SUPPORTED_VIDEO_TYPES : []),
  ].join(',');

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      {/* Предупреждения */}
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

        {mediaError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2 px-4 py-3 mb-3 rounded-xl bg-orange-500/10 border border-orange-500/20"
          >
            <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />
            <p className="text-sm text-orange-300">{mediaError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Превью аттачментов */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3"
          >
            <div className="flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <motion.div
                  key={attachment.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/10 glass-strong">
                    {attachment.type === 'image' ? (
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-black/30">
                        <Film className="w-6 h-6 text-violet-400 mb-1" />
                        <span className="text-[9px] text-zinc-400 text-center px-1 truncate w-full">
                          {attachment.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Размер файла */}
                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm">
                    <span className="text-[9px] text-zinc-300">{formatFileSize(attachment.size)}</span>
                  </div>

                  {/* Кнопка удаления */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeAttachment(attachment.id)}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X className="w-3 h-3 text-white" />
                  </motion.button>
                </motion.div>
              ))}

              {/* Кнопка добавить ещё */}
              {attachments.length < MAX_ATTACHMENTS && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMediaButtonClick}
                  className="w-20 h-20 rounded-xl border border-dashed border-white/20 flex items-center justify-center hover:border-violet-500/40 hover:bg-violet-500/5 transition-all"
                >
                  <ImagePlus className="w-5 h-5 text-zinc-500" />
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Основной инпут */}
      <div
        className="flex items-end gap-2"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Кнопка грубости */}
        <div className="relative" ref={rudenessRef}>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowRudeness(!showRudeness)}
            className={`flex items-center justify-center w-[52px] h-[52px] rounded-2xl glass-strong transition-all border border-white/5 hover:bg-white/10 ${currentRudeness.hoverBorder}`}
          >
            <currentRudeness.icon className={`w-5 h-5 ${currentRudeness.iconActive}`} />
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
                {RUDENESS_MODES.map((mode) => {
                  const isActive = rudenessMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => handleRudenessSwitch(mode.id)}
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

        {/* Форма */}
        <form
          onSubmit={handleSubmit}
          className={`flex-1 relative rounded-2xl glass-strong shadow-lg shadow-violet-500/5 border transition-all ${
            isDragging
              ? 'border-violet-500/50 bg-violet-500/5'
              : isOverLimit
                ? 'border-red-500/50'
                : 'border-white/5'
          }`}
        >
          {/* Drag overlay */}
          {isDragging && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-violet-500/10 backdrop-blur-sm border-2 border-dashed border-violet-500/40">
              <div className="text-center">
                <ImagePlus className="w-8 h-8 text-violet-400 mx-auto mb-1" />
                <p className="text-sm text-violet-300">Отпусти файл</p>
              </div>
            </div>
          )}

          <div className="relative flex items-center min-h-[52px] pl-4 pr-2">
            {/* Кнопка медиа */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleMediaButtonClick}
              className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mr-2 transition-all ${
                supportsMedia
                  ? 'hover:bg-violet-500/20 text-zinc-400 hover:text-violet-400'
                  : 'text-zinc-600 hover:text-zinc-500'
              }`}
              title={supportsMedia ? 'Прикрепить изображение/видео' : 'Модель не поддерживает медиа'}
            >
              <ImagePlus className="w-4.5 h-4.5" />
            </motion.button>

            {/* Скрытый file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedFormats}
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Textarea */}
            <div className="flex-1 flex items-center">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={attachments.length > 0 ? 'Добавь описание...' : 'Напиши что-нибудь...'}
                disabled={generating}
                maxLength={isUnlimitedUser ? undefined : CHAR_LIMIT}
                rows={1}
                className="w-full bg-transparent text-white placeholder-zinc-600 resize-none text-[15px] leading-9 max-h-[160px] focus:outline-none"
                style={{ outline: 'none', border: 'none', boxShadow: 'none', height: '36px', minHeight: '36px' }}
              />
            </div>

            {/* Счётчик символов */}
            {!isUnlimitedUser && input.length > 0 && (
              <span className={`text-[11px] mr-1 flex-shrink-0 ${charCount >= CHAR_LIMIT ? 'text-red-400' : charCount > CHAR_LIMIT * 0.8 ? 'text-orange-400' : 'text-zinc-600'}`}>
                {charCount}/{CHAR_LIMIT}
              </span>
            )}

            {/* Кнопка отправки */}
            <motion.button
              type="submit"
              disabled={(!input.trim() && attachments.length === 0) || generating || isOverLimit}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-shrink-0 w-10 h-10 rounded-xl transition-all duration-200 ml-1 flex items-center justify-center ${
                (input.trim() || attachments.length > 0) && !generating && !isOverLimit
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                  : 'bg-white/5 text-zinc-600 cursor-not-allowed'
              }`}
            >
              <Send className={`w-5 h-5 ${generating ? 'animate-pulse' : ''}`} />
            </motion.button>
          </div>
        </form>
      </div>

      {/* Поддерживаемые форматы */}
      <div className="flex items-center justify-center gap-2 mt-3">
        <p className="text-center text-[11px] text-zinc-600">
          MoSeek может ошибаться
        </p>
        {supportsMedia && (
          <>
            <span className="text-[11px] text-zinc-700">•</span>
            <p className="text-[11px] text-zinc-600">
              {supportsVideo ? 'Фото и видео' : 'Фото'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
