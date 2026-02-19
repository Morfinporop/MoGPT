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
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: isDark ? '#0a0705' : '#faf8f5' }}
    >
      {isDark && <Background />}

      {isDark && (
        <div className="noise" />
      )}

      <Sidebar />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 flex flex-col pt-20 pb-44">
          <ChatContainer />
        </main>

        <footer
          className="fixed bottom-0 left-0 right-0 z-20 pb-6 pt-6"
          style={{
            background: isDark
              ? 'linear-gradient(to top, #0a0705 0%, rgba(10,7,5,0.97) 60%, transparent 100%)'
              : 'linear-gradient(to top, #faf8f5 0%, rgba(250,248,245,0.97) 60%, transparent 100%)',
          }}
        >
          <ChatInput />
        </footer>
      </div>
    </div>
  );
}
