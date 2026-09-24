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
  idPartita: number | null = null;
  testoMascherato = '';
  parolaTentata = '';
  tentativi = 0;
  stato = 'IDLE';
  messaggio = '';
  inAvvio = false;
  inAbbandono = false;

  constructor(
    private matchService: MatchService,
    private rilevatoreCambiamenti: ChangeDetectorRef,
  ) {}

  ngOnInit() {}

  async startNewGame() {
    if (this.inAvvio || this.stato === 'IN_PROGRESS') return;

    this.inAvvio = true;
    this.messaggio = '';

    try {
      const risposta = await this.matchService.startNewMatch();
      this.idPartita = risposta.matchId;
      this.testoMascherato = risposta.maskedText;
      this.tentativi = 0;
      this.stato = 'IN_PROGRESS';
      this.messaggio = "Partita avviata! Indovina il titolo o l'artista nascosto.";
      this.parolaTentata = '';
    } catch (errore: any) {
      this.stato = 'IDLE';
      this.messaggio = errore?.error?.error || 'Errore nella creazione della partita.';
    } finally {
      this.inAvvio = false;
      this.rilevatoreCambiamenti.detectChanges();
    }
  }

  inviaTentativo() {
    if (!this.idPartita || !this.parolaTentata.trim()) return;

    this.matchService.makeGuess(this.idPartita, this.parolaTentata.trim()).subscribe({
      next: (risposta) => {
        this.stato = risposta.status;
        this.tentativi = risposta.attempts;
        this.parolaTentata = '';

        if (risposta.status === 'WON') {
          this.testoMascherato = risposta.fullText;
          this.messaggio = `Complimenti! Hai vinto in ${this.tentativi} tentativi!`;
        } else {
          this.testoMascherato = risposta.maskedText;
          this.messaggio = 'Tentativo registrato! Continua così.';
        }

        this.rilevatoreCambiamenti.detectChanges();
      },
      error: (errore) => {
        this.messaggio = errore.error.error || "Errore durante l'invio del tentativo.";
        this.rilevatoreCambiamenti.detectChanges();
      },
    });
  }

  abbandonaPartita() {
    if (!this.idPartita || this.inAbbandono) return;

    this.inAbbandono = true;
    this.matchService
      .abandonMatch(this.idPartita)
      .pipe(
        finalize(() => {
          this.inAbbandono = false;
          this.rilevatoreCambiamenti.detectChanges();
        }),
      )
      .subscribe({
        next: (risposta) => {
          this.stato = risposta.status;
          this.tentativi = risposta.attempts;
          this.testoMascherato = risposta.maskedText;
          this.messaggio = `Partita abbandonata. Il titolo corretto era: ${risposta.title}.`;
        },
        error: (errore) => {
          this.messaggio = errore.error?.error || "Errore durante l'abbandono della partita.";
        },
      });
  }
}
