import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Settings } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

const DEF_AV = 'https://media.forgecdn.net/avatars/260/481/637214772494979032.png';

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();
  const isDark = useThemeStore().theme === 'dark';

  useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);

  if (!user) return null;
  const av = user.avatar || DEF_AV;
  const dd = isDark ? 'bg-[#111] border border-white/[0.06]' : 'bg-white border border-black/[0.06] shadow-lg';

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}>
        <img src={av} alt="" className="w-8 h-8 rounded-full object-cover" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}} transition={{duration:0.1}}
            className={`absolute right-0 top-full mt-1.5 w-56 rounded-xl z-50 overflow-hidden ${dd}`}
          >
            <div className={`p-3.5 border-b ${isDark?'border-white/[0.04]':'border-black/[0.04]'}`}>
              <div className="flex items-center gap-2.5">
                <img src={av} alt="" className="w-9 h-9 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <p className={`text-[13px] font-medium truncate ${isDark?'text-white':'text-black'}`}>{user.name}</p>
                  <p className={`text-[10px] truncate ${isDark?'text-zinc-500':'text-zinc-400'}`}>{user.email}</p>
                </div>
              </div>
            </div>
            <div className="p-1">
              {[{i:User,l:'Профиль'},{i:Settings,l:'Настройки'}].map(({i:I,l})=>(
                <button key={l} onClick={()=>setOpen(false)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left ${isDark?'hover:bg-white/[0.04]':'hover:bg-black/[0.02]'}`}>
                  <I className={`w-4 h-4 ${isDark?'text-zinc-500':'text-zinc-400'}`}/><span className={`text-[13px] ${isDark?'text-zinc-400':'text-zinc-600'}`}>{l}</span>
                </button>
              ))}
            </div>
            <div className={`p-1 border-t ${isDark?'border-white/[0.04]':'border-black/[0.04]'}`}>
              <button onClick={()=>{logout();setOpen(false);}} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left ${isDark?'hover:bg-red-500/8':'hover:bg-red-50'}`}>
                <LogOut className="w-4 h-4 text-red-400"/><span className="text-[13px] text-red-400">Выйти</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
