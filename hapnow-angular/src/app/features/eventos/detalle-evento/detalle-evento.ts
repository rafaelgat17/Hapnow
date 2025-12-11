import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { EventoService } from '../../../core/services/evento.service';
import { Evento } from '../../../shared/models/evento.model';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-detalle-evento',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './detalle-evento.html',
  styleUrl: './detalle-evento.scss',
})
export class DetalleEventoComponent {
  
  private route = inject(ActivatedRoute);
  private eventoService = inject(EventoService);

  evento: Evento | null = null;
  loading = true;

  constructor() {
    this.obtenerDetalleEvento();
  }

  async obtenerDetalleEvento(): Promise<void> {
    this.route.paramMap.subscribe(async (params) => {
      const id = params.get('id');
      if (id) {
        this.evento = await this.eventoService.obtenerEventoPorId(id);
      }
      this.loading = false;
    })
  }
}
