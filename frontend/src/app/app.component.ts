import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  template: `
    <header class="app-header">
      <div class="app-header__brand">📦 Inventario App</div>
      <nav class="app-header__nav">
        <a routerLink="/productos" routerLinkActive="active">Productos</a>
        <a routerLink="/transacciones" routerLinkActive="active">Transacciones</a>
      </nav>
    </header>

    <main class="app-main">
      <router-outlet />
    </main>

    <app-toast />
  `,
  styles: [`
    .app-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 28px;
      background: #fff;
      border-bottom: 1px solid #e2e8f0;
    }
    .app-header__brand { font-weight: 700; font-size: 18px; color: #1e293b; }
    .app-header__nav { display: flex; gap: 20px; }
    .app-header__nav a {
      text-decoration: none;
      color: #64748b;
      font-weight: 500;
      padding: 6px 4px;
      border-bottom: 2px solid transparent;
    }
    .app-header__nav a.active { color: #2563eb; border-color: #2563eb; }
    .app-main { max-width: 1100px; margin: 24px auto; padding: 0 20px 40px; }
  `]
})
export class AppComponent {}
