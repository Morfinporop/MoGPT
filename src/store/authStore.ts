import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import emailjs from '@emailjs/browser';
import { supabase } from '../services/supabaseClient';
import { aiService } from '../services/aiService';

const EMAILJS_SERVICE = 'service_jijg2le';
const EMAILJS_TEMPLATE = 'template_ov1skr7';
const EMAILJS_PUBLIC_KEY = 't8XHLcCRf_5ITFOHp';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  guestMessages: number;
  maxGuestMessages: number;
  isLoading: boolean;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  incrementGuestMessages: () => void;
  canSendMessage: () => boolean;
  sendVerificationCode: (email: string, turnstileToken: string) => Promise<{ success: boolean; error?: string }>;
  verifyCode: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  updateAvatar: (avatar: string) => void;
}

interface PendingCode {
  email: string;
  code: string;
  expiresAt: number;
  attempts: number;
}

const getPendingCodes = (): PendingCode[] => {
  try {
    const data = sessionStorage.getItem('moseek_pending_codes');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const savePendingCodes = (codes: PendingCode[]) => {
  sessionStorage.setItem('moseek_pending_codes', JSON.stringify(codes));
};

const generateCode = (): string => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(100000 + (array[0] % 900000));
};

const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '_mogpt_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const VALID_EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
  'mail.ru', 'yandex.ru', 'ya.ru', 'icloud.com',
  'protonmail.com', 'proton.me', 'bk.ru', 'inbox.ru',
  'list.ru', 'rambler.ru', 'live.com', 'aol.com',
  'zoho.com', 'gmx.com', 'tutanota.com', 'fastmail.com',
  'me.com', 'mac.com', 'msn.com', 'qq.com', '163.com',
  'ukr.net', 'i.ua', 'meta.ua', 'email.ua', 'bigmir.net',
];

const isValidEmailDomain = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  return VALID_EMAIL_DOMAINS.includes(domain);
};

const generateAvatar = (name: string): string => {
  const seed = encodeURIComponent(name.trim().toLowerCase());
  return `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${seed}&backgroundColor=7c3aed`;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      guestMessages: 0,
      maxGuestMessages: 10,
      isLoading: false,

      canSendMessage: () => {
        const state = get();
        if (state.isAuthenticated) return true;
        return state.guestMessages < state.maxGuestMessages;
      },

      incrementGuestMessages: () => {
        set((state) => ({ guestMessages: state.guestMessages + 1 }));
      },

      updateAvatar: (avatar: string) => {
        set((state) => {
          if (!state.user) return state;
          const updated = { ...state.user, avatar };
          supabase
            .from('users')
            .update({ avatar })
            .eq('id', state.user.id)
            .then(() => {});
          return { user: updated };
        });
      },

      sendVerificationCode: async (email, _turnstileToken) => {
        try {
          const normalizedEmail = email.toLowerCase().trim();
          const pendingCodes = getPendingCodes();
          const existing = pendingCodes.find(p => p.email === normalizedEmail);
          if (existing && existing.expiresAt > Date.now() && existing.attempts >= 5) {
            return { success: false, error: 'Слишком много попыток. Подожди немного' };
          }

          const code = generateCode();
          const filtered = pendingCodes.filter(p => p.email !== normalizedEmail);
          filtered.push({
            email: normalizedEmail,
            code,
            expiresAt: Date.now() + 5 * 60 * 1000,
            attempts: 0,
          });
          savePendingCodes(filtered);

          await emailjs.send(
            EMAILJS_SERVICE,
            EMAILJS_TEMPLATE,
            {
              to_email: normalizedEmail,
              code: code,
              message: `Ваш код подтверждения MoSeek: ${code}`,
            },
            EMAILJS_PUBLIC_KEY
          );

          return { success: true };
        } catch (error) {
          console.error('EmailJS error:', error);
          return { success: false, error: 'Не удалось отправить код. Проверь email и попробуй снова' };
        }
      },

      verifyCode: async (email, code) => {
        try {
          const normalizedEmail = email.toLowerCase().trim();
          const pendingCodes = getPendingCodes();
          const pendingIndex = pendingCodes.findIndex(p => p.email === normalizedEmail);

          if (pendingIndex === -1) {
            return { success: false, error: 'Код не найден. Запроси новый' };
          }

          const pending = pendingCodes[pendingIndex];

          if (pending.expiresAt < Date.now()) {
            pendingCodes.splice(pendingIndex, 1);
            savePendingCodes(pendingCodes);
            return { success: false, error: 'Код истёк. Запроси новый' };
          }

          pending.attempts += 1;
          savePendingCodes(pendingCodes);

          if (pending.attempts > 5) {
            pendingCodes.splice(pendingIndex, 1);
            savePendingCodes(pendingCodes);
            return { success: false, error: 'Слишком много попыток. Запроси новый код' };
          }

          if (pending.code !== code.trim()) {
            return { success: false, error: `Неверный код. Осталось попыток: ${6 - pending.attempts}` };
          }

          pendingCodes.splice(pendingIndex, 1);
          savePendingCodes(pendingCodes);
          return { success: true };
        } catch {
          return { success: false, error: 'Ошибка проверки кода' };
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          if (name.trim().length < 2) {
            return { success: false, error: 'Имя слишком короткое' };
          }

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            return { success: false, error: 'Некорректный email' };
          }

          if (!isValidEmailDomain(email)) {
            return { success: false, error: 'Используй настоящий email (Gmail, Outlook, Mail.ru и т.д.)' };
          }

          if (password.length < 6) {
            return { success: false, error: 'Пароль минимум 6 символов' };
          }

          const normalizedEmail = email.toLowerCase().trim();
          const trimmedName = name.trim();

          // Проверяем email в Supabase
          const { data: existingEmail } = await supabase
            .from('users')
            .select('id')
            .eq('email', normalizedEmail)
            .maybeSingle();

          if (existingEmail) {
            return { success: false, error: 'Этот email уже зарегистрирован' };
          }

          // Проверяем имя
          const { data: existingName } = await supabase
            .from('users')
            .select('id')
            .ilike('name', trimmedName)
            .maybeSingle();

          if (existingName) {
            return { success: false, error: 'Это имя уже занято' };
          }

          const passwordHash = await hashPassword(password);
          const avatar = generateAvatar(trimmedName);

          // Записываем в Supabase
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
              name: trimmedName,
              email: normalizedEmail,
              password_hash: passwordHash,
              avatar,
            })
            .select()
            .single();

          if (insertError || !newUser) {
            console.error('Supabase insert error:', insertError);
            return { success: false, error: 'Ошибка регистрации. Попробуй ещё раз' };
          }

          // Создаём настройки
          await supabase
            .from('user_preferences')
            .insert({
              user_id: newUser.id,
              preferred_language: 'ru',
              response_mode: 'normal',
              rudeness_mode: 'rude',
            });

          const user: User = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            avatar: newUser.avatar || avatar,
            createdAt: new Date(newUser.created_at).getTime(),
          };

          // Устанавливаем userId в aiService для памяти
          aiService.setUserId(user.id);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true };
        } catch (e) {
          console.error('Registration error:', e);
          return { success: false, error: 'Ошибка сети. Проверь интернет' };
        } finally {
          set({ isLoading: false });
        }
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const normalizedEmail = email.toLowerCase().trim();
          const passwordHash = await hashPassword(password);

          // Ищем в Supabase
          const { data: found, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', normalizedEmail)
            .maybeSingle();

          if (error || !found) {
            return { success: false, error: 'Пользователь не найден' };
          }

          if (found.password_hash !== passwordHash) {
            return { success: false, error: 'Неверный пароль' };
          }

          const user: User = {
            id: found.id,
            name: found.name,
            email: found.email,
            avatar: found.avatar || generateAvatar(found.name),
            createdAt: new Date(found.created_at).getTime(),
          };

          // Устанавливаем userId в aiService для памяти
          aiService.setUserId(user.id);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true };
        } catch (e) {
          console.error('Login error:', e);
          return { success: false, error: 'Ошибка сети. Проверь интернет' };
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        aiService.setUserId(null);
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'moseek-auth-v2',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        guestMessages: state.guestMessages,
      }),
    }
  )
);
