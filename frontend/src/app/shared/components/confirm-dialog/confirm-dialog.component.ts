import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (visible) {
      <div class="overlay" (click)="cancelar.emit()">
        <div class="dialog" (click)="$event.stopPropagation()">
          <h3>{{ titulo }}</h3>
          <p>{{ mensaje }}</p>
          <div class="dialog__actions">
            <button class="btn-secondary" (click)="cancelar.emit()">Cancelar</button>
            <button class="btn-danger" (click)="confirmar.emit()">Confirmar</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .overlay {
      position: fixed; inset: 0;
      background: rgba(15, 23, 42, 0.45);
      display: flex; align-items: center; justify-content: center;
      z-index: 999;
    }
    .dialog {
      background: #fff; border-radius: 10px; padding: 22px;
      width: 320px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    .dialog h3 { margin: 0 0 8px; font-size: 16px; }
    .dialog p { margin: 0 0 18px; color: #64748b; font-size: 14px; }
    .dialog__actions { display: flex; justify-content: flex-end; gap: 8px; }
  `]
})
export class ConfirmDialogComponent {
  @Input() visible = false;
  @Input() titulo = 'Confirmar acción';
  @Input() mensaje = '¿Está seguro de realizar esta acción?';
  @Output() confirmar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();
}
