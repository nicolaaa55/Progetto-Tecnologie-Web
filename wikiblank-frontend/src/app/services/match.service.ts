import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private baseUrl = 'http://localhost:3000/api/matches';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getLeaderboard(): Observable<any> {
    return this.http.get(`${this.baseUrl}/leaderboard`);
  }

  getCompletedMatches(): Observable<any> {
    return this.http.get(`${this.baseUrl}/completed`);
  }

  startNewMatch(): Observable<any> {
    return this.http.post(`${this.baseUrl}/new`, {}, { headers: this.getHeaders() });
  }

  makeGuess(matchId: number, guessWord: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${matchId}/guess`, { guess: guessWord }, { headers: this.getHeaders() });
  }
}