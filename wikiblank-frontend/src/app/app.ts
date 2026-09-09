import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <!-- Barra di Navigazione -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4 px-3">
      <a class="navbar-brand" routerLink="/game">🎹 WIKIBLANK</a>
      <div class="collapse navbar-collapse show">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <a class="navbar-brand nav-link text-white" routerLink="/game">Gioca</a>
          </li>
          <li class="nav-item">
            <a class="navbar-brand nav-link text-white" routerLink="/leaderboard">Classifiche</a>
          </li>
          <li class="nav-item">
            <a class="navbar-brand nav-link text-white" routerLink="/completed">Partite concluse</a>
          </li>
        </ul>
        <ul class="navbar-nav align-items-center">
          <ng-container *ngIf="authService.isLoggedIn(); else guestLinks">
            <li class="nav-item">
              <span class="navbar-text text-white me-3">Benvenuto, {{ authService.getUsername() }}!</span>
            </li>
            <li class="nav-item">
              <button class="btn btn-outline-light btn-sm" type="button" (click)="logout()">Esci</button>
            </li>
          </ng-container>
          <ng-template #guestLinks>
            <li class="nav-item">
              <a class="navbar-brand nav-link text-white" routerLink="/login">Login</a>
            </li>
            <li class="nav-item">
              <a class="navbar-brand nav-link text-white" routerLink="/register">Registrati</a>
            </li>
          </ng-template>
        </ul>
      </div>
    </nav>

    <!-- Area dinamica per le pagine -->
    <div class="container">
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: []
})
export class App {
  constructor(public authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}