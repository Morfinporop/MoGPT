// src/services/moodAnalyzer.ts

import type { Mood } from '../store/moodStore';

export class MoodAnalyzer {
  private history: Mood[] = [];

  analyze(userMessage: string, assistantResponse: string, emotionalTone: string): Mood {
    const userLower = userMessage.toLowerCase();

    let mood: Mood = 'neutral';

    if (this.matchesAny(userLower, [
      /блять|нахуй|ёбан|пиздец|сука|хуй|заебал|ебать/,
      /fuck|shit|damn|wtf|stfu|hate|angry|furious/,
      /!!!{2,}/,
    ])) {
      mood = 'angry';
    }
    else if (this.matchesAny(userLower, [
      /не\s*работает|ошибк|баг|сломал|не\s*могу|не\s*получается|бесит/,
      /doesn'?t\s*work|error|bug|broken|can'?t|failing|crash/,
      /почему\s*(?:не|опять)|again|still\s*not/,
    ])) {
      mood = 'frustrated';
    }
    else if (this.matchesAny(userLower, [
      /грустн|плохо|хреново|тоскл|одинок|депресс|устал|выгор/,
      /sad|depressed|lonely|tired|exhausted|hopeless|miserable/,
      /сил\s*нет|не\s*хочу\s*ничего/,
    ])) {
      mood = 'sad';
    }
    else if (this.matchesAny(userLower, [
      /ахуенн|офигенн|пиздат|база|кайф|ору|ахаха|вау|огонь|топ/,
      /amazing|awesome|incredible|wow|omg|perfect|love\s*it|insane|fire/,
      /!!!+/,
      /получилось|заработало|works|working|nailed\s*it|yes+/,
    ])) {
      mood = 'excited';
    }
    else if (this.matchesAny(userLower, [
      /спасибо|круто|класс|супер|помог|хорошо|отлично|молодец/,
      /thanks?|great|cool|nice|good|helped|beautiful|lovely|appreciate/,
    ])) {
      mood = 'positive';
    }
    else if (this.matchesAny(userLower, [
      /напиши\s*(?:рассказ|стих|историю|сказку|песню|сценарий)/,
      /придумай|сочини|фантази|воображ|идея\s*для/,
      /write\s*(?:story|poem|song|script)|create|imagine|brainstorm|idea/,
    ])) {
      mood = 'creative';
    }
    else if (this.matchesAny(userLower, [
      /напиши\s*код|сделай\s*функци|реализуй|имплемент|рефактор|оптимиз/,
      /write\s*code|implement|refactor|optimize|build|develop|architect/,
      /```/,
    ])) {
      mood = 'focused';
    }
    else if (this.matchesAny(userLower, [
      /расскажи|объясни|что\s*такое|как\s*работает|подскажи/,
      /explain|tell\s*me|what\s*is|how\s*does|describe|help\s*me\s*understand/,
    ])) {
      mood = 'calm';
    }

    if (emotionalTone === 'angry' && mood === 'neutral') mood = 'angry';
    if (emotionalTone === 'frustrated' && mood === 'neutral') mood = 'frustrated';
    if (emotionalTone === 'excited' && mood === 'neutral') mood = 'excited';
    if (emotionalTone === 'tired' && mood === 'neutral') mood = 'sad';

    if (this.history.length > 0) {
      const last = this.history[this.history.length - 1];
      if (mood === 'neutral' && ['angry', 'excited', 'frustrated'].includes(last)) {
        mood = last;
      }
    }

    this.history.push(mood);
    if (this.history.length > 10) this.history.shift();

    return mood;
  }

  private matchesAny(text: string, patterns: RegExp[]): boolean {
    return patterns.some(p => p.test(text));
  }

  reset(): void {
    this.history = [];
  }
}

export const moodAnalyzer = new MoodAnalyzer();
