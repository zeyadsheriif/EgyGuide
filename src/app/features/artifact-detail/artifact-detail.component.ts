import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiService, FeedbackRequest } from '../../core/services/api.service';
import { HistoryService } from '../history/history.service';
import { Artifact, ChatMessage } from '../../core/models/artifact.model';

@Component({
  selector: 'app-artifact-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './artifact-detail.component.html',
  styleUrl: './artifact-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArtifactDetailComponent implements OnInit {
  private router         = inject(Router);
  private route          = inject(ActivatedRoute);
  private apiService     = inject(ApiService);
  private translateSvc   = inject(TranslateService);
  private historyService = inject(HistoryService);

  artifact     = signal<Artifact | null>(null);
  chatMessages = signal<ChatMessage[]>([]);
  isLoading    = signal(false);
  isThinking   = signal(false);
  userMessage  = '';

  // Tracks which message index has received feedback: 'up' | 'down'
  feedbackState = signal<Record<number, 'up' | 'down'>>({});

  suggestedQuestions = [
    'detail.suggestedQ1',
    'detail.suggestedQ2',
    'detail.suggestedQ3'
  ];

  ngOnInit(): void {
    const raw = sessionStorage.getItem('currentArtifact');
    if (!raw) {
      this.router.navigate(['/upload']);
      return;
    }

    const art = JSON.parse(raw) as Artifact;
    this.artifact.set(art);

    // Start a history session for this artifact visit
    this.historyService.startSession({
      source: 'artifact',
      artifactName: art.landmark,
      imageUrl: art.imageUrl
    });

    const welcome = this.translateSvc.instant('detail.welcome', { name: art.landmark });
    this.chatMessages.set([{ role: 'assistant', content: welcome }]);
  }

  sendMessage(): void {
    if (!this.userMessage.trim() || this.isLoading()) return;
    const question = this.userMessage.trim();

    this.chatMessages.update(msgs => [...msgs, { role: 'user', content: question }]);
    this.userMessage = '';
    this.isLoading.set(true);
    this.isThinking.set(true);

    this.apiService.sendChatMessage(question).subscribe({
      next: (response) => {
        this.isThinking.set(false);
        this.chatMessages.update(msgs => [...msgs, { role: 'assistant', content: response.answer }]);
        this.isLoading.set(false);
      },
      error: () => {
        this.isThinking.set(false);
        this.chatMessages.update(msgs => [...msgs, { role: 'assistant', content: 'Sorry, I could not retrieve information at this time.' }]);
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