import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'mail.ru',
  'yandex.ru',
  'ya.ru',
  'icloud.com',
  'protonmail.com',
  'proton.me',
  'bk.ru',
  'inbox.ru',
  'list.ru',
  'rambler.ru',
  'live.com',
  'aol.com',
  'zoho.com',
  'gmx.com',
  'tutanota.com',
  'fastmail.com',
  'me.com',
  'mac.com',
  'msn.com',
  'qq.com',
  '163.com',
  'ukr.net',
  'i.ua',
  'meta.ua',
  'email.ua',
  'bigmir.net',
];

const isValidEmailDomain = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  return VALID_EMAIL_DOMAINS.includes(domain);
};

const generateAvatar = (name: string): string => {
  const colors = ['7c3aed', '8b5cf6', 'a855f7', 'c084fc', '6d28d9', '5b21b6', '4c1d95'];
  const color = colors[Math.abs(name.charCodeAt(0)) % colors.length];
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${color}&color=fff&size=128&bold=true&format=svg`;
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
        set((state) => ({
          guestMessages: state.guestMessages + 1,
        }));
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
          avatar: generateAvatar(name.trim()),
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
        set({
          user: null,
          isAuthenticated: false,
        });
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
