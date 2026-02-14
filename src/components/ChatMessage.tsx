import { motion } from 'framer-motion';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect, useMemo, memo } from 'react';
import { marked } from 'marked';
import type { Message } from '../types';
import { MODEL_ICON } from '../config/models';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';

interface ChatMessageProps {
  message: Message;
  compact?: boolean;
  hideModelLabel?: boolean;
}

marked.setOptions({
  breaks: true,
  gfm: true,
});

const MAX_LENGTH = 10000;

export const ChatMessage = memo(function ChatMessage({ message, compact, hideModelLabel }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [finalTypingTime, setFinalTypingTime] = useState<number | null>(null);
  const [currentTypingTime, setCurrentTypingTime] = useState<number>(0);
  const isAssistant = message.role === 'assistant';
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const isLight = theme === 'light';

  const isLong = message.content.length > MAX_LENGTH && !message.isLoading;
  const displayContent = isLong && !expanded ? message.content.slice(0, MAX_LENGTH) : message.content;

  useEffect(() => {
    if (message.isLoading && isAssistant && message.timestamp) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - new Date(message.timestamp).getTime()) / 1000);
        setCurrentTypingTime(elapsed);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [message.isLoading, isAssistant, message.timestamp]);

  useEffect(() => {
    if (!message.isLoading && isAssistant && message.timestamp && finalTypingTime === null) {
      const elapsed = Math.floor((Date.now() - new Date(message.timestamp).getTime()) / 1000);
      if (elapsed > 0 && elapsed < 300) {
        setFinalTypingTime(elapsed);
      }
    }
  }, [message.isLoading, isAssistant, message.timestamp, finalTypingTime]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const renderedContent = useMemo(() => {
    if (message.isLoading) {
      return <TypingIndicator />;
    }

    if (isAssistant) {
      let html = marked.parse(displayContent, { async: false }) as string;

      html = html.replace(/<pre><code(.*?)>([\s\S]*?)<\/code><\/pre>/g, (_match, attrs, code) => {
        const decodedCode = code
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");

        return `
          <div class="code-block-wrapper relative my-3">
            <pre class="!bg-white/[0.03] !border !border-white/[0.06] rounded-xl overflow-hidden"><code${attrs}>${code}</code></pre>
            <button 
              class="copy-code-btn absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] flex items-center gap-2 transition-all border border-white/[0.08]"
              data-code="${encodeURIComponent(decodedCode)}"
            >
              <svg class="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
              <span class="text-xs text-zinc-400">Копировать</span>
            </button>
          </div>
        `;
      });

      return (
        <div>
          <div
            className={`prose prose-sm max-w-none break-words overflow-hidden ${
              isLight ? 'text-zinc-800' : 'text-zinc-200'
            }`}
            style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', userSelect: 'text' }}
            dangerouslySetInnerHTML={{ __html: html }}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              const btn = target.closest('.copy-code-btn') as HTMLButtonElement;
              if (btn) {
                e.preventDefault();
                const code = decodeURIComponent(btn.dataset.code || '');
                copyCode(code);
              }
            }}
            onMouseDown={(e) => e.stopPropagation()}
          />
          {isLong && (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setExpanded(!expanded)}
              className={`flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg transition-all ${
                isLight
                  ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
                  : 'bg-white/[0.06] hover:bg-white/[0.1] text-zinc-400'
              }`}
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span className="text-xs">{expanded ? 'Свернуть' : 'Показать полностью'}</span>
            </motion.button>
          )}
        </div>
      );
    }

    return (
      <div>
        <p
          className="text-[15px] leading-relaxed text-white whitespace-pre-wrap break-words overflow-hidden"
          style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', userSelect: 'text' }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {displayContent}
        </p>
        {isLong && (
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5 text-white/70" /> : <ChevronDown className="w-3.5 h-3.5 text-white/70" />}
            <span className="text-xs text-white/70">{expanded ? 'Свернуть' : 'Показать полностью'}</span>
          </motion.button>
        )}
      </div>
    );
  }, [message.isLoading, displayContent, isAssistant, isLight, isLong, expanded]);

  const displayedTime = message.isLoading ? currentTypingTime : finalTypingTime;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`flex gap-3 ${isAssistant ? '' : 'flex-row-reverse'}`}
    >
      <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center mt-1">
        {isAssistant ? (
          <img
            src={MODEL_ICON}
            alt="MoGPT"
            className={`w-9 h-9 object-contain ${isLight ? 'filter brightness-0' : 'filter brightness-0 invert'}`}
          />
        ) : (
          <img
            src={user?.avatar || "https://cdn-icons-png.flaticon.com/512/1077/1077114.png"}
            alt="User"
            className={`w-9 h-9 ${user?.avatar ? 'rounded-full object-cover' : `object-contain ${isLight ? 'filter brightness-0' : 'filter brightness-0 invert'}`}`}
          />
        )}
      </div>

      <div className={`group/message relative ${compact ? 'max-w-full flex-1' : 'max-w-[85%]'} min-w-0 overflow-hidden`}>
        {isAssistant && message.model && !hideModelLabel && (
          <div className="mb-1 px-1 flex items-center gap-3">
            <span className={`text-[11px] font-medium ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              {message.model}
            </span>
            {displayedTime !== null && displayedTime > 0 && (
              <span className={`text-[10px] ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {displayedTime}s
              </span>
            )}
          </div>
        )}

        <motion.div
          className={`relative px-4 py-3 rounded-2xl overflow-hidden ${
            isAssistant
              ? isLight
                ? 'bg-[#f2f2f7] rounded-tl-md'
                : 'bg-[#1c1c1e] rounded-tl-md'
              : isLight
                ? 'bg-[#007AFF] rounded-tr-md'
                : 'bg-[#2196F3] rounded-tr-md'
          }`}
        >
          {renderedContent}
        </motion.div>

        <div className={`flex items-center gap-2 mt-1 px-1 ${isAssistant ? '' : 'justify-end'}`}>
          <span className={`text-[10px] ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`}>
            {new Date(message.timestamp).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>

          {!message.isLoading && (
            <button
              onClick={copyToClipboard}
              className={`p-1 rounded transition-colors ${
                isLight ? 'hover:bg-zinc-200' : 'hover:bg-white/[0.06]'
              }`}
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className={`w-3 h-3 ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`} />
              )}
            </button>
          )}

          {copiedCode && (
            <span className="text-[10px] text-green-500">Скопировано</span>
          )}
        </div>
      </div>
    </motion.div>
  );
});

const TypingIndicator = memo(function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm text-zinc-500">Печатаю</span>
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-zinc-400 typing-dot"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
});
