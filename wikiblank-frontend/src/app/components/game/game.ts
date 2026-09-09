import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { MatchService } from '../../services/match.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game.html',
  styleUrl: './game.css',
})
export class Game implements OnInit {
  matchId: number | null = null;
  maskedText: string = '';
  guessWord: string = '';
  attempts: number = 0;
  status: string = 'IDLE';
  message: string = '';
  fullText: string = '';
  isStarting = false;
  isAbandoning = false;

  constructor(private matchService: MatchService, private changeDetector: ChangeDetectorRef) {}

  ngOnInit() {
  }

  async startNewGame() {
    if (this.isStarting || this.status === 'IN_PROGRESS') return;

    this.isStarting = true;
    this.message = '';

    try {
      const response = await this.matchService.startNewMatch();
      this.matchId = response.matchId;
      this.maskedText = response.maskedText;
      this.attempts = 0;
      this.status = 'IN_PROGRESS';
      this.message = 'Partita avviata! Indovina il titolo o l\'artista nascosto.';
      this.guessWord = '';
      this.fullText = '';
    } catch (err: any) {
      this.status = 'IDLE';
      this.message = err?.error?.error || 'Errore nella creazione della partita.';
    } finally {
      this.isStarting = false;
      this.changeDetector.detectChanges();
    }
  }

  makeGuess() {
    if (!this.matchId || !this.guessWord.trim()) return;

    this.matchService.makeGuess(this.matchId, this.guessWord.trim()).subscribe({
      next: (response) => {
        this.status = response.status;
        this.attempts = response.attempts;
        this.guessWord = '';

        if (response.status === 'WON') {
          this.maskedText = response.fullText;
          this.message = `🎉 Complimenti! Hai vinto in ${this.attempts} tentativi!`;
        } else {
          this.maskedText = response.maskedText;
          this.message = 'Tentativo registrato! Continua così.';
        }
      },
      error: (err) => {
        this.message = err.error.error || 'Errore durante l\'invio del tentativo.';
      }
    });
  }

  abandonGame() {
    if (!this.matchId || this.isAbandoning) return;

    this.isAbandoning = true;
    this.matchService.abandonMatch(this.matchId).pipe(
      finalize(() => {
        this.isAbandoning = false;
        this.changeDetector.detectChanges();
      })
    ).subscribe({
      next: (response) => {
        this.status = response.status;
        this.attempts = response.attempts;
        this.maskedText = response.maskedText;
        this.message = `Partita abbandonata. Il titolo corretto era: ${response.title}.`;
      },
      error: (err) => {
        this.message = err.error?.error || 'Errore durante l\'abbandono della partita.';
      }
    });
  }
}