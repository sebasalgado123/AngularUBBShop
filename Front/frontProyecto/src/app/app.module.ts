import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import {NgxBootstrapIconsModule, allIcons} from 'ngx-bootstrap-icons';
import { ProductListComponent } from './product/product-list/product-list.component';
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
    FormsModule,
    AppRoutingModule,
    NgxBootstrapIconsModule.pick(allIcons),
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }