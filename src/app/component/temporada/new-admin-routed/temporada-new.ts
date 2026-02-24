import { Component } from '@angular/core';
import { TemporadaFormAdminUnrouted } from '../form-admin-unrouted/temporada-form-admin-unrouted';

@Component({
  selector: 'app-temporada-new',
  standalone: true,
  imports: [TemporadaFormAdminUnrouted],
templateUrl: './temporada-new.html',
styleUrl: './temporada-new.css',
})
export class TemporadaNewAdminRouted {
}