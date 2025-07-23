import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { IProduct } from '../../product';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { CategoriaService } from '../../services/categoria.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  @Input('datos') public products: IProduct[] = [];
  imageWidth: number = 50;
  imageMargin: number = 10;
  showImage: boolean = false;
  mostrarModalReporte = false;
  motivoReporte = '';
  idProductoReporte: number | null = null;
  mensajeReporte = '';
  isLoggedIn = false;
  currentUserId: number | null = null;
  categorias: any[] = [];

  constructor(
    public authService: AuthService, 
    private adminService: AdminService, 
    private router: Router,
    private categoriaService: CategoriaService
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.currentUserId = this.authService.getCurrentUser()?.id || null;
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.categoriaService.obtenerCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: (err) => {
        console.error('Error cargando categorías:', err);
      }
    });
  }

  getCategoriaNombre(categoriaId: number): string {
    const categoria = this.categorias.find(cat => cat.id === categoriaId);
    return categoria ? categoria.nombre : 'Sin categoría';
  }

  toggleImage(): void {
    this.showImage = !this.showImage;
  }

  abrirReporte(id_producto: number) {
    this.idProductoReporte = id_producto;
    this.motivoReporte = '';
    this.mostrarModalReporte = true;
    this.mensajeReporte = '';
  }

  cerrarModalReporte() {
    this.mostrarModalReporte = false;
    this.idProductoReporte = null;
    this.motivoReporte = '';
    this.mensajeReporte = '';
  }

  enviarReporte() {
    if (!this.motivoReporte.trim() || !this.idProductoReporte) return;
    const reportador_id = this.authService.getCurrentUser()?.id;
    this.adminService.reportarPublicacion(this.idProductoReporte, this.motivoReporte, reportador_id).subscribe({
      next: () => {
        this.mensajeReporte = 'Reporte enviado correctamente';
        setTimeout(() => this.cerrarModalReporte(), 1000);
      },
      error: err => {
        this.mensajeReporte = err.error?.mensaje || 'Error al enviar reporte';
      }
    });
  }

  verDetalles(product: any) {
    // Navegar a la página de detalles del producto
    this.router.navigate(['/producto', product.id]);
  }

  onImageError(event: any) {
    // Si la imagen falla al cargar, ocultarla
    event.target.style.display = 'none';
  }

  enviarMensajeRapido(product: any) {
    // Navegar a la página de mensajería con el usuario seleccionado
    this.router.navigate(['/mensajeria'], { 
      queryParams: { 
        usuario: product.usuario_id,
        producto: product.id,
        asunto: `Consulta sobre: ${product.titulo}`,
        precio: product.precio,
        categoria: this.getCategoriaNombre(product.categoria_id)
      }
    });
  }
}