import { Inject, Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, getDoc, addDoc, getDocs, deleteDoc, updateDoc, query, where, orderBy, Timestamp, arrayUnion, arrayRemove, increment, onSnapshot } from '@angular/fire/firestore';
// estas son las funciones para interactuar con los datos
import { getStorage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { AuthService } from './auth.service';
import { Evento, CrearEventoData } from '../../shared/models/evento.model';


@Injectable({
  providedIn: 'root'
})


export class EventoService {

  constructor() {
    const storage = getStorage();
    storage.app.options.storageBucket = "hapnow-7bfd8-multimedia";
  }

  private firestore = inject(Firestore);
  // esto establece la conexion con la bbdd

  private authService = inject(AuthService);
  // da acceso a la informacion del usuario actual

  private eventosCollection = collection(this.firestore, 'eventos');
  // coge la carpeta especifica. en este caso la coleccion eventos


  // CHECKED
  async crearEvento(datos: CrearEventoData): Promise<void> {
    // datos ahora recoge los campos de CrearEventoData de evento.model.ts
    // ESTA FUNCION SE EJECUTA CUANDO EL USUARIO HACER GUARDAR EN EL FORMULARIO DE CREACION DE EVENTO

    try {
      const usuario = this.authService.usuarioActual();

      // capa de seguridad por si acaso el usuario no esta logeado (imposible)
      if (!usuario) {
      throw new Error ('Necesitas estas logeado para crear un evento');
      }
      // si el usuario es null (la signal de usuarioActual en auth.service es o Usuario o null) no puede crear el evento

      const nuevoEvento: any = {

        // se omite el campo id del objeto evento puesto que el usuario no es el que lo pone si no el propio firebase
        // gracias a addDoc

        titulo: datos.titulo,
        descripcion: datos.descripcion,
        categoria: datos.categoria as any,

        // as any es una forma de decir que los campos de categoria pese a ser tipo string (donde puede ir cualquier 
        // cosa escrita) pero promete que los datos vendran de una fuente controlada como un dropdown

        ubicacion: {
          ciudad: datos.ciudad,
          direccion: datos.direccion,
        },
        fecha: Timestamp.fromDate(datos.fecha),
        hora: datos.hora,
        participantes: [usuario.uid],
        maxParticipantes: datos.maxParticipantes,

        // aqui van los datos del sistema, los no introducidos 
        // este campo no esta en evento.model.ts, pero es necesario, ya que indirectamente 
        // el primer miembro del evento es el propio creador
        
        creadorId: usuario.uid,
        creadorNombre: usuario.nombre,
        estado: 'activo',
        fechaCreacion: Timestamp.fromDate(new Date())

        // se le pone el tipo de fecha para firebase

      
      };

      // con addDoc que es una funcion de firebase, logra guardar el registro 
      // del evento en la coleccion que se creo antes
      await addDoc(this.eventosCollection, nuevoEvento);

    } catch (error) {
      console.error('No se ha podido crear el evento');
      throw error;
    }
  }






  // CHECKED
  // devuelve siempre un objeto tipo evento o un error
  async obtenerEventos(ciudad?: string): Promise<Evento[]> {
    // esta funcion trae los eventos de la firestore
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      // desde el principio del dia actual
      
      // transforma hoy, en un objeto tipo timestamp para firebase
      const limiteFecha = Timestamp.fromDate(hoy);

      let consulta = query(
        this.eventosCollection,
        where('estado', '==', 'activo'),
        where('fecha', '>=', limiteFecha),
        // limite fecha es la fecha actual a las 00:00:00:000
        orderBy('fecha', 'asc')
      );
      // consulta de eventos que cumplen con que todavia no han empezado
      // son superiores a la fecha actual
      // y los coloca de fecha ascendente

      if (ciudad) {
        // ciudad es un campo opcional que nos llega desde el buscador del navbar
        // si este tiene un dato, tendra que filtrar los eventos que salgan
        consulta = query(consulta, where('ubicacion.ciudad', '==', ciudad));
      }

      const resultadoConsulta = await getDocs(consulta);
      // se ejecuta la peticion y esperamos a que firebase nos de los datos

      return resultadoConsulta.docs.map(doc => this.convertirFecha(doc));
      // creamos la lista de eventos que cumplen con la consulta y ademas
      // cambiamos el Timestamp de firebase a toDate
      // ya que anterioremente para la consulta la pasamos a Timestamp que solo lo entiende firebase
    } catch (error) {
      console.error(error);
      return [];
      
    }
  }






// CHECKED
private convertirFecha(doc: any): Evento {
  const data = doc.data();
  return {
    ...data,
    id: doc.id, // Inyectamos el ID manualmente que es el que pondra Fireabse fuera del objetco
    fecha: data['fecha']?.toDate ? data['fecha'].toDate() : data['fecha']
    // por norma natural, cuando se traiga todos los eventos de firebase
    // el campo fecha sera tipo timestamp, y habria que convertirlo a toDate
    // y lo bueno de que sea timestamp, es que trae implantada de forma natural este metodo
    // aunque no se ejecute, por lo tanto, lo que hacemos seria preguntar si el campo tiene 
    // el metodo toDate, si es asi, lo ejecutamos porque es timestamp, si no, es porque es una fecha normal
    // normalmente siempre se ejecutara lo primero
  } as Evento;
}







// CHECKED
// esta funcion sirve para devolverle a detalle-evento, el evento concreto completo
// con la id que recibimos por aqui
// ESTA FUNCION ES VITAL EN EDITAR EVENTO
async obtenerEventoPorId(id: string): Promise<Evento | null> {
  // promete devolver un objeto tipo evento completo
  const referencia = doc(this.firestore, 'eventos', id);
  // coge el id y busca el evento en la coleccion
  const resultado = await getDoc(referencia);
  // una vez comunicado la consulta se coge el documento
  return resultado.exists() ? this.convertirFecha(resultado) : null;
  // si existe, cambia el tipo date a timestamp y lo devuelve o es null
}





  // CHECKED
//   async obtenerEventosPorCiudad(ciudad: string): Promise<Evento[]> {
//   try {
//     const eventosRef = collection(this.firestore, 'eventos');
    
//     const consulta = query(
//       eventosRef,
//       where('estado', '==', 'activo'),
//       where('ubicacion.ciudad', '==', ciudad),
//       orderBy('fechaCreacion', 'desc')
//     );
//     // Esta query extraeria de la coleccion eventos todos aquellos
//     // cuyos campos ubicacion.ciudad coincidan exactamente con lo que 
//     // a puesto el usuario en el buscador del navbar

//     const snapshot = await getDocs(consulta);

//     // hace la busqueda
    
//     return snapshot.docs.map(doc => this.convertirFecha({
//       id: doc.id,
//       // ponemos el ID primero
//       ...doc.data()
//       // y mantenemos el resto de campos del evento
//       // nos ahorramos de ponerlos uno a uno
//       // finalmente devuelve cada vez que hace for, cada
//       // evento que cumple con la consulta de la snapshot,
//       // la cual se le añade un id a parte gracias al map
//       // que edita, no filtra
//     } as Evento));
//   } catch (error) {
//     console.error('Error al buscar eventos por ciudad:', error);
//     return [];
//   }
// }


// CHECKED
// Promise <void> aclara que es una funcion que no devuelve nada
// solo puede terminar bien, o en error, es clave para las 
// consultas de async await. Solo realizan una accion
async cancelarEvento(eventoId: string): Promise<void> {
  try {
    const referencia = doc(this.firestore, 'eventos', eventoId);
    // se hace referencia al evento concreto de la coleccion que se paso al dar click al boton

    await updateDoc(referencia, {
      estado: 'cancelado'
    });
    // se cambia su estado a cancelado
    
    console.log("EVENTO CANCELADO")
  } catch (error) {
    throw error;
  }
}





// CHECKED
// funcion para unirse al evento
async unirseAEvento(eventoId: string, usuarioActualId: string): Promise<void> {
  try {
    const referencia = doc(this.firestore, 'eventos', eventoId);
    // localizar el evento concreto gracias a doc
    await updateDoc(referencia, {participantes: arrayUnion(usuarioActualId)
    // gracias a updateDoc, se selecciona el docRef (el evento concreto)
    // y posterioremnte con arrayUnion se añade el usuarioId del usuarioActual
    // al campo participantes del evento concreto 
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}



// CHECKED
// funcion para desinscribirse de un evento
// promete no devolver nada, solo realiza una actualiza la bbdd
async abandonarEvento(eventoId: string, usuarioActualId: string): Promise<void> {
  try {
    const referencia = doc(this.firestore, 'eventos', eventoId);
    // apunta a la coleccion eventos y conretamente al evento
    await updateDoc(referencia, {participantes: arrayRemove(usuarioActualId)
      // se hace lo contrario (quitar ese usuarioid del array participantes) gracias a arrayRemove
    }); 
  } catch (error) {
    console.error(error);
    throw error;
  }
}











// private convertirFecha(doc: any): Evento {
//   const data = doc.data();
//   return {
//     ...data,
//     id: doc.id,
//     fecha: data['fecha']?.toDate ? data['fecha'].toDate() : data['fecha'],
//     fechaCreacion: data['fechaCreacion']?.toDate ? data['fechaCreacion'].toDate() : data['fechaCreacion']
//   } as Evento;
// }



// CHECKED
// devuelve un objeto tipo evento y se le pasa el id del usuario actual
async obtenerMisEventosCreados(usuarioId: string): Promise<Evento[]> {
  const consulta = query(this.eventosCollection, where('creadorId', '==', usuarioId), orderBy('fechaCreacion', 'desc'));
  // se hace una consulta donde se requieren todos los eventos cuyo creadorId sea igual que el id que se le ha pasado
  // como parametro
  const respuesta = await getDocs(consulta);
  // se realiza la consulta
  return respuesta.docs.map(doc => this.convertirFecha(doc));
  // devuvelve todo el evento pero con la fecha puesta tipo Date
}

// CHECKED
// devuelve un objeto tipo evento y se le pasa el id del usuario actual
async obtenerEventosDondeAsisto(usuarioId: string): Promise<Evento[]> {
  const consulta = query(this.eventosCollection, where('participantes', 'array-contains', usuarioId), orderBy('fechaCreacion', 'desc'));
  // se hace una consulta donde se requieren aquellos eventos donde en su array participantes
  // contenga el id del usuario actual, el del parametro, esto devolvera todos los eventos que 
  // haya creado tambien el usuario actual, pero es luego en el ngOnInit de mis-eventos
  // donde se filtra para que no salgan esos en esa seccion
  const respuesta = await getDocs(consulta);
  return respuesta.docs.map(doc => this.convertirFecha(doc));
}





// CHECKED
// se le pasa el id en edicion que se marco con el id que le mandaron desde obtenerEventoPorId
async actualizarEvento(id: string, datos: any): Promise<void> {
  const referencia = doc(this.firestore, 'eventos', id);
  // coge ese id y consigue los datos de ese evento
  const datosActualizados = {
    titulo: datos.titulo,
    descripcion: datos.descripcion,
    categoria: datos.categoria,
    fecha: Timestamp.fromDate(datos.fecha),
    hora: datos.hora,
    maxParticipantes: datos.maxParticipantes,
    // se convierte en timestamp
    ubicacion: {
      ciudad: datos.ciudad,
      direccion: datos.direccion
    }
    // se agrupan la ciudad y la direccion en ubicacion
    // para que entienda el modelo
  };
  return updateDoc(referencia, datosActualizados);
  // finalmeente se actualiza en la bbdd
}




// CHECKED
// esta funcion lograra que muestre si un evento ha finalizado y provacara cambios en el html
// de mis eventos y detalle evento
esEventoPasado(fecha: any, hora: string, estado?: string): boolean {
  // si el evento tiene el estado cancelado, automaticamente devuelve true
  if (estado === 'cancelado') {
    return true;
  }

  // el calculo del tiempo que debe devolver false para que sea valido
  const ahora = new Date();
  // el ahora literalmetne
  const fechaEvento = new Date(fecha);
  // fecha del evento
  const partesHora = hora.split(':');
  const horas = partesHora[0];
  const minutos = partesHora[1];

  const horasNumero = parseInt(horas);
  const minutosNumero = parseInt(minutos);

  fechaEvento.setHours(horasNumero);
  fechaEvento.setMinutes(minutosNumero);
  // se le ponen las horas parseadas a fecha evento

  return ahora > fechaEvento;
  // si ahora es mayor a fechaEvento, quiere decri que el evetno es pasado (true)
  // si el ahora es menor, el evento todavia no ha pasado
}





// CHECKED
async valorarEvento(eventoId: string, organizadorId: string, usuarioId: string, nota:number) {
  try {
    
    // llamamos a la referencia de las dos colecciones
    // una para el evento que votamos, y otro para la reputacion del usuario
    const referenciaEvento = doc(this.firestore, `eventos/${eventoId}`);
    const referenciaOrganizador = doc(this.firestore, `usuarios/${organizadorId}`);

    const respuesta = await getDoc(referenciaOrganizador);
    // se obtiene la ficha del organizador porque debemos tener la nota que tiene actualmente

    // verificacion de seguridad
    if (!respuesta.exists()) {
      console.error("El documento no existe en la ruta:", referenciaOrganizador.path);
      throw new Error('No se pudieron obtener los datos del organizador');
    }

    const datos = respuesta.data();
    // se extraen los datos de la imagen que nos ha devuelto firebase de la snapshot
    if (!datos) throw new Error(`No se pudieron obtener los datos del organizador`)

    // se cogelos valores de la media de reputacion del usuario
    // y la del total de valoraciones que ha tenido 
    const reputacionActual = datos['reputacion'] || 0;
    const totalVotosActual = datos['totalValoraciones'] || 0;

    // se suma 1 al total de valoraciones y se calcula la media para la reputacion sumandole la nota nueva que le llego
    const nuevaCantidad = totalVotosActual + 1;
    const nuevaReputacion = ((reputacionActual * totalVotosActual) + nota) / nuevaCantidad;

    // se actualiza el documento del evento guardando con arrayUnion el id del usuario que ha votado
    await updateDoc(referenciaEvento, {
      valoradoPor: arrayUnion(usuarioId)
    });

    // se actualiza el organizador con su nueva media de valoracion y el numero de valoraciones
    await updateDoc(referenciaOrganizador, {
      reputacion: nuevaReputacion,
      totalValoraciones: increment(1)
    });

    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
}











// MENSAJES

// CHECKED
// para enviar un mensaje
async enviarMensaje(eventoId: string, texto: string, usuario: any) {
  const referencia = collection(this.firestore, `eventos/${eventoId}/mensajes`);
  // se accede a los documentos de la subcoleccion de mensajes que se encuentra
  // a su ves en la coleccion eventos
  return addDoc(referencia, {
    texto: texto,
    usuarioId: usuario.uid,
    usuarioNombre: usuario.nombre,
    fecha: Timestamp.now()
    // la diferencia de addDoc y setDoc, es que con addDoc no hace falta
    // especificar un id nuevo, si no que lo genera firebase
  });
  // simplemetne se añade el nuevo registro con el mensaje nuevo y sus datos

  // cuando addDoc termina su trabajo en el servidor de firebase, el onSnapshot
  // que esta abierto y funcionando en cargarMensajes(), detecta que la 
  // coleccion a cambiado, se activa solo y actualiza la variable this.mensajes
}


// CHECKED
// para escuchar mensajes en tiempo real
// esta funcion devuelve una desconexion
obtenerMensajes(eventoId: string, callback: (mensajes: any[]) => void) {
  const referencia = collection(this.firestore, `eventos/${eventoId}/mensajes`);
  //se localiza la carpeta de donde vienen los mensajes del evento especifico
  const consulta = query(referencia, orderBy('fecha', 'asc'));
  // se hace una consulta, donde trae todos los mensajes de ese evento y los ordena

  // se activa el onSnapshot
  return onSnapshot(consulta, (respuesta) => {
    // cada vez que hay cambios en la firebase (en los mensajes), se transforma los documentos en objetos legibles
    // actualiza constantemente, lo unico que hace map es actualizar
    // constantemente el estado del chat y los mensajes

    // onSnapshot tiene implicitamente una funcion extra de cierre, de dejar de escuchar

    // cuando el toggle esta a true, se ejecuta cargarMensajes, esta funcion va al servicio, 
    // activa el onSnapshot, y guarda el resultado (por callback) en la variable "this.mensajes" de detalle-evento
    
    // al final del true:
    // this.mensajes = mensajes enviados por callback (mensajes con todos sus datos, actualizados gracias al onSnapshot, lo que se vera)
    // conexionChat = solo le llega la capacidad para cerrarse en caso de ejecutar la variable con parentesis

    // sin embargo, conexionChat solo la rellenamos por asi decirlo, en ningun momento la invocamos, solo la usamos para lo dicho

    // cuando esta a false el toggle, es entones que ejecutamos la variable suscripcionChat, como si 
    // fuese una funcion, lo cual la activa y provoca el segundo cometido que tiene onSnapshot, que 
    // es el cierre y dejar de mandar mensajes

    // Los parentesis solo se usan para cerrar, para abrir simplemente se le asigna un valor a la variable

    const mensajes = respuesta.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // doc.id es ese ID que addDoc creo automaticamente
    // Al meterlo dentro del objeto con la propiedad id:, 
    // lo estamos "atrapando" para usarlo en el frontend
    callback(mensajes);
    // se ejecuta la instruccion que dio el componente, manda todos los mensajes cargados a "mensajes"
  })
}





// CHECKED
// IMAGENES Y VIDEOS
async subirMultimedia(eventoId: string, archivo: File, usuarioId: string, usuarioNombre: string): Promise<void> {
  const cloudName = 'de4ngqlo4'; 
  // id de usuario de cloudinary
  const uploadPreset = 'multimedia'; 
  // uploadPreset es la regla de subida que configure

  const esVideo = archivo.type.startsWith('video');
  // empieza "video/mp4" por la palabra "video"? si, pues sera true
  const recurso = esVideo ? 'video' : 'image';
  // si el recurso es video pues es video, pero si no es imagen
  
  // cloudinary tiene una url distinta segun si es foto o video
  const urlCloudinary = `https://api.cloudinary.com/v1_1/${cloudName}/${recurso}/upload`;

  // se prepara el paquete (formData), porque necesitamos enviar en este
  // caso un archivo binario hay que mandarle instrucciones
  const formData = new FormData();
  formData.append('file', archivo);
  formData.append('upload_preset', uploadPreset);

  try {
    // se hace el envio (fetch)
    // se hace la peticion post a la nube de cloudinary
    const respuesta = await fetch(urlCloudinary, {
      method: 'POST',
      body: formData
    });
    
    // se guarda la respuesta en formato json
    const datos = await respuesta.json();

    if (datos.error) {
      throw new Error(`EL ARCHIVO ES DEMASIADO GRANDE: ${datos.error.message}`);
    }

    // dentro del paquete de datos que nos viene del fetch a cloudinary, existe la url
    // y la secure_url, la primera empieza por http:// y la otra por https://, la mejor opcion sera
    // esta ultima por si los navegadores no se atreven a cargarla por no ser "segura"
    const urlSegura = datos.secure_url;

    // guardamos en firestore, como solo queremos añadir, con arrayUnion en el array multimedia
    // se guarda la url, el tipo de archivo, la fecha, y el id y nombre del usuario que lo subio
    const referencia = doc(this.firestore, 'eventos', eventoId);
    await updateDoc(referencia, {
      multimedia: arrayUnion({
        url: urlSegura,
        tipo: esVideo ? 'video' : 'image',
        fecha: new Date(),
        usuarioId: usuarioId,
        usuarioNombre: usuarioNombre,
      })
    });

  } catch (error) {
    console.error(error);
    throw error;
  }
}

}