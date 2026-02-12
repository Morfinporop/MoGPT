import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatState, Message, Chat } from '../types';

export type ResponseMode = 'normal' | 'code' | 'visual';
export type RudenessMode = 'very_rude' | 'rude' | 'polite';

interface ExtendedChatState extends ChatState {
  responseMode: ResponseMode;
  rudenessMode: RudenessMode;
  setResponseMode: (mode: ResponseMode) => void;
  setRudenessMode: (mode: RudenessMode) => void;
}

const createChat = (): Chat => ({
  id: crypto.randomUUID(),
  title: 'Новый чат',
  messages: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const useChatStore = create<ExtendedChatState>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChatId: null,
      isGenerating: false,
      sidebarOpen: false,
      responseMode: 'normal',
      rudenessMode: 'rude',

      setResponseMode: (mode) => set({ responseMode: mode }),
      setRudenessMode: (mode) => set({ rudenessMode: mode }),

      createNewChat: () => {
        const newChat = createChat();
        set((state) => ({
          chats: [newChat, ...state.chats],
          currentChatId: newChat.id,
        }));
        return newChat.id;
      },

      deleteChat: (id) => {
        set((state) => {
          const newChats = state.chats.filter(c => c.id !== id);
          const newCurrentId = state.currentChatId === id 
            ? (newChats.length > 0 ? newChats[0].id : null)
            : state.currentChatId;
          return {
            chats: newChats,
            currentChatId: newCurrentId,
          };
        });
      },

      setCurrentChat: (id) => {
        set({ currentChatId: id });
      },

      addMessage: (message) => {
        const msgId = crypto.randomUUID();
        const newMessage: Message = {
          ...message,
          id: msgId,
          timestamp: new Date(),
        };

        set((state) => {
          let currentChatId = state.currentChatId;
          let chats = [...state.chats];
          
          if (!currentChatId) {
            const newChat = createChat();
            currentChatId = newChat.id;
            chats = [newChat, ...chats];
          }

          chats = chats.map(chat => {
            if (chat.id === currentChatId) {
              const newTitle = chat.messages.length === 0 && message.role === 'user'
                ? message.content.slice(0, 40) + (message.content.length > 40 ? '...' : '')
                : chat.title;
                
              return {
                ...chat,
                title: newTitle,
                messages: [...chat.messages, newMessage],
                updatedAt: new Date(),
              };
            }
            return chat;
          });

          return { chats, currentChatId };
        });

        return msgId;
      },

      updateMessage: (id, content, thinking) => {
        set((state) => ({
          chats: state.chats.map(chat => ({
            ...chat,
            messages: chat.messages.map((msg) =>
              msg.id === id ? { ...msg, content, thinking, isLoading: false } : msg
            ),
          })),
        }));
      },

      getCurrentMessages: () => {
        const state = get();
        const currentChat = state.chats.find(c => c.id === state.currentChatId);
        return currentChat?.messages || [];
      },

      setGenerating: (value) => set({ isGenerating: value }),

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: 'mogpt-chats-v3',
      partialize: (state) => ({
        chats: state.chats.slice(0, 50).map(chat => ({
          ...chat,
          messages: chat.messages.slice(-100),
        })),
        currentChatId: state.currentChatId,
        responseMode: state.responseMode,
        rudenessMode: state.rudenessMode,
      }),
    }
  )
);
