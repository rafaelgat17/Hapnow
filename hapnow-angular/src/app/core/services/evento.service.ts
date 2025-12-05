import { Inject, Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, query, where, orderBy } from '@angular/fire/firestore';
// estas son las funciones para interactuar con los datos
import { AuthService } from './auth.service';
import { Evento, CrearEventoData } from '../../shared/models/evento.model';

@Injectable({
  providedIn: 'root'
})


export class EventoService {

  private firestore = inject(Firestore);
  // esto establece la conexion con la bbdd

  private authService = inject(AuthService);
  // da acceso a la informacion del usuario actual

  private eventosCollection = collection(this.firestore, 'eventos');
  // PREGUNTAR que explique mejor esto

  async crearEvento(datos: CrearEventoData): Promise<void> {
    // datos ahora recoge los campos de CrearEventoData de evento.model.ts
    // ESTA FUNCION SE EJECUTA CUANDO EL USUARIO HACER GUARDAR EN EL FORMULARIO DE CREACION DE EVENTO

    try {
      const usuario = this.authService.usuarioActual();

      if (!usuario) {
      throw new Error ('Necesitas estas logeado para crear un evento');
      }

      // si el usuario es null (la signal de usuarioActual en auth.service es o Usuario o null) no puede crear el evento

      const nuevoEvento: Omit<Evento, 'id'> = {

        // se omite el campo id del objeto evento puesto que el usuario no es el que lo pone si no el propio firebase

        titulo: datos.titulo,
        descripcion: datos.descripcion,
        categoria: datos.categoria as any,

        // as any es una forma de decir que los campos de categoria pese a ser tipo string (donde puede ir cualquier cosa escrita) pero promete que los datos vendran de una fuente controlada como un dropdown

        ubicacion: {
          ciudad: datos.ciudad,
          direccion: datos.direccion,
        },
        fecha: datos.fecha,
        hora: datos.hora,
        maxParticipantes: datos.maxParticipantes,

        // aqui van los datos del sistema, los no introducidos

        // participantes: [usuario.uid], // este campo no esta en evento.model.ts, pero es necesario, ya que indirectamente el primer miembro del evento es el propio creador
        
        creadorId: usuario.uid,
        creadorNombre: usuario.nombre,
        estado: 'activo',
        fechaCreacion: new Date()

      
      };

      // con addDoc que es una funcion de firebase, logra guardar el registro del evento en la coleccion que se creo antes.
      await addDoc(this.eventosCollection, nuevoEvento);

    } catch (error) {
      console.error('No se ha podido crear el evento');
      throw error;
    }

    
  }

  async obtenerEventos(ciudad?: string): Promise<Evento[]> {
    // esta funcion trae los eventos de la firestore
    try {

      let q = query(this.eventosCollection, where('estado', '==', 'activo'));

      // eventosCollection es donde se guardan los eventos guardados los cuales tienen estado activo, indica que va a hacer una consulta

      if (ciudad) {
        q = query(q, where('ubicacion.ciudad', "==", ciudad));
      }

      // si el usuario especificó una ciudad, se le añade como requisito extra a la consulta de eventos

      q = query(q, orderBy('fechaCreacion', 'desc'));

      const snapshot = await getDocs(q);

      // ejecuta la consulta en firestore y guarda el resultado (getDocs) en snapshot

      const eventos: Evento[] = snapshot.docs.map(doc => {
        // Mapear los documentos del snapshot a objetos Evento

        const data = doc.data();


        // Conversión de fechas de Timestamp a Date
        if (data['fecha'] && typeof data['fecha'].toDate === 'function') {
          data['fecha'] = data['fecha'].toDate();
        }
        if (data['fechaCreacion'] && typeof data['fechaCreacion'].toDate === 'function') {
          data['fechaCreacion'] = data['fechaCreacion'].toDate();
        }

        return {
          id: doc.id,
          ...data
        } as Evento;
      });

      return eventos;

    } catch (error) {
      console.error('Hay un error al obtener el evneto', error);
      return [];
      
    }
  }

}