import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  ElementRef,
  HostListener
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  private langService = inject(LanguageService);
  private elRef = inject(ElementRef);

  currentLang = this.langService.currentLang;
  isDropdownOpen = signal(false);

  languages = [
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية'},
    { code: 'fr', label: 'Français' },
    { code: 'zh', label: '中文'},
    { code: 'de', label: 'Deutsch' },
  ];

  toggleDropdown(): void {
    this.isDropdownOpen.update(v => !v);
  }

  selectLanguage(code: string): void {
    this.langService.setLanguage(code);
    this.isDropdownOpen.set(false);
  }

  /** Close dropdown when clicking outside the header component */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen.set(false);
    }
  }
}