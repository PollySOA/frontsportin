import { Component, OnInit, Input, Output, EventEmitter, inject, signal, effect } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ComentarioartService } from '../../../service/comentarioart';
import { ArticuloService } from '../../../service/articulo';
import { UsuarioService } from '../../../service/usuarioService';
import { IComentarioart } from '../../../model/comentarioart';
import { IArticulo } from '../../../model/articulo';
import { IUsuario } from '../../../model/usuario';
import { ArticuloPlistAdminUnrouted } from '../../articulo/plist-admin-unrouted/articulo-plist-admin-unrouted';
import { UsuarioPlistAdminUnrouted } from '../../usuario/plist-admin-unrouted/usuario-plist-admin-unrouted';

@Component({
  selector: 'app-comentarioart-form-unrouted',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './comentarioart-form.html',
  styleUrls: ['./comentarioart-form.css'],
})
export class ComentarioartFormAdminUnrouted implements OnInit {
  @Input() comentarioart: IComentarioart | null = null;
  @Input() mode: 'create' | 'edit' = 'create';
  @Output() formSuccess = new EventEmitter<void>();
  @Output() formCancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private oComentarioartService = inject(ComentarioartService);
  private oArticuloService = inject(ArticuloService);
  private oUsuarioService = inject(UsuarioService);
  private dialog = inject(MatDialog);

  comentarioartForm!: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  submitting = signal(false);
  articulos = signal<IArticulo[]>([]);
  usuarios = signal<IUsuario[]>([]);
  selectedArticulo = signal<IArticulo | null>(null);
  displayIdArticulo = signal<number | null>(null);
  selectedUsuario = signal<IUsuario | null>(null);
  displayIdUsuario = signal<number | null>(null);

  constructor() {
    effect(() => {
      const c = this.comentarioart;
      if (c && this.comentarioartForm) {
        this.loadComentarioData(c);
      }
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.loadArticulos();
    this.loadUsuarios();

    if (this.comentarioart) {
      this.loadComentarioData(this.comentarioart);
    }
  }

  private initForm(): void {
    this.comentarioartForm = this.fb.group({
      id: [{ value: 0, disabled: true }],
      contenido: ['', [Validators.required]],
      id_articulo: [null, Validators.required],
      id_usuario: [null, Validators.required],
    });

    this.comentarioartForm.get('id_articulo')?.valueChanges.subscribe((id) => {
      if (id) {
        this.loadArticulo(Number(id));
      } else {
        this.selectedArticulo.set(null);
        this.displayIdArticulo.set(null);
      }
    });

    this.comentarioartForm.get('id_usuario')?.valueChanges.subscribe((id) => {
      if (id) {
        this.loadUsuario(Number(id));
      } else {
        this.selectedUsuario.set(null);
        this.displayIdUsuario.set(null);
      }
    });
  }

  private loadComentarioData(com: IComentarioart): void {
    this.comentarioartForm.patchValue({
      id: com.id,
      contenido: com.contenido,
      id_articulo: com.articulo?.id ?? com.idArticulo ?? null,
      id_usuario: com.usuario?.id ?? com.idUsuario ?? null,
    });

    if (com.articulo?.id) {
      this.syncArticulo(com.articulo.id);
    }
    if (com.usuario?.id) {
      this.syncUsuario(com.usuario.id);
    }
  }

  private syncArticulo(id_articulo: number | null): void {
    if (!id_articulo) {
      this.selectedArticulo.set(null);
      return;
    }
    this.oArticuloService.get(id_articulo).subscribe({
      next: (articulo: IArticulo) => {
        this.selectedArticulo.set(articulo);
        this.displayIdArticulo.set(articulo.id);
      },
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
      next: (usuario: IUsuario) => {
        this.selectedUsuario.set(usuario);
        this.displayIdUsuario.set(usuario.id);
      },
      error: (err: HttpErrorResponse) => {
        this.selectedUsuario.set(null);
        console.error(err);
        this.snackBar.open('Error al cargar el usuario seleccionado', 'Cerrar', { duration: 3000 });
      },
    });
  }

  private loadArticulos(): void {
    this.oArticuloService.getPage(0, 1000, 'descripcion', 'asc').subscribe({
      next: (page) => {
        this.articulos.set(page.content);
        const idActual = this.comentarioartForm.get('id_articulo')?.value;
        if (idActual) {
          this.syncArticulo(Number(idActual));
        }
      },
      error: (err: HttpErrorResponse) => {
        this.snackBar.open('Error cargando articulos', 'Cerrar', { duration: 4000 });
        console.error(err);
      },
    });
  }

  private loadUsuarios(): void {
    this.oUsuarioService.getPage(0, 1000, 'nombre', 'asc').subscribe({
      next: (page) => {
        this.usuarios.set(page.content);
        const idActual = this.comentarioartForm.get('id_usuario')?.value;
        if (idActual) {
          this.syncUsuario(Number(idActual));
        }
      },
      error: (err: HttpErrorResponse) => {
        this.snackBar.open('Error cargando usuarios', 'Cerrar', { duration: 4000 });
        console.error(err);
      },
    });
  }

  private loadArticulo(id: number): void {
    this.oArticuloService.get(id).subscribe({
      next: (art) => {
        this.selectedArticulo.set(art);
        this.displayIdArticulo.set(art.id);
      },
      error: (err: HttpErrorResponse) => {
        this.selectedArticulo.set(null);
        console.error(err);
      },
    });
  }

  private loadUsuario(id: number): void {
    this.oUsuarioService.get(id).subscribe({
      next: (usr) => {
        this.selectedUsuario.set(usr);
        this.displayIdUsuario.set(usr.id);
      },
      error: (err: HttpErrorResponse) => {
        this.selectedUsuario.set(null);
        console.error(err);
      },
    });
  }

  openArticuloFinderModal(): void {
    const dialogRef = this.dialog.open(ArticuloPlistAdminUnrouted, {
      height: '800px',
      width: '1100px',
      maxWidth: '95vw',
      panelClass: 'articulo-dialog',
      data: { title: 'Elegir artículo', message: 'Plist finder' },
    });

    dialogRef.afterClosed().subscribe((articulo: IArticulo | null) => {
      if (articulo) {
        this.comentarioartForm.patchValue({ id_articulo: articulo.id });
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
      data: { title: 'Elegir usuario', message: 'Plist finder' },
    });

    dialogRef.afterClosed().subscribe((usuario: IUsuario | null) => {
      if (usuario) {
        this.comentarioartForm.patchValue({ id_usuario: usuario.id });
        this.syncUsuario(usuario.id);
        this.snackBar.open(`Usuario seleccionado: ${usuario.nombre}`, 'Cerrar', { duration: 3000 });
      }
    });
  }

  get contenido() {
    return this.comentarioartForm.get('contenido');
  }

  get id_articulo() {
    return this.comentarioartForm.get('id_articulo');
  }

  get id_usuario() {
    return this.comentarioartForm.get('id_usuario');
  }

  onSubmit(): void {
    if (this.comentarioartForm.invalid) {
      this.snackBar.open('Por favor, complete todos los campos correctamente', 'Cerrar', { duration: 4000 });
      return;
    }

    this.submitting.set(true);

    const idArticulo = Number(this.comentarioartForm.value.id_articulo);
    const idUsuario = Number(this.comentarioartForm.value.id_usuario);

    const comentarioData: any = {
      contenido: this.comentarioartForm.value.contenido,
      articulo: { id: idArticulo },
      usuario: { id: idUsuario },
    };

    if (this.mode === 'edit' && this.comentarioart?.id) {
      comentarioData.id = this.comentarioart.id;
      this.oComentarioartService.update(comentarioData).subscribe({
        next: () => {
          this.snackBar.open('Comentario actualizado exitosamente', 'Cerrar', { duration: 4000 });
          this.submitting.set(false);
          this.formSuccess.emit();
        },
        error: (err: HttpErrorResponse) => {
          this.error.set('Error actualizando el comentario');
          this.snackBar.open('Error actualizando el comentario', 'Cerrar', { duration: 4000 });
          console.error(err);
          this.submitting.set(false);
        },
      });
    } else {
      this.oComentarioartService.create(comentarioData).subscribe({
        next: () => {
          this.snackBar.open('Comentario creado exitosamente', 'Cerrar', { duration: 4000 });
          this.submitting.set(false);
          this.formSuccess.emit();
        },
        error: (err: HttpErrorResponse) => {
          this.error.set('Error creando el comentario');
          this.snackBar.open('Error creando el comentario', 'Cerrar', { duration: 4000 });
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
