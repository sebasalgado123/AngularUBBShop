import { Component } from '@angular/core';
import { allIcons } from 'ngx-bootstrap-icons';
import { IProduct } from './product';
import { ProductService } from './product/product.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'UBBShop';
  _listFilter: string = '';
  filteredProducts: IProduct[] = [];
  selectedCategory: string = 'Todas';
  
  constructor(private productService: ProductService){}


  // Usar categories basadas en la propiedad 'category'
  get categories(): string[] {
    const uniqueCategories = new Set(this.products.map(p => p.categoria));
    return ['Todas', ...Array.from(uniqueCategories)];
  }

  get listFilter(): string {
    return this._listFilter;
  }

  set listFilter(value: string) {
    this._listFilter = value;
    this.applyFilters();
  }

  products:IProduct[]=[
    /*{
      "productId": 2,
      "productName": "Camisa de algodon",
      "productCode": "GDN-1234",
      "releaseDate": "Abril 10., 2016",
      "description": "Camisa de algodon de alta calidad",
      "price": 9.99,
      "starRating": 2.5,
       "imageUrl":"../assets/1.png",
       "category":"Camisa"
    },
    {
      "productId": 3,
      "productName": "Pantalon de tela",
      "productCode": "GDN-6969",
      "releaseDate": "Enero 11., 2016",
      "description": "Pantalon pa weno",
      "price": 29.99,
      "starRating": 4.5,
       "imageUrl":"../assets/2.png",
       "category":"Pantalon"
    },
    {
      "productId": 4,
      "productName": "Peineta para calvos",
      "productCode": "GDN-1001",
      "releaseDate": "Febrero 30., 2016",
      "description": "Perfecto para sacar piojos",
      "price": 5.99,
      "starRating": 5.0,
       "imageUrl":"../assets/3.png",
       "category":"Peineta"
    },
    {
      "productId": 5,
      "productName": "Zapatillas para cojos",
      "productCode": "GDN-1",
      "releaseDate": "Julio 10., 2016",
      "description": "Es un par de zapatillas para el mismo pie",
      "price": 69.99,
      "starRating": 3.9,
       "imageUrl":"../assets/4.png",
       "category":"Zapatillas"
    },
    {
      "productId": 6,
      "productName": "Gafas de sol para ciego",
      "productCode": "GDN-0000",
      "releaseDate": "Diciembre 25., 2016",
      "description": "Gafas de sol para que no se dañen los ojos",
      "price": 49.99,
      "starRating": 4.2,
       "imageUrl":"../assets/5.png",
       "category":"Gafas"
    }*/
  ];

  ngOnInit(): void {
    this.products=this.productService.getProducts();
    this.filteredProducts = this.products;
  }

  applyFilters(): void {
    const filterBy = this._listFilter.toLowerCase();
    this.filteredProducts = this.products.filter(product => {
      const matchesName = product.titulo.toLowerCase().includes(filterBy);
      const matchesCategory = this.selectedCategory === 'Todas' || product.categoria === this.selectedCategory;
      return matchesName && matchesCategory;
    });
  }

  // Para llamar desde el select category change
  onCategoryChange(): void {
    this.applyFilters();
  }
}

