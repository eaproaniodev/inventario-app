import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TransaccionService } from '../../../core/services/transaccion.service';
import { ToastService } from '../../../core/services/toast.service';
import { Transaccion, TransaccionFiltros } from '../../../core/models/models';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-transaccion-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginatorComponent, ConfirmDialogComponent],
  templateUrl: './transaccion-list.component.html',
  styleUrl: './transaccion-list.component.css'
})
export class TransaccionListComponent implements OnInit {
  private transaccionService = inject(TransaccionService);
  private toast = inject(ToastService);

  transacciones = signal<Transaccion[]>([]);
  totalItems = signal(0);
  totalPages = signal(0);
  cargando = signal(false);
  mostrarFiltros = signal(false);

  filtros: TransaccionFiltros = {
    productoId: undefined,
    tipoTransaccion: '',
    fechaDesde: '',
    fechaHasta: '',
    page: 1,
    pageSize: 10
  };

  transaccionAEliminar: Transaccion | null = null;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.transaccionService.listar(this.filtros).subscribe({
      next: (result) => {
        this.transacciones.set(result.items);
        this.totalItems.set(result.totalItems);
        this.totalPages.set(result.totalPages);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  aplicarFiltros(): void {
    this.filtros.page = 1;
    this.cargar();
  }

  limpiarFiltros(): void {
    this.filtros = { productoId: undefined, tipoTransaccion: '', fechaDesde: '', fechaHasta: '', page: 1, pageSize: this.filtros.pageSize };
    this.cargar();
  }

  onPageChange(page: number): void {
    this.filtros.page = page;
    this.cargar();
  }

  onPageSizeChange(pageSize: number): void {
    this.filtros.pageSize = pageSize;
    this.filtros.page = 1;
    this.cargar();
  }

  confirmarEliminar(transaccion: Transaccion): void {
    this.transaccionAEliminar = transaccion;
  }

  eliminar(): void {
    if (!this.transaccionAEliminar) return;
    this.transaccionService.eliminar(this.transaccionAEliminar.id).subscribe({
      next: (res) => {
        this.toast.success(res.message);
        this.transaccionAEliminar = null;
        this.cargar();
      }
    });
  }
}
