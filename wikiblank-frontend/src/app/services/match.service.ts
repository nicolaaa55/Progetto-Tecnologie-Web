import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry, timeout } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private baseUrl = 'http://localhost:3000/api/matches';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getGuestId(): string {
    let guestId = localStorage.getItem('guestId');
    if (!guestId) {
      guestId = crypto.randomUUID();
      localStorage.setItem('guestId', guestId);
    }
    return guestId;
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return token
      ? new HttpHeaders({ 'Authorization': `Bearer ${token}` })
      : new HttpHeaders();
  }

  getLeaderboard(): Observable<any> {
    return this.http.get(`${this.baseUrl}/leaderboard?t=${Date.now()}`).pipe(
      retry({ count: 2, delay: 300 })
    );
  }

  getCompletedMatches(): Observable<any> {
    return this.http.get(`${this.baseUrl}/completed?t=${Date.now()}`, { headers: this.getHeaders().set('X-Guest-Id', this.getGuestId()) }).pipe(
      retry({ count: 2, delay: 300 })
    );
  }

  async startNewMatch(): Promise<any> {
    const token = this.authService.getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    headers['X-Guest-Id'] = this.getGuestId();

    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${this.baseUrl}/new`, {
      method: 'POST',
      headers,
      body: '{}'
    });
    const body = await response.json();

    if (!response.ok) {
      throw { error: body };
    }

    return body;
  }

  makeGuess(matchId: number, guessWord: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${matchId}/guess`, { guess: guessWord }, { headers: this.getHeaders().set('X-Guest-Id', this.getGuestId()) });
  }

  abandonMatch(matchId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${matchId}/abandon`, {}, { headers: this.getHeaders().set('X-Guest-Id', this.getGuestId()) }).pipe(
      timeout(10000)
    );
  }
}