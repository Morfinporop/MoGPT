import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Code, Sparkles, MessageCircle, Flame, Smile, Angry } from 'lucide-react';
import { useChatStore, type ResponseMode, type RudenessMode } from '../store/chatStore';
import { aiService } from '../services/aiService';

const SUGGESTIONS = [
  { text: 'Расскажи о себе', icon: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png' },
  { text: 'Напиши код на Python', icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968350.png' },
  { text: 'Объясни машинное обучение', icon: 'https://cdn-icons-png.flaticon.com/512/8618/8618881.png' },
  { text: 'Помоги с задачей', icon: 'https://cdn-icons-png.flaticon.com/512/3176/3176366.png' },
];

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

export function ChatInput() {
  const [input, setInput] = useState('');
  const [showModes, setShowModes] = useState(false);
  const [showRudeness, setShowRudeness] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modesRef = useRef<HTMLDivElement>(null);
  const rudenessRef = useRef<HTMLDivElement>(null);
  
  const { 
    addMessage, 
    updateMessage, 
    isGenerating, 
    setGenerating,
    getCurrentMessages,
    responseMode,
    setResponseMode,
    rudenessMode,
    setRudenessMode,
  } = useChatStore();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const trimmedInput = input.trim();
    if (!trimmedInput || isGenerating) return;

    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    setGenerating(true);

    addMessage({ 
      role: 'user', 
      content: trimmedInput,
    });

    const assistantId = addMessage({ 
      role: 'assistant', 
      content: '', 
      isLoading: true,
      model: 'MoSeek V3',
      thinking: 'Печатаю...',
    });

    try {
      const allMessages = [...getCurrentMessages()];

      const response = await aiService.generateResponse(allMessages, responseMode, rudenessMode);
      
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
      setGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestionClick = (text: string) => {
    setInput(text);
    textareaRef.current?.focus();
  };

  const currentMode = MODES.find(m => m.id === responseMode) || MODES[0];
  const currentRudeness = RUDENESS_MODES.find(m => m.id === rudenessMode) || RUDENESS_MODES[1];
  const messages = getCurrentMessages();

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      {/* Suggestions */}
      <AnimatePresence>
        {messages.length === 0 && !input && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="grid grid-cols-2 gap-2 mb-4"
          >
            {SUGGESTIONS.map((suggestion, i) => (
              <motion.button
                key={suggestion.text}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSuggestionClick(suggestion.text)}
                className="glass-light rounded-xl px-4 py-3 text-left hover:border-violet-500/30 transition-all group flex items-center gap-3"
              >
                <img 
                  src={suggestion.icon} 
                  alt="" 
                  className="w-5 h-5 object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                />
                <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
                  {suggestion.text}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area with Mode Selectors */}
      <div className="flex items-end gap-2">
        {/* Response Mode Selector */}
        <div className="relative" ref={modesRef}>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setShowModes(!showModes); setShowRudeness(false); }}
            className="flex items-center justify-center w-[52px] h-[52px] rounded-2xl glass-strong hover:bg-white/10 transition-all border border-white/5 hover:border-violet-500/30"
          >
            <currentMode.icon className="w-5 h-5 text-violet-400" />
          </motion.button>

          {/* Mode Dropdown */}
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
                    onClick={() => {
                      setResponseMode(mode.id);
                      setShowModes(false);
                    }}
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
                      <p className={`text-sm ${responseMode === mode.id ? 'text-white' : 'text-zinc-400'}`}>
                        {mode.label}
                      </p>
                      <p className="text-[10px] text-zinc-600">{mode.desc}</p>
                    </div>
                    {responseMode === mode.id && (
                      <div className="w-2 h-2 rounded-full bg-violet-500" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Rudeness Mode Selector */}
        <div className="relative" ref={rudenessRef}>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setShowRudeness(!showRudeness); setShowModes(false); }}
            className="flex items-center justify-center w-[52px] h-[52px] rounded-2xl glass-strong hover:bg-white/10 transition-all border border-white/5 hover:border-orange-500/30"
          >
            <currentRudeness.icon className={`w-5 h-5 ${
              rudenessMode === 'very_rude' ? 'text-red-400' : 
              rudenessMode === 'rude' ? 'text-orange-400' : 'text-green-400'
            }`} />
          </motion.button>

          {/* Rudeness Dropdown */}
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
                    onClick={() => {
                      setRudenessMode(mode.id);
                      setShowRudeness(false);
                    }}
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
                      <p className={`text-sm ${rudenessMode === mode.id ? 'text-white' : 'text-zinc-400'}`}>
                        {mode.label}
                      </p>
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

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 relative rounded-2xl overflow-hidden glass-strong shadow-lg shadow-violet-500/5 border border-white/5"
        >
          <div className="relative flex items-center gap-2 px-4 h-[52px]">
            <div className="flex-1 flex items-center">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Напиши что-нибудь..."
                disabled={isGenerating}
                rows={1}
                className="w-full bg-transparent text-white placeholder-zinc-600 resize-none text-[15px] leading-relaxed py-1 max-h-[160px] focus:outline-none"
                style={{ 
                  outline: 'none', 
                  border: 'none', 
                  boxShadow: 'none',
                }}
              />
            </div>

            <motion.button
              type="submit"
              disabled={!input.trim() || isGenerating}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-shrink-0 p-2.5 rounded-xl transition-all duration-200 ${
                input.trim() && !isGenerating
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                  : 'bg-white/5 text-zinc-600 cursor-not-allowed'
              }`}
            >
              <Send className={`w-5 h-5 ${isGenerating ? 'animate-pulse' : ''}`} />
            </motion.button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <p className="text-center text-[11px] text-zinc-600 mt-3">
        MoGPT может ошибаться
      </p>
    </div>
  );
}
