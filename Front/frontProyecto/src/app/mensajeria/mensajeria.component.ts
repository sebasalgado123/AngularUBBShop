import { Component, OnInit } from '@angular/core';
import { MensajeService } from '../services/mensaje.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-mensajeria',
  templateUrl: './mensajeria.component.html',
  styleUrls: ['./mensajeria.component.css']
})
export class MensajeriaComponent implements OnInit {
  conversaciones: any[] = [];
  mensajes: any[] = [];
  usuarioConversacion: number | null = null;
  nuevoMensaje = '';
  error = '';
  usuarioActual: any;

  constructor(private mensajeService: MensajeService, private auth: AuthService) {}

  ngOnInit() {
    this.usuarioActual = this.auth.getCurrentUser();
    this.cargarConversaciones();
  }

  cargarConversaciones() {
    this.mensajeService.obtenerConversaciones().subscribe({
      next: data => this.conversaciones = data,
      error: err => this.error = err.error?.mensaje || 'Error al cargar conversaciones'
    });
  }

  seleccionarConversacion(usuarioId: number) {
    this.usuarioConversacion = usuarioId;
    this.cargarMensajes(usuarioId);
  }

  cargarMensajes(usuarioId: number) {
    this.mensajeService.obtenerMensajes(usuarioId).subscribe({
      next: data => this.mensajes = data,
      error: err => this.error = err.error?.mensaje || 'Error al cargar mensajes'
    });
  }

  enviarMensaje() {
    if (!this.nuevoMensaje.trim() || !this.usuarioConversacion) return;
    this.mensajeService.enviarMensaje(this.usuarioConversacion, this.nuevoMensaje).subscribe({
      next: () => {
        this.nuevoMensaje = '';
        this.cargarMensajes(this.usuarioConversacion!);
      },
      error: err => this.error = err.error?.mensaje || 'Error al enviar mensaje'
    });
  }
} 