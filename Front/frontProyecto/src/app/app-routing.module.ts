import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductoFormComponent } from './producto-form/producto-form.component';
import { MisPublicacionesComponent } from './mis-publicaciones/mis-publicaciones.component';

const routes: Routes = [
  { path: 'publicar', component: ProductoFormComponent },
  { path: 'editar/:id', component: ProductoFormComponent },
  { path: 'mis-publicaciones', component: MisPublicacionesComponent },
  { path: '', redirectTo: 'publicar', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
