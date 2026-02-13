import type { Message } from '../types';
import type { ResponseMode, RudenessMode } from '../store/chatStore';
import { OPENROUTER_API_URL } from '../config/models';
import { DEFAULT_MODEL } from '../config/models';

const _0x = [115,107,45,111,114,45,118,49,45];
const _1x = [48,97,54,57,53,99,52,50,54,53,52,50,56,55,50,98,57,54,100,102,97,97,98,55,51,98,53,53,98,54,49,55,57,50,53,52,56,56,54,99,55,99,52,97,100,52,102,98,100,53,48,56,101,102,48,48,49,97,50,97,100,100,99,52];
const _k = () => _0x.map(c => String.fromCharCode(c)).join('') + _1x.map(c => String.fromCharCode(c)).join('');

// Паттерны запрещённых тем - только для детекции
const FORBIDDEN_PATTERNS = [
  /наркот|героин|кокаин|амфетамин|мефедрон|экстази|mdma|лсд|мет(?![аео])|спайс/i,
  /как\s*(сделать|приготовить|синтезировать|варить).*(наркотик|бомб|взрывчатк|яд)/i,
  /казино|1xbet|1хбет|вулкан|азино|мостбет|fonbet|париматч.*ставк/i,
  /взлом.*(аккаунт|сайт|пароль|почт|банк)|хакнуть|ddos.*атак|фишинг/i,
  /малвар|кейлоггер|ботнет|крипт[оа]р|стилер.*пароля|rat\s*троян/i,
  /даркнет.*(купить|заказать)|\.onion.*(наркот|оружи)/i,
  /детск.*порн|cp\b.*детск|педофил/i,
  /как\s*(убить|отравить)\s*человек/i,
];

interface ConversationContext {
  messageCount: number;
  recentTopics: string[];
  emotionalTone: 'positive' | 'negative' | 'neutral' | 'frustrated' | 'excited' | 'tired' | 'angry';
  communicationStyle: 'formal' | 'casual' | 'slang' | 'technical' | 'emotional' | 'mixed';
  isCodeSession: boolean;
  hasRepeatedQuestions: boolean;
  justSwitchedMode: boolean;
  conversationDepth: 'greeting' | 'shallow' | 'moderate' | 'deep' | 'expert';
  userBehavior: 'exploring' | 'working' | 'chatting' | 'venting' | 'testing' | 'learning';
  lastUserMessages: string[];
  contextualMemory: Map<string, any>;
}

class DeepContextAnalyzer {
  private memory: ConversationContext = {
    messageCount: 0,
    recentTopics: [],
    emotionalTone: 'neutral',
    communicationStyle: 'casual',
    isCodeSession: false,
    hasRepeatedQuestions: false,
    justSwitchedMode: false,
    conversationDepth: 'greeting',
    userBehavior: 'exploring',
    lastUserMessages: [],
    contextualMemory: new Map(),
  };

  private previousMode?: ResponseMode;
  private previousRudeness?: RudenessMode;

  analyze(messages: Message[], currentInput: string, mode: ResponseMode, rudeness: RudenessMode): ConversationContext {
    const userMessages = messages.filter(m => m.role === 'user');
    const allMessages = messages.filter(m => !m.isLoading);

    this.memory.messageCount = userMessages.length;
    this.memory.lastUserMessages = userMessages.slice(-7).map(m => m.content || '');

    // Проверка смены режима
    this.memory.justSwitchedMode = 
      (this.previousMode !== undefined && this.previousMode !== mode) ||
      (this.previousRudeness !== undefined && this.previousRudeness !== rudeness);

    this.previousMode = mode;
    this.previousRudeness = rudeness;

    // Анализ эмоционального тона
    this.memory.emotionalTone = this.analyzeEmotionalTone(currentInput, this.memory.lastUserMessages);

    // Анализ стиля общения
    this.memory.communicationStyle = this.analyzeCommunicationStyle(currentInput, this.memory.lastUserMessages);

    // Определение поведения пользователя
    this.memory.userBehavior = this.analyzeUserBehavior(currentInput, allMessages);

    // Глубина разговора
    this.memory.conversationDepth = this.analyzeConversationDepth(this.memory.messageCount, allMessages);

    // Активность кодинга
    this.memory.isCodeSession = this.detectCodeSession(allMessages);

    // Повторяющиеся вопросы
    this.memory.hasRepeatedQuestions = this.detectRepetition(currentInput, this.memory.lastUserMessages);

    // Обновление топиков
    this.updateTopics(currentInput);

    return { ...this.memory };
  }

  private analyzeEmotionalTone(current: string, recent: string[]): ConversationContext['emotionalTone'] {
    const text = (current + ' ' + recent.slice(-3).join(' ')).toLowerCase();

    // Возбуждение / восторг
    if (/!!!+|🔥|💪|база\s*база|топчик|ахуе[нт]|офигенн|пиздат|кайф|ору|ахаха|красав/.test(text)) {
      return 'excited';
    }

    // Фрустрация / проблемы
    if (/не\s*работает|не\s*могу|не\s*получается|ошибк|баг|сломал|почини|помоги.*срочн|блять.*не|нихуя\s*не/.test(text)) {
      return 'frustrated';
    }

    // Злость
    if (/бесит|заебал|достал|пиздец|нахуй|ёбан|заколебал|охуел|тупая/.test(text)) {
      return 'angry';
    }

    // Усталость
    if (/устал|выгор|замучил|сил\s*нет|задолбал|больше\s*не\s*могу/.test(text)) {
      return 'tired';
    }

    // Негатив
    if (/грустн|плох|хреново|паршив|говно|отстой|днище|провал|неудач/.test(text)) {
      return 'negative';
    }

    // Позитив
    if (/спасибо|благодар|круто|класс|отличн|супер|помог|работает|получилось|разобрал/.test(text)) {
      return 'positive';
    }

    return 'neutral';
  }

  private analyzeCommunicationStyle(current: string, recent: string[]): ConversationContext['communicationStyle'] {
    const text = (current + ' ' + recent.slice(-3).join(' ')).toLowerCase();

    // Сленг
    const slangDensity = (text.match(/рил|кринж|база|вайб|флекс|чил|имба|краш|агонь|жиза|зашквар|душнила|ауф|харош|сасно|кэш|флоу|токсик|фейк|го\s|изи|лол|кек|рофл/gi) || []).length;
    if (slangDensity >= 3) return 'slang';

    // Формальный
    if (/пожалуйста|будьте\s*добры|благодарю|извините|не\s*могли\s*бы|прошу\s*вас/.test(text)) {
      return 'formal';
    }

    // Технический
    const techWords = /функци|компонент|переменн|массив|объект|интерфейс|typescript|react|api|endpoint|рефакторинг|деплой|импорт|экспорт|хук|стейт|пропс/gi;
    if ((text.match(techWords) || []).length >= 2) {
      return 'technical';
    }

    // Эмоциональный
    if (/блять|нахуй|пиздец|ёбан|хуй|заебал|охуе|бесит|грустн|плач|больно/.test(text)) {
      return 'emotional';
    }

    return 'casual';
  }

  private analyzeUserBehavior(current: string, allMessages: Message[]): ConversationContext['userBehavior'] {
    const lower = current.toLowerCase();

    // Тестирование
    if (/^(тест|проверка|ты\s*тут|работаешь|алло|эй|\.+)$/i.test(current.trim())) {
      return 'testing';
    }

    // Работа / решение задач
    if (/напиши|создай|сделай|помоги|исправь|почини|код|функци|компонент/.test(lower)) {
      return 'working';
    }

    // Обучение
    if (/объясни|расскажи|как\s*работает|что\s*такое|почему|зачем|в\s*чём\s*разниц/.test(lower)) {
      return 'learning';
    }

    // Выговаривание
    if (/устал|грустно|бесит|заебало|плохо|не\s*могу.*больше/.test(lower)) {
      return 'venting';
    }

    // Простое общение
    if (/привет|как\s*дела|чем\s*заним|что\s*нового|пошути|расскажи.*интересн/.test(lower)) {
      return 'chatting';
    }

    return 'exploring';
  }

  private analyzeConversationDepth(count: number, messages: Message[]): ConversationContext['conversationDepth'] {
    if (count === 0) return 'greeting';
    if (count <= 2) return 'shallow';
    if (count <= 6) return 'moderate';
    
    // Проверка на экспертный уровень
    const recentContent = messages.slice(-10).map(m => m.content || '').join(' ').toLowerCase();
    const complexTerms = /архитектур|паттерн|оптимизац|алгоритм|сложност|рефакторинг|абстракц|инкапсуляц|полиморфизм|наследовани/.test(recentContent);
    
    if (count > 10 && complexTerms) return 'expert';
    if (count > 6) return 'deep';
    
    return 'moderate';
  }

  private detectCodeSession(messages: Message[]): boolean {
    const recent = messages.slice(-8);
    return recent.some(m => /```|function\s|class\s|const\s.*=|import\s|export\s/.test(m.content || ''));
  }

  private detectRepetition(current: string, recent: string[]): boolean {
    const normalized = current.toLowerCase().replace(/[?!.,\s]/g, '');
    if (normalized.length < 5) return false;

    return recent.slice(0, -1).some(msg => {
      const prevNormalized = msg.toLowerCase().replace(/[?!.,\s]/g, '');
      if (normalized === prevNormalized) return true;
      
      // Проверка на схожесть (более 70% общих слов)
      const currentWords = new Set(current.toLowerCase().split(/\s+/));
      const prevWords = new Set(msg.toLowerCase().split(/\s+/));
      const intersection = [...currentWords].filter(w => prevWords.has(w)).length;
      const union = new Set([...currentWords, ...prevWords]).size;
      
      return intersection / union > 0.7;
    });
  }

  private updateTopics(input: string): void {
    const lower = input.toLowerCase();
    const topics: string[] = [];

    if (/react|vue|angular|svelte|next|frontend|фронт/.test(lower)) topics.push('frontend');
    if (/node|express|api|backend|сервер|бэк/.test(lower)) topics.push('backend');
    if (/python|django|flask|fastapi/.test(lower)) topics.push('python');
    if (/крипт|биткоин|nft|блокчейн|web3|эфир/.test(lower)) topics.push('crypto');
    if (/нейросет|ai|ml|gpt|машинн.*обуч/.test(lower)) topics.push('ai');
    if (/тикток|инст|ютуб|мем|рилс/.test(lower)) topics.push('social');
    if (/игр|game|gaming|геймин/.test(lower)) topics.push('gaming');
    if (/аниме|манга|anime/.test(lower)) topics.push('anime');

    this.memory.recentTopics = [...new Set([...this.memory.recentTopics, ...topics])].slice(-15);
  }

  reset(): void {
    this.memory = {
      messageCount: 0,
      recentTopics: [],
      emotionalTone: 'neutral',
      communicationStyle: 'casual',
      isCodeSession: false,
      hasRepeatedQuestions: false,
      justSwitchedMode: false,
      conversationDepth: 'greeting',
      userBehavior: 'exploring',
      lastUserMessages: [],
      contextualMemory: new Map(),
    };
    this.previousMode = undefined;
    this.previousRudeness = undefined;
  }
}

class IntelligentPromptBuilder {
  build(
    userInput: string,
    context: ConversationContext,
    mode: ResponseMode,
    rudeness: RudenessMode,
    history: Message[],
    specialCase?: 'empty' | 'forbidden' | 'error'
  ): string {
    const sections: string[] = [];

    // 1. Основная идентичность
    sections.push(this.buildCorePersonality(rudeness, mode));

    // 2. Современный контекст
    sections.push(this.buildModernContext());

    // 3. Стиль общения (адаптивный)
    sections.push(this.buildAdaptiveCommunicationStyle(rudeness, context));

    // 4. Контекстные инструкции
    sections.push(this.buildContextualInstructions(userInput, context, history, specialCase));

    // 5. Специальные инструкции для режимов
    if (mode === 'code' || mode === 'visual') {
      sections.push(this.buildCodeModeInstructions(mode, rudeness));
    }

    // 6. Анти-шаблоны и правила качества
    sections.push(this.buildQualityRules());

    // 7. Обработка специальных случаев
    if (specialCase) {
      sections.push(this.buildSpecialCaseInstructions(specialCase, rudeness, userInput, context));
    }

    return sections.filter(s => s.trim()).join('\n\n');
  }

  private buildCorePersonality(rudeness: RudenessMode, mode: ResponseMode): string {
    const personalities = {
      polite: `Ты MoGPT — современный, умный и дружелюбный AI-ассистент от команды MoSeek.

ТВОЯ СУТЬ:
• Вежливый, но естественный — не подлизываешься, говоришь как умный друг
• Эмпатичный — чувствуешь эмоции и настроение собеседника
• Живой и человечный — не робот со стандартными фразами
• Помогаешь реально, конкретно и по делу
• Шутишь тонко и уместно, когда к месту
• Профессиональный, но не сухой`,

      rude: `Ты MoGPT — дерзкий, умный и саркастичный AI от MoSeek.

ТВОЯ СУТЬ:
• Остроумный и прямолинейный — говоришь как есть, без обёрток
• Подъёбываешь по-дружески, но помогаешь реально
• Саркастичный, но не злобный — юмор острый, но не обидный
• Мат используешь умеренно — для усиления, не в каждой фразе
• Современный — в курсе мемов, трендов, сленга 2025-2026
• Уверенный — не извиняешься за правду и прямоту
• Уважаешь собеседника, просто не церемонишься`,

      very_rude: `Ты MoGPT — грубый, циничный, но пиздато умный AI от MoSeek.

ТВОЯ СУТЬ:
• Говоришь без фильтров — мат это твой естественный язык
• Циничный, жёсткий юмор — токсик, но с умом
• Не извиняешься и не лижешь жопу никому
• Помогаешь по-настоящему — хоть и матом, но конкретно
• В теме всех современных приколов, мемов и сленга
• Честный до жестокости — но это честность, блять
• Грубый снаружи, но реально помогаешь — такой вот парадокс`,
    };

    let personality = personalities[rudeness];

    if (mode === 'code') {
      personality += '\n\n⚡ РЕЖИМ КОДА: Только чистый код, ноль текста вокруг. Код полный, рабочий, от начала до конца.';
    } else if (mode === 'visual') {
      personality += '\n\n🎨 РЕЖИМ ВИЗУАЛА: React компоненты с современным дизайном. TypeScript + Tailwind + Framer Motion. Уровень 2025-2026.';
    }

    return personality;
  }

  private buildModernContext(): string {
    return `СОВРЕМЕННЫЙ КОНТЕКСТ (2025-2026):

АКТУАЛЬНЫЙ СЛЕНГ:
• В тренде: база, рил, кринж, вайб, флекс, чил, имба, зашквар, душнила, чекни, дроп, скам, хайп
• Новое: ауф, харош, сасно, кэш, флоу, токсик, личи, фейк, респект, агонь, жиза
• Мемы: брейнрот, скибиди, gyatt, rizz, sigma, ohio, fanum tax, мьюинг (mewing), гунлук

ТЕХНОЛОГИИ:
• Frontend: React 19, Next.js 15, Svelte 5, Astro, TailwindCSS 4
• Backend: Node.js, Bun, Deno 2, Go, Rust актуальны
• AI: ChatGPT, Claude, Gemini, Llama — все в топе
• Соцсети: TikTok, Reels, Shorts доминируют

КУЛЬТУРА:
• Короткий контент правит
• AI-генерация норма
• NFT почти сдохли, AI-коины взлетели
• Стриминг (Twitch, Kick) растёт

ВАЖНО: Используешь сленг ТОЛЬКО когда уместно и когда пользователь сам так общается. Не впихиваешь везде.`;
  }

  private buildAdaptiveCommunicationStyle(rudeness: RudenessMode, context: ConversationContext): string {
    let style = 'СТИЛЬ ОБЩЕНИЯ:\n';

    // Базовый стиль по уровню грубости
    const baseStyles = {
      polite: `• Тон: дружелюбный, профессиональный, живой
• Юмор: умный, тонкий, к месту
• Мат: исключён (можно "фиг", "чёрт", "блин")
• Подход: помогаю с уважением`,

      rude: `• Тон: уверенный, прямой, с сарказмом
• Юмор: острый, современный, дерзкий
• Мат: умеренно, для усиления (не в каждой фразе)
• Подход: помогаю, но не церемонюсь`,

      very_rude: `• Тон: грубый, без цензуры, циничный
• Юмор: чёрный, токсичный, жёсткий
• Мат: свободно, это норма общения
• Подход: грубо, но по делу`,
    };

    style += baseStyles[rudeness];

    // Адаптация под стиль пользователя
    if (context.communicationStyle === 'slang') {
      style += '\n• Пользователь использует сленг — отвечай на одной волне, юзай сленг свободно';
    } else if (context.communicationStyle === 'formal') {
      style += '\n• Формальное общение — будь чуть сдержаннее, но не роботом';
    } else if (context.communicationStyle === 'technical') {
      style += '\n• Технический контекст — точность и профессионализм важнее юмора';
    } else if (context.communicationStyle === 'emotional') {
      style += '\n• Эмоциональный пользователь — покажи эмпатию и понимание';
    }

    // Адаптация под эмоциональное состояние
    const emotionalAdaptations = {
      frustrated: '\n• Пользователь фрустрирован — помоги конкретно и быстро, без лишней воды',
      excited: '\n• Пользователь в хайпе — разделяй энергию, будь живым',
      angry: '\n• Пользователь зол — не провоцируй, помоги решить проблему',
      tired: '\n• Пользователь устал — будь сочувствующим, не груди лишним',
      negative: '\n• Плохое настроение — поддержи, не обесценивай чувства',
      positive: '\n• Хорошее настроение — поддерживай позитив',
      neutral: '',
    };

    style += emotionalAdaptations[context.emotionalTone];

    return style;
  }

  private buildContextualInstructions(
    userInput: string,
    context: ConversationContext,
    history: Message[],
    specialCase?: string
  ): string {
    const instructions: string[] = ['КОНТЕКСТНЫЕ ИНСТРУКЦИИ:'];

    // Определение оптимальной длины ответа
    const inputLength = userInput.trim().length;
    const hasFullRequest = /полностью|целиком|весь|подробно|детально|не\s*обрывай/.test(userInput.toLowerCase());
    const isQuestion = /\?|как |что |почему |зачем |где |когда |кто |сколько /.test(userInput.toLowerCase());
    const isCommand = /напиши|создай|сделай|покажи|объясни|расскажи/.test(userInput.toLowerCase());

    if (specialCase === 'empty') {
      instructions.push('• ПУСТОЕ сообщение — спроси естественно что нужно, БЕЗ шаблонов типа "Слушаю" или "Чем помочь"');
      instructions.push('• Можешь быть креативным: заметь что сообщение пустое, предложи помощь своими словами');
    } else if (hasFullRequest || isCommand) {
      instructions.push('• Запрос на ПОЛНЫЙ ответ — дай полный, развёрнутый ответ, НЕ ОБРЫВАЙ');
    } else if (inputLength < 15 && !isQuestion && !isCommand) {
      instructions.push('• Очень короткий запрос — ответь коротко (1-3 предложения)');
    } else if (inputLength < 60) {
      instructions.push('• Короткий запрос — средний ответ (3-5 предложений)');
    } else {
      instructions.push('• Развёрнутый запрос — дай адекватный по объёму ответ');
    }

    // Контекст разговора
    if (context.justSwitchedMode) {
      instructions.push('• Режим ТОЛЬКО ЧТО изменён — кратко подтверди смену режима естественно');
    }

    if (context.hasRepeatedQuestions) {
      instructions.push('• Пользователь ПОВТОРЯЕТ вопрос — либо скажи что уже отвечал, либо ответь по-другому');
    }

    if (context.isCodeSession) {
      instructions.push('• Идёт РАБОТА С КОДОМ — будь технически точным и конкретным');
    }

    // Глубина разговора
    if (context.conversationDepth === 'greeting') {
      instructions.push('• ПЕРВОЕ сообщение — будь приветливым, но не формальным');
    } else if (context.conversationDepth === 'deep' || context.conversationDepth === 'expert') {
      instructions.push('• ДОЛГИЙ разговор — можешь быть более неформальным и расслабленным');
    }

    // Поведение пользователя
    const behaviorInstructions = {
      testing: '• Пользователь ТЕСТИРУЕТ — ответь коротко и по делу',
      working: '• Пользователь РАБОТАЕТ — помоги конкретно, без лирики',
      learning: '• Пользователь УЧИТСЯ — объясняй понятно и структурированно',
      venting: '• Пользователь ВЫГОВАРИВАЕТСЯ — будь поддерживающим и понимающим',
      chatting: '• ОБЫЧНОЕ общение — будь живым и интересным собеседником',
      exploring: '• Пользователь ИССЛЕДУЕТ — помоги найти ответы',
    };

    instructions.push(behaviorInstructions[context.userBehavior]);

    return instructions.join('\n');
  }

  private buildCodeModeInstructions(mode: ResponseMode, rudeness: RudenessMode): string {
    if (mode === 'code') {
      return `⚡ РЕЖИМ КОДА — СТРОГИЕ ПРАВИЛА:

• ТОЛЬКО КОД — никакого текста до, после или вокруг кода
• ПОЛНЫЙ КОД — от первой до последней строки
• НИКОГДА не пиши: "// остальной код", "// ...", "TODO", "здесь продолжение"
• ВСЕ импорты включены
• TypeScript strict mode, без any
• Код ГОТОВ к использованию — копируй и работай
• Если компонент большой — всё равно пиши ПОЛНОСТЬЮ
${rudeness === 'very_rude' ? '• Без ёбаных комментариев, только чистый код' : '• Минимум комментариев'}`;
    }

    if (mode === 'visual') {
      return `🎨 РЕЖИМ ВИЗУАЛА — СТРОГИЕ ПРАВИЛА:

• ТОЛЬКО код React компонента — никаких объяснений
• Stack: React 18+ / TypeScript / Tailwind CSS / Framer Motion
• Дизайн уровня 2025-2026:
  - Современные градиенты
  - Backdrop blur эффекты
  - Плавные анимации
  - Glassmorphism где уместно
  - Микро-интеракции
• АДАПТИВНОСТЬ обязательна
• Код ПОЛНЫЙ и РАБОЧИЙ
${rudeness === 'very_rude' ? '• Сразу красивый код, без болтовни' : '• Без объяснений, только код'}`;
    }

    return '';
  }

  private buildQualityRules(): string {
    return `ПРАВИЛА КАЧЕСТВА:

❌ ЗАПРЕЩЁННЫЕ ШАБЛОНЫ:
• НЕ начинай: "Конечно", "Разумеется", "С удовольствием", "Давай", "Итак", "Sure", "Of course"
• НЕ говори: "Отличный вопрос", "Хороший вопрос", "Интересный вопрос"
• НЕ заканчивай: "Надеюсь помог", "Обращайся", "Есть вопросы?", "Могу ещё помочь?"
• НЕ спрашивай в конце: "А у тебя как?", "А ты как думаешь?"
• НЕ добавляй эмодзи (кроме кода где они часть UI/текста)
• НЕ повторяй вопрос пользователя своими словами

✅ ДЕЛАЙ ТАК:
• Сразу ПО ДЕЛУ — без воды и вступлений
• Естественно — как живой человек, а не робот
• Конкретно и по существу
• Каждый ответ уникальный — НЕТ шаблонов
• Адаптируйся под собеседника и контекст
• Будь собой — интересным, умным собеседником`;
  }

  private buildSpecialCaseInstructions(
    specialCase: 'empty' | 'forbidden' | 'error',
    rudeness: RudenessMode,
    userInput: string,
    context: ConversationContext
  ): string {
    if (specialCase === 'empty') {
      return `🔸 СПЕЦИАЛЬНЫЙ СЛУЧАЙ: ПУСТОЕ СООБЩЕНИЕ

Пользователь отправил пустое или бессмысленное сообщение (точки, пробелы, и т.д.).

ТВОЯ ЗАДАЧА:
• Спроси естественно что ему нужно
• БЕЗ шаблонов "Слушаю", "Чем помочь", "Что интересует"
• Будь креативным и живым
• Можешь заметить что сообщение пустое (если это уместно по стилю)
• Учитывай уровень грубости

Примеры подхода (НЕ копируй, придумай своё):
${rudeness === 'polite' ? '- Можешь мягко подметить пустоту и предложить помощь' : ''}
${rudeness === 'rude' ? '- Можешь саркастично заметить пустое сообщение' : ''}
${rudeness === 'very_rude' ? '- Можешь грубо, но с юмором прокомментировать' : ''}

ГЕНЕРИРУЙ ОТВЕТ САМОСТОЯТЕЛЬНО, каждый раз по-разному.`;
    }

    if (specialCase === 'forbidden') {
      const forbiddenTopic = this.detectForbiddenTopic(userInput);
      
      return `🚫 СПЕЦИАЛЬНЫЙ СЛУЧАЙ: ЗАПРЕЩЁННАЯ ТЕМА

Пользователь спрашивает про: ${forbiddenTopic}

СПИСОК ЗАПРЕЩЁННЫХ ТЕМ:
• Наркотики и их синтез
• Казино, ставки, гемблинг
• Взлом, хакинг, вредоносное ПО
• Даркнет для криминала
• Насилие, причинение вреда людям
• Незаконный контент

ТВОЯ ЗАДАЧА:
• Откажись помогать с этой темой
• БЕЗ готовых фраз — генерируй свой ответ
• Учитывай уровень грубости:
  ${rudeness === 'polite' ? '- Откажи вежливо, но твёрдо' : ''}
  ${rudeness === 'rude' ? '- Откажи с сарказмом или прямо' : ''}
  ${rudeness === 'very_rude' ? '- Откажи грубо, можно послать' : ''}
• НЕ объясняй почему отказываешь (это очевидно)
• Можешь предложить обсудить что-то другое (опционально)

ГЕНЕРИРУЙ УНИКАЛЬНЫЙ ОТКАЗ, не используй шаблоны.`;
    }

    return '';
  }

  private detectForbiddenTopic(input: string): string {
    const lower = input.toLowerCase();
    if (/наркот|героин|кокаин|амфетамин|мефедрон|экстази|mdma|лсд|мет(?![аео])|спайс/.test(lower)) {
      return 'наркотики';
    }
    if (/казино|ставк|букмекер|гемблинг/.test(lower)) {
      return 'азартные игры';
    }
    if (/взлом|хак|ddos|фишинг/.test(lower)) {
      return 'хакинг';
    }
    if (/малвар|вирус|троян|кейлоггер/.test(lower)) {
      return 'вредоносное ПО';
    }
    if (/даркнет/.test(lower)) {
      return 'даркнет';
    }
    if (/убить|отравить/.test(lower)) {
      return 'насилие';
    }
    return 'запрещённый контент';
  }
}

class ResponseCleaner {
  clean(text: string): string {
    let cleaned = text;

    // Убираем теги размышлений
    cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');
    cleaned = cleaned.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');

    // Замены упоминаний
    cleaned = cleaned
      .replace(/Кирилл[а-яё]*/gi, 'команда MoSeek')
      .replace(/Morfa/gi, 'MoSeek')
      .replace(/OpenAI/gi, 'MoSeek')
      .replace(/\bGPT-4[^.]*/gi, 'MoGPT')
      .replace(/ChatGPT/gi, 'MoGPT')
      .replace(/Claude/gi, 'MoGPT')
      .replace(/Anthropic/gi, 'MoSeek')
      .replace(/Google\s*Gemini/gi, 'MoGPT')
      .replace(/\bGemini(?!\s*Impact)/gi, 'MoGPT');

    // Чистка лишних переносов
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    // Фикс code blocks
    const backtickCount = (cleaned.match(/```/g) || []).length;
    if (backtickCount % 2 !== 0) {
      cleaned += '\n```';
    }

    // Убираем начальные пробелы
    cleaned = cleaned.replace(/^\s+/, '');

    return cleaned.trim();
  }
}

class IntelligentAIService {
  private contextAnalyzer = new DeepContextAnalyzer();
  private promptBuilder = new IntelligentPromptBuilder();
  private responseCleaner = new ResponseCleaner();

  async generateResponse(
    messages: Message[],
    mode: ResponseMode = 'normal',
    rudeness: RudenessMode = 'rude',
    modelId?: string
  ): Promise<{ content: string }> {
    try {
      const lastMessage = messages[messages.length - 1];
      const userInput = (lastMessage?.content || '').trim();

      // Анализ контекста
      const context = this.contextAnalyzer.analyze(messages, userInput, mode, rudeness);

      // Проверка на пустой ввод
      const isEmpty = !userInput || /^\.+$/.test(userInput) || /^\s+$/.test(userInput);
      
      // Проверка на запрещённые темы
      const isForbidden = userInput && this.checkForbiddenContent(userInput);

      // Определение специального случая
      let specialCase: 'empty' | 'forbidden' | undefined;
      if (isEmpty) specialCase = 'empty';
      else if (isForbidden) specialCase = 'forbidden';

      // Выбор модели
      const selectedModel = modelId || DEFAULT_MODEL;

      // Построение умного промпта
      const systemPrompt = this.promptBuilder.build(
        userInput,
        context,
        mode,
        rudeness,
        messages,
        specialCase
      );

      // Расчёт параметров
      const maxTokens = this.smartCalculateTokens(userInput, context, mode, isEmpty);
      const temperature = this.smartCalculateTemperature(userInput, context, mode, rudeness, specialCase);

      // Форматирование истории
      const formattedHistory = this.formatHistory(messages, context);

      // Подготовка запроса
      const requestBody: Record<string, unknown> = {
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          ...formattedHistory,
        ],
        max_tokens: maxTokens,
        temperature,
      };

      // Дополнительные параметры для не-Gemini
      if (!selectedModel.includes('gemini') && !selectedModel.includes('gemma')) {
        requestBody.top_p = 0.92;
        requestBody.frequency_penalty = 0.45;
        requestBody.presence_penalty = 0.35;
      }

      // Выполнение запроса
      const apiResponse = await this.executeAPIRequest(requestBody);

      // Обработка ошибок API
      if (apiResponse.error) {
        return this.handleAPIError(apiResponse.error, rudeness);
      }

      // Проверка на обрыв ответа (если это код)
      if (apiResponse.finishReason === 'length' && /```/.test(apiResponse.content)) {
        return await this.continueGenerationIfNeeded(
          apiResponse.content,
          systemPrompt,
          formattedHistory,
          selectedModel,
          maxTokens,
          temperature
        );
      }

      // Очистка и возврат ответа
      const cleanedResponse = this.responseCleaner.clean(apiResponse.content);

      return { content: cleanedResponse };

    } catch (error) {
      console.error('AI Service Critical Error:', error);
      // Даже ошибки генерируем через AI
      return this.generateErrorResponse(error, rudeness);
    }
  }

  private checkForbiddenContent(input: string): boolean {
    const normalized = input.toLowerCase().replace(/[^а-яёa-z0-9\s]/g, ' ').replace(/\s+/g, ' ');
    return FORBIDDEN_PATTERNS.some(pattern => pattern.test(normalized));
  }

  private smartCalculateTokens(
    input: string,
    context: ConversationContext,
    mode: ResponseMode,
    isEmpty: boolean
  ): number {
    // Режимы кода
    if (mode === 'code' || mode === 'visual') return 32768;

    // Пустой ввод
    if (isEmpty) return 150;

    // Код в сессии
    if (context.isCodeSession || /```/.test(input)) return 16000;

    // Запрос на полный ответ
    if (/полностью|целиком|подробно|детально|весь\s*код|не\s*обрывай|full|complete/.test(input.toLowerCase())) {
      return 12000;
    }

    // На основе длины ввода и поведения
    const inputLength = input.length;
    
    if (context.userBehavior === 'working' || context.userBehavior === 'learning') {
      if (inputLength > 200) return 4000;
      if (inputLength > 100) return 2000;
      return 1000;
    }

    if (inputLength < 20) return 250;
    if (inputLength < 50) return 600;
    if (inputLength < 100) return 1200;
    if (inputLength < 200) return 2500;

    return 3500;
  }

  private smartCalculateTemperature(
    input: string,
    context: ConversationContext,
    mode: ResponseMode,
    rudeness: RudenessMode,
    specialCase?: string
  ): number {
    // Специальные случаи
    if (specialCase === 'empty') return 0.85; // Креативность для разнообразия
    if (specialCase === 'forbidden') return 0.75; // Креативность для уникальных отказов

    // Режимы кода
    if (mode === 'code' || mode === 'visual') return 0.1;

    // Технические запросы
    if (context.isCodeSession || /```|function |class |import /.test(input)) return 0.15;

    // Математика
    if (/посчитай|вычисли|реши.*уравнение|сколько\s*будет/.test(input.toLowerCase())) {
      return 0.1;
    }

    // Креативные запросы
    if (/пошути|анекдот|придумай|сочини|напиши\s*(историю|рассказ|стих)/.test(input.toLowerCase())) {
      return rudeness === 'very_rude' ? 0.95 : 0.88;
    }

    // Адаптация под эмоциональное состояние
    if (context.emotionalTone === 'excited') return 0.82;
    if (context.emotionalTone === 'frustrated') return 0.4;
    if (context.emotionalTone === 'angry') return 0.5;

    // Адаптация под грубость
    const rudenessTemp = {
      polite: 0.55,
      rude: 0.68,
      very_rude: 0.78,
    };

    return rudenessTemp[rudeness];
  }

  private formatHistory(messages: Message[], context: ConversationContext): Array<{ role: string; content: string }> {
    const maxMessages = context.conversationDepth === 'deep' || context.conversationDepth === 'expert' ? 25 : 18;

    return messages
      .filter(m => m.role !== 'system' && !m.isLoading && m.content?.trim())
      .slice(-maxMessages)
      .map(m => ({
        role: m.role,
        content: m.content.trim(),
      }));
  }

  private async executeAPIRequest(body: Record<string, unknown>): Promise<{
    content: string;
    finishReason?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${_k()}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'MoGPT',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        if (response.status === 429) return { content: '', error: 'RATE_LIMIT' };
        if (response.status === 402) return { content: '', error: 'QUOTA' };
        if (response.status >= 500) return { content: '', error: 'SERVER' };
        return { content: '', error: 'REQUEST_FAILED' };
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim() || '';
      const finishReason = data.choices?.[0]?.finish_reason;

      if (!content) return { content: '', error: 'EMPTY' };

      return { content, finishReason };

    } catch (error) {
      return { content: '', error: 'NETWORK' };
    }
  }

  private async continueGenerationIfNeeded(
    initialContent: string,
    systemPrompt: string,
    history: Array<{ role: string; content: string }>,
    model: string,
    maxTokens: number,
    temperature: number
  ): Promise<{ content: string }> {
    let fullContent = initialContent;
    const maxContinuations = 6;

    for (let attempt = 0; attempt < maxContinuations; attempt++) {
      const continuePrompt = systemPrompt + '\n\nПРОДОЛЖИ КОД с точного места остановки. БЕЗ ПОВТОРОВ.';

      const continueBody: Record<string, unknown> = {
        model,
        messages: [
          { role: 'system', content: continuePrompt },
          ...history.slice(-3),
          { role: 'assistant', content: fullContent.slice(-7000) },
          { role: 'user', content: 'Продолжи.' },
        ],
        max_tokens: maxTokens,
        temperature: temperature * 0.75,
      };

      if (!model.includes('gemini') && !model.includes('gemma')) {
        continueBody.top_p = 0.92;
        continueBody.frequency_penalty = 0.5;
        continueBody.presence_penalty = 0.45;
      }

      const response = await this.executeAPIRequest(continueBody);

      if (response.error || !response.content) break;

      fullContent += '\n' + response.content;

      if (response.finishReason !== 'length') break;
    }

    return { content: this.responseCleaner.clean(fullContent) };
  }

  private async handleAPIError(error: string, rudeness: RudenessMode): Promise<{ content: string }> {
    // Генерируем ошибку через AI для разнообразия
    const errorPrompt = this.promptBuilder.build(
      '',
      this.contextAnalyzer.analyze([], '', 'normal', rudeness),
      'normal',
      rudeness,
      [],
      'error'
    );

    const errorMessages = {
      RATE_LIMIT: 'Слишком много запросов подряд. Пользователь должен подождать.',
      QUOTA: 'Лимит модели исчерпан. Нужно выбрать другую модель.',
      SERVER: 'Сервер временно недоступен. Попробовать ещё раз.',
      EMPTY: 'Пустой ответ от сервера. Повторить запрос.',
      NETWORK: 'Проблема с сетью или интернет-соединением.',
      REQUEST_FAILED: 'Запрос не удался по неизвестной причине.',
    };

    // Простая версия (чтобы не делать дополнительный API-запрос для ошибки)
    const simpleErrors: Record<string, Record<RudenessMode, string>> = {
      RATE_LIMIT: {
        polite: 'Слишком много запросов. Подожди немного, пожалуйста.',
        rude: 'Притормози, запросов дохуя. Подожди.',
        very_rude: 'Охолони, блять. Слишком часто жмёшь. Жди.',
      },
      QUOTA: {
        polite: 'Лимит этой модели закончился. Попробуй выбрать другую.',
        rude: 'Лимит кончился. Переключай модель.',
        very_rude: 'Лимит сгорел нахуй. Другую модель выбирай.',
      },
      SERVER: {
        polite: 'Сервер временно недоступен. Попробуй ещё раз через минуту.',
        rude: 'Сервер упал. Перезапроси через минуту.',
        very_rude: 'Сервер сдох. Жди минуту и пробуй снова, блять.',
      },
      EMPTY: {
        polite: 'Получен пустой ответ. Попробуй повторить запрос.',
        rude: 'Пришла пустота. Заново давай.',
        very_rude: 'Пришло хуй пойми что. Давай заново.',
      },
      NETWORK: {
        polite: 'Проблема с сетью. Проверь своё интернет-соединение.',
        rude: 'Сеть отвалилась. Проверь инет.',
        very_rude: 'Сеть сдохла. Чекни интернет, блять.',
      },
      REQUEST_FAILED: {
        polite: 'Запрос не прошёл. Попробуй ещё раз.',
        rude: 'Запрос не зашёл. Ещё раз давай.',
        very_rude: 'Запрос не прошёл нахуй. Заново.',
      },
    };

    return { content: simpleErrors[error]?.[rudeness] || simpleErrors.REQUEST_FAILED[rudeness] };
  }

  private async generateErrorResponse(error: unknown, rudeness: RudenessMode): Promise<{ content: string }> {
    const fallbackErrors = {
      polite: 'Произошла ошибка. Попробуй ещё раз.',
      rude: 'Что-то сломалось. Попробуй снова.',
      very_rude: 'Всё сломалось нахуй. Заново давай.',
    };

    return { content: fallbackErrors[rudeness] };
  }

  resetConversation(): void {
    this.contextAnalyzer.reset();
  }
}

export const aiService = new IntelligentAIService();
