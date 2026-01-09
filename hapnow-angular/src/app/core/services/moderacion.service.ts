import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, Timestamp, getCountFromServer, arrayRemove, getDoc } from '@angular/fire/firestore';
import { Reporte } from '../../shared/models/reporte.model';
import { get } from '@angular/fire/database';

@Injectable({
    providedIn: 'root'
})
export class ModeracionService {
    private firestore = inject(Firestore);

    // CHECKED
    // Partial<Reporte> significa que a esta funcion se le pasa un objeto
    // tipo Reporte, pero sin algunos campos, los cuales se especifican a posteriori
    async crearReporte(reporte: Partial<Reporte>) {
        const referencia = collection(this.firestore, 'reportes');
        // se hace referencia a la coleccion reportes de firestore

        // se hace un addDoc donde se le pasa el reporte enviado mas
        // los campos de estado 'pendiente', ya que todos al principio saldran
        // asi, esperan al admin que haga algo
        // se le pasa tambien el timestamp propio para firebase
        return addDoc(referencia, {
            ...reporte,
            estado: 'pendiente',
            fechaReporte: Timestamp.now()
        });
    }

    // CHECKED
    // para obtener estadisticas (los numeros de cada cosa)
    // async obtenerEstadisticas() {
    //     const usuariosReferencia = collection(this.firestore, 'usuarios');
    //     // se obtienen todos los datos de usuarios
    //     const eventosReferencia = collection(this.firestore, 'eventos');
    //     // lo mismo de eventos
    //     const reportesReferencia = collection(this.firestore, 'reportes');
    //     // lo mismo de reportes

    //     // hace todas las peticiones a la vez
    //     const [usuariosRespuesta, eventosRespuesta, reportesRespuesta] = await Promise.all([
    //         // getCountFromServer devuelve el numero de documentos
    //         // que hay en cada coleccion de forma eficiente, ya que
    //         // si se hace con getDocs.length() habria que descargar todos
    //         // los documentos
    //         getCountFromServer(usuariosReferencia),
    //         getCountFromServer(eventosReferencia),
    //         getCountFromServer(query(reportesReferencia, where('estado', '==', 'pendiente')))
    //     ]);

    //     return {
    //         totalUsuarios: usuariosRespuesta.data().count,
    //         totalEventos: eventosRespuesta.data().count,
    //         reportesPendientes: reportesRespuesta.data().count
    //     };
    //     // despues de los dos puntos es como si viniese el numero
    // }

    async obtenerTotalUsuarios(): Promise<number> {
        const referencia = collection(this.firestore, 'usuarios');
        const respuesta = await getCountFromServer(referencia);
        return respuesta.data().count;
    }

    async obtenerTotalEventos(): Promise<number> {
        const referencia = collection(this.firestore, 'eventos');
        const respuesta = await getCountFromServer(referencia);
        return respuesta.data().count;
    }

    async obtenerTodosReportesPendientes(): Promise<number> {
        const referencia = collection(this.firestore, 'reportes');
        const respuesta = await getCountFromServer(query(referencia, where('estado', '==', 'pendiente')));
        return respuesta.data().count;
    }


    // CHECKED
    // esta nos da el contenido concreto de los reportees
    async obtenerReportesPendientes(): Promise<Reporte[]> {
        const referencia = collection(this.firestore, 'reportes');
        const consulta = query(referencia, where('estado', '==', 'pendiente'));
        // se hace lo mismo que en la otra funcion
        // se coge los reportes y con una consulta se filtran
        // por los que estan en estado pendiente
        const respuesta = await getDocs(consulta);
        // se hace la consulta

        // lista donde se guardaran todos los reportes temporalmente
        const listaReportes: Reporte[] = [];
        
        // por cada reporte...
        for (const doc of respuesta.docs) {
            const datosCuerpo = doc.data();
            // en esta variable se guarda todo el contenido de cada reporte

            const reporteCompleto: Reporte = {
                id: doc.id,
                // este id sera el que se usa para ignorar o borrar un reporte
                // es el mismo id de addDoc, pero ahora puesto como campo
                usuarioReportadorId: datosCuerpo['usuarioReportadorId'],
                usuarioReportadorNombre: datosCuerpo['usuarioReportadorNombre'],
                usuarioReportadoId: datosCuerpo['usuarioReportadoId'],
                usuarioReportadoNombre: datosCuerpo['usuarioReportadoNombre'],
                tipoContenido: datosCuerpo['tipoContenido'],
                contenidoId: datosCuerpo['contenidoId'],
                eventoId: datosCuerpo['eventoId'],
                textoContenido: datosCuerpo['textoContenido'],
                fechaReporte: datosCuerpo['fechaReporte'],
                estado: datosCuerpo['estado'],
            }

            listaReportes.push(reporteCompleto)

        }

        return listaReportes;
    }

    // CHECKED
    // funcion para ignorar reporte
    async ignorarReporte(reporteId: string) {
        const referencia = doc(this.firestore, 'reportes', reporteId);
        // se obtiene ese reporte concreto
        return updateDoc(referencia, { estado: 'revisado' });
        // se camnbia el estado a revisado y por lo tanto se quita de la lista
        // de "pendiente"
    }

    // CHECKED
    async suspenderUsuario(uid: string) {
        const userRef = doc(this.firestore, 'usuarios', uid);
        // se accede al id del usuario reportado
        return updateDoc(userRef, { suspendido: true });
        // se cambia su estado suspendido a true para que no pueda logearse ams
    }



    // CHECKED
    async borrarContenidoReportado(reporte: Reporte) {
        if (reporte.tipoContenido === 'mensaje') {
        // si el contenido es un mensaje...
        const mensajeReferencia = doc(this.firestore, `eventos/${reporte.eventoId}/mensajes/${reporte.contenidoId}`);
        // se coge el documento del evento
        // CON EL ID DEL EVENTO CONCRETO
        // se va concretamente a mensajes
        // Y COGE EL MENSAJE QUE TIENE ESE CONTENIDO CONCRETO
        await deleteDoc(mensajeReferencia);
        // y se borra el documento
        } else {
        // si hay que borrar multimedia...
        const eventoReferencia = doc(this.firestore, 'eventos', reporte.eventoId);
        const eventoRespuesta = await getDoc(eventoReferencia);
        // se coge el evento completo concreto donde esta ese reporte
        
        if (eventoRespuesta.exists()) {
            // si existe el evento (a lo mejor el creador borro el evento)
            const multimedia = eventoRespuesta.data()['multimedia'] || [];
            // se rellena con el campo multimedia si es que este evento lo tiene, si no es un array vacio
            const itemABorrar = multimedia.find((multimedia: any) => multimedia.url === reporte.contenidoId);
            // anteriormente, en reportarMultimedia, se asigno el id a la url, por lo tanto
            // buscamos si la url del reporte (url porque en el modelo del evento sale asi)
            // es igual a contenidoId, que fue como lo asignamos al mandar el reporte

            if (itemABorrar) {
            await updateDoc(eventoReferencia, {
                multimedia: arrayRemove(itemABorrar)
            });
            // se borra el campo url (contenidoId) de la estructura del evento
            }
        }
        }
        // una vez borrado el contenido, lo marcamos como revisado
        return this.ignorarReporte(reporte.id!);
    }
}