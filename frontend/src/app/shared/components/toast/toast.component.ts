import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class.toast--error]="toast.type === 'error'" [class.toast--success]="toast.type === 'success'">
          <span>{{ toast.message }}</span>
          <button (click)="toastService.dismiss(toast.id)" aria-label="Cerrar">✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 18px;
      right: 18px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 1000;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 260px;
      padding: 12px 16px;
      border-radius: 8px;
      color: #fff;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .toast--success { background: #16a34a; }
    .toast--error { background: #dc2626; }
    .toast button {
      background: transparent;
      color: #fff;
      padding: 0;
      margin-left: auto;
      font-size: 14px;
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
