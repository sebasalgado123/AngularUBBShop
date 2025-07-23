import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private api = `${environment.apiUrl}/notificaciones`;
  constructor(private http: HttpClient) {}

  obtenerNotificaciones(): Observable<any[]> {
    return this.http.get<any[]>(this.api);
  }

  marcarLeidas(): Observable<any> {
    return this.http.put(`${this.api}/leer`, {});
  }
} 