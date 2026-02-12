import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Settings } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative" ref={ref}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-shadow"
      >
        {initials}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 glass-strong rounded-2xl border border-white/10 overflow-hidden z-50"
          >
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{user.name}</p>
                  <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-white/5 transition-all"
              >
                <User className="w-4 h-4 text-zinc-500" />
                <span className="text-sm text-zinc-400">Профиль</span>
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-white/5 transition-all"
              >
                <Settings className="w-4 h-4 text-zinc-500" />
                <span className="text-sm text-zinc-400">Настройки</span>
              </button>
            </div>

            <div className="p-2 border-t border-white/5">
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-red-500/10 transition-all group"
              >
                <LogOut className="w-4 h-4 text-zinc-500 group-hover:text-red-400 transition-colors" />
                <span className="text-sm text-zinc-400 group-hover:text-red-400 transition-colors">Выйти</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
