import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  username = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Inserisci username e password.';
      return;
    }

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token, response.username);
        this.router.navigate(['/game']);
      },
      error: (err) => {
        this.errorMessage = err.error.error || 'Credenziali non valide.';
      }
    });
  }
}