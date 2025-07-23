import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = `${environment.apiUrl}/usuarios`;
  private productosApi = `${environment.apiUrl}/productos`;
  
  constructor(private http: HttpClient) {}

  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(this.api);
  }

  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }

  cambiarRol(id: number, rol: string): Observable<any> {
    return this.http.put(`${this.api}/${id}/rol`, { rol });
  }

  getPublicaciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.productosApi}/admin/all`);
  }

  eliminarPublicacion(id: number): Observable<any> {
    return this.http.delete(`${this.productosApi}/admin/${id}`);
  }

  reportarPublicacion(id: number, motivo: string, reportador_id?: number): Observable<any> {
    const data: any = { motivo };
    if (reportador_id) data.reportador_id = reportador_id;
    return this.http.post(`${this.productosApi}/${id}/report`, data);
  }

  getReportes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.productosApi}/admin/reportes`);
  }
} 