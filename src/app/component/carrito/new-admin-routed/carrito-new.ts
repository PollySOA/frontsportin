import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CarritoFormAdminUnrouted } from '../form-unrouted/carrito-form';

@Component({
  selector: 'app-carrito-new-routed',
  standalone: true,
  imports: [CommonModule, CarritoFormAdminUnrouted],
  templateUrl: './carrito-new.html',
  styleUrl: './carrito-new.css',
})
export class CarritoNewAdminRouted {
  private router = inject(Router);

  onFormSuccess(): void {
    this.router.navigate(['/carrito']);
  }

  onFormCancel(): void {
    this.router.navigate(['/carrito']);
  }
}
