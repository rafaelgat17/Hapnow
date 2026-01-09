import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { EventoService } from '../../core/services/evento.service';
import { Evento } from '../../shared/models/evento.model';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { FooterComponent } from '../../shared/components/footer/footer';
import * as L from 'leaflet';
import { routes } from '../../app.routes';
import 'leaflet/dist/images/marker-icon.png';
import 'leaflet/dist/images/marker-shadow.png';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent {
  authService = inject(AuthService);
  eventoService = inject(EventoService);
  
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  eventos: Evento[] = [];
  cargandoEventos = true;

  mapa: any;
  marcadores: any[] = [];
  ciudadActual: string = '';


  filtroProximidad = false;
  userCoords: { lat: number; lng: number } | null = null;


  categoriasActivas: { [key: string]: boolean } = {
  deportes: true,
  ocio: true,
  estudio: true,
  cultural: true,
  profesional: true
};


  get usuario() {
    return this.authService.usuarioActual();
  }






  // esta funcion es vital para el filtrado
  // en el navbar se paso como parametro a la url
  // la ciudad que el usuario haya ingresado
  // y cuando arranca la pagina del dashboard, lo primero de lo que se fija gracias al ngOnInit (al ejecutarse)
  // es la URL, la cual contiene la ciudad, la cual luego se le pasa como parametro que en un principio era opcional
  // cargarEventos se ejecuta siempre cuando se inicia el dashboard tenga o no tenga parametro
  async ngOnInit() {
    // al poner subscribe, esto hace que detecte todo cambio que ocurra dentro de la url
    this.route.queryParams.subscribe(async params => {
      await this.cargarEventos(params['ciudad']);
    });
  }











  // CHECKED
  // esta funcion se ejecuta cuando el html ha dejado ya de formarse
  // es una buena practica para asegurarse que el mapa no se creara de mala manera
  ngAfterViewInit() {
    setTimeout(() => {
      this.initMapa()
    }, 500);
  }






  // CHECKED
eventosCompletos: Evento[] = [];
// variable que almacena arrays en una coleccion
// unicamente con objetos tipo Evento

async cargarEventos(ciudad?: string) {
  this.cargandoEventos = true;
  // se activa el cargando
  try {
    // obtiene los eventos cargados desde Firebase
    const eventosBBDD = await this.eventoService.obtenerEventos(ciudad);
    
    // se guardan todos los eventos recopilados en la variable que creamos
    this.eventosCompletos = eventosBBDD;
    
    // se filtran los eventos
    this.filtrarEventos();
    // en caso de que no se haya tocado nada no se filtrara de ningun modo
    
  } catch (error) {
    console.error(error);
  } finally {
    this.cargandoEventos = false;
  }
}







  // CHECKED
  initMapa() {
    // se configura el icono por defecto que aparece en el mapa para señalar un evento
    const chincheta = L.icon({
        iconUrl: 'assets/marker-icon.png',
        shadowUrl: 'assets/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
    });

    // Aplicar la configuración al prototipo de Marker de Leaflet
    L.Marker.prototype.options.icon = chincheta;

    // se crea el mapa dentro del div especializado en dashboard.html
    this.mapa = L.map('mapa-container').setView([37.3828, -5.9732], 13);

    // se añaden las teselas que forman el mapa con las calles y demas
    // no se podria hacer this.mapa = L.tileLayer(...) puesto que se sustiuiria
    // su valor, por lo tanto, lo mas adecuado es usar addTo
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.mapa);


    setTimeout(() => {
      this.mapa.invalidateSize();
      // se inicializa la redimension del mapa para evitar zonas no cargadas al agrandarse
      if (this.eventos.length > 0) {
        // si ya habia eventos de antes, se pintan ahora que el mapa esta listo
        this.actualizarMarcadores();
      }
    }, 500)

}










  // CHECKED
  activarFiltroCategoria(categoria: string) {
    this.categoriasActivas[categoria] = !this.categoriasActivas[categoria];
    // las cateogriasActivas como su nombre inidican siempre estan en true, por lo tanto
    // con el ! se les aplica lo contrario en caso de que le den a ese boton
    this.filtrarEventos();
  }







// CHECKED
async filtrarEventos() {
  if (!this.eventosCompletos || this.eventosCompletos.length === 0) {
    console.log("no hay eventos para filtrar");
    return;
  } 
  // primero se comprueba que haya llegado la lista eventosCompletos,
  // si por lo que sea no esta se termina la funcion

  const eventosFiltrados = [];
  // Luego, creas una lista vacia donde vamos 
  // metiendo los eventos que pasen las pruebas

  for (const evento of this.eventosCompletos) {
    // se empiezan a revisar todos los eventos que tenemos guardados en esa variable que nos viene de cargarEventos

    // Primero mira si la categoria de un evento tiene su boton activado en el panel de filtros
    const nombreCategoria = evento.categoria?.toLowerCase();
    const categoriaActiva = this.categoriasActivas[nombreCategoria] === true;
    // dentro de esta variable, se pregunta primero si la categoria de cada evento es true,
    // y se guardan
    
    // esto mira si el evento que estamos mirando ya ha ocurrido, por lo tanto solo valen los que todavia siguen activos
    const esFuturo = !this.eventoService.esEventoPasado(evento.fecha, evento.hora);

    // SI LA CATEGORIA ESTA ACTIVA Y EL EVENTO SIGUE ACTIVO
    if (categoriaActiva && esFuturo) {
      // pregunta si el toggle y las coordenadas del usuario estan activas
      if (this.filtroProximidad && this.userCoords) {

        // obtenemos coordenadas del evento ya que en firebase se guardan como simple texto y no como direccion real
        const eventoCoordenadas = await this.obtenerCoordenadasDireccion(evento.ubicacion.ciudad, evento.ubicacion.direccion);
        if (eventoCoordenadas) {
          const distancia = this.calcularDistancia(
            this.userCoords.lat, this.userCoords.lng,
            eventoCoordenadas.lat, eventoCoordenadas.lng
            // gracias a la formula, averiguamos la distancia en km entre el usuario y el evento
          );
          if (distancia <= 20) {
            eventosFiltrados.push(evento);
            // si el evento esta dentro del limite se mete en el array de validos
          }
        }
      } else {
        eventosFiltrados.push(evento);
      }
    }
  }

  this.eventos = eventosFiltrados;
  console.log("lista de eventos filtrados: ", this.eventos.length);
  // se vacia la lista de eventos que estuviera presente y se les mete los filtrados
  // en caso se haberse puesto lo del rango de 20km
  if (this.mapa) this.actualizarMarcadores();
  // actualiza los maracadores con los eventos filtrados
}






  // CHECKED
  // async buscarPorCiudad(ciudad: string) {
  //   this.cargandoEventos = true;
  //   // se activa el estado de carga

  //   this.eventos = await this.eventoService.obtenerEventosPorCiudad(ciudad);
  //   // aqui se hace referencia a la funcion del servicio que 
  //   // trae los eventos que pertenecen a esa ciudad
  //   this.cargandoEventos = false;
  //   // se desactiva el cargando

  //   if (this.eventos.length > 0 && this.mapa) {
  //     // si hay eventos en esa ciudad...
  //     await this.geocodificarYCentrar(ciudad);
  //     // se usa esta funcion para que el mapa
  //     // se centre en la nueva ubicacion
  //   }

  //   if (this.mapa) {
  //     this.actualizarMarcadores();
  //     // se pintan los nuevos marcadores
  //   }
  // }





  // // CHECKED
  // async geocodificarYCentrar(ciudad: string) {
  //   try {
  //     const url = `https://nominatim.openstreetmap.org/search?city=${ciudad}&format=json&limit=1`;
  //     const respuesta = await fetch(url);
  //     const data = await respuesta.json();

  //     if (data.length > 0) {
  //       const lat = parseFloat(data[0].lat);
  //       const lng = parseFloat(data[0].lon);
  //       this.mapa.setView([lat, lng, 13]);
  //     }
  //   } catch (error) {
  //     console.error('Error al geolocalizar la ciudad: ', error);
  //   }
  // }





// CHECKED
// ACTUALIZAR MARCADORES EN EL MAPA
async actualizarMarcadores() {
  // este for limpia la lista de marcadores que previamente pudiera
  // haber para evitar errores y por limpieza, ya que es esta misma
  // funcion quien las crea
  for (let marcador of this.marcadores) {
    this.mapa.removeLayer(marcador);
    // con removelayer se quita marcador 
  }
  this.marcadores = [];

  const listaCoordenadas = [];

  // vamos evento por evento colocando las chinchetas
  for (let evento of this.eventos) {
    const eventoCoordenadas = await this.obtenerCoordenadasDireccion(evento.ubicacion.ciudad, evento.ubicacion.direccion);
    
    if (eventoCoordenadas) {
      const punto = L.latLng(eventoCoordenadas.lat, eventoCoordenadas.lng);
      listaCoordenadas.push(punto);
      // aqui es donde se usan las coordenadas de latitud y longitud que te devuelve geodificarDireccion

      // como ya tenemos el prototipo del marcador, simplemetne se asigna las coordenadas que tenemos
      // a la funcion marker y se añade como una capa mas al mapa
      const chincheta = L.marker(punto).addTo(this.mapa);
      chincheta.bindPopup("<b>" + evento.titulo + "</b>");
      // posteriormente se le añade un letrero arriba

      // se guarda posterioremten en la lista de marcadores
      this.marcadores.push(chincheta);
    }
  }
  console.log("marcadores nuevos");

  // se ajusta el zoom
  this.ajustarVistaMapa(listaCoordenadas);
}







// CHECKED
private ajustarVistaMapa(coordenadas: L.LatLng[]): void {
    const coordenadasPorDefecto: L.LatLngTuple = [37.3891, -5.9845]; 
    // estas son las coordenadas fijas que cogeria como punto por defecto si no hay eventos
    const zoomPorDefecto = 12;
    // zoom predeterminado

    if (coordenadas.length === 0) {
      console.log("NO HAY EVENTOS")
      this.mapa.setView(coordenadasPorDefecto, zoomPorDefecto);
      // si no hay eventos, se quedan las coordenadsa y el zoom por defecto que escribimos
    } else if (coordenadas.length === 1) {
      console.log("HAY UN SOLO EVENTO")
      this.mapa.setView(coordenadas[0], zoomPorDefecto);
      // en el caso de que solo haya un evento, unicamente se teletransporta a esa ubicacion y hace el zoom predeterminado
    } else {
      console.log("HAY" + coordenadas.length);
      const bordes = L.latLngBounds(coordenadas);
      // esta funcion logra encontrar el area minima que se requeriria para que se vieran todas y cada una de las chinchetas
      this.mapa.fitBounds(bordes, { padding: [50, 50] }); 
      // esta funcion es meramente estetica, para que no se queden los marcadores al borde del mapa y se vean bien
    }
}





// CHECKED
// devuelve efectivamente una latitud y una longitud
// estos dos datos se usaran principalmente en ActualizarMarcadores para colocar las chinchetas
// en el mapa, y tambien se usara en filtrarEventos para saber si esta a mas, o menos de 20km a la redonda
async obtenerCoordenadasDireccion(ciudad: string, direccion: string): Promise<{lat: number, lng: number} | null> {
    try {
      const direccionBuscar = direccion;
      // se coje la direccion que le llega
      const consulta = encodeURIComponent(direccionBuscar);
      // convierte el texto plano de la direccion en un formato seguro para url

      const url = "https://nominatim.openstreetmap.org/search?q=" + consulta + "&format=json&limit=1";
      // se contruye la url de la api de nominatim para hacer la busqueda

      const respuesta = await fetch(url);
      // se hace la peticion a la api
      const resultadosBusqueda = await respuesta.json();
      // la convierte a json, un array con resultados

      // si devolvio al menos un resultado...
      if (resultadosBusqueda.length > 0) {
        return {
          lat: parseFloat(resultadosBusqueda[0].lat),
          // data[0] seria la primera busqueda mas probable
          lng: parseFloat(resultadosBusqueda[0].lon)
          // devuelve los valores de la promise, la latitud y la longitud
        };
      }
      console.log("NO HAY COORDENADSAS");
      return null;
      // si no encuenta nada devuelve null, como tambien prometio la promise
    } catch (error) {
      console.error(error);
      return null;
    }
}



// CHECKED
async eliminarEvento(id: string) {
    const pregunta = confirm("¿Quieres cancelar este evento?");

    if (pregunta === true) {
      try {
        // Llamamos al servicio evento.service.ts y llamamos a la funcion cancelarEvento
        // el componente no espera ningun dato, solo que haga su cometido y no salga error
        await this.eventoService.cancelarEvento(id);

        // hacemos una lista de los eventos pero excluyendo aquel que contiene el id del evento eliminado
        this.eventos = this.eventos.filter(evento => evento.id !== id);
        // lo borramos completamente de la base de datos para que al usar filtros de categoria no salga de ningun modo
        this.eventosCompletos = this.eventosCompletos.filter(evento => evento.id !== id);

        // eventosCompletos se guardan todos los eventos que hayan llegado a la firestore (sea el que sea el estado)
        // eventos contendria todos los eventos que ve el usuario en el dashboard

        // si por ejemplo solo se borrase de eventos, en el dashboard no se veria, pero a la hora de filtrarlos, se veria puesto que sigue estando en la base de datos

        // La logica del Filtrado:
        // cada vez que se toca un boton de filtrado, la funcion suele hacer eso
        // 1, mira eventosCompletos
        // 2, filtra solo los que coinciden con los botones activos
        // 3, guarda el resultado en eventos (lo que se ve)
        
        // se crean los nuevos marcadores de nuevo
        this.actualizarMarcadores();

        alert('Evento cancelado')
      } catch (error) {
        console.error(error);
      }
    }
    
  }




  // CHECKED
  // formula de Haversine para calcular distancia en km entre dos coordenadas
calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}


// CHECKED
async activarProximidad(event: any) {
  this.filtroProximidad = event.target.checked;
  // se comprueba que el check de proximidad esta activado (true)

  // si el filtro esta activado y no tenemos la ubicacion del usuario
  if (this.filtroProximidad && !this.userCoords) {
    this.cargandoEventos = true;
    // activamos el cargando
    navigator.geolocation.getCurrentPosition(
      // le pedimos al usuario su ubicacion
      // a partir de aqui el usuario se entiende que le dio a SI
      (pos) => {
        this.userCoords = {
          // se guardan las coordenadas del usuario
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        this.filtrarEventos();
        // se llama al filtrarEventos porque ya tiene el dato que le falta (userCoords)
        this.cargandoEventos = false;
        // desactivamos el filtro de carga
      },
      (error) => {
        console.error("Error obteniendo ubicación", error);
        this.filtroProximidad = false;
        // se desactiva el filtro de proximidadd
        event.target.checked = false;
        // se desmarca el checkbox
        this.cargandoEventos = false;
        // se quita el estado de carga
        alert("No se pudo obtener tu ubicacion actual");
      }
    );
  } else {
    this.filtrarEventos();
    // llega aqui porque ya el sitio sabe la ubicacion del usuario
  }
}

}