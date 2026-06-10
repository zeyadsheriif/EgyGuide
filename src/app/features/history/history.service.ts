import { Injectable } from '@angular/core';
import { ChatSession, ChatExchange } from '../../core/models/artifact.model';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private readonly KEY = 'chatSessions';
  private currentSessionId: string | null = null;

  /**
   * Call once when a component starts (artifact upload or chat page first message).
   * Creates a new session entry and stores it in localStorage.
   */
  startSession(data: {
    source: 'artifact' | 'chat';
    artifactName?: string;
    imageUrl?: string;
  }): void {
    const session: ChatSession = {
      id: Date.now().toString(),
      startDate: new Date().toLocaleString(),
      source: data.source,
      artifactName: data.artifactName,
      imageUrl: data.imageUrl,
      exchanges: []
    };
    const all = this.getAll();
    all.unshift(session);
    localStorage.setItem(this.KEY, JSON.stringify(all));
    this.currentSessionId = session.id;
  }

  /**
   * Append one Q&A pair to the active session.
   * Safe to call even if no session was started (no-op).
   */
  addExchange(exchange: Omit<ChatExchange, 'time'>): void {
    if (!this.currentSessionId) return;
    const all = this.getAll();
    const session = all.find(s => s.id === this.currentSessionId);
    if (!session) return;
    session.exchanges.push({
      ...exchange,
      time: new Date().toLocaleTimeString()
    });
    localStorage.setItem(this.KEY, JSON.stringify(all));
  }

  getAll(): ChatSession[] {
    try {
      return JSON.parse(localStorage.getItem(this.KEY) || '[]');
    } catch {
      return [];
    }
  }

  deleteSession(id: string): void {
    const filtered = this.getAll().filter(s => s.id !== id);
    localStorage.setItem(this.KEY, JSON.stringify(filtered));
  }

  clearAll(): void {
    localStorage.removeItem(this.KEY);
    this.currentSessionId = null;
  }
}