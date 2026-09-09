import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

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
        </ul>
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="navbar-brand nav-link text-white" routerLink="/login">Login</a>
          </li>
          <li class="nav-item">
            <a class="navbar-brand nav-link text-white" routerLink="/register">Registrati</a>
          </li>
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
export class App {}