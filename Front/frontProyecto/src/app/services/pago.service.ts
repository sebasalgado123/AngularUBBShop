import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PagoService {
  private api = `${environment.apiUrl}/pagos`;
  constructor(private http: HttpClient) {}

  crearPago(producto_id: number, monto: number, metodo_pago: string): Observable<any> {
    return this.http.post(this.api, { producto_id, monto, metodo_pago });
  }

  obtenerPago(pago_id: number): Observable<any> {
    return this.http.get(`${this.api}/${pago_id}`);
  }

  obtenerMisPagos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/usuario/mis-pagos`);
  }

  obtenerMisVentas(): Observable<any[]> {
    console.log('Obteniendo mis ventas...');
    return this.http.get<any[]>(`${this.api}/usuario/mis-ventas`);
  }

  verificarSiEsVendedor(): Observable<any> {
    console.log('Verificando si es vendedor...');
    return this.http.get<any>(`${this.api}/usuario/es-vendedor`);
  }

  cancelarPago(pago_id: number): Observable<any> {
    return this.http.put(`${this.api}/${pago_id}/cancelar`, {});
  }

  realizarPago(datosPago: any): Observable<any> {
    return this.http.post(`${this.api}/realizar`, datosPago);
  }
} 