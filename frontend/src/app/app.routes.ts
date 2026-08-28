import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'productos', pathMatch: 'full' },

  {
    path: 'productos',
    loadComponent: () =>
      import('./features/productos/producto-list/producto-list.component').then(m => m.ProductoListComponent)
  },
  {
    path: 'productos/nuevo',
    loadComponent: () =>
      import('./features/productos/producto-form/producto-form.component').then(m => m.ProductoFormComponent)
  },
  {
    path: 'productos/editar/:id',
    loadComponent: () =>
      import('./features/productos/producto-form/producto-form.component').then(m => m.ProductoFormComponent)
  },

  {
    path: 'transacciones',
    loadComponent: () =>
      import('./features/transacciones/transaccion-list/transaccion-list.component').then(m => m.TransaccionListComponent)
  },
  {
    path: 'transacciones/nueva',
    loadComponent: () =>
      import('./features/transacciones/transaccion-form/transaccion-form.component').then(m => m.TransaccionFormComponent)
  },
  {
    path: 'transacciones/editar/:id',
    loadComponent: () =>
      import('./features/transacciones/transaccion-form/transaccion-form.component').then(m => m.TransaccionFormComponent)
  },

  { path: '**', redirectTo: 'productos' }
];
