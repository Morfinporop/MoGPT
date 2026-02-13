import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, ChevronDown } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { AI_MODELS } from '../config/models';

type CompareMode = 'single' | 'dual';

export function Header() {
  const { toggleSidebar, selectedModel, setSelectedModel, createNewChat, setCurrentChat } = useChatStore();
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showModelMenu2, setShowModelMenu2] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [compareMode, setCompareMode] = useState<CompareMode>('single');
  const [secondModel, setSecondModel] = useState(AI_MODELS.length > 1 ? AI_MODELS[1].id : AI_MODELS[0].id);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuRef2 = useRef<HTMLDivElement>(null);
  const modeRef = useRef<HTMLDivElement>(null);

  const currentModel = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0];
  const currentModel2 = AI_MODELS.find(m => m.id === secondModel) || AI_MODELS[1] || AI_MODELS[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowModelMenu(false);
      if (menuRef2.current && !menuRef2.current.contains(e.target as Node)) setShowModelMenu2(false);
      if (modeRef.current && !modeRef.current.contains(e.target as Node)) setShowModeMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('moseek_compare_mode');
    if (stored === 'dual') setCompareMode('dual');

    const storedSecond = localStorage.getItem('moseek_second_model');
    if (storedSecond) setSecondModel(storedSecond);
  }, []);

  useEffect(() => {
    localStorage.setItem('moseek_compare_mode', compareMode);
  }, [compareMode]);

  useEffect(() => {
    localStorage.setItem('moseek_second_model', secondModel);
  }, [secondModel]);

  const handleSelectModel = (modelId: string) => {
    if (modelId === selectedModel) {
      setShowModelMenu(false);
      return;
    }
    setSelectedModel(modelId);
    if (compareMode === 'single') {
      const newChatId = createNewChat();
      if (newChatId) setCurrentChat(newChatId);
    }
    setShowModelMenu(false);
  };

  const handleSelectModel2 = (modelId: string) => {
    if (modelId === secondModel) {
      setShowModelMenu2(false);
      return;
    }
    setSecondModel(modelId);
    setShowModelMenu2(false);
  };

  const handleModeChange = (mode: CompareMode) => {
    setCompareMode(mode);
    setShowModeMenu(false);

    if (mode === 'dual' && secondModel === selectedModel) {
      const other = AI_MODELS.find(m => m.id !== selectedModel);
      if (other) setSecondModel(other.id);
    }

    const newChatId = createNewChat();
    if (newChatId) setCurrentChat(newChatId);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="glass-strong border-b border-white/5">
        <div className="h-16 flex items-center px-2 sm:px-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSidebar}
            className="p-2.5 rounded-xl glass-light hover:bg-white/10 transition-all flex-shrink-0"
          >
            <Menu className="w-5 h-5 text-zinc-400" />
          </motion.button>

          <div className="relative ml-2" ref={modeRef}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setShowModeMenu(!showModeMenu); setShowModelMenu(false); setShowModelMenu2(false); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-white/5 transition-all"
            >
              <span className={`text-sm font-semibold ${compareMode === 'dual' ? 'text-violet-400' : 'text-zinc-300'}`}>
                {compareMode === 'single' ? 'Одиночная' : 'Двойная'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${showModeMenu ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {showModeMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 w-48 glass-strong rounded-xl border border-white/10 overflow-hidden z-50"
                >
                  <div className="p-2 border-b border-white/5">
                    <p className="text-[10px] text-zinc-500 px-2">Режим сравнения</p>
                  </div>
                  <button
                    onClick={() => handleModeChange('single')}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-all ${compareMode === 'single' ? 'bg-violet-500/10' : ''}`}
                  >
                    <div className="flex-1">
                      <p className={`text-sm ${compareMode === 'single' ? 'text-white' : 'text-zinc-400'}`}>Одиночная</p>
                      <p className="text-[10px] text-zinc-600">Одна модель отвечает</p>
                    </div>
                    {compareMode === 'single' && <div className="w-2 h-2 rounded-full bg-violet-500" />}
                  </button>
                  <button
                    onClick={() => handleModeChange('dual')}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-all ${compareMode === 'dual' ? 'bg-violet-500/10' : ''}`}
                  >
                    <div className="flex-1">
                      <p className={`text-sm ${compareMode === 'dual' ? 'text-white' : 'text-zinc-400'}`}>Двойная</p>
                      <p className="text-[10px] text-zinc-600">Две модели сравниваются</p>
                    </div>
                    {compareMode === 'dual' && <div className="w-2 h-2 rounded-full bg-violet-500" />}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative ml-1" ref={menuRef}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setShowModelMenu(!showModelMenu); setShowModelMenu2(false); setShowModeMenu(false); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-white/5 transition-all"
            >
              <span className="text-sm font-semibold text-zinc-300">{currentModel.name}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${showModelMenu ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {showModelMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 w-64 glass-strong rounded-xl border border-white/10 overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
                >
                  <div className="p-2.5 border-b border-white/5 sticky top-0 glass-strong z-10">
                    <p className="text-xs text-zinc-500 px-2">{compareMode === 'dual' ? 'Модель 1' : 'Выбор модели'}</p>
                  </div>
                  {AI_MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => handleSelectModel(model.id)}
                      disabled={compareMode === 'dual' && model.id === secondModel}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-all ${
                        selectedModel === model.id ? 'bg-violet-500/10' : ''
                      } ${compareMode === 'dual' && model.id === secondModel ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${selectedModel === model.id ? 'text-white' : 'text-zinc-400'}`}>{model.name}</p>
                        <p className="text-[10px] text-zinc-600 truncate">{model.description}</p>
                      </div>
                      {selectedModel === model.id && <div className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {compareMode === 'dual' && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="relative ml-0.5 flex items-center"
                ref={menuRef2}
              >
                <span className="text-zinc-600 text-sm font-semibold mx-1">vs</span>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setShowModelMenu2(!showModelMenu2); setShowModelMenu(false); setShowModeMenu(false); }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-white/5 transition-all"
                >
                  <span className="text-sm font-semibold text-zinc-300">{currentModel2.name}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${showModelMenu2 ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {showModelMenu2 && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-64 glass-strong rounded-xl border border-white/10 overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
                    >
                      <div className="p-2.5 border-b border-white/5 sticky top-0 glass-strong z-10">
                        <p className="text-xs text-zinc-500 px-2">Модель 2</p>
                      </div>
                      {AI_MODELS.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => handleSelectModel2(model.id)}
                          disabled={model.id === selectedModel}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-all ${
                            secondModel === model.id ? 'bg-violet-500/10' : ''
                          } ${model.id === selectedModel ? 'opacity-30 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${secondModel === model.id ? 'text-white' : 'text-zinc-400'}`}>{model.name}</p>
                            <p className="text-[10px] text-zinc-600 truncate">{model.description}</p>
                          </div>
                          {secondModel === model.id && <div className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1" />

          <div className="pr-2 sm:pr-4">
            <h1 className="text-lg font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              MoSeek
            </h1>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

export function useCompareMode() {
  const stored = localStorage.getItem('moseek_compare_mode');
  const storedSecond = localStorage.getItem('moseek_second_model');
  return {
    isDual: stored === 'dual',
    secondModelId: storedSecond || (AI_MODELS.length > 1 ? AI_MODELS[1].id : AI_MODELS[0].id),
  };
}
