import { Component, OnInit, Input, Output, EventEmitter, inject, signal, effect } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { CarritoService } from '../../../service/carrito';
import { ArticuloService } from '../../../service/articulo';
import { UsuarioService } from '../../../service/usuarioService';
import { ICarrito } from '../../../model/carrito';
import { IArticulo } from '../../../model/articulo';
import { IUsuario } from '../../../model/usuario';
import { ArticuloPlistAdminUnrouted } from '../../articulo/plist-admin-unrouted/articulo-plist-admin-unrouted';
import { UsuarioPlistAdminUnrouted } from '../../usuario/plist-admin-unrouted/usuario-plist-admin-unrouted';

@Component({
  selector: 'app-carrito-form-unrouted',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './carrito-form.html',
  styleUrls: ['./carrito-form.css'],
})
export class CarritoFormAdminUnrouted implements OnInit {
  @Input() carrito: ICarrito | null = null;
  @Input() mode: 'create' | 'edit' = 'create';
  @Output() formSuccess = new EventEmitter<void>();
  @Output() formCancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private oCarritoService = inject(CarritoService);
  private oArticuloService = inject(ArticuloService);
  private oUsuarioService = inject(UsuarioService);
  private dialog = inject(MatDialog);

  carritoForm!: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  submitting = signal(false);
  selectedArticulo = signal<IArticulo | null>(null);
  selectedUsuario = signal<IUsuario | null>(null);

  constructor() {
    effect(() => {
      const c = this.carrito;
      if (c && this.carritoForm) {
        this.loadCarritoData(c);
      }
    });
  }

  ngOnInit(): void {
    this.initForm();
    if (this.carrito) {
      this.loadCarritoData(this.carrito);
    }
  }

  private initForm(): void {
    this.carritoForm = this.fb.group({
      id: [{ value: 0, disabled: true }],
      cantidad: [0, [Validators.required, Validators.min(1)]],
      id_articulo: [null, Validators.required],
      id_usuario: [null, Validators.required],
    });
  }

  private loadCarritoData(carrito: ICarrito): void {
    this.carritoForm.patchValue({
      id: carrito.id,
      cantidad: carrito.cantidad,
      id_articulo: carrito.articulo?.id,
      id_usuario: carrito.usuario?.id,
    });

    if (carrito.articulo?.id) {
      this.syncArticulo(carrito.articulo.id);
    }
    if (carrito.usuario?.id) {
      this.syncUsuario(carrito.usuario.id);
    }
  }

  private syncArticulo(id_articulo: number | null): void {
    if (!id_articulo) {
      this.selectedArticulo.set(null);
      return;
    }
    this.oArticuloService.get(id_articulo).subscribe({
      next: (articulo: IArticulo) => this.selectedArticulo.set(articulo),
      error: (err: HttpErrorResponse) => {
        this.selectedArticulo.set(null);
        console.error(err);
        this.snackBar.open('Error al cargar el artículo seleccionado', 'Cerrar', { duration: 3000 });
      },
    });
  }

  private syncUsuario(id_usuario: number | null): void {
    if (!id_usuario) {
      this.selectedUsuario.set(null);
      return;
    }
    this.oUsuarioService.get(id_usuario).subscribe({
      next: (usuario: IUsuario) => this.selectedUsuario.set(usuario),
      error: (err: HttpErrorResponse) => {
        this.selectedUsuario.set(null);
        console.error(err);
        this.snackBar.open('Error al cargar el usuario seleccionado', 'Cerrar', { duration: 3000 });
      },
    });
  }

  openArticuloFinderModal(): void {
    const dialogRef = this.dialog.open(ArticuloPlistAdminUnrouted, {
      height: '800px',
      width: '1100px',
      maxWidth: '95vw',
      panelClass: 'articulo-dialog',
      data: { title: 'Aquí elegir artículo', message: 'Plist finder para encontrar el artículo' },
    });

    dialogRef.afterClosed().subscribe((articulo: IArticulo | null) => {
      if (articulo) {
        this.carritoForm.patchValue({ id_articulo: articulo.id });
        this.syncArticulo(articulo.id);
        this.snackBar.open(`Artículo seleccionado: ${articulo.descripcion}`, 'Cerrar', { duration: 3000 });
      }
    });
  }

  openUsuarioFinderModal(): void {
    const dialogRef = this.dialog.open(UsuarioPlistAdminUnrouted, {
      height: '800px',
      width: '1100px',
      maxWidth: '95vw',
      panelClass: 'usuario-dialog',
      data: { title: 'Aquí elegir usuario', message: 'Plist finder para encontrar el usuario' },
    });

    dialogRef.afterClosed().subscribe((usuario: IUsuario | null) => {
      if (usuario) {
        this.carritoForm.patchValue({ id_usuario: usuario.id });
        this.syncUsuario(usuario.id);
        this.snackBar.open(`Usuario seleccionado: ${usuario.nombre}`, 'Cerrar', { duration: 3000 });
      }
    });
  }

  get cantidad() {
    return this.carritoForm.get('cantidad');
  }

  get id_articulo() {
    return this.carritoForm.get('id_articulo');
  }

  get id_usuario() {
    return this.carritoForm.get('id_usuario');
  }

  onSubmit(): void {
    if (this.carritoForm.invalid) {
      this.snackBar.open('Por favor, complete todos los campos correctamente', 'Cerrar', { duration: 4000 });
      return;
    }

    this.submitting.set(true);

    const carritoData: any = {
      cantidad: this.carritoForm.value.cantidad,
      articulo: { id: this.carritoForm.value.id_articulo },
      usuario: { id: this.carritoForm.value.id_usuario },
    };

    if (this.mode === 'edit' && this.carrito?.id) {
      carritoData.id = this.carrito.id;
      this.oCarritoService.update(carritoData).subscribe({
        next: (id: number) => {
          this.snackBar.open('Carrito actualizado exitosamente', 'Cerrar', { duration: 4000 });
          this.submitting.set(false);
          this.formSuccess.emit();
        },
        error: (err: HttpErrorResponse) => {
          this.error.set('Error actualizando el carrito');
          this.snackBar.open('Error actualizando el carrito', 'Cerrar', { duration: 4000 });
          console.error(err);
          this.submitting.set(false);
        },
      });
    } else {
      this.oCarritoService.create(carritoData).subscribe({
        next: (id: number) => {
          this.snackBar.open('Carrito creado exitosamente', 'Cerrar', { duration: 4000 });
          this.submitting.set(false);
          this.formSuccess.emit();
        },
        error: (err: HttpErrorResponse) => {
          this.error.set('Error creando el carrito');
          this.snackBar.open('Error creando el carrito', 'Cerrar', { duration: 4000 });
          console.error(err);
          this.submitting.set(false);
        },
      });
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }
}
