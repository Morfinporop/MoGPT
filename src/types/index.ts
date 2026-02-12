export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  model?: string;
  thinking?: string;
  isTyping?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  provider: string;
  icon: string;
  color: string;
}

export interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatState {
  chats: Chat[];
  currentChatId: string | null;
  isGenerating: boolean;
  sidebarOpen: boolean;
  
  // Actions
  createNewChat: () => string;
  deleteChat: (id: string) => void;
  setCurrentChat: (id: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => string;
  updateMessage: (id: string, content: string, thinking?: string) => void;
  getCurrentMessages: () => Message[];
  setGenerating: (value: boolean) => void;
  toggleSidebar: () => void;
}
