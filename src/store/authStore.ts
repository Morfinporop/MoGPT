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
  updateName: (newName: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
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

      updateName: async (newName: string) => {
        const state = get();
        if (!state.user) {
          return { success: false, error: 'Не авторизован' };
        }

        const trimmedName = newName.trim();

        if (trimmedName.length < 2) {
          return { success: false, error: 'Имя должно быть минимум 2 символа' };
        }

        if (trimmedName.length > 50) {
          return { success: false, error: 'Имя слишком длинное (максимум 50 символов)' };
        }

        if (trimmedName.toLowerCase() === state.user.name.toLowerCase()) {
          return { success: false, error: 'Новое имя совпадает с текущим' };
        }

        set({ isLoading: true });

        try {
          const { data: existingName } = await supabase
            .from('users')
            .select('id')
            .ilike('name', trimmedName)
            .neq('id', state.user.id)
            .maybeSingle();

          if (existingName) {
            return { success: false, error: 'Это имя уже занято' };
          }

          const { error: updateError } = await supabase
            .from('users')
            .update({ name: trimmedName })
            .eq('id', state.user.id);

          if (updateError) {
            console.error('Update name error:', updateError);
            return { success: false, error: 'Ошибка обновления. Попробуй ещё раз' };
          }

          const newAvatar = state.user.avatar.includes('dicebear.com')
            ? generateAvatar(trimmedName)
            : state.user.avatar;

          if (newAvatar !== state.user.avatar) {
            await supabase
              .from('users')
              .update({ avatar: newAvatar })
              .eq('id', state.user.id);
          }

          set((s) => ({
            user: s.user ? { ...s.user, name: trimmedName, avatar: newAvatar } : null,
            isLoading: false,
          }));

          return { success: true };
        } catch (e) {
          console.error('Update name error:', e);
          return { success: false, error: 'Ошибка сети. Проверь интернет' };
        } finally {
          set({ isLoading: false });
        }
      },

      updatePassword: async (oldPassword: string, newPassword: string) => {
        const state = get();
        if (!state.user) {
          return { success: false, error: 'Не авторизован' };
        }

        if (!oldPassword) {
          return { success: false, error: 'Введи текущий пароль' };
        }

        if (!newPassword) {
          return { success: false, error: 'Введи новый пароль' };
        }

        if (newPassword.length < 6) {
          return { success: false, error: 'Новый пароль минимум 6 символов' };
        }

        if (oldPassword === newPassword) {
          return { success: false, error: 'Новый пароль совпадает со старым' };
        }

        set({ isLoading: true });

        try {
          const oldHash = await hashPassword(oldPassword);

          // Проверяем старый пароль
          const { data: found, error: fetchError } = await supabase
            .from('users')
            .select('password_hash')
            .eq('id', state.user.id)
            .maybeSingle();

          if (fetchError || !found) {
            return { success: false, error: 'Ошибка проверки. Попробуй ещё раз' };
          }

          if (found.password_hash !== oldHash) {
            return { success: false, error: 'Неверный текущий пароль' };
          }

          // Хешируем и сохраняем новый пароль
          const newHash = await hashPassword(newPassword);

          const { error: updateError } = await supabase
            .from('users')
            .update({ password_hash: newHash })
            .eq('id', state.user.id);

          if (updateError) {
            console.error('Update password error:', updateError);
            return { success: false, error: 'Ошибка обновления. Попробуй ещё раз' };
          }

          return { success: true };
        } catch (e) {
          console.error('Update password error:', e);
          return { success: false, error: 'Ошибка сети. Проверь интернет' };
        } finally {
          set({ isLoading: false });
        }
      },

      deleteAccount: async () => {
        const state = get();
        if (!state.user) {
          return { success: false, error: 'Не авторизован' };
        }

        set({ isLoading: true });

        try {
          const userId = state.user.id;

          await supabase
            .from('user_preferences')
            .delete()
            .eq('user_id', userId);

          await supabase
            .from('user_memory')
            .delete()
            .eq('user_id', userId)
            .then(() => {})
            .catch(() => {});

          await supabase
            .from('chat_messages')
            .delete()
            .eq('user_id', userId)
            .then(() => {})
            .catch(() => {});

          await supabase
            .from('chats')
            .delete()
            .eq('user_id', userId)
            .then(() => {})
            .catch(() => {});

          const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);

          if (deleteError) {
            console.error('Delete account error:', deleteError);
            return { success: false, error: 'Ошибка удаления. Попробуй ещё раз' };
          }

          aiService.setUserId(null);

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            guestMessages: 0,
          });

          try {
            localStorage.removeItem('moseek-auth-v2');
            localStorage.removeItem('moseek-chats');
            sessionStorage.removeItem('moseek_pending_codes');
          } catch {
            // ignore
          }

          return { success: true };
        } catch (e) {
          console.error('Delete account error:', e);
          return { success: false, error: 'Ошибка сети. Проверь интернет' };
        } finally {
          set({ isLoading: false });
        }
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

          const { data: existingEmail } = await supabase
            .from('users')
            .select('id')
            .eq('email', normalizedEmail)
            .maybeSingle();

          if (existingEmail) {
            return { success: false, error: 'Этот email уже зарегистрирован' };
          }

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
