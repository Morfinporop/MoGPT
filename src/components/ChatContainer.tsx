import { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useChatStore } from '../store/chatStore';
import { ChatMessage } from './ChatMessage';
import { WelcomeScreen } from './WelcomeScreen';
import type { Message } from '../types';

export function ChatContainer() {
  const { getCurrentMessages } = useChatStore();
  const messages = getCurrentMessages();
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (messages.length === 0) {
    return <WelcomeScreen />;
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-6"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <AnimatePresence mode="popLayout">
          {messages.map((message: Message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </AnimatePresence>
        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
}
