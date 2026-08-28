import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PagedResult, Transaccion, TransaccionFiltros, TransaccionForm } from '../models/models';

@Injectable({ providedIn: 'root' })
export class TransaccionService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.transactionServiceUrl}/api/transacciones`;

  listar(filtros: TransaccionFiltros): Observable<PagedResult<Transaccion>> {
    let params = new HttpParams()
      .set('page', filtros.page)
      .set('pageSize', filtros.pageSize);

    if (filtros.productoId != null) params = params.set('productoId', filtros.productoId);
    if (filtros.tipoTransaccion) params = params.set('tipoTransaccion', filtros.tipoTransaccion);
    if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta);

    return this.http
      .get<ApiResponse<PagedResult<Transaccion>>>(this.baseUrl, { params })
      .pipe(map(res => res.data));
  }

  obtenerPorId(id: number): Observable<Transaccion> {
    return this.http.get<ApiResponse<Transaccion>>(`${this.baseUrl}/${id}`).pipe(map(res => res.data));
  }

  crear(transaccion: TransaccionForm): Observable<ApiResponse<Transaccion>> {
    return this.http.post<ApiResponse<Transaccion>>(this.baseUrl, transaccion);
  }

  actualizarDetalle(id: number, detalle: string | undefined): Observable<ApiResponse<Transaccion>> {
    return this.http.put<ApiResponse<Transaccion>>(`${this.baseUrl}/${id}`, { detalle });
  }

  eliminar(id: number): Observable<ApiResponse<object>> {
    return this.http.delete<ApiResponse<object>>(`${this.baseUrl}/${id}`);
  }
}
