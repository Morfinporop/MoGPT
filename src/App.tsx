import { useEffect } from 'react';
import { Background } from './components/Background';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatContainer } from './components/ChatContainer';
import { ChatInput } from './components/ChatInput';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';
import { useChatStore } from './store/chatStore';
import { aiService } from './services/aiService';

export function App() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const { user, isAuthenticated } = useAuthStore();
  const { syncFromCloud } = useChatStore();

  // При входе — устанавливаем userId для памяти и синхронизируем чаты
  useEffect(() => {
    if (isAuthenticated && user) {
      aiService.setUserId(user.id);
      syncFromCloud(user.id);
    } else {
      aiService.setUserId(null);
    }
  }, [isAuthenticated, user?.id]);

  return (
    <div className={`relative min-h-screen overflow-hidden ${isDark ? 'bg-[#050508]' : 'bg-[#f5f5f7]'}`}>
      {isDark && <Background />}

      {isDark && (
        <>
          <div className="fixed inset-0 neural-pattern pointer-events-none" style={{ zIndex: 2 }} />
          <div className="fixed inset-0 dot-pattern pointer-events-none opacity-20" style={{ zIndex: 2 }} />
          <div className="noise" />
        </>
      )}

      <Sidebar />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 flex flex-col pt-20 pb-44">
          <ChatContainer />
        </main>

        <footer className={`fixed bottom-0 left-0 right-0 z-20 pb-6 pt-6 ${
          isDark
            ? 'bg-gradient-to-t from-[#050508] via-[#050508]/98 to-transparent'
            : 'bg-gradient-to-t from-[#f5f5f7] via-[#f5f5f7]/98 to-transparent'
        }`}>
          <ChatInput />
        </footer>
      </div>
    </div>
  );
}
