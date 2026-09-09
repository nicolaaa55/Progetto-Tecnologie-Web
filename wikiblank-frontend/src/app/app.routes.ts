import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Game } from './components/game/game';
import { Leaderboard } from './components/leaderboard/leaderboard';
import { Completed } from './components/completed/completed';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'game',
    pathMatch: 'full'
  },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'game', component: Game },
  { path: 'leaderboard', component: Leaderboard },
  { path: 'completed', component: Completed },
  { path: '**', redirectTo: 'login' }
];