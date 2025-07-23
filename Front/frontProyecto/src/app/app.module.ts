import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import {NgxBootstrapIconsModule, allIcons} from 'ngx-bootstrap-icons';
import { ProductListComponent } from './product/product-list/product-list.component';
import { ProductoFormComponent } from './producto-form/producto-form.component';
import { MisPublicacionesComponent } from './mis-publicaciones/mis-publicaciones.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AdminComponent } from './admin/admin.component';
import { MensajeriaComponent } from './mensajeria/mensajeria.component';
import { NotificacionesComponent } from './notificaciones/notificaciones.component';
import { PagosComponent } from './pagos/pagos.component';
import { HomeComponent } from './home/home.component';
import { AuthInterceptor } from './services/auth.interceptor';
import { ProductDetailComponent } from './product/product-detail/product-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    ProductListComponent,
    ProductoFormComponent,
    MisPublicacionesComponent,
    LoginComponent,
    RegisterComponent,
    AdminComponent,
    MensajeriaComponent,
    NotificacionesComponent,
    PagosComponent,
    HomeComponent,
    ProductDetailComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    NgxBootstrapIconsModule.pick(allIcons),
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }