import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { EventoService } from '../../core/services/evento.service';
import { Evento } from '../../shared/models/evento.model';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { FooterComponent } from '../../shared/components/footer/footer';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent {
  authService = inject(AuthService);
  eventoService = inject(EventoService);

  eventos: Evento[] = [];
  cargandoEventos = true;

  async ngOnInit() {
    await this.cargarEventos();
  }

  async cargarEventos() {
    this.cargandoEventos = true;
    this.eventos = await this.eventoService.obtenerEventos();
    this.cargandoEventos = false;
  }

  get usuario() {
    return this.authService.usuarioActual();
  }

}