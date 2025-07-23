import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FinanzasService {
  private api = `${environment.apiUrl}/finanzas`;
  constructor(private http: HttpClient) {}

  obtenerVentas(): Observable<any[]> {
    console.log('Obteniendo ventas desde:', `${this.api}/ventas`);
    return this.http.get<any[]>(`${this.api}/ventas`);
  }

  obtenerBalance(): Observable<any> {
    return this.http.get(`${this.api}/balance`);
  }

  solicitarRetiro(monto: number, cuenta_bancaria: string): Observable<any> {
    return this.http.post(`${this.api}/retiro`, { monto, cuenta_bancaria });
  }

  obtenerRetiros(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/retiros`);
  }

  obtenerDashboardAdmin(): Observable<any> {
    return this.http.get(`${this.api}/admin/dashboard`);
  }
} 