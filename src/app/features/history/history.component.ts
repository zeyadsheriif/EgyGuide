import {
  Component, ChangeDetectionStrategy, signal,
  inject, OnInit, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HistoryService } from './history.service';
import { ChatSession } from '../../core/models/artifact.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryComponent implements OnInit {
  private historyService = inject(HistoryService);

  allSessions  = signal<ChatSession[]>([]);
  searchQuery  = signal('');
  activeFilter = signal<'all' | 'artifact' | 'chat'>('all');

  /** Tracks which exchange answer is expanded: key = "sessionId-exchangeIndex" */
  expandedKeys = signal<Set<string>>(new Set());

  readonly PREVIEW_LEN = 200;

  filteredSessions = computed(() => {
    const q      = this.searchQuery().toLowerCase().trim();
    const filter = this.activeFilter();

    return this.allSessions().filter(s => {
      const matchesFilter = filter === 'all' || s.source === filter;
      const matchesQuery  = !q ||
        (s.artifactName?.toLowerCase().includes(q) ?? false) ||
        s.exchanges.some(e =>
          e.question.toLowerCase().includes(q) ||
          e.answer.toLowerCase().includes(q)
        );
      return matchesFilter && matchesQuery;
    });
  });

  ngOnInit(): void {
    this.allSessions.set(this.historyService.getAll());
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  setFilter(f: 'all' | 'artifact' | 'chat'): void {
    this.activeFilter.set(f);
  }

  /** Toggle expand/collapse for a single exchange answer */
  toggleExpand(sessionId: string, index: number): void {
    const key = `${sessionId}-${index}`;
    this.expandedKeys.update(keys => {
      const next = new Set(keys);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  isExpanded(sessionId: string, index: number): boolean {
    return this.expandedKeys().has(`${sessionId}-${index}`);
  }

  preview(text: string): string {
    return text.length > this.PREVIEW_LEN
      ? text.slice(0, this.PREVIEW_LEN) + '…'
      : text;
  }

  deleteSession(id: string): void {
    this.historyService.deleteSession(id);
    this.allSessions.set(this.historyService.getAll());
    // Clean up expand keys for this session
    this.expandedKeys.update(keys => {
      const next = new Set(keys);
      [...next].filter(k => k.startsWith(id)).forEach(k => next.delete(k));
      return next;
    });
  }

  clearAll(): void {
    if (!window.confirm('Clear all conversation history? This cannot be undone.')) return;
    this.historyService.clearAll();
    this.allSessions.set([]);
    this.expandedKeys.set(new Set());
  }
}