import { useEffect, useRef, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useChatStore } from '../store/chatStore';
import { ChatMessage } from './ChatMessage';
import { WelcomeScreen } from './WelcomeScreen';
import type { Message } from '../types';

function useCompareModeState(): { isDual: boolean } {
  try {
    const { useCompareMode } = require('./Header');
    return useCompareMode();
  } catch {
    return { isDual: false };
  }
}

interface DualMessagePairProps {
  leftMessage: Message;
  rightMessage: Message;
}

function DualMessagePair({ leftMessage, rightMessage }: DualMessagePairProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Левая нейросеть */}
        <div className="min-w-0 pr-2 border-r border-zinc-700/30">
          <ChatMessage message={leftMessage} compact side="left" />
        </div>

        {/* Правая нейросеть */}
        <div className="min-w-0 pl-2">
          <ChatMessage message={rightMessage} compact side="right" />
        </div>
      </div>
    </motion.div>
  );
}

export function ChatContainer() {
  const { getCurrentMessages } = useChatStore();
  const messages = getCurrentMessages();
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { isDual } = useCompareModeState();

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const renderedItems = useMemo(() => {
    if (!isDual) {
      return messages.map((msg) => ({
        type: 'single' as const,
        message: msg,
        leftMessage: null as Message | null,
        rightMessage: null as Message | null,
        key: msg.id,
      }));
    }

    const result: {
      type: 'single' | 'dual';
      message: Message | null;
      leftMessage: Message | null;
      rightMessage: Message | null;
      key: string;
    }[] = [];

    const processedIds = new Set<string>();

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (processedIds.has(msg.id)) continue;

      if (msg.dualPairId && msg.dualPosition === 'left') {
        const pair = messages.find(
          (m) => m.dualPairId === msg.dualPairId && m.dualPosition === 'right' && m.id !== msg.id
        );
        if (pair) {
          processedIds.add(msg.id);
          processedIds.add(pair.id);
          result.push({
            type: 'dual',
            message: null,
            leftMessage: msg,
            rightMessage: pair,
            key: `dual-${msg.dualPairId}`,
          });
          continue;
        }
      }

      if (msg.dualPairId && msg.dualPosition === 'right') {
        const leftExists = messages.find(
          (m) => m.dualPairId === msg.dualPairId && m.dualPosition === 'left'
        );
        if (leftExists && !processedIds.has(leftExists.id)) {
          continue;
        }
      }

      processedIds.add(msg.id);
      result.push({
        type: 'single',
        message: msg,
        leftMessage: null,
        rightMessage: null,
        key: msg.id,
      });
    }

    return result;
  }, [messages, isDual]);

  if (messages.length === 0) {
    return <WelcomeScreen />;
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-6"
    >
      <div className={`mx-auto space-y-6 ${isDual ? 'max-w-6xl' : 'max-w-3xl'}`}>
        <AnimatePresence mode="popLayout">
          {renderedItems.map((item) => {
            if (item.type === 'dual' && item.leftMessage && item.rightMessage) {
              return (
                <DualMessagePair
                  key={item.key}
                  leftMessage={item.leftMessage}
                  rightMessage={item.rightMessage}
                />
              );
            }
            if (item.message) {
              return <ChatMessage key={item.key} message={item.message} />;
            }
            return null;
          })}
        </AnimatePresence>
        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
}
