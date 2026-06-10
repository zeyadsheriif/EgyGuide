import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../core/services/api.service';
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
  userMessage  = '';

  readonly isThinking = signal(false);

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

  sendSuggestedQuestion(questionKey: string): void {
    this.userMessage = this.translateSvc.instant(questionKey);
    this.sendMessage();
  }
}