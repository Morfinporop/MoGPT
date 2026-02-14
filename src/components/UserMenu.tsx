import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Settings } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

const DEFAULT_AVATAR = 'https://media.forgecdn.net/avatars/260/481/637214772494979032.png';

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  if (!user) return null;
  const avatar = user.avatar || DEFAULT_AVATAR;

  return (
    <div className="relative" ref={ref}>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setOpen(!open)}>
        <img src={avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-white/10 hover:ring-white/20 transition-all" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.97 }} transition={{ duration: 0.12 }}
            className={`absolute right-0 top-full mt-2 w-60 rounded-2xl overflow-hidden z-50 shadow-2xl ${
              isDark ? 'bg-[#161616]/95 backdrop-blur-xl border border-white/[0.08]' : 'bg-white/95 backdrop-blur-xl border border-black/[0.06] shadow-xl'
            }`}
          >
            <div className={`p-4 border-b ${isDark ? 'border-white/[0.05]' : 'border-black/[0.04]'}`}>
              <div className="flex items-center gap-3">
                <img src={avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10" />
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-medium truncate ${isDark ? 'text-white' : 'text-black'}`}>{user.name}</p>
                  <p className={`text-[11px] truncate ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{user.email}</p>
                </div>
              </div>
            </div>
            <div className="p-1.5">
              <button onClick={() => setOpen(false)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-black/[0.02]'}`}>
                <User className={`w-4 h-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} /><span className={`text-[13px] ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Профиль</span>
              </button>
              <button onClick={() => setOpen(false)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-black/[0.02]'}`}>
                <Settings className={`w-4 h-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} /><span className={`text-[13px] ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Настройки</span>
              </button>
            </div>
            <div className={`p-1.5 border-t ${isDark ? 'border-white/[0.05]' : 'border-black/[0.04]'}`}>
              <button onClick={() => { logout(); setOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${isDark ? 'hover:bg-red-500/10' : 'hover:bg-red-50'}`}>
                <LogOut className="w-4 h-4 text-red-400" /><span className="text-[13px] text-red-400">Выйти</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
