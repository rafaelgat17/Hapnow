export interface Reporte {
    id?: string;
    usuarioReportadorId: string;
    usuarioReportadorNombre: string;
    usuarioReportadoId: string;
    usuarioReportadoNombre: string;
    tipoContenido: 'mensaje' | 'image' | 'video';
    contenidoId: string;
    eventoId: string;
    textoContenido?: string;
    fechaReporte: any;
    estado: 'pendiente' | 'revisado';
}