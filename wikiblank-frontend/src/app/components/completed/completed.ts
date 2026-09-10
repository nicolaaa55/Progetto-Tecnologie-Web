import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchService } from '../../services/match.service';

@Component({
  selector: 'app-completed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './completed.html',
  styleUrl: './completed.css'
})
export class Completed implements OnInit {
  matches: any[] = [];
  errorMessage = '';

  constructor(private matchService: MatchService, private changeDetector: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadMatches();
  }

  formatTime(seconds: number): string {
    if (!seconds || seconds <= 0) return '0 sec';

    if (seconds < 60) {
      return `${seconds} sec`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes < 60) {
      return remainingSeconds > 0 ? `${minutes} min e ${remainingSeconds} sec` : `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours < 24) {
      return remainingMinutes > 0 ? `${hours}h e ${remainingMinutes}min` : `${hours}h`;
    }

    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    if (days < 30) {
      return remainingHours > 0 ? `${days} giorni, ${remainingHours}h` : `${days} giorn${days === 1 ? 'o' : 'i'}`;
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
      return `${months} mes${months === 1 ? 'e' : 'i'}`;
    }

    const years = Math.floor(months / 12);
    return `${years} ann${years === 1 ? 'o' : 'i'}`;
  }

  loadMatches() {
    this.matchService.getCompletedMatches().subscribe({
      next: (matches) => {
        this.matches = matches;
        this.changeDetector.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Errore nel caricamento delle partite concluse.';
        this.changeDetector.detectChanges();
      }
    });
  }
}
