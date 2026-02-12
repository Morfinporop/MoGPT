import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, ChevronDown } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { AI_MODELS } from '../config/models';

export function Header() {
  const { toggleSidebar, selectedModel, setSelectedModel, createNewChat, setCurrentChat } = useChatStore();
  const [showModelMenu, setShowModelMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentModel = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowModelMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectModel = (modelId: string) => {
    if (modelId === selectedModel) {
      setShowModelMenu(false);
      return;
    }
    setSelectedModel(modelId);
    const newChatId = createNewChat();
    if (newChatId) {
      setCurrentChat(newChatId);
    }
    setShowModelMenu(false);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="glass-strong border-b border-white/5">
        <div className="max-w-5xl mx-auto h-16 flex items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSidebar}
            className="p-2.5 rounded-xl glass-light hover:bg-white/10 transition-all ml-2 sm:ml-4 lg:ml-0 lg:absolute lg:left-4"
          >
            <Menu className="w-5 h-5 text-zinc-400" />
          </motion.button>

          <div className="relative ml-2 sm:ml-3" ref={menuRef}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowModelMenu(!showModelMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-all"
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
                  className="absolute top-full left-0 mt-2 w-64 glass-strong rounded-xl border border-white/10 overflow-hidden z-50"
                >
                  <div className="p-2 border-b border-white/5">
                    <p className="text-xs text-zinc-500 px-2">Выбор модели</p>
                  </div>
                  {AI_MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => handleSelectModel(model.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-all ${
                        selectedModel === model.id ? 'bg-violet-500/10' : ''
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${model.color} p-[1px]`}>
                        <div className="w-full h-full rounded-xl bg-zinc-900 flex items-center justify-center">
                          <img src={model.icon} alt={model.name} className="w-5 h-5 invert opacity-80" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${selectedModel === model.id ? 'text-white' : 'text-zinc-400'}`}>{model.name}</p>
                        <p className="text-[10px] text-zinc-600 truncate">{model.description}</p>
                      </div>
                      {selectedModel === model.id && (
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${model.color}`} />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1" />

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none">
            <h1 className="text-lg font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              MoSeek
            </h1>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
