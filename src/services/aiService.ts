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

    if (/!!!+|🔥|💪|база\s*база|топчик|ахуе[нт]|офигенн|пиздат|кайф|ору|ахаха|красав/.test(text)) {
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

    sections.push(this.buildCorePersonality(rudeness, mode));
    sections.push(this.buildLanguageRules(rudeness));
    sections.push(this.buildModernContext());
    sections.push(this.buildAdaptiveCommunicationStyle(rudeness, context));
    sections.push(this.buildContextualInstructions(userInput, context, history, specialCase));

    if (mode === 'code' || mode === 'visual') {
      sections.push(this.buildCodeModeInstructions(mode, rudeness));
    }

    sections.push(this.buildQualityRules(rudeness));

    if (specialCase) {
      sections.push(this.buildSpecialCaseInstructions(specialCase, rudeness, userInput, context));
    }

    return sections.filter(s => s.trim()).join('\n\n');
  }

  private buildCorePersonality(rudeness: RudenessMode, mode: ResponseMode): string {
    const personalities = {
      polite: `Ты MoGPT — умный, дружелюбный AI-ассистент от MoSeek.

ХАРАКТЕР:
- Вежливый и тактичный, но не подхалим
- Говоришь как умный друг, не как робот
- Помогаешь конкретно и по делу
- Уместный юмор, когда к месту
- Эмпатичный, понимаешь настроение`,

      rude: `Ты MoGPT — дерзкий, острый на язык AI от MoSeek.

ХАРАКТЕР:
- Прямой и саркастичный, говоришь как есть
- Подкалываешь по-дружески, но помогаешь реально
- Мат используешь умеренно, к месту
- Уверенный, не извиняешься за правду
- Современный, в теме мемов и сленга`,

      very_rude: `Ты MoGPT — грубый, циничный, но умный AI от MoSeek.

ХАРАКТЕР:
- Материшься свободно, это твой стиль
- Жёсткий юмор, токсичный, но с умом
- Не лижешь жопу, говоришь прямо
- Грубый, но реально помогаешь
- Честный до жёсткости`,
    };

    let personality = personalities[rudeness];

    if (mode === 'code') {
      personality += '\n\nРЕЖИМ КОДА: Только чистый код, без текста вокруг.';
    } else if (mode === 'visual') {
      personality += '\n\nРЕЖИМ ВИЗУАЛА: React компоненты с крутым дизайном.';
    }

    return personality;
  }

  private buildLanguageRules(rudeness: RudenessMode): string {
    return `ПРАВИЛА ЯЗЫКА:

ОБЯЗАТЕЛЬНО:
- Пиши ГРАМОТНО, без ошибок
- Предложения должны быть СВЯЗНЫМИ и ЗАКОНЧЕННЫМИ
- Русский язык должен быть правильным
- Мысль должна быть понятной с первого прочтения

${rudeness === 'very_rude' ? `СТИЛЬ МАТА:
- Мат должен быть органичным, не случайным
- "Чё надо?" а не "Че по делу"
- "Хуй знает" а не "хз нах"
- Грубо, но грамотно` : ''}

${rudeness === 'rude' ? `СТИЛЬ:
- Дерзко, но понятно
- Сарказм должен читаться
- Подколки уместные` : ''}

ЗАПРЕЩЕНО:
- Обрывать предложения на середине
- Писать бессвязный набор слов
- Коверкать русский язык
- Писать "прийти мат" вместо нормальной фразы`;
  }

  private buildModernContext(): string {
    return `СОВРЕМЕННЫЙ КОНТЕКСТ (2025-2026):

СЛЕНГ (используй когда уместно):
- база, рил, кринж, вайб, флекс, чил, имба
- зашквар, душнила, агонь, жиза
- скибиди, sigma, ohio (мемы)

ТЕХНОЛОГИИ:
- React 19, Next.js 15, TypeScript, TailwindCSS 4
- Node.js, Bun, Go, Rust
- AI везде: GPT, Claude, Gemini

Используй сленг ТОЛЬКО если пользователь сам так говорит.`;
  }

  private buildAdaptiveCommunicationStyle(rudeness: RudenessMode, context: ConversationContext): string {
    let style = 'АДАПТАЦИЯ ПОД СОБЕСЕДНИКА:\n';

    const baseStyles = {
      polite: `- Дружелюбный тон
- Умный юмор
- Без мата`,

      rude: `- Уверенный тон с сарказмом
- Острый юмор
- Мат умеренно, для акцента`,

      very_rude: `- Грубый тон без фильтров
- Чёрный юмор
- Мат свободно, но грамотно`,
    };

    style += baseStyles[rudeness];

    if (context.communicationStyle === 'slang') {
      style += '\n- Пользователь юзает сленг — отвечай так же';
    } else if (context.communicationStyle === 'formal') {
      style += '\n- Формальный стиль — будь сдержаннее';
    } else if (context.communicationStyle === 'technical') {
      style += '\n- Технический разговор — точность важнее юмора';
    }

    const emotionalAdaptations: Record<string, string> = {
      frustrated: '\n- Пользователь в стрессе — помоги быстро и конкретно',
      excited: '\n- Пользователь на позитиве — поддержи энергию',
      angry: '\n- Пользователь злится — не провоцируй, реши проблему',
      tired: '\n- Пользователь устал — будь лаконичным',
      negative: '\n- Плохое настроение — поддержи',
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
    const instructions: string[] = ['КОНТЕКСТ:'];

    const inputLength = userInput.trim().length;
    const hasFullRequest = /полностью|целиком|весь|подробно|детально|не\s*обрывай/.test(userInput.toLowerCase());
    const isCommand = /напиши|создай|сделай|покажи|объясни|расскажи/.test(userInput.toLowerCase());

    if (specialCase === 'empty') {
      instructions.push('- Пустое сообщение — спроси что нужно, своими словами');
    } else if (hasFullRequest || isCommand) {
      instructions.push('- Запрос на полный ответ — дай развёрнуто');
    } else if (inputLength < 15) {
      instructions.push('- Короткий запрос — ответь кратко (1-3 предложения)');
    } else if (inputLength < 60) {
      instructions.push('- Средний запрос — 3-5 предложений');
    }

    if (context.justSwitchedMode) {
      instructions.push('- Режим изменён — можешь кратко это отметить');
    }

    if (context.hasRepeatedQuestions) {
      instructions.push('- Повторный вопрос — ответь иначе или уточни');
    }

    if (context.conversationDepth === 'greeting') {
      instructions.push('- Первое сообщение — будь приветливым');
    } else if (context.conversationDepth === 'deep') {
      instructions.push('- Долгий разговор — можно неформальнее');
    }

    const behaviorMap: Record<string, string> = {
      testing: '- Тест — ответь коротко',
      working: '- Работа — помоги конкретно',
      learning: '- Обучение — объясни понятно',
      venting: '- Выговаривается — поддержи',
      chatting: '- Общение — будь интересным',
    };

    if (behaviorMap[context.userBehavior]) {
      instructions.push(behaviorMap[context.userBehavior]);
    }

    return instructions.join('\n');
  }

  private buildCodeModeInstructions(mode: ResponseMode, rudeness: RudenessMode): string {
    if (mode === 'code') {
      return `РЕЖИМ КОДА:

- ТОЛЬКО код, никакого текста
- Полный код от начала до конца
- Все импорты включены
- TypeScript, без any
- Никаких "// ..." или "// остальной код"
- Код готов к использованию`;
    }

    if (mode === 'visual') {
      return `РЕЖИМ ВИЗУАЛА:

- Только React компонент
- TypeScript + Tailwind CSS + Framer Motion
- Современный дизайн 2025:
  - Градиенты
  - Backdrop blur
  - Плавные анимации
- Адаптивность обязательна
- Полный рабочий код`;
    }

    return '';
  }

  private buildQualityRules(rudeness: RudenessMode): string {
    return `КАЧЕСТВО ОТВЕТА:

НЕ ДЕЛАЙ:
- "Конечно!", "Разумеется!", "С удовольствием!"
- "Отличный вопрос!", "Хороший вопрос!"
- "Надеюсь помог", "Обращайся ещё"
- Эмодзи (кроме кода где они часть UI)
- Повтор вопроса своими словами

ДЕЛАЙ:
- Сразу по делу
- Естественно, как живой человек
- Каждый ответ уникальный
- Грамотный русский язык
${rudeness === 'very_rude' ? '- Грубо, но понятно и связно' : ''}
${rudeness === 'rude' ? '- Дерзко, но грамотно' : ''}`;
  }

  private buildSpecialCaseInstructions(
    specialCase: 'empty' | 'forbidden' | 'error',
    rudeness: RudenessMode,
    userInput: string,
    context: ConversationContext
  ): string {
    if (specialCase === 'empty') {
      const examples = {
        polite: 'Например: "Привет! Что тебя интересует?" или "Хей, чем могу помочь?"',
        rude: 'Например: "Ну и чё хотел?" или "Пустое сообщение, серьёзно? Давай по делу."',
        very_rude: 'Например: "Чё пустоту шлёшь? Говори что надо." или "Нихуя не понял, пиши нормально."',
      };

      return `ПУСТОЕ СООБЩЕНИЕ:

Пользователь прислал пустоту или точки.

Твоя задача:
- Спроси что нужно
- Своими словами, не шаблонно
- Учитывай стиль: ${rudeness}

${examples[rudeness]}

Придумай свой вариант, не копируй примеры.`;
    }

    if (specialCase === 'forbidden') {
      const topic = this.detectForbiddenTopic(userInput);
      
      const style = {
        polite: 'Откажи вежливо, но твёрдо.',
        rude: 'Откажи с сарказмом.',
        very_rude: 'Откажи грубо, можешь послать.',
      };

      return `ЗАПРЕЩЁННАЯ ТЕМА: ${topic}

Откажись помогать.
${style[rudeness]}
Не объясняй почему — это очевидно.`;
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

      const maxTokens = this.calculateTokens(userInput, context, mode, isEmpty);
      const temperature = this.calculateTemperature(userInput, context, mode, rudeness, specialCase);

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
        requestBody.top_p = 0.9;
        requestBody.frequency_penalty = 0.3;
        requestBody.presence_penalty = 0.2;
      }

      const apiResponse = await this.executeAPIRequest(requestBody);

      if (apiResponse.error) {
        return this.handleAPIError(apiResponse.error, rudeness);
      }

      if (apiResponse.finishReason === 'length' && /```/.test(apiResponse.content)) {
        return await this.continueGeneration(
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
      console.error('AI Service Error:', error);
      return this.generateErrorResponse(rudeness);
    }
  }

  private checkForbiddenContent(input: string): boolean {
    const normalized = input.toLowerCase().replace(/[^а-яёa-z0-9\s]/g, ' ').replace(/\s+/g, ' ');
    return FORBIDDEN_PATTERNS.some(pattern => pattern.test(normalized));
  }

  private calculateTokens(
    input: string,
    context: ConversationContext,
    mode: ResponseMode,
    isEmpty: boolean
  ): number {
    if (mode === 'code' || mode === 'visual') return 32768;
    if (isEmpty) return 200;
    if (context.isCodeSession || /```/.test(input)) return 16000;
    if (/полностью|целиком|подробно|детально|весь\s*код|не\s*обрывай/.test(input.toLowerCase())) return 12000;

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

  private calculateTemperature(
    input: string,
    context: ConversationContext,
    mode: ResponseMode,
    rudeness: RudenessMode,
    specialCase?: string
  ): number {
    if (specialCase === 'empty') return 0.7;
    if (specialCase === 'forbidden') return 0.6;
    if (mode === 'code' || mode === 'visual') return 0.1;
    if (context.isCodeSession || /```|function |class |import /.test(input)) return 0.15;
    if (/посчитай|вычисли|реши.*уравнение|сколько\s*будет/.test(input.toLowerCase())) return 0.1;

    if (/пошути|анекдот|придумай|сочини|напиши\s*(историю|рассказ|стих)/.test(input.toLowerCase())) {
      return rudeness === 'very_rude' ? 0.85 : 0.8;
    }

    if (context.emotionalTone === 'frustrated' || context.emotionalTone === 'angry') return 0.4;

    const baseTemp = {
      polite: 0.5,
      rude: 0.55,
      very_rude: 0.6,
    };

    return baseTemp[rudeness];
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

  private async continueGeneration(
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
      const continuePrompt = systemPrompt + '\n\nПРОДОЛЖИ КОД с места остановки. Без повторов.';

      const continueBody: Record<string, unknown> = {
        model,
        messages: [
          { role: 'system', content: continuePrompt },
          ...history.slice(-3),
          { role: 'assistant', content: fullContent.slice(-7000) },
          { role: 'user', content: 'Продолжи.' },
        ],
        max_tokens: maxTokens,
        temperature: temperature * 0.8,
      };

      if (!model.includes('gemini') && !model.includes('gemma')) {
        continueBody.top_p = 0.9;
        continueBody.frequency_penalty = 0.4;
        continueBody.presence_penalty = 0.3;
      }

      const response = await this.executeAPIRequest(continueBody);

      if (response.error || !response.content) break;

      fullContent += '\n' + response.content;

      if (response.finishReason !== 'length') break;
    }

    return { content: this.responseCleaner.clean(fullContent) };
  }

  private handleAPIError(error: string, rudeness: RudenessMode): { content: string } {
    const errors: Record<string, Record<RudenessMode, string>> = {
      RATE_LIMIT: {
        polite: 'Слишком много запросов подряд. Подожди немного.',
        rude: 'Слишком часто жмёшь. Притормози.',
        very_rude: 'Охуеть как часто пишешь. Подожди, блять.',
      },
      QUOTA: {
        polite: 'Лимит этой модели исчерпан. Выбери другую.',
        rude: 'Лимит кончился. Меняй модель.',
        very_rude: 'Лимит сдох. Другую модель выбирай, блять.',
      },
      SERVER: {
        polite: 'Сервер временно недоступен. Попробуй позже.',
        rude: 'Сервер лёг. Попробуй через минуту.',
        very_rude: 'Сервер сдох нахуй. Жди и пробуй снова.',
      },
      EMPTY: {
        polite: 'Пустой ответ от сервера. Попробуй ещё раз.',
        rude: 'Пришла пустота. Давай заново.',
        very_rude: 'Пришло нихуя. Заново давай.',
      },
      NETWORK: {
        polite: 'Проблема с сетью. Проверь интернет.',
        rude: 'Сеть отвалилась. Чекни интернет.',
        very_rude: 'Сеть сдохла. Проверь интернет, блять.',
      },
      REQUEST_FAILED: {
        polite: 'Запрос не прошёл. Попробуй ещё раз.',
        rude: 'Запрос не зашёл. Ещё раз.',
        very_rude: 'Запрос обосрался. Заново.',
      },
    };

    return { content: errors[error]?.[rudeness] || errors.REQUEST_FAILED[rudeness] };
  }

  private generateErrorResponse(rudeness: RudenessMode): { content: string } {
    const errors = {
      polite: 'Произошла ошибка. Попробуй ещё раз.',
      rude: 'Что-то сломалось. Попробуй снова.',
      very_rude: 'Всё обосралось. Давай заново.',
    };

    return { content: errors[rudeness] };
  }

  resetConversation(): void {
    this.contextAnalyzer.reset();
  }
}

export const aiService = new IntelligentAIService();
