import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private currentApiUrl: string = environment.apiUrl;
  private isRailwayAvailable: boolean = true;

  constructor(private http: HttpClient) {
    this.checkRailwayAvailability();
  }

  /**
   * Verifica si Railway está disponible
   */
  private checkRailwayAvailability() {
    this.http.get(`${environment.apiUrl}/health`)
      .pipe(
        catchError(error => {
          console.log('Railway no disponible, usando local como fallback');
          this.isRailwayAvailable = false;
          this.currentApiUrl = environment.apiUrl;
          return of(null);
        })
      )
      .subscribe(() => {
        console.log('Railway disponible');
        this.isRailwayAvailable = true;
        this.currentApiUrl = environment.apiUrl;
      });
  }

  /**
   * Obtiene la URL de la API actual
   */
  getApiUrl(): string {
    return this.currentApiUrl;
  }

  /**
   * Verifica si está usando Railway
   */
  isUsingRailway(): boolean {
    return this.isRailwayAvailable;
  }

  /**
   * Realiza una petición HTTP con fallback automático
   */
  requestWithFallback<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any
  ): Observable<T> {
    const url = `${this.currentApiUrl}${endpoint}`;
    
    let request: Observable<T>;
    
    switch (method) {
      case 'GET':
        request = this.http.get<T>(url);
        break;
      case 'POST':
        request = this.http.post<T>(url, data);
        break;
      case 'PUT':
        request = this.http.put<T>(url, data);
        break;
      case 'DELETE':
        request = this.http.delete<T>(url);
        break;
      default:
        return throwError(() => new Error('Método HTTP no soportado'));
    }

    return request.pipe(
      catchError(error => {
        // Si falla Railway y estamos usando Railway, intentar con local
        if (this.isRailwayAvailable && this.currentApiUrl === environment.apiUrl) {
          console.log('Fallback a servidor local');
          this.currentApiUrl = environment.apiUrl;
          this.isRailwayAvailable = false;
          
          // Reintentar con la URL local
          const localUrl = `${environment.apiUrl}${endpoint}`;
          let localRequest: Observable<T>;
          
          switch (method) {
            case 'GET':
              localRequest = this.http.get<T>(localUrl);
              break;
            case 'POST':
              localRequest = this.http.post<T>(localUrl, data);
              break;
            case 'PUT':
              localRequest = this.http.put<T>(localUrl, data);
              break;
            case 'DELETE':
              localRequest = this.http.delete<T>(localUrl);
              break;
            default:
              return throwError(() => new Error('Método HTTP no soportado'));
          }
          
          return localRequest.pipe(
            catchError(localError => {
              console.error('Error en ambos servidores:', localError);
              return throwError(() => localError);
            })
          );
        }
        
        return throwError(() => error);
      })
    );
  }
} 