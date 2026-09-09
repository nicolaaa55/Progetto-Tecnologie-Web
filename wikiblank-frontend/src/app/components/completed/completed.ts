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

  formatDuration(seconds: number | null): string {
    if (seconds === null) return 'N/D';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes} min ${remainingSeconds}s` : `${remainingSeconds}s`;
  }
}
