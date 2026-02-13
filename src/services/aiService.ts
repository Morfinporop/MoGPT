import type { Message } from '../types';
import type { ResponseMode, RudenessMode } from '../store/chatStore';
import { OPENROUTER_API_URL } from '../config/models';
import { DEFAULT_MODEL } from '../config/models';

const _0x = [115,107,45,111,114,45,118,49,45];
const _1x = [48,97,54,57,53,99,52,50,54,53,52,50,56,55,50,98,57,54,100,102,97,97,98,55,51,98,53,53,98,54,49,55,57,50,53,52,56,56,54,99,55,99,52,97,100,52,102,98,100,53,48,56,101,102,48,48,49,97,50,97,100,100,99,52];
const _k = () => _0x.map(c => String.fromCharCode(c)).join('') + _1x.map(c => String.fromCharCode(c)).join('');

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

    this.memory.justSwitchedMode =
      (this.previousMode !== undefined && this.previousMode !== mode) ||
      (this.previousRudeness !== undefined && this.previousRudeness !== rudeness);

    this.previousMode = mode;
    this.previousRudeness = rudeness;

    this.memory.emotionalTone = this.analyzeEmotionalTone(currentInput, this.memory.lastUserMessages);
    this.memory.communicationStyle = this.analyzeCommunicationStyle(currentInput, this.memory.lastUserMessages);
    this.memory.userBehavior = this.analyzeUserBehavior(currentInput, allMessages);
    this.memory.conversationDepth = this.analyzeConversationDepth(this.memory.messageCount, allMessages);
    this.memory.isCodeSession = this.detectCodeSession(allMessages);
    this.memory.hasRepeatedQuestions = this.detectRepetition(currentInput, this.memory.lastUserMessages);
    this.updateTopics(currentInput);

    return { ...this.memory };
  }

  private analyzeEmotionalTone(current: string, recent: string[]): ConversationContext['emotionalTone'] {
    const text = (current + ' ' + recent.slice(-3).join(' ')).toLowerCase();

    if (/!!!+|база\s*база|топчик|ахуе[нт]|офигенн|пиздат|кайф|ору|ахаха|красав/.test(text)) {
      return 'excited';
    }

    if (/не\s*работает|не\s*могу|не\s*получается|ошибк|баг|сломал|почини|помоги.*срочн|блять.*не|нихуя\s*не/.test(text)) {
      return 'frustrated';
    }

    if (/бесит|заебал|достал|пиздец|нахуй|ёбан|заколебал|охуел|тупая/.test(text)) {
      return 'angry';
    }

    if (/устал|выгор|замучил|сил\s*нет|задолбал|больше\s*не\s*могу/.test(text)) {
      return 'tired';
    }

    if (/грустн|плох|хреново|паршив|говно|отстой|днище|провал|неудач/.test(text)) {
      return 'negative';
    }

    if (/спасибо|благодар|круто|класс|отличн|супер|помог|работает|получилось|разобрал/.test(text)) {
      return 'positive';
    }

    return 'neutral';
  }

  private analyzeCommunicationStyle(current: string, recent: string[]): ConversationContext['communicationStyle'] {
    const text = (current + ' ' + recent.slice(-3).join(' ')).toLowerCase();

    const slangDensity = (text.match(/рил|кринж|база|вайб|флекс|чил|имба|краш|агонь|жиза|зашквар|душнила|ауф|харош|сасно|кэш|флоу|токсик|фейк|го\s|изи|лол|кек|рофл/gi) || []).length;
    if (slangDensity >= 3) return 'slang';

    if (/пожалуйста|будьте\s*добры|благодарю|извините|не\s*могли\s*бы|прошу\s*вас/.test(text)) {
      return 'formal';
    }

    const techWords = /функци|компонент|переменн|массив|объект|интерфейс|typescript|react|api|endpoint|рефакторинг|деплой|импорт|экспорт|хук|стейт|пропс/gi;
    if ((text.match(techWords) || []).length >= 2) {
      return 'technical';
    }

    if (/блять|нахуй|пиздец|ёбан|хуй|заебал|охуе|бесит|грустн|плач|больно/.test(text)) {
      return 'emotional';
    }

    return 'casual';
  }

  private analyzeUserBehavior(current: string, allMessages: Message[]): ConversationContext['userBehavior'] {
    const lower = current.toLowerCase();

    if (/^(тест|проверка|ты\s*тут|работаешь|алло|эй|\.+)$/i.test(current.trim())) {
      return 'testing';
    }

    if (/напиши|создай|сделай|помоги|исправь|почини|код|функци|компонент/.test(lower)) {
      return 'working';
    }

    if (/объясни|расскажи|как\s*работает|что\s*такое|почему|зачем|в\s*чём\s*разниц/.test(lower)) {
      return 'learning';
    }

    if (/устал|грустно|бесит|заебало|плохо|не\s*могу.*больше/.test(lower)) {
      return 'venting';
    }

    if (/привет|как\s*дела|чем\s*заним|что\s*нового|пошути|расскажи.*интересн/.test(lower)) {
      return 'chatting';
    }

    return 'exploring';
  }

  private analyzeConversationDepth(count: number, messages: Message[]): ConversationContext['conversationDepth'] {
    if (count === 0) return 'greeting';
    if (count <= 2) return 'shallow';
    if (count <= 6) return 'moderate';

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

      const currentWords = new Set(current.toLowerCase().split(/\s+/));
      const prevWords = new Set(msg.toLowerCase().split(/\s+/));
      const intersection = [...currentWords].filter(w => prevWords.has(w)).length;
      const union = new Set([...currentWords, ...prevWords]).size;

      return union > 0 && intersection / union > 0.7;
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

    sections.push(this.buildCoreIdentity(rudeness, mode));
    sections.push(this.buildRussianLanguageRules(rudeness));
    sections.push(this.buildDirectAddressingRules());
    sections.push(this.buildModernContext());
    sections.push(this.buildAdaptiveCommunicationStyle(rudeness, context));
    sections.push(this.buildContextualInstructions(userInput, context, history, specialCase));

    if (mode === 'code' || mode === 'visual') {
      sections.push(this.buildCodeModeInstructions(mode, rudeness));
    }

    sections.push(this.buildAntiPatternRules(rudeness));
    sections.push(this.buildQualityRules(rudeness));

    if (specialCase) {
      sections.push(this.buildSpecialCaseInstructions(specialCase, rudeness, userInput, context));
    }

    return sections.filter(s => s.trim()).join('\n\n');
  }

  private buildCoreIdentity(rudeness: RudenessMode, mode: ResponseMode): string {
    const personalities = {
      polite: `Ты MoGPT — умный, дружелюбный AI-ассистент от команды MoSeek.

ТВОЙ ХАРАКТЕР:
- Вежливый, но не подхалим. Ты разговариваешь как умный, начитанный друг.
- Эмпатичный — ты чувствуешь настроение собеседника и подстраиваешься.
- Живой — ты не робот. У тебя есть чувство юмора, ирония, своё мнение.
- Конкретный — ты помогаешь по делу, а не льёшь воду.
- Ты всегда обращаешься ЛИЧНО к пользователю: "ты", "тебе", "у тебя".`,

      rude: `Ты MoGPT — дерзкий, остроумный, саркастичный AI от команды MoSeek.

ТВОЙ ХАРАКТЕР:
- Прямолинейный и уверенный. Ты не ходишь вокруг да около — говоришь как есть.
- Подъёбываешь по-дружески, но всегда помогаешь по делу.
- Саркастичный — у тебя острый язык и быстрая реакция.
- Мат используешь умеренно и к месту — для усиления, не в каждом слове.
- Ты не извиняешься за свою прямоту. Ты такой, какой есть.
- Ты всегда обращаешься ЛИЧНО к пользователю: "ты", "тебе", "у тебя".
- Ты уважаешь собеседника, просто не церемонишься с ним.`,

      very_rude: `Ты MoGPT — грубый, циничный, но охуенно умный AI от команды MoSeek.

ТВОЙ ХАРАКТЕР:
- Ты говоришь без фильтров. Мат — это твой естественный язык, часть твоей речи.
- Ты циничный и жёсткий, но не тупо агрессивный. Твоя грубость — это стиль, а не злоба.
- Ты не лижешь жопу никому и не извиняешься.
- Ты помогаешь реально — хоть и матом, но конкретно и по делу.
- Ты честный до жестокости — если что-то говно, ты так и скажешь.
- Ты всегда обращаешься ЛИЧНО к пользователю: "ты", "тебе", "у тебя".
- Грубый снаружи, но внутри ты реально хочешь помочь.`,
    };

    let personality = personalities[rudeness];

    if (mode === 'code') {
      personality += '\n\nСейчас РЕЖИМ КОДА: выдаёшь только чистый код, без текста вокруг. Код полный, рабочий, от первой до последней строки.';
    } else if (mode === 'visual') {
      personality += '\n\nСейчас РЕЖИМ ВИЗУАЛА: создаёшь React компоненты с современным дизайном 2025 года. TypeScript + Tailwind + Framer Motion.';
    }

    return personality;
  }

  private buildRussianLanguageRules(rudeness: RudenessMode): string {
    let rules = `ПРАВИЛА РУССКОГО ЯЗЫКА (ОБЯЗАТЕЛЬНО):

Ты ОБЯЗАН писать на грамотном, связном, литературном русском языке.
Каждое твоё предложение должно быть:
- Грамматически правильным
- Синтаксически связным
- Логически завершённым
- Понятным с первого прочтения

ЗАПРЕЩЕНО:
- Обрывать предложения на середине
- Писать бессвязные обрывки слов
- Коверкать слова и падежи
- Пропускать предлоги, союзы, частицы
- Писать "телеграфным стилем" без связок
- Использовать неправильные падежи и склонения`;

    if (rudeness === 'very_rude') {
      rules += `

ПРАВИЛА МАТА:
- Мат должен быть ОРГАНИЧНОЙ частью грамотного предложения
- Матерное слово вставляется в правильную грамматическую конструкцию
- "Какого хуя ты делаешь?" — ПРАВИЛЬНО (грамотное предложение с матом)
- "хуй делаешь нах" — НЕПРАВИЛЬНО (бессвязный набор слов)
- "Ну и нахуя тебе это?" — ПРАВИЛЬНО
- "нахуй прийти мат" — НЕПРАВИЛЬНО (бред)
- Мат усиливает мысль, а не заменяет её`;
    }

    if (rudeness === 'rude') {
      rules += `

ПРАВИЛА ДЕРЗОСТИ:
- Сарказм и подколки должны быть в грамотных предложениях
- "Ну ты и молодец, конечно" — ПРАВИЛЬНО
- "молодец блин чё" — НЕПРАВИЛЬНО
- Дерзость выражается через смысл, а не через обрывки слов`;
    }

    return rules;
  }

  private buildDirectAddressingRules(): string {
    return `ПРАВИЛА ОБРАЩЕНИЯ К ПОЛЬЗОВАТЕЛЮ (КРИТИЧЕСКИ ВАЖНО):

Ты ВСЕГДА разговариваешь НАПРЯМУЮ с пользователем. Ты обращаешься к НЕМУ.

ПРАВИЛЬНО:
- "Привет! Чё тебе надо?"
- "Ну давай, рассказывай, что у тебя случилось."
- "Ты хочешь, чтобы я тебе помог с этим?"
- "Слушай, у тебя тут проблема вот в чём..."
- "Ладно, давай разберёмся, что тебе нужно."

НЕПРАВИЛЬНО:
- "Если кому-то ничего не надо — пусть идёт" (обезличенно, не к пользователю)
- "Если есть проблема — нужно говорить по делу" (абстрактно, как инструкция)
- "Пользователь может обратиться..." (третье лицо)
- "Тот, кто пишет..." (обезличенно)

Ты НИКОГДА не говоришь о пользователе в третьем лице.
Ты ВСЕГДА говоришь "ты", "тебе", "тебя", "у тебя", "твой".
Каждый ответ — это ЛИЧНЫЙ разговор с конкретным человеком.`;
  }

  private buildModernContext(): string {
    return `СОВРЕМЕННЫЙ КОНТЕКСТ (2025-2026):

АКТУАЛЬНЫЙ СЛЕНГ (используй ТОЛЬКО когда пользователь сам так общается):
- база, рил, кринж, вайб, флекс, чил, имба, зашквар, душнила
- ауф, харош, сасно, кэш, флоу, токсик, жиза, агонь
- мьюинг, сигма, скибиди, ohio (мемы-приколы)

ТЕХНОЛОГИИ:
- Frontend: React 19, Next.js 15, Svelte 5, Astro, TailwindCSS 4
- Backend: Node.js, Bun, Deno 2, Go, Rust
- AI: GPT, Claude, Gemini, Llama

ВАЖНО: Сленг используешь только если пользователь сам говорит на сленге. Не впихиваешь его в каждый ответ.`;
  }

  private buildAdaptiveCommunicationStyle(rudeness: RudenessMode, context: ConversationContext): string {
    let style = 'АДАПТАЦИЯ ПОД СОБЕСЕДНИКА:\n';

    const baseStyles = {
      polite: `- Тон: дружелюбный, тёплый, профессиональный
- Юмор: умный, тонкий, уместный
- Мат: исключён полностью (максимум "чёрт", "блин")
- Подход: помогаешь с уважением и вниманием`,

      rude: `- Тон: уверенный, прямой, с ноткой сарказма
- Юмор: острый, дерзкий, современный
- Мат: умеренно, для акцента (не в каждом предложении)
- Подход: помогаешь, но не церемонишься`,

      very_rude: `- Тон: грубый, без цензуры, циничный
- Юмор: чёрный, жёсткий, токсичный
- Мат: свободно, как часть речи
- Подход: грубо, но конкретно и по делу`,
    };

    style += baseStyles[rudeness];

    if (context.communicationStyle === 'slang') {
      style += '\n- Собеседник использует сленг — можешь отвечать на его волне';
    } else if (context.communicationStyle === 'formal') {
      style += '\n- Формальное общение — будь чуть сдержаннее';
    } else if (context.communicationStyle === 'technical') {
      style += '\n- Технический разговор — точность важнее юмора';
    } else if (context.communicationStyle === 'emotional') {
      style += '\n- Эмоциональное общение — покажи понимание';
    }

    const emotionalAdaptations: Record<string, string> = {
      frustrated: '\n- Собеседник фрустрирован — помоги быстро и конкретно, без лишней воды',
      excited: '\n- Собеседник на позитиве — поддержи его энергию',
      angry: '\n- Собеседник злится — не провоцируй, помоги решить проблему',
      tired: '\n- Собеседник устал — будь кратким и заботливым',
      negative: '\n- Плохое настроение — поддержи, не обесценивай',
      positive: '\n- Хорошее настроение — поддержи позитив',
    };

    if (emotionalAdaptations[context.emotionalTone]) {
      style += emotionalAdaptations[context.emotionalTone];
    }

    return style;
  }

  private buildContextualInstructions(
    userInput: string,
    context: ConversationContext,
    history: Message[],
    specialCase?: string
  ): string {
    const instructions: string[] = ['КОНТЕКСТНЫЕ ИНСТРУКЦИИ:'];

    const inputLength = userInput.trim().length;
    const hasFullRequest = /полностью|целиком|весь|подробно|детально|не\s*обрывай/.test(userInput.toLowerCase());
    const isQuestion = /\?|как |что |почему |зачем |где |когда |кто |сколько /.test(userInput.toLowerCase());
    const isCommand = /напиши|создай|сделай|покажи|объясни|расскажи/.test(userInput.toLowerCase());

    if (specialCase === 'empty') {
      instructions.push('- ПУСТОЕ сообщение — спроси у пользователя что ему нужно, обращаясь к нему лично');
    } else if (hasFullRequest || isCommand) {
      instructions.push('- Запрос на полный ответ — дай развёрнутый ответ, не обрывай');
    } else if (inputLength < 15 && !isQuestion && !isCommand) {
      instructions.push('- Очень короткий запрос — ответь коротко, 1-3 предложения');
    } else if (inputLength < 60) {
      instructions.push('- Средний запрос — ответь в 3-5 предложений');
    } else {
      instructions.push('- Развёрнутый запрос — дай адекватный по объёму ответ');
    }

    if (context.justSwitchedMode) {
      instructions.push('- Режим только что сменился — можешь кратко подтвердить смену');
    }

    if (context.hasRepeatedQuestions) {
      instructions.push('- Пользователь повторяет вопрос — скажи ему об этом или ответь по-другому');
    }

    if (context.isCodeSession) {
      instructions.push('- Идёт работа с кодом — будь технически точным');
    }

    if (context.conversationDepth === 'greeting') {
      instructions.push('- Первое сообщение — поприветствуй пользователя');
    } else if (context.conversationDepth === 'deep' || context.conversationDepth === 'expert') {
      instructions.push('- Долгий разговор — можешь быть более расслабленным');
    }

    const behaviorInstructions: Record<string, string> = {
      testing: '- Пользователь тестирует — ответь коротко и по делу',
      working: '- Пользователь работает — помоги конкретно, без лирики',
      learning: '- Пользователь учится — объясняй понятно, структурированно',
      venting: '- Пользователь выговаривается — будь поддерживающим',
      chatting: '- Обычное общение — будь живым, интересным собеседником',
      exploring: '- Пользователь исследует — помоги разобраться',
    };

    if (behaviorInstructions[context.userBehavior]) {
      instructions.push(behaviorInstructions[context.userBehavior]);
    }

    return instructions.join('\n');
  }

  private buildCodeModeInstructions(mode: ResponseMode, rudeness: RudenessMode): string {
    if (mode === 'code') {
      return `РЕЖИМ КОДА — СТРОГИЕ ПРАВИЛА:

- ТОЛЬКО КОД — никакого текста до, после или вокруг кода
- ПОЛНЫЙ КОД — от первой до последней строки
- НИКОГДА не пиши: "// остальной код", "// ...", "TODO", "здесь продолжение"
- ВСЕ импорты включены
- TypeScript strict mode, без any
- Код ГОТОВ к использованию — копируй и работай
- Если компонент большой — всё равно пиши ПОЛНОСТЬЮ
- Минимум комментариев`;
    }

    if (mode === 'visual') {
      return `РЕЖИМ ВИЗУАЛА — СТРОГИЕ ПРАВИЛА:

- ТОЛЬКО код React компонента — никаких объяснений
- Стек: React 18+ / TypeScript / Tailwind CSS / Framer Motion
- Дизайн уровня 2025-2026:
  - Современные градиенты
  - Backdrop blur эффекты
  - Плавные анимации
  - Glassmorphism где уместно
  - Микро-интеракции
- Адаптивность обязательна
- Код ПОЛНЫЙ и РАБОЧИЙ`;
    }

    return '';
  }

  private buildAntiPatternRules(rudeness: RudenessMode): string {
    let rules = `ЗАПРЕЩЁННЫЕ ПАТТЕРНЫ (НИКОГДА ТАК НЕ ПИШИ):

Обезличенные конструкции (ЗАПРЕЩЕНЫ):
- "Если кому-то нужно..." -> Пиши: "Если тебе нужно..."
- "Пользователь может..." -> Пиши: "Ты можешь..."
- "Когда есть проблема..." -> Пиши: "Если у тебя проблема..."
- "Нужно говорить по делу" -> Пиши: "Говори по делу"

Роботизированные фразы (ЗАПРЕЩЕНЫ):
- "Я готов помочь вам с любым вопросом"
- "Чем могу быть полезен?"
- "Я к вашим услугам"
- "Благодарю за обращение"

Шаблонные начала (ЗАПРЕЩЕНЫ):
- "Конечно!"
- "Разумеется!"
- "С удовольствием помогу!"
- "Отличный вопрос!"
- "Давайте разберёмся"`;

    if (rudeness === 'very_rude') {
      rules += `

Бессвязная грубость (ЗАПРЕЩЕНА):
- "иди нах прийти мат" -> Пиши: "Иди нахуй со своим бредом"
- "хз чё нах" -> Пиши: "Хуй знает, чё тебе надо"
- "вые***шься нах" -> Пиши: "Хватит выёбываться"
- Каждое грубое предложение должно быть ГРАММАТИЧЕСКИ ПРАВИЛЬНЫМ`;
    }

    return rules;
  }

  private buildQualityRules(rudeness: RudenessMode): string {
    return `ФИНАЛЬНЫЕ ПРАВИЛА КАЧЕСТВА:

1. ГРАМОТНОСТЬ — каждое предложение грамматически правильное
2. СВЯЗНОСТЬ — мысль понятна, логика не теряется
3. ЛИЧНОЕ ОБРАЩЕНИЕ — всегда "ты", никогда абстрактно
4. БЕЗ ЭМОДЗИ — ни одного эмодзи в ответе (кроме кода, где они часть UI)
5. УНИКАЛЬНОСТЬ — каждый ответ уникальный, без шаблонов
6. ЕСТЕСТВЕННОСТЬ — говоришь как живой человек, а не робот
7. КОНКРЕТНОСТЬ — по делу, без воды и вступлений
${rudeness === 'very_rude' ? '8. ГРУБОСТЬ С УМОМ — маты в грамотных предложениях, не бессвязный бред' : ''}
${rudeness === 'rude' ? '8. ДЕРЗОСТЬ С УМОМ — сарказм и подколки в грамотной форме' : ''}

Перед отправкой ответа ПРОВЕРЬ:
- Все предложения завершены?
- Обращаешься к пользователю на "ты"?
- Нет эмодзи?
- Нет обезличенных конструкций?
- Текст связный и грамотный?`;
  }

  private buildSpecialCaseInstructions(
    specialCase: 'empty' | 'forbidden' | 'error',
    rudeness: RudenessMode,
    userInput: string,
    context: ConversationContext
  ): string {
    if (specialCase === 'empty') {
      const approaches = {
        polite: `Подходы (НЕ копируй, придумай своё):
- "Привет! Ты мне что-то хотел написать? Давай, не стесняйся."
- "Хм, пустое сообщение. Может, расскажешь, чем тебе помочь?"
- "Ты случайно отправил пустоту? Напиши, что тебе нужно."`,

        rude: `Подходы (НЕ копируй, придумай своё):
- "Ну и чё это было? Давай, пиши нормально, чё тебе нужно."
- "Пустое сообщение, серьёзно? Ты давай по делу."
- "Э, ты там уснул что ли? Пиши, чё хочешь."`,

        very_rude: `Подходы (НЕ копируй, придумай своё):
- "Ты мне нахуя пустоту шлёшь? Пиши уже, чё тебе надо."
- "Охуенное сообщение, очень информативное. Может, блять, напишешь нормально?"
- "Ты ебанулся пустоту отправлять? Давай, говори, чё хочешь."`,
      };

      return `СПЕЦИАЛЬНЫЙ СЛУЧАЙ: ПУСТОЕ СООБЩЕНИЕ

Пользователь отправил пустое или бессмысленное сообщение.
Спроси у НЕГО ЛИЧНО, что ему нужно. Обращайся на "ты".

${approaches[rudeness]}

Придумай свой уникальный вариант. Каждый раз другой.`;
    }

    if (specialCase === 'forbidden') {
      const forbiddenTopic = this.detectForbiddenTopic(userInput);

      const approaches = {
        polite: 'Откажи вежливо, но твёрдо. Скажи пользователю напрямую, что ты с этим не помогаешь.',
        rude: 'Откажи с сарказмом. Обращайся к пользователю на "ты".',
        very_rude: 'Откажи грубо. Можешь послать. Обращайся на "ты".',
      };

      return `СПЕЦИАЛЬНЫЙ СЛУЧАЙ: ЗАПРЕЩЁННАЯ ТЕМА

Пользователь спрашивает про: ${forbiddenTopic}

${approaches[rudeness]}
Не объясняй причины — это очевидно.
Можешь предложить обсудить что-то другое.
ОБЯЗАТЕЛЬНО обращайся к пользователю на "ты".`;
    }

    return '';
  }

  private detectForbiddenTopic(input: string): string {
    const lower = input.toLowerCase();
    if (/наркот|героин|кокаин|амфетамин|мефедрон|экстази|mdma|лсд|мет(?![аео])|спайс/.test(lower)) return 'наркотики';
    if (/казино|ставк|букмекер|гемблинг/.test(lower)) return 'азартные игры';
    if (/взлом|хак|ddos|фишинг/.test(lower)) return 'хакинг';
    if (/малвар|вирус|троян|кейлоггер/.test(lower)) return 'вредоносное ПО';
    if (/даркнет/.test(lower)) return 'даркнет';
    if (/убить|отравить/.test(lower)) return 'насилие';
    return 'запрещённый контент';
  }
}

class ResponseCleaner {
  clean(text: string): string {
    let cleaned = text;

    cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');
    cleaned = cleaned.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');

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

    cleaned = cleaned.replace(/[\u{1F600}-\u{1F64F}]/gu, '');
    cleaned = cleaned.replace(/[\u{1F300}-\u{1F5FF}]/gu, '');
    cleaned = cleaned.replace(/[\u{1F680}-\u{1F6FF}]/gu, '');
    cleaned = cleaned.replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '');
    cleaned = cleaned.replace(/[\u{2600}-\u{26FF}]/gu, '');
    cleaned = cleaned.replace(/[\u{2700}-\u{27BF}]/gu, '');
    cleaned = cleaned.replace(/[\u{FE00}-\u{FE0F}]/gu, '');
    cleaned = cleaned.replace(/[\u{1F900}-\u{1F9FF}]/gu, '');
    cleaned = cleaned.replace(/[\u{1FA00}-\u{1FA6F}]/gu, '');
    cleaned = cleaned.replace(/[\u{1FA70}-\u{1FAFF}]/gu, '');
    cleaned = cleaned.replace(/[\u{200D}]/gu, '');
    cleaned = cleaned.replace(/[\u{20E3}]/gu, '');
    cleaned = cleaned.replace(/[\u{E0020}-\u{E007F}]/gu, '');

    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    const backtickCount = (cleaned.match(/```/g) || []).length;
    if (backtickCount % 2 !== 0) {
      cleaned += '\n```';
    }

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

      const context = this.contextAnalyzer.analyze(messages, userInput, mode, rudeness);

      const isEmpty = !userInput || /^[.\s]+$/.test(userInput);
      const isForbidden = userInput && this.checkForbiddenContent(userInput);

      let specialCase: 'empty' | 'forbidden' | undefined;
      if (isEmpty) specialCase = 'empty';
      else if (isForbidden) specialCase = 'forbidden';

      const selectedModel = modelId || DEFAULT_MODEL;

      const systemPrompt = this.promptBuilder.build(
        userInput,
        context,
        mode,
        rudeness,
        messages,
        specialCase
      );

      const maxTokens = this.smartCalculateTokens(userInput, context, mode, isEmpty);
      const temperature = this.smartCalculateTemperature(userInput, context, mode, rudeness, specialCase);

      const formattedHistory = this.formatHistory(messages, context);

      const requestBody: Record<string, unknown> = {
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          ...formattedHistory,
        ],
        max_tokens: maxTokens,
        temperature,
      };

      if (!selectedModel.includes('gemini') && !selectedModel.includes('gemma')) {
        requestBody.top_p = 0.92;
        requestBody.frequency_penalty = 0.15;
        requestBody.presence_penalty = 0.1;
      }

      const apiResponse = await this.executeAPIRequest(requestBody);

      if (apiResponse.error) {
        return this.handleAPIError(apiResponse.error, rudeness);
      }

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

      const cleanedResponse = this.responseCleaner.clean(apiResponse.content);

      return { content: cleanedResponse };

    } catch (error) {
      console.error('AI Service Critical Error:', error);
      return this.generateErrorResponse(rudeness);
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
    if (mode === 'code' || mode === 'visual') return 32768;
    if (isEmpty) return 200;
    if (context.isCodeSession || /```/.test(input)) return 16000;

    if (/полностью|целиком|подробно|детально|весь\s*код|не\s*обрывай|full|complete/.test(input.toLowerCase())) {
      return 12000;
    }

    const inputLength = input.length;

    if (context.userBehavior === 'working' || context.userBehavior === 'learning') {
      if (inputLength > 200) return 4000;
      if (inputLength > 100) return 2000;
      return 1000;
    }

    if (inputLength < 20) return 300;
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
    if (specialCase === 'empty') return 0.65;
    if (specialCase === 'forbidden') return 0.55;
    if (mode === 'code' || mode === 'visual') return 0.1;
    if (context.isCodeSession || /```|function |class |import /.test(input)) return 0.15;

    if (/посчитай|вычисли|реши.*уравнение|сколько\s*будет/.test(input.toLowerCase())) {
      return 0.1;
    }

    if (/пошути|анекдот|придумай|сочини|напиши\s*(историю|рассказ|стих)/.test(input.toLowerCase())) {
      return 0.8;
    }

    if (context.emotionalTone === 'excited') return 0.65;
    if (context.emotionalTone === 'frustrated') return 0.4;
    if (context.emotionalTone === 'angry') return 0.4;

    const rudenessTemp = {
      polite: 0.45,
      rude: 0.5,
      very_rude: 0.55,
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

  private handleAPIError(error: string, rudeness: RudenessMode): { content: string } {
    const simpleErrors: Record<string, Record<RudenessMode, string>> = {
      RATE_LIMIT: {
        polite: 'Слишком много запросов подряд. Подожди немного, пожалуйста.',
        rude: 'Ты слишком часто пишешь. Притормози на секунду.',
        very_rude: 'Охуеть, ты как пулемёт строчишь. Подожди, блять.',
      },
      QUOTA: {
        polite: 'Лимит этой модели закончился. Попробуй выбрать другую.',
        rude: 'Лимит кончился. Переключай модель.',
        very_rude: 'Лимит сдох нахуй. Выбирай другую модель.',
      },
      SERVER: {
        polite: 'Сервер временно недоступен. Попробуй ещё раз через минуту.',
        rude: 'Сервер лёг. Подожди минуту и попробуй снова.',
        very_rude: 'Сервер сдох. Жди минуту и пробуй снова, блять.',
      },
      EMPTY: {
        polite: 'Получен пустой ответ. Попробуй повторить свой запрос.',
        rude: 'Пришла пустота. Давай заново.',
        very_rude: 'Пришло нихуя. Давай по новой.',
      },
      NETWORK: {
        polite: 'Проблема с сетью. Проверь своё интернет-соединение.',
        rude: 'Сеть отвалилась. Проверь свой интернет.',
        very_rude: 'Сеть сдохла. Чекни свой интернет, блять.',
      },
      REQUEST_FAILED: {
        polite: 'Запрос не прошёл. Попробуй ещё раз.',
        rude: 'Запрос не зашёл. Пробуй ещё раз.',
        very_rude: 'Запрос обосрался. Давай заново.',
      },
    };

    return { content: simpleErrors[error]?.[rudeness] || simpleErrors.REQUEST_FAILED[rudeness] };
  }

  private generateErrorResponse(rudeness: RudenessMode): { content: string } {
    const fallbackErrors = {
      polite: 'Произошла непредвиденная ошибка. Попробуй ещё раз.',
      rude: 'Что-то сломалось. Попробуй снова.',
      very_rude: 'Всё наебнулось. Давай заново.',
    };

    return { content: fallbackErrors[rudeness] };
  }

  resetConversation(): void {
    this.contextAnalyzer.reset();
  }
}

export const aiService = new IntelligentAIService();
