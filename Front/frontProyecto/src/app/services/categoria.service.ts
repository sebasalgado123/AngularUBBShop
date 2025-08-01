import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private api = `${environment.apiUrl}/categorias`;

  constructor(private http: HttpClient) {}

  obtenerCategorias(): Observable<any[]> {
    return this.http.get<any[]>(this.api);
  }
} 