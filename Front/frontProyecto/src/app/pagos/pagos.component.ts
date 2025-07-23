import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PagoService } from '../services/pago.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.css']
})
export class PagosComponent implements OnInit {
  // Datos del producto a comprar
  producto: any = null;
  modoCompra = false;
  
  // Datos de pago
  metodoPago = 'tarjeta';
  numeroTarjeta = '';
  fechaVencimiento = '';
  cvv = '';
  nombreTitular = '';
  email = '';
  
  // Estados
  procesandoPago = false;
  error = '';
  mensaje = '';
  usuarioActual: any;
  
  // Lista de pagos (modo historial)
  pagos: any[] = [];
  ventas: any[] = [];
  modoVendedor = false;
  vendedoresInfo: Map<number, any> = new Map();
  activeTab = 'compras'; // Para controlar las pestañas
  
  // Propiedades para las modales
  mostrarModalDetallePago = false;
  mostrarModalDetalleVenta = false;
  pagoSeleccionado: any = null;
  ventaSeleccionada: any = null;

  constructor(
    private pagoService: PagoService, 
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.usuarioActual = this.auth.getCurrentUser();
    console.log('Usuario actual:', this.usuarioActual);
    
    // Verificar si hay parámetros de compra
    this.route.queryParams.subscribe(params => {
      if (params['producto_id']) {
        this.modoCompra = true;
        this.producto = {
          id: params['producto_id'],
          titulo: params['titulo'],
          precio: parseFloat(params['precio']),
          vendedor_id: params['vendedor_id']
        };
        this.email = this.usuarioActual?.email || '';
        this.nombreTitular = this.usuarioActual?.nombre || '';
        
        // Cargar información del vendedor
        if (this.producto.vendedor_id) {
          this.cargarInfoVendedor(this.producto.vendedor_id);
        }
      } else {
        this.modoCompra = false;
        console.log('Cargando historial de pagos...');
        console.log('Estado inicial - ActiveTab:', this.activeTab);
        console.log('Estado inicial - ModoVendedor:', this.modoVendedor);
        this.cargarPagos();
        this.cargarVentas();
        
        // Establecer la pestaña activa por defecto
        setTimeout(() => {
          this.activeTab = 'compras';
        }, 100);
      }
    });
  }

  cargarPagos() {
    console.log('Cargando pagos para usuario:', this.usuarioActual?.id);
    this.pagoService.obtenerMisPagos().subscribe({
      next: data => {
        console.log('Pagos cargados:', data);
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

  cargarVentas() {
    console.log('Iniciando carga de ventas para usuario:', this.usuarioActual?.id);
    
    // Primero verificar si el usuario es vendedor
    this.pagoService.verificarSiEsVendedor().subscribe({
      next: (vendedorData) => {
        this.modoVendedor = vendedorData.esVendedor;
        console.log('Usuario es vendedor:', this.modoVendedor);
        console.log('ActiveTab después de verificar vendedor:', this.activeTab);
        
        // Solo cargar ventas si es vendedor
        if (this.modoVendedor) {
          this.pagoService.obtenerMisVentas().subscribe({
            next: data => {
              this.ventas = data;
              console.log('Ventas cargadas:', data);
              console.log('Número de ventas:', data.length);
              console.log('Estado final - ModoVendedor:', this.modoVendedor);
              console.log('Estado final - ActiveTab:', this.activeTab);
            },
            error: err => {
              console.error('Error cargando ventas:', err);
              this.ventas = [];
              this.modoVendedor = false;
            }
          });
        } else {
          this.ventas = [];
          console.log('Usuario no es vendedor, no se cargan ventas');
        }
      },
      error: err => {
        console.error('Error verificando si es vendedor:', err);
        this.modoVendedor = false;
        this.ventas = [];
        console.log('Error al verificar si es vendedor, estableciendo modoVendedor = false');
      }
    });
  }

  changeTab(tab: string) {
    console.log('Cambiando a pestaña:', tab);
    this.activeTab = tab;
    console.log('ActiveTab actualizado:', this.activeTab);
    console.log('ModoVendedor:', this.modoVendedor);
    console.log('Ventas cargadas:', this.ventas.length);
    
    // Si se cambia a la pestaña de ventas, recargar las ventas
    if (tab === 'ventas' && this.modoVendedor) {
      console.log('Recargando ventas al cambiar a pestaña ventas');
      this.cargarVentas();
    }
    
    // Si se cambia a la pestaña de compras, recargar los pagos
    if (tab === 'compras') {
      console.log('Recargando pagos al cambiar a pestaña compras');
      this.cargarPagos();
    }
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

  procesarPago() {
    if (!this.validarFormulario()) return;
    
    this.procesandoPago = true;
    this.error = '';
    this.mensaje = '';
    
    // Simular procesamiento de pago
    setTimeout(() => {
      const datosPago = {
        producto_id: this.producto.id,
        monto: this.producto.precio,
        metodo_pago: this.metodoPago,
        comprador_id: this.usuarioActual.id,
        vendedor_id: this.producto.vendedor_id,
        datos_tarjeta: {
          numero: this.numeroTarjeta.slice(-4), // Solo últimos 4 dígitos
          titular: this.nombreTitular,
          metodo: this.metodoPago
        }
      };
      
      this.pagoService.realizarPago(datosPago).subscribe({
        next: (response: any) => {
          this.mensaje = '¡Pago procesado exitosamente!';
          this.procesandoPago = false;
          
          // Redirigir al historial después de 2 segundos
          setTimeout(() => {
            this.router.navigate(['/pagos']);
          }, 2000);
        },
        error: (err: any) => {
          this.error = err.error?.mensaje || 'Error al procesar el pago';
          this.procesandoPago = false;
        }
      });
    }, 2000); // Simular delay de procesamiento
  }

  validarFormulario(): boolean {
    if (!this.numeroTarjeta || this.numeroTarjeta.length < 16) {
      this.error = 'Número de tarjeta inválido';
      return false;
    }
    
    if (!this.fechaVencimiento || !/^\d{2}\/\d{2}$/.test(this.fechaVencimiento)) {
      this.error = 'Fecha de vencimiento inválida (MM/YY)';
      return false;
    }
    
    if (!this.cvv || this.cvv.length < 3) {
      this.error = 'CVV inválido';
      return false;
    }
    
    if (!this.nombreTitular.trim()) {
      this.error = 'Nombre del titular es requerido';
      return false;
    }
    
    if (!this.email || !this.email.includes('@')) {
      this.error = 'Email inválido';
      return false;
    }
    
    return true;
  }

  formatearNumeroTarjeta(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})/g, '$1 ').trim();
    this.numeroTarjeta = value;
  }

  formatearFechaVencimiento(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    this.fechaVencimiento = value;
  }

  volverAProducto() {
    this.router.navigate(['/product', this.producto.id]);
  }

  verDetallePago(pago: any) {
    this.pagoSeleccionado = pago;
    this.mostrarModalDetallePago = true;
  }

  cerrarModalDetallePago() {
    this.mostrarModalDetallePago = false;
    this.pagoSeleccionado = null;
  }

  verDetalleVenta(venta: any) {
    this.ventaSeleccionada = venta;
    this.mostrarModalDetalleVenta = true;
  }

  cerrarModalDetalleVenta() {
    this.mostrarModalDetalleVenta = false;
    this.ventaSeleccionada = null;
  }

  calcularDiasDesdePago(fecha: string): number {
    const fechaPago = new Date(fecha);
    const fechaActual = new Date();
    const diferencia = fechaActual.getTime() - fechaPago.getTime();
    return Math.floor(diferencia / (1000 * 60 * 60 * 24));
  }

  calcularPorcentajeComision(comision: number, montoTotal: number): number {
    if (montoTotal === 0) return 0;
    return Math.round((comision / montoTotal) * 100);
  }

  obtenerUltimosDigitos(metodoPago: string): string {
    // Simular últimos 4 dígitos basado en el método de pago
    if (metodoPago === 'tarjeta') {
      return '1234';
    } else if (metodoPago === 'transferencia') {
      return '5678';
    } else {
      return '0000';
    }
  }

  obtenerNombreVendedor(pago: any): string {
    // Usar el nombre del vendedor que viene del backend
    if (typeof pago === 'object' && pago.vendedor_nombre) {
      return pago.vendedor_nombre;
    }
    return 'Usuario';
  }

  cargarInfoVendedor(vendedorId: number) {
    if (!this.vendedoresInfo.has(vendedorId)) {
      this.auth.obtenerUsuario(vendedorId).subscribe({
        next: (vendedor) => {
          this.vendedoresInfo.set(vendedorId, vendedor);
        },
        error: (err) => {
          console.error('Error cargando vendedor:', err);
          this.vendedoresInfo.set(vendedorId, { nombre: 'Usuario' });
        }
      });
    }
  }


} 