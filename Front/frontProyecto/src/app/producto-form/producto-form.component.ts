import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriaService } from '../services/categoria.service';
import { ProductoService } from '../services/producto.service';

@Component({
  selector: 'app-producto-form',
  templateUrl: './producto-form.component.html',
  styleUrls: ['./producto-form.component.css'],
})
export class ProductoFormComponent implements OnInit {
  formulario!: FormGroup;
  categorias: any[] = [];
  imagenesPreview: string[] = [];
  imagenesArchivos: File[] = [];
  editMode = false;
  productoId!: number;
  usuarioId = 1; // reemplazar con id de usuario autenticado cuando se pueda

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaService,
    private productoService: ProductoService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.formulario = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(255)]],
      categoria_id: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.maxLength(2000)]],
      precio: ['', [Validators.required, Validators.min(0)]],
      info_contacto: ['', [Validators.required, Validators.maxLength(255)]],
      imagenes: [''],
    });

    this.categoriaService
      .obtenerCategorias()
      .subscribe((cats) => (this.categorias = cats));

    // Verificar si es modo edición
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.editMode = true;
        this.productoId = +id;
        this.cargarProducto();
      }
    });
  }

  cargarProducto() {
    this.productoService.obtenerProducto(this.productoId).subscribe((prod) => {
      this.formulario.patchValue({
        titulo: prod.titulo,
        categoria_id: prod.categoria_id,
        descripcion: prod.descripcion,
        precio: prod.precio,
        info_contacto: prod.info_contacto,
      });
      // Si el producto tiene una imagen, mostrarla en el preview
      if (prod.imageUrl) {
        this.imagenesPreview = [prod.imageUrl];
      }
    });
  }

  onSeleccionarImagenes(event: any) {
    const files: FileList = event.target.files;
    this.imagenesPreview = [];
    this.imagenesArchivos = [];
    const maxSize = 2 * 1024 * 1024;

    Array.from(files).forEach((file: any) => {
      if (file.size > maxSize) {
        alert(`La imagen ${file.name} supera el tamaño máximo de 2MB`);
        return;
      }
      this.imagenesArchivos.push(file);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenesPreview.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  onSubmit() {
    if (this.formulario.invalid) {
      alert('Por favor, complete todos los campos requeridos correctamente');
      return;
    }

    const formData = new FormData();
    const valores = this.formulario.value;
    formData.append('titulo', valores.titulo);
    formData.append('categoria_id', valores.categoria_id);
    formData.append('descripcion', valores.descripcion);
    formData.append('precio', valores.precio);
    formData.append('info_contacto', valores.info_contacto);
    formData.append('usuario_id', String(this.usuarioId));

    this.imagenesArchivos.forEach((img) => {
      formData.append('imagenes', img);
    });

    if (this.editMode) {
      this.productoService
        .actualizarProducto(this.productoId, formData)
        .subscribe({
          next: () => {
            alert('Publicación actualizada exitosamente');
            this.router.navigate(['/mis-publicaciones']);
          },
          error: (error) => {
            console.error('Error al actualizar:', error);
            alert('Error al actualizar la publicación: ' + (error.error?.mensaje || 'Error desconocido'));
          }
        });
    } else {
      this.productoService.crearProducto(formData).subscribe({
        next: () => {
          alert('Publicación creada exitosamente');
          this.router.navigate(['/mis-publicaciones']);
        },
        error: (error) => {
          console.error('Error al crear:', error);
          alert('Error al crear la publicación: ' + (error.error?.mensaje || 'Error desconocido'));
        }
      });
    }
  }
} 