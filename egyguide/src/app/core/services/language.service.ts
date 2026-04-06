import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly #translate = inject(TranslateService);

  currentLang = signal<string>('en');

  init(): void {
    this.#translate.addLangs(['en', 'ar']);
    this.#translate.setDefaultLang('en');
    this.#translate.use('en');
  }

  setLanguage(lang: string): void {
    this.#translate.use(lang);
    this.currentLang.set(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }

  get isRtl(): boolean {
    return this.currentLang() === 'ar';
  }
}