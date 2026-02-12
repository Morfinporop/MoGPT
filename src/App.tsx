import { Background } from './components/Background';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatContainer } from './components/ChatContainer';
import { ChatInput } from './components/ChatInput';

export function App() {
  return (
    <div className="relative min-h-screen bg-[#050508] overflow-hidden">
      {/* Animated Neural Background */}
      <Background />
      
      {/* Subtle patterns */}
      <div className="fixed inset-0 neural-pattern pointer-events-none" style={{ zIndex: 2 }} />
      <div className="fixed inset-0 dot-pattern pointer-events-none opacity-20" style={{ zIndex: 2 }} />
      
      {/* Noise texture */}
      <div className="noise" />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Layout */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <Header />

        {/* Chat Area */}
        <main className="flex-1 flex flex-col pt-20 pb-44">
          <ChatContainer />
        </main>

        {/* Input - fixed at bottom center */}
        <footer className="fixed bottom-0 left-0 right-0 z-20 pb-6 pt-6 bg-gradient-to-t from-[#050508] via-[#050508]/98 to-transparent">
          <ChatInput />
        </footer>
      </div>
    </div>
  );
}
