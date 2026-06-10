import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface UploadResponse {
  landmark: string;
  dynasty: string;
  pharaoh: string;
  location: string;
  description: string;
}

export interface ChatRequest {
  question: string;
}

export interface ChatResponse {
  answer: string;
}

export interface FeedbackRequest {
  question: string;
  answer: string;
  rating: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private http = inject(HttpClient);

  // Local backend for image upload/classification
  private uploadBaseUrl = environment.uploadApiUrl;

  // Colab GPU backend for chats
  private chatBaseUrl = environment.chatApiUrl;

  /**
   * Upload artifact image for analysis
   */
  uploadArtifact(file: File): Observable<UploadResponse> {

    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<UploadResponse>(
      `${this.uploadBaseUrl}/api/upload`,
      formData
    );
  }

  /**
   * Send chat message about uploaded artifact
   * Uses Colab GPU backend
   */
  sendChatMessage(question: string): Observable<ChatResponse> {

    return this.http.post<ChatResponse>(
      `${this.chatBaseUrl}/api/chat`,
      { question }
    );
  }

  /**
   * General standalone AI chat
   * Uses Colab GPU backend
   */
  sendLLMChatMessage(question: string): Observable<ChatResponse> {

    return this.http.post<ChatResponse>(
      `${this.chatBaseUrl}/api/llm-chat`,
      { question }
    );
  }

  /**
   * Send user feedback for an AI response
   * Uses local backend (uploadApiUrl)
   */
  sendFeedback(data: FeedbackRequest): Observable<void> {

    return this.http.post<void>(
      `${this.uploadBaseUrl}/api/feedback`,
      data
    );
  }

}