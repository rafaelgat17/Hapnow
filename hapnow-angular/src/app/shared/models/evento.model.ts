export interface Evento {
  id?: string; // id opcional ya que a la hora de crear un evento no se añade id, pero al añadirlo a firebase si se agrega
  titulo: string;
  descripcion: string;
  categoria: 'deportes' | 'ocio' | 'estudio' | 'cultural' | 'profesional';
  ubicacion: {
    ciudad: string;
    direccion: string;
  };
  fecha: Date;
  hora: string;
  maxParticipantes?: number;

  // estos campos son datos del sistema, no se introducen por parte del usuario
  creadorId: string;
  creadorNombre: string;
  estado: 'activo' | 'cancelado' | 'finalizado';
  fechaCreacion: Date;
}

export interface CrearEventoData {
  titulo: string;
  descripcion: string;
  categoria: string;
  ciudad: string;
  direccion: string;
  fecha: Date;
  hora: string;
  maxParticipantes?: number;
}