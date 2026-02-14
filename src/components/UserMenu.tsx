import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Settings } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!user) return null;

  const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="relative" ref={ref}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-shadow ${
          isDark
            ? 'bg-white text-black hover:shadow-lg'
            : 'bg-black text-white hover:shadow-lg'
        }`}
      >
        {initials}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className={`absolute right-0 top-full mt-2 w-60 rounded-xl overflow-hidden z-50 shadow-xl ${
              isDark ? 'bg-[#1c1c1e] border border-white/[0.08]' : 'bg-white border border-black/[0.06] shadow-lg'
            }`}
          >
            <div className={`p-4 border-b ${isDark ? 'border-white/[0.06]' : 'border-black/[0.04]'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  isDark ? 'bg-white text-black' : 'bg-black text-white'
                }`}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-black'}`}>{user.name}</p>
                  <p className={`text-[11px] truncate ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{user.email}</p>
                </div>
              </div>
            </div>

            <div className="p-1.5">
              <button
                onClick={() => setOpen(false)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                  isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-black/[0.03]'
                }`}
              >
                <User className={`w-4 h-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
                <span className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Профиль</span>
              </button>
              <button
                onClick={() => setOpen(false)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                  isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-black/[0.03]'
                }`}
              >
                <Settings className={`w-4 h-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
                <span className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Настройки</span>
              </button>
            </div>

            <div className={`p-1.5 border-t ${isDark ? 'border-white/[0.06]' : 'border-black/[0.04]'}`}>
              <button
                onClick={() => { logout(); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all group ${
                  isDark ? 'hover:bg-red-500/10' : 'hover:bg-red-50'
                }`}
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">Выйти</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
