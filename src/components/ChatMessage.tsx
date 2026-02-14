import { motion } from 'framer-motion';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect, useMemo, memo } from 'react';
import { marked } from 'marked';
import type { Message } from '../types';
import { MODEL_ICON } from '../config/models';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';

const DEFAULT_AVATAR = 'https://media.forgecdn.net/avatars/260/481/637214772494979032.png';
const MAX_LEN = 10000;

marked.setOptions({ breaks: true, gfm: true });

export const ChatMessage = memo(function ChatMessage({ message, compact, hideModelLabel }: { message: Message; compact?: boolean; hideModelLabel?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [finalTime, setFinalTime] = useState<number | null>(null);
  const [curTime, setCurTime] = useState(0);
  const isBot = message.role === 'assistant';
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const isDark = theme === 'dark';

  const isLong = message.content.length > MAX_LEN && !message.isLoading;
  const content = isLong && !expanded ? message.content.slice(0, MAX_LEN) : message.content;

  useEffect(() => {
    if (message.isLoading && isBot && message.timestamp) {
      const i = setInterval(() => setCurTime(Math.floor((Date.now() - new Date(message.timestamp).getTime()) / 1000)), 1000);
      return () => clearInterval(i);
    }
  }, [message.isLoading, isBot, message.timestamp]);

  useEffect(() => {
    if (!message.isLoading && isBot && message.timestamp && finalTime === null) {
      const e = Math.floor((Date.now() - new Date(message.timestamp).getTime()) / 1000);
      if (e > 0 && e < 300) setFinalTime(e);
    }
  }, [message.isLoading, isBot, message.timestamp, finalTime]);

  const copy = async () => { await navigator.clipboard.writeText(message.content); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const copyC = async (c: string) => { await navigator.clipboard.writeText(c); setCopiedCode(c); setTimeout(() => setCopiedCode(null), 2000); };

  const rendered = useMemo(() => {
    if (message.isLoading) return <Typing />;
    if (isBot) {
      let html = marked.parse(content, { async: false }) as string;
      html = html.replace(/<pre><code(.*?)>([\s\S]*?)<\/code><\/pre>/g, (_, a, c) => {
        const d = c.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
        return `<div class="code-block-wrapper relative my-2.5"><pre class="!bg-white/[0.03] !border !border-white/[0.06] rounded-lg overflow-hidden"><code${a}>${c}</code></pre><button class="copy-code-btn absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md bg-white/[0.05] hover:bg-white/[0.1] flex items-center gap-1.5 transition-colors border border-white/[0.06]" data-code="${encodeURIComponent(d)}"><svg class="w-3 h-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg><span class="text-[10px] text-zinc-400">Copy</span></button></div>`;
      });
      return (
        <div>
          <div className={`prose prose-sm max-w-none break-words ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}
            style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', userSelect: 'text' }}
            dangerouslySetInnerHTML={{ __html: html }}
            onClick={e => { const b = (e.target as HTMLElement).closest('.copy-code-btn') as HTMLButtonElement; if (b) { e.preventDefault(); copyC(decodeURIComponent(b.dataset.code || '')); } }}
          />
          {isLong && (
            <button onClick={() => setExpanded(!expanded)} className={`flex items-center gap-1 mt-2 px-2.5 py-1 rounded-md text-[11px] transition-colors ${isDark ? 'text-zinc-500 hover:bg-white/[0.04]' : 'text-zinc-400 hover:bg-black/[0.03]'}`}>
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {expanded ? 'Свернуть' : 'Полностью'}
            </button>
          )}
        </div>
      );
    }
    return (
      <div>
        <p className="text-[14px] leading-relaxed text-white whitespace-pre-wrap break-words" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', userSelect: 'text' }}>{content}</p>
        {isLong && (
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 mt-2 px-2.5 py-1 rounded-md text-[11px] text-white/50 hover:bg-white/10 transition-colors">
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? 'Свернуть' : 'Полностью'}
          </button>
        )}
      </div>
    );
  }, [message.isLoading, content, isBot, isDark, isLong, expanded]);

  const t = message.isLoading ? curTime : finalTime;
  const av = user?.avatar || DEFAULT_AVATAR;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-3 ${isBot ? '' : 'flex-row-reverse'}`}
    >
      <div className="flex-shrink-0 w-8 h-8 mt-0.5">
        {isBot ? (
          <img src={MODEL_ICON} alt="AI" className={`w-8 h-8 object-contain ${isDark ? 'invert' : ''}`} />
        ) : (
          <img src={av} alt="You" className="w-8 h-8 rounded-full object-cover" />
        )}
      </div>

      <div className={`${compact ? 'max-w-full flex-1' : 'max-w-[82%]'} min-w-0`}>
        {isBot && message.model && !hideModelLabel && (
          <div className="flex items-center gap-2 mb-1 px-0.5">
            <span className={`text-[11px] font-medium ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{message.model}</span>
            {t != null && t > 0 && <span className={`text-[10px] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{t}s</span>}
          </div>
        )}

        <div className={`px-3.5 py-2.5 rounded-[16px] ${
          isBot
            ? isDark ? 'glass-card rounded-tl-[4px]' : 'bg-[#f2f2f2] rounded-tl-[4px]'
            : isDark ? 'bg-white/[0.1] rounded-tr-[4px]' : 'bg-[#111] text-white rounded-tr-[4px]'
        }`}>
          {rendered}
        </div>

        <div className={`flex items-center gap-1.5 mt-1 px-0.5 ${isBot ? '' : 'justify-end'}`}>
          <span className={`text-[10px] ${isDark ? 'text-zinc-700' : 'text-zinc-400'}`}>
            {new Date(message.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {!message.isLoading && (
            <button onClick={copy} className={`p-0.5 rounded transition-colors ${isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-black/[0.04]'}`}>
              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className={`w-3 h-3 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`} />}
            </button>
          )}
          {copiedCode && <span className="text-[10px] text-green-500">✓</span>}
        </div>
      </div>
    </motion.div>
  );
});

const Typing = memo(function Typing() {
  return (
    <div className="flex items-center gap-1.5 py-0.5">
      {[0, 1, 2].map(i => (
        <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-400 typing-dot" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  );
});
