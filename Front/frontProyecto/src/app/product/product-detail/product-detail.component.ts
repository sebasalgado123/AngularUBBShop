import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IProduct } from '../../product';
import { ProductService } from '../product.service';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { CategoriaService } from '../../services/categoria.service';
import { MensajeService } from '../../services/mensaje.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: IProduct | null = null;
  loading = true;
  error = '';
  mostrarModalReporte = false;
  motivoReporte = '';
  mensajeReporte = '';
  idProductoReporte: number | null = null;
  isLoggedIn = false;
  categorias: any[] = [];
  
  // Propiedades para mensajes
  mostrarModalMensaje = false;
  mensajeTexto = '';
  mensajeMensaje = '';
  currentUserId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    public authService: AuthService,
    private adminService: AdminService,
    private categoriaService: CategoriaService,
    private mensajeService: MensajeService
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.currentUserId = this.authService.getCurrentUser()?.id || null;
    this.cargarCategorias();
    this.loadProduct();
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

  loadProduct() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loading = true;
      this.error = '';
      
      this.productService.getProduct(parseInt(id)).subscribe({
        next: (product) => {
          this.product = product;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Producto no encontrado';
          this.loading = false;
          console.error('Error cargando producto:', err);
        }
      });
    } else {
      this.error = 'ID de producto no válido';
      this.loading = false;
    }
  }

  volverAlListado() {
    this.router.navigate(['/home']);
  }

  abrirReporte() {
    if (!this.product) return;
    this.idProductoReporte = this.product.id;
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

  getFormattedPrice(price: number): string {
    return new Intl.NumberFormat('es-CL', { 
      style: 'currency', 
      currency: 'CLP' 
    }).format(price);
  }

  getFormattedDate(date: string): string {
    return new Date(date).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  onImageError(event: any) {
    // Si la imagen falla al cargar, ocultarla
    event.target.style.display = 'none';
  }

  // Métodos para mensajes
  abrirMensaje() {
    if (!this.product) return;
    this.mensajeTexto = '';
    this.mostrarModalMensaje = true;
    this.mensajeMensaje = '';
  }

  cerrarModalMensaje() {
    this.mostrarModalMensaje = false;
    this.mensajeTexto = '';
    this.mensajeMensaje = '';
  }

  enviarMensaje() {
    if (!this.mensajeTexto.trim() || !this.product) return;
    
    const contenido = `Consulta sobre producto: ${this.product.titulo}\n\n${this.mensajeTexto.trim()}`;
    
    this.mensajeService.enviarMensaje(this.product.usuario_id, contenido).subscribe({
      next: (response) => {
        this.mensajeMensaje = 'Mensaje enviado correctamente';
        setTimeout(() => {
          this.cerrarModalMensaje();
        }, 1500);
      },
      error: (err) => {
        console.error('Error enviando mensaje:', err);
        this.mensajeMensaje = err.error?.mensaje || 'Error al enviar mensaje';
      }
    });
  }
} 