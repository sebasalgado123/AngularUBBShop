import { Component, OnInit } from '@angular/core';
import { FinanzasService } from '../services/finanzas.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-finanzas',
  templateUrl: './finanzas.component.html',
  styleUrls: ['./finanzas.component.css']
})
export class FinanzasComponent implements OnInit {
  ventas: any[] = [];
  balance: any = {};
  retiros: any[] = [];
  error = '';
  mensaje = '';
  mostrarFormularioRetiro = false;
  formRetiro = {
    monto: 0,
    cuenta_bancaria: ''
  };

  constructor(private finanzasService: FinanzasService, private auth: AuthService) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.finanzasService.obtenerVentas().subscribe({
      next: data => this.ventas = data,
      error: err => this.error = err.error?.mensaje || 'Error al cargar ventas'
    });

    this.finanzasService.obtenerBalance().subscribe({
      next: data => this.balance = data,
      error: err => this.error = err.error?.mensaje || 'Error al cargar balance'
    });

    this.finanzasService.obtenerRetiros().subscribe({
      next: data => this.retiros = data,
      error: err => this.error = err.error?.mensaje || 'Error al cargar retiros'
    });
  }

  solicitarRetiro() {
    if (!this.formRetiro.monto || !this.formRetiro.cuenta_bancaria) {
      this.error = 'Complete todos los campos';
      return;
    }

    this.finanzasService.solicitarRetiro(this.formRetiro.monto, this.formRetiro.cuenta_bancaria).subscribe({
      next: () => {
        this.mensaje = 'Solicitud de retiro enviada';
        this.mostrarFormularioRetiro = false;
        this.formRetiro = { monto: 0, cuenta_bancaria: '' };
        this.cargarDatos();
      },
      error: err => this.error = err.error?.mensaje || 'Error al solicitar retiro'
    });
  }
} 