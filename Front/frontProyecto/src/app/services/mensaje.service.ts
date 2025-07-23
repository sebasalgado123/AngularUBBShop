import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MensajeService {
  private api = `${environment.apiUrl}/mensajes`;
  constructor(private http: HttpClient) {}

  enviarMensaje(destinatario_id: number, contenido: string): Observable<any> {
    return this.http.post(this.api, { destinatario_id, contenido });
  }

  obtenerMensajes(usuarioId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/conversacion/${usuarioId}`);
  }

  obtenerConversaciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/conversaciones`);
  }
} 