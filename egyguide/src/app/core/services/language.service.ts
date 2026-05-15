import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private translate = inject(TranslateService);

  currentLang = signal<string>('en');

  readonly supportedLangs = ['en', 'ar', 'fr', 'zh', 'de'];

  init(): void {
    const savedLang = localStorage.getItem('lang') || 'en';
    const lang = this.supportedLangs.includes(savedLang) ? savedLang : 'en';
    this.translate.addLangs(this.supportedLangs);
    this.translate.setDefaultLang('en');
    this.setLanguage(lang);
  }

  setLanguage(lang: string): void {
    this.translate.use(lang);
    this.currentLang.set(lang);
    // Only Arabic is RTL
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);
  }

  get isRtl(): boolean {
    return this.currentLang() === 'ar';
  }
}