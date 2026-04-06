import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../core/services/api.service';
import { Artifact, ChatMessage } from '../../core/models/artifact.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-artifact-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './artifact-detail.component.html',
  styleUrl: './artifact-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArtifactDetailComponent implements OnInit {
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #apiService = inject(ApiService);
  readonly #translate = inject(TranslateService);

  artifact = signal<Artifact | null>(null);
  chatMessages = signal<ChatMessage[]>([]);
  isLoading = signal(false);
  userMessage = '';

  // Translation keys used via | translate in template
  suggestedQuestions = [
    'detail.suggestedQ1',
    'detail.suggestedQ2',
    'detail.suggestedQ3'
  ];

  ngOnInit(): void {
    // Get artifact data from sessionStorage
    const artifactData = sessionStorage.getItem('currentArtifact');
    console.log('Retrieved artifact data:', artifactData);

    if (artifactData) {
      const artifact = JSON.parse(artifactData);
      console.log('Parsed artifact:', artifact);
      console.log('Image URL:', artifact.imageUrl);
      this.artifact.set(artifact);

      // Initialize with welcome message
      this.chatMessages.set([
        {
          role: 'assistant',
          content: `Welcome! I've analyzed your artifact: ${artifact.landmark}. Feel free to ask me anything about it!`
        }
      ]);
    } else {
      // No artifact data, redirect to upload
      this.#router.navigate(['/upload']);
    }
  }

  sendMessage(): void {
    if (!this.userMessage.trim() || this.isLoading()) return;

    const question = this.userMessage;

    // Add user message to chat
    this.chatMessages.update(msgs => [...msgs, { role: 'user', content: question }]);

    // Clear input
    this.userMessage = '';
    this.isLoading.set(true);

    // Send to backend - backend handles landmark context
    this.#apiService.sendChatMessage(question).subscribe({
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