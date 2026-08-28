export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  categoria: string;
  imagenUrl?: string;
  precio: number;
  stock: number;
  fechaCreacion: string;
  activo: boolean;
}

export interface ProductoForm {
  nombre: string;
  descripcion?: string;
  categoria: string;
  imagenUrl?: string;
  precio: number;
  stock: number;
}

export type TipoTransaccion = 'Compra' | 'Venta';

export interface Transaccion {
  id: number;
  fecha: string;
  tipoTransaccion: TipoTransaccion;
  productoId: number;
  productoNombre?: string;
  productoStockActual?: number;
  cantidad: number;
  precioUnitario: number;
  precioTotal: number;
  detalle?: string;
}

export interface TransaccionForm {
  tipoTransaccion: TipoTransaccion;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  detalle?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ProductoFiltros {
  nombre?: string;
  categoria?: string;
  precioMin?: number;
  precioMax?: number;
  stockMin?: number;
  page: number;
  pageSize: number;
}

export interface TransaccionFiltros {
  productoId?: number;
  tipoTransaccion?: TipoTransaccion | '';
  fechaDesde?: string;
  fechaHasta?: string;
  page: number;
  pageSize: number;
}
