import { Component, OnInit } from '@angular/core';
import { IProduct } from '../product';
import { ProductService } from '../product/product.service';
import { CategoriaService } from '../services/categoria.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  _listFilter: string = '';
  filteredProducts: IProduct[] = [];
  selectedCategory: string = 'Todas';
  products: IProduct[] = [];
  categorias: any[] = [];
  loading = false;
  error = '';

  constructor(
    private productService: ProductService,
    private categoriaService: CategoriaService
  ) {}

  // Usar categories basadas en las categorías disponibles
  get categories(): string[] {
    return ['Todas', ...this.categorias.map(cat => cat.nombre)];
  }

  get listFilter(): string {
    return this._listFilter;
  }

  set listFilter(value: string) {
    this._listFilter = value;
    this.applyFilters();
  }

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarProductos();
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

  cargarProductos() {
    this.loading = true;
    this.error = '';
    
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando productos:', err);
        
        // Si es un error 404 o no hay productos, mostrar mensaje específico
        if (err.status === 404 || err.status === 0) {
          this.error = 'No hay productos disponibles en este momento. Los productos aparecerán cuando los usuarios comiencen a publicar.';
        } else {
          this.error = 'Error al cargar productos. Verifica tu conexión a internet.';
        }
        
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const filterBy = this._listFilter.toLowerCase();
    this.filteredProducts = this.products.filter(product => {
      const matchesName = product.titulo.toLowerCase().includes(filterBy);
      
      // Buscar la categoría por nombre
      const categoriaSeleccionada = this.categorias.find(cat => cat.nombre === this.selectedCategory);
      const matchesCategory = this.selectedCategory === 'Todas' || 
                            (categoriaSeleccionada && product.categoria_id === categoriaSeleccionada.id);
      
      return matchesName && matchesCategory;
    });
  }

  // Para llamar desde el select category change
  onCategoryChange(): void {
    this.applyFilters();
  }

  // Limpiar filtros
  limpiarFiltros(): void {
    this.listFilter = '';
    this.selectedCategory = 'Todas';
    this.applyFilters();
  }
} 