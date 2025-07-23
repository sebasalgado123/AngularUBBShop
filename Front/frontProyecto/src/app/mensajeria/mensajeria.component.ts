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
  usuariosInfo: Map<number, any> = new Map();
  cargandoUsuarios: Set<number> = new Set();

  constructor(private mensajeService: MensajeService, private auth: AuthService) {}

  ngOnInit() {
    this.usuarioActual = this.auth.getCurrentUser();
    this.cargarConversaciones();
  }

  cargarConversaciones() {
    this.mensajeService.obtenerConversaciones().subscribe({
      next: data => {
        this.conversaciones = data;
        // Cargar información de usuarios para cada conversación
        this.conversaciones.forEach(conv => {
          this.cargarInfoUsuario(conv.usuario_conversacion);
        });
      },
      error: err => this.error = err.error?.mensaje || 'Error al cargar conversaciones'
    });
  }

  cargarInfoUsuario(usuarioId: number) {
    if (!this.usuariosInfo.has(usuarioId) && !this.cargandoUsuarios.has(usuarioId)) {
      this.cargandoUsuarios.add(usuarioId);
      console.log('Cargando información del usuario:', usuarioId);
      this.auth.obtenerUsuario(usuarioId).subscribe({
        next: (usuario) => {
          console.log('Usuario cargado:', usuario);
          this.usuariosInfo.set(usuarioId, usuario);
          this.cargandoUsuarios.delete(usuarioId);
        },
        error: (err) => {
          console.error('Error cargando usuario:', err);
          // Usar información por defecto si falla
          this.usuariosInfo.set(usuarioId, { nombre: 'Usuario', email: 'N/A' });
          this.cargandoUsuarios.delete(usuarioId);
        }
      });
    }
  }

  obtenerNombreUsuario(usuarioId: number): string {
    const usuario = this.usuariosInfo.get(usuarioId);
    console.log('Obteniendo nombre para usuario', usuarioId, ':', usuario);
    return usuario ? usuario.nombre : 'Usuario';
  }

  seleccionarConversacion(usuarioId: number) {
    this.usuarioConversacion = usuarioId;
    this.cargarMensajes(usuarioId);
    // Asegurar que se cargue la información del usuario si no está disponible
    this.cargarInfoUsuario(usuarioId);
  }

  cargarMensajes(usuarioId: number) {
    this.mensajeService.obtenerMensajes(usuarioId).subscribe({
      next: data => {
        this.mensajes = data;
        // Cargar información de usuarios de todos los mensajes
        this.mensajes.forEach(mensaje => {
          this.cargarInfoUsuario(mensaje.remitente_id);
        });
      },
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