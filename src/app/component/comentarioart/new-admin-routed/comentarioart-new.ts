import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ComentarioartFormAdminUnrouted } from '../form-unrouted/comentarioart-form';

@Component({
  selector: 'app-comentarioart-new-routed',
  standalone: true,
  imports: [CommonModule, ComentarioartFormAdminUnrouted],
  templateUrl: './comentarioart-new.html',
  styleUrl: './comentarioart-new.css',
})
export class ComentarioartNewAdminRouted {
  private router = inject(Router);

  onFormSuccess(): void {
    this.router.navigate(['/comentarioart']);
  }

  onFormCancel(): void {
    this.router.navigate(['/comentarioart']);
  }
}
