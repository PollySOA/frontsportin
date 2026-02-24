import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TemporadaFormAdminUnrouted } from '../form-admin-unrouted/temporada-form-admin-unrouted';

@Component({
  selector: 'app-temporada-edit',
  standalone: true,
  imports: [TemporadaFormAdminUnrouted],
  templateUrl: './temporada-edit.html',
  styleUrl: './temporada-edit.css',
})
export class TemporadaEditAdminRouted implements OnInit {
  id = signal<number>(0);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id.set(+idParam);
    }
  }
}
