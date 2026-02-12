import { Background } from './components/Background';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatContainer } from './components/ChatContainer';
import { ChatInput } from './components/ChatInput';
import { AuthScreen } from './components/AuthScreen';
import { useAuthStore } from './store/authStore';

export function App() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <div className="relative min-h-screen bg-[#050508] overflow-hidden">
      <Background />

      <div className="fixed inset-0 neural-pattern pointer-events-none" style={{ zIndex: 2 }} />
      <div className="fixed inset-0 dot-pattern pointer-events-none opacity-20" style={{ zIndex: 2 }} />

      <div className="noise" />

      <Sidebar />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 flex flex-col pt-20 pb-44">
          <ChatContainer />
        </main>

        <footer className="fixed bottom-0 left-0 right-0 z-20 pb-6 pt-6 bg-gradient-to-t from-[#050508] via-[#050508]/98 to-transparent">
          <ChatInput />
        </footer>
      </div>
    </div>
  );
}
