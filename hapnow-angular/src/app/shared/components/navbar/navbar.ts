import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class NavbarComponent {

  mostrarNotificaciones: boolean = false;
  mostrarPerfil: boolean = false;
  terminoBusqueda: string = '';

  activarNotificaciones(): void {
    this.mostrarNotificaciones = !this.mostrarNotificaciones; // esta a true

    if (this.mostrarNotificaciones) {
      this.mostrarPerfil = false; // se desactiva lo otro
    }
  }

  activarPerfil(): void {
    this.mostrarPerfil = !this.mostrarPerfil; // esta a true

    if (this.mostrarPerfil) {
      this.mostrarNotificaciones = false; // se desactiva lo otro
    }
  }

  buscar(): void {
    console.log('Buscando:', this.terminoBusqueda);
  }

  cerrarDropdowns(): void {
    this.mostrarNotificaciones = false;
    this.mostrarPerfil = false;
  }
}


