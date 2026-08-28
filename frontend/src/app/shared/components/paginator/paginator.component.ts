import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-paginator',
  standalone: true,
  template: `
    <div class="paginator">
      <span class="paginator__info">
        Total: {{ totalItems }} registro(s) — Página {{ page }} de {{ totalPages || 1 }}
      </span>
      <div class="paginator__controls">
        <button class="btn-secondary" [disabled]="page <= 1" (click)="cambiar(page - 1)">‹ Anterior</button>
        <button class="btn-secondary" [disabled]="page >= totalPages" (click)="cambiar(page + 1)">Siguiente ›</button>
        <select [value]="pageSize" (change)="cambiarTamano($event)">
          <option [value]="5">5 / página</option>
          <option [value]="10">10 / página</option>
          <option [value]="20">20 / página</option>
          <option [value]="50">50 / página</option>
        </select>
      </div>
    </div>
  `,
  styles: [`
    .paginator {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 14px;
      flex-wrap: wrap;
      gap: 10px;
    }
    .paginator__info { font-size: 13px; color: #64748b; }
    .paginator__controls { display: flex; align-items: center; gap: 8px; }
    .paginator__controls select { width: auto; padding: 6px 8px; }
  `]
})
export class PaginatorComponent {
  @Input() page = 1;
  @Input() pageSize = 10;
  @Input() totalItems = 0;
  @Input() totalPages = 0;

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  cambiar(nuevaPagina: number): void {
    if (nuevaPagina < 1 || (this.totalPages > 0 && nuevaPagina > this.totalPages)) return;
    this.pageChange.emit(nuevaPagina);
  }

  cambiarTamano(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.pageSizeChange.emit(value);
  }
}
