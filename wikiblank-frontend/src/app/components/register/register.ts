import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  username = '';
  password = '';
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onRegister() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Compila tutti i campi.';
      return;
    }

    this.authService.register({ username: this.username, password: this.password }).subscribe({
      next: (response) => {
        this.successMessage = 'Registrazione riuscita! Reindirizzamento al login...';
        this.errorMessage = '';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        this.errorMessage = err.error.error || 'Errore durante la registrazione.';
        this.successMessage = '';
      }
    });
  }
}