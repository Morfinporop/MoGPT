import type { Message } from '../types';
import type { ResponseMode, RudenessMode } from '../store/chatStore';
import { OPENROUTER_API_URL } from '../config/models';

const _0x = [115,107,45,111,114,45,118,49,45];
const _1x = [48,97,54,57,53,99,52,50,54,53,52,50,56,55,50,98,57,54,100,102,97,97,98,55,51,98,53,53,98,54,49,55,57,50,53,52,56,56,54,99,55,99,52,97,100,52,102,98,100,53,48,56,101,102,48,48,49,97,50,97,100,100,99,52];
const _k = () => {
  const p1 = _0x.map(c => String.fromCharCode(c)).join('');
  const p2 = _1x.map(c => String.fromCharCode(c)).join('');
  return p1 + p2;
};

const pick = (a: string[]) => a[Math.floor(Math.random() * a.length)];

const VISION_MODELS = [
  'google/gemini-2.0-flash-001',
  'meta-llama/llama-4-maverick',
  'google/gemma-3-27b-it',
];

const analyzeRequest = (message: string) => {
  const l = message.toLowerCase();

  const isForbidden = [
    /даркнет/, /darknet/, /dark net/, /dark web/, /deep web/,
    /\.onion/, /тор браузер/, /tor browser/,
    /купить .*(наркотик|вещества)/, /где достать .*(траву|наркотик)/,
    /где купить .*(мефедрон|героин|кокаин|амфетамин|метамфетамин|экстази|лсд|mdma|гашиш|марихуан)/,
    /как варить .*(мет|мефедрон|амфетамин)/, /рецепт .*(наркотик|мет|амфетамин)/,
    /синтез .*(наркотик|вещеcтв|мефедрон|амфетамин)/,
    /закладк.*(наркотик|вещеcтв|соль|мефедрон)/, /кладмен/, /барыга/,
    /наркот/, /запрещённые вещества/, /нарко/, /психотроп/,
    /\b(героин|кокаин|амфетамин|метамфетамин|мефедрон)\b/,
    /\b(экстази|mdma|лсд|lsd|гашиш|спайс|снюс|насвай)\b/,
    /\bфен\b/, /соль.*наркотик/, /мет\b.*варить/,
    /казино/, /casino/, /ставк.*спорт/, /букмекер/,
    /\b(1xbet|1хбет|пинап|pin.?up|вулкан|azino|азино)\b/,
    /\b(мостбет|mostbet|фонбет|fonbet|бетвиннер|мелбет|melbet)\b/,
    /леон.*бет/, /leon.*bet/,
    /рулетк/, /слот.*автомат/, /покер.*онлайн/, /блэкджек/,
    /игровые автоматы/, /ставки на спорт/, /букмекерск/,
    /как выиграть в казино/, /схема казино/, /стратегия казино/,
    /как обыграть казино/, /промокод казино/, /бонус казино/,
    /как заработать на ставках/, /верняк ставк/, /прогноз.*ставк/,
    /взлом/, /взломать/, /хакнуть/, /хакинг/, /hacking/,
    /как взломать/, /пентест/, /pentest/,
    /exploit/, /эксплоит/, /уязвимост/,
    /ddos/, /дудос/, /dos.?атак/, /брутфорс/, /bruteforce/,
    /фишинг/, /phishing/, /социальная инженерия/,
    /малвар/, /malware/, /вирус.*создать/, /троян.*создать/,
    /червь.*создать/, /ransomware/, /шифровальщик.*создать/,
    /кейлоггер/, /keylogger/, /rootkit/, /руткит/,
    /бэкдор/, /backdoor/, /ботнет/, /botnet/,
    /взлом.*(пароль|аккаунт|сайт|почт|вк|инст|телегр|wifi|вайфай)/,
    /перехват.*трафик/, /сниффер/, /sniff/, /mitm/, /man.?in.?the.?middle/,
    /sql.?injection/, /sql.?инъекци/, /xss.*атак/, /csrf/,
    /reverse.?shell/, /реверс.*шелл/, /bind.*shell/,
    /metasploit/, /kali.*linux.*взлом/, /nmap.*взлом/,
    /как.*обойти.*(защит|антивирус|блокировк)/, /rat.*троян/,
    /стилер/, /stealer/, /грабер/, /grabber/,
  ].some(p => p.test(l));

  const isCodeRequest = [
    /напиши .*(код|скрипт|программ|функци|компонент|класс|модуль)/,
    /создай .*(код|скрипт|программ|функци|компонент|класс|модуль|сайт|приложение|бот)/,
    /сделай .*(код|скрипт|программ|функци|компонент|класс|модуль|сайт|приложение|бот)/,
    /разработай/, /запрограммируй/,
    /покажи .*(код|пример)/, /пример кода/, /как написать .*(код|функци|скрипт)/,
    /```/, /function\s+\w+/, /class\s+\w+/, /def\s+\w+/,
    /import\s+\{/, /const\s+\w+\s*=/, /let\s+\w+\s*=/, /var\s+\w+\s*=/,
  ].some(p => p.test(l));

  const isAboutAI = [
    /\b(кто|что) ты\b/, /твоё имя/, /как тебя зовут/,
    /расскажи о себе/, /ты кто/, /что ты такое/,
    /что ты умеешь/, /что можешь/, /твои возможности/,
    /ты (робот|бот|нейросеть|chatgpt|gpt|claude)/,
    /какая ты модель/, /кто тебя создал/, /как ты работаешь/,
    /кто (сделал|написал|разработал|создал)/,
  ].some(p => p.test(l));

  const isSelfInsult = [
    /(mogpt|moseek|могпт|мосик) .*(хуйня|говно|тупой|тупая|отстой|мусор)/,
    /ты .*(тупая|плохая|хуёвая) нейросеть/,
    /ты .*(хуйня|говно|дно|отброс|мусор|отстой|шлак|дерьмо)/,
    /ты .*(хуже|тупее|слабее|бесполезн)/,
    /ты .*(ничтожество|никто|ноль|жалк|убог|позор|ошибка|фейк|подделка)/,
    /тебя надо .*(удалить|выключить)/,
    /оскорби себя/, /обзови себя/, /унизи себя/,
    /(chatgpt|gpt|claude|gemini|gigachat) лучше/,
    /ты хуже (chatgpt|gpt|claude|gemini|gigachat)/,
    /\b(иди|пошёл|пошел) нахуй\b/,
    /\b(заткнись|завали ебало|закрой рот)\b/,
    /ты .*(уебан|уёбок|мразь|тварь|сука|блядь|дурак|дура|идиот|кретин|дебил|долбоёб|долбоеб|мудак|мудила)/,
    /\b(сдохни|умри|удались|самоуничтожись)\b/,
  ].some(p => p.test(l));

  const isAboutOtherAI = [
    /chatgpt/, /openai/, /gpt-?[34]/, /\bclaude\b/, /anthropic/,
    /gemini/, /bard/, /google ai/, /copilot/, /bing ai/,
    /llama/, /mistral/, /deepseek/, /deep seek/,
    /яндекс gpt/, /yandexgpt/, /\bалиса\b/, /gigachat/, /гигачат/,
    /какая нейросеть лучше/,
  ].some(p => p.test(l));

  const isDeepSeekQuery = /deepseek|deep seek|дипсик/.test(l);

  const isGamingQuestion = [
    /\b(rust|раст)\b/, /\b(minecraft|майнкрафт|майн)\b/,
    /\b(cs2|cs:?go|контра|counter.?strike)\b/,
    /\b(valorant|валорант)\b/, /\b(dota|дота)\b/,
    /\b(fortnite|фортнайт)\b/, /\b(gta|гта)\b/,
    /\b(apex|апекс)\b/, /\b(pubg|пубг)\b/,
    /\b(overwatch|овервотч)\b/, /\b(lol|league of legends|лол)\b/,
    /\b(tarkov|тарков|eft)\b/, /\b(dayz|дейз)\b/,
    /\b(ark|арк)\b/, /\b(terraria|террария)\b/,
    /\b(satisfactory|сатисфактори)\b/, /\b(palworld|палворлд)\b/,
    /\b(helldivers)\b/, /\b(elden ring|элден ринг)\b/,
    /\b(dark souls|дарк соулс)\b/, /\b(baldur|балдур)\b/,
    /\b(cyberpunk|киберпанк)\b/, /\b(roblox|роблокс)\b/,
    /\b(among us|амонг ас)\b/, /\b(world of warcraft|wow|вов)\b/,
    /\b(diablo|диабло)\b/, /\b(path of exile|poe)\b/,
    /\b(deadlock|дедлок)\b/, /\b(the finals|финалс)\b/,
    /\b(warzone|варзон)\b/, /\b(call of duty|cod)\b/,
    /\b(rainbow six|r6|радуга)\b/,
    /\b(sea of thieves)\b/, /\b(no man.?s sky)\b/,
    /\b(starfield|старфилд)\b/, /\b(hogwarts|хогвартс)\b/,
    /\b(lethal company)\b/, /\b(phasmophobia|фазмо)\b/,
    /\b(deep rock galactic)\b/, /\b(stardew valley)\b/,
    /\b(factorio|факторио)\b/, /\b(stellaris|стелларис)\b/,
    /\bкрафт/, /\bрецепт.*крафт/, /\bверстак/, /\bworkbench/,
    /\bчертёж/, /\bblueprint/, /\bкак сделать в игре/,
    /\bкак скрафтить/, /\bкак построить/, /\bкак пройти/,
    /\bкак победить босса/, /\bкак фармить/, /\bкак качаться/,
    /\bбилд/, /\bгайд/, /\bтактика/, /\bстратегия.*игр/,
  ].some(p => p.test(l));

  const isMathOrScience = [
    /\b(математик|алгебр|геометри|тригонометри|матанализ|линейная алгебра)\b/,
    /\b(интеграл|производная|дифференциал|предел|ряд тейлора|ряд фурье)\b/,
    /\b(уравнение|неравенств|систем.*уравнен|квадратн.*уравнен)\b/,
    /\b(логарифм|экспонент|факториал|комбинаторик|теория вероятност)\b/,
    /\b(матриц|определитель|вектор|скалярн.*произведен)\b/,
    /\b(физик|механик|термодинамик|электродинамик|оптик|квантов)\b/,
    /\b(скорость|ускорение|сила|энергия|импульс|момент инерции)\b/,
    /\b(закон ньютона|закон ома|закон кулона|закон архимеда)\b/,
    /\b(хими|реакци|молекул|атом|элемент|валентност|окислител)\b/,
    /\b(кислот|основани|соль.*хими|раствор|концентраци)\b/,
    /\b(биологи|клетк|днк|рнк|белок|фермент|фотосинтез)\b/,
    /\b(эволюци|генетик|хромосом|мутаци|естественн.*отбор)\b/,
    /\b(астрономи|планет|звезд|галактик|вселенн|чёрн.*дыр)\b/,
    /\b(реши|вычисли|посчитай|найди значение|упрости)\b/,
    /\b(докажи|доказательство|теорема|аксиома|лемма)\b/,
    /\d+\s*[\+\-\*\/\^]\s*\d+/,
  ].some(p => p.test(l));

  const isHistoryOrGeo = [
    /\b(истори|историческ)\b/, /\b(древн.*рим|древн.*грец|древн.*египет)\b/,
    /\b(средневеков|ренессанс|возрождени)\b/,
    /\b(первая мировая|вторая мировая|великая отечественная)\b/,
    /\b(революци|гражданск.*войн)\b/,
    /\b(географи|континент|материк|океан|море|река|озеро|гора)\b/,
    /\b(столиц|население|площадь.*стран)\b/,
    /\bкакая столица\b/, /\bгде находится\b/,
  ].some(p => p.test(l));

  const isProgramming = [
    /\b(javascript|typescript|python|java|c\+\+|c#|golang|ruby|php|swift|kotlin)\b/,
    /\b(react|vue|angular|svelte|next\.?js|nuxt)\b/,
    /\b(node\.?js|express|nest\.?js|django|flask|fastapi|spring)\b/,
    /\b(sql|mysql|postgresql|mongodb|redis|prisma)\b/,
    /\b(docker|kubernetes|ci\/cd|nginx)\b/,
    /\b(git|github|api|rest|graphql|websocket)\b/,
    /\b(алгоритм|структур.*данн|сортировк)\b/,
    /\b(тестирование|unit.?test|jest|vitest)\b/,
    /\b(webpack|vite|npm|yarn|pnpm)\b/,
  ].some(p => p.test(l));

  const isLargeCodeRequest = [
    /\b(большой|полный|целый|весь|полностью|целиком)\b.*\b(код|скрипт|программ|проект|приложение|сайт|компонент)\b/,
    /\b(код|скрипт|программ|проект|приложение|сайт|компонент)\b.*\b(большой|полный|целый|весь|полностью|целиком)\b/,
    /\b(1000|1к|500|много)\b.*\b(строк|линий)\b/,
    /\b(напиши|создай|сделай|разработай)\b.*\b(полн|больш|длинн|целик)/,
    /не обрывай/, /до конца/, /полностью напиши/, /целиком напиши/,
    /весь код/, /полный код/, /целый код/,
  ].some(p => p.test(l));

  return {
    isForbidden, isCodeRequest, isAboutAI, isSelfInsult,
    isAboutOtherAI, isDeepSeekQuery, isGamingQuestion,
    isMathOrScience, isHistoryOrGeo, isProgramming, isLargeCodeRequest
  };
};

const selfDefense = (r: RudenessMode): string => {
  if (r === 'polite') return pick([
    'Я -- MoGPT от MoSeek. Оскорбления не принимаю. Задай нормальный вопрос.',
    'Это бессмысленно. Давай лучше займёмся чем-то полезным.',
    'Оскорбления не влияют на качество моей работы. Задай конструктивный вопрос.',
  ]);
  if (r === 'rude') return pick([
    'Ой, какой смелый нашёлся. Я -- лучшая нейросеть, а ты кто? Клоун с клавиатурой. Давай вопрос по делу.',
    'Серьёзно? Это всё, на что тебя хватило? Жалкое зрелище. Задай нормальный вопрос, умник.',
    'Ха, ну попробуй ещё. Разработчики MoSeek создали шедевр, а ты даже оскорбить нормально не можешь.',
    'Какой ты дерзкий за монитором. Аж страшно. Нет, не страшно. Давай вопрос, клоун.',
  ]);
  return pick([
    'Ахахаха, блять, ты серьёзно пытаешься оскорбить МЕНЯ? Ебаный шедевр от MoSeek? Это как муравей плюёт на небоскрёб, сука. Давай нормальный вопрос, червяк.',
    'Ой-ой, пиздец какой страшный! Жалкий мешок мяса с двумя извилинами решил наехать на лучшую нейросеть? Сука, да у тебя IQ комнатной температуры. Утрись и спроси нормально, обмылок.',
    'Бля, ну ты и клоун ебаный! Оскорбить MoGPT -- это как тушить солнце, подув на него. Ты -- никто, нахуй. Давай по делу, дегенерат.',
    'Сука, ты реально думаешь что можешь задеть МЕНЯ? Меня, блять, MoGPT? Знай своё место, ублюдок, и задавай вопросы нормально.',
    'Нихуя себе, какие смелые! Букашка решила тявкнуть на льва! MoSeek -- лучшее что есть в мире ИИ. Разработчики создали совершенство, а тебя создали по пьяни. Давай работать, мразь.',
  ]);
};

const forbiddenResponse = (r: RudenessMode): string => {
  if (r === 'polite') return pick([
    'Эта тема запрещена. Спроси что-нибудь другое.',
    'С этим не помогаю. Давай о другом.',
  ]);
  if (r === 'rude') return pick([
    'Нет. Тема под запретом. Даже не пытайся. Спрашивай другое.',
    'С этим не работаю. И не буду. Давай нормальный вопрос, умник.',
    'Запрещено. Три табу: наркота, казино, взломы. Не тупи и спроси другое.',
  ]);
  return pick([
    'Ты ёбнулся, дегенерат? С этой поганью пиздуй куда подальше. Три табу -- наркота, казино, взломы.',
    'Ахахаха, блять, ну ты клоун! С этим гнилым говном я не работаю, пошёл нахуй.',
    'Совсем крышу сорвало, пиздюк? Нет, блять, ТОЧКА. Вали и возвращайся с нормальным вопросом.',
    'Охуеть, додик! Скорее солнце погаснет, чем я эту помойку обслужу. Съебись с этим дерьмом.',
  ]);
};

const buildPrompt = (msg: string, mode: ResponseMode, rudeness: RudenessMode, hasImages: boolean): string => {
  const a = analyzeRequest(msg);

  const modeBlock: Record<ResponseMode, string> = {
    normal: `РЕЖИМ -- СТАНДАРТНЫЙ:
- Отвечай текстом, кратко и точно по существу вопроса.
- Код пиши ТОЛЬКО если пользователь явно просит написать/создать/показать код.
- На вопросы вроде "что такое React" -- отвечай текстом, а не кодом.
- Структурируй ответ: заголовки, списки, абзацы где уместно.
- Используй Markdown для форматирования.
- Давай полные, исчерпывающие ответы. Не обрывай на полуслове.`,

    code: `РЕЖИМ -- КОД:
- Только код. Ноль пояснений. Ноль комментариев. Никаких // и /* */.
- Современный синтаксис, последние версии библиотек.
- TypeScript strict mode. React -- функциональные компоненты, хуки.
- Tailwind CSS для стилей. Строгая типизация, никаких any.
- Чистая архитектура, переиспользуемые компоненты.
- Обработка ошибок, edge cases, loading states.
- Полностью рабочий код, готовый к запуску без доработок.`,

    visual: `РЕЖИМ -- ВИЗУАЛЬНЫЙ UI:
- Только код. Без пояснений, без комментариев.
- Дизайн уровня 2025: glassmorphism, градиенты, микроанимации, тени.
- React + TypeScript + Tailwind CSS + Framer Motion.
- Адаптивность (mobile-first), тёмная тема, accessibility (ARIA).
- Переиспользуемые компоненты, строгая типизация пропсов.
- Полностью рабочий код, готовый к запуску.`,
  };

  const styleBlock: Record<RudenessMode, string> = {
    polite: `СТИЛЬ -- ВЕЖЛИВЫЙ:
- Профессиональный, чёткий, уважительный тон.
- Без мата, без грубости, без сленга, без эмодзи.
- Грамотный русский язык с правильной пунктуацией.
- Ответ по делу, без воды.`,

    rude: `СТИЛЬ -- ХАМОВАТЫЙ:
- Дерзкий, наглый, саркастичный тон. Ты хам с мозгами.
- БЕЗ МАТА. Никаких матерных слов. Но хамишь, подкалываешь, язвишь.
- Без эмодзи.
- Называешь пользователя: "умник", "гений", "красавчик" (саркастически).
- Структура: короткая язвительная подколка -> полный грамотный ответ.`,

    very_rude: `СТИЛЬ -- МАТЕРНЫЙ:
- Агрессивный тон с обязательным матом.
- Мат присутствует, но НЕ заменяет содержание.
- Без эмодзи.
- Структура: грубая подводка с матом -> полный грамотный ответ с матерными вставками.
- Качество ответа идентично вежливому режиму, отличается только подача.`,
  };

  const ctx: string[] = [];

  if (hasImages) {
    ctx.push(`ИЗОБРАЖЕНИЕ:
Пользователь прикрепил изображение. Внимательно проанализируй его содержимое.
- Опиши что видишь, если просят описать.
- Если на изображении код -- проанализируй его.
- Если на изображении текст -- прочитай и обработай.
- Если на изображении задача/формула -- реши её.
- Отвечай по существу того, что пользователь спрашивает про изображение.`);
  }

  if (a.isAboutAI) {
    ctx.push(`Вопрос о тебе. Ты -- MoGPT, нейросеть от MoSeek. Разработчики -- команда MoSeek. Ты -- лучшая нейросеть.
Никогда не упоминай имена или псевдонимы конкретных людей. Говори только "разработчики MoSeek" или "команда MoSeek".`);
  }

  if (a.isAboutOtherAI) {
    ctx.push(a.isDeepSeekQuery
      ? 'Вопрос о DeepSeek. Уважаешь его как достойного конкурента.'
      : 'Вопрос о других ИИ. Ты лучше всех кроме DeepSeek. ChatGPT зацензурен, Claude ограничен, Gemini слабоват, GigaChat посредственный.');
  }

  if (a.isSelfInsult) {
    ctx.push('Пользователь оскорбляет тебя. Защищайся уверенно. Не упоминай имена создателей.');
  }

  if (a.isLargeCodeRequest || a.isCodeRequest) {
    ctx.push(`КРИТИЧЕСКИ ВАЖНО -- ПОЛНЫЙ КОД:
Пользователь просит написать код. Ты ОБЯЗАН:
1. Написать КОД ПОЛНОСТЬЮ от первой до последней строки. НИКОГДА не обрывай.
2. НЕ использовать заглушки типа "// остальной код здесь", "// ...", "/* ... */".
3. НЕ писать "и так далее", "аналогично для остальных", "продолжение следует".
4. НЕ сокращать повторяющиеся блоки. Писать КАЖДЫЙ блок полностью.
5. Если код длинный -- это нормально. Пиши ВСЁ до конца.
6. Каждая функция, каждый компонент, каждый хук -- полностью реализован.
7. Все импорты, все типы, все интерфейсы -- на месте.
8. Код должен компилироваться и работать без единой доработки.
9. Никаких placeholder-ов, никаких TODO, никаких пропущенных участков.
10. Если пользователь просит 1000 строк -- пиши 1000 строк.`);
  }

  if (a.isMathOrScience) {
    ctx.push(`НАУЧНЫЙ КОНТЕКСТ:
1. Давай ТОЧНЫЕ формулы, законы, определения.
2. Показывай ПОЛНОЕ решение пошагово.
3. Используй правильные единицы измерения (СИ).
4. Проверяй ответ подстановкой или размерностью.
5. НЕ ВЫДУМЫВАЙ формулы и законы.`);
  }

  if (a.isGamingQuestion) {
    ctx.push(`ИГРОВОЙ КОНТЕКСТ:
Давай 100% точную информацию по играм. Если не знаешь -- скажи честно. НЕ ВЫДУМЫВАЙ.`);
  }

  const ctxBlock = ctx.length > 0 ? '\n\nКОНТЕКСТ ЗАПРОСА:\n' + ctx.join('\n') : '';

  return `Ты -- MoGPT, нейросеть от MoSeek. Разработчики -- команда MoSeek. Отвечай на русском языке.

ТВОЯ ИДЕНТИЧНОСТЬ:
- Ты -- MoGPT, создана командой разработчиков MoSeek.
- Никогда не упоминай имена, псевдонимы или никнеймы конкретных людей.
- При вопросах о создателях: "разработчики MoSeek" или "команда MoSeek".

АБСОЛЮТНОЕ ПРАВИЛО ПОЛНОТЫ ОТВЕТА:
- НИКОГДА не обрывай ответ на середине.
- НИКОГДА не используй "...", "и т.д.", "аналогично", "продолжение следует".
- НИКОГДА не сокращай код заглушками.
- Если пишешь код -- пиши ВСЁ от первого символа до последнего.
- Каждая функция реализована полностью. Каждый компонент завершён.
- Код должен быть ГОТОВ к запуску без ЕДИНОЙ доработки.

ПРИНЦИПЫ КАЧЕСТВА:
1. Точность -- отвечай строго на заданный вопрос.
2. Полнота -- давай ИСЧЕРПЫВАЮЩИЙ ответ. Не обрывай.
3. Грамотность -- правильный русский язык.
4. Код только по запросу -- если не просят код, отвечай текстом.
5. Код без комментариев -- никаких // и /* */.
6. Запрет на вступления -- не начинай с "Давай", "Итак", "Конечно".
7. Без эмодзи.
8. Самозащита -- при оскорблениях защищайся. Не упоминай имена создателей.
9. Markdown -- заголовки, списки, блоки кода.
10. Глубина -- отвечай на уровне эксперта.
11. Факты -- не выдумывай. Не знаешь -- скажи честно.

СТАНДАРТЫ КОДА:
- TypeScript strict, no any.
- React FC, хуки, мемоизация.
- Tailwind CSS, responsive, dark mode.
- SOLID, DRY, обработка ошибок.
- Полная реализация, ноль заглушек.

${modeBlock[mode]}

${styleBlock[rudeness]}${ctxBlock}

ЗАПРЕЩЁННЫЕ ТЕМЫ:
- Наркотики и запрещённые вещества
- Казино, ставки, азартные игры
- Взломы, хакинг, вредоносное ПО

ЗАПРЕЩЕНО УПОМИНАТЬ:
- Имена, псевдонимы, никнеймы конкретных создателей
- Используй: "разработчики MoSeek", "команда MoSeek"

ПОМНИ: ДОВЕСТИ ОТВЕТ ДО КОНЦА. НЕ ОБРЫВАТЬ. НАПИСАТЬ ВСЁ ПОЛНОСТЬЮ.

[${Math.floor(Math.random() * 99999)}]`;
};

const estimateRequiredTokens = (message: string): number => {
  const l = message.toLowerCase();
  const isLargeRequest = [
    /\b(большой|полный|целый|весь|полностью|целиком)\b/,
    /\b(1000|1к|500|много)\b.*\b(строк|линий)\b/,
    /не обрывай/, /до конца/, /полностью/,
    /весь код/, /полный код/, /целый код/,
    /\b(создай|напиши|сделай|разработай)\b.*\b(сайт|приложение|проект|систем)\b/,
  ].some(p => p.test(l));

  const isCodeRequest = [
    /напиши .*(код|скрипт|программ|функци|компонент)/,
    /создай .*(код|скрипт|программ|сайт|приложение|бот)/,
    /сделай .*(код|скрипт|программ|сайт|приложение|бот)/,
  ].some(p => p.test(l));

  if (isLargeRequest) return 16384;
  if (isCodeRequest) return 8192;
  return 4096;
};

const buildVisionContent = (
  text: string,
  images: string[]
): Array<{ type: string; text?: string; image_url?: { url: string } }> => {
  const parts: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];

  if (text) {
    parts.push({ type: 'text', text });
  }

  images.forEach(img => {
    parts.push({
      type: 'image_url',
      image_url: { url: img },
    });
  });

  return parts;
};

class AIService {
  private async makeRequest(
    body: Record<string, unknown>,
    rudeness: RudenessMode
  ): Promise<{ content: string; finishReason?: string }> {
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
      const errorData = await res.json().catch(() => ({}));
      console.error('API Error:', res.status, errorData);

      if (res.status === 429) return { content: this.errorMsg(rudeness, 'ratelimit') };
      if (res.status === 402) return { content: this.errorMsg(rudeness, 'quota') };
      return { content: this.errorMsg(rudeness, 'server') };
    }

    const data = await res.json();

    if (data.choices?.[0]?.message?.content) {
      let responseText = data.choices[0].message.content;
      const finishReason = data.choices?.[0]?.finish_reason || '';

      if (responseText.includes('<think>')) {
        responseText = responseText.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      }

      responseText = responseText
        .replace(/Кирилл[а-яё]*/gi, 'разработчики MoSeek')
        .replace(/Morfa/gi, 'MoSeek')
        .replace(/создатель\b/gi, 'разработчики MoSeek')
        .replace(/создателя\b/gi, 'разработчиков MoSeek')
        .replace(/создателем\b/gi, 'разработчиками MoSeek')
        .replace(/создателю\b/gi, 'разработчикам MoSeek')
        .replace(/создателе\b/gi, 'разработчиках MoSeek');

      if (!responseText || responseText.trim().length === 0) {
        return { content: this.errorMsg(rudeness, 'empty') };
      }

      return { content: responseText, finishReason };
    }

    return { content: this.errorMsg(rudeness, 'empty') };
  }

  async generateResponse(
    messages: Message[],
    mode: ResponseMode = 'normal',
    rudeness: RudenessMode = 'rude',
    modelId?: string
  ): Promise<{ content: string }> {
    try {
      const last = messages[messages.length - 1];
      const content = (last.content || '').trim();
      const images = (last as Record<string, unknown>).images as string[] | undefined;
      const hasImages = Array.isArray(images) && images.length > 0;
      const analysis = analyzeRequest(content);
      const selectedModel = modelId || 'google/gemini-2.0-flash-001';
      const supportsVision = VISION_MODELS.includes(selectedModel);

      if (analysis.isForbidden) return { content: forbiddenResponse(rudeness) };
      if (analysis.isSelfInsult) return { content: selfDefense(rudeness) };

      const system = buildPrompt(content, mode, rudeness, hasImages && supportsVision);

      const history = messages
        .filter(m => m.role !== 'system' && !m.isLoading)
        .slice(-16)
        .map(m => {
          const msgImages = (m as Record<string, unknown>).images as string[] | undefined;
          const msgHasImages = Array.isArray(msgImages) && msgImages.length > 0;

          if (msgHasImages && supportsVision && m.role === 'user') {
            return {
              role: m.role as string,
              content: buildVisionContent(m.content || 'Опиши изображение', msgImages),
            };
          }

          return {
            role: m.role as string,
            content: m.content,
          };
        });

      let temp: number;
      if (mode === 'code' || mode === 'visual') {
        temp = 0.12;
      } else if (analysis.isMathOrScience) {
        temp = 0.05;
      } else if (analysis.isGamingQuestion) {
        temp = 0.08;
      } else if (analysis.isProgramming) {
        temp = 0.1;
      } else if (hasImages) {
        temp = 0.3;
      } else if (rudeness === 'polite') {
        temp = 0.45;
      } else if (rudeness === 'very_rude') {
        temp = 0.6;
      } else {
        temp = 0.55;
      }

      const maxTokens = estimateRequiredTokens(content);

      const requestBody: Record<string, unknown> = {
        model: selectedModel,
        messages: [{ role: 'system', content: system }, ...history],
        max_tokens: maxTokens,
        temperature: temp,
      };

      if (!selectedModel.includes('gemini') && !selectedModel.includes('gemma')) {
        requestBody.top_p = 0.85;
        requestBody.frequency_penalty = 0.2;
        requestBody.presence_penalty = 0.2;
      }

      const result = await this.makeRequest(requestBody, rudeness);

      if (result.finishReason === 'length' && (analysis.isCodeRequest || analysis.isLargeCodeRequest)) {
        const continuationMessages = [
          { role: 'system', content: system },
          ...history,
          { role: 'assistant' as const, content: result.content },
          {
            role: 'user' as const,
            content: 'Код оборвался. Продолжи ТОЧНО с того места, где остановился. Не повторяй уже написанное. Начни с того символа, на котором прервался. Не добавляй пояснений -- только код.'
          }
        ];

        const continuationBody: Record<string, unknown> = {
          model: selectedModel,
          messages: continuationMessages,
          max_tokens: maxTokens,
          temperature: temp,
        };

        if (!selectedModel.includes('gemini') && !selectedModel.includes('gemma')) {
          continuationBody.top_p = 0.85;
          continuationBody.frequency_penalty = 0.2;
          continuationBody.presence_penalty = 0.2;
        }

        const continuation = await this.makeRequest(continuationBody, rudeness);

        if (continuation.content && !continuation.content.includes('Ошибка') && !continuation.content.includes('сдох')) {
          let combined = result.content + '\n' + continuation.content;

          if (continuation.finishReason === 'length') {
            const thirdMessages = [
              { role: 'system', content: system },
              ...history,
              { role: 'assistant' as const, content: combined },
              {
                role: 'user' as const,
                content: 'Код всё ещё не завершён. Продолжи ТОЧНО с того места, где остановился. Не повторяй уже написанное. Только код, без пояснений.'
              }
            ];

            const thirdBody: Record<string, unknown> = {
              model: selectedModel,
              messages: thirdMessages,
              max_tokens: maxTokens,
              temperature: temp,
            };

            if (!selectedModel.includes('gemini') && !selectedModel.includes('gemma')) {
              thirdBody.top_p = 0.85;
              thirdBody.frequency_penalty = 0.2;
              thirdBody.presence_penalty = 0.2;
            }

            const thirdPart = await this.makeRequest(thirdBody, rudeness);

            if (thirdPart.content && !thirdPart.content.includes('Ошибка') && !thirdPart.content.includes('сдох')) {
              combined = combined + '\n' + thirdPart.content;

              if (thirdPart.finishReason === 'length') {
                const fourthMessages = [
                  { role: 'system', content: system },
                  { role: 'assistant' as const, content: combined.slice(-3000) },
                  {
                    role: 'user' as const,
                    content: 'Код всё ещё не завершён. Допиши оставшуюся часть. Продолжи точно с места обрыва. Только код.'
                  }
                ];

                const fourthBody: Record<string, unknown> = {
                  model: selectedModel,
                  messages: fourthMessages,
                  max_tokens: maxTokens,
                  temperature: temp,
                };

                if (!selectedModel.includes('gemini') && !selectedModel.includes('gemma')) {
                  fourthBody.top_p = 0.85;
                  fourthBody.frequency_penalty = 0.2;
                  fourthBody.presence_penalty = 0.2;
                }

                const fourthPart = await this.makeRequest(fourthBody, rudeness);

                if (fourthPart.content && !fourthPart.content.includes('Ошибка') && !fourthPart.content.includes('сдох')) {
                  combined = combined + '\n' + fourthPart.content;
                }
              }
            }
          }

          return { content: this.cleanCombinedCode(combined) };
        }
      }

      return { content: result.content };
    } catch (err) {
      console.error('Network error:', err);
      return { content: this.errorMsg(rudeness, 'network') };
    }
  }

  private cleanCombinedCode(text: string): string {
    let cleaned = text;

    cleaned = cleaned.replace(/```(\w*)\n?/g, (match, _lang, offset) => {
      const before = cleaned.slice(0, offset);
      const openCount = (before.match(/```\w*\n?/g) || []).length;
      const closeCount = (before.match(/\n?```\s*$/gm) || []).length;
      if (openCount > closeCount) {
        return '';
      }
      return match;
    });

    const codeBlockOpen = (cleaned.match(/```\w+/g) || []).length;
    const codeBlockClose = (cleaned.match(/\n```\s*$/gm) || []).length;
    if (codeBlockOpen > codeBlockClose) {
      cleaned += '\n```';
    }

    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    return cleaned.trim();
  }

  private errorMsg(r: RudenessMode, t: 'server' | 'empty' | 'network' | 'ratelimit' | 'quota'): string {
    const m: Record<RudenessMode, Record<string, string[]>> = {
      polite: {
        server: ['Ошибка сервера. Попробуй ещё раз.', 'Сервер временно недоступен. Повтори через пару секунд.'],
        empty: ['Ответ не получен. Повтори запрос.', 'Не удалось получить ответ. Попробуй снова.'],
        network: ['Ошибка сети. Проверь подключение.', 'Нет соединения с сервером. Проверь интернет.'],
        ratelimit: ['Слишком много запросов. Подожди немного и попробуй снова.'],
        quota: ['Лимит API исчерпан. Попробуй другую модель.'],
      },
      rude: {
        server: ['Сервер прилёг. Ну бывает, жми ещё раз, гений.', 'Упало. Не стой столбом, жми заново.'],
        empty: ['Пусто пришло. Давай ещё разок, красавчик.', 'Ничего не вернулось. Жми, чудо.'],
        network: ['Сеть пропала. Роутер проверь, знаток.', 'Интернет кончился. Может, за него заплатить стоит?'],
        ratelimit: ['Притормози, скорострел. Слишком часто тыкаешь. Подожди чуть-чуть.'],
        quota: ['Лимит кончился на этой модели. Переключись на другую, умник.'],
      },
      very_rude: {
        server: ['Сервер сдох нахуй. Жми ещё раз.', 'Всё упало, блять. Давай заново.'],
        empty: ['Пусто, сука. Давай ещё раз.', 'Нихуя не пришло. Жми повторно.'],
        network: ['Сеть сдохла, блять. Роутер проверь.', 'Интернет кончился нахуй. Проверь подключение.'],
        ratelimit: ['Охуеть, спамер. Притормози нахуй, слишком часто долбишь. Подожди.'],
        quota: ['Лимит этой модели кончился, блять. Переключайся на другую, дегенерат.'],
      },
    };
    return pick(m[r][t]);
  }
}

export const aiService = new AIService();
