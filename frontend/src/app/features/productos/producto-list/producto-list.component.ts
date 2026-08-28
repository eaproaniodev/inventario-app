import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductoService } from '../../../core/services/producto.service';
import { ToastService } from '../../../core/services/toast.service';
import { Producto, ProductoFiltros } from '../../../core/models/models';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-producto-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginatorComponent, ConfirmDialogComponent],
  templateUrl: './producto-list.component.html',
  styleUrl: './producto-list.component.css'
})
export class ProductoListComponent implements OnInit {
  private productoService = inject(ProductoService);
  private toast = inject(ToastService);

  productos = signal<Producto[]>([]);
  totalItems = signal(0);
  totalPages = signal(0);
  cargando = signal(false);
  mostrarFiltros = signal(false);

  filtros: ProductoFiltros = {
    nombre: '',
    categoria: '',
    precioMin: undefined,
    precioMax: undefined,
    stockMin: undefined,
    page: 1,
    pageSize: 10
  };

  productoAEliminar: Producto | null = null;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.productoService.listar(this.filtros).subscribe({
      next: (result) => {
        this.productos.set(result.items);
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
    this.filtros = { nombre: '', categoria: '', precioMin: undefined, precioMax: undefined, stockMin: undefined, page: 1, pageSize: this.filtros.pageSize };
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

  confirmarEliminar(producto: Producto): void {
    this.productoAEliminar = producto;
  }

  eliminar(): void {
    if (!this.productoAEliminar) return;
    this.productoService.eliminar(this.productoAEliminar.id).subscribe({
      next: (res) => {
        this.toast.success(res.message);
        this.productoAEliminar = null;
        this.cargar();
      }
    });
  }
}
