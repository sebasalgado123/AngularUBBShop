import { Component, OnInit } from '@angular/core';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  usuarios: any[] = [];
  roles = ['usuario', 'admin'];
  mensaje = '';
  error = '';
  publicaciones: any[] = [];
  reportes: any[] = [];
  loading = {
    usuarios: false,
    publicaciones: false,
    reportes: false
  };

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarPublicaciones();
    this.cargarReportes();
  }

  cargarUsuarios() {
    this.loading.usuarios = true;
    this.error = '';
    this.adminService.getUsuarios().subscribe({
      next: data => {
        this.usuarios = data;
        this.loading.usuarios = false;
      },
      error: err => {
        this.error = err.error?.mensaje || 'Error al cargar usuarios';
        this.loading.usuarios = false;
        console.error('Error cargando usuarios:', err);
      }
    });
  }

  eliminarUsuario(id: number) {
    // Verificar si es el último admin
    const admins = this.usuarios.filter(u => u.rol === 'admin');
    const usuarioAEliminar = this.usuarios.find(u => u.id_usuario === id);
    
    if (admins.length === 1 && usuarioAEliminar?.rol === 'admin') {
      this.error = 'No se puede eliminar el último administrador del sistema';
      setTimeout(() => this.error = '', 5000);
      return;
    }
    
    if (!confirm('¿Seguro que deseas eliminar este usuario?')) return;
    
    this.adminService.eliminarUsuario(id).subscribe({
      next: () => {
        this.mensaje = 'Usuario eliminado exitosamente';
        this.cargarUsuarios();
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: err => {
        this.error = err.error?.mensaje || 'Error al eliminar usuario';
        console.error('Error eliminando usuario:', err);
      }
    });
  }

  cambiarRol(id: number, rol: string) {
    // Verificar si está intentando quitar admin al último administrador
    const admins = this.usuarios.filter(u => u.rol === 'admin');
    const usuarioACambiar = this.usuarios.find(u => u.id_usuario === id);
    
    if (admins.length === 1 && usuarioACambiar?.rol === 'admin' && rol === 'usuario') {
      this.error = 'No se puede quitar los privilegios al último administrador del sistema';
      setTimeout(() => this.error = '', 5000);
      return;
    }
    
    this.adminService.cambiarRol(id, rol).subscribe({
      next: () => {
        this.mensaje = 'Rol actualizado exitosamente';
        this.cargarUsuarios();
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: err => {
        this.error = err.error?.mensaje || 'Error al cambiar rol';
        console.error('Error cambiando rol:', err);
      }
    });
  }

  cargarPublicaciones() {
    this.loading.publicaciones = true;
    this.error = '';
    this.adminService.getPublicaciones().subscribe({
      next: data => {
        this.publicaciones = data;
        this.loading.publicaciones = false;
      },
      error: err => {
        this.error = err.error?.mensaje || 'Error al cargar publicaciones';
        this.loading.publicaciones = false;
        console.error('Error cargando publicaciones:', err);
      }
    });
  }

  eliminarPublicacion(id: number) {
    if (!confirm('¿Seguro que deseas eliminar esta publicación?')) return;
    this.adminService.eliminarPublicacion(id).subscribe({
      next: () => {
        this.mensaje = 'Publicación eliminada exitosamente';
        this.cargarPublicaciones();
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: err => {
        this.error = err.error?.mensaje || 'Error al eliminar publicación';
        console.error('Error eliminando publicación:', err);
      }
    });
  }

  cargarReportes() {
    this.loading.reportes = true;
    this.error = '';
    this.adminService.getReportes().subscribe({
      next: data => {
        this.reportes = data;
        this.loading.reportes = false;
      },
      error: err => {
        this.error = err.error?.mensaje || 'Error al cargar reportes';
        this.loading.reportes = false;
        console.error('Error cargando reportes:', err);
      }
    });
  }

  limpiarMensajes() {
    this.mensaje = '';
    this.error = '';
  }

  // Métodos para verificar el estado del admin
  esUltimoAdmin(usuario: any): boolean {
    const admins = this.usuarios.filter(u => u.rol === 'admin');
    return admins.length === 1 && usuario.rol === 'admin';
  }

  getAdminsCount(): number {
    return this.usuarios.filter(u => u.rol === 'admin').length;
  }
} 