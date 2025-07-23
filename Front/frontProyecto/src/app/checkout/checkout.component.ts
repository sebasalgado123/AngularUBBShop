import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PagoService } from '../services/pago.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  producto: any = null;
  form: FormGroup;
  pasoActual = 1;
  totalPasos = 3;
  metodosPago = [
    { id: 'tarjeta', nombre: 'Tarjeta de Crédito/Débito', icono: '💳' },
    { id: 'transferencia', nombre: 'Transferencia Bancaria', icono: '🏦' },
    { id: 'efectivo', nombre: 'Pago en Efectivo', icono: '💵' },
    { id: 'digital', nombre: 'Billetera Digital', icono: '📱' }
  ];
  metodoSeleccionado = '';
  error = '';
  procesando = false;

  constructor(
    private fb: FormBuilder,
    private pagoService: PagoService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      direccion: ['', Validators.required],
      metodoPago: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Simular obtención del producto (en producción vendría de un servicio)
    this.producto = {
      id: 1,
      titulo: 'Producto de ejemplo',
      precio: 50000,
      descripcion: 'Descripción del producto'
    };
  }

  siguientePaso() {
    if (this.pasoActual < this.totalPasos) {
      this.pasoActual++;
    }
  }

  pasoAnterior() {
    if (this.pasoActual > 1) {
      this.pasoActual--;
    }
  }

  seleccionarMetodo(metodo: string) {
    this.metodoSeleccionado = metodo;
    this.form.patchValue({ metodoPago: metodo });
  }

  async procesarPago() {
    if (this.form.invalid) return;
    
    this.procesando = true;
    this.error = '';

    try {
      const resultado = await this.pagoService.crearPago(
        this.producto.id,
        this.producto.precio,
        this.metodoSeleccionado
      ).toPromise();

      this.pasoActual = 4; // Paso de confirmación
      this.procesando = false;
    } catch (err: any) {
      this.error = err.error?.mensaje || 'Error al procesar el pago';
      this.procesando = false;
    }
  }

  get progreso() {
    return (this.pasoActual / this.totalPasos) * 100;
  }
} 