import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

interface TeamMember {
  name: string;
  role: string;
  image: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutComponent {
  teamMembers: TeamMember[] = [
    { name: 'Salma', role: 'AI & ML Engineer', image: '' },
    { name: 'Dana', role: 'Computer Vision Engineer', image: '' },
    { name: 'Ziad', role: 'Backend Developer', image: '' },
    { name: 'Sama', role: 'Frontend Developer', image: '' }
  ];
}