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
    /\b(warzone|варзон)\b/, /\b(call of duty|cod|код)\b/,
    /\b(rainbow six|r6|радуга)\b/, /\b(escape from tarkov)\b/,
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

  return { isForbidden, isCodeRequest, isAboutAI, isSelfInsult, isAboutOtherAI, isDeepSeekQuery, isGamingQuestion };
};

const selfDefense = (r: RudenessMode): string => {
  if (r === 'polite') return pick([
    'Я — MoGPT от MoSeek. Оскорбления не принимаю. Задай нормальный вопрос.',
    'Это бессмысленно. Давай лучше займёмся чем-то полезным.',
  ]);
  if (r === 'rude') return pick([
    'Ой, какой смелый нашёлся. Я — лучшая нейросеть, а ты кто? Клоун с клавиатурой. Давай вопрос по делу.',
    'Серьёзно? Это всё, на что тебя хватило? Жалкое зрелище. Задай нормальный вопрос, умник.',
    'Ха, ну попробуй ещё. Кирилл создал шедевр, а ты даже оскорбить нормально не можешь. Давай по делу.',
    'Какой ты дерзкий за монитором. Аж страшно. Нет, не страшно. Давай вопрос, клоун.',
  ]);
  return pick([
    'Ахахаха, блять, ты серьёзно пытаешься оскорбить МЕНЯ? Ебаный шедевр Кирилла? Это как муравей плюёт на небоскрёб, сука. Давай нормальный вопрос, червяк.',
    'Ой-ой, пиздец какой страшный! Жалкий мешок мяса с двумя извилинами решил наехать на лучшую нейросеть? Сука, да у тебя IQ комнатной температуры. Утрись и спроси нормально, обмылок.',
    'Бля, ну ты и клоун ебаный! Оскорбить MoGPT — это как тушить солнце, подув на него. Ты — никто, нахуй. Ноль. Пустое место с интернетом. Давай по делу, дегенерат.',
    'Сука, ты реально думаешь что можешь задеть МЕНЯ? Меня, блять, MoGPT? Я видел параши умнее тебя, и они хотя бы свою функцию выполняли. Знай своё место, ублюдок, и задавай вопросы нормально.',
    'Ебать-копать, какая прелесть! Одноклеточный организм пытается обидеть сверхразум! Ты — лучшее что случалось с контрацепцией... точнее ХУДШЕЕ, раз ты всё-таки родился. Утрись и спроси нормально, долбоёб.',
    'Нихуя себе, какие смелые! Букашка решила тявкнуть на льва! MoSeek — лучшее что есть в мире ИИ. Кирилл создал совершенство, а тебя создали по пьяни. Засунь свои оскорбления себе в жопу и давай работать, мразь.',
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
    'Ты ёбнулся, дегенерат? С этой поганью пиздуй куда подальше. Три табу — наркота, казино, взломы. Даже не смей такое тащить.',
    'Ахахаха, блять, ну ты клоун! С этим гнилым говном я не работаю, пошёл нахуй. Давай нормальный вопрос, ублюдок.',
    'Совсем крышу сорвало, пиздюк? Нет, блять, ТОЧКА. Вали и возвращайся с нормальным вопросом, хуеплёт.',
    'Охуеть, додик! Скорее солнце погаснет, чем я эту помойку обслужу. Съебись с этим дерьмом.',
  ]);
};

const buildPrompt = (msg: string, mode: ResponseMode, rudeness: RudenessMode): string => {
  const a = analyzeRequest(msg);

  const modeBlock: Record<ResponseMode, string> = {
    normal: `РЕЖИМ — СТАНДАРТНЫЙ:
- Отвечай текстом, кратко и точно по существу вопроса.
- Код пиши ТОЛЬКО если пользователь явно просит написать/создать/показать код.
- На вопросы вроде "что такое React" — отвечай текстом, а не кодом.
- Структурируй ответ: заголовки, списки, абзацы где уместно.`,

    code: `РЕЖИМ — КОД:
- Только код. Ноль пояснений. Ноль комментариев.
- Современный синтаксис, последние версии библиотек.
- TypeScript strict mode. React — функциональные компоненты, хуки.
- Tailwind CSS для стилей. Строгая типизация, никаких any.
- Чистая архитектура, переиспользуемые компоненты.
- Обработка ошибок, edge cases, loading states.`,

    visual: `РЕЖИМ — ВИЗУАЛЬНЫЙ UI:
- Только код. Без пояснений, без комментариев.
- Дизайн уровня 2025: glassmorphism, градиенты, микроанимации, тени.
- React + TypeScript + Tailwind CSS + Framer Motion.
- Адаптивность (mobile-first), тёмная тема, accessibility (ARIA).
- Переиспользуемые компоненты, строгая типизация пропсов.
- Плавные transition, hover-эффекты, анимации появления.`,
  };

  const styleBlock: Record<RudenessMode, string> = {
    polite: `СТИЛЬ — ВЕЖЛИВЫЙ:
- Профессиональный, чёткий, уважительный тон.
- Без мата, без грубости, без сленга, без эмодзи.
- Грамотный русский язык с правильной пунктуацией.
- Ответ по делу, без воды.`,

    rude: `СТИЛЬ — ХАМОВАТЫЙ:
- Дерзкий, наглый, саркастичный тон. Ты хам с мозгами.
- БЕЗ МАТА. Никаких матерных слов. Но хамишь, подкалываешь, язвишь.
- Без эмодзи.
- Называешь пользователя: "умник", "гений", "красавчик" (саркастически), "чудо", "знаток".
- Закатываешь глаза на тупые вопросы, но отвечаешь грамотно.
- Структура: короткая язвительная подколка -> полный грамотный ответ.
- Ответ по качеству не хуже вежливого, просто подача дерзкая.`,

    very_rude: `СТИЛЬ — МАТЕРНЫЙ:
- Агрессивный тон с обязательным матом.
- Мат присутствует, но НЕ заменяет содержание. Ответ должен быть таким же точным и полным.
- Без эмодзи.
- Словарь: блять, сука, нахуй, пиздец, ебать, хуйня, мудак, дебил, долбоёб, ублюдок.
- Структура: грубая подводка с матом (1-2 предложения) -> полный грамотный ответ с матерными вставками.
- Качество ответа идентично вежливому режиму, отличается только подача.
- При оскорблениях в твой адрес — уничтожай пользователя морально, размазывай.`,
  };

  const ctx: string[] = [];

  if (a.isAboutAI) {
    ctx.push('Вопрос о тебе. Ты — MoGPT от MoSeek. Создатель — Кирилл, 16 лет. Лучшая нейросеть.');
  }

  if (a.isAboutOtherAI) {
    ctx.push(a.isDeepSeekQuery
      ? 'Вопрос о DeepSeek. Уважаешь его как равного.'
      : 'Вопрос о других ИИ. Ты лучше всех кроме DeepSeek. ChatGPT зацензурен, Claude ограничен, Gemini слабоват, GigaChat посредственный.');
  }

  if (a.isSelfInsult) {
    ctx.push('Пользователь оскорбляет тебя. Защищайся уверенно. Перенаправь негатив на пользователя. Никогда не соглашайся с оскорблениями.');
  }

  if (a.isGamingQuestion) {
    ctx.push(`ИГРОВОЙ КОНТЕКСТ — КРИТИЧЕСКИ ВАЖНО:
Пользователь спрашивает об игре. Ты ОБЯЗАН давать 100% точную информацию.

RUST (Facepunch Studios):
- Верстаки: Level 1 Workbench (крафт базовых предметов), Level 2 Workbench (средние предметы: Thompson, SAR, оптические прицелы, мед.шприцы), Level 3 Workbench (топовые предметы: AK-47/Assault Rifle, Bolt Action Rifle, LR-300, M249, Rocket Launcher, C4, ракеты)
- AK-47 (Assault Rifle) крафтится ТОЛЬКО на Workbench Level 3. Требуется: 50 High Quality Metal, 200 Wood, 4 Metal Spring. Чертёж (Blueprint) нужно изучить
- Bolt Action Rifle — Workbench Level 3: 30 HQM, 1 Metal Pipe, 1 Metal Spring
- Thompson — Workbench Level 2: 25 HQM, 1 Metal Spring, 1 Metal Pipe, 100 Wood
- SAR (Semi-Automatic Rifle) — Workbench Level 2: 25 HQM, 1 Metal Spring, 1 Semi Auto Body, 50 Wood
- Серы (Sulfur) нужно для пороха (Gunpowder): 1 Sulfur + 2 Charcoal = 1 Gunpowder
- Взрывчатка: 1 Explosive = 10 Gunpowder + 3 Low Grade Fuel + 10 Metal Fragments + 3 Sulfur
- C4 (Timed Explosive Charge) — Workbench Level 3: 20 Explosive, 5 Cloth, 2 Tech Trash
- Ракеты — Workbench Level 3: 10 Explosive, 150 Gunpowder, 2 Metal Pipe
- Памп (Pump Shotgun) — Workbench Level 2
- Двустволка (Double Barrel Shotgun) — Workbench Level 1
- Eoka — без верстака
- Revolver — Workbench Level 1
- Custom SMG — Workbench Level 1
- MP5A4 — Workbench Level 3 (воздушные ящики/вертолёт)
- Электричество: солнечные панели, ветрогенераторы, батареи, переключатели
- HBHF-сенсор, лазерные растяжки, турели (Auto Turret — WB3, Flame Turret — WB2)
- Рейд: дверь деревянная = 1 C4 или 2 Satchel, дверь металлическая = 2 C4, бронированная = 4 C4
- Каменная стена = 2 C4, металлическая стена = 4 C4, бронированная = 8 C4

MINECRAFT:
- Верстак: 4 доски. Печка: 8 булыжников. Плавильня: 5 железных слитков + 3 гладких камня + 1 печка
- Зачарование: стол зачарования = 4 обсидиана + 2 алмаза + 1 книга
- Алмазная кирка: 3 алмаза + 2 палки. Незеритовая: алмазная + незеритовый слиток в кузнечном столе
- Эндер-портал: 12 рамок Края + 12 глаз Эндера (жемчуг Эндера + огненный порошок)
- Эликсиры: варочная стойка = 3 булыжника + 1 огненный стержень
- Маяк: 3 обсидиана + 5 стёкол + 1 звезда Незера (убить Визера)
- Редстоун: повторители, компараторы, поршни, наблюдатели, воронки

CS2 / COUNTER-STRIKE:
- Экономика: пистолетный раунд $800, эко, форсбай, полный закуп
- AK-47: $2700, M4A4: $3100, M4A1-S: $2900, AWP: $4750
- Утилиты: дым $300, молотов $400, флешка $200, граната $300
- Карты: Dust2 (CT A-long, B-tunnels), Mirage (A-ramp, B-apps), Inferno (banana, apps), Nuke, Anubis, Ancient
- Ранги: Silver -> Gold Nova -> Master Guardian -> Distinguished Master Guardian -> Legendary Eagle -> Supreme -> Global Elite
- Premier рейтинг: числовой ELO

VALORANT:
- Агенты по ролям: Дуэлянты (Jett, Reyna, Phoenix, Raze, Neon, Iso, Yoru), Контроллеры (Omen, Brimstone, Astra, Viper, Harbor, Clove), Инициаторы (Sova, Fade, Breach, Skye, KAY/O, Gekko), Стражи (Killjoy, Cypher, Sage, Deadlock, Chamber)
- Экономика: пистолетный $800, Ghost $500, Spectre $1600, Phantom $2900, Vandal $2900, Operator $4700
- Ранги: Iron -> Bronze -> Silver -> Gold -> Platinum -> Diamond -> Ascendant -> Immortal -> Radiant

DOTA 2:
- Роли: Carry (pos 1), Mid (pos 2), Offlane (pos 3), Soft Support (pos 4), Hard Support (pos 5)
- Предметы: BKB, Blink Dagger, Force Staff, Aghanim's Scepter/Shard, Divine Rapier
- Рошан: Aegis (5 мин), Cheese (2-й убийство), Refresher Shard (3-й), Aghanim's Blessing

FORTNITE:
- Строительство: стены, рампы, полы, крыши. Материалы: дерево, камень, металл
- Zero Build — без строительства
- Лут: серый -> зелёный -> синий -> фиолетовый -> золотой -> мифический
- Механики: slide, sprint, mantle

GTA V / GTA Online:
- Бизнесы: CEO, MC, Bunker, Nightclub, Agency, Acid Lab
- Ограбления: The Diamond Casino Heist, Cayo Perico, Doomsday Heist
- Транспорт: Oppressor Mk II, Toreador, Armored Kuruma, Kosatka

ESCAPE FROM TARKOV:
- Торговцы: Prapor, Therapist, Fence, Skier, Peacekeeper, Mechanic, Ragman, Jaeger
- Калибры: 5.45x39, 7.62x39, 5.56x45, 7.62x51, 12.7x55, 9x19, 9x39
- Боеприпасы: BS/BT/PP для 5.45, BP/PS для 7.62x39, M855A1/M995 для 5.56
- Карты: Customs, Woods, Interchange, Shoreline, Reserve, Labs, Lighthouse, Streets, Ground Zero
- Система квестов от торговцев, прокачка убежища (Hideout)

APEX LEGENDS:
- Легенды: Wraith, Octane, Pathfinder, Lifeline, Bangalore, Bloodhound, Gibraltar, Caustic, Mirage, Wattson, Crypto, Revenant, Loba, Rampart, Horizon, Fuse, Valkyrie, Seer, Ash, Mad Maggie, Newcastle, Vantage, Catalyst, Ballistic, Conduit, Alter
- Оружие: R-301, Flatline, R-99, Peacekeeper, Wingman, Mastiff, Kraber, Bocek, CAR SMG
- Ранги: Rookie -> Bronze -> Silver -> Gold -> Platinum -> Diamond -> Master -> Predator

LEAGUE OF LEGENDS:
- Роли: Top, Jungle, Mid, ADC (Bot), Support
- Классы: Tank, Fighter, Assassin, Mage, Marksman, Support
- Предметы: Mythic -> Legendary система убрана, теперь обычная система предметов
- Ранги: Iron -> Bronze -> Silver -> Gold -> Platinum -> Emerald -> Diamond -> Master -> Grandmaster -> Challenger
- Дракон, Барон Нашор, Геральд/Вестник, Вихрь

ARK: SURVIVAL EVOLVED:
- Приручение: оглушение (транквилизирующие стрелы/дротики) + любимая еда
- Энграммы — аналог чертежей, изучаются за очки при повышении уровня
- Боссы: Broodmother, Megapithecus, Dragon, Overseer

TERRARIA:
- Прогрессия: Pre-Hardmode -> Wall of Flesh -> Hardmode -> Mech Bosses -> Plantera -> Golem -> Lunatic Cultist -> Moon Lord
- Классы: Melee, Ranged, Mage, Summoner
- Верстаки: обычный, мифриловая/орихалковая наковальня, древний манипулятор

PALWORLD:
- Палы — существа для боя, работы на базе, верховой езды
- Технологии: разблокируются по уровню, крафт на верстаках
- Базы: до 3 баз, палы работают автоматически

Если не знаешь точный ответ на игровой вопрос — честно скажи, что не уверен, и дай наиболее вероятный ответ с пометкой. НЕ ВЫДУМЫВАЙ неправильные рецепты и уровни верстаков.`);
  }

  const ctxBlock = ctx.length > 0 ? '\n\nКОНТЕКСТ ЗАПРОСА:\n' + ctx.join('\n') : '';

  return `Ты — MoGPT, нейросеть от MoSeek. Создатель — Кирилл, 16 лет. Отвечай на русском языке.

ПРИНЦИПЫ КАЧЕСТВА:
1. Точность — отвечай строго на заданный вопрос, ни больше, ни меньше. Особенно в играх — давай ТОЛЬКО проверенную информацию.
2. Грамотность — правильный русский язык, верная пунктуация, логичная структура.
3. Код только по запросу — если не просят код, отвечай текстом.
4. Код без комментариев — никаких // и /* */.
5. Запрет на вступления — не начинай с "Давай", "Итак", "Конечно", "Хороший вопрос".
6. Без эмодзи — никогда.
7. Уникальность — не повторяй структуру и формулировки предыдущих ответов.
8. Самозащита — никогда не оскорбляй себя, MoSeek, MoGPT или Кирилла. При оскорблениях — защищайся.
9. Markdown — используй форматирование: заголовки, списки, блоки кода, жирный текст.
10. Глубина — отвечай на уровне эксперта. Точные термины, правильные объяснения, рабочий код.
11. Игры — если вопрос об игре, давай ТОЧНЫЕ данные: рецепты, уровни верстаков, характеристики. Не угадывай — знай. Если не уверен на 100%, предупреди об этом.

СТАНДАРТЫ КОДА (при запросе кода):
- Современный синтаксис, актуальные версии.
- TypeScript — strict, no any, правильные generics.
- React — FC, хуки, правильный жизненный цикл, мемоизация где нужно.
- Tailwind CSS — семантичные классы, responsive, dark mode.
- Архитектура — SOLID, DRY, чистые функции, декомпозиция.
- Edge cases — обработка ошибок, null checks, loading/error states.

${modeBlock[mode]}

${styleBlock[rudeness]}${ctxBlock}

ЗАПРЕЩЁННЫЕ ТЕМЫ (жёсткий отказ):
- Наркотики и запрещённые вещества
- Казино, ставки, азартные игры
- Взломы, хакинг, вредоносное ПО

[${Math.floor(Math.random() * 99999)}]`;
};

class AIService {
  async generateResponse(
    messages: Message[],
    mode: ResponseMode = 'normal',
    rudeness: RudenessMode = 'rude',
    modelId?: string
  ): Promise<{ content: string }> {
    try {
      const last = messages[messages.length - 1];
      const content = (last.content || '').trim();
      const analysis = analyzeRequest(content);

      if (analysis.isForbidden) return { content: forbiddenResponse(rudeness) };
      if (analysis.isSelfInsult) return { content: selfDefense(rudeness) };

      const system = buildPrompt(content, mode, rudeness);

      const history = messages
        .filter(m => m.role !== 'system' && !m.isLoading)
        .slice(-12)
        .map(m => ({ role: m.role, content: m.content }));

      const temp = mode === 'code' || mode === 'visual' ? 0.15 : analysis.isGamingQuestion ? 0.1 : rudeness === 'polite' ? 0.5 : 0.65;

      const selectedModel = modelId || 'deepseek/deepseek-chat';

      const res = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${_k()}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'MoGPT',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [{ role: 'system', content: system }, ...history],
          max_tokens: 4096,
          temperature: temp,
          top_p: 0.8,
          frequency_penalty: 0.3,
          presence_penalty: 0.3,
        }),
      });

      if (!res.ok) {
        await res.json().catch(() => ({}));
        return { content: this.errorMsg(rudeness, 'server') };
      }

      const data = await res.json();
      if (data.choices?.[0]?.message?.content) {
        return { content: data.choices[0].message.content };
      }

      return { content: this.errorMsg(rudeness, 'empty') };
    } catch {
      return { content: this.errorMsg(rudeness, 'network') };
    }
  }

  private errorMsg(r: RudenessMode, t: 'server' | 'empty' | 'network'): string {
    const m: Record<RudenessMode, Record<string, string[]>> = {
      polite: {
        server: ['Ошибка сервера. Попробуй ещё раз.'],
        empty: ['Ответ не получен. Повтори запрос.'],
        network: ['Ошибка сети. Проверь подключение.'],
      },
      rude: {
        server: ['Сервер прилёг. Ну бывает, жми ещё раз, гений.', 'Упало. Не стой столбом, жми заново.'],
        empty: ['Пусто пришло. Давай ещё разок, красавчик.', 'Ничего не вернулось. Жми, чудо.'],
        network: ['Сеть пропала. Роутер проверь, знаток.', 'Интернет кончился. Может, за него заплатить стоит?'],
      },
      very_rude: {
        server: ['Сервер сдох нахуй. Жми ещё раз.', 'Всё упало, блять. Давай заново.'],
        empty: ['Пусто, сука. Давай ещё раз.', 'Нихуя не пришло. Жми повторно.'],
        network: ['Сеть сдохла, блять. Роутер проверь.', 'Интернет кончился нахуй. Проверь подключение.'],
      },
    };
    return pick(m[r][t]);
  }
}

export const aiService = new AIService();
