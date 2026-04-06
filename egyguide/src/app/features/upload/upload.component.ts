import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadComponent {
  readonly #router = inject(Router);
  readonly #apiService = inject(ApiService);

  isUnknown = signal(false);
  isDragging = signal(false);

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) this.handleFile(file);
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.handleFile(file);
  }

  handleFile(file: File): void {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) return;
    this.uploadToBackend(file);
  }

  uploadToBackend(file: File): void {
    this.convertFileToBase64(file).then(base64Image => {

      this.#apiService.uploadArtifact(file).subscribe({
        next: (response) => {

          const artifactWithId = {
            ...response,
            id: Date.now().toString(),
            imageUrl: base64Image,
            date: new Date().toLocaleDateString()
          };

          if (response.landmark === 'Unknown') {
            this.isUnknown.set(true);
            return; 
          }

          sessionStorage.setItem('currentArtifact', JSON.stringify(artifactWithId));

          const history = JSON.parse(localStorage.getItem('artifactHistory') || '[]');
          history.unshift(artifactWithId);
          localStorage.setItem('artifactHistory', JSON.stringify(history));

          this.#router.navigate(['/artifact', artifactWithId.id]);
        },

        error: () => {
          this.isUnknown.set(true);
        }
      });

    });
  }

  private convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  browseFiles(): void {
    document.getElementById('fileInput')?.click();
  }
}