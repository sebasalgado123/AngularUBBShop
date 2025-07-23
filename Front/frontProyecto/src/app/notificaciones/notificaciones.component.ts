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
      },
      error: err => {
        console.error('Error cargando notificaciones:', err);
        this.error = 'No hay notificaciones disponibles';
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