import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../core/services/api.service';
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
  readonly #apiService = inject(ApiService);
  readonly #translate = inject(TranslateService);

  chatMessages = signal<ChatMessage[]>([]);
  isLoading = signal(false);
  userMessage = '';

  // Translation keys used via | translate in template
  suggestedQuestions = [
    'chat.suggestedQ1',
    'chat.suggestedQ2',
    'chat.suggestedQ3'
  ];

  sendMessage(): void {
    if (!this.userMessage.trim() || this.isLoading()) return;

    const question = this.userMessage;

    // Add user message
    this.chatMessages.update(msgs => [...msgs, { role: 'user', content: question }]);

    // Clear input
    this.userMessage = '';
    this.isLoading.set(true);

    // Send to LLM chat endpoint (general Egyptian history)
    this.#apiService.sendLLMChatMessage(question).subscribe({
      next: (response) => {
        this.chatMessages.update(msgs => [...msgs, { role: 'assistant', content: response.answer }]);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  sendSuggestedQuestion(questionKey: string): void {
    const translated = this.#translate.instant(questionKey); 
    this.userMessage = translated;
    this.sendMessage();
  }
}