import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, ChevronDown } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useThemeStore } from '../store/themeStore';
import { AI_MODELS } from '../config/models';

type CompareMode = 'single' | 'dual';

export function Header() {
  const { toggleSidebar, selectedModel, setSelectedModel, createNewChat, setCurrentChat } = useChatStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
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
    if (modelId === selectedModel) { setShowModelMenu(false); return; }
    setSelectedModel(modelId);
    if (compareMode === 'single') {
      const newChatId = createNewChat();
      if (newChatId) setCurrentChat(newChatId);
    }
    setShowModelMenu(false);
  };

  const handleSelectModel2 = (modelId: string) => {
    if (modelId === secondModel) { setShowModelMenu2(false); return; }
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
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className={`border-b ${isDark ? 'bg-[#000000]/90 backdrop-blur-xl border-white/[0.06]' : 'bg-white/90 backdrop-blur-xl border-black/[0.06]'}`}>
        <div className="h-14 flex items-center px-3 sm:px-4">
          {/* Hamburger */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSidebar}
            className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-black/[0.04]'}`}
          >
            <Menu className={`w-5 h-5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
          </motion.button>

          {/* Mode selector */}
          <div className="relative ml-2" ref={modeRef}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setShowModeMenu(!showModeMenu); setShowModelMenu(false); setShowModelMenu2(false); }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-black/[0.04]'}`}
            >
              <span className={`text-sm font-medium ${
                compareMode === 'dual'
                  ? 'text-[#2196F3]'
                  : isDark ? 'text-zinc-400' : 'text-zinc-500'
              }`}>
                {compareMode === 'single' ? 'Одиночная' : 'Двойная'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isDark ? 'text-zinc-500' : 'text-zinc-400'
              } ${showModeMenu ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {showModeMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  className={`absolute top-full left-0 mt-1.5 w-48 rounded-xl overflow-hidden z-50 shadow-xl ${
                    isDark ? 'bg-[#1c1c1e] border border-white/[0.08]' : 'bg-white border border-black/[0.06] shadow-lg'
                  }`}
                >
                  <div className={`px-3 py-2 border-b ${isDark ? 'border-white/[0.06]' : 'border-black/[0.04]'}`}>
                    <p className={`text-[11px] font-medium ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Режим</p>
                  </div>
                  {(['single', 'dual'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handleModeChange(mode)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-all ${
                        isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-black/[0.03]'
                      } ${compareMode === mode ? isDark ? 'bg-white/[0.04]' : 'bg-black/[0.02]' : ''}`}
                    >
                      <div>
                        <p className={`text-sm ${
                          compareMode === mode
                            ? isDark ? 'text-white font-medium' : 'text-black font-medium'
                            : isDark ? 'text-zinc-400' : 'text-zinc-500'
                        }`}>
                          {mode === 'single' ? 'Одиночная' : 'Двойная'}
                        </p>
                        <p className={`text-[10px] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                          {mode === 'single' ? 'Одна модель' : 'Две модели'}
                        </p>
                      </div>
                      {compareMode === mode && <div className="w-2 h-2 rounded-full bg-[#2196F3]" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Model 1 selector */}
          <div className="relative ml-1" ref={menuRef}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setShowModelMenu(!showModelMenu); setShowModelMenu2(false); setShowModeMenu(false); }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-black/[0.04]'}`}
            >
              <span className={`text-sm font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{currentModel.name}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDark ? 'text-zinc-500' : 'text-zinc-400'} ${showModelMenu ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {showModelMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  className={`absolute top-full left-0 mt-1.5 w-60 rounded-xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto shadow-xl ${
                    isDark ? 'bg-[#1c1c1e] border border-white/[0.08]' : 'bg-white border border-black/[0.06] shadow-lg'
                  }`}
                >
                  <div className={`px-3 py-2 border-b sticky top-0 z-10 ${
                    isDark ? 'border-white/[0.06] bg-[#1c1c1e]' : 'border-black/[0.04] bg-white'
                  }`}>
                    <p className={`text-[11px] font-medium ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      {compareMode === 'dual' ? 'Модель 1' : 'Модель'}
                    </p>
                  </div>
                  {AI_MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => handleSelectModel(model.id)}
                      disabled={compareMode === 'dual' && model.id === secondModel}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-all ${
                        isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-black/[0.03]'
                      } ${selectedModel === model.id ? isDark ? 'bg-white/[0.04]' : 'bg-black/[0.02]' : ''} ${
                        compareMode === 'dual' && model.id === secondModel ? 'opacity-30 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm ${selectedModel === model.id ? isDark ? 'text-white font-medium' : 'text-black font-medium' : isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{model.name}</p>
                        <p className={`text-[10px] truncate ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{model.description}</p>
                      </div>
                      {selectedModel === model.id && <div className="w-2 h-2 rounded-full bg-[#2196F3] flex-shrink-0" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Model 2 (dual mode) */}
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
                <span className={`text-xs font-medium mx-1 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>vs</span>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setShowModelMenu2(!showModelMenu2); setShowModelMenu(false); setShowModeMenu(false); }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-black/[0.04]'}`}
                >
                  <span className={`text-sm font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{currentModel2.name}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDark ? 'text-zinc-500' : 'text-zinc-400'} ${showModelMenu2 ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {showModelMenu2 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.98 }}
                      transition={{ duration: 0.12 }}
                      className={`absolute top-full left-0 mt-1.5 w-60 rounded-xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto shadow-xl ${
                        isDark ? 'bg-[#1c1c1e] border border-white/[0.08]' : 'bg-white border border-black/[0.06] shadow-lg'
                      }`}
                    >
                      <div className={`px-3 py-2 border-b sticky top-0 z-10 ${
                        isDark ? 'border-white/[0.06] bg-[#1c1c1e]' : 'border-black/[0.04] bg-white'
                      }`}>
                        <p className={`text-[11px] font-medium ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Модель 2</p>
                      </div>
                      {AI_MODELS.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => handleSelectModel2(model.id)}
                          disabled={model.id === selectedModel}
                          className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-all ${
                            isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-black/[0.03]'
                          } ${secondModel === model.id ? isDark ? 'bg-white/[0.04]' : 'bg-black/[0.02]' : ''} ${
                            model.id === selectedModel ? 'opacity-30 cursor-not-allowed' : ''
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm ${secondModel === model.id ? isDark ? 'text-white font-medium' : 'text-black font-medium' : isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{model.name}</p>
                            <p className={`text-[10px] truncate ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{model.description}</p>
                          </div>
                          {secondModel === model.id && <div className="w-2 h-2 rounded-full bg-[#2196F3] flex-shrink-0" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1" />

          {/* Logo */}
          <div className="pr-2 sm:pr-4">
            <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>
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
