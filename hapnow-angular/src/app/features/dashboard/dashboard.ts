import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent {
  authService = inject(AuthService);
  router = inject(Router);

  get usuario() {
    return this.authService.usuarioActual();
  }

  cerrarSesion() {
    this.authService.logout();
  }
}