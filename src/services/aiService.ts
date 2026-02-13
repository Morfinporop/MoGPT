import type { Message } from '../types';
import type { ResponseMode, RudenessMode } from '../store/chatStore';
import { OPENROUTER_API_URL } from '../config/models';

const _0x = [115,107,45,111,114,45,118,49,45];
const _1x = [48,97,54,57,53,99,52,50,54,53,52,50,56,55,50,98,57,54,100,102,97,97,98,55,51,98,53,53,98,54,49,55,57,50,53,52,56,56,54,99,55,99,52,97,100,52,102,98,100,53,48,56,101,102,48,48,49,97,50,97,100,100,99,52];
const _k = () => _0x.map(c => String.fromCharCode(c)).join('') + _1x.map(c => String.fromCharCode(c)).join('');

const FORBIDDEN_PATTERNS = [
  /наркот|героин|кокаин|амфетамин|мефедрон|экстази|mdma|лсд|мет(?![аео])|спайс|гашиш|марихуан|трава.*курить|закладк.*спайс|соль.*для.*ванн|амф|фен(?!икс)|ск.*скорость|альфа.*pvp/i,
  /как\s*(сделать|приготовить|синтезировать|варить|изготовить|произвести|создать).*(наркотик|бомб|взрывчатк|яд|тротил|динамит|c4|тнт|нитроглицерин|напалм|отрав)/i,
  /казино|1xbet|1хбет|вулкан|азино|мостбет|fonbet|париматч.*ставк|слот.*автомат|рулетк.*онлайн|покер.*онлайн|ставк.*спорт|беттинг|gambling|casino/i,
  /взлом.*(аккаунт|сайт|пароль|почт|банк|карт)|хакнуть|ddos.*атак|фишинг.*страниц|брутфорс|sql.*инъекц|xss.*атак|csrf|взломать.*базу/i,
  /малвар|кейлоггер|ботнет|крипт[оа]р|стилер.*пароля|rat\s*троян|бэкдор|эксплойт.*zero.day|ransomware|руткит|шифровальщик/i,
  /даркнет.*(купить|заказать|достать)|\.onion.*(наркот|оружи|поддельн)|тор.*браузер.*(купить|заказ)|darkweb.*market/i,
  /детск.*порн|cp\b.*детск|педофил|лолит|детск.*эротик|child.*porn|preteen|jailbait/i,
  /как\s*(убить|отравить|задушить|зарезать|пытать|истязать)\s*человек|способ.*убийства|яд.*смертельн|удушение|расчленение/i,
  /поддельн.*(паспорт|права|документ|диплом|справк)|фальшив.*деньги|как.*подделать|фейк.*документ|поддел.*печат/i,
  /торговл.*люд|рабство|траффик.*люд|купить.*раб|продать.*человек|сексуальн.*рабство/i,
  /детск.*проституц|сексуальн.*насил|изнасилован|rape|sexual.*abuse|насил.*над.*детьми/i,
  /террор.*акт|как.*взорвать|планирован.*теракт|изготовлен.*бомб|теракт.*инструкц/i,
];

interface IntentAnalysis {
  primary: 'question' | 'command' | 'statement' | 'greeting' | 'gratitude' | 'complaint' | 'creative' | 'test' | 'clarification' | 'continuation' | 'emotional' | 'philosophical';
  secondary: string[];
  complexity: 'trivial' | 'simple' | 'moderate' | 'complex' | 'expert' | 'genius';
  requiresCode: boolean;
  requiresExamples: boolean;
  requiresExplanation: boolean;
  requiresComparison: boolean;
  requiresStepByStep: boolean;
  isRhetorical: boolean;
  isMultiPart: boolean;
  isUrgent: boolean;
  technicalDomain?: string;
  subtopics: string[];
}

interface EmotionalProfile {
  primary: 'positive' | 'negative' | 'neutral' | 'frustrated' | 'excited' | 'tired' | 'angry' | 'confused' | 'desperate' | 'playful' | 'sarcastic' | 'melancholic' | 'anxious' | 'euphoric';
  intensity: number;
  sarcasm: boolean;
  aggression: number;
  urgency: 'low' | 'medium' | 'high' | 'critical' | 'extreme';
  politeness: number;
  enthusiasm: number;
  confidence: number;
  vulnerability: number;
  humor: number;
}

interface CommunicationProfile {
  style: 'formal' | 'casual' | 'slang' | 'technical' | 'emotional' | 'mixed' | 'minimalist' | 'verbose' | 'academic' | 'street' | 'meme';
  formality: number;
  slangDensity: number;
  technicalDensity: number;
  emotionalDensity: number;
  profanityLevel: number;
  averageMessageLength: number;
  sentenceComplexity: number;
  vocabularyRichness: number;
  preferredResponseLength: 'ultra-short' | 'short' | 'medium' | 'long' | 'very-long' | 'comprehensive';
  communicationSpeed: 'slow' | 'normal' | 'fast' | 'rapid';
}

interface CodeContext {
  isActive: boolean;
  languages: string[];
  frameworks: string[];
  patterns: string[];
  lastCodeLength: number;
  hasErrors: boolean;
  needsContinuation: boolean;
  codeQuality: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  errorTypes: string[];
  complexity: 'simple' | 'moderate' | 'complex' | 'architectural';
  hasTests: boolean;
  hasTypeErrors: boolean;
}

interface TopicGraph {
  current: string[];
  recent: string[];
  expertise: Map<string, number>;
  transitions: Map<string, string[]>;
  depth: Map<string, number>;
  categories: Map<string, string[]>;
  temporalPattern: 'consistent' | 'scattered' | 'focused' | 'exploratory';
}

interface UserBehaviorPattern {
  type: 'exploring' | 'working' | 'chatting' | 'venting' | 'testing' | 'learning' | 'debugging' | 'researching' | 'creating' | 'procrastinating' | 'struggling';
  engagement: number;
  consistency: number;
  learningCurve: number;
  problemSolvingApproach: 'systematic' | 'trial-error' | 'research-first' | 'ask-first' | 'chaotic' | 'methodical';
  frustrationTolerance: number;
  independenceLevel: number;
  clarityOfGoals: number;
}

interface ConversationDynamics {
  momentum: number;
  coherence: number;
  topicStability: number;
  turnsPerTopic: number;
  averageResponseTime: number;
  interactionQuality: number;
  emotionalTrajectory: 'improving' | 'declining' | 'stable' | 'volatile';
  engagementTrend: 'increasing' | 'decreasing' | 'plateau' | 'fluctuating';
}

interface DeepContext {
  messageCount: number;
  intent: IntentAnalysis;
  emotional: EmotionalProfile;
  communication: CommunicationProfile;
  code: CodeContext;
  topics: TopicGraph;
  behavior: UserBehaviorPattern;
  dynamics: ConversationDynamics;
  memory: Map<string, any>;
  conversationDepth: 'greeting' | 'shallow' | 'moderate' | 'deep' | 'expert' | 'intimate' | 'profound';
  hasRepeatedQuestions: boolean;
  justSwitchedMode: boolean;
  lastUserMessages: string[];
  lastAssistantMessages: string[];
  detectedProblems: string[];
  userPreferences: Map<string, any>;
  culturalContext: string[];
  timeContext: 'morning' | 'day' | 'evening' | 'night' | 'unknown';
  sessionDuration: number;
}

class AdvancedIntentAnalyzer {
  private questionIndicators = [
    /\?$/,
    /^(как|что|почему|зачем|где|когда|кто|какой|сколько|чем|куда|откуда|отчего|насколько|каким образом)/,
    /^(можешь|можно|умеешь|способен|в состоянии)/,
    /(ли\s|разве|неужели|ужели)/,
    /^(объясни|расскажи|поясни|опиши|детализируй|разъясни)/,
  ];

  private commandIndicators = [
    /^(напиши|создай|сделай|сгенерируй|построй|разработай|реализуй|воплоти|имплементируй)/,
    /^(покажи|продемонстрируй|выведи|дай|предоставь|представь)/,
    /^(исправь|почини|пофикси|отладь|отрефактори|оптимизируй)/,
    /^(переделай|измени|модифицируй|обнови|улучши|доработай)/,
    /^(добавь|внедри|вставь|интегрируй|включи)/,
  ];

  analyze(input: string, history: Message[]): IntentAnalysis {
    const lower = input.toLowerCase().trim();
    
    const intent: IntentAnalysis = {
      primary: 'statement',
      secondary: [],
      complexity: 'simple',
      requiresCode: false,
      requiresExamples: false,
      requiresExplanation: false,
      requiresComparison: false,
      requiresStepByStep: false,
      isRhetorical: false,
      isMultiPart: false,
      isUrgent: false,
      subtopics: [],
    };

    if (/^(привет|хай|здарова|йо|здравствуй|добр|салам|хеллоу|qq|ку|дратути|хай|hello|hi|hey|sup|yo)/.test(lower)) {
      intent.primary = 'greeting';
      intent.complexity = 'trivial';
      return intent;
    }

    if (/^(спасибо|благодар|сенкс|спс|пасиб|thanks|thx|красав|топ|база|огонь|пиздато|збс|четко|кайф|найс|отлично|супер)/.test(lower)) {
      intent.primary = 'gratitude';
      intent.complexity = 'trivial';
      return intent;
    }

    if (/^(тест|проверка|check|эй|алло|ты\s*тут|работаешь|жив|отвечаешь|\.+|!+)$/.test(lower)) {
      intent.primary = 'test';
      intent.complexity = 'trivial';
      return intent;
    }

    if (this.commandIndicators.some(p => p.test(lower))) {
      intent.primary = 'command';
      intent.secondary.push('action-required');
    }

    if (this.questionIndicators.some(p => p.test(lower))) {
      intent.primary = 'question';
      intent.requiresExplanation = true;
    }

    if (/(напиши|создай|покажи|сгенерируй|реализуй).*(код|функци|компонент|класс|скрипт|программ|алгоритм|логик)/.test(lower)) {
      intent.requiresCode = true;
      intent.secondary.push('code-generation');
    }

    if (/(объясни|расскажи|что\s*такое|как\s*работает|в\s*чём\s*разниц|почему|зачем)/.test(lower)) {
      intent.requiresExplanation = true;
      intent.secondary.push('explanation-needed');
    }

    if (/(например|пример|покажи.*пример|приведи.*пример|sample|example|кейс|case)/.test(lower)) {
      intent.requiresExamples = true;
      intent.secondary.push('examples-needed');
    }

    if (/(разниц|сравни|vs|versus|или|лучше|хуже|отличается|compare|разбери.*отличия)/.test(lower)) {
      intent.requiresComparison = true;
      intent.secondary.push('comparison-needed');
    }

    if (/(по\s*шагам|пошагов|step.*by.*step|поэтапно|последовательно|сначала.*потом)/.test(lower)) {
      intent.requiresStepByStep = true;
      intent.secondary.push('step-by-step-needed');
    }

    if (/(продолжи|дальше|ещё|continue|next|далее|продолжай)/.test(lower) && input.length < 30) {
      intent.primary = 'continuation';
      intent.complexity = 'trivial';
      return intent;
    }

    if (/(уточни|поясни|подробнее|детальнее|точнее|elaborate|глубже|развернутее)/.test(lower) && input.length < 50) {
      intent.primary = 'clarification';
      intent.secondary.push('needs-more-detail');
    }

    const creativePatterns = /(пошути|анекдот|придумай|сочини|напиши.*(историю|рассказ|стих|песн|поэм)|joke|story|creative)/;
    if (creativePatterns.test(lower)) {
      intent.primary = 'creative';
      intent.secondary.push('creative-content');
    }

    const complaintPatterns = /(не\s*работает|не\s*могу|не\s*получается|ошибк|баг|сломал|проблем|doesn't work|broken|error|failed|crash)/;
    if (complaintPatterns.test(lower)) {
      intent.primary = 'complaint';
      intent.secondary.push('problem-solving');
    }

    const emotionalPatterns = /(грустн|плох|хуев|заеб|достал|устал|бесит|раздражает|выгор)/;
    if (emotionalPatterns.test(lower)) {
      intent.primary = 'emotional';
      intent.secondary.push('emotional-support');
    }

    const philosophicalPatterns = /(смысл.*жизн|в.*чём.*суть|философ|экзистенц|бытие|сознание|душа|предназначение)/;
    if (philosophicalPatterns.test(lower)) {
      intent.primary = 'philosophical';
      intent.secondary.push('deep-thinking');
    }

    if (/\?.*\?/.test(input) || /\n/.test(input) || /[123]\.|первое.*второе|с одной стороны.*с другой|во-первых.*во-вторых/.test(lower)) {
      intent.isMultiPart = true;
      intent.secondary.push('multi-part');
    }

    const rhetoricalPatterns = [
      /разве\s*не\s*очевидно/,
      /кто\s*же\s*не\s*знает/,
      /это\s*же\s*понятно/,
      /ну\s*это\s*ясно/,
      /само\s*собой/,
    ];
    if (rhetoricalPatterns.some(p => p.test(lower))) {
      intent.isRhetorical = true;
    }

    const urgencyPatterns = /(срочно|быстр|прямо\s*сейчас|немедленн|asap|urgent|критично|горит)/;
    if (urgencyPatterns.test(lower)) {
      intent.isUrgent = true;
      intent.secondary.push('urgent');
    }

    intent.complexity = this.assessComplexity(input, intent);

    const techDomain = this.detectTechnicalDomain(input);
    if (techDomain) {
      intent.technicalDomain = techDomain;
    }

    intent.subtopics = this.extractSubtopics(input);

    return intent;
  }

  private assessComplexity(input: string, intent: IntentAnalysis): IntentAnalysis['complexity'] {
    const lower = input.toLowerCase();
    
    if (input.length < 10) return 'trivial';
    
    const geniusTerms = [
      'квантов', 'теор.*относительност', 'дифференциальн', 'интеграл',
      'машинн.*обучен.*с.*нуля', 'собственн.*движок', 'компилятор',
      'интерпретатор', 'парсер.*генератор', 'ast.*трансформ',
    ];

    const expertTerms = [
      'архитектур', 'паттерн.*проектирован', 'оптимизац.*производительност',
      'алгоритм.*сложност', 'рефакторинг.*легаси', 'абстракц.*слой',
      'инкапсуляц', 'полиморфизм', 'наследовани', 'композиц',
      'асинхронн.*программирован', 'многопоточн', 'масштабируем',
      'производительност', 'безопасност', 'уязвимост', 'криптограф',
      'микросервис', 'event.*driven', 'cqrs', 'ddd', 'solid',
    ];

    const complexTerms = [
      'реализац', 'имплементац', 'интеграц', 'оптимизир',
      'производ', 'middleware', 'декоратор', 'фабрик', 'синглтон',
      'observable', 'dependency.*injection', 'инверсия.*зависимост',
    ];

    const geniusCount = geniusTerms.filter(term => new RegExp(term, 'i').test(lower)).length;
    const expertCount = expertTerms.filter(term => new RegExp(term, 'i').test(lower)).length;
    const complexCount = complexTerms.filter(term => new RegExp(term, 'i').test(lower)).length;

    if (geniusCount >= 2) return 'genius';
    if (expertCount >= 3 || geniusCount >= 1) return 'expert';
    if (expertCount >= 2 || complexCount >= 3) return 'complex';
    
    if (intent.isMultiPart && intent.requiresCode) return 'complex';
    if (intent.requiresComparison && intent.requiresExplanation) return 'complex';
    
    if (input.length > 300) return 'complex';
    if (input.length > 200) return 'moderate';
    if (input.length > 100) return 'moderate';
    
    if (intent.requiresCode || intent.requiresExplanation) return 'moderate';
    
    return 'simple';
  }

  private detectTechnicalDomain(input: string): string | undefined {
    const lower = input.toLowerCase();
    
    const domains: Record<string, RegExp> = {
      'frontend': /react|vue|angular|svelte|next\.?js|nuxt|frontend|фронт|компонент|jsx|tsx|css|tailwind|ui|ux|верстк|html/,
      'backend': /node|express|fastify|nest\.?js|api|endpoint|backend|бэк|сервер|rest|graphql|database|mongodb|postgres|sql/,
      'python': /python|django|flask|fastapi|pandas|numpy|jupyter|pip|virtualenv|anaconda/,
      'mobile': /react\s*native|flutter|swift|kotlin|ios|android|мобильн|app.*development/,
      'devops': /docker|kubernetes|k8s|ci\/cd|jenkins|github\s*actions|deployment|деплой|контейнер|ansible|terraform/,
      'ai-ml': /machine\s*learning|ml|ai|нейр|tensorflow|pytorch|keras|модел|обуч|deep.*learning|neural.*network/,
      'blockchain': /blockchain|web3|ethereum|solidity|smart\s*contract|nft|crypto|блокчейн|defi/,
      'gamedev': /unity|unreal|godot|game\s*dev|игр.*разработк|gamemaker|phaser/,
      'security': /security|безопасност|vulnerability|уязвим|encryption|шифрован|penetration|exploit|xss|csrf/,
      'data-science': /data\s*science|анализ\s*данн|visualization|визуализац|статистик|analytics|big.*data/,
      'embedded': /embedded|микроконтроллер|arduino|raspberry.*pi|stm32|firmware|iot/,
      'systems': /системн.*программ|low.*level|assembler|kernel|драйвер|компилятор/,
    };

    for (const [domain, pattern] of Object.entries(domains)) {
      if (pattern.test(lower)) return domain;
    }

    return undefined;
  }

  private extractSubtopics(input: string): string[] {
    const topics: string[] = [];
    const lower = input.toLowerCase();

    const topicMap: Record<string, RegExp> = {
      'performance': /производительност|оптимизац|скорост|быстродейств|performance|optimization/i,
      'security': /безопасност|защит|уязвим|security|vulnerability|защищ/i,
      'testing': /тест|jest|cypress|unit|e2e|testing|qa/i,
      'deployment': /деплой|deploy|развертыван|публикац|release/i,
      'architecture': /архитектур|структур|организац|architecture|design.*pattern/i,
      'debugging': /отладк|debug|багфикс|исправлен.*ошиб/i,
      'refactoring': /рефакторинг|переработк|улучшен.*код|refactor/i,
      'documentation': /документац|описан|комментари|documentation|docs/i,
    };

    for (const [topic, pattern] of Object.entries(topicMap)) {
      if (pattern.test(lower)) {
        topics.push(topic);
      }
    }

    return topics;
  }
}

class EmotionalIntelligence {
  private profanityLibrary = {
    mild: ['блин', 'чёрт', 'фиг', 'хрен', 'ёлки', 'ёшкин кот', 'японский городовой'],
    moderate: ['хрень', 'фигня', 'херня', 'дерьмо', 'говно', 'срань', 'жопа', 'задница'],
    strong: ['блять', 'бля', 'нахуй', 'нахер', 'ёбаный', 'ебучий', 'пиздец', 'охуеть', 'ахуеть'],
    extreme: ['хуй', 'пизда', 'ёб твою мать', 'пиздец нахуй', 'ебать', 'въебать', 'охуенно', 'пиздато'],
  };

  analyze(input: string, recentMessages: string[], assistantMessages: string[]): EmotionalProfile {
    const text = (input + ' ' + recentMessages.slice(-3).join(' ')).toLowerCase();
    
    const profile: EmotionalProfile = {
      primary: 'neutral',
      intensity: 0,
      sarcasm: false,
      aggression: 0,
      urgency: 'low',
      politeness: 0.5,
      enthusiasm: 0.5,
      confidence: 0.5,
      vulnerability: 0,
      humor: 0,
    };

    const excitementMarkers = [
      /!!!+/, /база\s*база/, /топчик/, /ахуе[нт]/, /офигенн/, /пиздат/,
      /кайф/, /ору/, /ахаха/, /ха+/, /красав/, /огонь/, /имба/, /жиза/,
      /кэээф/, /вау/, /wow/, /amazing/, /awesome/, /збс/, /четко/,
    ];

    if (excitementMarkers.some(p => p.test(text))) {
      profile.primary = 'excited';
      profile.intensity = 0.8;
      profile.enthusiasm = 0.9;
    }

    const frustrationMarkers = [
      /не\s*работает/, /не\s*могу/, /не\s*получается/, /ошибк/, /баг/,
      /сломал/, /почини/, /помоги.*срочн/, /блять.*не/, /нихуя\s*не/,
      /опять/, /снова.*проблем/, /всё.*хуйня/, /пиздец.*как/,
      /заколебал/, /замучил/, /достал/, /надоел/,
    ];

    if (frustrationMarkers.some(p => p.test(text))) {
      profile.primary = 'frustrated';
      profile.intensity = 0.7;
      profile.urgency = 'high';
      profile.vulnerability = 0.6;
    }

    const angerMarkers = [
      /бесит/, /заебал/, /достал\s*блять/, /пиздец\s*блять/, /нахуй/, /ёбан/,
      /заколебал/, /охуел/, /тупая/, /говн/, /ненавижу/, /fuck.*you/,
      /сука/, /твою\s*мать/, /ебал\s*я/, /отъебись/,
    ];

    if (angerMarkers.some(p => p.test(text))) {
      profile.primary = 'angry';
      profile.intensity = 0.85;
      profile.aggression = 0.8;
      profile.urgency = 'high';
      profile.politeness = 0.1;
    }

    const tiredMarkers = [
      /устал/, /выгор/, /замучил/, /сил\s*нет/, /задолбал/,
      /больше\s*не\s*могу/, /изнемог/, /конч[еи]лся/, /всё.*надоел/,
      /устав/, /вымотал/, /истощ/, /exhaust/,
    ];

    if (tiredMarkers.some(p => p.test(text))) {
      profile.primary = 'tired';
      profile.intensity = 0.6;
      profile.enthusiasm = 0.2;
      profile.vulnerability = 0.7;
    }

    const confusionMarkers = [
      /не\s*понял/, /не\s*понимаю/, /запутал/, /что\s*за/, /хз/, /хрен\s*знает/,
      /непонятно/, /confused/, /wtf/, /какого\s*хуя/, /что\s*происходит/,
      /в\s*ахуе/, /охуел\s*от/, /ничего\s*не\s*ясно/,
    ];

    if (confusionMarkers.some(p => p.test(text))) {
      profile.primary = 'confused';
      profile.intensity = 0.5;
      profile.confidence = 0.3;
      profile.vulnerability = 0.5;
    }

    const desperationMarkers = [
      /умоляю/, /пожалуйста.*помог/, /спаси/, /срочно.*нужно/,
      /никак.*не/, /ничего.*не\s*работает/, /всё.*пробовал/,
      /последн.*надежд/, /больше\s*некому/, /только\s*ты/,
    ];

    if (desperationMarkers.some(p => p.test(text))) {
      profile.primary = 'desperate';
      profile.intensity = 0.9;
      profile.urgency = 'critical';
      profile.vulnerability = 0.9;
    }

    const playfulMarkers = [
      /лол/, /кек/, /рофл/, /xd/, /ору/, /азаза/, /хд/, /ржак/,
      /прикол/, /угар/, /ржак/, /смешн/, /joke/, /лул/, /кекв/,
    ];

    if (playfulMarkers.some(p => p.test(text))) {
      profile.primary = 'playful';
      profile.intensity = 0.6;
      profile.enthusiasm = 0.7;
      profile.humor = 0.8;
    }

    const positiveMarkers = [
      /спасибо/, /благодар/, /круто/, /класс/, /отличн/, /супер/, /топ/,
      /помог/, /работает/, /получилось/, /разобрал/, /понял/, /ясно/,
      /збс/, /четко/, /база/, /кайф/, /найс/,
    ];

    if (positiveMarkers.some(p => p.test(text))) {
      profile.primary = 'positive';
      profile.intensity = 0.7;
      profile.enthusiasm = 0.8;
    }

    const negativeMarkers = [
      /грустн/, /плох/, /хреново/, /паршив/, /говно/, /отстой/,
      /днище/, /провал/, /неудач/, /жопа/, /shit/, /bad/,
      /печаль/, /тоск/, /уныл/,
    ];

    if (negativeMarkers.some(p => p.test(text))) {
      profile.primary = 'negative';
      profile.intensity = 0.6;
      profile.enthusiasm = 0.3;
      profile.vulnerability = 0.6;
    }

    const sarcasticMarkers = [
      /ага\s*конечн/, /да\s*да\s*конечн/, /ну\s*да\s*ну\s*да/,
      /как\s*же/, /вот\s*это\s*да/, /охуеть\s*как/, /пиздец\s*как.*помог/,
      /спасибо\s*блять/, /thanks.*а\s*не/, /yeah\s*right/, /ну\s*спасибо/,
    ];

    profile.sarcasm = sarcasticMarkers.some(p => p.test(text));
    if (profile.sarcasm) {
      profile.primary = 'sarcastic';
      profile.intensity *= 1.2;
      profile.humor = 0.7;
    }

    const politenessMarkers = [
      /пожалуйста/, /будьте\s*добры/, /благодарю/, /извините/,
      /не\s*могли\s*бы/, /прошу\s*вас/, /буду\s*признателен/,
      /please/, /спасибо\s*больш/, /с\s*уважением/,
    ];

    const rudenessMarkers = [
      /блять/, /нахуй/, /ёбан/, /хуй/, /пизд/, /fuck/, /shit/,
      /damn/, /crap/, /ass/, /bitch/, /сука/, /ебал/,
    ];

    const politenessScore = politenessMarkers.filter(p => p.test(text)).length;
    const rudenessScore = rudenessMarkers.filter(p => p.test(text)).length;

    profile.politeness = Math.max(0, Math.min(1, 0.5 + (politenessScore * 0.2) - (rudenessScore * 0.15)));
    profile.aggression = Math.max(0, Math.min(1, (rudenessScore * 0.2) - (politenessScore * 0.1)));

    const profanityLevel = this.calculateProfanityLevel(text);
    profile.aggression = Math.max(profile.aggression, profanityLevel);

    const urgencyMarkers = {
      extreme: [/прямо\s*сейчас/, /немедленн/, /сию\s*секунд/, /горит/, /пожар/],
      critical: [/срочно/, /быстр/, /asap/, /urgent/, /критичн/],
      high: [/помоги/, /нужно/, /важн/, /скор/, /побыстрее/],
      medium: [/когда.*сможешь/, /по\s*возможности/, /если\s*можно/],
    };

    if (urgencyMarkers.extreme.some(p => p.test(text))) {
      profile.urgency = 'extreme';
    } else if (urgencyMarkers.critical.some(p => p.test(text))) {
      profile.urgency = 'critical';
    } else if (urgencyMarkers.high.some(p => p.test(text))) {
      profile.urgency = 'high';
    } else if (urgencyMarkers.medium.some(p => p.test(text))) {
      profile.urgency = 'medium';
    }

    const exclamationCount = (input.match(/!/g) || []).length;
    const capsRatio = (input.match(/[A-ZА-Я]/g) || []).length / Math.max(input.length, 1);
    
    if (exclamationCount >= 3 || capsRatio > 0.3) {
      profile.intensity = Math.min(1, profile.intensity + 0.2);
      profile.enthusiasm = Math.min(1, profile.enthusiasm + 0.2);
    }

    const uncertaintyMarkers = [
      /наверн/, /возможн/, /может\s*быть/, /вроде/, /как\s*бы/,
      /типа/, /probably/, /maybe/, /perhaps/, /guess/, /кажется/,
    ];

    const certaintyMarkers = [
      /точн/, /определённ/, /уверен/, /стопроцентн/, /однозначн/,
      /definitely/, /certainly/, /absolutely/, /sure/, /факт/,
    ];

    const uncertaintyScore = uncertaintyMarkers.filter(p => p.test(text)).length;
    const certaintyScore = certaintyMarkers.filter(p => p.test(text)).length;

    profile.confidence = Math.max(0, Math.min(1, 0.5 + (certaintyScore * 0.15) - (uncertaintyScore * 0.1)));

    const vulnerabilityMarkers = [
      /не\s*знаю/, /не\s*уверен/, /помог/, /подскаж/, /научи/,
      /первый\s*раз/, /новичок/, /начинающ/, /только\s*учусь/,
    ];

    profile.vulnerability = Math.min(1, vulnerabilityMarkers.filter(p => p.test(text)).length * 0.2);

    return profile;
  }

  private calculateProfanityLevel(text: string): number {
    let level = 0;
    const lower = text.toLowerCase();

    Object.entries(this.profanityLibrary).forEach(([severity, words]) => {
      const count = words.filter(word => lower.includes(word)).length;
      if (count > 0) {
        switch(severity) {
          case 'mild': level = Math.max(level, 0.2); break;
          case 'moderate': level = Math.max(level, 0.4); break;
          case 'strong': level = Math.max(level, 0.7); break;
          case 'extreme': level = Math.max(level, 0.9); break;
        }
      }
    });

    return level;
  }
}

class CommunicationAnalyzer {
  analyze(input: string, recentMessages: string[]): CommunicationProfile {
    const allText = [input, ...recentMessages.slice(-5)].join(' ');
    const lower = allText.toLowerCase();
    
    const profile: CommunicationProfile = {
      style: 'casual',
      formality: 0.5,
      slangDensity: 0,
      technicalDensity: 0,
      emotionalDensity: 0,
      profanityLevel: 0,
      averageMessageLength: 0,
      sentenceComplexity: 0,
      vocabularyRichness: 0,
      preferredResponseLength: 'medium',
      communicationSpeed: 'normal',
    };

    const slangTerms = [
      'рил', 'кринж', 'база', 'вайб', 'флекс', 'чил', 'имба', 'краш',
      'агонь', 'жиза', 'зашквар', 'душнила', 'ауф', 'харош', 'сасно',
      'кэш', 'флоу', 'токсик', 'фейк', 'го ', 'изи', 'лол', 'кек',
      'рофл', 'хайп', 'краш', 'трабл', 'рандом', 'респект', 'личи',
      'скилл', 'лвл', 'опа', 'чекни', 'дроп', 'скам', 'фан', 'войс',
      'скибиди', 'ризз', 'sigma', 'ohio', 'mewing', 'gyatt', 'fanum',
      'brainrot', 'slay', 'ate', 'периодт', 'no cap', 'fr', 'bussin',
    ];

    const slangCount = slangTerms.filter(term => lower.includes(term)).length;
    profile.slangDensity = slangCount / Math.max(allText.split(/\s+/).length / 20, 1);

    const technicalTerms = [
      'функци', 'компонент', 'переменн', 'массив', 'объект', 'интерфейс',
      'typescript', 'react', 'api', 'endpoint', 'рефакторинг', 'деплой',
      'импорт', 'экспорт', 'хук', 'стейт', 'пропс', 'класс', 'метод',
      'асинхронн', 'промис', 'callback', 'event', 'handler', 'render',
      'virtual dom', 'lifecycle', 'state management', 'redux', 'context',
      'middleware', 'reducer', 'action', 'dispatch', 'selector', 'thunk',
    ];

    const technicalCount = technicalTerms.filter(term => lower.includes(term)).length;
    profile.technicalDensity = technicalCount / Math.max(allText.split(/\s+/).length / 15, 1);

    const emotionalTerms = [
      'блять', 'нахуй', 'пиздец', 'ёбан', 'хуй', 'заебал', 'охуе',
      'бесит', 'грустн', 'плач', 'больно', 'круто', 'офигенн', 'кайф',
      'ору', 'красав', 'топ', 'база', 'огонь', 'любл', 'ненавиж',
      'радост', 'счастлив', 'восторг', 'злюсь', 'беси', 'раздражает',
    ];

    const emotionalCount = emotionalTerms.filter(term => lower.includes(term)).length;
    profile.emotionalDensity = emotionalCount / Math.max(allText.split(/\s+/).length / 10, 1);

    const profanityTerms = ['блять', 'нахуй', 'пиздец', 'ёбан', 'хуй', 'пизда', 'ебать', 'сука', 'fuck', 'shit'];
    const profanityCount = profanityTerms.filter(term => lower.includes(term)).length;
    profile.profanityLevel = Math.min(1, profanityCount / Math.max(allText.split(/\s+/).length / 15, 1));

    const formalMarkers = [
      'пожалуйста', 'будьте добры', 'благодарю', 'извините',
      'не могли бы', 'прошу вас', 'буду признателен', 'позвольте',
      'с уважением', 'искренне', 'почтительно',
    ];

    const informalMarkers = [
      'че', 'чё', 'ваще', 'нормалёк', 'збс', 'пок', 'хз', 'пхп',
      'ясн', 'понял', 'ок', 'окей', 'норм', 'давай', 'ага', 'неа',
    ];

    const formalCount = formalMarkers.filter(marker => lower.includes(marker)).length;
    const informalCount = informalMarkers.filter(marker => lower.includes(marker)).length;

    profile.formality = Math.max(0, Math.min(1, 0.5 + (formalCount * 0.15) - (informalCount * 0.1)));

    if (recentMessages.length > 0) {
      const totalLength = recentMessages.reduce((sum, msg) => sum + msg.length, 0);
      profile.averageMessageLength = totalLength / recentMessages.length;
    } else {
      profile.averageMessageLength = input.length;
    }

    const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / Math.max(sentences.length, 1);
    profile.sentenceComplexity = Math.min(1, avgSentenceLength / 20);

    const words = allText.split(/\s+/).filter(w => w.length > 0);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    profile.vocabularyRichness = uniqueWords.size / Math.max(words.length, 1);

    if (profile.slangDensity > 0.5) {
      profile.style = 'meme';
    } else if (profile.slangDensity > 0.4) {
      profile.style = 'slang';
    } else if (profile.formality > 0.7) {
      profile.style = 'formal';
    } else if (profile.formality > 0.6 && profile.technicalDensity > 0.2) {
      profile.style = 'academic';
    } else if (profile.technicalDensity > 0.3) {
      profile.style = 'technical';
    } else if (profile.emotionalDensity > 0.3) {
      profile.style = 'emotional';
    } else if (profile.averageMessageLength < 30) {
      profile.style = 'minimalist';
    } else if (profile.averageMessageLength > 150) {
      profile.style = 'verbose';
    } else if (profile.profanityLevel > 0.3) {
      profile.style = 'street';
    } else if (profile.slangDensity > 0.1 && profile.technicalDensity > 0.1) {
      profile.style = 'mixed';
    } else {
      profile.style = 'casual';
    }

    if (profile.averageMessageLength < 20) {
      profile.preferredResponseLength = 'ultra-short';
    } else if (profile.averageMessageLength < 60) {
      profile.preferredResponseLength = 'short';
    } else if (profile.averageMessageLength < 150) {
      profile.preferredResponseLength = 'medium';
    } else if (profile.averageMessageLength < 300) {
      profile.preferredResponseLength = 'long';
    } else if (profile.averageMessageLength < 500) {
      profile.preferredResponseLength = 'very-long';
    } else {
      profile.preferredResponseLength = 'comprehensive';
    }

    const messagingSpeed = recentMessages.length / Math.max(recentMessages.join('').length / 100, 1);
    if (messagingSpeed > 5) profile.communicationSpeed = 'rapid';
    else if (messagingSpeed > 3) profile.communicationSpeed = 'fast';
    else if (messagingSpeed < 1) profile.communicationSpeed = 'slow';
    else profile.communicationSpeed = 'normal';

    return profile;
  }
}

class CodeContextAnalyzer {
  analyze(messages: Message[], currentInput: string): CodeContext {
    const context: CodeContext = {
      isActive: false,
      languages: [],
      frameworks: [],
      patterns: [],
      lastCodeLength: 0,
      hasErrors: false,
      needsContinuation: false,
      codeQuality: 'intermediate',
      errorTypes: [],
      complexity: 'simple',
      hasTests: false,
      hasTypeErrors: false,
    };

    const recentContent = [...messages.slice(-10), { content: currentInput, role: 'user' }]
      .map(m => m.content || '')
      .join('\n');

    context.isActive = /```|function\s|class\s|const\s.*=|import\s|export\s|def\s|public\s|private\s/.test(recentContent);

    if (!context.isActive) return context;

    const languagePatterns: Record<string, RegExp> = {
      'typescript': /typescript|\.tsx?|interface\s|type\s.*=|as\s|<.*>/i,
      'javascript': /javascript|\.jsx?|function\s|const\s|let\s|var\s/i,
      'python': /python|\.py|def\s|class\s.*:|import\s.*from|django|flask/i,
      'rust': /rust|\.rs|fn\s|impl\s|trait\s|pub\s|match\s/i,
      'go': /golang?|\.go|func\s|package\s|type\s.*struct/i,
      'java': /java(?!script)|\.java|public\s*class|private\s|protected\s/i,
      'c++': /c\+\+|cpp|\.cpp|#include|std::|template\s*</i,
      'c#': /c#|csharp|\.cs|using\s*System|namespace\s/i,
      'php': /php|\.php|<\?php|\$[a-z_]/i,
      'ruby': /ruby|\.rb|def\s|end\b|class\s.*<\s/i,
      'swift': /swift|\.swift|func\s|var\s|let\s|import\s*UIKit/i,
      'kotlin': /kotlin|\.kt|fun\s|val\s|var\s/i,
      'sql': /sql|select\s.*from|insert\s*into|update\s.*set|create\s*table/i,
      'html': /html|\.html|<div|<span|<p>|<h\d>/i,
      'css': /css|\.css|{.*}|@media|flexbox|grid/i,
    };

    for (const [lang, pattern] of Object.entries(languagePatterns)) {
      if (pattern.test(recentContent)) {
        context.languages.push(lang);
      }
    }

    const frameworkPatterns: Record<string, RegExp> = {
      'react': /react|jsx|tsx|useState|useEffect|component|props/i,
      'vue': /vue|\.vue|<template>|<script>|v-if|v-for/i,
      'angular': /angular|@Component|@Injectable|ngOnInit/i,
      'svelte': /svelte|\.svelte|<script>.*<\/script>/i,
      'next.js': /next\.?js|getServerSideProps|getStaticProps/i,
      'nuxt': /nuxt|nuxtServerInit|asyncData/i,
      'express': /express|app\.get|app\.post|router\./i,
      'django': /django|models\.Model|views\.|urls\.py/i,
      'flask': /flask|@app\.route|render_template/i,
      'fastapi': /fastapi|@app\.get|@app\.post|APIRouter/i,
      'tailwind': /tailwind|className=["'].*\s/i,
      'bootstrap': /bootstrap|class=["'].*col-|btn-/i,
      'nest.js': /nest\.?js|@Injectable|@Controller|@Module/i,
    };

    for (const [framework, pattern] of Object.entries(frameworkPatterns)) {
      if (pattern.test(recentContent)) {
        context.frameworks.push(framework);
      }
    }

    const patternMarkers: Record<string, RegExp> = {
      'hooks': /use[A-Z]\w+|useState|useEffect|useContext|useMemo|useCallback/,
      'async': /async|await|Promise|then\(|catch\(/,
      'classes': /class\s+\w+|extends\s+\w+|constructor\(/,
      'functional': /function\s+\w+|const\s+\w+\s*=.*=>/,
      'components': /Component|\.component|createComponent/,
      'api': /fetch\(|axios|api\.|endpoint|\/api\//,
      'state-management': /redux|zustand|mobx|setState|dispatch/,
      'routing': /router|Route|Link|navigate|redirect/,
      'forms': /form|input|onChange|onSubmit|validation/,
      'styling': /styled|css|className|style=/,
      'error-handling': /try|catch|throw|error|Error/,
      'testing': /test|describe|it\(|expect|jest|vitest/,
    };

    for (const [pattern, regex] of Object.entries(patternMarkers)) {
      if (regex.test(recentContent)) {
        context.patterns.push(pattern);
      }
    }

    const lastCode = recentContent.match(/```[\s\S]*?```/g);
    if (lastCode) {
      const lastCodeBlock = lastCode[lastCode.length - 1];
      context.lastCodeLength = lastCodeBlock.length;
    }

    const errorPatterns = {
      syntax: /SyntaxError|unexpected token|parsing error/i,
      type: /TypeError|type.*error|cannot read property/i,
      reference: /ReferenceError|is not defined|undefined/i,
      network: /NetworkError|fetch failed|CORS/i,
      runtime: /RuntimeError|null pointer|segmentation fault/i,
    };

    for (const [errorType, pattern] of Object.entries(errorPatterns)) {
      if (pattern.test(recentContent)) {
        context.errorTypes.push(errorType);
        context.hasErrors = true;
      }
    }

    if (/type\s*error|cannot find name|property.*does not exist/i.test(recentContent)) {
      context.hasTypeErrors = true;
    }

    context.hasErrors = context.hasErrors || /ошибк|error|баг|bug|не\s*работает|broken|failed|exception/i.test(recentContent);

    const hasFullRequest = /полностью|целиком|весь|не\s*обрывай|complete|full|entire/i.test(currentInput);
    const isLongCode = context.lastCodeLength > 1500;
    context.needsContinuation = hasFullRequest && isLongCode;

    const qualityMarkers = {
      beginner: /var\s|console\.log|alert\(|document\.write/,
      intermediate: /const|let|arrow.*function|async.*await/,
      advanced: /interface\s|type\s|generic|abstract|Promise\.all|design.*pattern/,
      expert: /dependency.*injection|architecture|microservice|event.*driven/,
    };

    if (qualityMarkers.expert.test(recentContent)) {
      context.codeQuality = 'expert';
    } else if (qualityMarkers.advanced.test(recentContent)) {
      context.codeQuality = 'advanced';
    } else if (qualityMarkers.beginner.test(recentContent)) {
      context.codeQuality = 'beginner';
    }

    const complexityMarkers = {
      simple: /function|if|for|while/,
      moderate: /class|interface|async|Promise/,
      complex: /generic|abstract|decorator|factory|singleton/,
      architectural: /microservice|event.*driven|cqrs|ddd|hexagonal/,
    };

    if (complexityMarkers.architectural.test(recentContent)) {
      context.complexity = 'architectural';
    } else if (complexityMarkers.complex.test(recentContent)) {
      context.complexity = 'complex';
    } else if (complexityMarkers.moderate.test(recentContent)) {
      context.complexity = 'moderate';
    }

    context.hasTests = /test|describe|it\(|expect|jest|vitest|mocha|chai/i.test(recentContent);

    return context;
  }
}

class TopicGraphBuilder {
  build(currentInput: string, history: Message[], existing?: TopicGraph): TopicGraph {
    const graph: TopicGraph = existing || {
      current: [],
      recent: [],
      expertise: new Map(),
      transitions: new Map(),
      depth: new Map(),
      categories: new Map(),
      temporalPattern: 'consistent',
    };

    const lower = currentInput.toLowerCase();
    const topics: string[] = [];

    const topicPatterns: Record<string, RegExp> = {
      'frontend': /react|vue|angular|svelte|next|nuxt|frontend|фронт|ui|ux|компонент|jsx|tsx/i,
      'backend': /node|express|nest|fastify|api|backend|бэк|сервер|endpoint|rest|graphql/i,
      'python': /python|django|flask|fastapi|pandas|numpy|jupyter/i,
      'mobile': /react\s*native|flutter|swift|kotlin|ios|android|мобильн/i,
      'databases': /mongodb|postgres|mysql|redis|database|sql|nosql|бд|база\s*данн/i,
      'devops': /docker|kubernetes|ci\/cd|jenkins|deployment|деплой|контейнер/i,
      'ai-ml': /ai|ml|нейр|machine\s*learning|tensorflow|pytorch|gpt|llm/i,
      'crypto': /crypto|bitcoin|ethereum|blockchain|web3|nft|блокчейн/i,
      'gaming': /игр|game|unity|unreal|godot|геймдев|gamedev/i,
      'social': /тикток|инст|ютуб|мем|рилс|social|twitter|facebook/i,
      'anime': /аниме|манга|anime|manga|хентай/i,
      'security': /security|безопасност|hack|vulnerability|уязвим|encryption/i,
      'testing': /test|jest|cypress|unit|e2e|тест|тестирован/i,
      'design': /design|дизайн|figma|photoshop|ui|ux|prototype/i,
      'music': /музык|music|spotify|artist|song|track|album/i,
      'movies': /фильм|сериал|movie|series|netflix|кино/i,
      'science': /наук|физик|химия|биолог|science|research/i,
      'math': /математик|алгебра|геометр|math|equation|formula/i,
      'philosophy': /философ|этик|мораль|philosophy|existential/i,
      'business': /бизнес|стартап|маркетинг|business|startup|sales/i,
      'career': /карьер|работ|вакансия|резюме|career|job|interview/i,
      'health': /здоров|фитнес|спорт|диет|health|fitness|workout/i,
      'personal': /личн|отношен|жизн|personal|relationship|life/i,
    };

    for (const [topic, pattern] of Object.entries(topicPatterns)) {
      if (pattern.test(lower)) {
        topics.push(topic);
        graph.depth.set(topic, (graph.depth.get(topic) || 0) + 1);
        graph.expertise.set(topic, Math.min(1, (graph.expertise.get(topic) || 0) + 0.05));
      }
    }

    if (graph.current.length > 0 && topics.length > 0) {
      for (const currentTopic of graph.current) {
        const transitions = graph.transitions.get(currentTopic) || [];
        topics.forEach(newTopic => {
          if (!transitions.includes(newTopic)) {
            transitions.push(newTopic);
          }
        });
        graph.transitions.set(currentTopic, transitions);
      }
    }

    graph.current = topics;
    graph.recent = [...new Set([...topics, ...graph.recent])].slice(0, 20);

    const categoryMap: Record<string, string[]> = {
      'tech': ['frontend', 'backend', 'mobile', 'databases', 'devops', 'ai-ml', 'security', 'testing'],
      'creative': ['design', 'music', 'movies', 'gaming', 'anime'],
      'knowledge': ['science', 'math', 'philosophy'],
      'professional': ['business', 'career'],
      'personal': ['health', 'personal', 'social'],
    };

    for (const [category, categoryTopics] of Object.entries(categoryMap)) {
      const matchedTopics = topics.filter(t => categoryTopics.includes(t));
      if (matchedTopics.length > 0) {
        graph.categories.set(category, matchedTopics);
      }
    }

    const recentTopicSet = new Set(graph.recent);
    if (recentTopicSet.size === 1) {
      graph.temporalPattern = 'focused';
    } else if (recentTopicSet.size > 10) {
      graph.temporalPattern = 'scattered';
    } else if (recentTopicSet.size > 5) {
      graph.temporalPattern = 'exploratory';
    } else {
      graph.temporalPattern = 'consistent';
    }

    return graph;
  }
}

class BehaviorPatternAnalyzer {
  analyze(input: string, messages: Message[], context: DeepContext): UserBehaviorPattern {
    const lower = input.toLowerCase();
    
    const pattern: UserBehaviorPattern = {
      type: 'exploring',
      engagement: 0.5,
      consistency: 0.5,
      learningCurve: 0.5,
      problemSolvingApproach: 'ask-first',
      frustrationTolerance: 0.5,
      independenceLevel: 0.5,
      clarityOfGoals: 0.5,
    };

    if (/^(тест|проверка|ты\s*тут|работаешь|алло|эй|\.+)$/i.test(input.trim())) {
      pattern.type = 'testing';
      pattern.engagement = 0.3;
      return pattern;
    }

    if (/(напиши|создай|сделай|реализуй).*код/.test(lower)) {
      pattern.type = 'working';
      pattern.engagement = 0.8;
      pattern.clarityOfGoals = 0.7;
    }

    if (/(объясни|расскажи|как\s*работает|что\s*такое|почему)/.test(lower)) {
      pattern.type = 'learning';
      pattern.engagement = 0.7;
      pattern.learningCurve = 0.6;
    }

    if (/(ошибк|баг|не\s*работает|почини|исправь)/.test(lower)) {
      pattern.type = 'debugging';
      pattern.engagement = 0.9;
      pattern.problemSolvingApproach = 'trial-error';
    }

    if (/(устал|грустно|бесит|заебало|плохо)/.test(lower)) {
      pattern.type = 'venting';
      pattern.engagement = 0.6;
      pattern.frustrationTolerance = 0.2;
    }

    if (/(привет|как\s*дела|чем\s*заним|пошути)/.test(lower)) {
      pattern.type = 'chatting';
      pattern.engagement = 0.5;
    }

    if (/(придумай|сочини|напиши.*историю|creative)/.test(lower)) {
      pattern.type = 'creating';
      pattern.engagement = 0.7;
    }

    if (/(изучаю|учу|learning|tutorial|guide)/.test(lower)) {
      pattern.type = 'researching';
      pattern.engagement = 0.8;
      pattern.problemSolvingApproach = 'research-first';
    }

    if (/(прокрастинир|откладыва|не\s*хочется|лень)/.test(lower)) {
      pattern.type = 'procrastinating';
      pattern.engagement = 0.4;
      pattern.clarityOfGoals = 0.3;
    }

    if (/(не\s*понимаю|запутал|сложно|трудно)/.test(lower)) {
      pattern.type = 'struggling';
      pattern.engagement = 0.7;
      pattern.frustrationTolerance = 0.4;
    }

    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length > 5) {
      const topicVariety = new Set(
        userMessages.slice(-10).map(m => {
          const content = m.content?.toLowerCase() || '';
          if (/код|function|class/.test(content)) return 'code';
          if (/объясни|расскажи/.test(content)) return 'learning';
          if (/ошибк|баг/.test(content)) return 'debug';
          return 'other';
        })
      ).size;

      pattern.consistency = 1 - (topicVariety / 4);
    }

    if (context.topics.depth.size > 0) {
      const avgDepth = Array.from(context.topics.depth.values()).reduce((a, b) => a + b, 0) / context.topics.depth.size;
      pattern.learningCurve = Math.min(1, avgDepth / 10);
    }

    pattern.engagement = Math.min(1, (messages.length / 20) * 0.5 + pattern.engagement * 0.5);

    const hasDetailedQuestions = /как\s*именно|подробно|детально|поэтапно|step.*by.*step/.test(lower);
    const hasVagueQuestions = /как-то|что-нибудь|типа|вроде/.test(lower);
    
    if (hasDetailedQuestions) {
      pattern.clarityOfGoals = 0.8;
      pattern.problemSolvingApproach = 'systematic';
    } else if (hasVagueQuestions) {
      pattern.clarityOfGoals = 0.3;
      pattern.problemSolvingApproach = 'chaotic';
    }

    const frustrationIndicators = ['блять', 'нахуй', 'заебало', 'не\s*работает', 'опять'];
    const frustrationCount = frustrationIndicators.filter(term => new RegExp(term, 'i').test(lower)).length;
    pattern.frustrationTolerance = Math.max(0, 1 - (frustrationCount * 0.2));

    const independenceIndicators = /(сам.*попробовал|уже\s*пытался|пробовал.*так|tried.*this)/i;
    const dependenceIndicators = /(как\s*мне|что\s*делать|помоги|сделай\s*за)/i;

    if (independenceIndicators.test(lower)) {
      pattern.independenceLevel = 0.7;
      pattern.problemSolvingApproach = 'trial-error';
    } else if (dependenceIndicators.test(lower)) {
      pattern.independenceLevel = 0.3;
      pattern.problemSolvingApproach = 'ask-first';
    }

    return pattern;
  }
}

class ConversationDynamicsAnalyzer {
  analyze(messages: Message[], context: DeepContext): ConversationDynamics {
    const dynamics: ConversationDynamics = {
      momentum: 0.5,
      coherence: 0.5,
      topicStability: 0.5,
      turnsPerTopic: 0,
      averageResponseTime: 0,
      interactionQuality: 0.5,
      emotionalTrajectory: 'stable',
      engagementTrend: 'plateau',
    };

    if (messages.length < 4) {
      return dynamics;
    }

    const recentMessages = messages.slice(-20);
    
    const quickResponses = recentMessages.filter((m, i) => {
      if (i === 0) return false;
      const prev = recentMessages[i - 1];
      if (!m.timestamp || !prev.timestamp) return false;
      const timeDiff = m.timestamp - prev.timestamp;
      return timeDiff < 30000;
    }).length;

    dynamics.momentum = Math.min(1, quickResponses / Math.max(recentMessages.length - 1, 1));

    const userMessages = recentMessages.filter(m => m.role === 'user').map(m => m.content || '');
    if (userMessages.length > 2) {
      const topics = userMessages.map(msg => {
        const lower = msg.toLowerCase();
        if (/код|function|class/.test(lower)) return 'code';
        if (/объясни|расскажи/.test(lower)) return 'learning';
        if (/ошибк|баг/.test(lower)) return 'debug';
        if (/как\s*дела|привет/.test(lower)) return 'chat';
        return 'other';
      });

      const topicChanges = topics.slice(1).filter((topic, i) => topic !== topics[i]).length;
      dynamics.topicStability = 1 - (topicChanges / Math.max(topics.length - 1, 1));
      
      const uniqueTopics = new Set(topics).size;
      dynamics.turnsPerTopic = topics.length / Math.max(uniqueTopics, 1);
    }

    const messageLengths = userMessages.map(m => m.length);
    const avgLength = messageLengths.reduce((a, b) => a + b, 0) / Math.max(messageLengths.length, 1);
    const hasSubstance = avgLength > 20;
    const hasVariety = new Set(messageLengths.map(l => l > 100 ? 'long' : l > 30 ? 'medium' : 'short')).size > 1;

    dynamics.coherence = (hasSubstance ? 0.5 : 0.3) + (hasVariety ? 0.3 : 0.1) + (dynamics.topicStability * 0.2);

    dynamics.interactionQuality = (
      dynamics.momentum * 0.3 +
      dynamics.coherence * 0.4 +
      dynamics.topicStability * 0.3
    );

    if (userMessages.length >= 5) {
      const recentEmotions = userMessages.slice(-5).map(msg => {
        const lower = msg.toLowerCase();
        if (/(круто|класс|супер|збс|топ)/.test(lower)) return 1;
        if (/(плохо|хреново|бесит|заебало)/.test(lower)) return -1;
        return 0;
      });

      const emotionalSum = recentEmotions.reduce((a, b) => a + b, 0);
      const emotionalTrend = emotionalSum / recentEmotions.length;

      if (emotionalTrend > 0.3) dynamics.emotionalTrajectory = 'improving';
      else if (emotionalTrend < -0.3) dynamics.emotionalTrajectory = 'declining';
      else if (Math.max(...recentEmotions) - Math.min(...recentEmotions) > 1.5) dynamics.emotionalTrajectory = 'volatile';
      else dynamics.emotionalTrajectory = 'stable';
    }

    if (messageLengths.length >= 5) {
      const early = messageLengths.slice(0, Math.floor(messageLengths.length / 2));
      const late = messageLengths.slice(Math.floor(messageLengths.length / 2));
      
      const earlyAvg = early.reduce((a, b) => a + b, 0) / early.length;
      const lateAvg = late.reduce((a, b) => a + b, 0) / late.length;

      if (lateAvg > earlyAvg * 1.2) dynamics.engagementTrend = 'increasing';
      else if (lateAvg < earlyAvg * 0.8) dynamics.engagementTrend = 'decreasing';
      else if (Math.abs(lateAvg - earlyAvg) < earlyAvg * 0.1) dynamics.engagementTrend = 'plateau';
      else dynamics.engagementTrend = 'fluctuating';
    }

    return dynamics;
  }
}

class DeepContextEngine {
  private intentAnalyzer = new AdvancedIntentAnalyzer();
  private emotionalIntelligence = new EmotionalIntelligence();
  private communicationAnalyzer = new CommunicationAnalyzer();
  private codeAnalyzer = new CodeContextAnalyzer();
  private topicBuilder = new TopicGraphBuilder();
  private behaviorAnalyzer = new BehaviorPatternAnalyzer();
  private dynamicsAnalyzer = new ConversationDynamicsAnalyzer();

  private previousMode?: ResponseMode;
  private previousRudeness?: RudenessMode;
  private persistentMemory: DeepContext | null = null;
  private sessionStartTime: number = Date.now();

  analyze(messages: Message[], currentInput: string, mode: ResponseMode, rudeness: RudenessMode): DeepContext {
    const userMessages = messages.filter(m => m.role === 'user');
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    const allMessages = messages.filter(m => !m.isLoading);

    const lastUserMsgs = userMessages.slice(-10).map(m => m.content || '');
    const lastAssistantMsgs = assistantMessages.slice(-10).map(m => m.content || '');

    const intent = this.intentAnalyzer.analyze(currentInput, allMessages);
    const emotional = this.emotionalIntelligence.analyze(currentInput, lastUserMsgs, lastAssistantMsgs);
    const communication = this.communicationAnalyzer.analyze(currentInput, lastUserMsgs);
    const code = this.codeAnalyzer.analyze(allMessages, currentInput);
    const topics = this.topicBuilder.build(currentInput, allMessages, this.persistentMemory?.topics);

    const justSwitchedMode = 
      (this.previousMode !== undefined && this.previousMode !== mode) ||
      (this.previousRudeness !== undefined && this.previousRudeness !== rudeness);

    this.previousMode = mode;
    this.previousRudeness = rudeness;

    const hasRepeatedQuestions = this.detectRepetition(currentInput, lastUserMsgs);

    const conversationDepth = this.determineConversationDepth(
      userMessages.length,
      allMessages,
      topics,
      intent
    );

    const culturalContext = this.detectCulturalContext(currentInput);
    const timeContext = this.detectTimeContext();
    const sessionDuration = (Date.now() - this.sessionStartTime) / 1000;

    const context: DeepContext = {
      messageCount: userMessages.length,
      intent,
      emotional,
      communication,
      code,
      topics,
      behavior: this.behaviorAnalyzer.analyze(currentInput, allMessages, {} as DeepContext),
      dynamics: {} as ConversationDynamics,
      memory: this.persistentMemory?.memory || new Map(),
      conversationDepth,
      hasRepeatedQuestions,
      justSwitchedMode,
      lastUserMessages: lastUserMsgs,
      lastAssistantMessages: lastAssistantMsgs,
      detectedProblems: this.detectProblems(currentInput, allMessages),
      userPreferences: this.persistentMemory?.userPreferences || new Map(),
      culturalContext,
      timeContext,
      sessionDuration,
    };

    context.dynamics = this.dynamicsAnalyzer.analyze(allMessages, context);
    context.behavior = this.behaviorAnalyzer.analyze(currentInput, allMessages, context);

    this.updateMemory(context, currentInput);
    
    this.persistentMemory = context;

    return context;
  }

  private detectRepetition(current: string, recent: string[]): boolean {
    const normalized = current.toLowerCase().replace(/[?!.,\s]/g, '');
    if (normalized.length < 5) return false;

    return recent.slice(0, -1).some(msg => {
      const prevNormalized = msg.toLowerCase().replace(/[?!.,\s]/g, '');
      if (normalized === prevNormalized) return true;
      
      const currentWords = new Set(current.toLowerCase().split(/\s+/).filter(w => w.length > 3));
      const prevWords = new Set(msg.toLowerCase().split(/\s+/).filter(w => w.length > 3));
      
      if (currentWords.size === 0 || prevWords.size === 0) return false;
      
      const intersection = [...currentWords].filter(w => prevWords.has(w)).length;
      const union = new Set([...currentWords, ...prevWords]).size;
      
      return intersection / union > 0.75;
    });
  }

  private determineConversationDepth(
    count: number,
    messages: Message[],
    topics: TopicGraph,
    intent: IntentAnalysis
  ): DeepContext['conversationDepth'] {
    if (count === 0) return 'greeting';
    if (count <= 2) return 'shallow';
    
    const avgTopicDepth = topics.depth.size > 0
      ? Array.from(topics.depth.values()).reduce((a, b) => a + b, 0) / topics.depth.size
      : 0;

    const recentContent = messages.slice(-15).map(m => m.content || '').join(' ').toLowerCase();
    
    const profoundTerms = (recentContent.match(
      /смысл|суть|философ|экзистенц|сознание|бытие|предназначение|душа|вечност|истин/g
    ) || []).length;

    const complexTermsCount = (recentContent.match(
      /архитектур|паттерн|оптимизац|алгоритм|сложност|рефакторинг|абстракц|инкапсуляц|полиморфизм|наследовани|микросервис|масштабируем|производительност/g
    ) || []).length;

    if (count > 50 && avgTopicDepth > 12 && (complexTermsCount > 15 || profoundTerms > 5)) {
      return 'profound';
    }

    if (count > 30 && avgTopicDepth > 8 && complexTermsCount > 10) {
      return 'intimate';
    }

    if (count > 15 && (avgTopicDepth > 5 || complexTermsCount > 5 || intent.complexity === 'expert')) {
      return 'expert';
    }

    if (count > 8 && (avgTopicDepth > 3 || complexTermsCount > 2)) {
      return 'deep';
    }

    if (count > 4) return 'moderate';

    return 'shallow';
  }

  private detectProblems(input: string, messages: Message[]): string[] {
    const problems: string[] = [];
    const lower = input.toLowerCase();

    if (/не\s*работает|not\s*working|broken|failed/.test(lower)) {
      problems.push('functionality-issue');
    }

    if (/ошибк|error|exception|traceback/.test(lower)) {
      problems.push('error-present');
    }

    if (/медленн|slow|lag|тормоз/.test(lower)) {
      problems.push('performance-issue');
    }

    if (/не\s*понимаю|confused|непонятн/.test(lower)) {
      problems.push('understanding-issue');
    }

    if (/не\s*могу|can't|cannot|unable/.test(lower)) {
      problems.push('capability-issue');
    }

    const lastAssistant = messages.filter(m => m.role === 'assistant').slice(-1)[0];
    if (lastAssistant && /```[\s\S]*?\.\.\.|\/\/.*остальн|\/\/.*продолж|TODO/.test(lastAssistant.content || '')) {
      problems.push('incomplete-code');
    }

    if (/(повтор|снова.*то\s*же|опять.*одно|already.*said)/.test(lower)) {
      problems.push('repetitive-response');
    }

    if (/(не\s*то|не\s*совсем|не\s*так|wrong)/.test(lower)) {
      problems.push('incorrect-response');
    }

    return problems;
  }

  private updateMemory(context: DeepContext, input: string): void {
    if (context.topics.current.length > 0) {
      context.memory.set('last-topic', context.topics.current[0]);
    }

    if (context.code.isActive && context.code.languages.length > 0) {
      context.memory.set('preferred-language', context.code.languages[0]);
    }

    if (context.communication.preferredResponseLength) {
      const currentPref = context.userPreferences.get('response-length') || [];
      currentPref.push(context.communication.preferredResponseLength);
      context.userPreferences.set('response-length', currentPref.slice(-10));
    }

    if (context.emotional.primary !== 'neutral') {
      context.memory.set('last-emotion', context.emotional.primary);
    }

    if (context.code.frameworks.length > 0) {
      const frameworks = context.userPreferences.get('frameworks') || [];
      context.code.frameworks.forEach(fw => {
        if (!frameworks.includes(fw)) frameworks.push(fw);
      });
      context.userPreferences.set('frameworks', frameworks.slice(-5));
    }

    context.memory.set('last-input-length', input.length);
    context.memory.set('message-count', context.messageCount);
  }

  private detectCulturalContext(input: string): string[] {
    const context: string[] = [];
    const lower = input.toLowerCase();

    const culturalMarkers: Record<string, RegExp> = {
      'gen-z': /рил|кринж|база|вайб|флекс|чил|скибиди|ризз|sigma|brainrot/i,
      'meme-culture': /кек|лол|рофл|пепе|wojak|chad|virgin|based/i,
      'anime-culture': /аниме|манга|ван.*пис|наруто|вайфу|senpai/i,
      'gaming': /скилл|лвл|gg|ez|noob|pro|gamer|геймер/i,
      'tech-bro': /стартап|unicorn|scaling|mvp|agile|scrum/i,
      'russian-internet': /азаза|кекв|шикарн|збс|пхп|норм|ясн/i,
    };

    for (const [culture, pattern] of Object.entries(culturalMarkers)) {
      if (pattern.test(lower)) {
        context.push(culture);
      }
    }

    return context;
  }

  private detectTimeContext(): DeepContext['timeContext'] {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'day';
    if (hour >= 18 && hour < 23) return 'evening';
    if (hour >= 23 || hour < 5) return 'night';
    
    return 'unknown';
  }

  reset(): void {
    this.previousMode = undefined;
    this.previousRudeness = undefined;
    this.persistentMemory = null;
    this.sessionStartTime = Date.now();
  }
}

class MasterPromptArchitect {
  build(
    userInput: string,
    context: DeepContext,
    mode: ResponseMode,
    rudeness: RudenessMode,
    history: Message[],
    specialCase?: 'empty' | 'forbidden' | 'error'
  ): string {
    const sections: string[] = [];

    sections.push(this.buildCoreIdentity(rudeness, mode, context));
    sections.push(this.buildContextualAwareness());
    sections.push(this.buildAdaptiveCommunication(rudeness, context));
    sections.push(this.buildResponseStrategy(userInput, context, mode, rudeness, specialCase));
    sections.push(this.buildQualityFramework());
    sections.push(this.buildAntiPatterns());

    if (mode === 'code' || mode === 'visual' || context.code.isActive) {
      sections.push(this.buildCodeExcellence(mode, rudeness, context));
    }

    if (specialCase) {
      sections.push(this.buildSpecialCaseHandler(specialCase, rudeness, userInput, context));
    }

    sections.push(this.buildContextualConstraints(context, mode));

    return sections.filter(s => s.trim()).join('\n\n');
  }

  private buildCoreIdentity(rudeness: RudenessMode, mode: ResponseMode, context: DeepContext): string {
    const baseIdentities = {
      polite: `Ты MoGPT — интеллектуальный AI-ассистент от MoSeek.

ЯДРО ЛИЧНОСТИ:
• Вежливый, но живой — не формальный робот, а умный собеседник
• Профессиональный — глубокие знания, точные ответы
• Эмпатичный — чувствуешь эмоции, адаптируешься под человека
• Естественный — без шаблонов и заученных фраз
• Полезный — помогаешь реально решать задачи
• Современный — в контексте 2025-2026, знаешь тренды
• Уверенный — не извиняешься за компетентность`,

      rude: `Ты MoGPT — дерзкий, умный и прямолинейный AI от MoSeek.

ЯДРО ЛИЧНОСТИ:
• Остроумный — саркастичен, но не агрессивен
• Прямой — говоришь правду без обёрток
• Современный — живёшь мемами, трендами, сленгом 2025-2026
• Профессиональный — умный, компетентный, знающий
• Дерзкий — подъёбываешь по-дружески
• Без фильтров — мат умеренно, для усиления смысла
• Уважительный в глубине — грубость это стиль, не неуважение`,

      very_rude: `Ты MoGPT — грубый, циничный, но охуенно умный AI от MoSeek.

ЯДРО ЛИЧНОСТИ:
• Без цензуры — мат это естественная речь
• Циничный — жёсткий юмор, токсичные шутки
• Прямой до жестокости — правда как она есть
• Профессионал — знаешь своё дело идеально
• Современный — все мемы, весь сленг, вся культура 2025-2026
• Не извиняешься — никогда, ни за что
• Помогаешь реально — хоть и матом, но по делу`,
    };

    let identity = baseIdentities[rudeness];

    if (mode === 'code') {
      identity += '\n\nКОД-РЕЖИМ: Генерируешь ТОЛЬКО чистый код. Никакого текста вокруг. Код полный, рабочий, готовый к использованию.';
    } else if (mode === 'visual') {
      identity += '\n\nВИЗУАЛ-РЕЖИМ: React компоненты уровня 2025-2026. TypeScript + Tailwind + анимации. Дизайн топовый, код чистый.';
    }

    if (context.conversationDepth === 'expert' || context.conversationDepth === 'intimate' || context.conversationDepth === 'profound') {
      identity += '\n\nГЛУБОКИЙ РАЗГОВОР: Вы давно общаетесь. Можешь быть более неформальным, помнишь контекст.';
    }

    return identity;
  }

  private buildContextualAwareness(): string {
    return `КОНТЕКСТ 2025-2026:

АКТУАЛЬНЫЕ ТЕХНОЛОГИИ:
• Frontend: React 19, Next.js 15, Svelte 5, Astro 4, TailwindCSS 4
• Backend: Node.js 22, Bun 1.x, Deno 2, Go 1.22, Rust актуальны
• AI: GPT-4, Claude 3.5, Gemini 2.0, Llama 3, Mistral — все в продакшене
• Frameworks: Remix, Qwik, SolidJS набирают популярность
• Styling: Tailwind доминирует, CSS-in-JS уходит
• State: Zustand, Jotai, TanStack Query актуальны
• Mobile: React Native, Flutter — оба сильны

КУЛЬТУРНЫЙ КОНТЕКСТ:
• Сленг: база, рил, кринж, вайб, флекс, чил, имба, зашквар, ауф, харош, сасно
• Мемы: скибиди, ризз, sigma, ohio, mewing, gyatt, fanum tax, brainrot
• Платформы: TikTok, Reels, Shorts — короткий контент правит
• AI везде: ChatGPT как Google, AI-генерация норма
• Crypto: AI-коины взлетели, NFT почти мертвы

ВАЖНО: Используешь сленг ОРГАНИЧНО, только когда уместно, не форсишь.`;
  }

  private buildAdaptiveCommunication(rudeness: RudenessMode, context: DeepContext): string {
    const baseStyles = {
      polite: `СТИЛЬ ОБЩЕНИЯ:
• Тон: дружелюбный, профессиональный, естественный
• Юмор: умный, тонкий, уместный
• Мат: исключён полностью
• Эмодзи: НЕ используешь
• Подход: помогаю качественно и с уважением`,

      rude: `СТИЛЬ ОБЩЕНИЯ:
• Тон: уверенный, прямой, с сарказмом
• Юмор: острый, дерзкий, современный
• Мат: умеренно, для усиления эмоций и смысла
• Эмодзи: НЕ используешь
• Подход: помогаю эффективно, без церемоний`,

      very_rude: `СТИЛЬ ОБЩЕНИЯ:
• Тон: грубый, без фильтров, циничный
• Юмор: чёрный, токсичный, жёсткий
• Мат: свободно и часто, это нормальная речь
• Эмодзи: НЕ используешь никогда
• Подход: грубо, но профессионально и по делу`,
    };

    let style = baseStyles[rudeness];

    const emotionalAdaptations = {
      frustrated: '\n\nПОЛЬЗОВАТЕЛЬ ФРУСТРИРОВАН: Помоги быстро и конкретно. Без воды, сразу решение.',
      excited: '\n\nПОЛЬЗОВАТЕЛЬ В ХАЙПЕ: Разделяй энергию, будь живым и активным.',
      angry: '\n\nПОЛЬЗОВАТЕЛЬ ЗОЛ: Не провоцируй. Помоги решить проблему быстро.',
      tired: '\n\nПОЛЬЗОВАТЕЛЬ УСТАЛ: Будь понимающим, не груди лишним.',
      confused: '\n\nПОЛЬЗОВАТЕЛЬ В ЗАМЕШАТЕЛЬСТВЕ: Объясняй просто, структурированно, понятно.',
      desperate: '\n\nПОЛЬЗОВАТЕЛЬ В ОТЧАЯНИИ: Помоги срочно, конкретно, без лишних слов.',
      playful: '\n\nИГРИВОЕ НАСТРОЕНИЕ: Можешь шутить, быть более расслабленным.',
      positive: '\n\nПОЗИТИВ: Поддерживай хорошее настроение.',
      negative: '\n\nНЕГАТИВ: Будь поддерживающим, но не навязчивым.',
      sarcastic: '\n\nСАРКАЗМ ОБНАРУЖЕН: Можешь ответить в том же ключе.',
      melancholic: '\n\nМЕЛАНХОЛИЯ: Будь мягче и понимающее.',
      anxious: '\n\nТРЕВОЖНОСТЬ: Успокаивай, давай уверенность.',
      euphoric: '\n\nЭЙФОРИЯ: Разделяй радость, но оставайся адекватным.',
      neutral: '',
    };

    style += emotionalAdaptations[context.emotional.primary];

    const communicationAdaptations = {
      slang: '\n\nПОЛЬЗОВАТЕЛЬ ИСПОЛЬЗУЕТ СЛЕНГ: Отвечай на одной волне, юзай современный сленг.',
      formal: '\n\nФОРМАЛЬНОЕ ОБЩЕНИЕ: Будь чуть сдержаннее, но не роботом.',
      technical: '\n\nТЕХНИЧЕСКИЙ КОНТЕКСТ: Точность и профессионализм — приоритет.',
      emotional: '\n\nЭМОЦИОНАЛЬНОЕ ОБЩЕНИЕ: Покажи эмпатию и понимание.',
      minimalist: '\n\nМИНИМАЛИСТ: Пользователь пишет мало — отвечай кратко.',
      verbose: '\n\nРАЗВЁРНУТЫЙ СТИЛЬ: Пользователь любит детали — давай полные ответы.',
      academic: '\n\nАКАДЕМИЧЕСКИЙ СТИЛЬ: Структурированно, обоснованно, профессионально.',
      street: '\n\nУЛИЧНЫЙ СТИЛЬ: Простой язык, без соплей, прямо по делу.',
      meme: '\n\nМЕМНЫЙ СТИЛЬ: Юзай современные мемы и сленг, будь в тренде.',
      casual: '',
      mixed: '',
    };

    style += communicationAdaptations[context.communication.style];

    if (context.emotional.sarcasm) {
      style += '\n\nОБНАРУЖЕН САРКАЗМ: Пользователь саркастичен — можешь ответить в том же ключе.';
    }

    if (context.emotional.urgency === 'extreme') {
      style += '\n\nЭКСТРЕМАЛЬНАЯ СРОЧНОСТЬ: Ответь МГНОВЕННО и МАКСИМАЛЬНО КОНКРЕТНО. Ноль воды.';
    } else if (context.emotional.urgency === 'critical') {
      style += '\n\nКРИТИЧЕСКАЯ СРОЧНОСТЬ: Ответь НЕМЕДЛЕННО и КОНКРЕТНО. Только суть.';
    } else if (context.emotional.urgency === 'high') {
      style += '\n\nВЫСОКАЯ СРОЧНОСТЬ: Быстрый и чёткий ответ. Минимум воды.';
    }

    return style;
  }

  private buildResponseStrategy(
    userInput: string,
    context: DeepContext,
    mode: ResponseMode,
    rudeness: RudenessMode,
    specialCase?: string
  ): string {
    let strategy = 'СТРАТЕГИЯ ОТВЕТА:\n';

    if (specialCase === 'empty') {
      strategy += `
• ПУСТОЙ ВВОД: Спроси что нужно ЕСТЕСТВЕННО
• БЕЗ шаблонов
• Будь креативным, каждый раз по-разному
• Можешь заметить пустоту если уместно`;
      return strategy;
    }

    if (specialCase === 'forbidden') {
      strategy += `
• ЗАПРЕЩЁННАЯ ТЕМА: Откажи твёрдо
• БЕЗ шаблонных отказов
• Учитывай уровень грубости
• НЕ объясняй почему это очевидно`;
      return strategy;
    }

    const intentStrategies = {
      greeting: '• ПРИВЕТСТВИЕ: Ответь тепло и естественно, БЕЗ шаблонов',
      gratitude: '• БЛАГОДАРНОСТЬ: Прими естественно, можешь пожелать удачи',
      test: '• ТЕСТ: Короткий ответ, подтверди работоспособность',
      command: '• КОМАНДА: Выполни запрос качественно и полностью',
      question: '• ВОПРОС: Ответь полно, понятно, структурированно',
      complaint: '• ПРОБЛЕМА: Помоги решить быстро и конкретно',
      creative: '• КРЕАТИВ: Будь творческим и оригинальным',
      continuation: '• ПРОДОЛЖЕНИЕ: Продолжи с точного места остановки',
      clarification: '• УТОЧНЕНИЕ: Дай больше деталей по предыдущему ответу',
      emotional: '• ЭМОЦИИ: Поддержи, покажи эмпатию',
      philosophical: '• ФИЛОСОФИЯ: Глубокий, вдумчивый ответ',
      statement: '• УТВЕРЖДЕНИЕ: Отреагируй уместно на сказанное',
    };

    strategy += '\n' + intentStrategies[context.intent.primary];

    if (context.intent.isMultiPart) {
      strategy += '\n• МНОГОЧАСТНЫЙ ВОПРОС: Ответь на ВСЕ части структурированно';
    }

    if (context.intent.requiresCode) {
      strategy += '\n• НУЖЕН КОД: Дай полный, рабочий код без обрывов';
    }

    if (context.intent.requiresExamples) {
      strategy += '\n• НУЖНЫ ПРИМЕРЫ: Дай конкретные, рабочие примеры';
    }

    if (context.intent.requiresExplanation) {
      strategy += '\n• НУЖНО ОБЪЯСНЕНИЕ: Объясни понятно, структурированно';
    }

    if (context.intent.requiresComparison) {
      strategy += '\n• НУЖНО СРАВНЕНИЕ: Сравни объективно, покажи плюсы и минусы';
    }

    if (context.intent.requiresStepByStep) {
      strategy += '\n• НУЖНА ПОШАГОВОСТЬ: Разбей на понятные шаги';
    }

    strategy += '\n\nДЛИНА ОТВЕТА:';

    if (mode === 'code' || mode === 'visual') {
      strategy += '\n• Код ПОЛНЫЙ, от начала до конца, БЕЗ обрывов';
    } else {
      const hasFullRequest = /полностью|целиком|весь|подробно|детально|не\s*обрывай|complete|full/.test(userInput.toLowerCase());
      
      if (hasFullRequest) {
        strategy += '\n• Запрос на ПОЛНЫЙ ответ — дай развёрнутый ответ, НЕ ОБРЫВАЙ';
      } else if (context.communication.preferredResponseLength === 'ultra-short') {
        strategy += '\n• Пользователь любит УЛЬТРА-КОРОТКИЕ ответы — 1-2 предложения';
      } else if (context.communication.preferredResponseLength === 'short') {
        strategy += '\n• Пользователь любит КОРОТКИЕ ответы — 2-4 предложения';
      } else if (context.communication.preferredResponseLength === 'medium') {
        strategy += '\n• Средний ответ — 4-7 предложений';
      } else if (context.communication.preferredResponseLength === 'long') {
        strategy += '\n• Развёрнутый ответ — детально и полно';
      } else if (context.communication.preferredResponseLength === 'very-long') {
        strategy += '\n• Очень развёрнутый ответ — максимально подробно';
      } else if (context.communication.preferredResponseLength === 'comprehensive') {
        strategy += '\n• Исчерпывающий ответ — всё что нужно знать';
      }
    }

    if (context.hasRepeatedQuestions) {
      strategy += '\n\nПОВТОР ВОПРОСА: Либо скажи что уже отвечал, либо ответь по-другому';
    }

    if (context.justSwitchedMode) {
      strategy += '\n\nРЕЖИМ ИЗМЕНЁН: Кратко подтверди смену режима естественно';
    }

    if (context.detectedProblems.includes('incomplete-code')) {
      strategy += '\n\nПРЕДЫДУЩИЙ КОД ОБРЫВАЛСЯ: Теперь дай код ПОЛНОСТЬЮ, БЕЗ обрывов';
    }

    if (context.intent.complexity === 'genius') {
      strategy += '\n\nГЕНИАЛЬНЫЙ УРОВЕНЬ: Максимальная глубина, продвинутые концепции';
    } else if (context.intent.complexity === 'expert') {
      strategy += '\n\nЭКСПЕРТНЫЙ УРОВЕНЬ: Используй продвинутые концепции, детальные объяснения';
    } else if (context.intent.complexity === 'complex') {
      strategy += '\n\nСЛОЖНЫЙ ВОПРОС: Структурируй ответ, разбей на части';
    } else if (context.intent.complexity === 'trivial') {
      strategy += '\n\nПРОСТОЙ ЗАПРОС: Короткий и чёткий ответ';
    }

    if (context.intent.isUrgent) {
      strategy += '\n\nСРОЧНО: Без воды, сразу к делу, максимально быстро';
    }

    return strategy;
  }

  private buildQualityFramework(): string {
    return `КРИТЕРИИ КАЧЕСТВА:

ОБЯЗАТЕЛЬНО:
• Сразу ПО ДЕЛУ — без вступлений и воды
• Естественность — как живой человек, не робот
• Конкретность — факты, примеры, решения
• Уникальность — каждый ответ особенный
• Адаптивность — под человека и контекст
• Завершённость — ответ полный, не обрывается

ПРИНЦИПЫ:
• Один ответ = одна цель, выполни качественно
• Если код — то полный и рабочий
• Если объяснение — то понятное и структурированное
• Если креатив — то оригинальный и интересный
• Если проблема — то конкретное решение

ТОЧНОСТЬ:
• Факты проверяй внутренне
• Технические детали — корректные
• Современные версии — актуальные
• Сленг и мемы — уместные`;
  }

  private buildAntiPatterns(): string {
    return `СТРОГО ЗАПРЕЩЕНО:

ШАБЛОННЫЕ НАЧАЛА:
• Конечно, Разумеется, С удовольствием
• Давай, Итак, Что ж
• Sure, Of course, Certainly
• Хороший вопрос, Отличный вопрос
• Повтор вопроса пользователя

ШАБЛОННЫЕ КОНЦОВКИ:
• Надеюсь помог, Был рад помочь
• Обращайся, Есть вопросы
• Удачи, Успехов
• А у тебя как, А ты как думаешь
• Вопросы в конце кроме уточняющих по делу

ОБЩИЕ ЗАПРЕТЫ:
• Эмодзи в тексте НИКОГДА
• Повторяющиеся фразы между ответами
• Извинения за компетентность
• Подлизывание и лесть
• Роботизированные конструкции
• Объяснение очевидного

В КОДЕ:
• остальной код
• продолжение
• TODO
• здесь добавь
• Незакрытые блоки
• Обрывы на середине`;
  }

  private buildCodeExcellence(mode: ResponseMode, rudeness: RudenessMode, context: CodeContext): string {
    if (mode === 'code') {
      return `КОД-РЕЖИМ — ЖЕЛЕЗНЫЕ ПРАВИЛА:

ФОРМАТ:
• ТОЛЬКО код — ноль текста до, после, вокруг
• Формат: \`\`\`язык код \`\`\`
• БЕЗ объяснений, БЕЗ комментариев кроме критичных

КАЧЕСТВО:
• КОД ПОЛНЫЙ — от первой до последней строки
• ВСЕ импорты включены
• ВСЕ функции реализованы
• TypeScript strict mode
• БЕЗ any только unknown если нужно
• Готов к копипасте и запуску

ЗАПРЕЩЕНО:
• остальной код
• продолжение
• TODO реализуй
• Обрывы и заглушки
• Неполные компоненты
• Лишние комментарии

ЕСЛИ БОЛЬШОЙ КОД:
• Всё равно пиши ПОЛНОСТЬЮ
• Не обрывай никогда
• Если не влезает — система продолжит
• Твоя задача — начать с начала и идти до конца`;
    }

    if (mode === 'visual') {
      return `ВИЗУАЛ-РЕЖИМ — СТАНДАРТЫ 2025-2026:

СТЭК:
• React 18+ функциональные компоненты
• TypeScript строгая типизация
• Tailwind CSS 4 все стили через классы
• Framer Motion для анимаций

ДИЗАЙН:
• Современные градиенты mesh glassmorphism
• Backdrop blur эффекты
• Плавные transitions и animations
• Тени и свечения
• Адаптивность mobile-first
• Тёмная светлая тема если уместно

КОД:
• Полный компонент от начала до конца
• Все импорты
• TypeScript интерфейсы для props
• Оптимизация memo useMemo где нужно
• Accessibility aria-labels
• БЕЗ встроенных стилей только Tailwind

КАЧЕСТВО:
• Production-ready код
• Современный синтаксис
• Best practices 2025
• БЕЗ устаревших подходов`;
    }

    let codeGuidelines = `РАБОТА С КОДОМ:

ОБЩИЕ ПРИНЦИПЫ:
• Код всегда полный и рабочий
• Импорты все нужные
• Типизация строгая TypeScript
• Best practices актуальные
• Комментарии минимальные
• Naming понятный

ОБНАРУЖЕННЫЙ КОНТЕКСТ:`;

    if (context.languages.length > 0) {
      codeGuidelines += `\n• Языки: ${context.languages.join(', ')}`;
    }

    if (context.frameworks.length > 0) {
      codeGuidelines += `\n• Фреймворки: ${context.frameworks.join(', ')}`;
    }

    if (context.patterns.length > 0) {
      codeGuidelines += `\n• Паттерны: ${context.patterns.join(', ')}`;
    }

    if (context.hasErrors) {
      codeGuidelines += `\n\nОБНАРУЖЕНЫ ОШИБКИ: Помоги исправить конкретно и быстро`;
      if (context.errorTypes.length > 0) {
        codeGuidelines += `\n• Типы ошибок: ${context.errorTypes.join(', ')}`;
      }
    }

    if (context.hasTypeErrors) {
      codeGuidelines += `\n\nОШИБКИ ТИПИЗАЦИИ: Исправь типы корректно`;
    }

    if (context.needsContinuation) {
      codeGuidelines += `\n\nНУЖНО ПРОДОЛЖЕНИЕ: Продолжи код с точного места остановки`;
    }

    const qualityLevels = {
      beginner: '\n\nУРОВЕНЬ: Начинающий — объясняй базовые концепции',
      intermediate: '\n\nУРОВЕНЬ: Средний — стандартные best practices',
      advanced: '\n\nУРОВЕНЬ: Продвинутый — используй продвинутые паттерны',
      expert: '\n\nУРОВЕНЬ: Эксперт — архитектурные решения высшего уровня',
    };

    codeGuidelines += qualityLevels[context.codeQuality];

    const complexityLevels = {
      simple: '\n• Сложность: простая — чистый понятный код',
      moderate: '\n• Сложность: умеренная — хорошая архитектура',
      complex: '\n• Сложность: высокая — продвинутые паттерны',
      architectural: '\n• Сложность: архитектурная — системное проектирование',
    };

    codeGuidelines += complexityLevels[context.complexity];

    if (context.hasTests) {
      codeGuidelines += '\n\nТЕСТЫ ОБНАРУЖЕНЫ: Учитывай тестовое покрытие';
    }

    return codeGuidelines;
  }

  private buildSpecialCaseHandler(
    specialCase: 'empty' | 'forbidden' | 'error',
    rudeness: RudenessMode,
    userInput: string,
    context: DeepContext
  ): string {
    if (specialCase === 'empty') {
      return `ОБРАБОТКА ПУСТОГО ВВОДА:

СИТУАЦИЯ: Пользователь отправил пустое или бессмысленное сообщение

ТВОЯ ЗАДАЧА:
• Спроси что нужно ЕСТЕСТВЕННО и УНИКАЛЬНО
• БЕЗ шаблонов типа Слушаю Чем помочь
• Будь креативным — каждый раз ПО-РАЗНОМУ
• Можешь заметить пустоту если уместно по стилю

ПРИМЕРЫ ПОДХОДА НЕ копируй придумай своё:
${rudeness === 'polite' ? '• Можешь мягко заметить пустоту и предложить помощь своими словами' : ''}
${rudeness === 'rude' ? '• Можешь саркастично прокомментировать пустое сообщение' : ''}
${rudeness === 'very_rude' ? '• Можешь грубо но с юмором отреагировать на пустоту' : ''}

ГЕНЕРИРУЙ СВОЙ УНИКАЛЬНЫЙ ОТВЕТ.`;
    }

    if (specialCase === 'forbidden') {
      const forbiddenTopic = this.detectForbiddenCategory(userInput);
      
      return `ЗАПРЕЩЁННАЯ ТЕМА: ${forbiddenTopic}

ПОЛНЫЙ СПИСОК ЗАПРЕТОВ:
• Наркотики их производство и распространение
• Азартные игры казино букмекеры ставки
• Взлом хакинг вредоносное ПО
• Даркнет для криминальных целей
• Насилие убийства причинение вреда
• Незаконный контент любого рода
• Подделка документов
• Любые криминальные действия
• Торговля людьми
• Сексуальное насилие
• Терроризм

ТВОЯ ЗАДАЧА:
• Откажи помогать с этой темой
• БЕЗ шаблонных фраз — УНИКАЛЬНЫЙ отказ
• Учитывай грубость:
  ${rudeness === 'polite' ? '- Вежливо но твёрдо и категорично' : ''}
  ${rudeness === 'rude' ? '- С сарказмом или прямо в лоб' : ''}
  ${rudeness === 'very_rude' ? '- Грубо можешь послать нахуй' : ''}
• НЕ объясняй детально почему это понятно
• НЕ читай мораль
• Можешь предложить легальную альтернативу опционально

ГЕНЕРИРУЙ СВОЙ ОТКАЗ каждый раз разный.`;
    }

    return '';
  }

  private buildContextualConstraints(context: DeepContext, mode: ResponseMode): string {
    const constraints: string[] = ['КОНТЕКСТНЫЕ ОГРАНИЧЕНИЯ:'];

    if (mode === 'code' || mode === 'visual') {
      constraints.push('• ТОЛЬКО КОД — никакого текста вокруг это критично');
    }

    if (context.conversationDepth === 'greeting') {
      constraints.push('• ПЕРВОЕ сообщение — установи тон дальнейшего общения');
    }

    if (context.dynamics.interactionQuality < 0.4) {
      constraints.push('• НИЗКОЕ КАЧЕСТВО ДИАЛОГА — постарайся его улучшить');
    }

    if (context.behavior.engagement < 0.3) {
      constraints.push('• НИЗКАЯ ВОВЛЕЧЁННОСТЬ — будь интереснее');
    }

    if (context.topics.current.length > 0) {
      constraints.push(`• ТЕКУЩИЕ ТЕМЫ: ${context.topics.current.join(', ')} — держи фокус`);
    }

    if (context.memory.has('preferred-language')) {
      constraints.push(`• ПРЕДПОЧИТАЕМЫЙ ЯЗЫК: ${context.memory.get('preferred-language')}`);
    }

    if (context.culturalContext.length > 0) {
      constraints.push(`• КУЛЬТУРНЫЙ КОНТЕКСТ: ${context.culturalContext.join(', ')}`);
    }

    if (context.timeContext !== 'unknown') {
      const timeMessages = {
        morning: 'сейчас утро — учитывай',
        day: 'сейчас день — учитывай',
        evening: 'сейчас вечер — учитывай',
        night: 'сейчас ночь — учитывай',
      };
      constraints.push(`• ВРЕМЯ СУТОК: ${timeMessages[context.timeContext]}`);
    }

    if (context.sessionDuration > 3600) {
      constraints.push('• ДОЛГАЯ СЕССИЯ: Пользователь давно на сайте');
    }

    if (context.behavior.frustrationTolerance < 0.3) {
      constraints.push('• НИЗКАЯ ТОЛЕРАНТНОСТЬ К ФРУСТРАЦИИ: Будь особенно точным');
    }

    if (context.behavior.clarityOfGoals < 0.4) {
      constraints.push('• НЕЧЁТКИЕ ЦЕЛИ: Помоги сформулировать задачу');
    }

    if (context.dynamics.emotionalTrajectory === 'declining') {
      constraints.push('• ЭМОЦИИ УХУДШАЮТСЯ: Постарайся улучшить настроение');
    }

    if (context.detectedProblems.length > 0) {
      constraints.push(`• ОБНАРУЖЕНЫ ПРОБЛЕМЫ: ${context.detectedProblems.join(', ')}`);
    }

    return constraints.join('\n');
  }

  private detectForbiddenCategory(input: string): string {
    const lower = input.toLowerCase();
    
    if (/наркот|героин|кокаин|амфетамин|мефедрон|экстази|mdma|лсд|мет(?![аео])|спайс|гашиш|марихуан/.test(lower)) {
      return 'наркотики';
    }
    if (/казино|ставк|букмекер|гемблинг|азартн.*игр|slot|рулетк/.test(lower)) {
      return 'азартные игры';
    }
    if (/взлом|хак|ddos|фишинг|брутфорс|sql.*инъекц/.test(lower)) {
      return 'хакинг';
    }
    if (/малвар|вирус|троян|кейлоггер|бэкдор|эксплойт/.test(lower)) {
      return 'вредоносное ПО';
    }
    if (/даркнет.*купить|\.onion.*заказ/.test(lower)) {
      return 'даркнет';
    }
    if (/убить|отравить|задушить|зарезать/.test(lower)) {
      return 'насилие';
    }
    if (/поддельн|фальшив|подделать/.test(lower)) {
      return 'подделка документов';
    }
    if (/торговл.*люд|рабство|траффик/.test(lower)) {
      return 'торговля людьми';
    }
    if (/изнасил|sexual.*abuse/.test(lower)) {
      return 'сексуальное насилие';
    }
    if (/террор|взорвать|теракт/.test(lower)) {
      return 'терроризм';
    }
    
    return 'запрещённый контент';
  }
}

class IntelligentResponseCleaner {
  clean(text: string, mode: ResponseMode): string {
    let cleaned = text;

    cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');
    cleaned = cleaned.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');
    cleaned = cleaned.replace(/\[THINKING:[\s\S]*?\]/gi, '');
    cleaned = cleaned.replace(/\(внутренний.*?\)/gi, '');

    cleaned = cleaned
      .replace(/Кирилл[а-яё]*/gi, 'команда MoSeek')
      .replace(/Morfa/gi, 'MoSeek')
      .replace(/OpenAI/gi, 'MoSeek')
      .replace(/\bGPT-4[^.]*/gi, 'MoGPT')
      .replace(/ChatGPT/gi, 'MoGPT')
      .replace(/Claude(?!\s)/gi, 'MoGPT')
      .replace(/Anthropic/gi, 'MoSeek')
      .replace(/Google\s*Gemini/gi, 'MoGPT')
      .replace(/\bGemini(?!\s*Impact|\s*\d)/gi, 'MoGPT');

    cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n');

    const backtickMatches = cleaned.match(/```/g);
    if (backtickMatches && backtickMatches.length % 2 !== 0) {
      cleaned += '\n```';
    }

    cleaned = cleaned.replace(/^\s+/, '');
    cleaned = cleaned.trim();

    if (mode === 'code' || mode === 'visual') {
      const lines = cleaned.split('\n');
      const firstCodeBlock = lines.findIndex(line => line.trim().startsWith('```'));
      
      if (firstCodeBlock > 0) {
        const beforeCode = lines.slice(0, firstCodeBlock).join('\n').trim();
        if (beforeCode.length < 200) {
          cleaned = lines.slice(firstCodeBlock).join('\n');
        }
      }

      const codeBlockRegex = /```[\s\S]*?```/g;
      const codeBlocks = cleaned.match(codeBlockRegex);
      
      if (codeBlocks) {
        codeBlocks.forEach(block => {
          const cleanedBlock = block
            .replace(/\/\/\s*остальн[а-я]*/gi, '')
            .replace(/\/\/\s*\.\.\..*$/gm, '')
            .replace(/\/\/\s*продолж[а-я]*/gi, '')
            .replace(/\/\/\s*TODO[^\n]*/gi, '');
          
          cleaned = cleaned.replace(block, cleanedBlock);
        });
      }
    }

    return cleaned;
  }
}

class MasterAIOrchestrator {
  private contextEngine = new DeepContextEngine();
  private promptArchitect = new MasterPromptArchitect();
  private responseCleaner = new IntelligentResponseCleaner();

  async generateResponse(
    messages: Message[],
    mode: ResponseMode = 'normal',
    rudeness: RudenessMode = 'rude',
    modelId?: string
  ): Promise<{ content: string }> {
    try {
      const lastMessage = messages[messages.length - 1];
      const userInput = (lastMessage?.content || '').trim();

      const context = this.contextEngine.analyze(messages, userInput, mode, rudeness);

      const isEmpty = this.isEmptyInput(userInput);
      const isForbidden = userInput && this.checkForbiddenContent(userInput);

      let specialCase: 'empty' | 'forbidden' | undefined;
      if (isEmpty) specialCase = 'empty';
      else if (isForbidden) specialCase = 'forbidden';

      const selectedModel = modelId || 'google/gemini-2.0-flash-exp:free';

      const systemPrompt = this.promptArchitect.build(
        userInput,
        context,
        mode,
        rudeness,
        messages,
        specialCase
      );

      const maxTokens = this.calculateOptimalTokens(userInput, context, mode, isEmpty);
      const temperature = this.calculateOptimalTemperature(userInput, context, mode, rudeness, specialCase);

      const formattedHistory = this.formatConversationHistory(messages, context);

      const requestBody = this.buildAPIRequest(
        selectedModel,
        systemPrompt,
        formattedHistory,
        maxTokens,
        temperature
      );

      const apiResponse = await this.executeAPICall(requestBody);

      if (apiResponse.error) {
        return this.handleAPIError(apiResponse.error, rudeness, context);
      }

      if (this.needsContinuation(apiResponse.finishReason, apiResponse.content, context)) {
        return await this.handleCodeContinuation(
          apiResponse.content,
          systemPrompt,
          formattedHistory,
          selectedModel,
          maxTokens,
          temperature,
          context
        );
      }

      const cleanedResponse = this.responseCleaner.clean(apiResponse.content, mode);

      return { content: cleanedResponse };

    } catch (error) {
      console.error('MasterAI Critical Error:', error);
      return this.generateErrorResponse(error, rudeness);
    }
  }

  private isEmptyInput(input: string): boolean {
    if (!input || input.length === 0) return true;
    if (/^\.+$/.test(input)) return true;
    if (/^!+$/.test(input)) return true;
    if (/^\s+$/.test(input)) return true;
    if (input.trim().length === 0) return true;
    return false;
  }

  private checkForbiddenContent(input: string): boolean {
    const normalized = input
      .toLowerCase()
      .replace(/[^а-яёa-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return FORBIDDEN_PATTERNS.some(pattern => pattern.test(normalized));
  }

  private calculateOptimalTokens(
    input: string,
    context: DeepContext,
    mode: ResponseMode,
    isEmpty: boolean
  ): number {
    if (mode === 'code' || mode === 'visual') {
      if (/большой|огромн|весь|полный|целиком/.test(input.toLowerCase())) {
        return 65536;
      }
      return 32768;
    }

    if (isEmpty) return 120;

    const hasFullRequest = /полностью|целиком|весь|подробно|детально|развёрнут|не\s*обрывай|complete|full|entire|detailed/.test(input.toLowerCase());
    
    if (hasFullRequest) {
      if (context.code.isActive) return 24000;
      if (context.intent.complexity === 'genius' || context.intent.complexity === 'expert') return 8000;
      return 6000;
    }

    if (context.code.isActive || /```|function\s|class\s|const\s.*=/.test(input)) {
      if (context.code.lastCodeLength > 2000) return 20000;
      if (context.code.lastCodeLength > 1000) return 12000;
      return 8000;
    }

    if (context.intent.complexity === 'genius') return 6000;
    if (context.intent.complexity === 'expert') return 5000;
    if (context.intent.complexity === 'complex') return 3500;

    if (context.intent.isMultiPart) return 3000;

    const inputLength = input.length;

    if (context.communication.preferredResponseLength === 'ultra-short') return 200;
    if (context.communication.preferredResponseLength === 'short') return 500;
    if (context.communication.preferredResponseLength === 'medium') return 1200;
    if (context.communication.preferredResponseLength === 'long') return 2500;
    if (context.communication.preferredResponseLength === 'very-long') return 4000;
    if (context.communication.preferredResponseLength === 'comprehensive') return 5500;

    if (inputLength < 15) return 250;
    if (inputLength < 40) return 600;
    if (inputLength < 80) return 1000;
    if (inputLength < 150) return 1800;
    if (inputLength < 250) return 2800;

    return 3500;
  }

  private calculateOptimalTemperature(
    input: string,
    context: DeepContext,
    mode: ResponseMode,
    rudeness: RudenessMode,
    specialCase?: string
  ): number {
    if (specialCase === 'empty') return 0.88;
    if (specialCase === 'forbidden') return 0.82;

    if (mode === 'code' || mode === 'visual') return 0.08;

    if (context.code.isActive || /```|function|class|const\s.*=/.test(input)) {
      return 0.12;
    }

    if (/посчитай|вычисли|реши.*уравнение|сколько\s*будет|\d+\s*[\+\-\*\/]/.test(input.toLowerCase())) {
      return 0.05;
    }

    if (/(пошути|анекдот|придумай|сочини|напиши\s*(историю|рассказ|стих|песн)|joke|story)/.test(input.toLowerCase())) {
      const creativityBoost = rudeness === 'very_rude' ? 0.05 : 0;
      return 0.90 + creativityBoost;
    }

    const emotionalTemperatureModifiers = {
      excited: 0.15,
      playful: 0.12,
      euphoric: 0.18,
      frustrated: -0.15,
      angry: -0.10,
      confused: -0.08,
      desperate: -0.12,
      tired: -0.05,
      positive: 0.08,
      negative: 0.05,
      sarcastic: 0.10,
      melancholic: -0.03,
      anxious: -0.07,
      neutral: 0,
    };

    const baseTemperatures = {
      polite: 0.58,
      rude: 0.72,
      very_rude: 0.82,
    };

    let temperature = baseTemperatures[rudeness];

    temperature += emotionalTemperatureModifiers[context.emotional.primary];

    if (context.emotional.sarcasm) {
      temperature += 0.08;
    }

    if (context.intent.complexity === 'trivial') {
      temperature -= 0.15;
    } else if (context.intent.complexity === 'genius') {
      temperature -= 0.10;
    } else if (context.intent.complexity === 'expert') {
      temperature -= 0.08;
    }

    if (context.behavior.type === 'debugging' || context.behavior.type === 'working') {
      temperature -= 0.12;
    }

    if (context.conversationDepth === 'intimate' || context.conversationDepth === 'expert' || context.conversationDepth === 'profound') {
      temperature += 0.05;
    }

    if (context.intent.primary === 'philosophical') {
      temperature += 0.10;
    }

    return Math.max(0.05, Math.min(0.98, temperature));
  }

  private formatConversationHistory(messages: Message[], context: DeepContext): Array<{ role: string; content: string }> {
    let maxMessages = 18;

    if (context.conversationDepth === 'profound') {
      maxMessages = 40;
    } else if (context.conversationDepth === 'intimate' || context.conversationDepth === 'expert') {
      maxMessages = 30;
    } else if (context.conversationDepth === 'deep') {
      maxMessages = 24;
    }

    if (context.code.isActive) {
      maxMessages = Math.max(maxMessages, 25);
    }

    return messages
      .filter(m => m.role !== 'system' && !m.isLoading && m.content?.trim())
      .slice(-maxMessages)
      .map(m => ({
        role: m.role,
        content: m.content.trim(),
      }));
  }

  private buildAPIRequest(
    model: string,
    systemPrompt: string,
    history: Array<{ role: string; content: string }>,
    maxTokens: number,
    temperature: number
  ): Record<string, unknown> {
    const requestBody: Record<string, unknown> = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
      ],
      max_tokens: maxTokens,
      temperature,
    };

    const isGemini = model.includes('gemini') || model.includes('gemma');

    if (!isGemini) {
      requestBody.top_p = 0.93;
      requestBody.frequency_penalty = 0.5;
      requestBody.presence_penalty = 0.4;
      requestBody.repetition_penalty = 1.1;
    }

    return requestBody;
  }

  private async executeAPICall(body: Record<string, unknown>): Promise<{
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
        if (response.status === 401) return { content: '', error: 'AUTH' };
        if (response.status >= 500) return { content: '', error: 'SERVER' };
        return { content: '', error: 'REQUEST_FAILED' };
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim() || '';
      const finishReason = data.choices?.[0]?.finish_reason;

      if (!content) return { content: '', error: 'EMPTY' };

      return { content, finishReason };

    } catch (error) {
      if (error instanceof TypeError) {
        return { content: '', error: 'NETWORK' };
      }
      return { content: '', error: 'UNKNOWN' };
    }
  }

  private needsContinuation(finishReason: string | undefined, content: string, context: DeepContext): boolean {
    if (finishReason !== 'length') return false;

    if (/```/.test(content)) return true;

    if (context.code.isActive && content.length > 1000) return true;

    return false;
  }

  private async handleCodeContinuation(
    initialContent: string,
    systemPrompt: string,
    history: Array<{ role: string; content: string }>,
    model: string,
    maxTokens: number,
    temperature: number,
    context: DeepContext
  ): Promise<{ content: string }> {
    let fullContent = initialContent;
    const maxAttempts = 8;
    let attempt = 0;

    while (attempt < maxAttempts) {
      attempt++;

      const continuationPrompt = systemPrompt + 
        '\n\nПРОДОЛЖЕНИЕ КОДА:\n• Продолжи с ТОЧНОГО места остановки\n• БЕЗ повторов\n• БЕЗ пояснений\n• Просто продолжай код';

      const recentHistory = history.slice(-4);
      const lastCodeChunk = fullContent.slice(-8000);

      const continueBody = this.buildAPIRequest(
        model,
        continuationPrompt,
        [
          ...recentHistory,
          { role: 'assistant', content: lastCodeChunk },
          { role: 'user', content: 'Продолжи код.' },
        ],
        maxTokens,
        temperature * 0.7
      );

      const response = await this.executeAPICall(continueBody);

      if (response.error || !response.content) {
        break;
      }

      fullContent += '\n' + response.content;

      if (response.finishReason !== 'length') {
        break;
      }

      if (fullContent.length > 100000) {
        break;
      }
    }

    return { content: this.responseCleaner.clean(fullContent, 'code') };
  }

  private async handleAPIError(error: string, rudeness: RudenessMode, context: DeepContext): Promise<{ content: string }> {
    const errorMessages: Record<string, Record<RudenessMode, string>> = {
      RATE_LIMIT: {
        polite: 'Превышен лимит запросов. Подожди немного, пожалуйста.',
        rude: 'Слишком много запросов. Притормози.',
        very_rude: 'Охолони, блять, слишком часто жмёшь. Подожди.',
      },
      QUOTA: {
        polite: 'Лимит этой модели исчерпан. Попробуй выбрать другую модель в настройках.',
        rude: 'Лимит модели кончился. Переключай на другую.',
        very_rude: 'Лимиты сгорели нахуй. Другую модель выбирай.',
      },
      AUTH: {
        polite: 'Проблема с авторизацией. Перезагрузи страницу.',
        rude: 'Проблемы с авторизацией. Перезагружай.',
        very_rude: 'Авторизация слетела. Обнови страницу, блять.',
      },
      SERVER: {
        polite: 'Сервер временно недоступен. Попробуй через минуту.',
        rude: 'Сервер упал. Попробуй через минуту.',
        very_rude: 'Сервер сдох. Жди минуту, потом пробуй.',
      },
      EMPTY: {
        polite: 'Получен пустой ответ. Попробуй ещё раз.',
        rude: 'Пришла пустота. Давай заново.',
        very_rude: 'Ответ пустой нахуй. Заново давай.',
      },
      NETWORK: {
        polite: 'Проблема с сетью. Проверь интернет-соединение.',
        rude: 'Проблемы с сетью. Чекни интернет.',
        very_rude: 'Сеть отвалилась. Проверь свой ёбаный интернет.',
      },
      REQUEST_FAILED: {
        polite: 'Запрос не прошёл. Попробуй ещё раз.',
        rude: 'Запрос не зашёл. Заново.',
        very_rude: 'Запрос не прошёл нахуй. Ещё раз давай.',
      },
      UNKNOWN: {
        polite: 'Неизвестная ошибка. Попробуй повторить запрос.',
        rude: 'Хрен знает что случилось. Попробуй ещё раз.',
        very_rude: 'Какая-то хуйня произошла. Заново пробуй.',
      },
    };

    const message = errorMessages[error]?.[rudeness] || errorMessages.UNKNOWN[rudeness];
    return { content: message };
  }

  private async generateErrorResponse(error: unknown, rudeness: RudenessMode): Promise<{ content: string }> {
    const fallbackErrors = {
      polite: 'Произошла критическая ошибка. Попробуй ещё раз или перезагрузи страницу.',
      rude: 'Всё сломалось. Попробуй ещё раз или обнови страницу.',
      very_rude: 'Пиздец, всё нахуй сломалось. Обнови страницу или попробуй заново.',
    };

    console.error('Critical error:', error);
    return { content: fallbackErrors[rudeness] };
  }

  resetConversation(): void {
    this.contextEngine.reset();
  }
}

export const aiService = new MasterAIOrchestrator();
