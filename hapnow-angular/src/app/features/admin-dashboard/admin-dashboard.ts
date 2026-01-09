import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModeracionService } from '../../core/services/moderacion.service';
import { Reporte } from '../../shared/models/reporte.model';
import { NavbarComponent } from '../../shared/components/navbar/navbar';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, NavbarComponent],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboardComponent {
  private moderacionService = inject(ModeracionService);

  totalUsuarios: number = 0;
  totalEventos: number = 0;
  reportesPendientesNumero: number = 0;

  reportes: Reporte[] = [];

  // CHECKED
  ngOnInit() {
    this.cargarDatos();
  }

  // CHECKED
  async cargarDatos() {
    // se traen las stats (para los numeros)
    this.totalUsuarios = await this.moderacionService.obtenerTotalUsuarios();
    this.totalEventos = await this.moderacionService.obtenerTotalEventos();
    this.reportesPendientesNumero = await this.moderacionService.obtenerTodosReportesPendientes();
    // se traen los reportes
    this.reportes = await this.moderacionService.obtenerReportesPendientes();
  }

  // CHECKED
  // para eliminar un contenido del evento
  async eliminarContenido(reporte: Reporte) {
    if (confirm('¿Seguro que quieres eliminar este contenido?')) {
      await this.moderacionService.borrarContenidoReportado(reporte);
      alert('Contenido eliminado correctamente');
      this.cargarDatos();
    }
  }

  // CHECKED
  async suspenderUsuario(uid: string) {
    // uid porque se le pasa el usuarioReportadoId
    if (confirm('¿Seguro que quiere suspender a este usuario?')) {
      await this.moderacionService.suspenderUsuario(uid);
      alert('Usuario suspendido');
      this.cargarDatos();
    }
  }

  // CHECKED
  async ignorarReporte(id: string) {
    // se le pasa el doc.id que generamos a la hora de obtenerReportesPendientes
    await this.moderacionService.ignorarReporte(id);
    this.cargarDatos();
    // volvemos a cargar los datos para actualizarlo
  }
}

