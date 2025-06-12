import { Injectable } from '@angular/core';
import { IProduct } from '../product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor() { }

  getProducts():IProduct[]{
    return[
      {
      "id_producto": 1,
      "titulo": "Zapatillas de lona",
      "descripcion": "zapatillas de alta calidad, de lona reforzada",
      "precio": 50.000,
      "contacto": "Señora Chepita",
      "disponibilidad": true,
      "fecha_creacion": "12/06/2025",
      "fecha_modificacion":"20/06/2025",
       "imageUrl":"../assets/6.png",
       "categoria":"zapatillas"
    },
        {
      "id_producto": 1,
      "titulo": "camisa",
      "descripcion": "zapatillas de alta calidad, de lona reforzada",
      "precio": 50.000,
      "contacto": "Señora Chepita",
      "disponibilidad": true,
      "fecha_creacion": "12/06/2025",
      "fecha_modificacion":"20/06/2025",
       "imageUrl":"../assets/6.png",
       "categoria":"camisa"
    }
    ]
  }
}
