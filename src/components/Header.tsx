import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { MODEL_ICON } from '../config/models';

export function Header() {
  const { toggleSidebar } = useChatStore();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="glass-strong border-b border-white/5">
        <div className="max-w-5xl mx-auto h-16 flex items-center">
          {/* Left - Menu (максимально левее для ПК) */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSidebar}
            className="p-2.5 rounded-xl glass-light hover:bg-white/10 transition-all ml-2 sm:ml-4 lg:ml-0 lg:absolute lg:left-4"
          >
            <Menu className="w-5 h-5 text-zinc-400" />
          </motion.button>

          {/* Center - Logo & Model (фиксированная позиция) */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center glow-soft">
                <img 
                  src={MODEL_ICON} 
                  alt="MoSeek" 
                  className="w-5 h-5 object-contain filter brightness-0 invert"
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#0a0a0f]" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                MoSeek
              </h1>
              <span className="text-[10px] text-zinc-600 px-2 py-0.5 rounded-full bg-white/5 hidden sm:inline">MoSeek V3</span>
            </div>
          </div>

          {/* Right - пусто */}
          <div className="flex-1" />
        </div>
      </div>
    </motion.header>
  );
}
