import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProductoFormComponent } from './producto-form/producto-form.component';
import { MisPublicacionesComponent } from './mis-publicaciones/mis-publicaciones.component';

@NgModule({
  declarations: [
    AppComponent,
    ProductoFormComponent,
    MisPublicacionesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
