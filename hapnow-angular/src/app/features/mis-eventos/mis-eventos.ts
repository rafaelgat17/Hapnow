import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventoService } from '../../core/services/evento.service';
import { AuthService } from '../../core/services/auth.service';
import { Evento } from '../../shared/models/evento.model';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-mis-eventos',
  imports: [CommonModule, NavbarComponent, RouterLink],
  templateUrl: './mis-eventos.html',
  styleUrl: './mis-eventos.scss',
})

export class MisEventosComponent {
  private eventoService = inject(EventoService);
  private authService = inject(AuthService);
  private router = inject(Router);

  eventosCreados: Evento[] = [];
  eventosAsistidos: Evento[] = [];
  cargando = true;

  esEventoPasado(fecha: any, hora: string): boolean {
    return this.eventoService.esEventoPasado(fecha, hora);
  }

  // CHECKED
  async ngOnInit() {
    const usuario = this.authService.usuarioActual();
    // se coge el usuario actual
    if (usuario) {

      const creados = await this.eventoService.obtenerMisEventosCreados(usuario.uid);
      const asistidos = await this.eventoService.obtenerEventosDondeAsisto(usuario.uid);

      this.eventosCreados = creados;
      // se filtra para los eventos que he creado (que uno se une una vez creados) no aparezcan en asistidos
      const listaFiltrada: Evento[] = [];
      
      for (let i = 0; i < asistidos.length; i++) {
        const evento = asistidos[i];

        if (evento.creadorId !== usuario.uid) {
          listaFiltrada.push(evento);
        }
      }

      this.eventosAsistidos = listaFiltrada;
    }
    this.cargando = false;
  }

  // CHECKED
  // se le pasa por parametro el edit y el id del evento en cuestion
  abrirEdicion(evento: Evento) {
    this.router.navigate(['/crear-evento'], {queryParams: {edit: evento.id}});
  }
}
