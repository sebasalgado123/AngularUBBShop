import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IProduct } from '../product';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private api = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient) { }

  getProducts(): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(this.api);
  }

  getProduct(id: number): Observable<IProduct> {
    return this.http.get<IProduct>(`${this.api}/${id}`);
  }
}
