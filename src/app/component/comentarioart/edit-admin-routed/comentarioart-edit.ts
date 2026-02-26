import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ComentarioartService } from '../../../service/comentarioart';
import { IComentarioart } from '../../../model/comentarioart';
import { ComentarioartFormAdminUnrouted } from '../form-unrouted/comentarioart-form';

@Component({
  selector: 'app-comentarioart-edit-admin-routed',
  imports: [CommonModule, ComentarioartFormAdminUnrouted],
  templateUrl: './comentarioart-edit.html',
  styleUrl: './comentarioart-edit.css',
})
export class ComentarioartEditAdminRouted implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private comentarioartService = inject(ComentarioartService);
  private snackBar = inject(MatSnackBar);

  id_comentarioart = signal<number>(0);
  loading = signal(true);
  error = signal<string | null>(null);
  comentario = signal<IComentarioart | null>(null);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam || idParam === '0') {
      this.error.set('ID de comentario no válido');
      this.loading.set(false);
      return;
    }

    const id = Number(idParam);
    if (isNaN(id)) {
      this.error.set('ID no válido');
      this.loading.set(false);
      return;
    }

    this.id_comentarioart.set(id);
    this.loadComentario();
  }

  private loadComentario(): void {
    this.comentarioartService.get(this.id_comentarioart()).subscribe({
      next: (c: IComentarioart) => {
        this.comentario.set(c);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error cargando el comentario');
        this.snackBar.open('Error cargando el comentario', 'Cerrar', { duration: 4000 });
        console.error(err);
        this.loading.set(false);
      },
    });
  }

  onFormSuccess(): void {
    this.router.navigate(['/comentarioart']);
  }

  onFormCancel(): void {
    this.router.navigate(['/comentarioart']);
  }
}
