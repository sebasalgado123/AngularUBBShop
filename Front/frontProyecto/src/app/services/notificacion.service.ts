import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private api = `${environment.apiUrl}/notificaciones`;
  constructor(private http: HttpClient) {}

  obtenerNotificaciones(): Observable<any[]> {
    return this.http.get<any[]>(this.api).pipe(
      catchError(this.handleError)
    );
  }

  marcarLeidas(): Observable<any> {
    return this.http.put(`${this.api}/leer`, {}).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error en servicio de notificaciones:', error);
    return throwError(() => error);
  }
} 