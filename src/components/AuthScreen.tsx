import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

type AuthMode = 'login' | 'register';

export function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const { register, login } = useAuthStore();

  useEffect(() => {
    setError('');
  }, [mode]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    if (mode === 'register') {
      const result = register(name, email, password);
      if (!result.success) {
        setError(result.error || 'Ошибка регистрации');
        triggerShake();
      }
    } else {
      const result = login(email, password);
      if (!result.success) {
        setError(result.error || 'Ошибка входа');
        triggerShake();
      }
    }

    setIsLoading(false);
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setName('');
    setEmail('');
    setPassword('');
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-[#050508] flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/3 rounded-full blur-[150px]" />
      </div>

      <div className="fixed inset-0 neural-pattern pointer-events-none" style={{ zIndex: 1 }} />
      <div className="fixed inset-0 dot-pattern pointer-events-none opacity-20" style={{ zIndex: 1 }} />
      <div className="noise" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative w-full max-w-md z-10"
      >
        <motion.div
          animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <div className="glass-strong rounded-3xl border border-white/5 overflow-hidden shadow-2xl shadow-violet-500/5">
            <div className="px-8 pt-10 pb-6 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-violet-500/30 glow-soft"
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-white mb-2"
              >
                MoSeek
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-zinc-500 text-sm"
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={mode}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {mode === 'login' ? 'Рад тебя видеть снова' : 'Присоединяйся к нам'}
                  </motion.span>
                </AnimatePresence>
              </motion.p>
            </div>

            <div className="flex mx-8 mb-6 rounded-xl glass-light p-1">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  mode === 'login'
                    ? 'bg-violet-500/20 text-violet-300 shadow-lg shadow-violet-500/10'
                    : 'text-zinc-500 hover:text-zinc-400'
                }`}
              >
                Вход
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  mode === 'register'
                    ? 'bg-violet-500/20 text-violet-300 shadow-lg shadow-violet-500/10'
                    : 'text-zinc-500 hover:text-zinc-400'
                }`}
              >
                Регистрация
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-300">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {mode === 'register' && (
                  <motion.div
                    key="name-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative group mb-4">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <User className="w-5 h-5 text-zinc-600 group-focus-within:text-violet-400 transition-colors" />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Имя"
                        className="w-full pl-12 pr-4 py-4 rounded-xl glass-light text-white placeholder-zinc-600 text-[15px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 border border-white/5 focus:border-violet-500/30 transition-all"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Mail className="w-5 h-5 text-zinc-600 group-focus-within:text-violet-400 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-xl glass-light text-white placeholder-zinc-600 text-[15px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 border border-white/5 focus:border-violet-500/30 transition-all"
                />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Lock className="w-5 h-5 text-zinc-600 group-focus-within:text-violet-400 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Пароль"
                  required
                  className="w-full pl-12 pr-12 py-4 rounded-xl glass-light text-white placeholder-zinc-600 text-[15px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 border border-white/5 focus:border-violet-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium text-[15px] shadow-2xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    <span>Подождите...</span>
                  </div>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Войти' : 'Создать аккаунт'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>

              <p className="text-center text-sm text-zinc-600 pt-2">
                {mode === 'login' ? (
                  <>
                    Нет аккаунта?{' '}
                    <button
                      type="button"
                      onClick={switchMode}
                      className="text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      Зарегистрируйся
                    </button>
                  </>
                ) : (
                  <>
                    Уже есть аккаунт?{' '}
                    <button
                      type="button"
                      onClick={switchMode}
                      className="text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      Войди
                    </button>
                  </>
                )}
              </p>
            </form>
          </div>

          <p className="text-center text-[11px] text-zinc-700 mt-4">
            MoSeek V3 • AI Assistant
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
