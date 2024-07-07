export class User {
  _id?: string;
  nombre: string;
  categoria: string;
  ubicacion: string;
  precio: number;

  constructor(nombre: string, categoria: string, ubicacion: string, precio: number) {
    this.nombre = nombre;
    this.categoria = categoria;
    this.ubicacion = ubicacion;
    this.precio = precio;
  }
}