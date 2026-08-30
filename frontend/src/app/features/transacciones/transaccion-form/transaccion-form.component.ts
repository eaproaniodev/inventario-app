import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TransaccionService } from '../../../core/services/transaccion.service';
import { ProductoService } from '../../../core/services/producto.service';
import { ToastService } from '../../../core/services/toast.service';
import { Producto, Transaccion, TipoTransaccion } from '../../../core/models/models';

@Component({
  selector: 'app-transaccion-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './transaccion-form.component.html',
  styleUrl: './transaccion-form.component.css'
})
export class TransaccionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private transaccionService = inject(TransaccionService);
  private productoService = inject(ProductoService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  transaccionId: number | null = null;
  modoEdicion = false;
  guardando = signal(false);
  cargando = signal(false);
  productos = signal<Producto[]>([]);
  productoSeleccionado = signal<Producto | null>(null);
  transaccionOriginal = signal<Transaccion | null>(null);

  form = this.fb.nonNullable.group({
    tipoTransaccion: this.fb.nonNullable.control<TipoTransaccion>('Venta', [Validators.required]),
    productoId: [0, [Validators.required, Validators.min(1)]],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    precioUnitario: [0, [Validators.required, Validators.min(0.01)]],
    detalle: ['', [Validators.maxLength(500)]]
  }, { validators: [this.validarStockDisponible.bind(this)] });

  ngOnInit(): void {
    this.cargarProductos();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.transaccionId = Number(idParam);
      this.modoEdicion = true;
      this.cargarTransaccion(this.transaccionId);
    } else {
      this.form.get('productoId')!.valueChanges.subscribe((id) => this.onProductoChange(id));
    }
  }

  private cargarProductos(): void {
    this.productoService.listar({ page: 1, pageSize: 100 }).subscribe({
      next: (res) => this.productos.set(res.items)
    });
  }

  private cargarTransaccion(id: number): void {
    this.cargando.set(true);
    this.transaccionService.obtenerPorId(id).subscribe({
      next: (t) => {
        this.transaccionOriginal.set(t);
        this.form.patchValue({
          tipoTransaccion: t.tipoTransaccion,
          productoId: t.productoId,
          cantidad: t.cantidad,
          precioUnitario: t.precioUnitario,
          detalle: t.detalle ?? ''
        });
        // En edición: producto, tipo y cantidad quedan bloqueados (ya afectaron el stock)
        this.form.get('tipoTransaccion')!.disable();
        this.form.get('productoId')!.disable();
        this.form.get('cantidad')!.disable();
        this.form.get('precioUnitario')!.disable();
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.router.navigate(['/transacciones']);
      }
    });
  }

  private onProductoChange(id: number): void {
    const producto = this.productos().find(p => p.id === Number(id)) ?? null;
    this.productoSeleccionado.set(producto);

    // Autocompletar el precio unitario con el precio actual del producto. 
    // El campo queda editable por si el precio real de esta transacción difiere
    // (por ejemplo, un costo de compra distinto al precio de venta del catálogo).
    if (producto) {
      this.form.get('precioUnitario')!.setValue(producto.precio);
    }

    this.form.updateValueAndValidity();
  }

  // Validación compleja: no permitir vender más stock del disponible
  private validarStockDisponible(group: AbstractControl): ValidationErrors | null {
    const tipo = group.get('tipoTransaccion')?.value;
    const cantidad = Number(group.get('cantidad')?.value ?? 0);
    const producto = this.productoSeleccionado();

    if (tipo === 'Venta' && producto && cantidad > producto.stock) {
      return { stockInsuficiente: { disponible: producto.stock } };
    }
    return null;
  }

  get f() {
    return this.form.controls;
  }

  get stockInsuficiente(): boolean {
    return !!this.form.errors?.['stockInsuficiente'];
  }

  get stockDisponible(): number | null {
    return this.form.errors?.['stockInsuficiente']?.disponible ?? this.productoSeleccionado()?.stock ?? null;
  }

  guardar(): void {
    if (this.modoEdicion) {
      // Solo se guarda el detalle/observación
      this.guardando.set(true);
      const detalle = this.form.getRawValue().detalle;
      this.transaccionService.actualizarDetalle(this.transaccionId!, detalle).subscribe({
        next: (res) => {
          this.toast.success(res.message);
          this.guardando.set(false);
          this.router.navigate(['/transacciones']);
        },
        error: () => this.guardando.set(false)
      });
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.stockInsuficiente) {
        this.toast.error(`Stock insuficiente. Disponible: ${this.stockDisponible}`);
      } else {
        this.toast.error('Revise los campos marcados en rojo antes de continuar');
      }
      return;
    }

    this.guardando.set(true);
    const value = this.form.getRawValue();
    this.transaccionService.crear(value).subscribe({
      next: (res) => {
        this.toast.success(res.message);
        this.guardando.set(false);
        this.router.navigate(['/transacciones']);
      },
      error: () => this.guardando.set(false)
    });
  }
}
