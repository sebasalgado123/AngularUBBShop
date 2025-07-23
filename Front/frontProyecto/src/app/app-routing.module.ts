import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductoFormComponent } from './producto-form/producto-form.component';
import { MisPublicacionesComponent } from './mis-publicaciones/mis-publicaciones.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthGuard } from './services/auth.guard';
import { AdminComponent } from './admin/admin.component';
import { MensajeriaComponent } from './mensajeria/mensajeria.component';
import { NotificacionesComponent } from './notificaciones/notificaciones.component';
import { PagosComponent } from './pagos/pagos.component';
import { HomeComponent } from './home/home.component';
import { ProductDetailComponent } from './product/product-detail/product-detail.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'producto/:id', component: ProductDetailComponent },
  { path: 'publicar', component: ProductoFormComponent, canActivate: [AuthGuard] },
  { path: 'editar/:id', component: ProductoFormComponent, canActivate: [AuthGuard] },
  { path: 'mis-publicaciones', component: MisPublicacionesComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },
  { path: 'mensajeria', component: MensajeriaComponent, canActivate: [AuthGuard] },
  { path: 'notificaciones', component: NotificacionesComponent, canActivate: [AuthGuard] },
  { path: 'pagos', component: PagosComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
