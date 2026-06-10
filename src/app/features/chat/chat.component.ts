import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiService, FeedbackRequest } from '../../core/services/api.service';
import { HistoryService } from '../history/history.service';
import { ChatMessage } from '../../core/models/artifact.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponent {
  private apiService     = inject(ApiService);
  private translateSvc   = inject(TranslateService);
  private historyService = inject(HistoryService);

  chatMessages   = signal<ChatMessage[]>([]);
  isLoading      = signal(false);
  isThinking     = signal(false);
  userMessage    = '';
  private sessionStarted = false;

  // Tracks which message index has received feedback: 'up' | 'down' | null
  feedbackState = signal<Record<number, 'up' | 'down'>>({});

  suggestedQuestions = [
    'chat.suggestedQ1',
    'chat.suggestedQ2',
    'chat.suggestedQ3'
  ];

  sendMessage(): void {
    const question = this.userMessage.trim();
    if (!question || this.isLoading()) return;

    // Start a general-chat session on the very first message of this visit
    if (!this.sessionStarted) {
      this.historyService.startSession({ source: 'chat' });
      this.sessionStarted = true;
    }

    this.chatMessages.update(msgs => [...msgs, { role: 'user', content: question }]);
    this.userMessage = '';
    this.isLoading.set(true);
    this.isThinking.set(true);

    this.apiService.sendLLMChatMessage(question).subscribe({
      next: (response) => {
        this.isThinking.set(false);
        this.chatMessages.update(msgs => [
          ...msgs,
          { role: 'assistant', content: response.answer }
        ]);
        this.isLoading.set(false);

        // Append to the current session
        this.historyService.addExchange({ question, answer: response.answer });
      },
      error: () => {
        this.isThinking.set(false);
        this.isLoading.set(false);
      }
    });
  }

  sendFeedback(messageIndex: number, rating: 'up' | 'down'): void {
    // Prevent sending feedback twice for the same message
    if (this.feedbackState()[messageIndex]) return;

    const messages = this.chatMessages();
    const assistantMessage = messages[messageIndex];

    // Find the closest preceding user message as the question
    let question = '';
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        question = messages[i].content;
        break;
      }
    }

    const payload: FeedbackRequest = {
      question,
      answer: assistantMessage.content,
      rating
    };

    this.apiService.sendFeedback(payload).subscribe({
      next: () => {
        // Lock the button state so user can't change it after submission
        this.feedbackState.update(state => ({ ...state, [messageIndex]: rating }));
      },
      error: (err) => {
        console.error('Feedback error:', err);
      }
    });
  }

  sendSuggestedQuestion(questionKey: string): void {
    this.userMessage = this.translateSvc.instant(questionKey);
    this.sendMessage();
  }
}