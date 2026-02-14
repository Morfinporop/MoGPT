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

  useEffect(() => {
    if (isAuthenticated && user) {
      aiService.setUserId(user.id);
      syncFromCloud(user.id);
    } else {
      aiService.setUserId(null);
    }
  }, [isAuthenticated, user?.id]);

  return (
    <div className={`relative min-h-screen overflow-hidden ${isDark ? 'bg-[#000000]' : 'bg-[#ffffff]'}`}>
      {isDark && <Background />}

      <Sidebar />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 flex flex-col pt-[56px] pb-40">
          <ChatContainer />
        </main>

        <footer className={`fixed bottom-0 left-0 right-0 z-20 pb-5 pt-4 ${
          isDark
            ? 'bg-gradient-to-t from-[#000000] via-[#000000]/95 to-transparent'
            : 'bg-gradient-to-t from-[#ffffff] via-[#ffffff]/95 to-transparent'
        }`}>
          <ChatInput />
        </footer>
      </div>
    </div>
  );
}
