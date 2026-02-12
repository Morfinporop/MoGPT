import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import emailjs from '@emailjs/browser';

const API_URL = 'https://moseek-api-production.up.railway.app';
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
  register: (name: string, email: string, password: string) => { success: boolean; error?: string };
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  incrementGuestMessages: () => void;
  canSendMessage: () => boolean;
  sendVerificationCode: (email: string, turnstileToken: string) => Promise<{ success: boolean; error?: string }>;
  verifyCode: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  updateAvatar: (avatar: string) => void;
}

interface StoredUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  password: string;
  createdAt: number;
}

const getStoredUsers = (): StoredUser[] => {
  try {
    const data = localStorage.getItem('moseek_users_db');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveStoredUsers = (users: StoredUser[]) => {
  localStorage.setItem('moseek_users_db', JSON.stringify(users));
};

const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'h_' + Math.abs(hash).toString(36) + '_' + password.length;
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

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=default&backgroundColor=7c3aed';

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
          const storedUsers = getStoredUsers();
          const idx = storedUsers.findIndex(u => u.id === state.user!.id);
          if (idx !== -1) {
            storedUsers[idx].avatar = avatar;
            saveStoredUsers(storedUsers);
          }
          return { user: updated };
        });
      },

      sendVerificationCode: async (email, turnstileToken) => {
        try {
          const res = await fetch(`${API_URL}/api/generate-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, turnstileToken }),
          });
          const data = await res.json();
          if (!res.ok) return { success: false, error: data.error };

          await emailjs.send(
            EMAILJS_SERVICE,
            EMAILJS_TEMPLATE,
            { to_email: email, code: data.code },
            EMAILJS_PUBLIC_KEY
          );

          return { success: true };
        } catch (error) {
          console.error('Send code error:', error);
          return { success: false, error: 'Ошибка отправки кода' };
        }
      },

      verifyCode: async (email, code) => {
        try {
          const res = await fetch(`${API_URL}/api/verify-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code }),
          });
          const data = await res.json();
          if (!res.ok) return { success: false, error: data.error };
          return { success: true };
        } catch {
          return { success: false, error: 'Ошибка соединения' };
        }
      },

      register: (name, email, password) => {
        const storedUsers = getStoredUsers();

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

        if (storedUsers.find(u => u.email.toLowerCase() === email.toLowerCase())) {
          return { success: false, error: 'Этот email уже зарегистрирован' };
        }

        if (storedUsers.find(u => u.name.toLowerCase() === name.trim().toLowerCase())) {
          return { success: false, error: 'Это имя уже занято' };
        }

        if (password.length < 6) {
          return { success: false, error: 'Пароль минимум 6 символов' };
        }

        const newUser: StoredUser = {
          id: Date.now().toString(36) + Math.random().toString(36).slice(2),
          name: name.trim(),
          email: email.toLowerCase().trim(),
          avatar: generateAvatar(name),
          password: hashPassword(password),
          createdAt: Date.now(),
        };

        storedUsers.push(newUser);
        saveStoredUsers(storedUsers);

        set({
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            avatar: newUser.avatar,
            createdAt: newUser.createdAt,
          },
          isAuthenticated: true,
        });

        return { success: true };
      },

      login: (email, password) => {
        const storedUsers = getStoredUsers();
        const found = storedUsers.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

        if (!found) {
          return { success: false, error: 'Пользователь не найден' };
        }

        if (found.password !== hashPassword(password)) {
          return { success: false, error: 'Неверный пароль' };
        }

        set({
          user: {
            id: found.id,
            name: found.name,
            email: found.email,
            avatar: found.avatar,
            createdAt: found.createdAt,
          },
          isAuthenticated: true,
        });

        return { success: true };
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'moseek-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        guestMessages: state.guestMessages,
      }),
    }
  )
);
