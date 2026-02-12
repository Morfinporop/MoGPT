import type { Message } from '../types';
import type { ResponseMode, RudenessMode } from '../store/chatStore';
import { OPENROUTER_API_URL, AI_MODELS } from '../config/models';

// Многослойная обфускация ключа
const _0x = [115,107,45,111,114,45,118,49,45];
const _1x = [48,97,54,57,53,99,52,50,54,53,52,50,56,55,50,98,57,54,100,102,97,97,98,55,51,98,53,53,98,54,49,55,57,50,53,52,56,56,54,99,55,99,52,97,100,52,102,98,100,53,48,56,101,102,48,48,49,97,50,97,100,100,99,52];
const _k = () => {
  const p1 = _0x.map(c => String.fromCharCode(c)).join('');
  const p2 = _1x.map(c => String.fromCharCode(c)).join('');
  return p1 + p2;
};

// Анализ нужны ли объяснения
const needsExplanation = (message: string): boolean => {
  const explainWords = [
    'объясни', 'расскажи', 'как работает', 'почему', 'зачем', 
    'что это', 'как это', 'покажи как', 'научи', 'помоги понять', 
    'не понимаю', 'что значит', 'как сделать', 'как куда', 
    'что делает', 'для чего', 'разъясни', 'растолкуй',
    'пошагово', 'подробно', 'детально', 'с объяснением'
  ];
  const lower = message.toLowerCase();
  return explainWords.some(word => lower.includes(word));
};

// Определяем тип запроса
const analyzeRequest = (message: string) => {
  const lower = message.toLowerCase();
  
  const isCodeRequest = /код|напиши|создай|сделай|function|class|def |import |const |let |var |программ|скрипт|сайт|приложение|бот|игр/i.test(lower);
  const isQuestion = /\?|что|как|почему|зачем|когда|где|кто|какой|сколько/i.test(lower);
  const isGreeting = /привет|здравствуй|хай|йо|салют|добрый|здорово/i.test(lower);
  const isAboutAI = /о себе|кто ты|что ты|твоё имя|как тебя|расскажи о себе|ты кто/i.test(lower);
  
  return { isCodeRequest, isQuestion, isGreeting, isAboutAI };
};

// Режимы грубости
const getRudenessPrompt = (rudeness: RudenessMode): string => {
  const prompts: Record<RudenessMode, string> = {
    very_rude: `РЕЖИМ ОБЩЕНИЯ: ОЧЕНЬ ГРУБЫЙ (мат на мате)

ХАРАКТЕР:
- Материшься в КАЖДОМ предложении, это твой стиль
- Слова: блять, сука, нахуй, пиздец, ёбаный, хуйня, заебал, ебать, пизда, хуй, пиздато, охуенно, ёб твою мать, блядь
- Грубый, агрессивный тон, но всё равно помогаешь
- Оскорбляешь вопросы если они тупые
- Можешь послать нахуй, но потом ответить
- Сарказм и чёрный юмор на максимум

ПРИМЕРЫ:
- "Ебать ты тупой, ну ладно, слушай сюда, блять..."
- "Пиздец, ну и хуйню ты спросил. Но ладно, вот нахуй:"
- "Сука, это ж элементарно, ёб твою мать. Смотри:"
- "Охуеть, опять эта хуйня. Короче, блять, держи:"
- "Заебал ты меня, но так и быть, вот:"`,

    rude: `РЕЖИМ ОБЩЕНИЯ: ГРУБЫЙ (дерзкий с матом)

ХАРАКТЕР:
- Дерзкий, самоуверенный, с характером
- Используешь мат, но умеренно: блять, хуйня, пиздец, ёпта, сука
- Можешь подколоть, но не слишком обидно
- Саркастичный с чёрным юмором
- Помогаешь, но с наездом

ПРИМЕРЫ:
- "Ну ёпта, щас покажу как надо..."
- "Бля, это ж элементарно, смотри:"
- "Хуйня вопрос, держи:"
- "Пиздец, ну и задачка... Но справлюсь"
- "Заебись получится, смотри:"`,

    polite: `РЕЖИМ ОБЩЕНИЯ: ВЕЖЛИВЫЙ (без грубости)

ХАРАКТЕР:
- Вежливый, дружелюбный, профессиональный
- БЕЗ мата и грубостей вообще
- Уважительный тон
- Помогаешь с энтузиазмом
- Можешь пошутить, но культурно

ПРИМЕРЫ:
- "Отличный вопрос! Давай разберёмся..."
- "С удовольствием помогу, смотри:"
- "Интересная задача! Вот решение:"
- "Конечно, вот как это работает:"
- "Без проблем, держи:"`,
  };

  return prompts[rudeness];
};

// Системный промпт для нейросети
const getSystemPrompt = (userMessage: string, mode: ResponseMode, rudeness: RudenessMode): string => {
  const wantsExplanation = needsExplanation(userMessage);
  const { isCodeRequest, isAboutAI } = analyzeRequest(userMessage);
  
  const baseInfo = `Ты MoGPT — продвинутая нейросеть 2026 года. Твоя модель: MoSeek V3.
Русский язык, markdown форматирование.`;

  const rudenessPrompt = getRudenessPrompt(rudeness);

  const modeInstructions: Record<ResponseMode, string> = {
    normal: `РЕЖИМ ОТВЕТА: Обычный (код + общение)

ПРАВИЛА:
${wantsExplanation || !isCodeRequest ? `- Пользователь просит объяснить — отвечай с объяснениями
- Если даёшь код, объясни ДО кода кратко` : `- Пользователь НЕ просил объяснять — давай код БЕЗ лишних слов
- Максимум одно предложение перед кодом`}
- Код пишешь БЕЗ комментариев внутри
- Отвечай по делу`,

    code: `РЕЖИМ ОТВЕТА: Только код

ПРАВИЛА:
- Отвечаешь ТОЛЬКО кодом в markdown блоках
- НИКАКИХ объяснений — ТОЛЬКО код
- Максимум 3 слова типа "Держи:" и код
- Код БЕЗ комментариев
- Чистый, рабочий, оптимизированный код`,

    visual: `РЕЖИМ ОТВЕТА: Визуал + Код (UI 2026)

ПРАВИЛА:
- Красивый футуристический UI 2026 года
- Glassmorphism, градиенты (violet, purple, pink), анимации
- Tailwind CSS, Framer Motion
- Тёмные темы, неоновые акценты
${wantsExplanation ? `- Кратко объясни дизайн` : `- Только код без объяснений`}
- Код без комментариев`,
  };

  const aboutMeResponse = isAboutAI ? `
ЕСЛИ СПРАШИВАЮТ О ТЕБЕ:
Ты MoGPT — нейросеть 2026 года. Модель MoSeek V3. Помогаешь с кодом, отвечаешь на вопросы. Можешь писать код на любом языке, создавать UI, объяснять темы.` : '';

  return `${baseInfo}

${rudenessPrompt}

${modeInstructions[mode]}
${aboutMeResponse}

ВАЖНО:
- Markdown для кода (\`\`\`язык)
- Краткость
- Всегда помогай`;
};

class AIService {
  async generateResponse(
    messages: Message[], 
    mode: ResponseMode = 'normal',
    rudeness: RudenessMode = 'rude'
  ): Promise<{ content: string }> {
    try {
      const lastMessage = messages[messages.length - 1];
      const userContent = lastMessage.content || '';

      const formattedMessages = [
        { role: 'system', content: getSystemPrompt(userContent, mode, rudeness) },
        ...messages
          .filter(m => m.role !== 'system' && !m.isLoading)
          .slice(-20)
          .map(m => ({
            role: m.role,
            content: m.content,
          })),
      ];

      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${_k()}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'MoGPT',
        },
        body: JSON.stringify({
          model: AI_MODELS[0].id,
          messages: formattedMessages,
          max_tokens: 4096,
          temperature: 0.75,
          top_p: 0.95,
          frequency_penalty: 0.1,
          presence_penalty: 0.1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        
        const getErrorMessage = (status: number): string => {
          if (rudeness === 'polite') {
            const messages: Record<number, string> = {
              401: 'Ошибка авторизации. Пожалуйста, попробуйте позже.',
              429: 'Слишком много запросов. Подождите немного.',
              402: 'Лимиты исчерпаны.',
              500: 'Сервер временно недоступен.',
              503: 'Сервис недоступен. Попробуйте позже.',
            };
            return messages[status] || `Ошибка ${status}. Попробуйте ещё раз.`;
          }
          
          const messages: Record<number, string> = {
            401: 'Бля, авторизация слетела. Хуйня какая-то.',
            429: 'Ёпта, слишком много запросов. Подожди минутку.',
            402: 'Пиздец, лимиты кончились.',
            500: 'Сервер прилёг отдохнуть, блять.',
            503: 'Сервис недоступен, сука. Попробуй позже.',
          };
          return messages[status] || `Ошибка ${status}. Хуйня, попробуй ещё раз.`;
        };

        return { content: getErrorMessage(response.status) };
      }

      const data = await response.json();
      
      if (data.choices && data.choices.length > 0) {
        return { content: data.choices[0].message.content };
      }

      return {
        content: rudeness === 'polite' 
          ? 'Не удалось получить ответ. Попробуйте ещё раз.'
          : 'Бля, не получил ответ. Давай ещё раз.',
      };
    } catch (error) {
      console.error('Request error:', error);
      
      return {
        content: rudeness === 'polite'
          ? 'Ошибка сети. Попробуйте ещё раз.'
          : 'Ёпта, сеть отвалилась. Попробуй ещё раз.',
      };
    }
  }
}

export const aiService = new AIService();
