import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-analyzing',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './analyzing.component.html',
  styleUrl: './analyzing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyzingComponent implements OnInit {
  readonly #router = inject(Router);

  progress = signal(0);

  ngOnInit(): void {
    // Simulate analyzing progress
    const interval = setInterval(() => {
      this.progress.update(v => {
        if (v >= 100) {
          clearInterval(interval);
          // Navigate to artifact detail after completion
          this.#router.navigate(['/artifact', '1']);
          return 100;
        }
        return v + 2;
      });
    }, 50);
  }
}