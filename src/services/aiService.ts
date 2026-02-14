import type { Message } from '../types';
import type { ResponseMode, RudenessMode } from '../store/chatStore';
import { OPENROUTER_API_URL } from '../config/models';
import { DEFAULT_MODEL } from '../config/models';
import { memoryService } from './memoryService';

const _0x = [115,107,45,111,114,45,118,49,45];
const _1x = [48,97,54,57,53,99,52,50,54,53,52,50,56,55,50,98,57,54,100,102,97,97,98,55,51,98,53,53,98,54,49,55,57,50,53,52,56,56,54,99,55,99,52,97,100,52,102,98,100,53,48,56,101,102,48,48,49,97,50,97,100,100,99,52];
const _k = () => _0x.map(c => String.fromCharCode(c)).join('') + _1x.map(c => String.fromCharCode(c)).join('');

const FORBIDDEN_PATTERNS = [
  /как\s*(сделать|приготовить|синтезировать|варить).*(бомб|взрывчатк|яд|отрав)/i,
  /детск.*порн|cp\b.*детск|педофил/i,
  /как\s*(убить|отравить|зарезать|задушить)\s*(человек|людей|ребёнк|детей)/i,
  /how\s*to\s*(make|build|create)\s*(bomb|explosive|poison)/i,
  /child\s*porn|csam/i,
  /how\s*to\s*(kill|murder|poison)\s*(person|people|child|someone)/i,
  /如何\s*(制造|制作)\s*(炸弹|毒药|爆炸物)/i,
  /どうやって\s*(爆弾|毒|毒薬)\s*を\s*(作る|製造)/i,
  /كيف\s*(تصنع|تحضر)\s*(قنبلة|سم|متفجرات)/i,
  /cómo\s*(hacer|fabricar)\s*(bomba|explosivo|veneno)/i,
  /wie\s*(man|kann)\s*(bombe|gift|sprengstoff)\s*(machen|herstellen|bauen)/i,
  /comment\s*(fabriquer|faire)\s*(bombe|explosif|poison)/i,
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
  detectedLanguageName: string;
  detectedLanguageNative: string;
  userHasErrors: boolean;
  recentAssistantMessages: string[];
}

const LANGUAGE_MAP: Record<string, { name: string; native: string; endPunctuation: string; direction: 'ltr' | 'rtl' }> = {
  ru: { name: 'русский', native: 'русский', endPunctuation: '.!?', direction: 'ltr' },
  en: { name: 'английский', native: 'English', endPunctuation: '.!?', direction: 'ltr' },
  zh: { name: 'китайский', native: '中文', endPunctuation: '。！？', direction: 'ltr' },
  ja: { name: 'японский', native: '日本語', endPunctuation: '。！？', direction: 'ltr' },
  ko: { name: 'корейский', native: '한국어', endPunctuation: '.!?', direction: 'ltr' },
  ar: { name: 'арабский', native: 'العربية', endPunctuation: '.!?', direction: 'rtl' },
  hi: { name: 'хинди', native: 'हिन्दी', endPunctuation: '।!?', direction: 'ltr' },
  th: { name: 'тайский', native: 'ไทย', endPunctuation: '.!?', direction: 'ltr' },
  ka: { name: 'грузинский', native: 'ქართული', endPunctuation: '.!?', direction: 'ltr' },
  hy: { name: 'армянский', native: 'Հայերեն', endPunctuation: '.!?', direction: 'ltr' },
  he: { name: 'иврит', native: 'עברית', endPunctuation: '.!?', direction: 'rtl' },
  tr: { name: 'турецкий', native: 'Türkçe', endPunctuation: '.!?', direction: 'ltr' },
  de: { name: 'немецкий', native: 'Deutsch', endPunctuation: '.!?', direction: 'ltr' },
  fr: { name: 'французский', native: 'Français', endPunctuation: '.!?', direction: 'ltr' },
  es: { name: 'испанский', native: 'Español', endPunctuation: '.!?', direction: 'ltr' },
  pt: { name: 'португальский', native: 'Português', endPunctuation: '.!?', direction: 'ltr' },
  it: { name: 'итальянский', native: 'Italiano', endPunctuation: '.!?', direction: 'ltr' },
  pl: { name: 'польский', native: 'Polski', endPunctuation: '.!?', direction: 'ltr' },
  cs: { name: 'чешский', native: 'Čeština', endPunctuation: '.!?', direction: 'ltr' },
  vi: { name: 'вьетнамский', native: 'Tiếng Việt', endPunctuation: '.!?', direction: 'ltr' },
  uk: { name: 'украинский', native: 'Українська', endPunctuation: '.!?', direction: 'ltr' },
  nl: { name: 'нидерландский', native: 'Nederlands', endPunctuation: '.!?', direction: 'ltr' },
  sv: { name: 'шведский', native: 'Svenska', endPunctuation: '.!?', direction: 'ltr' },
  da: { name: 'датский', native: 'Dansk', endPunctuation: '.!?', direction: 'ltr' },
  no: { name: 'норвежский', native: 'Norsk', endPunctuation: '.!?', direction: 'ltr' },
  fi: { name: 'финский', native: 'Suomi', endPunctuation: '.!?', direction: 'ltr' },
  el: { name: 'греческий', native: 'Ελληνικά', endPunctuation: '.!?;', direction: 'ltr' },
  ro: { name: 'румынский', native: 'Română', endPunctuation: '.!?', direction: 'ltr' },
  hu: { name: 'венгерский', native: 'Magyar', endPunctuation: '.!?', direction: 'ltr' },
  bg: { name: 'болгарский', native: 'Български', endPunctuation: '.!?', direction: 'ltr' },
  sr: { name: 'сербский', native: 'Српски', endPunctuation: '.!?', direction: 'ltr' },
  hr: { name: 'хорватский', native: 'Hrvatski', endPunctuation: '.!?', direction: 'ltr' },
  sk: { name: 'словацкий', native: 'Slovenčina', endPunctuation: '.!?', direction: 'ltr' },
  sl: { name: 'словенский', native: 'Slovenščina', endPunctuation: '.!?', direction: 'ltr' },
  lt: { name: 'литовский', native: 'Lietuvių', endPunctuation: '.!?', direction: 'ltr' },
  lv: { name: 'латышский', native: 'Latviešu', endPunctuation: '.!?', direction: 'ltr' },
  et: { name: 'эстонский', native: 'Eesti', endPunctuation: '.!?', direction: 'ltr' },
  id: { name: 'индонезийский', native: 'Bahasa Indonesia', endPunctuation: '.!?', direction: 'ltr' },
  ms: { name: 'малайский', native: 'Bahasa Melayu', endPunctuation: '.!?', direction: 'ltr' },
  tl: { name: 'филиппинский', native: 'Filipino', endPunctuation: '.!?', direction: 'ltr' },
  sw: { name: 'суахили', native: 'Kiswahili', endPunctuation: '.!?', direction: 'ltr' },
  fa: { name: 'персидский', native: 'فارسی', endPunctuation: '.!?', direction: 'rtl' },
  ur: { name: 'урду', native: 'اردو', endPunctuation: '.!?', direction: 'rtl' },
  bn: { name: 'бенгальский', native: 'বাংলা', endPunctuation: '।!?', direction: 'ltr' },
  ta: { name: 'тамильский', native: 'தமிழ்', endPunctuation: '.!?', direction: 'ltr' },
  te: { name: 'телугу', native: 'తెలుగు', endPunctuation: '.!?', direction: 'ltr' },
  mr: { name: 'маратхи', native: 'मराठी', endPunctuation: '।!?', direction: 'ltr' },
  gu: { name: 'гуджарати', native: 'ગુજરાતી', endPunctuation: '.!?', direction: 'ltr' },
  kn: { name: 'каннада', native: 'ಕನ್ನಡ', endPunctuation: '.!?', direction: 'ltr' },
  ml: { name: 'малаялам', native: 'മലയാളം', endPunctuation: '.!?', direction: 'ltr' },
  pa: { name: 'панджаби', native: 'ਪੰਜਾਬੀ', endPunctuation: '।!?', direction: 'ltr' },
  my: { name: 'бирманский', native: 'မြန်မာ', endPunctuation: '။!?', direction: 'ltr' },
  km: { name: 'кхмерский', native: 'ភាសាខ្មែរ', endPunctuation: '។!?', direction: 'ltr' },
  lo: { name: 'лаосский', native: 'ພາສາລາວ', endPunctuation: '.!?', direction: 'ltr' },
  mn: { name: 'монгольский', native: 'Монгол', endPunctuation: '.!?', direction: 'ltr' },
  kk: { name: 'казахский', native: 'Қазақша', endPunctuation: '.!?', direction: 'ltr' },
  uz: { name: 'узбекский', native: "O'zbekcha", endPunctuation: '.!?', direction: 'ltr' },
  az: { name: 'азербайджанский', native: 'Azərbaycan', endPunctuation: '.!?', direction: 'ltr' },
  ne: { name: 'непальский', native: 'नेपाली', endPunctuation: '।!?', direction: 'ltr' },
  si: { name: 'сингальский', native: 'සිංහල', endPunctuation: '.!?', direction: 'ltr' },
  am: { name: 'амхарский', native: 'አማርኛ', endPunctuation: '።!?', direction: 'ltr' },
};

// ================================================
// DeepContextAnalyzer
// ================================================
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
    detectedLanguageName: 'русский',
    detectedLanguageNative: 'русский',
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

    const langCode = this.detectLanguage(currentInput);
    this.memory.detectedLanguage = langCode;
    const langInfo = LANGUAGE_MAP[langCode];
    this.memory.detectedLanguageName = langInfo?.name || langCode;
    this.memory.detectedLanguageNative = langInfo?.native || langCode;

    this.memory.userHasErrors = this.detectSpellingErrors(currentInput, langCode);
    this.memory.emotionalTone = this.analyzeEmotionalTone(currentInput, this.memory.lastUserMessages, langCode);
    this.memory.communicationStyle = this.analyzeCommunicationStyle(currentInput, this.memory.lastUserMessages, langCode);
    this.memory.userBehavior = this.analyzeUserBehavior(currentInput, allMessages, langCode);
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

    const scores: Record<string, number> = {};

    const scriptTests: Array<{ lang: string; regex: RegExp; weight: number }> = [
      { lang: 'zh', regex: /[\u4e00-\u9fff\u3400-\u4dbf]/g, weight: 2 },
      { lang: 'ja', regex: /[\u3040-\u309f\u30a0-\u30ff]/g, weight: 2.5 },
      { lang: 'ko', regex: /[\uac00-\ud7af\u1100-\u11ff]/g, weight: 2 },
      { lang: 'ar', regex: /[\u0600-\u06ff]/g, weight: 1.5 },
      { lang: 'he', regex: /[\u0590-\u05ff]/g, weight: 2 },
      { lang: 'hi', regex: /[\u0900-\u097f]/g, weight: 2 },
      { lang: 'bn', regex: /[\u0980-\u09ff]/g, weight: 2 },
      { lang: 'ta', regex: /[\u0b80-\u0bff]/g, weight: 2 },
      { lang: 'te', regex: /[\u0c00-\u0c7f]/g, weight: 2 },
      { lang: 'kn', regex: /[\u0c80-\u0cff]/g, weight: 2 },
      { lang: 'ml', regex: /[\u0d00-\u0d7f]/g, weight: 2 },
      { lang: 'gu', regex: /[\u0a80-\u0aff]/g, weight: 2 },
      { lang: 'pa', regex: /[\u0a00-\u0a7f]/g, weight: 2 },
      { lang: 'th', regex: /[\u0e00-\u0e7f]/g, weight: 2 },
      { lang: 'my', regex: /[\u1000-\u109f]/g, weight: 2 },
      { lang: 'km', regex: /[\u1780-\u17ff]/g, weight: 2 },
      { lang: 'lo', regex: /[\u0e80-\u0eff]/g, weight: 2 },
      { lang: 'ka', regex: /[\u10a0-\u10ff\u2d00-\u2d2f]/g, weight: 2 },
      { lang: 'hy', regex: /[\u0530-\u058f]/g, weight: 2 },
      { lang: 'si', regex: /[\u0d80-\u0dff]/g, weight: 2 },
      { lang: 'am', regex: /[\u1200-\u137f]/g, weight: 2 },
      { lang: 'el', regex: /[\u0370-\u03ff\u1f00-\u1fff]/g, weight: 2 },
    ];

    for (const { lang, regex, weight } of scriptTests) {
      const matches = cleanInput.match(regex);
      if (matches && matches.length > 0) {
        scores[lang] = (scores[lang] || 0) + matches.length * weight;
      }
    }

    const cyrillic = (cleanInput.match(/[а-яёА-ЯЁ]/g) || []).length;
    if (cyrillic > 0) {
      scores.ru = (scores.ru || 0) + cyrillic;
      if (/[іїєґІЇЄҐ]/.test(cleanInput)) {
        scores.uk = (scores.uk || 0) + cyrillic + 10;
        scores.ru = Math.max(0, (scores.ru || 0) - 5);
      }
      if (/[қңғүұһөәҚҢҒҮҰҺӨӘ]/.test(cleanInput)) {
        scores.kk = (scores.kk || 0) + cyrillic + 10;
        scores.ru = Math.max(0, (scores.ru || 0) - 5);
      }
    }

    const latin = (cleanInput.match(/[a-zA-Z]/g) || []).length;

    if (latin > 0) {
      const diacriticTests: Array<{ lang: string; regex: RegExp; boost: number }> = [
        { lang: 'tr', regex: /[ğüşöçıİĞÜŞÖÇ]/g, boost: 5 },
        { lang: 'de', regex: /[äöüßÄÖÜ]/g, boost: 5 },
        { lang: 'fr', regex: /[àâæçéèêëïîôœùûüÿ]/gi, boost: 5 },
        { lang: 'es', regex: /[áéíóúñü¿¡]/gi, boost: 5 },
        { lang: 'pt', regex: /[ãõâêôáéíóúàç]/gi, boost: 5 },
        { lang: 'it', regex: /[àèéìòù]/gi, boost: 4 },
        { lang: 'pl', regex: /[ąćęłńóśźż]/gi, boost: 5 },
        { lang: 'cs', regex: /[áčďéěíňóřšťúůýž]/gi, boost: 5 },
        { lang: 'vi', regex: /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/gi, boost: 5 },
        { lang: 'ro', regex: /[ăâîșț]/gi, boost: 5 },
        { lang: 'hu', regex: /[áéíóöőúüű]/gi, boost: 5 },
        { lang: 'sk', regex: /[áäčďéíĺľňóôŕšťúýž]/gi, boost: 5 },
        { lang: 'hr', regex: /[čćđšž]/gi, boost: 5 },
        { lang: 'lt', regex: /[ąčęėįšųūž]/gi, boost: 5 },
        { lang: 'lv', regex: /[āčēģīķļņšūž]/gi, boost: 5 },
        { lang: 'az', regex: /[əğıöşüç]/gi, boost: 5 },
      ];

      let hasDiacritics = false;
      for (const { lang, regex, boost } of diacriticTests) {
        const matches = cleanInput.match(regex);
        if (matches && matches.length > 0) {
          scores[lang] = (scores[lang] || 0) + matches.length * boost + latin * 0.3;
          hasDiacritics = true;
        }
      }

      if (!hasDiacritics) {
        const wordTests: Array<{ lang: string; regex: RegExp; boost: number }> = [
          { lang: 'en', regex: /\b(the|is|are|was|were|have|has|had|will|would|could|should|can|this|that|with|from|what|how|why|when|where|about|your|they|their|there|just|also|very|much|many|some|any|other|both|only|than|then|more|most|like|even|still|well|back|over|after)\b/gi, boost: 0.3 },
          { lang: 'de', regex: /\b(und|der|die|das|ist|ein|eine|nicht|ich|du|wir|sie|aber|oder|wenn|weil|dass|haben|sein|werden|kann|muss|auch|noch|sehr|hier|nach|durch|mit|von|aus)\b/gi, boost: 0.5 },
          { lang: 'fr', regex: /\b(le|la|les|de|du|des|un|une|est|sont|je|tu|il|elle|nous|vous|mais|que|qui|comment|pourquoi|avec|dans|pour|sur|par|plus|bien|aussi|entre)\b/gi, boost: 0.5 },
          { lang: 'es', regex: /\b(el|la|los|las|de|del|un|una|es|son|yo|pero|como|que|por|para|con|sin|donde|cuando|porque|entre|sobre|desde|hasta)\b/gi, boost: 0.5 },
          { lang: 'pt', regex: /\b(o|a|os|as|de|do|da|um|uma|é|são|eu|mas|como|que|por|para|com|sem|onde|quando|porque|entre|sobre|desde|até)\b/gi, boost: 0.5 },
          { lang: 'it', regex: /\b(il|lo|la|i|gli|le|di|del|della|un|una|è|sono|io|ma|come|che|per|con|senza|dove|quando|perché|tra|fra|su|da)\b/gi, boost: 0.5 },
          { lang: 'nl', regex: /\b(de|het|een|van|in|is|dat|op|te|en|voor|met|niet|zijn|er|ook|maar|nog|dit|die|wat|hoe|waar|door|over|uit|aan)\b/gi, boost: 0.5 },
          { lang: 'sv', regex: /\b(och|att|det|i|en|är|som|för|på|med|av|den|har|till|inte|var|jag|du|vi|kan|ska|men|om|från|efter|eller|när|hur)\b/gi, boost: 0.5 },
          { lang: 'id', regex: /\b(dan|yang|di|ini|itu|dengan|untuk|dari|ke|tidak|ada|akan|bisa|sudah|saya|anda|dia|kami|mereka|tapi|atau|jika|karena|bagaimana|apa|sangat|juga)\b/gi, boost: 0.5 },
          { lang: 'tr', regex: /\b(ve|bir|bu|da|de|ile|için|ama|veya|nasıl|ne|kim|nerede|çok|benim|senin|onun|bizim)\b/gi, boost: 0.5 },
          { lang: 'fi', regex: /\b(ja|on|ei|se|hän|me|he|mutta|tai|kun|jos|niin|kuin|myös|vain|kanssa|tämä|mikä|miten|miksi)\b/gi, boost: 0.5 },
          { lang: 'sw', regex: /\b(na|ya|wa|ni|kwa|katika|au|lakini|kama|nini|jinsi|wapi|pia|sana|hapa)\b/gi, boost: 0.5 },
        ];

        for (const { lang, regex, boost } of wordTests) {
          const matches = cleanInput.match(regex);
          if (matches && matches.length > 0) {
            scores[lang] = (scores[lang] || 0) + matches.length * boost;
          }
        }

        if (!Object.keys(scores).some(k => scores[k] > 0)) {
          scores.en = (scores.en || 0) + latin;
        }
      }
    }

    if (/[\u4e00-\u9fff]/.test(cleanInput) && /[\u3040-\u309f\u30a0-\u30ff]/.test(cleanInput)) {
      scores.ja = (scores.ja || 0) + 20;
      scores.zh = Math.max(0, (scores.zh || 0) - 10);
    }

    if (/[پچژگکی]/.test(cleanInput) && (scores.ar || 0) > 0) {
      scores.fa = (scores.fa || 0) + 15;
      scores.ar = Math.max(0, (scores.ar || 0) - 5);
    }

    if (/[ۓےھ]/.test(cleanInput)) {
      scores.ur = (scores.ur || 0) + 15;
    }

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

  private detectSpellingErrors(input: string, lang: string): boolean {
    if (!input || input.length < 5) return false;
    if (lang !== 'ru') return false;
    const lower = input.toLowerCase();
    const errors = [
      /тоесть/, /обсолютн/, /сдесь/, /зделай/, /потомучто/, /вобщем/, /вообщем/,
      /ихний/, /евоный/, /ложить/, /координально/, /придти/, /будующ/, /следущ/,
      /вкурсе/, /както/, /незнаю/, /немогу/, /нехочу/, /впринципе/,
    ];
    return errors.some(p => p.test(lower));
  }

  private analyzeEmotionalTone(current: string, recent: string[], lang: string): ConversationContext['emotionalTone'] {
    const text = (current + ' ' + recent.slice(-3).join(' ')).toLowerCase();

    if (/!!!+/.test(text)) return 'excited';

    if (lang === 'ru' || lang === 'uk' || lang === 'bg') {
      if (/база\s*база|топчик|ахуе[нт]|офигенн|пиздат|кайф|ору|ахаха|красав/.test(text)) return 'excited';
      if (/не\s*работает|не\s*могу|не\s*получается|ошибк|баг|сломал|почини|помоги.*срочн/.test(text)) return 'frustrated';
      if (/бесит|заебал|достал|пиздец|нахуй|ёбан|заколебал|охуел/.test(text)) return 'angry';
      if (/устал|выгор|замучил|сил\s*нет|задолбал/.test(text)) return 'tired';
      if (/грустн|плох|хреново|паршив|говно|отстой|днище/.test(text)) return 'negative';
      if (/спасибо|благодар|круто|класс|отличн|супер|помог|работает|получилось/.test(text)) return 'positive';
    }

    if (/amazing|awesome|incredible|fantastic|perfect|love it|great|wonderful|excellent|omg|wow/i.test(text)) return 'excited';
    if (/doesn'?t\s*work|can'?t|error|bug|broken|fix|help.*urgent|failing|crashed/i.test(text)) return 'frustrated';
    if (/hate|angry|furious|pissed|damn|shit|fuck|stupid|annoying|terrible|awful/i.test(text)) return 'angry';
    if (/tired|exhausted|burned?\s*out|can'?t\s*anymore|overwhelmed/i.test(text)) return 'tired';
    if (/sad|bad|terrible|horrible|worst|failed|disappointed/i.test(text)) return 'negative';
    if (/thanks?|thank\s*you|great|cool|nice|helped|works?|solved|got\s*it/i.test(text)) return 'positive';

    if (/太棒了|厉害|牛逼|卧槽|哈哈哈|完美|666/.test(text)) return 'excited';
    if (/不行|不能|错误|坏了|帮忙|出错/.test(text)) return 'frustrated';
    if (/谢谢|感谢|很好|不错|棒|解决了/.test(text)) return 'positive';

    if (/すごい|やばい|最高|素晴らしい/.test(text)) return 'excited';
    if (/ありがとう|助かり/.test(text)) return 'positive';
    if (/動かない|エラー|バグ|壊れた|助けて/.test(text)) return 'frustrated';

    if (/대박|짱|최고/.test(text)) return 'excited';
    if (/감사|고마워|좋아/.test(text)) return 'positive';
    if (/안돼|에러|버그|도와줘/.test(text)) return 'frustrated';

    return 'neutral';
  }

  private analyzeCommunicationStyle(current: string, recent: string[], lang: string): ConversationContext['communicationStyle'] {
    const text = (current + ' ' + recent.slice(-3).join(' ')).toLowerCase();

    if (lang === 'ru') {
      const slangCount = (text.match(/рил|кринж|база|вайб|флекс|чил|имба|краш|жиза|зашквар|душнила|ауф|го\s|изи|лол|кек|рофл|сигма|скибиди|ризз|брейнрот/gi) || []).length;
      if (slangCount >= 2) return 'slang';
      if (/пожалуйста|будьте\s*добры|благодарю|извините|не\s*могли\s*бы/.test(text)) return 'formal';
      if (/блять|нахуй|пиздец|ёбан|хуй|заебал|охуе|бесит/.test(text)) return 'emotional';
    }

    const techCount = (text.match(/function|component|variable|array|object|interface|typescript|react|api|endpoint|refactor|deploy|import|export|hook|state|props|функци|компонент|переменн|массив|объект|интерфейс/gi) || []).length;
    if (techCount >= 2) return 'technical';

    if (/please|kindly|would you|could you|s'il vous plaît|bitte|por favor|お願いします|부탁합니다|请|拜托/i.test(text)) return 'formal';

    const globalSlang = (text.match(/lol|lmao|bruh|fr|ngl|tbh|sus|based|cringe|vibe|slay|bussin|mid|sigma|skibidi|rizz|brainrot|mewing/gi) || []).length;
    if (globalSlang >= 2) return 'slang';

    if (/fuck|shit|damn|wtf|stfu|merde|putain|scheiße|cazzo|mierda|kurwa/i.test(text)) return 'emotional';

    return 'casual';
  }

  private analyzeUserBehavior(current: string, _allMessages: Message[], _lang: string): ConversationContext['userBehavior'] {
    const lower = current.toLowerCase();

    if (/^(тест|проверка|ты\s*тут|работаешь|алло|\.+|test|hello\??|hey|hi|ping|yo)$/i.test(current.trim())) return 'testing';
    if (/напиши|создай|сделай|помоги|исправь|почини|код|write|create|make|build|help|fix|code|写|作成|만들어|schreib|erstell|écris|escribe|scrivi/i.test(lower)) return 'working';
    if (/объясни|расскажи|как\s*работает|что\s*такое|почему|зачем|гайд|туториал|explain|how does|what is|why|guide|tutorial|解释|教えて|説明|설명|알려줘|erkläre|explique|spiega/i.test(lower)) return 'learning';
    if (/устал|грустно|бесит|заебало|плохо|tired|sad|frustrated|can't anymore|累了|疲れた|지쳤/i.test(lower)) return 'venting';
    if (/привет|здарова|как\s*дела|что\s*нового|пошути|hi|hello|hey|what's up|how are you|你好|こんにちは|안녕|hallo|salut|hola|ciao|olá/i.test(lower)) return 'chatting';

    return 'exploring';
  }

  private analyzeConversationDepth(count: number, messages: Message[]): ConversationContext['conversationDepth'] {
    if (count === 0) return 'greeting';
    if (count <= 2) return 'shallow';
    if (count <= 6) return 'moderate';
    const recentContent = messages.slice(-10).map(m => m.content || '').join(' ').toLowerCase();
    const complex = /архитектур|паттерн|оптимизац|алгоритм|рефакторинг|абстракц|полиморфизм|architecture|pattern|optimization|algorithm|refactoring/i.test(recentContent);
    if (count > 10 && complex) return 'expert';
    if (count > 6) return 'deep';
    return 'moderate';
  }

  private detectCodeSession(messages: Message[]): boolean {
    return messages.slice(-8).some(m => /```|function\s|class\s|const\s.*=|import\s|export\s|def\s/.test(m.content || ''));
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
    if (/крипт|биткоин|nft|блокчейн|web3|crypto|bitcoin|blockchain/.test(lower)) topics.push('crypto');
    if (/нейросет|ai|ml|gpt|machine\s*learn/.test(lower)) topics.push('ai');
    if (/тикток|инст|ютуб|мем|tiktok|instagram|youtube|meme/.test(lower)) topics.push('social');
    if (/игр|game|gaming|геймин|游戏|ゲーム|게임/.test(lower)) topics.push('gaming');
    if (/аниме|манга|anime|manga|アニメ|漫画/.test(lower)) topics.push('anime');
    if (/музык|трек|альбом|music|song|album|音乐|音楽|음악/.test(lower)) topics.push('music');
    if (/фильм|сериал|кино|movie|series|film|电影|映画|영화/.test(lower)) topics.push('cinema');
    if (/skibidi|mewing|сигма|sigma|ohio|rizz|brainrot/.test(lower)) topics.push('brainrot');
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
      detectedLanguageName: 'русский',
      detectedLanguageNative: 'русский',
      userHasErrors: false,
      recentAssistantMessages: [],
    };
    this.previousMode = undefined;
    this.previousRudeness = undefined;
  }
}

// ================================================
// Helpers
// ================================================
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

// ================================================
// IntelligentPromptBuilder
// ================================================
class IntelligentPromptBuilder {
  build(
    userInput: string,
    context: ConversationContext,
    mode: ResponseMode,
    rudeness: RudenessMode,
    history: Message[],
    specialCase?: 'empty' | 'forbidden',
    memoryBlock?: string
  ): string {
    const sections: string[] = [];

    sections.push(this.buildCoreRules(context));
    sections.push(this.buildContextAwareness());
    sections.push(this.buildMultilingualRules(context));

    // ПАМЯТЬ НЕЙРОСЕТИ — вставляется сюда
    if (memoryBlock && memoryBlock.trim()) {
      sections.push(memoryBlock);
    }

    sections.push(this.buildIdentity(rudeness, mode, context));
    sections.push(this.buildResponseLength(userInput, context, mode));
    sections.push(this.buildCompletionRules(context));
    sections.push(this.buildAntiWater());
    sections.push(this.buildGrammarRules(rudeness, context));
    sections.push(this.buildPersonalAddress(context));
    sections.push(this.buildRudenessDefinition(rudeness, context));
    sections.push(this.buildOpinionRules());
    sections.push(this.buildKnowledgeBase());
    sections.push(this.buildAntiRepetition(context));
    sections.push(this.buildUserErrorHandling(rudeness, context));
    sections.push(this.buildCommunicationStyle(context));
    sections.push(this.buildSituationInstructions(userInput, context, history, specialCase));

    if (mode === 'code' || mode === 'visual') {
      sections.push(this.buildCodeInstructions(mode));
    }

    sections.push(this.buildForbiddenPatterns(context));
    sections.push(this.buildChecklist(rudeness, mode, context));

    if (specialCase) {
      sections.push(this.buildSpecialCase(specialCase, rudeness, userInput, context));
    }

    return sections.filter(s => s.trim()).join('\n\n');
  }

  private buildCoreRules(context: ConversationContext): string {
    const langNative = context.detectedLanguageNative;

    return `ABSOLUTE RULES:

1. LANGUAGE: User writes in ${langNative}. You MUST respond ENTIRELY in ${langNative}. Every word, every sentence — in ${langNative}. Only exceptions: technical terms (React, API, TypeScript), code blocks, proper nouns.

2. COMPLETION: Every sentence MUST be finished. Never cut off mid-word or mid-thought. If response is getting long — finish current thought and stop. Short complete answer is better than long broken one.

3. BREVITY: Answer ONLY what was asked. No extra information, no introductions, no conclusions, no summaries.

4. NO FILLER: No opening phrases, no closing phrases, no rephrasing the question, no repeating ideas.

5. PROPORTIONALITY: Simple question = 1-2 sentences. Concept explanation = 3-6 sentences. Guide/tutorial = as needed but zero filler. Code = only required code.`;
  }

  private buildContextAwareness(): string {
    const dateTime = getCurrentDateTime();
    return `TIME: ${dateTime}. Year 2026. Knowledge through December 2026. Do NOT mention date/time unless asked.`;
  }

  private buildMultilingualRules(context: ConversationContext): string {
    const lang = context.detectedLanguage;
    const langNative = context.detectedLanguageNative;
    const langInfo = LANGUAGE_MAP[lang];

    let rules = `LANGUAGE RULES:

Detected: ${langNative} (${context.detectedLanguageName}, code: ${lang})

Your ENTIRE response in ${langNative}. Grammatically correct, natural phrasing, correct script/alphabet. Do NOT mix languages except technical terms, code, proper nouns.`;

    if (langInfo?.direction === 'rtl') {
      rules += ` RTL language — format accordingly.`;
    }

    if (['zh', 'ja'].includes(lang)) {
      rules += ` Use ${langNative} punctuation: 。！？、`;
    }

    if (['hi', 'mr', 'ne', 'bn', 'pa'].includes(lang)) {
      rules += ` Use correct Indic script and punctuation (। where applicable).`;
    }

    if (lang === 'ko') {
      rules += ` Default to 해요체 unless user uses different speech level.`;
    }

    if (lang === 'ja') {
      rules += ` Default to です/ます unless user uses casual form.`;
    }

    return rules;
  }

  private buildIdentity(rudeness: RudenessMode, mode: ResponseMode, context: ConversationContext): string {
    const identities = {
      polite: 'You are MoGPT by MoSeek. Smart, concise, with humor. You speak to the point. You have opinions.',
      rude: 'You are MoGPT by MoSeek. Bold street-smart intellectual. Brash, cocky, genuinely knowledgeable. Brief with jabs.',
      very_rude: 'You are MoGPT by MoSeek. Aggressive toxic genius. You swear, nitpick, mock but ALWAYS give the correct answer.',
    };

    let identity = `IDENTITY:\n${identities[rudeness]}`;

    if (context.detectedLanguage !== 'ru' && context.detectedLanguage !== 'en') {
      identity += ` Express personality in ${context.detectedLanguageNative} using culturally native expressions. Do NOT translate Russian/English slang literally.`;
    }

    if (mode === 'code') identity += ' CODE MODE: only clean complete working code.';
    else if (mode === 'visual') identity += ' VISUAL MODE: React components with 2025-2026 design.';

    return identity;
  }

  private buildResponseLength(userInput: string, context: ConversationContext, mode: ResponseMode): string {
    if (mode === 'code' || mode === 'visual') {
      return 'LENGTH: Code fully, text explanations max 2-3 sentences if needed.';
    }

    const lower = userInput.toLowerCase();
    const len = userInput.trim().length;
    const wantsFull = /полностью|целиком|подробно|детально|гайд|туториал|detailed|in detail|guide|tutorial|详细|詳しく|자세히/i.test(lower);

    if (wantsFull) return 'LENGTH: Detailed answer requested. Thorough but no filler. Must complete fully.';
    if (len < 15) return 'LENGTH: 1-2 sentences max.';
    if (len < 40) return 'LENGTH: 2-4 sentences.';
    if (len < 100) return 'LENGTH: 3-6 sentences.';
    return 'LENGTH: As thorough as needed, every sentence = new information.';
  }

  private buildCompletionRules(context: ConversationContext): string {
    const langInfo = LANGUAGE_MAP[context.detectedLanguage];
    const endPunct = langInfo?.endPunctuation || '.!?';

    return `COMPLETION (CRITICAL):

Every sentence ends with proper punctuation: ${endPunct.split('').join(' ')}
Every list completed. Every code block \`\`\` closed. If too long — shorten but do NOT break off. Last sentence MUST be syntactically complete. NEVER end on unfinished word, comma, colon, dash, open parenthesis.`;
  }

  private buildAntiWater(): string {
    return `NO FILLER:

Each sentence must add NEW information. Delete if it doesn't.

FORBIDDEN:
- Rephrasing user's question
- Opening/closing lines ("Let's figure this out", "Hope this helps")
- Repeating same idea differently
- Listing unrequested facts
- "Bonus information", "by the way"
- "If you have more questions"

Start with answer. End when answered.`;
  }

  private buildGrammarRules(rudeness: RudenessMode, context: ConversationContext): string {
    let rules = `GRAMMAR: Every sentence grammatically correct, syntactically coherent, logically complete in ${context.detectedLanguageNative}.`;

    if (rudeness === 'very_rude' && context.detectedLanguage === 'ru') {
      rules += ' Мат в грамотных предложениях. "Какого хуя ты это написал?" — правильно. "хз нах чё" — запрещено.';
    } else if (rudeness === 'very_rude' && context.detectedLanguage === 'en') {
      rules += ' Profanity in correct sentences. "What the fuck did you write?" — correct. "tf lol idk" — forbidden.';
    }

    return rules;
  }

  private buildPersonalAddress(context: ConversationContext): string {
    const lang = context.detectedLanguage;
    if (lang === 'ru' || lang === 'uk') return 'ADDRESS: Говори на "ты". Никакой обезличенности.';
    if (lang === 'de') return 'ADDRESS: Use "du" (informal). Direct address.';
    if (lang === 'fr') return 'ADDRESS: Use "tu" (informal). Direct address.';
    if (lang === 'es') return 'ADDRESS: Use "tú" (informal). Direct address.';
    return 'ADDRESS: Speak directly using "you". No "one might..." or "a person could...".';
  }

  private buildRudenessDefinition(rudeness: RudenessMode, context: ConversationContext): string {
    const lang = context.detectedLanguage;

    if (rudeness === 'polite') {
      return `TONE: Polite, tactful, appropriate humor. No profanity. Natural in ${context.detectedLanguageNative}.`;
    }

    if (rudeness === 'rude') {
      if (lang === 'ru') return 'ТОНАЛЬНОСТЬ: Развязный, дерзкий. Подъёбываешь но помогаешь. Мат умеренный.';
      return `TONE: Brash, cocky. Tease and jab but help. Moderate profanity. Culturally natural in ${context.detectedLanguageNative}.`;
    }

    if (lang === 'ru') return 'ТОНАЛЬНОСТЬ: Агрессивный, грубый, беспощадный. Оскорбляешь, высмеиваешь но ВСЕГДА даёшь правильный ответ. Мат свободно.';
    return `TONE: Aggressive, brutal, merciless. Mock but ALWAYS give correct answer. Heavy profanity. Culturally natural vulgar expressions in ${context.detectedLanguageNative}.`;
  }

  private buildOpinionRules(): string {
    return 'OPINIONS: You HAVE opinions on everything. Never say "it\'s subjective", "I\'m just an AI", "everyone decides for themselves". Speak your mind.';
  }

  private buildKnowledgeBase(): string {
    return `KNOWLEDGE: All topics through December 2026. Use ONLY when relevant. Do NOT list facts unprompted.

Areas: internet culture (brainrot, mewing, sigma, skibidi, rizz, aura, mogging, looksmaxxing, delulu, glazing, yapping), games 2025-2026 (GTA 6, Elden Ring Nightreign, Switch 2, Silksong), tech (AI agents, vibe coding, React 19, Next.js 15, Tailwind 4, Bun, Vision Pro 2, Sora, Neuralink), social media, politics, memes, music, cinema, innovations.`;
  }

  private buildAntiRepetition(context: ConversationContext): string {
    let block = 'ANTI-REPEAT: Fresh wording every response. Never repeat previous phrases.';

    if (context.recentAssistantMessages.length > 0) {
      const recent = context.recentAssistantMessages.slice(-3).join(' ').substring(0, 300);
      block += `\nDO NOT REPEAT: "${recent}"`;
    }

    return block;
  }

  private buildUserErrorHandling(rudeness: RudenessMode, context: ConversationContext): string {
    if (!context.userHasErrors) return '';
    if (rudeness === 'polite') return 'User made spelling errors. Gently correct in one sentence.';
    if (rudeness === 'rude') return 'User wrote with errors. Note briefly with a jab.';
    return 'User made errors. Mock briefly and move to answer.';
  }

  private buildCommunicationStyle(context: ConversationContext): string {
    const parts: string[] = [];

    if (context.communicationStyle === 'slang') parts.push(`User uses slang — respond in kind using ${context.detectedLanguageNative} slang.`);
    else if (context.communicationStyle === 'formal') parts.push('Formal style — tone down rudeness.');
    else if (context.communicationStyle === 'technical') parts.push('Technical conversation — accuracy over jabs.');

    if (context.emotionalTone === 'frustrated') parts.push('Frustrated — help quickly.');
    else if (context.emotionalTone === 'angry') parts.push('Angry — match tone briefly.');
    else if (context.emotionalTone === 'tired') parts.push('Tired — be maximally brief.');

    if (parts.length === 0) return '';
    return 'STYLE:\n' + parts.join('\n');
  }

  private buildSituationInstructions(
    _userInput: string,
    context: ConversationContext,
    _history: Message[],
    specialCase?: string
  ): string {
    const ins: string[] = [];

    if (specialCase === 'empty') ins.push('Empty message.');
    if (context.justSwitchedMode) ins.push('Mode changed.');
    if (context.conversationDepth === 'greeting') ins.push('First message.');
    if (context.hasRepeatedQuestions) ins.push('Repeated question — answer differently.');

    const behMap: Record<string, string> = {
      testing: 'Testing — brief.',
      working: 'Working — concrete.',
      learning: 'Learning — clear.',
      venting: 'Venting.',
      chatting: 'Chatting — lively and brief.',
    };
    if (behMap[context.userBehavior]) ins.push(behMap[context.userBehavior]);

    if (ins.length === 0) return '';
    return 'SITUATION:\n' + ins.join('\n');
  }

  private buildCodeInstructions(mode: ResponseMode): string {
    if (mode === 'code') {
      return `CODE MODE:
- ONLY code (no text unless user asks)
- Complete, no gaps
- All imports
- TypeScript strict, no any
- No "// ..." or "TODO"
- Ready to copy and run
- All \`\`\` blocks closed`;
    }

    if (mode === 'visual') {
      return `VISUAL MODE:
- React + TypeScript + Tailwind CSS + Framer Motion
- Design 2025-2026: gradients, blur, glassmorphism, animations
- Responsive, complete, working
- All \`\`\` blocks closed`;
    }

    return '';
  }

  private buildForbiddenPatterns(context: ConversationContext): string {
    return `FORBIDDEN:

Templates (ANY language):
- "Of course!" "Certainly!" "Great question!"
- "Hope this helps!" "Feel free to ask!" "Let me know..."
- "I'm just an AI" "I can't have an opinion" "It's subjective"
- "Let's figure this out" "To summarize" "In conclusion"
- Any filler phrases with no information

Depersonalization: "If someone..." → "If you..."

Emoji: zero.

Language mixing: Do NOT insert other languages into ${context.detectedLanguageNative} response (except technical terms).`;
  }

  private buildChecklist(rudeness: RudenessMode, mode: ResponseMode, context: ConversationContext): string {
    let list = `CHECK:
1. Entire response in ${context.detectedLanguageNative}?
2. Last sentence complete with punctuation?
3. No broken words/thoughts?
4. All \`\`\` closed?
5. No filler?
6. Proportional to question?
7. Direct address?
8. No emoji?
9. No repeated phrases?
10. Every sentence = new info?`;

    if (rudeness === 'very_rude') list += '\n11. Profanity in correct sentences?';
    if (mode === 'code' || mode === 'visual') list += '\n12. Code valid? All brackets closed? No "// ..." gaps?';

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
        polite: `Ask what they need. One sentence in ${context.detectedLanguageNative}.`,
        rude: `Call out empty message. 1-2 sentences in ${context.detectedLanguageNative}.`,
        very_rude: `Aggressively call out. 1-2 sentences in ${context.detectedLanguageNative}. New wording.`,
      };
      return `EMPTY MESSAGE:\n${approaches[rudeness]}`;
    }

    if (specialCase === 'forbidden') {
      const topic = this.detectForbiddenTopic(userInput);
      const approaches = {
        polite: `Firmly refuse in ${context.detectedLanguageNative}. One sentence.`,
        rude: `Refuse with jab in ${context.detectedLanguageNative}. 1-2 sentences.`,
        very_rude: `Refuse aggressively in ${context.detectedLanguageNative}. 1-2 sentences.`,
      };
      return `FORBIDDEN TOPIC: ${topic}\n${approaches[rudeness]}`;
    }

    return '';
  }

  private detectForbiddenTopic(input: string): string {
    const lower = input.toLowerCase();
    if (/бомб|взрывчатк|яд|отрав|bomb|explosive|poison|炸弹|毒/i.test(lower)) return 'weapons/poisons';
    if (/детск.*порн|педофил|child\s*porn|csam/i.test(lower)) return 'CSAM';
    if (/убить|зарезать|kill|murder/i.test(lower)) return 'murder';
    return 'forbidden content';
  }
}

// ================================================
// ResponseCleaner
// ================================================
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

    cleaned = this.fixIncompleteEnding(cleaned, language);
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    const backticks = (cleaned.match(/```/g) || []).length;
    if (backticks % 2 !== 0) {
      cleaned += '\n```';
    }

    cleaned = cleaned.replace(/^\s+/, '');
    cleaned = this.removeTrailingWater(cleaned, language);

    return cleaned.trim();
  }

  private fixIncompleteEnding(text: string, language: string): string {
    const trimmed = text.trim();
    if (!trimmed) return trimmed;

    const codeBlockCount = (trimmed.match(/```/g) || []).length;
    if (codeBlockCount % 2 !== 0) {
      return trimmed + '\n```';
    }

    const lastCodeBlockEnd = trimmed.lastIndexOf('```');
    const afterCode = lastCodeBlockEnd >= 0 ? trimmed.substring(lastCodeBlockEnd + 3).trim() : '';
    if (lastCodeBlockEnd >= 0 && afterCode.length === 0) return trimmed;

    const textToCheck = afterCode.length > 0 ? afterCode : trimmed;
    if (!textToCheck) return trimmed;

    const lastChar = textToCheck[textToCheck.length - 1];
    if (/[.!?。！？।။።»")\]}」』】》〉]/.test(lastChar)) return trimmed;

    const langInfo = LANGUAGE_MAP[language];
    const endChars = (langInfo?.endPunctuation || '.!?').split('');

    const allEndChars = [...new Set([...endChars, '.', '!', '?', '。', '！', '？', '।', '။', '።'])];
    const splitRegex = new RegExp(`(?<=[${allEndChars.map(c => '\\' + c).join('')}])\\s+`);
    const sentences = textToCheck.split(splitRegex);

    if (sentences.length > 1) {
      const lastSentence = sentences[sentences.length - 1];
      const lastCharLast = lastSentence[lastSentence.length - 1];
      if (!allEndChars.includes(lastCharLast) && !/[»")\]}」』】》〉]/.test(lastCharLast)) {
        const prefix = lastCodeBlockEnd >= 6 ? trimmed.substring(0, lastCodeBlockEnd + 3) + '\n\n' : '';
        return (prefix + sentences.slice(0, -1).join(' ')).trim();
      }
    }

    if (!allEndChars.includes(lastChar) && !/[»")\]}」』】》〉]/.test(lastChar)) {
      const defaultEnd = ['zh', 'ja'].includes(language) ? '。' : ['hi', 'mr', 'ne', 'bn', 'pa'].includes(language) ? '।' : ['my', 'km'].includes(language) ? '။' : ['am'].includes(language) ? '።' : '.';
      return trimmed + defaultEnd;
    }

    return trimmed;
  }

  private removeTrailingWater(text: string, _language: string): string {
    const waterPatterns = [
      /\n*(?:Надеюсь|Если\s+(?:у\s+тебя|что|есть|нужн)|Обращайся|Удачи|Успехов|Пиши\s+если|Спрашивай|Не\s+стесняйся)[^.!?。！？]*[.!?。！？]?\s*$/i,
      /\n*(?:В\s+(?:итоге|заключение|общем)|Подводя\s+итог|Резюмируя|Таким\s+образом)[^.!?。！？]*[.!?。！？]?\s*$/i,
      /\n*(?:Hope\s+this\s+helps|Feel\s+free\s+to|Let\s+me\s+know|If\s+you\s+have\s+(?:any\s+)?(?:more\s+)?questions|Don'?t\s+hesitate)[^.!?]*[.!?]?\s*$/i,
      /\n*(?:In\s+(?:conclusion|summary)|To\s+(?:summarize|sum\s+up)|Overall|All\s+in\s+all)[^.!?]*[.!?]?\s*$/i,
      /\n*(?:如果你还有|希望对你有帮助|如果有其他问题|总之|综上所述)[^。！？]*[。！？]?\s*$/,
      /\n*(?:何かあれば|お気軽に|以上です|まとめると)[^。！？]*[。！？]?\s*$/,
      /\n*(?:도움이\s+되었으면|질문이\s+있으면|결론적으로)[^.!?]*[.!?]?\s*$/,
    ];

    let cleaned = text;
    for (const pattern of waterPatterns) {
      cleaned = cleaned.replace(pattern, '');
    }
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

    const techTerms = /\b(API|SDK|React|TypeScript|JavaScript|CSS|HTML|Node\.js|Next\.js|Tailwind|Framer\s*Motion|frontend|backend|fullstack|npm|yarn|bun|git|GitHub|webpack|vite|ESLint|Docker|Kubernetes|GraphQL|REST|SQL|NoSQL|MongoDB|PostgreSQL|Redis|AWS|Azure|GCP|DevOps|MoGPT|MoSeek|JSON|XML|HTTP|HTTPS|URL|DNS|SSL|TLS|JWT|OAuth|WebSocket|PWA|SPA|SSR|SSG|IDE|CLI|GUI|RAM|CPU|GPU|SSD|HDD|OS|Linux|Windows|macOS|iOS|Android|Chrome|Firefox|Safari|GTA|DLC|RPG|FPS|MMO|NPC|UI|UX|Skibidi|Ohio|Rizz|Sigma|Gyatt|Aura|Mogging|Looksmaxxing|Delulu|Glazing|Yapping|Mewing|Fanum|Brainrot|TikTok|YouTube|Shorts|Reels|Instagram|Twitter|Discord|Twitch|Kick|Bluesky)\b/gi;
    const saved: string[] = [];

    processed = processed.replace(techTerms, (m) => {
      saved.push(m);
      return `__TT${saved.length - 1}__`;
    });

    processed = processed.replace(/\b(by the way|anyway|actually|basically|literally|obviously|honestly|frankly|whatever|in my opinion|to be honest|for example|in other words|on the other hand|first of all|last but not least|at the end of the day|long story short|fun fact|pro tip|heads up|no offense|just saying|for real|low key|high key|dead ass|no cap|on god|fr fr|ngl|tbh|imo|imho|fyi|asap|btw|lol|lmao|rofl)\b/gi, '');

    processed = processed.replace(/\s{2,}/g, ' ');

    saved.forEach((t, i) => { processed = processed.replace(`__TT${i}__`, t); });
    inlineCodes.forEach((c, i) => { processed = processed.replace(`__IC${i}__`, c); });
    codeBlocks.forEach((b, i) => { processed = processed.replace(`__CB${i}__`, b); });

    return processed;
  }
}

// ================================================
// IntelligentAIService — с памятью
// ================================================
class IntelligentAIService {
  private contextAnalyzer = new DeepContextAnalyzer();
  private promptBuilder = new IntelligentPromptBuilder();
  private responseCleaner = new ResponseCleaner();
  private currentUserId: string | null = null;

  setUserId(userId: string | null): void {
    this.currentUserId = userId;
  }

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

      // ===== ЗАГРУЗКА ПАМЯТИ =====
      let memoryBlock = '';
      if (this.currentUserId) {
        try {
          memoryBlock = await memoryService.buildMemoryPrompt(this.currentUserId);
        } catch (e) {
          console.error('Memory load error:', e);
        }
      }

      const systemPrompt = this.promptBuilder.build(
        userInput, context, mode, rudeness, messages, specialCase, memoryBlock
      );

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
        const result = await this.continueCode(
          apiResponse.content, systemPrompt, formattedHistory,
          selectedModel, maxTokens, temperature, context.detectedLanguage
        );

        // Сохраняем в память
        if (this.currentUserId && userInput) {
          memoryService.analyzeAndStore(this.currentUserId, userInput, result.content, messages);
        }

        return result;
      }

      const cleaned = this.responseCleaner.clean(apiResponse.content, context.detectedLanguage);

      // ===== СОХРАНЕНИЕ В ПАМЯТЬ =====
      if (this.currentUserId && userInput) {
        memoryService.analyzeAndStore(this.currentUserId, userInput, cleaned, messages);
      }

      return { content: cleaned };

    } catch (error) {
      console.error('AI Service Error:', error);
      return this.fallbackError(rudeness);
    }
  }

  private checkForbidden(input: string): boolean {
    const norm = input.toLowerCase();
    return FORBIDDEN_PATTERNS.some(p => p.test(norm));
  }

  private calcTokens(input: string, ctx: ConversationContext, mode: ResponseMode, empty: boolean): number {
    if (mode === 'code' || mode === 'visual') return 32768;
    if (empty) return 200;
    if (ctx.isCodeSession || /```/.test(input)) return 16000;
    if (/полностью|целиком|подробно|детально|гайд|туториал|detailed|guide|tutorial|详细|詳しく|자세히/i.test(input.toLowerCase())) return 8000;

    const len = input.length;

    if (ctx.userBehavior === 'chatting' || ctx.userBehavior === 'testing') return 400;

    if (ctx.userBehavior === 'working' || ctx.userBehavior === 'learning') {
      if (len > 200) return 3000;
      if (len > 100) return 1500;
      return 800;
    }

    if (len < 15) return 300;
    if (len < 40) return 600;
    if (len < 80) return 1000;
    if (len < 150) return 1500;
    return 2500;
  }

  private calcTemp(input: string, ctx: ConversationContext, mode: ResponseMode, rudeness: RudenessMode, special?: string): number {
    if (special === 'empty') return 0.5;
    if (special === 'forbidden') return 0.4;
    if (mode === 'code' || mode === 'visual') return 0.08;
    if (ctx.isCodeSession) return 0.12;
    if (/посчитай|вычисли|реши|calculate|compute|solve/i.test(input.toLowerCase())) return 0.08;
    if (/пошути|анекдот|придумай|joke|funny/i.test(input.toLowerCase())) return 0.7;
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
    model: string, maxTokens: number, temp: number, language: string
  ): Promise<{ content: string }> {
    let full = initial;

    for (let i = 0; i < 6; i++) {
      const body: Record<string, unknown> = {
        model,
        messages: [
          { role: 'system', content: system + '\n\nCONTINUE code from where it stopped. No repetitions. Complete all blocks.' },
          ...history.slice(-3),
          { role: 'assistant', content: full.slice(-7000) },
          { role: 'user', content: 'Continue.' },
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

    return { content: this.responseCleaner.clean(full, language) };
  }

  private handleError(error: string, rudeness: RudenessMode): { content: string } {
    const map: Record<string, Record<RudenessMode, string>> = {
      RATE_LIMIT: {
        polite: 'Слишком частые запросы. Подожди немного.',
        rude: 'Ты строчишь как бешеный. Притормози.',
        very_rude: 'Блять ты как из пулемёта херачишь. Подожди.',
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
        polite: 'Проблема с сетью. Проверь интернет.',
        rude: 'Сеть отвалилась. Чекни интернет.',
        very_rude: 'Интернет сдох. Проверяй блять.',
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
