import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Artifact } from '../../core/models/artifact.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryComponent implements OnInit {
  readonly #router = inject(Router);

  allArtifacts: Artifact[] = [];
  artifacts = signal<Artifact[]>([]);
  searchQuery = signal('');
  sortMode = signal<'date' | 'name'>('date');

  ngOnInit(): void {
    const stored = localStorage.getItem('artifactHistory');
    this.allArtifacts = stored ? JSON.parse(stored) : [];
    this.artifacts.set(this.allArtifacts);
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.searchQuery.set(query);
    this.applyFilter();
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as 'date' | 'name';
    this.sortMode.set(value);
    this.applyFilter();
  }

  applyFilter(): void {
    const query = this.searchQuery();
    let filtered = this.allArtifacts.filter(a =>
      a.landmark?.toLowerCase().includes(query) ||
      a.location?.toLowerCase().includes(query) ||
      a.pharaoh?.toLowerCase().includes(query)
    );
    if (this.sortMode() === 'name') {
      filtered = filtered.sort((a, b) => a.landmark.localeCompare(b.landmark));
    }
    this.artifacts.set(filtered);
  }

  onArtifactClick(id: string): void {
    this.#router.navigate(['/artifact', id]);
  }
}