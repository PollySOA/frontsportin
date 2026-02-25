import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CarritoService } from '../../../service/carrito';
import { ICarrito } from '../../../model/carrito';
import { CarritoFormAdminUnrouted } from '../form-unrouted/carrito-form';

@Component({
  selector: 'app-carrito-edit-admin-routed',
  standalone: true,
  imports: [CommonModule, CarritoFormAdminUnrouted],
  templateUrl: './carrito-edit.html',
  styleUrl: './carrito-edit.css',
})
export class CarritoEditAdminRouted implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private oCarritoService = inject(CarritoService);
  private snackBar = inject(MatSnackBar);

  carrito = signal<ICarrito | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam || idParam === '0') {
      this.error.set('ID de carrito no válido');
      this.loading.set(false);
      return;
    }

    const id = Number(idParam);

    if (isNaN(id)) {
      this.error.set('ID no válido');
      this.loading.set(false);
      return;
    }

    this.loadCarrito(id);
  }

  private loadCarrito(id: number): void {
    this.oCarritoService.get(id).subscribe({
      next: (carrito: ICarrito) => {
        this.carrito.set(carrito);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error cargando el carrito');
        this.snackBar.open('Error cargando el carrito', 'Cerrar', { duration: 4000 });
        console.error(err);
        this.loading.set(false);
      },
    });
  }

  onFormSuccess(): void {
    this.router.navigate(['/carrito']);
  }

  onFormCancel(): void {
    this.router.navigate(['/carrito']);
  }
}
