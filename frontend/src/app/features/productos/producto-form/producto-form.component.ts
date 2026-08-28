import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductoService } from '../../../core/services/producto.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './producto-form.component.html',
  styleUrl: './producto-form.component.css'
})
export class ProductoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productoService = inject(ProductoService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  productoId: number | null = null;
  modoEdicion = false;
  guardando = signal(false);
  cargandoProducto = signal(false);

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    descripcion: ['', [Validators.maxLength(500)]],
    categoria: ['', [Validators.required, Validators.maxLength(100)]],
    imagenUrl: ['', [Validators.pattern(/^(https?:\/\/.+|)$/)]],
    precio: [0, [Validators.required, Validators.min(0.01)]],
    stock: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.productoId = Number(idParam);
      this.modoEdicion = true;
      this.cargarProducto(this.productoId);
    }
  }

  private cargarProducto(id: number): void {
    this.cargandoProducto.set(true);
    this.productoService.obtenerPorId(id).subscribe({
      next: (producto) => {
        this.form.patchValue({
          nombre: producto.nombre,
          descripcion: producto.descripcion ?? '',
          categoria: producto.categoria,
          imagenUrl: producto.imagenUrl ?? '',
          precio: producto.precio,
          stock: producto.stock
        });
        this.cargandoProducto.set(false);
      },
      error: () => {
        this.cargandoProducto.set(false);
        this.router.navigate(['/productos']);
      }
    });
  }

  get f() {
    return this.form.controls;
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Revise los campos marcados en rojo antes de continuar');
      return;
    }

    this.guardando.set(true);
    const value = this.form.getRawValue();

    const request$ = this.modoEdicion && this.productoId
      ? this.productoService.actualizar(this.productoId, value)
      : this.productoService.crear(value);

    request$.subscribe({
      next: (res) => {
        this.toast.success(res.message);
        this.guardando.set(false);
        this.router.navigate(['/productos']);
      },
      error: () => this.guardando.set(false)
    });
  }
}
