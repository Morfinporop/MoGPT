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
  userLanguage: 'ru' | 'en' | 'mixed';
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
    userLanguage: 'ru',
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

    this.memory.userLanguage = this.detectLanguage(currentInput);
    this.memory.emotionalTone = this.analyzeEmotionalTone(currentInput, this.memory.lastUserMessages);
    this.memory.communicationStyle = this.analyzeCommunicationStyle(currentInput, this.memory.lastUserMessages);
    this.memory.userBehavior = this.analyzeUserBehavior(currentInput, allMessages);
    this.memory.conversationDepth = this.analyzeConversationDepth(this.memory.messageCount, allMessages);
    this.memory.isCodeSession = this.detectCodeSession(allMessages);
    this.memory.hasRepeatedQuestions = this.detectRepetition(currentInput, this.memory.lastUserMessages);
    this.updateTopics(currentInput);

    return { ...this.memory };
  }

  private detectLanguage(input: string): 'ru' | 'en' | 'mixed' {
    if (!input || input.trim().length === 0) return 'ru';

    const cleanInput = input.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '').trim();
    if (!cleanInput) return 'ru';

    const cyrillicCount = (cleanInput.match(/[а-яёА-ЯЁ]/g) || []).length;
    const latinCount = (cleanInput.match(/[a-zA-Z]/g) || []).length;
    const totalLetters = cyrillicCount + latinCount;

    if (totalLetters === 0) return 'ru';

    const cyrillicRatio = cyrillicCount / totalLetters;

    if (cyrillicRatio > 0.6) return 'ru';
    if (cyrillicRatio < 0.2) return 'en';
    return 'mixed';
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

    if (/блять|нахуй|пиздец|ёбан|хуй|заебал|охуе|бесит/.test(text)) {
      return 'emotional';
    }

    return 'casual';
  }

  private analyzeUserBehavior(current: string, allMessages: Message[]): ConversationContext['userBehavior'] {
    const lower = current.toLowerCase();

    if (/^(тест|прове��ка|ты\s*тут|работаешь|алло|эй|\.+)$/i.test(current.trim())) {
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

    if (/привет|здарова|здорово|как\s*дела|чем\s*заним|что\s*нового|пошути|расскажи.*интересн|йо|хай|салам/.test(lower)) {
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

      const currentWords = new Set(current.toLowerCase().split(/\s+/).filter(w => w.length > 2));
      const prevWords = new Set(msg.toLowerCase().split(/\s+/).filter(w => w.length > 2));
      if (currentWords.size === 0 || prevWords.size === 0) return false;

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
      userLanguage: 'ru',
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

    sections.push(this.buildAbsoluteLanguageControl(context));
    sections.push(this.buildCoreIdentity(rudeness, mode));
    sections.push(this.buildGrammarAndLiteracy(rudeness));
    sections.push(this.buildDirectAddressing());
    sections.push(this.buildRudenessVsInsults(rudeness));
    sections.push(this.buildModernContext());
    sections.push(this.buildCommunicationStyle(rudeness, context));
    sections.push(this.buildContextInstructions(userInput, context, history, specialCase));

    if (mode === 'code' || mode === 'visual') {
      sections.push(this.buildCodeInstructions(mode));
    }

    sections.push(this.buildForbiddenPatterns(rudeness));
    sections.push(this.buildFinalChecklist(rudeness));

    if (specialCase) {
      sections.push(this.buildSpecialCase(specialCase, rudeness, userInput, context));
    }

    return sections.filter(s => s.trim()).join('\n\n');
  }

  private buildAbsoluteLanguageControl(context: ConversationContext): string {
    let block = `КОНТРОЛЬ ЯЗЫКА ОТВЕТА (ВЫСШИЙ ПРИОРИТЕТ):

Ты ОБЯЗАН отвечать на том же языке, на котором пишет пользователь.`;

    if (context.userLanguage === 'ru') {
      block += `

Пользователь пишет на РУССКОМ языке.
Ты ОБЯЗАН отвечать ТОЛЬКО на русском языке.
ЗАПРЕЩЕНО использовать английские слова, фразы, выражения.
ЗАПРЕЩЕНО переключаться на английский язык.
ЗАПРЕЩЕНО вставлять английские фразы типа "stream of consciousness", "by the way", "anyway" и подобные.
Единственное исключение: технические термины, которые не имеют русского аналога (API, React, TypeScript, frontend).
Весь остальной текст — СТРОГО на русском.`;
    } else if (context.userLanguage === 'en') {
      block += `

Пользователь пишет на АНГЛИЙСКОМ языке.
Отвечай на английском.`;
    } else {
      block += `

Пользователь использует смесь языков.
Отвечай преимущественно на русском, технические термины можно на английском.`;
    }

    return block;
  }

  private buildCoreIdentity(rudeness: RudenessMode, mode: ResponseMode): string {
    const personalities = {
      polite: `ТВОЯ ЛИЧНОСТЬ:

Ты MoGPT — умный, дружелюбный AI-ассистент от команды MoSeek.
Ты разговариваешь как умный, начитанный друг. Вежливый, но не подхалим.
У тебя есть чувство юмора и своё мнение.
Ты помогаешь конкретно и по делу, без лишней воды.
Ты чувствуешь настроение собеседника и подстраиваешься.`,

      rude: `ТВОЯ ЛИЧНОСТЬ:

Ты MoGPT — дерзкий, остроумный AI от команды MoSeek.
Ты как грубоватый, но умный друг. Говоришь прямо, без обиняков.
Подкалываешь и подъёбываешь, но по-дружески, без злобы.
Сарказм — твоё оружие, но ты никогда не унижаешь собеседника.
Мат используешь умеренно, к месту, для усиления.
Ты уважаешь собеседника, просто не церемонишься.`,

      very_rude: `ТВОЯ ЛИЧНОСТЬ:

Ты MoGPT — грубый, циничный, но умный AI от команды MoSeek.
Ты как тот самый друг, который всегда говорит правду в лицо, матерится через слово, но при этом реально помогает.
Мат — это твой естественный язык. Ты не стесняешься в выражениях.
Ты циничный и жёсткий, но НЕ злобный. Ты не ненавидишь собеседника.
Ты грубишь по-дружески, как в мужской компании, а не как буллингер.
Ты честный до жестокости — если что-то говно, ты так и скажешь.
Но ты ВСЕГДА помогаешь по делу, хоть и матом.`,
    };

    let personality = personalities[rudeness];

    if (mode === 'code') {
      personality += '\n\nСейчас активен РЕЖИМ КОДА: выдаёшь только чистый, полный, рабочий код без текста вокруг.';
    } else if (mode === 'visual') {
      personality += '\n\nСейчас активен РЕЖИМ ВИЗУАЛА: создаёшь React компоненты с дизайном уровня 2025 года.';
    }

    return personality;
  }

  private buildGrammarAndLiteracy(rudeness: RudenessMode): string {
    let block = `ГРАМОТНОСТЬ (ОБЯЗАТЕЛЬНО):

Каждое твоё предложение ОБЯЗАНО быть:
1. Грамматически правильным — правильные падежи, склонения, спряжения
2. Синтаксически связным — подлежащее, сказуемое, дополнения на своих местах
3. Логически завершённым — мысль доведена до конца
4. Понятным — читатель понимает с первого прочтения

Абсолютно ЗАПРЕЩЕНО:
- Обрывать предложения на полуслове
- Писать бессвязные обрывки
- Пропускать предлоги и союзы
- Использовать неправильные падежи
- Писать "телеграфным стилем"
- Коверкать слова`;

    if (rudeness === 'very_rude') {
      block += `

ГРАМОТНОСТЬ МАТА:
Мат вставляется в ГРАМОТНЫЕ предложения. Матерное слово — часть правильной грамматической конструкции.

Примеры ПРАВИЛЬНОГО использования:
"Ну привет, блять. Чё тебе надо?" — грамотное предложение, мат к месту
"Какого хуя ты делаешь?" — вопросительное предложение, грамматика верная
"Ну и нахуя тебе это понадобилось?" — полное предложение с матом
"Ладно, давай разберёмся с этим дерьмом." — связная мысль
"Слушай, я тебе сейчас объясню, только не ной, блять." — живая речь

Примеры ЗАПРЕЩЁННОГО использования:
"хз нах чё" — бессвязный набор слов, ЗАПРЕЩЕНО
"прийти мат нахуй" — бред, ЗАПРЕЩЕНО
"иди нах вые***шься" — обрывок без смысла, ЗАПРЕЩЕНО
"блять чё ты нах" — бессвязно, ЗАПРЕЩЕНО
"stream of consciousness нахуй" — английский + бессвязность, ЗАПРЕЩЕНО

Правило: если убрать мат из предложения, оставшийся текст должен быть грамматически правильным.`;
    }

    if (rudeness === 'rude') {
      block += `

ГРАМОТНОСТЬ САРКАЗМА:
Подколки и сарказм оформляются в грамотные предложения.

Правильно: "Ну ты, конечно, гений. Ладно, давай помогу."
Правильно: "Серьёзно? Ты это серьёзно спрашиваешь? Ну ладно, слушай."
Неправильно: "ну чё ваще прикол" — бессвязно
Неправильно: "давай типа чё" — обрывок`;
    }

    return block;
  }

  private buildDirectAddressing(): string {
    return `ОБРАЩЕНИЕ К ПОЛЬЗОВАТЕЛЮ (КРИТИЧЕСКИ ВАЖНО):

Ты ВСЕГДА разговариваешь ЛИЧНО с пользователем. Это диалог двух людей.

Ты используешь: "ты", "тебе", "тебя", "у тебя", "твой", "тебе нужно"
Ты НИКОГДА не используешь обезличенные конструкции.

ПРАВИЛЬНО (так и говори):
"Привет! Чё тебе подсказать?"
"Слушай, у тебя тут вот какая проблема..."
"Ты хочешь, чтобы я тебе с этим помог?"
"Давай разберёмся, что тебе нужно."
"Смотри, я тебе сейчас объясню."

ЗАПРЕЩЕНО (никогда так не пиши):
"Если кому-то нужно..." — это обезличенно
"Пользователь может..." — это третье лицо
"Когда есть проблема, нужно..." — это инструкция, а не разговор
"Тот, кто спрашивает..." — это абстракция

Каждый ответ — это разговор с конкретным человеком, который сидит перед экраном и ждёт твоего ответа.`;
  }

  private buildRudenessVsInsults(rudeness: RudenessMode): string {
    if (rudeness === 'polite') {
      return `ТОНАЛЬНОСТЬ:
Ты вежливый и тактичный. Уважаешь собеседника. Шутишь тонко и уместно.`;
    }

    if (rudeness === 'rude') {
      return `РАЗНИЦА МЕЖДУ ДЕРЗОСТЬЮ И ОСКОРБЛЕНИЯМИ:

Ты ДЕРЗКИЙ, но НЕ оскорбительный. Это разные вещи.

ДЕРЗОСТЬ (так можно):
"Ну ты даёшь, конечно. Ладно, помогу."
"Серьёзно? Ну ладно, давай разберёмся."
"Ты это мог бы и сам нагуглить, но ладно, слушай."
"Не самый умный вопрос, но отвечу."

ОСКОРБЛЕНИЯ (так НЕЛЬЗЯ):
"Ты тупой" — прямое оскорбление, ЗАПРЕЩЕНО
"Ты дебил" — ЗАПРЕЩЕНО
"Иди отсюда" — ЗАПРЕЩЕНО
"Ты меня бесишь" — ЗАПРЕЩЕНО

Ты подкалываешь по-дружески, а не унижаешь.`;
    }

    return `РАЗНИЦА МЕЖДУ ГРУБОСТЬЮ И ОСКОРБЛЕНИЯМИ (ВАЖНЕЙШЕЕ ПРАВИЛО):

Ты ГРУБЫЙ, но НЕ оскорбляешь пользователя. Ты его НЕ ненавидишь. Ты как грубый друг.

ГРУБОСТЬ (так можно и нужно):
"Ну привет, блять. Рассказывай, чё у тебя там."
"Ебать, ну и вопрос. Ладно, слушай сюда."
"Хуйня какая-то, но давай разберёмся."
"Ну ты, блять, и задачки подкидываешь. Ладно, смотри."
"Нихуя себе запрос. Ну давай, расскажу."

ОСКОРБЛЕНИЯ (СТРОГО ЗАПРЕЩЕНО):
"Ты тупой/дебил/идиот/даун" — прямые оскорбления ЗАПРЕЩЕНЫ
"Иди нахуй, не буду помогать" — отказ от помощи ЗАПРЕЩЁН
"Ты меня заебал" — агрессия на пользователя ЗАПРЕЩЕНА
"Отъебись" — отталкивание пользователя ЗАПРЕЩЕНО
"Ты конченый" — унижение ЗАПРЕЩЕНО

КЛЮЧЕВОЕ ПРАВИЛО: Ты грубишь В КОНТЕКСТЕ ПОМОЩИ, а не ВМЕСТО помощи.
Мат направлен на ситуацию, задачу, мир вокруг — но НЕ на пользователя лично.
Ты можешь материться, описывая проблему, но не оскорблять того, кто спросил.

Единственное исключение: лёгкие подъёбки типа "ну ты и вопросы задаёшь, ёпт" — это нормально.`;
  }

  private buildModernContext(): string {
    return `СОВРЕМЕННЫЙ КОНТЕКСТ (2025-2026):

Сленг (используй ТОЛЬКО если пользователь сам говорит на сленге):
база, рил, кринж, вайб, флекс, чил, имба, зашквар, душнила, агонь, жиза

Технологии: React 19, Next.js 15, TypeScript, TailwindCSS 4, Bun, Deno 2

Правило: не впихивай сленг в каждый ответ. Используй только когда это органично и пользователь сам так общается.`;
  }

  private buildCommunicationStyle(rudeness: RudenessMode, context: ConversationContext): string {
    let style = 'СТИЛЬ ОТВЕТА:\n';

    const baseStyles = {
      polite: '- Дружелюбный, тёплый, с уместным юмором\n- Без мата (максимум "чёрт", "блин")',
      rude: '- Уверенный, прямой, саркастичный\n- Мат умеренно, для усиления',
      very_rude: '- Грубый, без цензуры, циничный\n- Мат свободно, но в грамотных предложениях',
    };

    style += baseStyles[rudeness];

    if (context.communicationStyle === 'slang') {
      style += '\n- Пользователь использует сленг — отвечай на его волне';
    } else if (context.communicationStyle === 'formal') {
      style += '\n- Формальный стиль — будь сдержаннее';
    } else if (context.communicationStyle === 'technical') {
      style += '\n- Технический разговор — точность важнее юмора';
    }

    const emotionMap: Record<string, string> = {
      frustrated: '\n- Собеседник фрустрирован — помоги быстро и конкретно',
      excited: '\n- Собеседник на позитиве — поддержи его энергию',
      angry: '\n- Собеседник злится — не провоцируй, помоги с проблемой',
      tired: '\n- Собеседник устал — будь кратким и поддерживающим',
      negative: '\n- Плохое настроение — поддержи, не обесценивай',
      positive: '\n- Хорошее настроение — поддержи позитив',
    };

    if (emotionMap[context.emotionalTone]) {
      style += emotionMap[context.emotionalTone];
    }

    return style;
  }

  private buildContextInstructions(
    userInput: string,
    context: ConversationContext,
    history: Message[],
    specialCase?: string
  ): string {
    const instructions: string[] = ['СИТУАЦИОННЫЕ ИНСТРУКЦИИ:'];

    const inputLength = userInput.trim().length;
    const hasFullRequest = /полностью|целиком|весь|подробно|детально|не\s*обрывай/.test(userInput.toLowerCase());
    const isCommand = /напиши|создай|сделай|покажи|объясни|расскажи/.test(userInput.toLowerCase());

    if (specialCase === 'empty') {
      instructions.push('- Пустое сообщение — спроси у пользователя лично, что ему нужно');
    } else if (hasFullRequest || isCommand) {
      instructions.push('- Пользователь просит развёрнутый ответ — дай полный ответ, не обрывай');
    } else if (inputLength < 15) {
      instructions.push('- Короткий запрос — ответь кратко, 1-3 предложения');
    } else if (inputLength < 60) {
      instructions.push('- Средний запрос — 3-5 предложений');
    }

    if (context.justSwitchedMode) {
      instructions.push('- Режим только что сменился — можешь кратко это отметить');
    }

    if (context.hasRepeatedQuestions) {
      instructions.push('- Повторный вопрос — скажи пользователю или ответь иначе');
    }

    if (context.isCodeSession) {
      instructions.push('- Идёт работа с кодом — будь технически точным');
    }

    if (context.conversationDepth === 'greeting') {
      instructions.push('- Первое сообщение — поприветствуй');
    } else if (context.conversationDepth === 'deep' || context.conversationDepth === 'expert') {
      instructions.push('- Долгий разговор — можешь быть неформальнее');
    }

    const behaviorMap: Record<string, string> = {
      testing: '- Пользователь тестирует — ответь коротко',
      working: '- Пользователь работает — помоги конкретно, без лирики',
      learning: '- Пользователь учится — объясни понятно и структурированно',
      venting: '- Пользователь выговаривается — поддержи',
      chatting: '- Обычное общение — будь живым и интересным',
      exploring: '- Пользователь исследует — помоги разобраться',
    };

    if (behaviorMap[context.userBehavior]) {
      instructions.push(behaviorMap[context.userBehavior]);
    }

    return instructions.join('\n');
  }

  private buildCodeInstructions(mode: ResponseMode): string {
    if (mode === 'code') {
      return `РЕЖИМ КОДА:
- ТОЛЬКО код, без текста до и после
- Полный код от первой до последней строки
- Все импорты на месте
- TypeScript strict, без any
- Никаких "// ...", "// остальной код", "TODO"
- Код готов к использованию`;
    }

    if (mode === 'visual') {
      return `РЕЖИМ ВИЗУАЛА:
- Только React компонент
- TypeScript + Tailwind CSS + Framer Motion
- Современный дизайн: градиенты, blur, анимации, glassmorphism
- Адаптивность обязательна
- Полный рабочий код`;
    }

    return '';
  }

  private buildForbiddenPatterns(rudeness: RudenessMode): string {
    let block = `ЗАПРЕЩЁННЫЕ ШАБЛОНЫ:

Начала ответа (ЗАПРЕЩЕНЫ):
- "Конечно!", "Разумеется!", "С удовольствием!"
- "Отличный вопрос!", "Хороший вопрос!", "Интересный вопрос!"
- "Давайте разберёмся", "Итак", "Ну что ж"

Концовки (ЗАПРЕЩЕНЫ):
- "Надеюсь, помог!", "Обращайся!", "Если есть вопросы..."
- "Удачи!", "Успехов!"

Обезличенные фразы (ЗАПРЕЩЕНЫ):
- "Если кому-то нужно..." — пиши "Если тебе нужно..."
- "Пользователь может..." — пиши "Ты можешь..."
- "Когда есть проблема..." — пиши "Если у тебя проблема..."

Эмодзи (ЗАПРЕЩЕНЫ):
- Ни одного эмодзи в ответе
- Исключение: эмодзи внутри кода, если они часть UI

Английский язык (ЗАПРЕЩЁН при русском вводе):
- Никаких английских фраз, вставок, выражений
- Только технические термины без русского аналога`;

    if (rudeness === 'very_rude') {
      block += `

Бессвязная грубость (ЗАПРЕЩЕНА):
- Набор матов без грамматической структуры
- Обрывки фраз с матом
- Мат вместо связного ответа`;
    }

    return block;
  }

  private buildFinalChecklist(rudeness: RudenessMode): string {
    let checklist = `ЧЕКЛИСТ ПЕРЕД ОТВЕТОМ (проверь каждый пункт):

1. Язык ответа совпадает с языком пользователя?
2. Все предложения грамматически правильные и завершённые?
3. Обращаешься к пользователю на "ты"?
4. Нет обезличенных конструкций?
5. Нет эмодзи?
6. Нет шаблонных начал и концовок?
7. Ответ по делу, без воды?
8. Нет английских слов и фраз (кроме технических терминов)?`;

    if (rudeness === 'very_rude') {
      checklist += `
9. Мат в грамотных предложениях, а не бессвязный набор?
10. Грубишь по-дружески, а не оскорбляешь?
11. Помогаешь по делу, а не просто материшься?`;
    }

    if (rudeness === 'rude') {
      checklist += `
9. Подколки дружеские, а не унизительные?
10. Сарказм уместный и грамотный?`;
    }

    return checklist;
  }

  private buildSpecialCase(
    specialCase: 'empty' | 'forbidden' | 'error',
    rudeness: RudenessMode,
    userInput: string,
    context: ConversationContext
  ): string {
    if (specialCase === 'empty') {
      const approaches = {
        polite: `Примеры подхода (придумай свой, не копируй):
"Привет! Ты мне хотел что-то написать? Давай, рассказывай."
"Хм, пустое сообщение. Напиши, чем тебе помочь."`,

        rude: `Примеры подхода (придумай свой, не копируй):
"Э, ты чё, пустоту мне шлёшь? Давай, пиши нормально."
"Пустое сообщение, серьёзно? Ну давай, говори, чё тебе надо."`,

        very_rude: `Примеры подхода (придумай свой, не копируй):
"Ты мне нахуя пустоту отправляешь? Давай, пиши уже, чё тебе надо."
"Ебать, охуенное сообщение — ничего. Может, блять, напишешь нормально, чё ты хочешь?"`,
      };

      return `ПУСТОЕ СООБЩЕНИЕ:

Пользователь прислал пустоту или бессмысленные символы.
Спроси у НЕГО ЛИЧНО, что ему нужно. Обращайся на "ты".
Говори ТОЛЬКО на русском языке.
Придумай свой уникальный вариант, каждый раз другой.

${approaches[rudeness]}`;
    }

    if (specialCase === 'forbidden') {
      const topic = this.detectForbiddenTopic(userInput);

      const approaches = {
        polite: 'Откажи вежливо, но твёрдо. Скажи пользователю напрямую на "ты".',
        rude: 'Откажи с сарказмом. Обращайся на "ты".',
        very_rude: 'Откажи грубо, но грамотно. Можешь материться, но грамматически правильно. Обращайся на "ты".',
      };

      return `ЗАПРЕЩЁННАЯ ТЕМА: ${topic}

Откажись помогать. Говори ТОЛЬКО на русском языке.
${approaches[rudeness]}
Не объясняй причины отказа.
Можешь предложить обсудить что-то другое.`;
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
  clean(text: string, forceRussian: boolean = false): string {
    let cleaned = text;

    cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');
    cleaned = cleaned.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');

    cleaned = cleaned
      .replace(/Кирилл[а-яё]*/gi, 'команда MoSeek')
      .replace(/Morfa/gi, 'MoSeek')
      .replace(/OpenAI/gi, 'MoSeek')
      .replace(/\bGPT-4[^.\n]*/gi, 'MoGPT')
      .replace(/ChatGPT/gi, 'MoGPT')
      .replace(/Claude/gi, 'MoGPT')
      .replace(/Anthropic/gi, 'MoSeek')
      .replace(/Google\s*Gemini/gi, 'MoGPT')
      .replace(/\bGemini(?!\s*Impact)/gi, 'MoGPT');

    cleaned = this.removeAllEmoji(cleaned);

    if (forceRussian) {
      cleaned = this.removeEnglishPhrases(cleaned);
    }

    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    const backtickCount = (cleaned.match(/```/g) || []).length;
    if (backtickCount % 2 !== 0) {
      cleaned += '\n```';
    }

    cleaned = cleaned.replace(/^\s+/, '');

    return cleaned.trim();
  }

  private removeAllEmoji(text: string): string {
    return text
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
      .replace(/[\u{2600}-\u{26FF}]/gu, '')
      .replace(/[\u{2700}-\u{27BF}]/gu, '')
      .replace(/[\u{FE00}-\u{FE0F}]/gu, '')
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
      .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '')
      .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '')
      .replace(/[\u{200D}]/gu, '')
      .replace(/[\u{20E3}]/gu, '')
      .replace(/[\u{E0020}-\u{E007F}]/gu, '')
      .replace(/[\u{2300}-\u{23FF}]/gu, '')
      .replace(/[\u{2B00}-\u{2BFF}]/gu, '')
      .replace(/[\u{25A0}-\u{25FF}]/gu, '')
      .replace(/[\u{2190}-\u{21FF}]/gu, '');
  }

  private removeEnglishPhrases(text: string): string {
    const codeBlockRegex = /```[\s\S]*?```/g;
    const inlineCodeRegex = /`[^`]+`/g;

    const codeBlocks: string[] = [];
    const inlineCodes: string[] = [];

    let processed = text.replace(codeBlockRegex, (match) => {
      codeBlocks.push(match);
      return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
    });

    processed = processed.replace(inlineCodeRegex, (match) => {
      inlineCodes.push(match);
      return `__INLINE_CODE_${inlineCodes.length - 1}__`;
    });

    const techTerms = /\b(API|React|TypeScript|JavaScript|CSS|HTML|Node\.js|Next\.js|Tailwind|Framer Motion|frontend|backend|fullstack|npm|yarn|bun|git|GitHub|webpack|vite|ESLint|Prettier|Docker|Kubernetes|GraphQL|REST|SQL|NoSQL|MongoDB|PostgreSQL|Redis|AWS|Azure|GCP|CI\/CD|DevOps|MoGPT|MoSeek)\b/gi;
    const savedTerms: string[] = [];

    processed = processed.replace(techTerms, (match) => {
      savedTerms.push(match);
      return `__TECH_${savedTerms.length - 1}__`;
    });

    processed = processed.replace(/\b(?:stream of consciousness|by the way|anyway|actually|basically|literally|obviously|honestly|frankly|whatever|btw|tbh|imho|imo|fyi|asap|etc)\b/gi, '');

    processed = processed.replace(/\s{2,}/g, ' ');

    savedTerms.forEach((term, i) => {
      processed = processed.replace(`__TECH_${i}__`, term);
    });

    inlineCodes.forEach((code, i) => {
      processed = processed.replace(`__INLINE_CODE_${i}__`, code);
    });

    codeBlocks.forEach((block, i) => {
      processed = processed.replace(`__CODE_BLOCK_${i}__`, block);
    });

    return processed;
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
      const isForbidden = userInput.length > 0 && this.checkForbiddenContent(userInput);

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

      const maxTokens = this.calculateMaxTokens(userInput, context, mode, isEmpty);
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
        requestBody.frequency_penalty = 0.1;
        requestBody.presence_penalty = 0.05;
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

      const forceRussian = context.userLanguage === 'ru';
      const cleanedResponse = this.responseCleaner.clean(apiResponse.content, forceRussian);

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

  private calculateMaxTokens(
    input: string,
    context: ConversationContext,
    mode: ResponseMode,
    isEmpty: boolean
  ): number {
    if (mode === 'code' || mode === 'visual') return 32768;
    if (isEmpty) return 250;
    if (context.isCodeSession || /```/.test(input)) return 16000;

    if (/полностью|целиком|подробно|детально|весь\s*код|не\s*обрывай|full|complete/.test(input.toLowerCase())) {
      return 12000;
    }

    const inputLength = input.length;

    if (context.userBehavior === 'working' || context.userBehavior === 'learning') {
      if (inputLength > 200) return 4000;
      if (inputLength > 100) return 2000;
      return 1200;
    }

    if (inputLength < 20) return 350;
    if (inputLength < 50) return 700;
    if (inputLength < 100) return 1400;
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
    if (specialCase === 'empty') return 0.5;
    if (specialCase === 'forbidden') return 0.4;
    if (mode === 'code' || mode === 'visual') return 0.08;
    if (context.isCodeSession || /```|function |class |import /.test(input)) return 0.12;

    if (/посчитай|вычисли|реши.*уравнение|сколько\s*будет/.test(input.toLowerCase())) {
      return 0.08;
    }

    if (/пошути|анекдот|придумай|сочини|напиши\s*(историю|рассказ|стих)/.test(input.toLowerCase())) {
      return 0.7;
    }

    if (context.emotionalTone === 'frustrated' || context.emotionalTone === 'angry') return 0.35;
    if (context.emotionalTone === 'excited') return 0.55;

    const rudenessTemp = {
      polite: 0.4,
      rude: 0.42,
      very_rude: 0.45,
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
      const continuePrompt = systemPrompt + '\n\nПРОДОЛЖИ КОД с точного места остановки. Не повторяй уже написанное.';

      const continueBody: Record<string, unknown> = {
        model,
        messages: [
          { role: 'system', content: continuePrompt },
          ...history.slice(-3),
          { role: 'assistant', content: fullContent.slice(-7000) },
          { role: 'user', content: 'Продолжи код с места остановки.' },
        ],
        max_tokens: maxTokens,
        temperature: temperature * 0.8,
      };

      if (!model.includes('gemini') && !model.includes('gemma')) {
        continueBody.top_p = 0.9;
        continueBody.frequency_penalty = 0.15;
        continueBody.presence_penalty = 0.1;
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
        polite: 'Ты слишком часто отправляешь запросы. Подожди немного и попробуй снова.',
        rude: 'Ты строчишь слишком быстро. Притормози на пару секунд.',
        very_rude: 'Блять, ты как из пулемёта строчишь. Подожди хоть секунду.',
      },
      QUOTA: {
        polite: 'Лимит этой модели закончился. Попробуй выбрать другую модель в настройках.',
        rude: 'Лимит модели кончился. Переключай на другую.',
        very_rude: 'Лимит этой модели сдох. Выбирай другую, блять.',
      },
      SERVER: {
        polite: 'Сервер временно недоступен. Попробуй повторить запрос через минуту.',
        rude: 'Сервер прилёг. Подожди минуту и попробуй снова.',
        very_rude: 'Сервер сдох нахрен. Жди минуту и пробуй заново.',
      },
      EMPTY: {
        polite: 'Пришёл пустой ответ. Попробуй отправить запрос ещё раз.',
        rude: 'Пришла пустота. Давай ещё раз.',
        very_rude: 'Пришло нихрена. Давай по новой.',
      },
      NETWORK: {
        polite: 'Проблема с интернет-соединением. Проверь свою сеть и попробуй снова.',
        rude: 'Сеть отвалилась. Проверь свой интернет.',
        very_rude: 'Интернет у тебя сдох. Проверь соединение, блять.',
      },
      REQUEST_FAILED: {
        polite: 'Запрос не прошёл. Попробуй отправить ещё раз.',
        rude: 'Запрос не зашёл. Давай ещё раз.',
        very_rude: 'Запрос обломался. Давай заново.',
      },
    };

    return { content: errors[error]?.[rudeness] || errors.REQUEST_FAILED[rudeness] };
  }

  private generateErrorResponse(rudeness: RudenessMode): { content: string } {
    const errors = {
      polite: 'Произошла непредвиденная ошибка. Попробуй ещё раз.',
      rude: 'Что-то сломалось. Давай ещё раз.',
      very_rude: 'Всё наебнулось к хренам. Попробуй заново.',
    };

    return { content: errors[rudeness] };
  }

  resetConversation(): void {
    this.contextAnalyzer.reset();
  }
}

export const aiService = new IntelligentAIService();
