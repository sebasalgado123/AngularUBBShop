import { Component, OnInit } from '@angular/core';
import { PagoService } from '../services/pago.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.css']
})
export class PagosComponent implements OnInit {
  pagos: any[] = [];
  error = '';
  mensaje = '';
  usuarioActual: any;

  constructor(private pagoService: PagoService, private auth: AuthService) {}

  ngOnInit() {
    this.usuarioActual = this.auth.getCurrentUser();
    this.cargarPagos();
  }

  cargarPagos() {
    this.pagoService.obtenerMisPagos().subscribe({
      next: data => {
        this.pagos = data;
        this.error = '';
      },
      error: err => {
        console.error('Error cargando pagos:', err);
        this.error = 'No hay pagos disponibles';
        this.pagos = [];
      }
    });
  }

  cancelarPago(pago_id: number) {
    if (!confirm('¿Seguro que deseas cancelar este pago?')) return;
    this.pagoService.cancelarPago(pago_id).subscribe({
      next: () => {
        this.mensaje = 'Pago cancelado';
        this.cargarPagos();
      },
      error: err => this.error = err.error?.mensaje || 'Error al cancelar pago'
    });
  }
} 