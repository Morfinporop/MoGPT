type AuthStep = 'form' | 'verify';

function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<AuthStep>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [countdown, setCountdown] = useState(0);
  const codeInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const turnstileRef = useRef<any>(null);

  const { register, login, sendVerificationCode, verifyCode } = useAuthStore();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const checkExisting = (): boolean => {
    const storedRaw = localStorage.getItem('moseek_users_db');
    if (!storedRaw) return true;
    try {
      const users = JSON.parse(storedRaw) as any[];
      if (users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase().trim())) {
        setError('Этот email уже зарегистрирован');
        triggerShake();
        return false;
      }
      if (users.find((u: any) => u.name?.toLowerCase() === name.trim().toLowerCase())) {
        setError('Это имя уже занято');
        triggerShake();
        return false;
      }
    } catch {}
    return true;
  };

  const handleSubmit = async () => {
    setError('');

    if (!email.trim()) {
      setError('Введи email');
      triggerShake();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Некорректный email');
      triggerShake();
      return;
    }

    if (mode === 'register') {
      if (!name.trim() || name.trim().length < 2) {
        setError('Имя слишком короткое');
        triggerShake();
        return;
      }
      if (!password || password.length < 6) {
        setError('Пароль минимум 6 символов');
        triggerShake();
        return;
      }

      const VALID_DOMAINS = [
        'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
        'mail.ru', 'yandex.ru', 'ya.ru', 'icloud.com',
        'protonmail.com', 'proton.me', 'bk.ru', 'inbox.ru',
        'list.ru', 'rambler.ru', 'live.com', 'aol.com',
        'zoho.com', 'gmx.com', 'tutanota.com', 'fastmail.com',
        'me.com', 'mac.com', 'msn.com', 'qq.com', '163.com',
        'ukr.net', 'i.ua', 'meta.ua', 'email.ua', 'bigmir.net',
      ];
      const domain = email.split('@')[1]?.toLowerCase();
      if (!domain || !VALID_DOMAINS.includes(domain)) {
        setError('Используй настоящий email (Gmail, Outlook, Mail.ru и т.д.)');
        triggerShake();
        return;
      }

      if (!checkExisting()) return;
    } else {
      if (!password) {
        setError('Введи пароль');
        triggerShake();
        return;
      }
    }

    if (!turnstileToken) {
      setError('Пройди проверку безопасности');
      triggerShake();
      return;
    }

    setIsLoading(true);

    if (mode === 'login') {
      const loginResult = login(email, password);
      if (!loginResult.success) {
        setError(loginResult.error || 'Ошибка входа');
        triggerShake();
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      onClose();
      return;
    }

    const result = await sendVerificationCode(email, turnstileToken);

    if (result.success) {
      setStep('verify');
      setCountdown(60);
      setCode('');
      setTimeout(() => codeInputsRef.current[0]?.focus(), 100);
    } else {
      setError(result.error || 'Ошибка отправки кода');
      triggerShake();
      if (turnstileRef.current) {
        turnstileRef.current.reset();
        setTurnstileToken('');
      }
    }

    setIsLoading(false);
  };

  const handleVerifyAndComplete = async () => {
    setError('');

    if (code.length !== 6) {
      setError('Введи 6-значный код');
      triggerShake();
      return;
    }

    setIsLoading(true);

    const verifyResult = await verifyCode(email, code);

    if (!verifyResult.success) {
      setError(verifyResult.error || 'Неверный код');
      triggerShake();
      setIsLoading(false);
      return;
    }

    const regResult = register(name, email, password);
    if (!regResult.success) {
      setError(regResult.error || 'Ошибка регистрации');
      triggerShake();
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    onClose();
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;

    const newCode = code.split('');
    while (newCode.length < 6) newCode.push('');
    newCode[index] = value;
    const joined = newCode.join('').slice(0, 6);
    setCode(joined);

    if (value && index < 5) {
      codeInputsRef.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeInputsRef.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    setCode(pasted);
    const focusIndex = Math.min(pasted.length, 5);
    codeInputsRef.current[focusIndex]?.focus();
  };

  const handleResend = async () => {
    if (countdown > 0 || !turnstileToken) return;
    setIsLoading(true);
    setError('');

    const result = await sendVerificationCode(email, turnstileToken);
    if (result.success) {
      setCountdown(60);
      setCode('');
    } else {
      setError(result.error || 'Ошибка повторной отправки');
    }

    setIsLoading(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] max-w-[calc(100vw-32px)] max-h-[90vh] overflow-y-auto glass-strong border border-white/10 rounded-2xl z-[70]"
      >
        <motion.div
          animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <div className="px-6 pt-8 pb-4 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-violet-500/30 glow-soft"
            >
              <img
                src={AI_ICON}
                alt="AI"
                className="w-8 h-8 object-contain"
              />
            </motion.div>

            <h2 className="text-xl font-bold text-white mb-1">MoSeek</h2>
            <p className="text-xs text-zinc-500">
              {step === 'verify'
                ? `Код отправлен на ${email}`
                : mode === 'login' ? 'Войди в аккаунт' : 'Создай аккаунт'
              }
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex mx-6 mb-4 rounded-xl glass-light p-1">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      mode === 'login'
                        ? 'bg-violet-500/20 text-violet-300'
                        : 'text-zinc-500 hover:text-zinc-400'
                    }`}
                  >
                    Вход
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(''); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      mode === 'register'
                        ? 'bg-violet-500/20 text-violet-300'
                        : 'text-zinc-500 hover:text-zinc-400'
                    }`}
                  >
                    Регистрация
                  </button>
                </div>

                <div className="px-6 pb-6 space-y-3">
                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div
                        key="error"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20"
                      >
                        <span className="text-xs text-red-300">{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div
                    initial={false}
                    animate={{
                      height: mode === 'register' ? 48 : 0,
                      opacity: mode === 'register' ? 1 : 0,
                      marginBottom: mode === 'register' ? 0 : -12,
                    }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Имя"
                      tabIndex={mode === 'register' ? 0 : -1}
                      className="w-full h-[48px] px-4 rounded-xl glass-light text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 border border-white/5 focus:border-violet-500/30 transition-colors"
                    />
                  </motion.div>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full h-[48px] px-4 rounded-xl glass-light text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 border border-white/5 focus:border-violet-500/30 transition-colors"
                  />

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Пароль"
                      className="w-full h-[48px] px-4 pr-11 rounded-xl glass-light text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 border border-white/5 focus:border-violet-500/30 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                    >
                      <span className="text-sm">{showPassword ? '🙈' : '👁'}</span>
                    </button>
                  </div>

                  <div className="flex justify-center pt-1 overflow-hidden rounded-xl [&_iframe]:!w-full [&>div]:!w-full [&_div]:!w-full">
                    <Turnstile
                      ref={turnstileRef}
                      siteKey={TURNSTILE_SITE_KEY}
                      onSuccess={(token) => setTurnstileToken(token)}
                      onError={() => setTurnstileToken('')}
                      onExpire={() => setTurnstileToken('')}
                      options={{
                        theme: 'dark',
                        size: 'flexible',
                      }}
                    />
                  </div>

                  <motion.button
                    type="button"
                    disabled={isLoading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleSubmit}
                    className="w-full h-[48px] rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium text-sm shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>{mode === 'login' ? 'Войти' : 'Отправить код на почту'}</span>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 'verify' && (
              <motion.div
                key="verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="px-6 pb-6 space-y-4"
              >
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      key="verify-error"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20"
                    >
                      <span className="text-xs text-red-300">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-center gap-2.5" onPaste={handleCodePaste}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <motion.input
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      ref={(el) => { codeInputsRef.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={code[i] || ''}
                      onChange={(e) => handleCodeChange(i, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(i, e)}
                      className="w-12 h-14 text-center text-xl font-bold rounded-xl glass-light text-white border border-white/10 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/30 focus:outline-none transition-all"
                    />
                  ))}
                </div>

                <motion.button
                  type="button"
                  disabled={isLoading || code.length !== 6}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleVerifyAndComplete}
                  className="w-full h-[48px] rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium text-sm shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Подтвердить</span>
                  )}
                </motion.button>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={countdown > 0 || isLoading}
                    className={`text-xs transition-colors ${
                      countdown > 0
                        ? 'text-zinc-600 cursor-not-allowed'
                        : 'text-violet-400 hover:text-violet-300'
                    }`}
                  >
                    {countdown > 0 ? `Повторить через ${countdown}с` : 'Отправить снова'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  );
}
