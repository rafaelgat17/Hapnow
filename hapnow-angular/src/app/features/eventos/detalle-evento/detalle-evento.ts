import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EventoService } from '../../../core/services/evento.service';
import { ModeracionService } from '../../../core/services/moderacion.service';
import { AuthService } from '../../../core/services/auth.service';
import { Evento } from '../../../shared/models/evento.model';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';
import * as L from 'leaflet';

import 'leaflet/dist/images/marker-icon.png';
import 'leaflet/dist/images/marker-shadow.png';

@Component({
  selector: 'app-detalle-evento',
  imports: [CommonModule, RouterLink, NavbarComponent, FormsModule],
  templateUrl: './detalle-evento.html',
  styleUrl: './detalle-evento.scss',
})
export class DetalleEventoComponent implements OnInit {
  
  private router = inject(Router);
  // para el enrutamiento
  private route = inject(ActivatedRoute);
  // para mirar parametros de la url
  private eventoService = inject(EventoService);
  private authService = inject(AuthService);
  private moderacionService = inject(ModeracionService);

  evento: Evento | null = null;
  cargando = true;
  // el cargando esta true por defecto porque esta cargando el evneto completo
  mapaDetalle: any;
  // fechaInicioEvento: Date | null = null;
  reputacionCreador: number = 0;

  mostrarChat: boolean = false;
  nuevoMensaje: string = '';
  mensajes: any[] = [];
  conexionChat: any;




  
// CHECKED
async ngOnInit() {
  const id = this.route.snapshot.params['id'];
  // coge el el id de la url del evento concreto
  this.evento = await this.eventoService.obtenerEventoPorId(id);
  // coge el evento completo por la id recibida
  this.cargando = false;
  // se desactiva el cargando

  if (this.evento) {
    // console.log("El evento es: " + this.evento.titulo)
    // se busca la reputacion actual del usuario
    const creador = await this.authService.obtenerUsuarioPorId(this.evento.creadorId);
    this.reputacionCreador = creador?.reputacion || 0;

    // se obtiene la fecha del evento
    // if (this.evento.fecha) {
    //   this.fechaInicioEvento = this.evento.fecha;
    // }

    // se inicializa entonces el mapa
    setTimeout(() => {
      this.initMapaDetalle();
    }, 500); 
  } else {
    console.log("el evento no se pudo cargar");
  }
}






// CHECKED
// ESTA SE REPITE EN EL DASHBOARD, SOLO QUE AQUI SE COGE LA DIRECCION
async initMapaDetalle() {

    const chincheta = L.icon({
        iconUrl: 'assets/marker-icon.png', 
        shadowUrl: 'assets/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
    }); 

    L.Marker.prototype.options.icon = chincheta;

    // como evento ahora contiene los datos de ESE evneto concreto que pusimos
    // en el ngOnInit, pues ya de por si contendra la direccion
    const consultaCompleta = this.evento?.ubicacion.direccion;

    if (!consultaCompleta) {
      return;
    }

    // se pasa la consulta de la direccion a la funcion para sacar su latitud y longitud
    const eventoCoordenadas = await this.obtenerCoordenadasDireccion(consultaCompleta);

    // esto se pone para que Angular sepa que no puede ser null, ya que siempre se lo pregunta
    // es por seguridad
    if (!eventoCoordenadas) {
        console.log(`No se encontraron coordenadas validas para: ${consultaCompleta}`);
        return;
    }

    // aqui en vez de usar unas coordenadas predeterminadas (como en el dashboard con las de sevilla)
    // se usan las que le llegan de obtenerCoordenadasDireccion
    this.mapaDetalle = L.map('mapa-detalle').setView([eventoCoordenadas.lat, eventoCoordenadas.lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.mapaDetalle);

    // se añade la chincheta del evento concreto
    const marcador = L.marker([eventoCoordenadas.lat, eventoCoordenadas.lng]).addTo(this.mapaDetalle);

    // este seria el texto que aparece arriba de la chincheta
    marcador.bindPopup(`
        <div style="min-width: 150px;">
          <strong style="color: black;">${this.evento?.titulo}</strong><br>
          <span style="font-size: 12px;">
            ${this.evento?.ubicacion.direccion}
          </span> <br>
          <p style="font-weight: 1000"> · ${this.evento?.ubicacion.ciudad}<p>
        </div>
    `).openPopup(); 
    // openPopup() lo abre automaticamemte
}








  // CHECKED
  // esta funcion servira para ocultar o mostrar diversas acciones
  // en el html:
  // si es false:
  // - se muestra el boton de checkin
  // - se muestra el chat
  // - se muestra el boton de subir foto
  // si es true:
  // - se oculta el chat
  // - se muestra la galeria
  // - se muestra el form de valoracion (para no admins)
  esEventoPasado(fecha: any, hora: any, estado: any): boolean {
    return this.eventoService.esEventoPasado(fecha, hora, estado);
  }

  // para averiguar el valor ahora mismo de usuarioActual (usuario o null)
  get usuarioActual() { 
    return this.authService.usuarioActual(); 
  }
  
  // para saber si es creador, se pregunta si el id del creador del evento
  // es el mismo que el del usuario actual
get esCreador(): boolean {
  if (this.evento?.creadorId === this.usuarioActual?.uid) {
    return true;
  } else {
    return false;
  }
}

  // comprueba si el usuario actual esta o no registrado en el evento
  get yaEstaRegistrado(): boolean {
    const uid = this.usuarioActual?.uid;
    // obtiene el id del usuario actual si efectivamnete hay usuario
    return !!(uid && this.evento?.participantes?.includes(uid));
    // !! es para que devuelve boolean, pregunta si existe el id y si esta incluido
    // dentro de la lista de participantes del evento
  }







  // CHECKED
  // funcion para hacer el check-in (llama a la funcion del servicio que es la que se comunica con firebase)
async realizarCheckIn() {
  // usa async, lo que permite usar await dentro de ella y esperar a que firebase haga lo que sea sin que se bloquee el resto de la web
  const eventoId = this.evento?.id;
  const idUsuarioActual = this.usuarioActual?.uid;

  if (!eventoId || !idUsuarioActual) {
    return;
  } 
  // verifica simplemetne si el id del usuario y del evento existen, es una buena practica, ya que es obvio que ambos existen
  // pero es para evitar muy poco probables males mayores a posteriori
  // el ? evita que la web se ralle si el objeto es nulo

  const asistentesActuales = this.evento?.participantes?.length || 0;
  const cupoMaximo = this.evento?.maxParticipantes || Infinity;

  if (asistentesActuales >= cupoMaximo) {
    alert('Lo siento pero ya se ha alcanzado el cupo maximo de asistentes')
    return;
  }

  try {
    await this.eventoService.unirseAEvento(eventoId, idUsuarioActual);
    // aqui simplemente llamamos al servicio para que haga la funcion con firebase,
    // await le dice al codigo que espere a que Firebase confirme cualquier cosa antes de seguir con el codigo
    console.log("se ha chequeado")
    this.router.navigate(['/dashboard']);
    // una vez confirmado, redirige al dashboard
  } catch (error) {
    alert('No se pudo realizar el checkin');
  }
}


// CHECKED
async abandonarEvento() {

  const eventoId = this.evento?.id;
  const idUsuarioActual = this.usuarioActual?.uid;

  if (!eventoId || !idUsuarioActual) {
    return;
  } 

  const confirmar = confirm('¿Quieres abandonar el evento?');
  // lanza una ventana emergente nativa con el mensaje de cancelar o aceptar, devuelve true si acepta y false si cancela
  if (!confirmar) {
    return;
  }
  // si pulsa cancelar se detiene la accion

  try {
    await this.eventoService.abandonarEvento(eventoId, idUsuarioActual);
    // llama a la funcion del servicio y espera la respuesta

    this.router.navigate(['/dashboard']);

    alert('Ya no estas inscrito en este evento');
  } catch (error) {
    alert('No se pudo cancelar tu inscripcion');
  }
}







// CHECKED
// esta funcion recibe la direccion del evento desde InitMapaDetalle
// promete devolver la latitud y la longitud
// a diferencia de la del dashboard que necesita de la ciudad y la direccion porque son muchos eventos 
// (dentro de su bucle de actualizarMarcadores por ejemplo)
async obtenerCoordenadasDireccion(direccion: string): Promise<{lat: number, lng: number} | null> {
    try {
      // TODO EL FUNCIONAMIENTO DE LA FUNCION ES LA MISMA QUE LA DEL DASHBOARD
      const consulta = encodeURIComponent(direccion); 
      const url = `https://nominatim.openstreetmap.org/search?q=${consulta}&format=json&limit=1`;

      const respuesta = await fetch(url);
      const resultadoBusqueda = await respuesta.json();

      if (resultadoBusqueda.length > 0) {
        return {
          lat: parseFloat(resultadoBusqueda[0].lat),
          lng: parseFloat(resultadoBusqueda[0].lon)
        };
      }
      console.log("NO HAY COORDENADSAS");
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
}





notaSeleccionada: number = 0;

// CHECKED
seleccionarNota(nota: number) {
  this.notaSeleccionada = nota;
}
// esta funcion recoge el numero de rating que ha seleciconado el usuario (1-5)


// CHECKED
async enviarValoracion() {
  
  const uid = this.usuarioActual?.uid;
  const eventoId = this.evento?.id;
  const organizadorId = this.evento?.creadorId;

  // se hace esta validacion de seguridad
  if (!uid || !eventoId || !organizadorId) {
    alert('Error en la validacion');
    return;
  }

  try {
    await this.eventoService.valorarEvento(eventoId, organizadorId, uid, this.notaSeleccionada);
    // se le pasan las variables creadas mas la nota que antes se ha rellenado

    // se verifica si el array valoradoPor existe
    // si es la primera persona que vota, el array podria no existir
      // if (!this.evento!.valoradoPor)  {
      //   this.evento!.valoradoPor = [];
      // }

      // // se añade el id del usuario actual
      // this.evento!.valoradoPor.push(this.usuarioActual.uid);

      alert('Valoracion enviada');
  } catch (error) {
    alert('Error al enviar la valoracion');
  }
}






// CHECKED
// funcion para abrir y cerrar el chat
activarChat() {
  this.mostrarChat = !this.mostrarChat;
  // el valor al hacer click se torna de false a true y viceversa
  // segun el valor que tenga (al principio siempre false)
  if (this.mostrarChat) {
    this.cargarMensajes();
    // cuando mostrarChat esta a true, empezamos a cargar los mensajes
    // se actualiza cada vez que accedemos si hay mensajes nuevos
  } else {
    
    if (this.conexionChat) {
      this.conexionChat();
      this.conexionChat = null;
    }
    // ejecutamos suscripcionChat aplicandole parentesis, con esto se 
    // activa la funcion implicita de cierre del onSnapshot

    // pese a que no se este ejecutando cargarMensajes que es en donde
    // conexionChat obtiene un valor como tal, sigue teniendo una conexion
    // por lo tanto se debe cerrar
  }
}




// CHECKED
cargarMensajes() {
  if (this.evento?.id) {
    // comprueba que el evento existe
      this.conexionChat = this.eventoService.obtenerMensajes(this.evento.id, (mensajes) => {
      this.mensajes = mensajes;
      // this.mensajes es la variable que guarda todos los mensajes con sus datos actualizados
      // conexionChat solo guarda una funcion, la usamos para rellenarla, no se ejecuta
    });
  }
}


// CHECKED
async enviarMensaje() {
  // verificacion de segurdidad que comprueba lo siguiente
  // que el mensaje que escriba el usuario no este vacio
  // que el evento exista
  // o que no haya usuarioActual
  // si se cumple alguna de esas se para la funcion
  if (this.nuevoMensaje.trim() === '' || !this.evento?.id || !this.usuarioActual) return;
  
  try {
    // se espera la accion del servicio, se le pasa el id del evento, la cadena enviada y el usuario que lo manda
    await this.eventoService.enviarMensaje(this.evento.id, this.nuevoMensaje, this.usuarioActual);
    this.nuevoMensaje = ''; 
    // nuevoMensaje esta vinculada con el ngModel del input del formulario
    // se tiene que igualar a ' ' para que cuando se mande el mensaje no se quede el texto puesto
  } catch (error) {
    console.error("Error al enviar mensaje", error);
  }

    setTimeout(() => {
    const chatContainer = document.querySelector('.chat-mensajes');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, 100);
  // este bloque serviria para que la vista del contenedor
  // se transporte hacia abajo siempre que llegue un mensaje y calcula
  // el temaño
}


archivoInput() {
  document.getElementById('archivoId')?.click()
}


// CHECKED
async adjuntarArchivo(event: any) {
  
  // se coge el primero [0] ya que solo se permite subida de uno en uno
  const archivo = event.target.files[0];

  // aqui se comprueban 3 cosas, que exista un archivo multimedia subido
  // que el evento este cargado y saber quien es el usuario que ha subido la foto o vidoe
  if (archivo && this.evento?.id && this.usuarioActual) {
    try {
      // se activa el cargando
      this.cargando = true;

      // se llama al servicio y se le pasa el archivo, el id del evento y los datos del usuario
      await this.eventoService.subirMultimedia(this.evento.id, archivo, this.usuarioActual.uid, this.usuarioActual.nombre);

      alert('Archivo subido');
    } catch (error) {
      alert('Error al subir el archivo');
    } finally {
      this.cargando = false;
    }
  }
}




// CHECKED
// esta funcion recibe un mensaje concreto del html, (los mensajes dentro de ese bucle)
// le pasamos el objeto completo mensaje, ahi, el id siempre esta disponible
async reportarMensaje(mensaje: any) {
  
  // una ventana de confirmacion por si acaso
  const confirmacion = confirm(`¿Quieres reportar este mensaje de ${mensaje.usuarioNombre}?`);
  
  // si el usuario confirma...
  if (confirmacion) {
    // se llama al servicio de moderacion
    // se empaqueta la informacion y se le envia
    await this.moderacionService.crearReporte({
      // estos son los datos del reportador
      usuarioReportadorId: this.usuarioActual?.uid,
      usuarioReportadorNombre: this.usuarioActual?.nombre,

      // estos los del reportado (se extrae de mensaje)
      usuarioReportadoId: mensaje.usuarioId,
      usuarioReportadoNombre: mensaje.usuarioNombre,

      // estos son los datos del contenido
      tipoContenido: 'mensaje',
      // se especifica el tipo de contenido
      contenidoId: mensaje.id,
      // el id unico del mensaje (el que se crea automaticamente en firestore por addDoc)
      // ese id es el doc.id que se colocamos en el onSnapshot
      eventoId: this.evento?.id,
      // en que evento ocurrio
      textoContenido: mensaje.texto
      // el contenido del mensaje
    });
    alert('Reporte enviado ');
  }
}



// CHECKED
async reportarMultimedia(item: any) {

  // confirmacion de seguridad
  const confirmacion = confirm(`¿Quieres reportar esta multimedia de ${item.usuarioNombre}?`);
  
  // si le dio a aceptar...
  if (confirmacion) {
    try {
      // se valida quien es el reportado
      // el que subio la foto (item.usuarioId)
      // const idReportado = item.usuarioId;

      // // lo mismo para el nombre
      // const nombreReportado = item.usuarioNombre;

      // se crea entonces el paquete del reporte para crearReporte
      await this.moderacionService.crearReporte({
        // datos del reportador (como en la otra funcion)
        usuarioReportadorId: this.usuarioActual?.uid,
        usuarioReportadorNombre: this.usuarioActual?.nombre,

        // los datos que creamos para el usuario que haya subido la multimedia
        // ahora jamas podra ser undefined porque siempre tendra un valor si salta error en algun id
        usuarioReportadoId: item.usuarioId,
        usuarioReportadoNombre: item.usuarioNombre,

        // estos serian los datos del contenido
        tipoContenido: item.tipo,
        // aqui puede ser imagen o video, eso ya se especifico en su funcion de cloudinary
        contenidoId: item.url,
        // lo mismo con la url, en vez de id
        // ESTO SERVIRA PARA LUEGO ELIMINAR EL CONTENIDO
        // MULTIMEDIA
        eventoId: this.evento?.id
        // el id del evento
      });
      
      alert('Reporte enviado');
    } catch (error) {
      console.error(error);
    }
  }
}

}
