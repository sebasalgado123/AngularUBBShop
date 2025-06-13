import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductoService } from '../services/producto.service';

@Component({
  selector: 'app-mis-publicaciones',
  templateUrl: './mis-publicaciones.component.html',
  styleUrls: ['./mis-publicaciones.component.css']
})
export class MisPublicacionesComponent implements OnInit {
  publicaciones: any[] = [];
  usuarioId = 1; // reemplazar con id de usuario autenticado cuando se pueda

  constructor(private productoService: ProductoService, private router: Router) {}

  ngOnInit(): void {
    this.cargarPublicaciones();
  }

  cargarPublicaciones() {
    this.productoService.obtenerPorUsuario(this.usuarioId).subscribe((data) => (this.publicaciones = data));
  }

  editar(id: number) {
    this.router.navigate(['/editar', id]);
  }

  eliminar(id: number) {
    if (confirm('¿Está seguro de eliminar esta publicación?')) {
      this.productoService.eliminarProducto(id).subscribe(() => {
        alert('Publicación eliminada');
        this.cargarPublicaciones();
      });
    }
  }
} 