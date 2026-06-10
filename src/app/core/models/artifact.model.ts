export interface Artifact {
  id: string;
  landmark: string;
  imageUrl?: string;
  date?: string;
  dynasty: string;
  pharaoh: string;
  location: string;
  description: string;
}

export interface ArtifactHistory {
  artifacts: Artifact[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** One Q&A exchange inside a session */
export interface ChatExchange {
  question: string;
  answer: string;
  time: string;
}

/** A full conversation session (one artifact upload OR one general-chat visit) */
export interface ChatSession {
  id: string;
  startDate: string;
  source: 'artifact' | 'chat';
  artifactName?: string;
  imageUrl?: string;
  exchanges: ChatExchange[];
}