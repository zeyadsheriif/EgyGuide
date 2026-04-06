export interface Artifact {
  id: string;  
  landmark: string;  // Changed from 'name' to 'landmark'
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