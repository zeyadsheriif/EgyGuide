import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(c => c.HomeComponent)
  },
  {
    path: 'chat',
    loadComponent: () => import('./features/chat/chat.component').then(c => c.ChatComponent)
  },
  {
    path: 'history',
    loadComponent: () => import('./features/history/history.component').then(c => c.HistoryComponent)
  },
  {
    path: 'upload',
    loadComponent: () => import('./features/upload/upload.component').then(c => c.UploadComponent)
  },
  {
    path: 'analyzing',
    loadComponent: () => import('./features/analyzing/analyzing.component').then(c => c.AnalyzingComponent)
  },
  {
    path: 'artifact/:id',
    loadComponent: () => import('./features/artifact-detail/artifact-detail.component').then(c => c.ArtifactDetailComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about.component').then(c => c.AboutComponent)  // Updated
  },
  {
    path: '**',
    redirectTo: ''
  }
];