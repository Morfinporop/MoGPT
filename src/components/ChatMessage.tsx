import { motion } from 'framer-motion';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { marked } from 'marked';
import type { Message } from '../types';
import { MODEL_ICON } from '../config/models';

interface ChatMessageProps {
  message: Message;
  compact?: boolean;
  hideModelLabel?: boolean;
}

marked.setOptions({
  breaks: true,
  gfm: true,
});

const MAX_LENGTH = 500;

export function ChatMessage({ message, compact, hideModelLabel }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const isAssistant = message.role === 'assistant';

  const isLong = message.content.length > MAX_LENGTH && !message.isLoading;
  const displayContent = isLong && !expanded ? message.content.slice(0, MAX_LENGTH) + '...' : message.content;

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

  const renderContent = () => {
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
          <div class="code-block-wrapper relative group/code my-3">
            <pre class="!bg-black/50 !border !border-violet-500/20 rounded-xl overflow-hidden"><code${attrs}>${code}</code></pre>
            <button 
              class="copy-code-btn absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-violet-500/20 hover:bg-violet-500/40 flex items-center gap-2 opacity-0 group-hover/code:opacity-100 transition-all border border-violet-500/30"
              data-code="${encodeURIComponent(decodedCode)}"
            >
              <svg class="w-4 h-4 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
              <span class="text-xs text-violet-300">Копировать</span>
            </button>
          </div>
        `;
      });

      return (
        <div>
          <div
            className="prose prose-sm max-w-none text-zinc-200 break-words overflow-hidden"
            style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
            dangerouslySetInnerHTML={{ __html: html }}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              const btn = target.closest('.copy-code-btn') as HTMLButtonElement;
              if (btn) {
                const code = decodeURIComponent(btn.dataset.code || '');
                copyCode(code);
              }
            }}
          />
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
          style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
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
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`flex gap-3 ${isAssistant ? '' : 'flex-row-reverse'}`}
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden ${
          isAssistant
            ? 'bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 glow-soft'
            : 'bg-gradient-to-br from-emerald-500 to-teal-500'
        }`}
      >
        {isAssistant ? (
          <img
            src={MODEL_ICON}
            alt="MoGPT"
            className="w-5 h-5 object-contain filter brightness-0 invert"
          />
        ) : (
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="User"
            className="w-5 h-5 object-contain filter brightness-0 invert"
          />
        )}
      </motion.div>

      <div className={`group relative ${compact ? 'max-w-full flex-1' : 'max-w-[85%]'} min-w-0 overflow-hidden`}>
        {/* Подпись модели — показывается только в обычном режиме */}
        {isAssistant && message.model && !hideModelLabel && (
          <div className="flex items-center gap-1.5 mb-1.5 px-1">
            <div className="w-2 h-2 rounded-full bg-violet-500/60 animate-pulse" />
            <span className="text-[11px] text-violet-400/80 font-medium tracking-wide">
              {message.model}
            </span>
          </div>
        )}

        <motion.div
          whileHover={{ scale: 1.005 }}
          className={`relative px-4 py-3 rounded-2xl overflow-hidden ${
            isAssistant
              ? 'glass-light rounded-tl-md'
              : 'bg-gradient-to-br from-violet-500 to-purple-600 rounded-tr-md shadow-lg shadow-violet-500/10'
          }`}
        >
          {renderContent()}

          {!message.isLoading && (
            <motion.button
              initial={{ opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              onClick={copyToClipboard}
              className={`absolute -right-2 -top-2 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
                isAssistant
                  ? 'glass-strong hover:bg-white/10'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
              )}
            </motion.button>
          )}
        </motion.div>

        <div className={`flex items-center gap-2 mt-1.5 px-1 ${isAssistant ? '' : 'justify-end'}`}>
          <span className="text-[10px] text-zinc-600">
            {new Date(message.timestamp).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {copiedCode && (
            <span className="text-[10px] text-green-400">Код скопирован!</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 py-1">
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-violet-400 typing-dot"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
      <span className="text-sm text-zinc-500 ml-1">Печатаю...</span>
    </div>
  );
}
