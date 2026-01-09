import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class NavbarComponent {
  private router = inject(Router);
  public authService = inject(AuthService);

  usuario = this.authService.usuarioActual;

  mostrarPerfil: boolean = false;
  terminoBusqueda: string = '';


  activarPerfil(): void {
    this.mostrarPerfil = !this.mostrarPerfil;
  }

  buscar(): void {
    const ciudad = this.terminoBusqueda.trim();
    // se coge lo que el usuario a metido en el input y se quita
    // los espacios de los lados si es que los tiene

    if (ciudad) {
      this.router.navigate(['/dashboard'], {
        queryParams: { ciudad: ciudad }
        // si la ciudad que ha introducido existe como ubicacion real
        // de alguno o algunos de los eventos, se pasara como parametro
        // en la url, esta posteriormente ira directamente a ObtenerEvento
        // de evento.service, que sera la que filtre por ciudad los 
        // eventos que salgan en el dashboard
      });
    } else {
      this.router.navigate(['/dashboard']); 
    }

    this.terminoBusqueda = '';
    this.cerrarDropdowns();
  }


  cerrarDropdowns(): void {
    this.mostrarPerfil = false;
  }

  logoutNavbar() {
    this.authService.logout();
  }
}