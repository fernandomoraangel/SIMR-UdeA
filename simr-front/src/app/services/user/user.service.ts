import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  url = 'http://localhost:3000/users/';
  // user: User;

  constructor(private http: HttpClient) { }

  getUsers(): Observable<any> {
    return this.http.get(this.url);
  }

  getUserById(id: string): Observable<any> {
    return this.http.get(this.url + id);
  }

  eliminarProducto(id: string): Observable<any> {
    return this.http.delete(this.url + id);
  }

  guardarProducto(producto: Producto): Observable<any> {
    return this.http.post(this.url, producto);
  }

  obtenerProducto(id: string): Observable<any> {
    return this.http.get(this.url + id);
  }

  actualizarProducto(id: string, producto: Producto): Observable<any> {
    return this.http.put(this.url + id, producto);
  }

}




// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { Producto } from '../models/producto';

// @Injectable({
//   providedIn: 'root',
// })
// export class ProductoService {
//   url = 'http://localhost:4000/api/productos/';

//   constructor(private http: HttpClient) {}

//   getProductos(): Observable<any> {
//     return this.http.get(this.url);
//   }

//   eliminarProducto(id: string): Observable<any> {
//     return this.http.delete(this.url + id);
//   }

//   guardarProducto(producto: Producto): Observable<any> {
//     return this.http.post(this.url, producto);
//   }

//   obtenerProducto(id: string): Observable<any> {
//     return this.http.get(this.url + id);
//   }

//   actualizarProducto(id: string, producto: Producto): Observable<any> {
//     return this.http.put(this.url + id, producto);
//   }

// }
