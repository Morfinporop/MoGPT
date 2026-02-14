import { motion } from 'framer-motion';
import { Copy, Check, ChevronDown, ChevronUp, Code2 } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback, memo } from 'react';
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

/* ─── Кнопка копирования кода ─── */
const CodeCopyButton = memo(function CodeCopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  return (
    <button
      onClick={handleCopy}
      className={`
        flex items-center gap-1.5
        px-2.5 py-1.5 rounded-lg
        text-xs font-medium
        transition-all duration-200
        ${copied
          ? 'bg-green-500/20 border border-green-500/40 text-green-300'
          : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-zinc-200'
        }
      `}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" />
          <span>Скопировано</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span>Копировать</span>
        </>
      )}
    </button>
  );
});

/* ─── Блок кода ─── */
const CodeBlock = memo(function CodeBlock({ code, language }: { code: string; language?: string }) {
  return (
    <div className="code-block-container relative my-4 rounded-xl overflow-hidden border border-white/[0.06] shadow-lg">
      {/* Шапка блока кода */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0a0a18] border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-violet-400/70" />
          {language && (
            <span className="text-[11px] font-mono text-violet-400/60 uppercase tracking-wider">
              {language}
            </span>
          )}
          {!language && (
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
              code
            </span>
          )}
        </div>
        <CodeCopyButton code={code} />
      </div>

      {/* Тело кода */}
      <div className="relative bg-[#0d0d1a] overflow-x-auto">
        <pre className="!m-0 !p-4 !bg-transparent !border-0">
          <code className={`text-sm font-mono leading-relaxed text-zinc-200 ${language ? `language-${language}` : ''}`}>
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
});

/* ─── Парсер контента: разделяет текст и код ─── */
function parseContentBlocks(content: string): Array<{ type: 'text' | 'code'; content: string; language?: string }> {
  const blocks: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;

  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const textBefore = content.slice(lastIndex, match.index).trim();
      if (textBefore) {
        blocks.push({ type: 'text', content: textBefore });
      }
    }

    const language = match[1] || undefined;
    const code = match[2].trim();
    if (code) {
      blocks.push({ type: 'code', content: code, language });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    const remaining = content.slice(lastIndex).trim();
    if (remaining) {
      blocks.push({ type: 'text', content: remaining });
    }
  }

  if (blocks.length === 0 && content.trim()) {
    blocks.push({ type: 'text', content: content.trim() });
  }

  return blocks;
}

/* ─── Рендер текстового блока через marked ─── */
const TextBlock = memo(function TextBlock({ content, isLight }: { content: string; isLight: boolean }) {
  const html = useMemo(() => {
    let result = marked.parse(content, { async: false }) as string;

    result = result.replace(
      /<code(?!\s*class)(.*?)>([\s\S]*?)<\/code>/g,
      '<code class="inline-code"$1>$2</code>'
    );

    return result;
  }, [content]);

  return (
    <div
      className={`prose prose-sm max-w-none break-words overflow-hidden ${
        isLight ? 'text-zinc-800' : 'text-zinc-200'
      }`}
      style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', userSelect: 'text' }}
      dangerouslySetInnerHTML={{ __html: html }}
      onMouseDown={(e) => e.stopPropagation()}
    />
  );
});

/* ─── Основной компонент сообщения ─── */
export const ChatMessage = memo(function ChatMessage({ message, compact, hideModelLabel }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
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
        const elapsed = Math.floor((Date.now() - message.timestamp) / 1000);
        setCurrentTypingTime(elapsed);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [message.isLoading, isAssistant, message.timestamp]);

  useEffect(() => {
    if (!message.isLoading && isAssistant && message.timestamp && finalTypingTime === null) {
      const elapsed = Math.floor((Date.now() - message.timestamp) / 1000);
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

  const renderedContent = useMemo(() => {
    if (message.isLoading) {
      return <TypingIndicator />;
    }

    if (isAssistant) {
      const blocks = parseContentBlocks(displayContent);

      return (
        <div>
          {blocks.map((block, index) => {
            if (block.type === 'code') {
              return (
                <CodeBlock
                  key={`code-${index}`}
                  code={block.content}
                  language={block.language}
                />
              );
            }
            return (
              <TextBlock
                key={`text-${index}`}
                content={block.content}
                isLight={isLight}
              />
            );
          })}

          {isLong && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 transition-all"
            >
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-violet-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-violet-400" />
              )}
              <span className="text-xs text-violet-300">
                {expanded ? 'Свернуть' : 'Показать полностью'}
              </span>
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
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
          >
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-white/70" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-white/70" />
            )}
            <span className="text-xs text-white/70">
              {expanded ? 'Свернуть' : 'Показать полностью'}
            </span>
          </motion.button>
        )}
      </div>
    );
  }, [message.isLoading, displayContent, isAssistant, isLight, isLong, expanded]);

  const displayedTime = message.isLoading ? currentTypingTime : finalTypingTime;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`flex gap-4 ${isAssistant ? '' : 'flex-row-reverse'}`}
    >
      <div className="flex-shrink-0 w-11 h-11 flex items-center justify-center">
        {isAssistant ? (
          <img
            src={MODEL_ICON}
            alt="MoGPT"
            className={`w-11 h-11 object-contain ${isLight ? 'filter brightness-0' : 'filter brightness-0 invert'}`}
          />
        ) : (
          <img
            src={user?.avatar || "https://cdn-icons-png.flaticon.com/512/1077/1077114.png"}
            alt="User"
            className={`w-11 h-11 ${user?.avatar ? 'rounded-full object-cover' : `object-contain ${isLight ? 'filter brightness-0' : 'filter brightness-0 invert'}`}`}
          />
        )}
      </div>

      <div className={`group/message relative ${compact ? 'max-w-full flex-1' : 'max-w-[85%]'} min-w-0 overflow-hidden`}>
        {isAssistant && message.model && !hideModelLabel && (
          <div className="mb-1.5 px-1 flex items-center gap-3">
            <span className={`text-[11px] font-medium tracking-wide ${
              isLight ? 'text-zinc-900' : 'text-white'
            }`}>
              {message.model}
            </span>
            {displayedTime !== null && displayedTime > 0 && (
              <span className={`text-[10px] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                {displayedTime}s
              </span>
            )}
          </div>
        )}

        <motion.div
          className={`relative px-4 py-3 rounded-2xl overflow-hidden ${
            isAssistant
              ? isLight
                ? 'bg-white border border-zinc-200 shadow-sm rounded-tl-md'
                : 'glass-light rounded-tl-md'
              : isLight
                ? 'bg-gradient-to-br from-violet-500 to-purple-600 rounded-tr-md shadow-md'
                : 'bg-gradient-to-br from-violet-500 to-purple-600 rounded-tr-md shadow-lg shadow-violet-500/10'
          }`}
        >
          {renderedContent}
        </motion.div>

        <div className={`flex items-center gap-2 mt-1.5 px-1 ${isAssistant ? '' : 'justify-end'}`}>
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
                isAssistant
                  ? isLight
                    ? 'hover:bg-zinc-100'
                    : 'hover:bg-white/10'
                  : 'hover:bg-white/20'
              }`}
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-400" />
              ) : (
                <Copy className={`w-3 h-3 ${isLight && isAssistant ? 'text-zinc-400' : 'text-zinc-500'}`} />
              )}
            </button>
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
            className="w-2 h-2 rounded-full bg-violet-400 typing-dot"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
});
