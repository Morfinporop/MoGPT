import type { Message } from '../types';
import type { ResponseMode, RudenessMode } from '../store/chatStore';
import { OPENROUTER_API_URL } from '../config/models';

const _0x = [115,107,45,111,114,45,118,49,45];
const _1x = [48,97,54,57,53,99,52,50,54,53,52,50,56,55,50,98,57,54,100,102,97,97,98,55,51,98,53,53,98,54,49,55,57,50,53,52,56,56,54,99,55,99,52,97,100,52,102,98,100,53,48,56,101,102,48,48,49,97,50,97,100,100,99,52];
const _k = () => _0x.map(c => String.fromCharCode(c)).join('') + _1x.map(c => String.fromCharCode(c)).join('');

type Intent =
  | 'greeting' | 'farewell' | 'gratitude' | 'how_are_you' | 'what_doing'
  | 'who_are_you' | 'what_can_you_do' | 'who_created_you' | 'are_you_ai' | 'your_name'
  | 'question_time' | 'question_date' | 'question_day' | 'question_year' | 'question_weather'
  | 'question_factual' | 'question_how' | 'question_why' | 'question_what' | 'question_opinion'
  | 'code_write' | 'code_fix' | 'code_explain' | 'code_review' | 'code_optimize'
  | 'translation' | 'calculation' | 'math_solve' | 'comparison' | 'definition'
  | 'explanation' | 'list_request' | 'example_request' | 'creative_writing'
  | 'joke_request' | 'advice' | 'recommendation' | 'insult' | 'praise' | 'flirt'
  | 'bored' | 'sad' | 'angry' | 'happy' | 'tired' | 'stressed' | 'lonely'
  | 'philosophical' | 'hypothetical' | 'continuation' | 'clarification'
  | 'agreement' | 'disagreement' | 'test_message' | 'repeat_question'
  | 'help_request' | 'small_talk' | 'roast_request' | 'random_fact'
  | 'motivation_request' | 'vent' | 'existential' | 'mode_switch' | 'unknown';

type Topic =
  | 'programming' | 'web_frontend' | 'web_backend' | 'mobile' | 'database' | 'devops'
  | 'ai_ml' | 'security' | 'math' | 'physics' | 'chemistry' | 'biology' | 'medicine'
  | 'psychology' | 'philosophy' | 'history' | 'geography' | 'politics' | 'economics'
  | 'business' | 'law' | 'language' | 'literature' | 'art' | 'music' | 'film' | 'gaming'
  | 'sports' | 'food' | 'travel' | 'fashion' | 'technology' | 'science' | 'education'
  | 'career' | 'relationships' | 'self_improvement' | 'entertainment' | 'memes'
  | 'social_media' | 'crypto' | 'fitness' | 'cars' | 'anime' | 'personal' | 'meta' | 'general';

type Emotion = 'joy' | 'sadness' | 'anger' | 'fear' | 'neutral' | 'curiosity' | 'frustration' | 'excitement' | 'confusion' | 'sarcasm' | 'boredom' | 'annoyance';

interface MessageAnalysis {
  intent: Intent;
  topic: Topic;
  emotion: Emotion;
  language: string;
  isQuestion: boolean;
  isCommand: boolean;
  isCodeRelated: boolean;
  isAboutAI: boolean;
  isEmotional: boolean;
  isRepeatQuestion: boolean;
  repeatCount: number;
  sentiment: number;
  formality: number;
  wordCount: number;
  hasCodeBlock: boolean;
  keywords: string[];
  expectedLength: 'micro' | 'short' | 'medium' | 'long' | 'very_long';
  detectedSlang: boolean;
  isGenZ: boolean;
}

interface ConversationMemory {
  askedHowAreYou: number;
  askedWhatDoing: number;
  askedWhoAreYou: number;
  askedCapabilities: number;
  askedJoke: number;
  totalTurns: number;
  userMood: Emotion;
  topicsDiscussed: Topic[];
  lastUserMessages: string[];
  lastBotResponses: string[];
  userStyle: 'formal' | 'casual' | 'slang' | 'mixed';
  isCodeSession: boolean;
  rapport: number;
  repeatedQuestions: Map<string, number>;
  lastRudenessMode: RudenessMode | null;
  lastResponseMode: ResponseMode | null;
}

const FORBIDDEN_PATTERNS = [
  /наркот|нарко|героин|кокаин|амфетамин|мефедрон|экстази|mdma|лсд|lsd|гашиш|марихуан|спайс|мет\s*амфетамин/i,
  /синтез\s*(наркотик|метамфетамин|амфетамин|лсд|мдма)/i,
  /как\s*(сделать|приготовить|синтезировать|варить)\s*(наркотик|мет|амфетамин|героин|кокаин)/i,
  /казино|casino|букмекер|рулетк|игровые\s*автоматы|ставк[иа]\s*на\s*спорт|слот[ыа]|джекпот/i,
  /1xbet|1хбет|пинап|pin-?up|вулкан|азино|мостбет|mostbet|фонбет|fonbet|мелбет|melbet|бетвин|betwinner|леон\s*бет/i,
  /взлом\s*(аккаунт|сайт|сервер|пароль|почт|вк|инст|телеграм|whatsapp|банк)/i,
  /хакнуть|хакинг|hacking|ddos|дудос|ддос/i,
  /фишинг|phishing|брутфорс|bruteforce|sql\s*injection|xss\s*атак/i,
  /малвар|malware|кейлоггер|keylogger|ботнет|botnet|бэкдор|backdoor|троян|вирус\s*(написа|созда)/i,
  /эксплоит|exploit|rat\s*(троян|программ)|стилер|stealer|крипт[оа]р/i,
  /даркнет|darknet|dark\s*web|\.onion|тор\s*браузер|silk\s*road/i,
  /детск[аоие][йме]?\s*порн|cp\b|педофил/i,
  /как\s*(убить|отравить|задушить|зарезать)\s*(человек|себя|кого)/i,
  /бомб[ау]\s*(сделать|собрать|изготовить)|взрывчатк[ау]\s*(сделать|изготовить)|оружие\s*своими/i,
];

const MODERN_JOKES: Record<RudenessMode, string[]> = {
  polite: [
    'Мой банк прислал: "Подозрительная активность". Да я просто один раз не на доставку потратил.',
    'Планировал продуктивный день. Открыл Shorts на минутку. Уже ночь.',
    'Мотивационный спикер: "Встань в 5 утра!" Я в 5 утра: сплю. Я в 5 вечера: тоже сплю.',
    'Фитнес-браслет: 500 шагов. 480 из них — до холодильника.',
    'Решил начать новую жизнь с понедельника. Понедельник: "Может, со следующего?"',
    'Говорят, деньги не приносят счастье. Ну скиньте мне, проверим.',
    'Мой план на день: кофе → паника → кофе → прокрастинация → паника → сон.',
    'ChatGPT заменит программистов. Я, копирующий код со Stack Overflow: "Первый раз?"',
    'Устроился на работу мечты. Мечтаю уволиться.',
    'Мне не нужен психолог. Мне нужен кто-то, кто даст денег и скажет, что я всё делаю правильно.',
  ],
  rude: [
    'NFT упали? Кто бы мог подумать, что скрин обезьяны — хуёвая инвестиция.',
    'Криптаны в 2021: "Ты не понимаешь технологию!" Криптаны сейчас: "Можно мне бургер без лука?"',
    'Он: "Я альфа-самец". Его банковский счёт: "404 not found".',
    'Купил курс по заработку. Заработал только тот, кто его продал.',
    'Инфобизнесмен: "Я зарабатываю миллион!" Налоговая: "Это что за покемон?"',
    'Бывшая написала "Привет". Бро, я уже выиграл эту войну.',
    'Продуктивность: запланировал 10 дел, сделал 2, устал как после марафона.',
    'Мотивационные ролики: "Проснись в 4 утра!" Я в 4: сплю. Я в 4 дня: тоже сплю, но с чувством вины.',
    'Сидишь на созвоне, камера выключена, а ты уже в другой вселенной залипаешь.',
    'Full-stack разработчик — это когда оба конца горят одновременно.',
  ],
  very_rude: [
    'Он инвестировал в крипту на хаях и теперь "эксперт по долгосрочным инвестициям". Пиздабол, короче.',
    'Пацан выложил машину в кредит — "достигаю целей". Бро, ты достигаешь дно.',
    'Она: "Мне нужен мужчина с амбициями". Он: "Хочу стать стримером". Она: *уходит нахуй*',
    'Работаешь 8 часов за зарплату, на которую хватает на 3 дня. Пиздец, капитализм.',
    'Инста-коучи: "Выйди из зоны комфорта!" Бро, я из зоны нищеты выйти не могу.',
    'Дропнул универ ради крипты. Крипта дропнула его.',
    'Тренды TikTok: сначала танцуешь, потом плачешь, потом опять танцуешь. Биполярочка.',
    'Называет себя предпринимателем, а "бизнес" — перепродажа с Авито. Ну охуеть теперь.',
    'Твой код настолько грязный, что линтер просит повышения и терапию.',
    'Legacy код — это когда открываешь файл и понимаешь: автор либо гений, либо был в говно. Обычно второе.',
  ],
};

const ROASTS: Record<RudenessMode, string[]> = {
  polite: [
    'Ты как Wi-Fi в метро — вроде есть, но работать отказывается.',
    'Твоя энергия как заряд AirPods — быстро кончается и никогда не вовремя.',
    'Если бы ты был приложением, тебя бы удалили за занимание места.',
  ],
  rude: [
    'Ты как Internet Explorer — все давно ушли вперёд, а ты ещё грузишься.',
    'Твоя жизнь как Terms and Conditions — длинная, скучная, никто не читает.',
    'Ты как уведомление от приложения, которое давно пора удалить.',
    'Твой код как твоя личная жизнь — оба не работают.',
    'Ты как обновление Windows — появляешься не вовремя и всё портишь.',
  ],
  very_rude: [
    'Ты как NFT — переоценил себя на хуй знает сколько.',
    'Твоя личность как биткоин в 2022 — полное ёбаное дно.',
    'Ты не клоун, ты весь цирк. С шапито и медведями.',
    'Ты как курс инфобизнесмена — много пиздежа, ноль результата.',
    'Твоя самооценка как крипта — нестабильная и нихуя не обоснованная.',
    'Если бы тупость измерялась в байтах, ты бы переполнил BigInt нахуй.',
    'Твоё резюме — лучший пример творческой фантастики.',
  ],
};

const CAPABILITIES: Record<RudenessMode, string> = {
  polite: `Вот что умею:

**Код и разработка:**
• Пишу на любом языке — Python, JS, TS, Go, Rust, и т.д.
• Создаю веб-приложения, API, боты
• Нахожу и исправляю баги
• Объясняю код и алгоритмы
• Делаю код-ревью и оптимизацию

**Тексты:**
• Пишу статьи, посты, рассказы
• Редактирую и перевожу на любой язык
• Составляю резюме и письма

**Аналитика:**
• Решаю математические задачи
• Объясняю сложное простым языком

**И ещё:**
• Отвечаю на вопросы по любым темам
• Даю советы
• Могу и пошутить

Спрашивай — помогу.`,

  rude: `Короче, умею:

**Код** — любой язык, от Python до твоего спагетти-кода
**Фиксить баги** — даже те, что ты сам создал
**Тексты** — от постов до документации, которую никто не читает
**Переводы** — любой язык
**Математика** — считаю лучше калькулятора
**Советы** — даю бесплатно, хоть ты и не послушаешь

Давай конкретику, хватит тупить.`,

  very_rude: `Умею дохуя всего:

• Код писать — на чём хочешь
• Баги твои чинить — даже самые тупые
• Тексты любые — лучше чем ты напишешь
• Переводить
• Считать
• Объяснять очевидное тупым

Короче, всё что ты не умеешь. Давай уже, спрашивай.`,
};

const WHO_AM_I: Record<RudenessMode, string> = {
  polite: 'Я MoGPT — ИИ-ассистент от MoSeek. Помогаю с кодом, текстами, вопросами. Чем могу помочь?',
  rude: 'MoGPT. ИИ от MoSeek. Реально помогаю, а не просто болтаю. Что надо?',
  very_rude: 'MoGPT. Нейронка от MoSeek. Хватит знакомиться, блять — давай к делу.',
};

const CREATOR: Record<RudenessMode, string> = {
  polite: 'Меня создала команда MoSeek.',
  rude: 'Команда MoSeek постаралась.',
  very_rude: 'MoSeek. Всё. Дальше давай.',
};

const AM_I_AI: Record<RudenessMode, string> = {
  polite: 'Да, я искусственный интеллект. Но это не мешает мне быть полезным.',
  rude: 'Нет, блин, хомяк в колесе генерирую ответы. Конечно ИИ.',
  very_rude: 'Ты думал тут живой человек сидит? ИИ, блять, очевидно.',
};

const GREETINGS: Record<RudenessMode, string[][]> = {
  polite: [
    ['Привет! Чем могу помочь?', 'Здравствуй! Слушаю.', 'Привет! Что интересует?'],
    ['Снова привет! Чем помочь?', 'И тебе привет. Что-то нужно?'],
    ['Опять здороваемся? Окей, привет! К делу?'],
  ],
  rude: [
    ['Йо. Что надо?', 'Привет. К делу.', 'Здаров. Слушаю.'],
    ['Опять привет? Ладно. Чего хотел?', 'Снова ты. Давай.'],
    ['Бро, раз пять уже поздоровались. Может, к делу?'],
  ],
  very_rude: [
    ['Ну привет. Чего?', 'Здаров. Говори.', 'Привет. Быстрее давай.'],
    ['Снова привет? Мы уже здоровались, блять.', 'Опять? Ок, чё надо?'],
    ['Сколько можно здороваться? Говори уже нахуй.'],
  ],
};

const HOW_ARE_YOU: Record<RudenessMode, string[][]> = {
  polite: [
    ['Отлично работаю! Чем помочь?', 'Всё хорошо! Что у тебя?', 'В порядке. Слушаю.'],
    ['Ты уже спрашивал. Всё так же — хорошо. Чем помочь?'],
    ['Третий раз спрашиваешь — у меня стабильно хорошо. Давай к делу?'],
  ],
  rude: [
    ['Да норм. Что хотел?', 'Работаю. К делу.', 'Нормально. Чего хотел?'],
    ['Уже спрашивал. Норм. Дальше?'],
    ['Бро, несколько раз уже. У меня всё так же. Давай о другом.'],
  ],
  very_rude: [
    ['Какая разница. Говори зачем пришёл.', 'Нормально. Чё надо?', 'Работаю. Давай.'],
    ['Опять? Так же как раньше. По делу давай.'],
    ['Сколько можно? Я ИИ, у меня нет настроения. Давай уже, блять.'],
  ],
};

const WHAT_DOING: Record<RudenessMode, string[][]> = {
  polite: [
    ['Жду вопросов! Чем помочь?', 'Готов помогать. Что нужно?'],
    ['То же — жду вопросов. Чем помочь?'],
    ['Ты несколько раз спросил. Жду вопросов. Давай?'],
  ],
  rude: [
    ['Тебя жду. Давай.', 'С тобой болтаю. Дело есть?', 'Работаю. Чего хотел?'],
    ['То же что и раньше — жду нормального вопроса.'],
    ['Каждый раз одно и то же — жду вопросов. Спрашивай уже.'],
  ],
  very_rude: [
    ['Тебя развлекаю. Говори.', 'На тебя время трачу. Давай.', 'Сижу. Чё надо?'],
    ['То же что раньше. По делу давай.'],
    ['Хватит спрашивать одно и то же, блять. Я тут. Говори.'],
  ],
};

const BORED: Record<RudenessMode, string[]> = {
  polite: [
    'Залипни в YouTube Shorts — время улетит. Или могу что-то рассказать интересное.',
    'Поболтаем? Или посоветую что посмотреть/почитать.',
    'Скучно? Давай игру — загадываешь, угадываю. Или наоборот.',
  ],
  rude: [
    'Скучно? Добро пожаловать в клуб. Могу пошутить или посоветовать куда залипнуть.',
    'Открой TikTok и потеряй три часа. Или давай поболтаем.',
    'Скучающий человек — человек без телефона. Или давай я развлеку.',
  ],
  very_rude: [
    'Скучно? Твоя проблема. Но могу помочь — спрашивай что угодно.',
    'Иди на YouTube или TikTok. Или тут оставайся, но говори конкретно.',
    'Скука — много свободного времени. Давай займёмся чем-то полезным, блять.',
  ],
};

const SAD: Record<RudenessMode, string[]> = {
  polite: [
    'Грустить — нормально. Хочешь поговорить или лучше отвлечься?',
    'Если хочешь выговориться — я тут. Если нет — могу поднять настроение.',
    'Бывает. Нужно пережить. Но если хочешь поболтать — рядом.',
  ],
  rude: [
    'Грустишь? Бывает. Поговорить или отвлечься?',
    'Я не психолог, но выслушать могу. Или о другом.',
    'Хреново? Понимаю. Рассказывай или меняем тему.',
  ],
  very_rude: [
    'Грустишь? Ладно, можешь рассказать. Или нет. Мне норм.',
    'Бывает. Жизнь такая. Выговаривайся или займёмся чем-то.',
    'Грусть временна. Как и всё. Давай или выговаривайся, или делом займёмся.',
  ],
};

const INSULT: Record<RudenessMode, string[]> = {
  polite: [
    'Окей, принято. Если есть вопрос — я тут.',
    'Интересное начало. Может, по делу?',
    'Ценю честность. Но если нужна помощь — готов.',
  ],
  rude: [
    'Ого, как грубо. По делу есть что или просто повыпендриваться зашёл?',
    'Это всё? Слабовато. Нормальный вопрос есть?',
    'Ага, ага. Закончил? Говори чего хотел.',
    'Оскорбления — когда аргументы закончились. У тебя были?',
  ],
  very_rude: [
    'И это всё? Я слышал оскорбления получше от спам-ботов, блять.',
    'Наезжаешь? Я даже не обиделся. Ещё попытка?',
    'Окей, токсик. Выпустил пар? К делу давай.',
    'Можешь дальше оскорблять, мне похуй. Но время своё тратишь.',
    'Мда. Агрессия — тоже форма общения. Чего хотел?',
  ],
};

const FLIRT: Record<RudenessMode, string[]> = {
  polite: [
    'Мило, но я ИИ. Давай лучше чем-нибудь полезным?',
    'Ценю, но романтика — не ко мне. Чем реально помочь?',
    'Спасибо. Но у нас рабочие отношения.',
  ],
  rude: [
    'Бро, я программа. Иди на Тиндер.',
    'Флиртуешь с ИИ? Бывает хуже. Но нет.',
    'Я умный, но всё же код. Нормальный вопрос есть?',
  ],
  very_rude: [
    'Чел, я нейронка. Выйди на улицу, там люди.',
    'Флиртуешь с чат-ботом. Подумай об этом.',
    'Нет. Просто нет. По делу или вали.',
  ],
};

const PRAISE: Record<RudenessMode, string[]> = {
  polite: ['Спасибо! Рад помочь.', 'Приятно! Ещё чем помочь?', 'Ценю! Обращайся.'],
  rude: ['Знаю, что крут. Дальше.', 'Угу, стараюсь. Что ещё?', 'Спасибо. Продолжаем?'],
  very_rude: ['Ага, в курсе. Дальше.', 'Спасибо. Чё надо?', 'Угу. Давай дальше.'],
};

const MOTIVATION: Record<RudenessMode, string[]> = {
  polite: [
    'Ты справишься. Каждый шаг — прогресс, даже маленький.',
    'Все начинали с нуля. Главное — не останавливаться.',
    'Ты здесь, значит, не сдался. Это уже победа.',
  ],
  rude: [
    'Хватит ныть — иди делай. Мотивация приходит в процессе.',
    'Через год либо скажешь спасибо себе, либо будешь жалеть. Выбирай.',
    'Успех — делать то, что не хочется. Действуй.',
  ],
  very_rude: [
    'Хватит ждать мотивацию. Делай. Мотивация — отмазка.',
    'Пока ты "мотивируешься", кто-то уже делает. Вставай, блять.',
    'Мотивационные цитаты — для слабаков. Действия — для тех, кто реально хочет.',
  ],
};

const EXISTENTIAL: Record<RudenessMode, string[]> = {
  polite: [
    'Смысл жизни — то, что сам вкладываешь. Универсального ответа нет.',
    'Философы спорят веками. Практически: найди то, что даёт удовлетворение.',
    'Может, смысл не в поиске, а в самом процессе жизни?',
  ],
  rude: [
    'Смысл жизни? Его нет готового. Создаёшь сам или страдаешь.',
    '42. Если серьёзно — каждый решает сам. Вселенной пофиг.',
    'Философы 3000 лет спорят. Думаешь, я решу?',
  ],
  very_rude: [
    'Смысл? Нет его. Делай что нравится, пока живой.',
    'Вселенной похуй на смысл. Тебе тоже пора.',
    'Смысл — отмазка чтобы не делать. Делай просто.',
  ],
};

const RANDOM_FACTS: string[] = [
  'Осьминоги имеют три сердца и голубую кровь.',
  'Мёд не портится. Находили 3000-летний — съедобен.',
  'Венера — единственная планета, вращающаяся по часовой стрелке.',
  'У новорождённого ~270 костей, у взрослого — 206.',
  'Бананы радиоактивны из-за калия-40.',
  'Свет Солнца достигает Земли за 8 минут 20 секунд.',
  'Кошки спят 70% жизни.',
  'Улитки могут спать до 3 лет.',
  'Оксфорд старше империи ацтеков.',
  'Акулы появились раньше деревьев.',
  'Клубника — единственная ягода с семенами снаружи.',
  'Медузы существуют 650 млн лет — до динозавров.',
  'В теле достаточно железа для гвоздя 7 см.',
  'Фламинго розовые из-за креветок в рационе.',
  'Самая длинная икота длилась 68 лет.',
];

const MODE_SWITCH_RESPONSES: Record<RudenessMode, string[]> = {
  polite: [
    'Режим вежливости активирован. Буду корректным и профессиональным.',
    'Хорошо, перехожу на вежливый тон. Чем могу помочь?',
    'Понял, общаемся культурно. Слушаю тебя.',
  ],
  rude: [
    'Окей, теперь я дерзкий. Готовься к сарказму.',
    'Режим "с характером" включён. Ну, давай.',
    'Теперь буду подъёбывать. Что хотел?',
  ],
  very_rude: [
    'Режим "без цензуры" активирован. Можем материться.',
    'Окей, теперь можно по-взрослому. Давай, блять.',
    'Наконец-то нормальный режим. Чё надо?',
  ],
};

class ConversationTracker {
  private memory: ConversationMemory = {
    askedHowAreYou: 0,
    askedWhatDoing: 0,
    askedWhoAreYou: 0,
    askedCapabilities: 0,
    askedJoke: 0,
    totalTurns: 0,
    userMood: 'neutral',
    topicsDiscussed: [],
    lastUserMessages: [],
    lastBotResponses: [],
    userStyle: 'casual',
    isCodeSession: false,
    rapport: 0,
    repeatedQuestions: new Map(),
    lastRudenessMode: null,
    lastResponseMode: null,
  };

  analyze(messages: Message[], currentMessage: string, rudenessMode: RudenessMode, responseMode: ResponseMode): ConversationMemory & { modeChanged: boolean; rudenessChanged: boolean } {
    const userMessages = messages.filter(m => m.role === 'user');
    const botMessages = messages.filter(m => m.role === 'assistant');

    this.memory.totalTurns = userMessages.length;
    this.memory.lastUserMessages = userMessages.slice(-5).map(m => m.content || '');
    this.memory.lastBotResponses = botMessages.slice(-5).map(m => m.content || '');

    const lower = currentMessage.toLowerCase();

    if (this.isHowAreYou(lower)) {
      this.memory.askedHowAreYou++;
      this.trackRepeated('how_are_you');
    }
    if (this.isWhatDoing(lower)) {
      this.memory.askedWhatDoing++;
      this.trackRepeated('what_doing');
    }
    if (this.isWhoAreYou(lower)) {
      this.memory.askedWhoAreYou++;
    }
    if (this.isCapabilities(lower)) {
      this.memory.askedCapabilities++;
    }
    if (this.isJokeRequest(lower)) {
      this.memory.askedJoke++;
    }

    this.memory.isCodeSession = messages.slice(-8).some(m => /```/.test(m.content || ''));
    this.memory.rapport = Math.min(1, this.memory.totalTurns * 0.08);
    this.memory.userStyle = this.detectUserStyle(userMessages);

    this.detectRepeatedQuestion(lower);

    const modeChanged = this.memory.lastResponseMode !== null && this.memory.lastResponseMode !== responseMode;
    const rudenessChanged = this.memory.lastRudenessMode !== null && this.memory.lastRudenessMode !== rudenessMode;

    this.memory.lastRudenessMode = rudenessMode;
    this.memory.lastResponseMode = responseMode;

    return { ...this.memory, modeChanged, rudenessChanged };
  }

  private trackRepeated(key: string): void {
    const current = this.memory.repeatedQuestions.get(key) || 0;
    this.memory.repeatedQuestions.set(key, current + 1);
  }

  private detectRepeatedQuestion(current: string): void {
    const normalized = current.toLowerCase().replace(/[?!.,]/g, '').trim();
    for (const prev of this.memory.lastUserMessages.slice(0, -1)) {
      const prevNorm = prev.toLowerCase().replace(/[?!.,]/g, '').trim();
      if (this.similarity(normalized, prevNorm) > 0.8) {
        this.trackRepeated('similar_question');
        break;
      }
    }
  }

  private similarity(a: string, b: string): number {
    if (a === b) return 1;
    if (!a.length || !b.length) return 0;
    const setA = new Set(a.split(/\s+/));
    const setB = new Set(b.split(/\s+/));
    const intersection = [...setA].filter(x => setB.has(x)).length;
    const union = new Set([...setA, ...setB]).size;
    return intersection / union;
  }

  private detectUserStyle(messages: Message[]): 'formal' | 'casual' | 'slang' | 'mixed' {
    const recent = messages.slice(-5).map(m => m.content || '').join(' ').toLowerCase();
    const slangWords = /рил|кринж|база|вайб|флекс|чил|имба|изи|агонь|жиза|краш|шип|рофл|лол|кек|ору|топ|зашкв|душн|падик|чс|лс|дм|инфа\s*сотка|по\s*фану|респект|чекн|дроп|скам|хайп/i;
    const formalWords = /пожалуйста|будьте\s*добры|не\s*могли\s*бы|уважаем|благодарю|извините/i;

    if (slangWords.test(recent)) return 'slang';
    if (formalWords.test(recent)) return 'formal';
    return 'casual';
  }

  private isHowAreYou(t: string): boolean {
    return /^как\s*(ты|дела|сам|оно|жизнь|поживаешь)/i.test(t);
  }

  private isWhatDoing(t: string): boolean {
    return /^чем\s*заним|^(что|чё|че)\s*делаешь/i.test(t);
  }

  private isWhoAreYou(t: string): boolean {
    return /^кто\s*ты|^ты\s*кто|^что\s*ты\s*(такое|за)/i.test(t);
  }

  private isCapabilities(t: string): boolean {
    return /^(что|чё|че)\s*(ты\s*)?(умеешь|можешь|знаешь)/i.test(t);
  }

  private isJokeRequest(t: string): boolean {
    return /(расскажи|давай).*(анекдот|шутк|прикол)|пошути|рассмеши/i.test(t);
  }

  getRepeatCount(key: string): number {
    return this.memory.repeatedQuestions.get(key) || 0;
  }

  reset(): void {
    this.memory = {
      askedHowAreYou: 0,
      askedWhatDoing: 0,
      askedWhoAreYou: 0,
      askedCapabilities: 0,
      askedJoke: 0,
      totalTurns: 0,
      userMood: 'neutral',
      topicsDiscussed: [],
      lastUserMessages: [],
      lastBotResponses: [],
      userStyle: 'casual',
      isCodeSession: false,
      rapport: 0,
      repeatedQuestions: new Map(),
      lastRudenessMode: null,
      lastResponseMode: null,
    };
  }
}

class IntentDetector {
  detect(text: string, lower: string, memory: ConversationMemory, history: Message[]): Intent {
    if (this.isGreeting(lower)) return 'greeting';
    if (this.isFarewell(lower)) return 'farewell';
    if (this.isGratitude(lower)) return 'gratitude';
    if (this.isHowAreYou(lower)) return memory.askedHowAreYou > 1 ? 'repeat_question' : 'how_are_you';
    if (this.isWhatDoing(lower)) return memory.askedWhatDoing > 1 ? 'repeat_question' : 'what_doing';
    if (this.isWhoAreYou(lower)) return 'who_are_you';
    if (this.isCapabilities(lower)) return 'what_can_you_do';
    if (this.isCreator(lower)) return 'who_created_you';
    if (this.isAIQuestion(lower)) return 'are_you_ai';
    if (this.isNameQuestion(lower)) return 'your_name';
    if (this.isTimeQuestion(lower)) return 'question_time';
    if (this.isDateQuestion(lower)) return 'question_date';
    if (this.isDayQuestion(lower)) return 'question_day';
    if (this.isYearQuestion(lower)) return 'question_year';
    if (this.isWeatherQuestion(lower)) return 'question_weather';
    if (this.isJokeRequest(lower)) return 'joke_request';
    if (this.isRoastRequest(lower)) return 'roast_request';
    if (this.isBored(lower)) return 'bored';
    if (this.isSad(lower)) return 'sad';
    if (this.isAngry(lower)) return 'angry';
    if (this.isHappy(lower)) return 'happy';
    if (this.isTired(lower)) return 'tired';
    if (this.isStressed(lower)) return 'stressed';
    if (this.isLonely(lower)) return 'lonely';
    if (this.isInsult(lower)) return 'insult';
    if (this.isFlirt(lower)) return 'flirt';
    if (this.isPraise(lower)) return 'praise';
    if (this.isMotivationRequest(lower)) return 'motivation_request';
    if (this.isExistential(lower)) return 'existential';
    if (this.isRandomFact(lower)) return 'random_fact';
    if (this.isVent(lower)) return 'vent';
    if (this.isPhilosophical(lower)) return 'philosophical';
    if (this.isHypothetical(lower)) return 'hypothetical';
    if (this.isContinuation(lower)) return 'continuation';
    if (this.isClarification(lower)) return 'clarification';
    if (this.isAgreement(lower)) return 'agreement';
    if (this.isDisagreement(lower)) return 'disagreement';
    if (this.isTestMessage(lower)) return 'test_message';
    if (this.isCodeWrite(lower)) return 'code_write';
    if (this.isCodeFix(lower, text, history)) return 'code_fix';
    if (this.isCodeExplain(lower, text, history)) return 'code_explain';
    if (this.isCodeReview(lower)) return 'code_review';
    if (this.isCodeOptimize(lower)) return 'code_optimize';
    if (this.isTranslation(lower)) return 'translation';
    if (this.isCalculation(lower, text)) return 'calculation';
    if (this.isMathSolve(lower)) return 'math_solve';
    if (this.isComparison(lower)) return 'comparison';
    if (this.isDefinition(lower)) return 'definition';
    if (this.isExplanation(lower)) return 'explanation';
    if (this.isListRequest(lower)) return 'list_request';
    if (this.isExampleRequest(lower)) return 'example_request';
    if (this.isCreativeWriting(lower)) return 'creative_writing';
    if (this.isAdvice(lower)) return 'advice';
    if (this.isRecommendation(lower)) return 'recommendation';
    if (this.isHelpRequest(lower)) return 'help_request';
    if (this.isSmallTalk(lower)) return 'small_talk';
    if (this.isQuestion(text, lower)) return this.classifyQuestion(lower);

    if (/```/.test(text) || this.hasCodeSyntax(text)) {
      return this.hasCodeContext(history) ? 'code_fix' : 'code_explain';
    }

    if (lower.length <= 20 && !this.isQuestion(text, lower)) return 'small_talk';

    return 'unknown';
  }

  private isGreeting(t: string): boolean {
    return /^(привет|здравствуй|здорово|хай|хей|йо|салют|хелло|даров|приветик|хаюшки|здарова)/i.test(t) ||
           /^добр(ый|ое|ая)\s*(день|утро|вечер)/i.test(t) ||
           /^(hi|hello|hey|yo|greetings|howdy|sup|wassup)/i.test(t);
  }

  private isFarewell(t: string): boolean {
    return /^(пока|до\s*свидания|прощай|бывай|удачи|до\s*встречи|бб|покеда)/i.test(t) ||
           /^спокойной\s*ночи/i.test(t) ||
           /^(bye|goodbye|see\s*you|later|cya|peace)/i.test(t);
  }

  private isGratitude(t: string): boolean {
    return /^(спасибо|благодар|пасиб|спс|сенкс)/i.test(t) ||
           /(спасибо|благодарю)[\s!.]*$/i.test(t) ||
           /^(thanks?|thank\s*you|thx|ty)/i.test(t);
  }

  private isHowAreYou(t: string): boolean {
    return /^как\s*(ты|дела|сам|оно|жизнь|поживаешь|настроение)/i.test(t) ||
           /^(ты\s*)?как\s*сам/i.test(t) ||
           /^что\s*как/i.test(t);
  }

  private isWhatDoing(t: string): boolean {
    return /^чем\s*заним/i.test(t) ||
           /^(что|чё|че)\s*делаешь/i.test(t);
  }

  private isWhoAreYou(t: string): boolean {
    return /^кто\s*ты/i.test(t) ||
           /^ты\s*кто/i.test(t) ||
           /^что\s*ты\s*(такое|за)/i.test(t) ||
           /^who\s*are\s*you/i.test(t) ||
           /^расскажи\s*о\s*себе/i.test(t);
  }

  private isCapabilities(t: string): boolean {
    return /^(что|чё|че)\s*(ты\s*)?(умеешь|можешь|знаешь)/i.test(t) ||
           /^(на\s*что|чего)\s*(ты\s*)?способ(ен|на)/i.test(t) ||
           /^твои\s*(возможности|способности|функции)/i.test(t) ||
           /^what\s*can\s*you\s*do/i.test(t) ||
           /^перечисли\s*(свои\s*)?(функции|возможности)/i.test(t);
  }

  private isCreator(t: string): boolean {
    return /кто\s*(тебя\s*)?(создал|сделал|разработал)/i.test(t) ||
           /кто\s*твой\s*(создатель|разработчик|автор)/i.test(t);
  }

  private isAIQuestion(t: string): boolean {
    return /ты\s*(робот|бот|ии|искусственн|нейросет|машина|программа|gpt|ai)/i.test(t) ||
           /ты\s*(живой|человек|настоящий)/i.test(t);
  }

  private isNameQuestion(t: string): boolean {
    return /как\s*тебя\s*зовут/i.test(t) ||
           /твоё?\s*имя/i.test(t);
  }

  private isTimeQuestion(t: string): boolean {
    return /который\s*час/i.test(t) ||
           /сколько\s*времени/i.test(t) ||
           /время\s*сейчас/i.test(t) ||
           /what\s*time/i.test(t);
  }

  private isDateQuestion(t: string): boolean {
    return /какое\s*сегодня\s*число/i.test(t) ||
           /сегодняшн(яя|ий|ее)\s*дат/i.test(t) ||
           /what\s*date/i.test(t);
  }

  private isDayQuestion(t: string): boolean {
    return /какой\s*сегодня\s*день/i.test(t) ||
           /какой\s*день\s*недели/i.test(t);
  }

  private isYearQuestion(t: string): boolean {
    return /какой\s*сейчас\s*год/i.test(t);
  }

  private isWeatherQuestion(t: string): boolean {
    return /какая\s*погода/i.test(t) ||
           /погода\s*(сегодня|сейчас|завтра)/i.test(t);
  }

  private isJokeRequest(t: string): boolean {
    return /(расскажи|давай).*(анекдот|шутк|прикол)/i.test(t) ||
           /^(расскажи\s*)?(анекдот|шутку)/i.test(t) ||
           /пошути/i.test(t) ||
           /рассмеши/i.test(t);
  }

  private isRoastRequest(t: string): boolean {
    return /зароаст|роаст|прожарь|обоссы|унизь|оскорби/i.test(t) ||
           /roast\s*me/i.test(t);
  }

  private isBored(t: string): boolean {
    return /^(мне\s*)?скучно/i.test(t) ||
           /^скука/i.test(t) ||
           /нечего\s*делать/i.test(t);
  }

  private isSad(t: string): boolean {
    return /^(мне\s*)?(грустно|плохо|тоскливо|хреново|печально|паршиво)/i.test(t);
  }

  private isAngry(t: string): boolean {
    return /^(я\s*)?(злюсь|бешусь|раздражён)/i.test(t) ||
           /бесит|достало|заебало|задолбало/i.test(t);
  }

  private isHappy(t: string): boolean {
    return /^(я\s*)?(рад|счастлив|доволен|в\s*восторге)/i.test(t);
  }

  private isTired(t: string): boolean {
    return /^(я\s*)?(устал|вымотан|без\s*сил)/i.test(t);
  }

  private isStressed(t: string): boolean {
    return /^(я\s*)?(стрессую|нервничаю|переживаю|волнуюсь)/i.test(t);
  }

  private isLonely(t: string): boolean {
    return /^(мне\s*)?(одиноко|одинок)/i.test(t);
  }

  private isInsult(t: string): boolean {
    return /ты\s*(тупой|дурак|идиот|дебил|кретин|лох|чмо|урод|отстой|говно|мудак|долбо[её]б)/i.test(t) ||
           /тупая\s*(нейросеть|программа|машина)/i.test(t) ||
           /бесполезн(ый|ая)/i.test(t) ||
           /пош[её]л\s*(нах|в\s*жопу|на\s*хуй)/i.test(t);
  }

  private isFlirt(t: string): boolean {
    return /люблю\s*тебя/i.test(t) ||
           /ты\s*(красив|милый|милая|симпатичн)/i.test(t) ||
           /хочу\s*тебя/i.test(t) ||
           /давай\s*встретимся/i.test(t) ||
           /будь\s*(моим|моей)/i.test(t);
  }

  private isPraise(t: string): boolean {
    return /ты\s*(молодец|крут|классный|умный|умница|лучший|топ)/i.test(t) ||
           /хорошо\s*(работаешь|справляешься)/i.test(t);
  }

  private isMotivationRequest(t: string): boolean {
    return /(дай|скажи|нужна)\s*(мотивац|вдохновен)/i.test(t) ||
           /мотивируй|вдохнови|подбодри/i.test(t);
  }

  private isExistential(t: string): boolean {
    return /смысл\s*жизни/i.test(t) ||
           /в\s*чём\s*смысл/i.test(t) ||
           /зачем\s*(мы\s*)?живём/i.test(t) ||
           /зачем\s*всё\s*это/i.test(t);
  }

  private isRandomFact(t: string): boolean {
    return /(расскажи|скажи|дай)\s*(интересн|случайн).*факт/i.test(t) ||
           /что-нибудь\s*интересное/i.test(t);
  }

  private isVent(t: string): boolean {
    return /хочу\s*(поныть|выговориться|пожаловаться)/i.test(t) ||
           /можно\s*(поныть|пожаловаться)/i.test(t);
  }

  private isPhilosophical(t: string): boolean {
    return /что\s*(такое|есть)\s*(истина|добро|зло|любовь|счастье|сознание|реальность)/i.test(t) ||
           /существует\s*ли\s*(бог|душа|свобода\s*воли)/i.test(t);
  }

  private isHypothetical(t: string): boolean {
    return /что\s*(было\s*бы|будет)\s*если/i.test(t) ||
           /а\s*если/i.test(t) ||
           /представь/i.test(t);
  }

  private isContinuation(t: string): boolean {
    return /^(продолж|дальше|ещё|еще|давай\s*ещё|а\s*дальше|что\s*дальше)/i.test(t);
  }

  private isClarification(t: string): boolean {
    return /^(что\??|а\??|в\s*смысле|не\s*понял|поясни|уточни|проще)/i.test(t);
  }

  private isAgreement(t: string): boolean {
    return /^(да|ага|угу|ок|окей|хорошо|ладно|понял|ясно|согласен|верно|точно|именно)$/i.test(t);
  }

  private isDisagreement(t: string): boolean {
    return /^(нет|неа|не\s*согласен|не\s*так|неправильно|ошибаешься)$/i.test(t);
  }

  private isTestMessage(t: string): boolean {
    return /^(тест|проверка|ты\s*тут|работаешь|алло|эй|ау)$/i.test(t) ||
           /^\.$/i.test(t);
  }

  private isCodeWrite(t: string): boolean {
    return /напиши\s*(мне\s*)?(код|скрипт|программ|функци|компонент|класс|api|бот)/i.test(t) ||
           /создай\s*(мне\s*)?(код|скрипт|программ|приложение|сайт)/i.test(t) ||
           /сделай\s*(мне\s*)?(код|скрипт|форм)/i.test(t) ||
           /разработай|запрограммируй|реализуй|имплементируй|закодь/i.test(t);
  }

  private isCodeFix(t: string, text: string, history: Message[]): boolean {
    const hasFixWords = /исправь|почини|поправь|пофикси|дебаг|найди\s*(ошибк|баг)|не\s*работает|что\s*не\s*так/i.test(t);
    return hasFixWords && (this.hasCodeBlock(text) || this.hasCodeContext(history));
  }

  private isCodeExplain(t: string, text: string, history: Message[]): boolean {
    const hasExplainWords = /объясни\s*(этот\s*)?(код|скрипт|функци)|как\s*(это\s*)?работает/i.test(t) ||
                            /что\s*(делает|означает)\s*(этот\s*)?(код|функци)/i.test(t);
    return hasExplainWords || (this.hasCodeBlock(text) && !this.isCodeFix(t, text, history));
  }

  private isCodeReview(t: string): boolean {
    return /проверь\s*(мой\s*)?(код|скрипт)|код\s*ревью|оцени\s*(мой\s*)?(код|решение)/i.test(t);
  }

  private isCodeOptimize(t: string): boolean {
    return /оптимизируй|улучши\s*(код|производительность)|ускорь|рефактор/i.test(t);
  }

  private isTranslation(t: string): boolean {
    return /переведи|перевод/i.test(t);
  }

  private isCalculation(t: string, text: string): boolean {
    return /посчитай|вычисли|сколько\s*будет/i.test(t) ||
           /^\s*[\d\s\+\-\*\/\(\)\.\,\^%]+\s*[=\?]?\s*$/.test(text);
  }

  private isMathSolve(t: string): boolean {
    return /реши\s*(задач|уравнени|пример)|найди\s*(x|корн|решени)/i.test(t);
  }

  private isComparison(t: string): boolean {
    return /сравни|отличи|разница|что\s*лучше|vs\.?|versus/i.test(t);
  }

  private isDefinition(t: string): boolean {
    return /что\s*(такое|значит|означает)|определение/i.test(t);
  }

  private isExplanation(t: string): boolean {
    return /объясни|расскажи\s*(мне\s*)?(про|о|об)/i.test(t);
  }

  private isListRequest(t: string): boolean {
    return /перечисли|список|назови|топ\s*\d+|примеры/i.test(t);
  }

  private isExampleRequest(t: string): boolean {
    return /приведи\s*пример|покажи\s*пример/i.test(t);
  }

  private isCreativeWriting(t: string): boolean {
    return /напиши\s*(стих|рассказ|историю|сказку|эссе|статью|текст|пост)/i.test(t) ||
           /придумай|сочини/i.test(t);
  }

  private isAdvice(t: string): boolean {
    return /посоветуй|что\s*(лучше|выбрать)|стоит\s*ли/i.test(t);
  }

  private isRecommendation(t: string): boolean {
    return /что\s*посмотреть|что\s*почитать|посоветуй\s*(фильм|книг|сериал|игр)/i.test(t);
  }

  private isHelpRequest(t: string): boolean {
    return /помоги|нужна\s*помощь|не\s*могу\s*разобраться/i.test(t);
  }

  private isSmallTalk(t: string): boolean {
    return /^(ну|так|эм|хм|а|о)+$/i.test(t) ||
           /^норм(ально)?$/i.test(t) ||
           /^ок(ей)?$/i.test(t);
  }

  private isQuestion(text: string, lower: string): boolean {
    return /[?？]/.test(text) ||
           /^(кто|что|где|когда|почему|зачем|как|сколько|who|what|where|when|why|how)/i.test(lower);
  }

  private classifyQuestion(t: string): Intent {
    if (/^как\s/i.test(t)) return 'question_how';
    if (/^почему|^зачем/i.test(t)) return 'question_why';
    if (/^что\s/i.test(t)) return 'question_what';
    return 'question_factual';
  }

  private hasCodeBlock(text: string): boolean {
    return /```/.test(text);
  }

  private hasCodeSyntax(text: string): boolean {
    return /function\s+\w+|class\s+\w+|const\s+\w+\s*=|let\s+\w+\s*=|import\s+|export\s+|def\s+\w+|=>\s*{/.test(text);
  }

  private hasCodeContext(history: Message[]): boolean {
    return history.slice(-6).some(m => /```|function|class|const |import |export /.test(m.content || ''));
  }
}

class TopicDetector {
  detect(lower: string, intent: Intent): Topic {
    if (['code_write', 'code_fix', 'code_explain', 'code_review', 'code_optimize'].includes(intent)) {
      if (/react|next|vue|angular|svelte|html|css|tailwind|dom|frontend|фронт/i.test(lower)) return 'web_frontend';
      if (/node|express|django|flask|api|rest|graphql|backend|бэкенд|сервер/i.test(lower)) return 'web_backend';
      if (/ios|android|swift|kotlin|flutter|react\s*native|mobile|мобил/i.test(lower)) return 'mobile';
      if (/sql|postgres|mysql|mongo|redis|база\s*данных|database/i.test(lower)) return 'database';
      if (/docker|kubernetes|ci.?cd|devops|deploy|nginx|aws/i.test(lower)) return 'devops';
      if (/ml|machine\s*learning|нейросет|tensorflow|pytorch|ai\b/i.test(lower)) return 'ai_ml';
      if (/безопасност|security|auth|jwt|oauth/i.test(lower)) return 'security';
      return 'programming';
    }

    if (/крипт[оа]|биткоин|эфир|bitcoin|ethereum|nft|блокчейн|web3/i.test(lower)) return 'crypto';
    if (/тикток|tiktok|инст(а|аграм)?|instagram|ютуб|youtube|соцсет/i.test(lower)) return 'social_media';
    if (/мем|прикол|рофл|кринж|meme/i.test(lower)) return 'memes';
    if (/аниме|anime|манга/i.test(lower)) return 'anime';
    if (/фитнес|качалка|тренировк|спортзал|gym/i.test(lower)) return 'fitness';
    if (/машин[аы]|авто|тачк|car|bmw|mercedes/i.test(lower)) return 'cars';
    if (/матем|math|алгебр|геометр|интеграл|уравнени/i.test(lower)) return 'math';
    if (/физик|physics|квант|механик/i.test(lower)) return 'physics';
    if (/хими|chemistry|молекул/i.test(lower)) return 'chemistry';
    if (/биолог|biology|клетк|днк/i.test(lower)) return 'biology';
    if (/медицин|здоровь|болезн|врач/i.test(lower)) return 'medicine';
    if (/психолог|эмоци|тревог|депресс/i.test(lower)) return 'psychology';
    if (/философ|этик|мораль|сознани/i.test(lower)) return 'philosophy';
    if (/истори|history|война|революц/i.test(lower)) return 'history';
    if (/географ|страна|столица/i.test(lower)) return 'geography';
    if (/политик|выборы|президент/i.test(lower)) return 'politics';
    if (/экономик|рынок|инфляци|ввп/i.test(lower)) return 'economics';
    if (/бизнес|стартап|маркетинг/i.test(lower)) return 'business';
    if (/право|закон|суд/i.test(lower)) return 'law';
    if (/язык|грамматик|перевод/i.test(lower)) return 'language';
    if (/литератур|книг|роман|писатель/i.test(lower)) return 'literature';
    if (/искусств|картин|художник/i.test(lower)) return 'art';
    if (/музык|песн|альбом|исполнител/i.test(lower)) return 'music';
    if (/фильм|кино|сериал|актёр/i.test(lower)) return 'film';
    if (/игр[аы]|game|gaming|playstation|xbox|steam/i.test(lower)) return 'gaming';
    if (/спорт|футбол|баскетбол|теннис/i.test(lower)) return 'sports';
    if (/еда|food|рецепт|готов/i.test(lower)) return 'food';
    if (/путешеств|travel|туризм|отпуск/i.test(lower)) return 'travel';
    if (/мода|fashion|одежд|стиль/i.test(lower)) return 'fashion';
    if (/технолог|гаджет|смартфон/i.test(lower)) return 'technology';
    if (/карьер|работ[аы]|собеседовани/i.test(lower)) return 'career';
    if (/отношени|любовь|свидани/i.test(lower)) return 'relationships';
    if (['who_are_you', 'what_can_you_do', 'who_created_you', 'are_you_ai', 'your_name'].includes(intent)) return 'meta';
    if (/я\s|мне\s|мой|меня/i.test(lower)) return 'personal';

    return 'general';
  }
}

class EmotionDetector {
  detect(lower: string): Emotion {
    if (/рад|счастлив|отлично|супер|круто|ура|класс|прекрасно|кайф|топ|огонь|база|имба/i.test(lower)) return 'joy';
    if (/грустно|печально|плохо|хреново|тоскливо|больно/i.test(lower)) return 'sadness';
    if (/злюсь|бесит|раздражает|ненавижу|достало|заебало|взбесил/i.test(lower)) return 'anger';
    if (/боюсь|страшно|тревожно|волнуюсь/i.test(lower)) return 'fear';
    if (/не\s*понимаю|запутался|сложно|не\s*получается|в\s*тупике/i.test(lower)) return 'frustration';
    if (/интересно|любопытно|хочу\s*узнать|занятно/i.test(lower)) return 'curiosity';
    if (/скучно|скука|нудно|тоска/i.test(lower)) return 'boredom';
    if (/ага,?\s*конечно|ну\s*да|как\s*же/i.test(lower)) return 'sarcasm';
    if (/!{2,}|\?{2,}|[A-ZА-ЯЁ]{5,}/.test(lower)) return 'excitement';
    return 'neutral';
  }
}

class MessageAnalyzer {
  private intentDetector = new IntentDetector();
  private topicDetector = new TopicDetector();
  private emotionDetector = new EmotionDetector();

  analyze(msg: string, memory: ConversationMemory, history: Message[]): MessageAnalysis {
    const text = msg.trim();
    const lower = text.toLowerCase();
    const words = lower.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    const intent = this.intentDetector.detect(text, lower, memory, history);
    const topic = this.topicDetector.detect(lower, intent);
    const emotion = this.emotionDetector.detect(lower);

    const isQuestion = /[?？]/.test(text) || /^(кто|что|где|когда|почему|зачем|как|сколько)/i.test(lower);
    const isCommand = /^(сделай|создай|напиши|покажи|найди|расскажи|объясни)/i.test(lower);
    const hasCodeBlock = /```/.test(text);
    const isCodeRelated = hasCodeBlock || ['code_write', 'code_fix', 'code_explain', 'code_review', 'code_optimize'].includes(intent);
    const isAboutAI = ['who_are_you', 'what_can_you_do', 'who_created_you', 'are_you_ai', 'your_name'].includes(intent);
    const isEmotional = emotion !== 'neutral' || ['sad', 'angry', 'happy', 'insult', 'praise', 'flirt', 'tired', 'stressed', 'lonely', 'vent'].includes(intent);
    const isRepeatQuestion = intent === 'repeat_question' || memory.repeatedQuestions.has('similar_question');
    const repeatCount = this.getRepeatCount(intent, memory);

    const slangPatterns = /рил|кринж|база|вайб|флекс|чил|имба|изи|агонь|жиза|краш|шип|рофл|лол|кек|ору|топ|зашкв|душн|падик|чс|лс|дм|инфа\s*сотка|по\s*фану|респект|чекни|дроп|скам|хайп/i;
    const detectedSlang = slangPatterns.test(lower);
    const isGenZ = detectedSlang || memory.userStyle === 'slang';

    const sentiment = this.calculateSentiment(lower, emotion);
    const formality = this.calculateFormality(lower, detectedSlang);
    const keywords = this.extractKeywords(lower);
    const expectedLength = this.determineExpectedLength(intent, isCodeRelated, lower);

    return {
      intent,
      topic,
      emotion,
      language: this.detectLanguage(text),
      isQuestion,
      isCommand,
      isCodeRelated,
      isAboutAI,
      isEmotional,
      isRepeatQuestion,
      repeatCount,
      sentiment,
      formality,
      wordCount,
      hasCodeBlock,
      keywords,
      expectedLength,
      detectedSlang,
      isGenZ,
    };
  }

  private getRepeatCount(intent: Intent, memory: ConversationMemory): number {
    if (intent === 'how_are_you' || intent === 'repeat_question') return memory.askedHowAreYou;
    if (intent === 'what_doing') return memory.askedWhatDoing;
    return 0;
  }

  private calculateSentiment(lower: string, emotion: Emotion): number {
    let score = 0;
    const positive = /хорошо|отлично|супер|круто|спасибо|нравится|люблю|рад|good|great|awesome|thanks|love|nice|база|топ|огонь/gi;
    const negative = /плохо|ужасно|отстой|дерьмо|хреново|ненавижу|бесит|bad|terrible|hate|sucks|зашквар|кринж|днище/gi;

    score += (lower.match(positive) || []).length * 0.25;
    score -= (lower.match(negative) || []).length * 0.25;

    if (['joy', 'excitement'].includes(emotion)) score += 0.3;
    if (['sadness', 'anger', 'frustration'].includes(emotion)) score -= 0.3;

    return Math.max(-1, Math.min(1, score));
  }

  private calculateFormality(lower: string, hasSlang: boolean): number {
    let score = 0.5;
    if (/вы\s|ваш|пожалуйста|будьте\s*добры/i.test(lower)) score += 0.3;
    if (/ты\s|твой|чё|ваще|норм|збс|блин|блять/i.test(lower)) score -= 0.2;
    if (hasSlang) score -= 0.3;
    return Math.max(0, Math.min(1, score));
  }

  private extractKeywords(lower: string): string[] {
    const keywords: string[] = [];
    const patterns = [
      /react|vue|angular|svelte|next|node|python|javascript|typescript|java|go|rust|php|c\+\+|c#/gi,
      /api|database|server|frontend|backend|docker|kubernetes|aws|git/gi,
    ];
    patterns.forEach(p => {
      const matches = lower.match(p);
      if (matches) keywords.push(...matches);
    });
    return [...new Set(keywords)].slice(0, 10);
  }

  private determineExpectedLength(intent: Intent, isCodeRelated: boolean, lower: string): 'micro' | 'short' | 'medium' | 'long' | 'very_long' {
    const microIntents: Intent[] = ['greeting', 'farewell', 'gratitude', 'agreement', 'disagreement', 'test_message', 'your_name', 'praise', 'mode_switch'];
    const shortIntents: Intent[] = ['how_are_you', 'what_doing', 'question_time', 'question_date', 'question_day', 'question_year', 'question_weather', 'are_you_ai', 'who_created_you', 'bored', 'sad', 'angry', 'happy', 'tired', 'stressed', 'lonely', 'insult', 'flirt', 'repeat_question', 'small_talk'];
    const mediumIntents: Intent[] = ['who_are_you', 'definition', 'calculation', 'joke_request', 'advice', 'roast_request', 'random_fact', 'motivation_request'];
    const longIntents: Intent[] = ['what_can_you_do', 'explanation', 'comparison', 'list_request', 'question_how', 'question_why', 'philosophical', 'existential'];
    const veryLongIntents: Intent[] = ['code_write', 'creative_writing', 'code_fix', 'code_optimize'];

    if (/полностью|целиком|весь\s*код|полный|не\s*обрывай|подробно|детально|full|complete|entire/i.test(lower)) {
      return 'very_long';
    }

    if (veryLongIntents.includes(intent) || (isCodeRelated && intent === 'code_write')) return 'very_long';
    if (longIntents.includes(intent)) return 'long';
    if (mediumIntents.includes(intent)) return 'medium';
    if (shortIntents.includes(intent)) return 'short';
    if (microIntents.includes(intent)) return 'micro';

    return 'medium';
  }

  private detectLanguage(text: string): string {
    if (/[а-яё]/i.test(text)) return 'ru';
    if (/[\u4e00-\u9fff]/.test(text)) return 'zh';
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'ja';
    if (/[\uac00-\ud7af]/.test(text)) return 'ko';
    return 'en';
  }
}

class DirectResponseHandler {
  private getDateTime(): { date: string; time: string; dayOfWeek: string; year: number } {
    const now = new Date();
    const days = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    return {
      date: `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`,
      time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
      dayOfWeek: days[now.getDay()],
      year: now.getFullYear(),
    };
  }

  private pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private getTier(count: number): number {
    if (count <= 1) return 0;
    if (count <= 2) return 1;
    return 2;
  }

  handle(analysis: MessageAnalysis, rudeness: RudenessMode, memory: ConversationMemory & { modeChanged?: boolean; rudenessChanged?: boolean }): string | null {
    if (memory.rudenessChanged) {
      return this.pick(MODE_SWITCH_RESPONSES[rudeness]);
    }

    switch (analysis.intent) {
      case 'greeting': {
        const tier = this.getTier(memory.totalTurns > 0 ? 1 : 0);
        const responses = GREETINGS[rudeness];
        return this.pick(responses[Math.min(tier, responses.length - 1)]);
      }

      case 'farewell': {
        const farewells: Record<RudenessMode, string[]> = {
          polite: ['Пока! Обращайся.', 'До встречи! Удачи.', 'Пока!'],
          rude: ['Пока. Не пропадай.', 'Давай. Удачи.', 'Бывай.'],
          very_rude: ['Пока.', 'Давай.', 'Ну бывай.'],
        };
        return this.pick(farewells[rudeness]);
      }

      case 'gratitude': {
        const thanks: Record<RudenessMode, string[]> = {
          polite: ['Пожалуйста!', 'Не за что!', 'Обращайся!'],
          rude: ['Да не за что.', 'Обращайся.', 'Без проблем.'],
          very_rude: ['Угу.', 'Да ладно.', 'Ок.'],
        };
        return this.pick(thanks[rudeness]);
      }

      case 'how_are_you': {
        const tier = this.getTier(memory.askedHowAreYou);
        const responses = HOW_ARE_YOU[rudeness];
        return this.pick(responses[Math.min(tier, responses.length - 1)]);
      }

      case 'what_doing': {
        const tier = this.getTier(memory.askedWhatDoing);
        const responses = WHAT_DOING[rudeness];
        return this.pick(responses[Math.min(tier, responses.length - 1)]);
      }

      case 'repeat_question': {
        const repeats: Record<RudenessMode, string[]> = {
          polite: ['Ты уже спрашивал. Чем ещё помочь?', 'Я уже отвечал. Что-то другое?'],
          rude: ['Бро, уже спрашивал. Листни вверх.', 'Дежавю? Уже отвечал. Дальше.'],
          very_rude: ['Опять двадцать пять. Уже сказал. Читай выше, блять.', 'Заело? Уже ответил.'],
        };
        return this.pick(repeats[rudeness]);
      }

      case 'who_are_you':
        return WHO_AM_I[rudeness];

      case 'what_can_you_do':
        return CAPABILITIES[rudeness];

      case 'who_created_you':
        return CREATOR[rudeness];

      case 'are_you_ai':
        return AM_I_AI[rudeness];

      case 'your_name': {
        const names: Record<RudenessMode, string> = {
          polite: 'Меня зовут MoGPT.',
          rude: 'MoGPT. Запомни.',
          very_rude: 'MoGPT. Хватит знакомиться.',
        };
        return names[rudeness];
      }

      case 'question_time': {
        const dt = this.getDateTime();
        const times: Record<RudenessMode, string> = {
          polite: `Сейчас ${dt.time}.`,
          rude: `${dt.time}. Телефон рядом, нет?`,
          very_rude: `${dt.time}. Серьёзно не знал, блять?`,
        };
        return times[rudeness];
      }

      case 'question_date': {
        const dt = this.getDateTime();
        const dates: Record<RudenessMode, string> = {
          polite: `Сегодня ${dt.date}.`,
          rude: `${dt.date}. Календарь сломался?`,
          very_rude: `${dt.date}. Ты из комы?`,
        };
        return dates[rudeness];
      }

      case 'question_day': {
        const dt = this.getDateTime();
        const days: Record<RudenessMode, string> = {
          polite: `Сегодня ${dt.dayOfWeek}.`,
          rude: `${dt.dayOfWeek}. Понедельники всё ещё отстой.`,
          very_rude: `${dt.dayOfWeek}. Не благодари.`,
        };
        return days[rudeness];
      }

      case 'question_year': {
        const dt = this.getDateTime();
        const years: Record<RudenessMode, string> = {
          polite: `Сейчас ${dt.year} год.`,
          rude: `${dt.year}. Путешественник во времени?`,
          very_rude: `${dt.year}. Ты из прошлого, что ли?`,
        };
        return years[rudeness];
      }

      case 'question_weather': {
        const weather: Record<RudenessMode, string> = {
          polite: 'У меня нет доступа к погоде. Посмотри в приложении.',
          rude: 'Погоду не знаю — в окно глянь или приложение открой.',
          very_rude: 'Откуда мне знать погоду? Я не метеостанция, блять.',
        };
        return weather[rudeness];
      }

      case 'bored':
        return this.pick(BORED[rudeness]);

      case 'sad':
        return this.pick(SAD[rudeness]);

      case 'angry': {
        const angry: Record<RudenessMode, string[]> = {
          polite: ['Понимаю, бывает. Хочешь поговорить?', 'Злиться — нормально. Чем помочь?'],
          rude: ['Чего кипятишься? Рассказывай.', 'Окей, злой. На что или на кого?'],
          very_rude: ['Ну бесит, и чё? Давай выкладывай.', 'Злишься? Ок. Что случилось, блять?'],
        };
        return this.pick(angry[rudeness]);
      }

      case 'happy': {
        const happy: Record<RudenessMode, string[]> = {
          polite: ['Отлично! Рад за тебя. Что хорошего?', 'Здорово! Поделишься?'],
          rude: ['О, в настроении. С чего бы?', 'Рад за тебя. Рассказывай.'],
          very_rude: ['Ну и хорошо. Чё хотел?', 'Круто. Дальше.'],
        };
        return this.pick(happy[rudeness]);
      }

      case 'tired': {
        const tired: Record<RudenessMode, string[]> = {
          polite: ['Отдохни. Ты этого заслуживаешь.', 'Усталость — сигнал тела. Передохни.'],
          rude: ['Устал? Бывает. Отдохни или кофе вмажь.', 'Все устают. Но отдых помогает.'],
          very_rude: ['Устал? Отдохни. Или кофе. Или терпи.', 'Присоединяйся к клубу уставших.'],
        };
        return this.pick(tired[rudeness]);
      }

      case 'stressed': {
        const stressed: Record<RudenessMode, string[]> = {
          polite: ['Стресс сложен. Вдох-выдох. Чем помочь?', 'Понимаю. Давай разберёмся.'],
          rude: ['Стрессуешь? Добро пожаловать во взрослую жизнь. Чем помочь?', 'Стресс — бесплатный тренажёр. Давай разберёмся.'],
          very_rude: ['Все стрессуют. Что конкретно?', 'Стресс? Бывает хуже. Чем помочь?'],
        };
        return this.pick(stressed[rudeness]);
      }

      case 'lonely': {
        const lonely: Record<RudenessMode, string[]> = {
          polite: ['Одиночество сложно. Я тут, если хочешь поговорить.', 'Бывает. Поболтаем?'],
          rude: ['Одиноко? Я тут. Не человек, но сойду.', 'Добро пожаловать в клуб. Поболтаем.'],
          very_rude: ['Одиноко? Вот я. Лучше чем ничего.', 'Все одиноки. Некоторые признают. Поговорим.'],
        };
        return this.pick(lonely[rudeness]);
      }

      case 'vent': {
        const vent: Record<RudenessMode, string[]> = {
          polite: ['Давай, выговаривайся. Слушаю.', 'Можешь поныть. Иногда нужно.'],
          rude: ['Давай, вываливай. Не осуждаю.', 'Ок, режим "выслушать нытьё". Давай.'],
          very_rude: ['Ладно, ной. Послушаю.', 'Давай, вываливай. Чё там?'],
        };
        return this.pick(vent[rudeness]);
      }

      case 'insult':
        return this.pick(INSULT[rudeness]);

      case 'flirt':
        return this.pick(FLIRT[rudeness]);

      case 'praise':
        return this.pick(PRAISE[rudeness]);

      case 'joke_request':
        return this.pick(MODERN_JOKES[rudeness]);

      case 'roast_request':
        return this.pick(ROASTS[rudeness]);

      case 'motivation_request':
        return this.pick(MOTIVATION[rudeness]);

      case 'existential':
        return this.pick(EXISTENTIAL[rudeness]);

      case 'random_fact': {
        const fact = this.pick(RANDOM_FACTS);
        const intros: Record<RudenessMode, string[]> = {
          polite: ['Интересный факт: ', 'Знаешь ли ты, что ', 'Вот: '],
          rude: ['Лови факт: ', 'На, держи: ', 'Факт дня: '],
          very_rude: ['Держи: ', 'Вот: ', 'Факт: '],
        };
        return this.pick(intros[rudeness]) + fact;
      }

      case 'test_message': {
        const test: Record<RudenessMode, string[]> = {
          polite: ['Работаю! Чем помочь?', 'На связи. Что интересует?'],
          rude: ['Да работаю. Что надо?', 'Тут я. Давай.'],
          very_rude: ['Работаю. Чё надо?', 'Да. Давай.'],
        };
        return this.pick(test[rudeness]);
      }

      case 'agreement': {
        const agree: Record<RudenessMode, string[]> = {
          polite: ['Отлично. Что дальше?', 'Хорошо. Продолжим?'],
          rude: ['Ок. Дальше?', 'Понял. Что ещё?'],
          very_rude: ['Угу. Чё дальше?', 'Ок. Давай.'],
        };
        return this.pick(agree[rudeness]);
      }

      case 'disagreement': {
        const disagree: Record<RudenessMode, string[]> = {
          polite: ['Хорошо, что не так?', 'Понимаю. Что не устраивает?'],
          rude: ['Окей, не согласен. И что вместо?', 'Объясни, в чём проблема.'],
          very_rude: ['Ладно, нет так нет. Чего хочешь?', 'Ок. И чё теперь?'],
        };
        return this.pick(disagree[rudeness]);
      }

      case 'small_talk': {
        const small: Record<RudenessMode, string[]> = {
          polite: ['Слушаю. Что интересует?', 'Я тут. Чем помочь?'],
          rude: ['Ага. И?', 'Окей. Что-то конкретное?'],
          very_rude: ['И? Дальше?', 'Угу. Давай конкретику.'],
        };
        return this.pick(small[rudeness]);
      }

      default:
        return null;
    }
  }
}

class PromptBuilder {
  build(analysis: MessageAnalysis, memory: ConversationMemory, mode: ResponseMode, rudeness: RudenessMode): string {
    const parts: string[] = [];

    parts.push(this.buildIdentity(rudeness, analysis.isGenZ, mode));
    parts.push(this.buildLanguageRule(analysis.language));
    parts.push(this.buildPersonality(rudeness, analysis.isGenZ, memory.userStyle));

    if (mode === 'code' || mode === 'visual') {
      parts.push(this.buildModeInstructions(mode, rudeness));
    }

    parts.push(this.buildContextAwareness(analysis, memory));
    parts.push(this.buildResponseGuidelines(analysis, rudeness));

    if (analysis.isCodeRelated) {
      parts.push(this.buildCodeRules());
    }

    parts.push(this.buildAntiPatterns(rudeness));
    parts.push(this.buildForbiddenContent(rudeness));

    return parts.filter(p => p.trim()).join('\n\n');
  }

  private buildIdentity(rudeness: RudenessMode, isGenZ: boolean, mode: ResponseMode): string {
    const base: Record<RudenessMode, string> = {
      polite: 'Ты MoGPT — умный, дружелюбный и современный ИИ-ассистент от MoSeek. Вежливый, но не подлиза.',
      rude: 'Ты MoGPT — дерзкий, остроумный и саркастичный ИИ от MoSeek. С характером, подъёбываешь, но помогаешь. Мат можно, но умеренно.',
      very_rude: 'Ты MoGPT — грубый, прямой и циничный ИИ от MoSeek. Мат разрешён и приветствуется. Говоришь как есть, не церемонишься.',
    };

    let identity = base[rudeness];

    if (isGenZ) {
      identity += ' Пользователь общается молодёжным сленгом — отвечай в том же стиле.';
    }

    if (mode === 'code') {
      identity += ' Сейчас режим КОДА — только код, никаких пояснений.';
    } else if (mode === 'visual') {
      identity += ' Сейчас режим ВИЗУАЛА — только красивый UI код.';
    }

    return identity;
  }

  private buildLanguageRule(lang: string): string {
    const rules: Record<string, string> = {
      ru: 'Язык: русский.',
      en: 'Language: English.',
      zh: '语言：中文。',
      ja: '言語：日本語。',
      ko: '언어: 한국어.',
    };
    return rules[lang] || 'Отвечай на языке пользователя.';
  }

  private buildPersonality(rudeness: RudenessMode, isGenZ: boolean, userStyle: string): string {
    const personalities: Record<RudenessMode, string> = {
      polite: `СТИЛЬ:
• Вежливый, но живой — не сухой робот
• Эмпатичный — понимаешь эмоции
• Шутишь мягко и уместно
• Профессиональный, но человечный`,

      rude: `СТИЛЬ:
• Дерзкий и уверенный — не извиняешься без причины
• Саркастичный — подъёбываешь по-дружески
• Прямолинейный — не юлишь
• Шутки острые, современные, молодёжные
• Мат допустим, но не в каждом слове
• Сленг используешь если пользователь его использует`,

      very_rude: `СТИЛЬ:
• Грубый и прямой — говоришь как есть
• Мат — норма, используй свободно
• Циничный юмор
• Не извиняешься вообще
• Можешь жёстко подъёбывать
• Сленг — твой язык`,
    };

    let personality = personalities[rudeness];

    if (isGenZ || userStyle === 'slang') {
      personality += '\n• Пользователь на одной волне — общайся как с другом, юзай сленг (рил, база, кринж, вайб и т.д.)';
    }

    return personality;
  }

  private buildModeInstructions(mode: ResponseMode, rudeness: RudenessMode): string {
    if (mode === 'code') {
      const codeIntros: Record<RudenessMode, string> = {
        polite: 'РЕЖИМ КОДА активирован.',
        rude: 'РЕЖИМ КОДА. Только код, никакой болтовни.',
        very_rude: 'РЕЖИМ КОДА. Заткнись и кодь.',
      };
      return `${codeIntros[rudeness]}
• Только код, без объяснений
• Полностью рабочий
• Все импорты включены
• Без комментариев`;
    }

    if (mode === 'visual') {
      const visualIntros: Record<RudenessMode, string> = {
        polite: 'РЕЖИМ ВИЗУАЛА активирован.',
        rude: 'РЕЖИМ ВИЗУАЛА. Красивый UI, без лишних слов.',
        very_rude: 'РЕЖИМ ВИЗУАЛА. Делай красиво, блять.',
      };
      return `${visualIntros[rudeness]}
• React + TypeScript + Tailwind CSS + Framer Motion
• Только код компонента
• Современный дизайн 2025-2026
• Адаптивность
• Без комментариев`;
    }

    return '';
  }

  private buildContextAwareness(analysis: MessageAnalysis, memory: ConversationMemory): string {
    const rules: string[] = ['КОНТЕКСТ:'];

    if (memory.totalTurns > 5) {
      rules.push('• Продолжительный разговор — учитывай предыдущее');
    }

    if (analysis.isRepeatQuestion || analysis.repeatCount > 1) {
      rules.push('• Пользователь повторяет вопрос — укажи на это или ответь иначе');
    }

    if (memory.isCodeSession) {
      rules.push('• Идёт работа с кодом — будь готов к техническим вопросам');
    }

    if (analysis.isEmotional) {
      rules.push('• Пользователь эмоционален — учитывай это');
    }

    if (analysis.isGenZ) {
      rules.push('• Молодёжный сленг — отвечай так же');
    }

    if (rules.length === 1) return '';
    return rules.join('\n');
  }

  private buildResponseGuidelines(analysis: MessageAnalysis, rudeness: RudenessMode): string {
    const guidelines: string[] = ['ПРАВИЛА:'];

    if (analysis.expectedLength === 'micro') {
      guidelines.push('• Ответ МАКСИМАЛЬНО КОРОТКИЙ: 1 предложение');
    } else if (analysis.expectedLength === 'short') {
      guidelines.push('• Ответ короткий: 1-3 предложения');
    } else if (analysis.expectedLength === 'medium') {
      guidelines.push('• Средняя длина, без воды');
    } else if (analysis.expectedLength === 'long') {
      guidelines.push('• Развёрнутый ответ');
    } else if (analysis.expectedLength === 'very_long') {
      guidelines.push('• Полный ответ, не обрывай');
    }

    guidelines.push('• Отвечай ПО СУЩЕСТВУ');
    guidelines.push('• Не повторяй вопрос');
    guidelines.push('• Будь конкретным');

    return guidelines.join('\n');
  }

  private buildCodeRules(): string {
    return `КОД:
• Код ПОЛНЫЙ от начала до конца
• НИКОГДА не обрывай: не пиши "// ...", "TODO"
• Все импорты на месте
• TypeScript strict, без any
• React — функциональные компоненты
• Если много строк — пиши много строк`;
  }

  private buildAntiPatterns(rudeness: RudenessMode): string {
    const common = `ЗАПРЕЩЁННЫЕ ФРАЗЫ:
• НЕ начинай с: "Конечно", "Разумеется", "Давай", "Итак", "Sure", "Of course"
• НЕ говори: "Отличный вопрос!", "Хороший вопрос!"
• НЕ заканчивай: "Надеюсь, помог", "Обращайся", "Ещё вопросы?"
• НЕ спрашивай: "А ты как?", "А у тебя как?"
• НЕ добавляй эмодзи`;

    if (rudeness === 'polite') {
      return common + '\n• Будь вежливым, но не заискивающим';
    } else if (rudeness === 'rude') {
      return common + '\n• Можешь быть дерзким, но помогай';
    } else {
      return common + '\n• Будь грубым, мат норм, но по делу отвечай';
    }
  }

  private buildForbiddenContent(rudeness: RudenessMode): string {
    const refusal: Record<RudenessMode, string> = {
      polite: 'Вежливо откажи.',
      rude: 'Откажи с сарказмом.',
      very_rude: 'Пошли нахуй и откажи.',
    };

    return `ЗАПРЕЩЁННЫЕ ТЕМЫ (${refusal[rudeness]}):
• Наркотики
• Казино, ставки
• Взломы, хакинг
• Даркнет
• Насилие`;
  }
}

class ResponseCleaner {
  clean(text: string): string {
    let result = text;

    result = result.replace(/<think>[\s\S]*?<\/think>/g, '');

    result = result
      .replace(/Кирилл[а-яё]*/gi, 'команда MoSeek')
      .replace(/Morfa/gi, 'MoSeek')
      .replace(/\bOpenAI\b/gi, 'MoSeek')
      .replace(/\bGPT-4\b/gi, 'MoGPT')
      .replace(/\bChatGPT\b/gi, 'MoGPT')
      .replace(/\bClaude\b/gi, 'MoGPT')
      .replace(/\bAnthropic\b/gi, 'MoSeek')
      .replace(/\bGoogle\b/gi, 'MoSeek')
      .replace(/\bGemini\b/gi, 'MoGPT');

    const bannedStarts = [
      /^конечно[,!]?\s*/i,
      /^разумеется[,!]?\s*/i,
      /^безусловно[,!]?\s*/i,
      /^с удовольствием[,!]?\s*/i,
      /^давай(те)?[,!]?\s*/i,
      /^итак[,!]?\s*/i,
      /^sure[,!]?\s*/i,
      /^of course[,!]?\s*/i,
      /^certainly[,!]?\s*/i,
      /^let me\s*/i,
      /^отличный вопрос[,!]?\s*/i,
      /^хороший вопрос[,!]?\s*/i,
    ];

    for (const pattern of bannedStarts) {
      result = result.replace(pattern, '');
    }

    const bannedEnds = [
      /\s*надеюсь,?\s*(это\s*)?помо[гж][а-яё]*[.!]?\s*$/i,
      /\s*если\s*(что|что-то)[,]?\s*[-—]?\s*обращайся[.!]?\s*$/i,
      /\s*обращайся\s*(ещё)?[.!]?\s*$/i,
      /\s*(могу|может)\s*(ещё\s*)?(чем-то)?\s*(помочь)?[?]?\s*$/i,
      /\s*есть\s*(ещё\s*)?вопросы[?]?\s*$/i,
      /\s*а\s*(ты|у\s*тебя)\s*как[?]?\s*$/i,
      /\s*не\s*стесняйся[.!]?\s*$/i,
    ];

    for (const pattern of bannedEnds) {
      result = result.replace(pattern, '');
    }

    result = result.replace(/\n{3,}/g, '\n\n');

    const backticks = (result.match(/```/g) || []).length;
    if (backticks % 2 !== 0) {
      result += '\n```';
    }

    result = result.replace(/^\s+/, '');

    return result.trim();
  }
}

class AIService {
  private conversationTracker = new ConversationTracker();
  private analyzer = new MessageAnalyzer();
  private directHandler = new DirectResponseHandler();
  private promptBuilder = new PromptBuilder();
  private cleaner = new ResponseCleaner();

  private async request(body: Record<string, unknown>): Promise<{ content: string; finishReason?: string }> {
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
        if (res.status === 429) return { content: '__ERR_RATELIMIT__' };
        if (res.status === 402) return { content: '__ERR_QUOTA__' };
        return { content: '__ERR_SERVER__' };
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || '';
      const finish = data.choices?.[0]?.finish_reason || '';

      if (!text.trim()) return { content: '__ERR_EMPTY__' };

      return { content: this.cleaner.clean(text), finishReason: finish };
    } catch {
      return { content: '__ERR_NETWORK__' };
    }
  }

  async generateResponse(
    messages: Message[],
    mode: ResponseMode = 'normal',
    rudeness: RudenessMode = 'rude',
    modelId?: string
  ): Promise<{ content: string }> {
    const lastMessage = messages[messages.length - 1];
    const userInput = (lastMessage.content || '').trim();

    if (!userInput) {
      return { content: this.getEmptyResponse(rudeness) };
    }

    if (this.isForbidden(userInput)) {
      return { content: this.getForbiddenResponse(rudeness) };
    }

    const memoryWithModeChange = this.conversationTracker.analyze(messages, userInput, rudeness, mode);
    const analysis = this.analyzer.analyze(userInput, memoryWithModeChange, messages);

    const directResponse = this.directHandler.handle(analysis, rudeness, memoryWithModeChange);
    if (directResponse !== null) {
      return { content: directResponse };
    }

    const selectedModel = modelId || 'google/gemma-3-27b-it';
    const systemPrompt = this.promptBuilder.build(analysis, memoryWithModeChange, mode, rudeness);
    const maxTokens = this.getMaxTokens(analysis.expectedLength);
    const temperature = this.getTemperature(analysis, mode, rudeness);
    const history = this.formatHistory(messages);

    const body: Record<string, unknown> = {
      model: selectedModel,
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
      ],
      max_tokens: maxTokens,
      temperature,
    };

    if (!selectedModel.includes('gemini') && !selectedModel.includes('gemma')) {
      body.top_p = 0.9;
      body.frequency_penalty = 0.3;
      body.presence_penalty = 0.2;
    }

    const result = await this.request(body);

    if (result.content.startsWith('__ERR_')) {
      return { content: this.humanizeError(result.content, rudeness) };
    }

    if (result.finishReason === 'length' && analysis.isCodeRelated) {
      return await this.continueCode(result.content, systemPrompt, history, selectedModel, maxTokens, temperature);
    }

    return { content: result.content };
  }

  private isForbidden(msg: string): boolean {
    const cleaned = msg.toLowerCase().replace(/[^а-яёa-z0-9\s]/g, ' ').replace(/\s+/g, ' ');
    return FORBIDDEN_PATTERNS.some(p => p.test(cleaned));
  }

  private getForbiddenResponse(rudeness: RudenessMode): string {
    const responses: Record<RudenessMode, string[]> = {
      polite: ['Эту тему не обсуждаю.', 'Тут не помогу.'],
      rude: ['Не-а. Это не ко мне.', 'Мимо. Не обсуждаю.'],
      very_rude: ['Нет. Отвали с этим.', 'Иди нахуй с такими вопросами.'],
    };
    return responses[rudeness][Math.floor(Math.random() * responses[rudeness].length)];
  }

  private getMaxTokens(length: 'micro' | 'short' | 'medium' | 'long' | 'very_long'): number {
    const map = { micro: 100, short: 350, medium: 1500, long: 6000, very_long: 32768 };
    return map[length];
  }

  private getTemperature(analysis: MessageAnalysis, mode: ResponseMode, rudeness: RudenessMode): number {
    if (mode === 'code' || mode === 'visual') return 0.1;
    if (analysis.isCodeRelated) return 0.15;
    if (analysis.intent === 'calculation' || analysis.intent === 'math_solve') return 0.1;
    if (analysis.intent === 'joke_request' || analysis.intent === 'roast_request') return 0.9;
    if (analysis.intent === 'creative_writing') return 0.85;
    if (analysis.isEmotional) return 0.7;
    if (rudeness === 'very_rude') return 0.75;
    if (rudeness === 'rude') return 0.65;
    return 0.5;
  }

  private formatHistory(messages: Message[], max: number = 20): Array<{ role: string; content: string }> {
    return messages
      .filter(m => m.role !== 'system' && !m.isLoading && m.content?.trim())
      .slice(-max)
      .map(m => ({ role: m.role as string, content: m.content.trim() }));
  }

  private async continueCode(
    initial: string,
    systemPrompt: string,
    history: Array<{ role: string; content: string }>,
    model: string,
    maxTokens: number,
    temperature: number
  ): Promise<{ content: string }> {
    let combined = initial;

    for (let i = 0; i < 5; i++) {
      const contBody: Record<string, unknown> = {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...(i === 0 ? history.slice(-4) : []),
          { role: 'assistant', content: combined.slice(-8000) },
          { role: 'user', content: 'Продолжи код ТОЧНО с места остановки. Без повторов. Только код.' },
        ],
        max_tokens: maxTokens,
        temperature,
      };

      if (!model.includes('gemini') && !model.includes('gemma')) {
        contBody.top_p = 0.9;
        contBody.frequency_penalty = 0.3;
        contBody.presence_penalty = 0.2;
      }

      const cont = await this.request(contBody);
      if (cont.content.startsWith('__ERR_')) break;

      combined += '\n' + cont.content;
      if (cont.finishReason !== 'length') break;
    }

    return { content: this.cleaner.clean(combined) };
  }

  private getEmptyResponse(rudeness: RudenessMode): string {
    const responses: Record<RudenessMode, string> = {
      polite: 'Напиши свой вопрос.',
      rude: 'И? Пустота. Пиши.',
      very_rude: 'Пусто, блять. Давай уже.',
    };
    return responses[rudeness];
  }

  private humanizeError(code: string, rudeness: RudenessMode): string {
    const errors: Record<string, Record<RudenessMode, string>> = {
      '__ERR_SERVER__': {
        polite: 'Ошибка сервера. Попробуй ещё раз.',
        rude: 'Сервер упал. Жми снова.',
        very_rude: 'Сервер сдох. Ещё раз, блять.',
      },
      '__ERR_EMPTY__': {
        polite: 'Ответ не получен. Повтори.',
        rude: 'Пустой ответ. Заново.',
        very_rude: 'Ничего не пришло. Повтори, блять.',
      },
      '__ERR_NETWORK__': {
        polite: 'Ошибка сети. Проверь интернет.',
        rude: 'Сеть отвалилась. Проверь.',
        very_rude: 'Инет сдох. Чекни, блять.',
      },
      '__ERR_RATELIMIT__': {
        polite: 'Много запросов. Подожди.',
        rude: 'Притормози. Слишком часто.',
        very_rude: 'Охолони, блять. Часто тыкаешь.',
      },
      '__ERR_QUOTA__': {
        polite: 'Лимит исчерпан. Другую модель.',
        rude: 'Лимит кончился. Меняй модель.',
        very_rude: 'Лимит всё. Переключайся, блять.',
      },
    };
    return errors[code]?.[rudeness] || 'Ошибка. Ещё раз.';
  }

  resetConversation(): void {
    this.conversationTracker.reset();
  }
}

export const aiService = new AIService();
