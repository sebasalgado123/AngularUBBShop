import { Component, OnInit } from '@angular/core';
import { NotificacionService } from '../services/notificacion.service';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.css']
})
export class NotificacionesComponent implements OnInit {
  notificaciones: any[] = [];
  error = '';

  constructor(private notifService: NotificacionService) {}

  ngOnInit() {
    this.cargarNotificaciones();
  }

  cargarNotificaciones() {
    this.notifService.obtenerNotificaciones().subscribe({
      next: data => {
        this.notificaciones = data;
        this.error = '';
        console.log('Notificaciones cargadas:', data);
      },
      error: err => {
        console.error('Error cargando notificaciones:', err);
        if (err.status === 401) {
          this.error = 'Debes iniciar sesión para ver las notificaciones';
        } else if (err.status === 500) {
          this.error = 'Error del servidor al cargar notificaciones';
        } else {
          this.error = 'No hay notificaciones disponibles';
        }
        this.notificaciones = [];
      }
    });
  }

  marcarLeidas() {
    this.notifService.marcarLeidas().subscribe({
      next: () => this.cargarNotificaciones(),
      error: err => this.error = err.error?.mensaje || 'Error al marcar como leídas'
    });
  }
} 