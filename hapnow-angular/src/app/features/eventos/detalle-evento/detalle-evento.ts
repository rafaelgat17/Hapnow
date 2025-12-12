import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EventoService } from '../../../core/services/evento.service';
import { Evento } from '../../../shared/models/evento.model';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-detalle-evento',
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './detalle-evento.html',
  styleUrl: './detalle-evento.scss',
})
export class DetalleEventoComponent implements OnInit {
  
  private route = inject(ActivatedRoute);
  private eventoService = inject(EventoService);

  evento: Evento | null = null;
  cargando = true;


  async ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.evento = await this.eventoService.obtenerEventoPorId(id);
    this.cargando = false;
  }
}
