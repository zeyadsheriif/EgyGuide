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

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  /**
   * Upload artifact image for analysis
   */
  uploadArtifact(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<UploadResponse>(
      `${this.baseUrl}/api/upload`,
      formData
    );
  }

  /**
   * Send chat message about uploaded artifact (context-aware)
   * Use after image upload - backend knows which artifact you're asking about
   */
  sendChatMessage(question: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(
      `${this.baseUrl}/api/chat`,
      { question }
    );
  }

  /**
   * Send general chat message to LLM (no artifact context)
   * Use for standalone chat page - general Egyptian history questions
   */
  sendLLMChatMessage(question: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(
      `${this.baseUrl}/api/llm-chat`,
      { question }
    );
  }
}