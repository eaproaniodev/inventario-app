import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PagedResult, Producto, ProductoFiltros, ProductoForm } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.productServiceUrl}/api/productos`;

  listar(filtros: ProductoFiltros): Observable<PagedResult<Producto>> {
    let params = new HttpParams()
      .set('page', filtros.page)
      .set('pageSize', filtros.pageSize);

    if (filtros.nombre) params = params.set('nombre', filtros.nombre);
    if (filtros.categoria) params = params.set('categoria', filtros.categoria);
    if (filtros.precioMin != null) params = params.set('precioMin', filtros.precioMin);
    if (filtros.precioMax != null) params = params.set('precioMax', filtros.precioMax);
    if (filtros.stockMin != null) params = params.set('stockMin', filtros.stockMin);

    return this.http
      .get<ApiResponse<PagedResult<Producto>>>(this.baseUrl, { params })
      .pipe(map(res => res.data));
  }

  obtenerPorId(id: number): Observable<Producto> {
    return this.http.get<ApiResponse<Producto>>(`${this.baseUrl}/${id}`).pipe(map(res => res.data));
  }

  crear(producto: ProductoForm): Observable<ApiResponse<Producto>> {
    return this.http.post<ApiResponse<Producto>>(this.baseUrl, producto);
  }

  actualizar(id: number, producto: ProductoForm): Observable<ApiResponse<Producto>> {
    return this.http.put<ApiResponse<Producto>>(`${this.baseUrl}/${id}`, producto);
  }

  eliminar(id: number): Observable<ApiResponse<object>> {
    return this.http.delete<ApiResponse<object>>(`${this.baseUrl}/${id}`);
  }
}
