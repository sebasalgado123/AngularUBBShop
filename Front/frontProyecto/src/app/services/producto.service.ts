import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ConfigService } from './config.service';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private api = '/productos';

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {}

  private handleError(error: HttpErrorResponse) {
    console.error('Error en la petición HTTP:', error);
    return throwError(() => error);
  }

  crearProducto(data: FormData): Observable<any> {
    return this.configService.requestWithFallback('POST', this.api, data)
      .pipe(catchError(this.handleError));
  }

  actualizarProducto(id: number, data: FormData): Observable<any> {
    return this.configService.requestWithFallback('PUT', `${this.api}/${id}`, data)
      .pipe(catchError(this.handleError));
  }

  eliminarProducto(id: number): Observable<any> {
    return this.configService.requestWithFallback('DELETE', `${this.api}/${id}`)
      .pipe(catchError(this.handleError));
  }

  obtenerProducto(id: number): Observable<any> {
    return this.configService.requestWithFallback('GET', `${this.api}/${id}`)
      .pipe(catchError(this.handleError));
  }

  obtenerPorUsuario(usuarioId: number): Observable<any> {
    return this.configService.requestWithFallback('GET', `${this.api}/usuario/${usuarioId}`)
      .pipe(catchError(this.handleError));
  }

  obtenerTodos(): Observable<any> {
    return this.configService.requestWithFallback('GET', this.api)
      .pipe(catchError(this.handleError));
  }
} 