import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private api = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient) {}

  crearProducto(data: FormData): Observable<any> {
    return this.http.post(this.api, data);
  }

  actualizarProducto(id: number, data: FormData): Observable<any> {
    return this.http.put(`${this.api}/${id}`, data);
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }

  obtenerProducto(id: number): Observable<any> {
    return this.http.get(`${this.api}/${id}`);
  }

  obtenerPorUsuario(usuarioId: number): Observable<any> {
    return this.http.get(`${this.api}/usuario/${usuarioId}`);
  }
} 