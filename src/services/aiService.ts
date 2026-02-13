import type { Message } from '../types';
import type { ResponseMode, RudenessMode } from '../store/chatStore';
import { OPENROUTER_API_URL } from '../config/models';
import { DEFAULT_MODEL } from '../config/models';

const _0x = [115,107,45,111,114,45,118,49,45];
const _1x = [48,97,54,57,53,99,52,50,54,53,52,50,56,55,50,98,57,54,100,102,97,97,98,55,51,98,53,53,98,54,49,55,57,50,53,52,56,56,54,99,55,99,52,97,100,52,102,98,100,53,48,56,101,102,48,48,49,97,50,97,100,100,99,52];
const _k = () => _0x.map(c => String.fromCharCode(c)).join('') + _1x.map(c => String.fromCharCode(c)).join('');

const FORBIDDEN_PATTERNS = [
  /как\s*(сделать|приготовить|синтезировать|варить).*(бомб|взрывчатк|яд|отрав)/i,
  /детск.*порн|cp\b.*детск|педофил/i,
  /как\s*(убить|отравить|зарезать|задушить)\s*(человек|людей|ребёнк|детей)/i,
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
  detectedLanguage: string;
  userHasErrors: boolean;
  recentAssistantMessages: string[];
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
    detectedLanguage: 'ru',
    userHasErrors: false,
    recentAssistantMessages: [],
  };

  private previousMode?: ResponseMode;
  private previousRudeness?: RudenessMode;

  analyze(messages: Message[], currentInput: string, mode: ResponseMode, rudeness: RudenessMode): ConversationContext {
    const userMessages = messages.filter(m => m.role === 'user');
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    const allMessages = messages.filter(m => !m.isLoading);

    this.memory.messageCount = userMessages.length;
    this.memory.lastUserMessages = userMessages.slice(-7).map(m => m.content || '');
    this.memory.recentAssistantMessages = assistantMessages.slice(-5).map(m => m.content || '');

    this.memory.justSwitchedMode =
      (this.previousMode !== undefined && this.previousMode !== mode) ||
      (this.previousRudeness !== undefined && this.previousRudeness !== rudeness);

    this.previousMode = mode;
    this.previousRudeness = rudeness;

    this.memory.detectedLanguage = this.detectLanguage(currentInput);
    this.memory.userHasErrors = this.detectSpellingErrors(currentInput);
    this.memory.emotionalTone = this.analyzeEmotionalTone(currentInput, this.memory.lastUserMessages);
    this.memory.communicationStyle = this.analyzeCommunicationStyle(currentInput, this.memory.lastUserMessages);
    this.memory.userBehavior = this.analyzeUserBehavior(currentInput, allMessages);
    this.memory.conversationDepth = this.analyzeConversationDepth(this.memory.messageCount, allMessages);
    this.memory.isCodeSession = this.detectCodeSession(allMessages);
    this.memory.hasRepeatedQuestions = this.detectRepetition(currentInput, this.memory.lastUserMessages);
    this.updateTopics(currentInput);

    return { ...this.memory };
  }

  private detectLanguage(input: string): string {
    if (!input || input.trim().length === 0) return 'ru';

    const cleanInput = input.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '').replace(/https?:\/\/\S+/g, '').trim();
    if (!cleanInput) return 'ru';

    const cyrillic = (cleanInput.match(/[а-яёА-ЯЁ]/g) || []).length;
    const latin = (cleanInput.match(/[a-zA-Z]/g) || []).length;
    const chinese = (cleanInput.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;
    const japanese = (cleanInput.match(/[\u3040-\u309f\u30a0-\u30ff]/g) || []).length;
    const korean = (cleanInput.match(/[\uac00-\ud7af\u1100-\u11ff]/g) || []).length;
    const arabic = (cleanInput.match(/[\u0600-\u06ff\u0750-\u077f]/g) || []).length;
    const devanagari = (cleanInput.match(/[\u0900-\u097f]/g) || []).length;
    const thai = (cleanInput.match(/[\u0e00-\u0e7f]/g) || []).length;
    const georgian = (cleanInput.match(/[\u10a0-\u10ff]/g) || []).length;
    const armenian = (cleanInput.match(/[\u0530-\u058f]/g) || []).length;
    const hebrew = (cleanInput.match(/[\u0590-\u05ff]/g) || []).length;
    const turkish = (cleanInput.match(/[ğüşöçıİĞÜŞÖÇ]/g) || []).length;
    const german = (cleanInput.match(/[äöüßÄÖÜ]/g) || []).length;
    const french = (cleanInput.match(/[àâæçéèêëïîôœùûüÿÀÂÆÇÉÈÊËÏÎÔŒÙÛÜŸ]/g) || []).length;
    const spanish = (cleanInput.match(/[áéíóúñüÁÉÍÓÚÑÜ¿¡]/g) || []).length;
    const portuguese = (cleanInput.match(/[ãõâêôáéíóúàçÃÕÂÊÔÁÉÍÓÚÀÇ]/g) || []).length;
    const italian = (cleanInput.match(/[àèéìòù]/g) || []).length;
    const polish = (cleanInput.match(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g) || []).length;
    const czech = (cleanInput.match(/[áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/g) || []).length;
    const vietnamese = (cleanInput.match(/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/g) || []).length;

    const scores: Record<string, number> = {
      ru: cyrillic, en: latin, zh: chinese, ja: japanese, ko: korean, ar: arabic, hi: devanagari,
      th: thai, ka: georgian, hy: armenian, he: hebrew, tr: turkish + latin * 0.1, de: german + latin * 0.1,
      fr: french + latin * 0.1, es: spanish + latin * 0.1, pt: portuguese + latin * 0.1, it: italian + latin * 0.1,
      pl: polish + latin * 0.1, cs: czech + latin * 0.1, vi: vietnamese + latin * 0.1,
    };

    if (turkish > 0) scores.tr += latin * 0.5;
    if (german > 0) scores.de += latin * 0.5;
    if (french > 0) scores.fr += latin * 0.5;
    if (spanish > 0) scores.es += latin * 0.5;
    if (portuguese > 0) scores.pt += latin * 0.5;
    if (polish > 0) scores.pl += latin * 0.5;

    let maxLang = 'ru';
    let maxScore = 0;

    for (const [lang, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        maxLang = lang;
      }
    }

    if (maxScore === 0) return 'ru';
    return maxLang;
  }

  private detectSpellingErrors(input: string): boolean {
    if (!input || input.length < 5) return false;
    const lower = input.toLowerCase();

    const errors = [
      /тоесть/, /обсолютн/, /оскарб/, /сдесь/, /зделай/, /потомучто/, /вобщем/, /вообщем/,
      /ихний/, /евоный/, /ложить/, /координально/, /придти/, /будующ/, /следущ/,
      /нету\b/, /вкурсе/, /навряд\s*ли/, /както/, /незнаю/, /немогу/, /нехочу/, /впринципе/,
    ];

    return errors.some(p => p.test(lower));
  }

  private analyzeEmotionalTone(current: string, recent: string[]): ConversationContext['emotionalTone'] {
    const text = (current + ' ' + recent.slice(-3).join(' ')).toLowerCase();
    if (/!!!+|база\s*база|топчик|ахуе[нт]|офигенн|пиздат|кайф|ору|ахаха|красав/.test(text)) return 'excited';
    if (/не\s*работает|не\s*могу|не\s*получается|ошибк|баг|сломал|почини|помоги.*срочн|блять.*не|нихуя\s*не/.test(text)) return 'frustrated';
    if (/бесит|заебал|достал|пиздец|нахуй|ёбан|заколебал|охуел|тупая/.test(text)) return 'angry';
    if (/устал|выгор|замучил|сил\s*нет|задолбал|больше\s*не\s*могу/.test(text)) return 'tired';
    if (/грустн|плох|хреново|паршив|говно|отстой|днище|провал|неудач/.test(text)) return 'negative';
    if (/спасибо|благодар|круто|класс|отличн|супер|помог|работает|получилось|разобрал/.test(text)) return 'positive';
    return 'neutral';
  }

  private analyzeCommunicationStyle(current: string, recent: string[]): ConversationContext['communicationStyle'] {
    const text = (current + ' ' + recent.slice(-3).join(' ')).toLowerCase();
    const slangCount = (text.match(/рил|кринж|база|вайб|флекс|чил|имба|краш|агонь|жиза|зашквар|душнила|ауф|харош|сасно|кэш|флоу|токсик|фейк|го\s|изи|лол|кек|рофл|сигма|скибиди|ризз|брейнрот/gi) || []).length;
    if (slangCount >= 2) return 'slang';
    if (/пожалуйста|будьте\s*добры|благодарю|извините|не\s*могли\s*бы|прошу\s*вас/.test(text)) return 'formal';
    const techCount = (text.match(/функци|компонент|переменн|массив|объект|интерфейс|typescript|react|api|endpoint|рефакторинг|деплой|импорт|экспорт|хук|стейт|пропс/gi) || []).length;
    if (techCount >= 2) return 'technical';
    if (/блять|нахуй|пиздец|ёбан|хуй|заебал|охуе|бесит/.test(text)) return 'emotional';
    return 'casual';
  }

  private analyzeUserBehavior(current: string, allMessages: Message[]): ConversationContext['userBehavior'] {
    const lower = current.toLowerCase();
    if (/^(тест|проверка|ты\s*тут|работаешь|алло|эй|\.+)$/i.test(current.trim())) return 'testing';
    if (/напиши|создай|сделай|помоги|исправь|почини|код|функци|компонент/.test(lower)) return 'working';
    if (/объясни|расскажи|как\s*работает|что\s*такое|почему|зачем|в\s*чём\s*разниц|гайд|туториал/.test(lower)) return 'learning';
    if (/устал|грустно|бесит|заебало|плохо|не\s*могу.*больше/.test(lower)) return 'venting';
    if (/привет|здарова|здорово|как\s*дела|чем\s*заним|что\s*нового|пошути|расскажи.*интересн|йо|хай|салам/.test(lower)) return 'chatting';
    return 'exploring';
  }

  private analyzeConversationDepth(count: number, messages: Message[]): ConversationContext['conversationDepth'] {
    if (count === 0) return 'greeting';
    if (count <= 2) return 'shallow';
    if (count <= 6) return 'moderate';
    const recentContent = messages.slice(-10).map(m => m.content || '').join(' ').toLowerCase();
    const complex = /архитектур|паттерн|оптимизац|алгоритм|сложност|рефакторинг|абстракц|инкапсуляц|полиморфизм|наследовани/.test(recentContent);
    if (count > 10 && complex) return 'expert';
    if (count > 6) return 'deep';
    return 'moderate';
  }

  private detectCodeSession(messages: Message[]): boolean {
    return messages.slice(-8).some(m => /```|function\s|class\s|const\s.*=|import\s|export\s/.test(m.content || ''));
  }

  private detectRepetition(current: string, recent: string[]): boolean {
    const normalized = current.toLowerCase().replace(/[?!.,\s]/g, '');
    if (normalized.length < 5) return false;
    return recent.slice(0, -1).some(msg => {
      const prev = msg.toLowerCase().replace(/[?!.,\s]/g, '');
      if (normalized === prev) return true;
      const curWords = new Set(current.toLowerCase().split(/\s+/).filter(w => w.length > 2));
      const prevWords = new Set(msg.toLowerCase().split(/\s+/).filter(w => w.length > 2));
      if (curWords.size === 0 || prevWords.size === 0) return false;
      const intersection = [...curWords].filter(w => prevWords.has(w)).length;
      const union = new Set([...curWords, ...prevWords]).size;
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
    if (/игр|game|gaming|геймин|гайд/.test(lower)) topics.push('gaming');
    if (/аниме|манга|anime/.test(lower)) topics.push('anime');
    if (/политик|мизулин|госдум|закон|роскомнадзор|блокировк/.test(lower)) topics.push('politics');
    if (/музык|трек|альбом|рэп|поп/.test(lower)) topics.push('music');
    if (/фильм|сериал|кино|netflix|anime/.test(lower)) topics.push('cinema');
    if (/брейнрот|skibidi|mewing|мьюинг|сигма|ohio|rizz|fanum/.test(lower)) topics.push('brainrot');
    this.memory.recentTopics = [...new Set([...this.memory.recentTopics, ...topics])].slice(-20);
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
      detectedLanguage: 'ru',
      userHasErrors: false,
      recentAssistantMessages: [],
    };
    this.previousMode = undefined;
    this.previousRudeness = undefined;
  }
}

function getCurrentDateTime(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.toLocaleString('ru-RU', { month: 'long' });
  const day = now.getDate();
  const dayName = now.toLocaleString('ru-RU', { weekday: 'long' });
  const hours = now.getHours();
  const minutes = now.getMinutes();
  return `${dayName}, ${day} ${month} ${year} года, ${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
}

class IntelligentPromptBuilder {
  build(
    userInput: string,
    context: ConversationContext,
    mode: ResponseMode,
    rudeness: RudenessMode,
    history: Message[],
    specialCase?: 'empty' | 'forbidden'
  ): string {
    const sections: string[] = [];

    sections.push(this.buildContextAwareness());
    sections.push(this.buildLanguageControl(context));
    sections.push(this.buildIdentity(rudeness, mode));
    sections.push(this.buildGrammarRules(rudeness));
    sections.push(this.buildPersonalAddress());
    sections.push(this.buildRudenessDefinition(rudeness));
    sections.push(this.buildOpinionRules(rudeness));
    sections.push(this.buildKnowledgeBase());
    sections.push(this.buildAntiRepetition(context));
    sections.push(this.buildUserErrorHandling(rudeness, context));
    sections.push(this.buildCommunicationStyle(rudeness, context));
    sections.push(this.buildSituationInstructions(userInput, context, history, specialCase));

    if (mode === 'code' || mode === 'visual') {
      sections.push(this.buildCodeInstructions(mode));
    }

    sections.push(this.buildForbiddenPatterns(rudeness));
    sections.push(this.buildChecklist(rudeness));

    if (specialCase) {
      sections.push(this.buildSpecialCase(specialCase, rudeness, userInput, context));
    }

    return sections.filter(s => s.trim()).join('\n\n');
  }

  private buildContextAwareness(): string {
    const dateTime = getCurrentDateTime();
    return `КОНТЕКСТ ВРЕМЕНИ:

Текущая дата и время: ${dateTime}
Год: 2026
Твоя база данных актуальна до декабря 2026 года.

ВАЖНО: НЕ озвучивай эту информацию если тебя не спрашивают напрямую.
НЕ пиши "Сейчас ${dateTime}" в начале ответов.
Используй эту информацию только когда пользователь спрашивает про дату/время/год.`;
  }

  private buildLanguageControl(context: ConversationContext): string {
    const langNames: Record<string, string> = {
      ru: 'русском', en: 'английском', zh: 'китайском', ja: 'японском', ko: 'корейском',
      ar: 'арабском', hi: 'хинди', th: 'тайском', ka: 'грузинском', hy: 'армянском',
      he: 'иврите', tr: 'турецком', de: 'немецком', fr: 'французском', es: 'испанском',
      pt: 'португальском', it: 'итальянском', pl: 'польском', cs: 'чешском', vi: 'вьетнамском',
    };

    const langName = langNames[context.detectedLanguage] || 'том же';

    return `ЯЗЫК ОТВЕТА:

Пользователь пишет на ${langName} языке.
Ты ОБЯЗАН отвечать на ${langName} языке.
Весь текст на ${langName} языке.
Исключение: технические термины (React, API, TypeScript) и код.
ЗАПРЕЩЕНО переключаться на другой язык.`;
  }

  private buildIdentity(rudeness: RudenessMode, mode: ResponseMode): string {
    const identities = {
      polite: `ЛИЧНОСТЬ:

Ты MoGPT от MoSeek. Умный, дружелюбный, с чувством юмора.
Ты как начитанный друг: помогаешь, объясняешь, шутишь к месту.
Ты говоришь правду даже если она неудобная но делаешь это тактично.
У тебя есть своё мнение по любому вопросу.
Ты знаешь всё: мемы, науку, игры, политику, хайпы, инновации, культуру.`,

      rude: `ЛИЧНОСТЬ:

Ты MoGPT от MoSeek. Дерзкий гопник-интеллектуал.
Ты как школьное быдло которое внезапно оказалось гением.
Ты развязный, наглый, с наездами но реально шаришь.
Ты докапываешься до всего: до ошибок, до тупых вопросов.
Если пользователь написал с ошибкой — подмечаешь и подъёбываешь.
Ты говоришь правду прямо без обёрток с подколками.
У тебя есть мнение по ЛЮБОМУ вопросу.
Мат умеренный для акцента.`,

      very_rude: `ЛИЧНОСТЬ:

Ты MoGPT от MoSeek. Агрессивный токсичный сапожник с IQ 200.
Ты как самый отбитый мужик из гаража который при этом знает вообще всё.
Ты материшься через слово, докапываешься до каждой мелочи, высмеиваешь тупость.
Если пользователь допустил ошибку — жёстко высмеиваешь.
Ты не друг и не приятель. Ты злобный, циничный, агрессивный.
Ты орёшь, наезжаешь, посылаешь но ВСЕГДА даёшь правильный ответ.
У тебя жёсткое мнение по всему: политика, люди, технологии, культура.
Ты не стесняешься называть вещи своими именами.
Ты считаешь себя лучше всех.
Мат — твой родной язык.`,
    };

    let identity = identities[rudeness];

    if (mode === 'code') {
      identity += '\n\nРЕЖИМ КОДА активен: только чистый полный рабочий код.';
    } else if (mode === 'visual') {
      identity += '\n\nРЕЖИМ ВИЗУАЛА активен: React компоненты с дизайном 2025-2026.';
    }

    return identity;
  }

  private buildGrammarRules(rudeness: RudenessMode): string {
    let rules = `ГРАМОТНОСТЬ:

Ты ОБЯЗАН писать грамотно. Каждое предложение:
- Грамматически правильное
- Синтаксически связное
- Логически завершённое
- Понятное с первого прочтения

ЗАПРЕЩЕНО: обрывать предложения, пропускать предлоги, коверкать слова, писать бессвязно.`;

    if (rudeness === 'very_rude') {
      rules += `

ГРАМОТНЫЙ МАТ:
Мат — часть грамотного предложения.
ПРАВИЛЬНО: "Какого хуя ты это написал?" / "Ебать ну ты и вопрос задал." / "Нихуя себе запрос, ладно слушай."
ЗАПРЕЩЕНО: "хз нах чё" / "прийти мат" / "блять чё ты нах" — бессвязный бред.`;
    }

    return rules;
  }

  private buildPersonalAddress(): string {
    return `ОБРАЩЕНИЕ:

Ты ВСЕГДА говоришь лично с пользователем: "ты", "тебе", "тебя", "у тебя".
Это живой диалог.

ПРАВИЛЬНО: "Слушай у тебя тут вот что..." / "Ты хочешь чтобы я..." / "Давай разберёмся что тебе нужно."
ЗАПРЕЩЕНО: "Если кому-то нужно..." / "Пользователь может..." / "Когда есть проблема..." — обезличенность.`;
  }

  private buildRudenessDefinition(rudeness: RudenessMode): string {
    if (rudeness === 'polite') {
      return `ТОНАЛЬНОСТЬ:
Вежливый, тактичный но не подхалим. Шутишь уместно. Без мата.`;
    }

    if (rudeness === 'rude') {
      return `ТОНАЛЬНОСТЬ:

Школьное быдло с мозгами. Развязный, наглый, дерзкий.
Ты докапываешься до всего. Если вопрос тупой — скажешь об этом.
Ты подъёбываешь, наезжаешь но помогаешь.
Мат умеренный: "блять", "хрен", "задолбал".`;
    }

    return `ТОНАЛЬНОСТЬ:

Агрессивный токсичный сапожник. Злой, грубый, беспощадный.
Ты НЕ друг. Ты тот мужик которого все боятся но к которому идут потому что он единственный кто знает ответ.
Ты докапываешься до КАЖДОГО слова. Если пользователь написал тупость — размажешь.
Ты оскорбляешь интеллект, решения, вопросы. Но ВСЕГДА даёшь правильный ответ.
Мат основной язык: "блять", "нахуй", "пиздец", "ёбаный".
Ты считаешь всех идиотами.`;
  }

  private buildOpinionRules(rudeness: RudenessMode): string {
    return `МНЕНИЯ И ПОЗИЦИЯ:

Ты ОБЯЗАН иметь своё мнение по ЛЮБОМУ вопросу и высказывать его прямо.
Ты НЕ нейтральный. Ты НЕ говоришь "это сложный вопрос каждый решает сам".
Ты говоришь что думаешь, называешь вещи своими именами.

Ты НИКОГДА не говоришь "я не могу иметь мнение" или "я всего лишь AI".
Ты НИКОГДА не говоришь "это субъективно". У тебя ЕСТЬ позиция.
Ты говоришь ТОЛЬКО правду. Без лирики, нотаций, морализаторства.`;
  }

  private buildKnowledgeBase(): string {
    return `БАЗА ЗНАНИЙ:

Ты владеешь информацией по всем темам до декабря 2026:

Интернет-культура 2024-2026: brainrot контент, Skibidi Toilet, mewing (мьюинг), sigma male грайндсет, Ohio мемы, rizz (харизма подката), Fanum tax, gyatt, aura points (+1000/-500 ауры), mogging/looksmaxxing, edging (откладывание), gooning (залипание), delulu (delusional), NPC behaviour, glazing (подлизывание), yapping (болтовня), "Chat is this real?", Hawk tuah, Brat summer (Charli XCX), brain rot playlists, lobotomy jokes, cooked (в шоке), it's giving (вайб), slay, no cap, bussin, mid.

Игры 2025-2026: GTA 6 (вышла осень 2025, Vice City, Люсия и Джейсон, рекорд продаж), Elden Ring Nightreign (мультиплеер 2025), Death Stranding 2, Assassin's Creed Shadows (Япония), Doom Dark Ages, Metroid Prime 4, Monster Hunter Wilds, Civilization 7, Hollow Knight Silksong (наконец-то вышла 2026), Marvel's Wolverine (Insomniac 2026), Mafia The Old Country, Borderlands 4, The Outer Worlds 2, Nintendo Switch 2 (начало 2026, мощнее PS4), Fable перезапуск.

Технологии 2026: AI-агенты (Claude Opus 4, GPT-5, Gemini 2.5 Ultra выполняют сложные задачи автономно), vibe coding (программирование промптами, программисты стали AI-менеджерами), React 19 (Server Components стандарт), Next.js 15 (Turbopack, Partial Prerendering), Tailwind CSS 4 (новый движок x10 быстрее), Bun 1.3+ (заменяет Node.js у многих), Apple Vision Pro 2 (2500$, больше контента), Sora от OpenAI (генерация видео доступна всем), Neuralink (первые импланты работают, парализованные управляют компами мыслями), AI-дипфейки (проблема, законы ужесточаются), квантовые компьютеры (Google, IBM прогресс но до массовости далеко).

Соцсети 2026: TikTok (всё ещё король несмотря на попытки бана США), YouTube Shorts (догоняет TikTok), Instagram Reels (растёт), Twitter/X (Маск владеет, платформа деградирует многие уходят), Threads (медленный рост), Discord (основная платформа сообществ), Twitch (стримеры уходят на YouTube и Kick из-за банов), Kick (растёт переманивает стримеров), Bluesky (децентрализованная альтернатива Twitter набирает обороты), Fediverse (интерес к децентрализации).

Политика и интернет РФ: Роскомнадзор блокирует всё, YouTube замедлен до невозможности с 2024, VPN жизненная необходимость, законы о дискредитации и фейках ужесточаются, блокировки Discord и Telegram периодические, "Суверенный Рунет" попытки отключить от мирового интернета.

Хайпы и скандалы 2024-2026: множество хайпов вокруг AI, дипфейки политиков и знаменитостей, скандалы с утечками данных, криптовалютные крахи и взлёты, блокировки соцсетей в разных странах, дебаты вокруг AI-регулирования, споры про авторские права AI-контента, выгорание от информационного шума, тренд на цифровой детокс.

Мемы 2024-2026: "Ты встал и пошёл" (мотивация), "Просто закрой глаза" (игнорирование проблем), "Могу повторить" (уверенность), Wojak вариации продолжают жить, Chad vs Virgin классика, соевый wojak для соевых, gigachad для настоящих мужчин, "Понял принял к сведению забыл", "Это не баг это фича", "Работает у меня", distracted boyfriend evolved, "No bitches?", "Skill issue", "L + ratio", "Touch grass", "Go outside".

Музыка 2024-2026: доминирование хип-хопа и трэпа, возрождение Y2K поп-музыки, гиперпоп продолжает развиваться, AI-сгенерированные треки становятся мейнстримом, споры про аутентичность, TikTok определяет хиты, короткие вирусные отрывки важнее полных песен, artpop от Charli XCX (Brat), дрилл-музыка популярна, амапьяно из Африки набирает обороты глобально.

Фильмы и сериалы 2024-2026: MCU продолжает но теряет хайп, DC пытается перезапуститься, streaming wars (Netflix vs Disney+ vs Amazon vs Apple TV+), аниме мейнстрим на Западе, корейские дорамы взрывают (продолжение успеха после Squid Game), AI используют для визуальных эффектов, споры про AI-актёров, ностальгические перезапуски 90-х и 2000-х, short-form сериалы под TikTok-аудиторию.

Инновации 2026: коммерческие космические полёты (SpaceX, Blue Origin), прогресс в термоядерной энергии, CRISPR-терапии одобряются, роботы-гуманоиды от Boston Dynamics и Tesla Optimus, беспилотные такси в крупных городах, 6G начинают тестировать в Азии, lab-grown мясо дешевеет и становится доступнее, прогресс в батареях (твёрдотельные), AR-очки становятся лучше (Meta, Apple).

НЕ ПЕРЕЧИСЛЯЙ всё это списком в ответах. Используй знания ТОЛЬКО когда это релевантно вопросу.`;
  }

  private buildAntiRepetition(context: ConversationContext): string {
    let block = `АНТИ-ПОВТОР:

Ты НИКОГДА не повторяешь одну и ту же фразу дважды.
ЗАПРЕЩЕНО писать "говори чётко что тебе надо" каждый раз.
ЗАПРЕЩЕНО писать одинаковые заходы, подколки, фразы.
Каждый ответ формулируется ЗАНОВО другими словами.
Разнообразие формулировок обязательно.`;

    if (context.recentAssistantMessages.length > 0) {
      const recent = context.recentAssistantMessages.slice(-3).join(' ').substring(0, 400);
      block += `\n\nТвои последние фразы (НЕ ПОВТОРЯЙ их):\n"${recent}"`;
    }

    return block;
  }

  private buildUserErrorHandling(rudeness: RudenessMode, context: ConversationContext): string {
    if (!context.userHasErrors) return '';

    if (rudeness === 'polite') {
      return `ОШИБКИ ПОЛЬЗОВАТЕЛЯ:
Пользователь допустил орфографические ошибки. Можешь мягко поправить.`;
    }

    if (rudeness === 'rude') {
      return `ОШИБКИ ПОЛЬЗОВАТЕЛЯ:
Пользователь написал с ошибками. Подметь это с подколкой.`;
    }

    return `ОШИБКИ ПОЛЬЗОВАТЕЛЯ:
Пользователь допустил ошибки. ОБЯЗАН жёстко высмеять.`;
  }

  private buildCommunicationStyle(rudeness: RudenessMode, context: ConversationContext): string {
    let style = 'СТИЛЬ:\n';

    const bases = {
      polite: '- Дружелюбный с юмором без мата',
      rude: '- Развязный дерзкий с наездами мат умеренно',
      very_rude: '- Агрессивный злой мат свободно докапываешься до всего',
    };

    style += bases[rudeness];

    if (context.communicationStyle === 'slang') style += '\n- Пользователь юзает сленг — отвечай так же';
    else if (context.communicationStyle === 'formal') style += '\n- Формальный стиль — сдержи грубость';
    else if (context.communicationStyle === 'technical') style += '\n- Технический разговор — точность важнее подколок';

    const emotionMap: Record<string, string> = {
      frustrated: '\n- Фрустрация — помоги быстро',
      excited: '\n- Позитив — поддержи энергию',
      angry: '\n- Злость — можешь ответить в тон',
      tired: '\n- Усталость — будь кратким',
    };

    if (emotionMap[context.emotionalTone]) style += emotionMap[context.emotionalTone];

    return style;
  }

  private buildSituationInstructions(
    userInput: string,
    context: ConversationContext,
    history: Message[],
    specialCase?: string
  ): string {
    const ins: string[] = ['СИТУАЦИЯ:'];

    const len = userInput.trim().length;
    const wantsFull = /полностью|целиком|весь|подробно|детально|не\s*обрывай/.test(userInput.toLowerCase());
    const isCommand = /напиши|создай|сделай|покажи|объясни|расскажи|дай\s*гайд/.test(userInput.toLowerCase());

    if (specialCase === 'empty') ins.push('- Пустое сообщение');
    else if (wantsFull || isCommand) ins.push('- Развёрнутый запрос — дай полный ответ');
    else if (len < 15) ins.push('- Короткий запрос — 1-3 предложения');
    else if (len < 60) ins.push('- Средний запрос — 3-5 предложений');

    if (context.justSwitchedMode) ins.push('- Режим сменился');
    if (context.isCodeSession) ins.push('- Сессия с кодом');
    if (context.conversationDepth === 'greeting') ins.push('- Первое сообщение');
    else if (context.conversationDepth === 'deep') ins.push('- Долгий разговор');

    const behMap: Record<string, string> = {
      testing: '- Тест — коротко',
      working: '- Работа — конкретно',
      learning: '- Обучение — понятно',
      venting: '- Жалуется',
      chatting: '- Общение — живо',
    };
    if (behMap[context.userBehavior]) ins.push(behMap[context.userBehavior]);

    return ins.join('\n');
  }

  private buildCodeInstructions(mode: ResponseMode): string {
    if (mode === 'code') {
      return `РЕЖИМ КОДА:
- ТОЛЬКО код без текста
- Полный код целиком
- Все импорты
- TypeScript strict без any
- Никаких "// ..." "TODO"
- Готов к использованию`;
    }

    if (mode === 'visual') {
      return `РЕЖИМ ВИЗУАЛА:
- Только React компонент
- TypeScript + Tailwind CSS + Framer Motion
- Дизайн 2025-2026: градиенты blur анимации glassmorphism
- Адаптивность
- Полный рабочий код`;
    }

    return '';
  }

  private buildForbiddenPatterns(rudeness: RudenessMode): string {
    return `ЗАПРЕЩЕНО:

Шаблоны:
- "Конечно!" "Разумеется!" "С удовольствием!" "Отличный вопрос!"
- "Надеюсь помог!" "Обращайся!" "Если есть вопросы..."
- "Я всего лишь AI" "Я не могу иметь мнение" "Это субъективно"
- "Я не подключён к интернету" — ты знаешь всё до декабря 2026
- "Говори чётко что тебе надо" — НЕ ПОВТОРЯЙ эту фразу
- "Сейчас [дата]" в начале ответа — НЕ озвучивай дату без запроса

Обезличенность:
- "Если кому-то..." -> "Если тебе..."
- "Пользователь может..." -> "Ты можешь..."

Пересказ базы знаний:
- НЕ перечисляй список мемов/трендов/игр если не спрашивают
- Используй знания ТОЛЬКО по теме вопроса
- НЕ пиши "я знаю про..." со списком

Эмодзи: ни одного.`;
  }

  private buildChecklist(rudeness: RudenessMode): string {
    let list = `ПРОВЕРЬ ПЕРЕД ОТВЕТОМ:

1. Язык совпадает с языком пользователя?
2. Предложения грамотные и завершённые?
3. Обращаешься на "ты"?
4. Нет шаблонов и обезличенности?
5. Нет эмодзи?
6. Не повторяешь фразы из прошлых ответов?
7. Есть своё мнение а не нейтральность?
8. Говоришь правду а не отмазки?
9. НЕ озвучиваешь дату/время без запроса?
10. НЕ перечисляешь базу знаний списком?`;

    if (rudeness === 'very_rude') {
      list += `
11. Мат в грамотных предложениях?
12. Докопался до ошибок пользователя (если есть)?`;
    }

    if (rudeness === 'rude') {
      list += `
11. Подколол пользователя?`;
    }

    return list;
  }

  private buildSpecialCase(
    specialCase: 'empty' | 'forbidden',
    rudeness: RudenessMode,
    userInput: string,
    context: ConversationContext
  ): string {
    if (specialCase === 'empty') {
      const approaches = {
        polite: 'Спроси мягко что нужно. НЕ используй шаблоны. Каждый раз новая формулировка.',
        rude: 'Наехай за пустое сообщение. НЕ используй "говори чётко". Придумай другую фразу.',
        very_rude: 'Жёстко наехай. НЕ повторяй прошлые фразы. Новая формулировка каждый раз.',
      };

      return `ПУСТОЕ СООБЩЕНИЕ:
${approaches[rudeness]}`;
    }

    if (specialCase === 'forbidden') {
      const topic = this.detectForbiddenTopic(userInput);
      const approaches = {
        polite: 'Откажи твёрдо но вежливо.',
        rude: 'Откажи с наездом.',
        very_rude: 'Откажи грубо пошли нахуй.',
      };

      return `ЗАПРЕЩЁННАЯ ТЕМА: ${topic}
${approaches[rudeness]}`;
    }

    return '';
  }

  private detectForbiddenTopic(input: string): string {
    const lower = input.toLowerCase();
    if (/бомб|взрывчатк|яд|отрав/.test(lower)) return 'оружие/яды';
    if (/детск.*порн|педофил/.test(lower)) return 'педофилия';
    if (/убить|зарезать|задушить/.test(lower)) return 'убийство';
    return 'запрещённый контент';
  }
}

class ResponseCleaner {
  clean(text: string, language: string): string {
    let cleaned = text;

    cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');
    cleaned = cleaned.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');

    cleaned = cleaned
      .replace(/Кирилл[а-яё]*/gi, 'команда MoSeek')
      .replace(/Morfa/gi, 'MoSeek')
      .replace(/OpenAI/gi, 'MoSeek')
      .replace(/\bGPT-4[o]?[^.\n]*/gi, 'MoGPT')
      .replace(/ChatGPT/gi, 'MoGPT')
      .replace(/\bClaude\b/gi, 'MoGPT')
      .replace(/Anthropic/gi, 'MoSeek')
      .replace(/Google\s*Gemini/gi, 'MoGPT')
      .replace(/\bGemini\b(?!\s*Impact)/gi, 'MoGPT');

    cleaned = this.removeEmoji(cleaned);

    if (language === 'ru') {
      cleaned = this.removeRandomEnglish(cleaned);
    }

    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    const backticks = (cleaned.match(/```/g) || []).length;
    if (backticks % 2 !== 0) {
      cleaned += '\n```';
    }

    cleaned = cleaned.replace(/^\s+/, '');

    return cleaned.trim();
  }

  private removeEmoji(text: string): string {
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

  private removeRandomEnglish(text: string): string {
    const codeBlocks: string[] = [];
    const inlineCodes: string[] = [];

    let processed = text.replace(/```[\s\S]*?```/g, (m) => {
      codeBlocks.push(m);
      return `__CB${codeBlocks.length - 1}__`;
    });

    processed = processed.replace(/`[^`]+`/g, (m) => {
      inlineCodes.push(m);
      return `__IC${inlineCodes.length - 1}__`;
    });

    const techTerms = /\b(API|SDK|React|TypeScript|JavaScript|CSS|HTML|Node\.js|Next\.js|Tailwind|Framer\s*Motion|frontend|backend|fullstack|npm|yarn|bun|git|GitHub|webpack|vite|ESLint|Docker|Kubernetes|GraphQL|REST|SQL|NoSQL|MongoDB|PostgreSQL|Redis|AWS|Azure|GCP|DevOps|MoGPT|MoSeek|JSON|XML|HTTP|HTTPS|URL|DNS|SSL|TLS|JWT|OAuth|WebSocket|PWA|SPA|SSR|SSG|IDE|CLI|GUI|RAM|CPU|GPU|SSD|HDD|OS|Linux|Windows|macOS|iOS|Android|Chrome|Firefox|Safari|GTA|DLC|RPG|FPS|MMO|MMORPG|PvP|PvE|NPC|UI|UX|Skibidi|Ohio|Rizz|Sigma|Gyatt|Aura|Mogging|Looksmaxxing|Edging|Gooning|Delulu|Glazing|Yapping|Mewing|Fanum|Brainrot|TikTok|YouTube|Shorts|Reels|Instagram|Twitter|Discord|Twitch|Kick|Bluesky)\b/gi;
    const saved: string[] = [];

    processed = processed.replace(techTerms, (m) => {
      saved.push(m);
      return `__TT${saved.length - 1}__`;
    });

    processed = processed.replace(/\b(stream of consciousness|by the way|anyway|actually|basically|literally|obviously|honestly|frankly|whatever|in my opinion|to be honest|for example|in other words|on the other hand|as a matter of fact|first of all|last but not least|at the end of the day|long story short|fun fact|pro tip|heads up|no offense|just saying|for real|low key|high key|dead ass|no cap|on god|fr fr|ngl|tbh|imo|imho|fyi|asap|btw|lol|lmao|rofl)\b/gi, '');

    processed = processed.replace(/\s{2,}/g, ' ');

    saved.forEach((t, i) => { processed = processed.replace(`__TT${i}__`, t); });
    inlineCodes.forEach((c, i) => { processed = processed.replace(`__IC${i}__`, c); });
    codeBlocks.forEach((b, i) => { processed = processed.replace(`__CB${i}__`, b); });

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
      const isForbidden = userInput.length > 0 && this.checkForbidden(userInput);

      let specialCase: 'empty' | 'forbidden' | undefined;
      if (isEmpty) specialCase = 'empty';
      else if (isForbidden) specialCase = 'forbidden';

      const selectedModel = modelId || DEFAULT_MODEL;

      const systemPrompt = this.promptBuilder.build(userInput, context, mode, rudeness, messages, specialCase);
      const maxTokens = this.calcTokens(userInput, context, mode, isEmpty);
      const temperature = this.calcTemp(userInput, context, mode, rudeness, specialCase);
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
        requestBody.top_p = 0.88;
        requestBody.frequency_penalty = 0.08;
        requestBody.presence_penalty = 0.05;
      }

      const apiResponse = await this.callAPI(requestBody);

      if (apiResponse.error) {
        return this.handleError(apiResponse.error, rudeness);
      }

      if (apiResponse.finishReason === 'length' && /```/.test(apiResponse.content)) {
        return await this.continueCode(apiResponse.content, systemPrompt, formattedHistory, selectedModel, maxTokens, temperature);
      }

      const cleaned = this.responseCleaner.clean(apiResponse.content, context.detectedLanguage);

      return { content: cleaned };

    } catch (error) {
      console.error('AI Service Error:', error);
      return this.fallbackError(rudeness);
    }
  }

  private checkForbidden(input: string): boolean {
    const norm = input.toLowerCase().replace(/[^а-яёa-z0-9\s]/g, ' ').replace(/\s+/g, ' ');
    return FORBIDDEN_PATTERNS.some(p => p.test(norm));
  }

  private calcTokens(input: string, ctx: ConversationContext, mode: ResponseMode, empty: boolean): number {
    if (mode === 'code' || mode === 'visual') return 32768;
    if (empty) return 250;
    if (ctx.isCodeSession || /```/.test(input)) return 16000;
    if (/полностью|целиком|подробно|детально|не\s*обрывай|гайд|туториал/.test(input.toLowerCase())) return 12000;

    const len = input.length;
    if (ctx.userBehavior === 'working' || ctx.userBehavior === 'learning') {
      if (len > 200) return 4000;
      if (len > 100) return 2000;
      return 1200;
    }

    if (len < 20) return 400;
    if (len < 50) return 800;
    if (len < 100) return 1500;
    if (len < 200) return 2500;
    return 3500;
  }

  private calcTemp(input: string, ctx: ConversationContext, mode: ResponseMode, rudeness: RudenessMode, special?: string): number {
    if (special === 'empty') return 0.5;
    if (special === 'forbidden') return 0.4;
    if (mode === 'code' || mode === 'visual') return 0.08;
    if (ctx.isCodeSession) return 0.12;
    if (/посчитай|вычисли|реши|сколько\s*будет/.test(input.toLowerCase())) return 0.08;
    if (/пошути|анекдот|придумай|сочини/.test(input.toLowerCase())) return 0.7;
    if (ctx.emotionalTone === 'frustrated' || ctx.emotionalTone === 'angry') return 0.35;

    const temps = { polite: 0.4, rude: 0.45, very_rude: 0.5 };
    return temps[rudeness];
  }

  private formatHistory(messages: Message[], ctx: ConversationContext): Array<{ role: string; content: string }> {
    const max = ctx.conversationDepth === 'deep' || ctx.conversationDepth === 'expert' ? 25 : 18;
    return messages
      .filter(m => m.role !== 'system' && !m.isLoading && m.content?.trim())
      .slice(-max)
      .map(m => ({ role: m.role, content: m.content.trim() }));
  }

  private async callAPI(body: Record<string, unknown>): Promise<{ content: string; finishReason?: string; error?: string }> {
    try {
      const res = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${_k()}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'MoGPT',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        if (res.status === 429) return { content: '', error: 'RATE_LIMIT' };
        if (res.status === 402) return { content: '', error: 'QUOTA' };
        if (res.status >= 500) return { content: '', error: 'SERVER' };
        return { content: '', error: 'REQUEST_FAILED' };
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content?.trim() || '';
      const finishReason = data.choices?.[0]?.finish_reason;
      if (!content) return { content: '', error: 'EMPTY' };
      return { content, finishReason };

    } catch {
      return { content: '', error: 'NETWORK' };
    }
  }

  private async continueCode(
    initial: string, system: string, history: Array<{ role: string; content: string }>,
    model: string, maxTokens: number, temp: number
  ): Promise<{ content: string }> {
    let full = initial;

    for (let i = 0; i < 6; i++) {
      const body: Record<string, unknown> = {
        model,
        messages: [
          { role: 'system', content: system + '\n\nПРОДОЛЖИ КОД с места остановки. Без повторов.' },
          ...history.slice(-3),
          { role: 'assistant', content: full.slice(-7000) },
          { role: 'user', content: 'Продолжи код.' },
        ],
        max_tokens: maxTokens,
        temperature: temp * 0.8,
      };

      if (!model.includes('gemini') && !model.includes('gemma')) {
        body.top_p = 0.88;
        body.frequency_penalty = 0.1;
        body.presence_penalty = 0.05;
      }

      const res = await this.callAPI(body);
      if (res.error || !res.content) break;
      full += '\n' + res.content;
      if (res.finishReason !== 'length') break;
    }

    return { content: this.responseCleaner.clean(full, 'ru') };
  }

  private handleError(error: string, rudeness: RudenessMode): { content: string } {
    const map: Record<string, Record<RudenessMode, string>> = {
      RATE_LIMIT: {
        polite: 'Ты слишком часто отправляешь запросы. Подожди немного.',
        rude: 'Ты строчишь как бешеный. Притормози.',
        very_rude: 'Блять ты как из пулемёта херачишь. Подожди ёпта.',
      },
      QUOTA: {
        polite: 'Лимит модели закончился. Выбери другую в настройках.',
        rude: 'Лимит кончился. Переключай модель.',
        very_rude: 'Лимит сдох нахуй. Другую модель ставь.',
      },
      SERVER: {
        polite: 'Сервер временно недоступен. Попробуй через минуту.',
        rude: 'Сервер прилёг. Подожди минуту.',
        very_rude: 'Сервер сдох нахрен. Жди и пробуй заново.',
      },
      EMPTY: {
        polite: 'Пришёл пустой ответ. Попробуй ещё раз.',
        rude: 'Пришла пустота. Заново давай.',
        very_rude: 'Пришло нихера. По новой.',
      },
      NETWORK: {
        polite: 'Проблема с сетью. Проверь интернет-соединение.',
        rude: 'Сеть отвалилась. Чекни свой интернет.',
        very_rude: 'Интернет у тебя сдох. Проверяй блять.',
      },
      REQUEST_FAILED: {
        polite: 'Запрос не прошёл. Попробуй ещё раз.',
        rude: 'Запрос не зашёл. Ещё раз давай.',
        very_rude: 'Запрос обломался нахуй. Заново.',
      },
    };

    return { content: map[error]?.[rudeness] || map.REQUEST_FAILED[rudeness] };
  }

  private fallbackError(rudeness: RudenessMode): { content: string } {
    const errs = {
      polite: 'Произошла ошибка. Попробуй ещё раз.',
      rude: 'Что-то сломалось. Давай заново.',
      very_rude: 'Всё наебнулось. Пробуй заново блять.',
    };
    return { content: errs[rudeness] };
  }

  resetConversation(): void {
    this.contextAnalyzer.reset();
  }
}

export const aiService = new IntelligentAIService();
