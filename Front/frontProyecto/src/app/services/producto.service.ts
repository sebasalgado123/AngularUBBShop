import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private api = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    console.error('Error en la petición HTTP:', error);
    return throwError(() => error);
  }

  crearProducto(data: FormData): Observable<any> {
    return this.http.post(this.api, data)
      .pipe(catchError(this.handleError));
  }

  actualizarProducto(id: number, data: FormData): Observable<any> {
    return this.http.put(`${this.api}/${id}`, data)
      .pipe(catchError(this.handleError));
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`)
      .pipe(catchError(this.handleError));
  }

  obtenerProducto(id: number): Observable<any> {
    return this.http.get(`${this.api}/${id}`)
      .pipe(catchError(this.handleError));
  }

  obtenerPorUsuario(usuarioId: number): Observable<any> {
    return this.http.get(`${this.api}/usuario/${usuarioId}`)
      .pipe(catchError(this.handleError));
  }
} 