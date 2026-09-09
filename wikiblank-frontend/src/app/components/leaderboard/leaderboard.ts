import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchService } from '../../services/match.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.css',
})
export class Leaderboard implements OnInit {
  leaderboardList: any[] = [];
  errorMessage: string = '';

  constructor(private matchService: MatchService, private changeDetector: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadLeaderboard();
  }

  loadLeaderboard() {
    this.matchService.getLeaderboard().subscribe({
      next: (data) => {
        this.leaderboardList = data;
        this.changeDetector.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Errore nel caricamento della classifica.';
        this.changeDetector.detectChanges();
        console.error(err);
      }
    });
  }
}