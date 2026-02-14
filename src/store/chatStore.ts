// src/store/chatStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatState, Message, Chat } from '../types';
import { DEFAULT_MODEL } from '../config/models';
import { supabase } from '../services/supabaseClient';

export type ResponseMode = 'normal' | 'code' | 'visual';
export type RudenessMode = 'very_rude' | 'rude' | 'polite';

interface ExtendedChatState extends ChatState {
  responseMode: ResponseMode;
  rudenessMode: RudenessMode;
  selectedModel: string;
  generatingChatIds: Set<string>;
  isSyncing: boolean;
  setResponseMode: (mode: ResponseMode) => void;
  setRudenessMode: (mode: RudenessMode) => void;
  setSelectedModel: (modelId: string) => void;
  setGeneratingChat: (chatId: string, value: boolean) => void;
  isCurrentChatGenerating: () => boolean;
  syncToCloud: (userId: string) => Promise<void>;
  syncFromCloud: (userId: string) => Promise<void>;
  archiveChat: (chatId: string) => void;
  unarchiveChat: (chatId: string) => void;
  getActiveChats: () => Chat[];
  getArchivedChats: () => Chat[];
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
      selectedModel: DEFAULT_MODEL,
      generatingChatIds: new Set<string>(),
      isSyncing: false,

      setResponseMode: (mode) => set({ responseMode: mode }),
      setRudenessMode: (mode) => set({ rudenessMode: mode }),
      setSelectedModel: (modelId) => set({ selectedModel: modelId }),

      setGeneratingChat: (chatId, value) => {
        set((state) => {
          const newSet = new Set(state.generatingChatIds);
          if (value) newSet.add(chatId);
          else newSet.delete(chatId);
          return { generatingChatIds: newSet };
        });
      },

      isCurrentChatGenerating: () => {
        const state = get();
        if (!state.currentChatId) return false;
        return state.generatingChatIds.has(state.currentChatId);
      },

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
          const activeChats = newChats.filter(c => !(c as any).archived);
          const newCurrentId = state.currentChatId === id
            ? (activeChats.length > 0 ? activeChats[0].id : null)
            : state.currentChatId;
          return { chats: newChats, currentChatId: newCurrentId };
        });
        supabase.from('chats').delete().eq('id', id).then(() => {});
      },

      setCurrentChat: (id) => set({ currentChatId: id }),

      archiveChat: (chatId) => {
        set((state) => {
          const newChats = state.chats.map(c =>
            c.id === chatId ? { ...c, archived: true, updatedAt: new Date() } : c
          );
          const activeChats = newChats.filter(c => !(c as any).archived);
          const newCurrentId = state.currentChatId === chatId
            ? (activeChats.length > 0 ? activeChats[0].id : null)
            : state.currentChatId;
          return { chats: newChats, currentChatId: newCurrentId };
        });
      },

      unarchiveChat: (chatId) => {
        set((state) => ({
          chats: state.chats.map(c =>
            c.id === chatId ? { ...c, archived: false, updatedAt: new Date() } : c
          ),
        }));
      },

      getActiveChats: () => {
        return get().chats.filter(c => !(c as any).archived);
      },

      getArchivedChats: () => {
        return get().chats.filter(c => (c as any).archived);
      },

      addMessage: (message) => {
        const msgId = crypto.randomUUID();
        const newMessage: Message = {
          id: msgId,
          role: message.role,
          content: message.content,
          timestamp: new Date(),
          isLoading: message.isLoading,
          model: message.model,
          thinking: message.thinking,
          isTyping: message.isTyping,
          dualPosition: message.dualPosition,
          dualPairId: message.dualPairId,
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

      syncToCloud: async (userId: string) => {
        const state = get();
        set({ isSyncing: true });

        try {
          await supabase
            .from('user_preferences')
            .upsert({
              user_id: userId,
              response_mode: state.responseMode,
              rudeness_mode: state.rudenessMode,
              selected_model: state.selectedModel,
              updated_at: new Date().toISOString(),
            });

          for (const chat of state.chats.slice(0, 30)) {
            await supabase
              .from('chats')
              .upsert({
                id: chat.id,
                user_id: userId,
                title: chat.title,
                archived: (chat as any).archived || false,
                created_at: new Date(chat.createdAt).toISOString(),
                updated_at: new Date(chat.updatedAt).toISOString(),
              });

            const msgs = chat.messages
              .filter(m => !m.isLoading && m.content?.trim())
              .slice(-50);

            if (msgs.length > 0) {
              await supabase.from('messages').upsert(
                msgs.map(m => ({
                  id: m.id,
                  chat_id: chat.id,
                  role: m.role,
                  content: m.content,
                  model: m.model || null,
                  thinking: m.thinking || null,
                  created_at: new Date(m.timestamp).toISOString(),
                }))
              );
            }
          }
        } catch (e) {
          console.error('Sync to cloud error:', e);
        } finally {
          set({ isSyncing: false });
        }
      },

      syncFromCloud: async (userId: string) => {
        set({ isSyncing: true });

        try {
          const { data: prefs } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

          if (prefs) {
            set({
              responseMode: (prefs.response_mode as ResponseMode) || 'normal',
              rudenessMode: (prefs.rudeness_mode as RudenessMode) || 'rude',
              selectedModel: prefs.selected_model || DEFAULT_MODEL,
            });
          }

          const { data: cloudChats } = await supabase
            .from('chats')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false })
            .limit(50);

          if (cloudChats && cloudChats.length > 0) {
            const chats: Chat[] = [];

            for (const cc of cloudChats) {
              const { data: cloudMessages } = await supabase
                .from('messages')
                .select('*')
                .eq('chat_id', cc.id)
                .order('created_at', { ascending: true })
                .limit(100);

              const messages: Message[] = (cloudMessages || []).map((m: any) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                timestamp: new Date(m.created_at),
                model: m.model,
                thinking: m.thinking,
                isLoading: false,
              }));

              const chat: any = {
                id: cc.id,
                title: cc.title,
                messages,
                createdAt: new Date(cc.created_at),
                updatedAt: new Date(cc.updated_at),
              };

              if (cc.archived) {
                chat.archived = true;
              }

              chats.push(chat);
            }

            const state = get();
            const localIds = new Set(state.chats.map(c => c.id));
            const cloudOnly = chats.filter(c => !localIds.has(c.id));
            const merged = [...state.chats, ...cloudOnly]
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .slice(0, 50);

            set({ chats: merged });
          }
        } catch (e) {
          console.error('Sync from cloud error:', e);
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: 'mogpt-chats-v4',
      partialize: (state) => ({
        chats: state.chats.slice(0, 50).map(chat => ({
          ...chat,
          messages: chat.messages.slice(-100),
        })),
        currentChatId: state.currentChatId,
        responseMode: state.responseMode,
        rudenessMode: state.rudenessMode,
        selectedModel: state.selectedModel,
      }),
    }
  )
);
