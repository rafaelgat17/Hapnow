import { Component, inject } from '@angular/core';
// inject sirve para inyectar servicios (en este caso evento.service.ts)
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl,Validators, ReactiveFormsModule } from '@angular/forms';
// reactiveformsmodule para formularios reactivos en el template
import { Router } from '@angular/router';
import { EventoService } from '../../../core/services/evento.service';
import { CrearEventoData } from '../../../shared/models/evento.model';
import { settings } from '@angular/fire/analytics';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-crear-evento',
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './crear-evento.html',
  styleUrl: './crear-evento.scss',
})
export class CrearEventoComponent {
  
  private eventoService = inject(EventoService);
  // inyecta el servicio eventoservice para meter la funcion crearEvento() 

  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // se usara para redirigir al dashboard una vez se guarde el evento

  esModoEdicion = false;
  idEnEdicion: string | null = null;


  formularioEvento: FormGroup;
  cargando = false;
  mensajeError: string | null = null;

  // formularioEvento sera la variable que contendra el formulario
  // se inicializa luego en el constructor

  categorias = [
    { valor: 'deportes', nombre: 'Deportes' },
    { valor: 'ocio', nombre: 'Ocio' },
    { valor: 'estudio', nombre: 'Estudio' },
    { valor: 'cultural', nombre: 'Cultural' },
    { valor: 'profesional', nombre: 'Profesional' }
  ];

  // categorias de los eventos disponibles

  constructor() {
    this.formularioEvento = new FormGroup({
      titulo: new FormControl('', [Validators.required, Validators.minLength(5),  Validators.maxLength(100)]),
      descripcion: new FormControl('', [Validators.required, Validators.minLength(20), Validators.maxLength(500)]),
      categoria: new FormControl('', [Validators.required]),
      ciudad: new FormControl('', [Validators.required]),
      direccion: new FormControl('', [Validators.required]),
      fecha: new FormControl('', [Validators.required]),
      hora: new FormControl('', [Validators.required]),
      maxParticipantes: new FormControl(null),
    });
    // hasta que no se crea el formGroup, formularioEvento como tal 
    // es un contenedor vacio, cuando lo hace establece esa conexion 
    // con los inputs del html que tienen la propiedad FormControlName
    console.log(this.formularioEvento.value);

    this.validarHoraMaxima();
  }


// CHECKED
async ngOnInit() {
  // se mira si en la url hay un ?edit=ID_DEL_EVENTO
  const eventoId = this.route.snapshot.queryParamMap.get('edit');

  if (eventoId) {
    this.esModoEdicion = true;
    // originalmente a false
    this.idEnEdicion = eventoId;
    // originalmente null
    this.cargando = false;

    try {
      const evento = await this.eventoService.obtenerEventoPorId(eventoId);
      // aqui se obtiene el evento concreto con sus campos y todo desde la funcion
      if (evento) {
        // se rellena el formulario con los datos que tenia el evento
        this.formularioEvento.patchValue({
          titulo: evento.titulo,
          descripcion: evento.descripcion,
          categoria: evento.categoria,
          ciudad: evento.ubicacion.ciudad,
          direccion: evento.ubicacion.direccion,
          fecha: new Date(evento.fecha).toISOString().split('T')[0],
          // new Date lo convierte en tipo date
          // toISOString lo convierte a formato estandar "2026-01-03T15:30:00.000Z"
          // .split('T'), corta la primera parte a partir de la T y se queda con la fecha sin la hora
          // porque al mandarlo a firebase como timestamp le pasa la hora tambien
          hora: evento.hora,
          maxParticipantes: evento.maxParticipantes
        });
      }
    } catch (error) {
      this.mensajeError = 'No se pudieron cargar los datos del evento';
      this.cargando = false;
    }
  }
}



  // se ejecuta una sola vez, que es cuando se crea el formulario
  // crea el formgroup con los controles necesarios


  // CHECKED
  async onSubmit(): Promise<void> {

    const esHoraValida = this.verificarHoraValida();
    // es por seguridad simplemente a pesar de que ya se comprueba
    // si se le da muy rapido al boton

    if (this.formularioEvento.invalid || !esHoraValida) {
      this.formularioEvento.markAllAsTouched();
      // esto forzara a que no se envie el formulario
      this.mensajeError = 'Por favor, rellena o corrige todos los campos';
      return;
    }

    // esto comprueba si el formulario es invalido (propiedad del formgroup)
    // en caso de que sea invalido pues se marcan todas y saltan los errores

    this.cargando = true;
    this.mensajeError = null;

    // pone el boton deshabilitado y se desactivan los botones de error
    // si todos los campos estan bien y rellenos

    try {
      const datos: CrearEventoData = {
        // crea una variable de tipo crearEventoData, de evento.model.ts
        titulo: this.formularioEvento.value.titulo,
        descripcion: this.formularioEvento.value.descripcion,
        categoria: this.formularioEvento.value.categoria,
        ciudad: this.formularioEvento.value.ciudad,
        direccion: this.formularioEvento.value.direccion,
        fecha: new Date(this.formularioEvento.value.fecha),
        hora: this.formularioEvento.value.hora,
        maxParticipantes: this.formularioEvento.value.maxParticipantes
      };

      // si esta siendo editado un evento...
      if (this.esModoEdicion && this.idEnEdicion) {
        await this.eventoService.actualizarEvento(this.idEnEdicion, datos);
        // llama a la funcion del evento para actualizar el event0
      } else {
        await this.eventoService.crearEvento(datos);
        // si no se esta editando se llama a la funcion de crear el evento de evento service
      }

      // llama al metodo crearEvento de evento.service.ts que permite guardar con addDoc a la coleccion creada alla

      this.router.navigate(['/dashboard']);

      // te redirige al dashboard si da exito

    } catch (error: any) {
      this.mensajeError = 'No se ha podido crear el evento';
      setTimeout(() => this.mensajeError = null, 3000);
      // si hay error salta
    } finally {
      this.cargando = false;

      // el boton no se queda bloqueado en el mismo estado de crear evento....
    }

  }

  // CHECKED
  cancelar(): void {
    this.router.navigate(['/dashboard']);
  }
  // al darle al boton de cancelar nos redirigira simplemente al dashboard








// sugerenciasCiudades y sugerenciasDirecciones almacena las sugerencias de ciudades y direcciones
// devueltas por nominatim, cada elemento es { nombre: string, ciudad: string }

// mostrarSugerenciasCiudades y mostrarSugerenciasDirecciones controla la visibilidad del desplegable
// en cada lado

sugerenciasCiudades: any[] = [];
mostrarSugerenciasCiudades = false;
// al hacer focus en el input de ciudades con mas de 3 caracteres se vuelve TRUE
sugerenciasDirecciones: any[] = [];
mostrarSugerenciasDirecciones = false;
// lo mismo que en ciudades

// CHECKED
// esta funcion recoge lo que el usuario esta escribiendo en el input de Ciudad
ciudadInput(event: any): void {
    const query = event.target.value;
    // query seria el string que esta escribiendo el usuario
    this.buscarCiudades(query);
    // llama a la funcion
}


// CHECKED
// le llega lo que le mandamos por onCiudadInput()
// esta funcion realizara la busqueda de ciudades utilizadno la api segun el texto introducido por el usuario
buscarCiudades(query: string): void {
    // Esto provoca que cuando el usuario escriba menos de 3 caracteres no salgan sugerencias
    if (query.length < 3) {
        this.sugerenciasCiudades = [];
        return;
    }

    // se construye la url de nominatim:
    // city=${query}: se busca especificamente en el campo de ciudades
    // format=json: se pide la respuesta en formato json para que js lo entienda
    // addressdetails=1: es lo mas importante, ya que es la parte de la url que desglose
    // la direccion de la ciudad (para que luego se pueda sacar la ciudad, el puebo, la provincia, la calle)
    // limit=5: es para que solo salgan 5 resultados
    const url = `https://nominatim.openstreetmap.org/search?city=${query}&format=json&addressdetails=1&limit=5`;

    // se hace la llamada a la web con la url
    fetch(url)
        .then(response => response.json())
        // nada mas devuelva una respuesta, se convierte en json
        .then(data => {
          console.log(`resultados para: ${query}`, data);
            // se crea un array vacio donde se guardan los resultados
            const resultadosLimpios = [];

            // se recorre cada lugar que nos llega de la api
            for (let i = 0; i < data.length; i++) {
              const lugar = data[i];
              // lugar es cada sitio individual

              // se extrae la ciudad o pueblo
              const nombreCiudad = lugar.address?.city || lugar.address?.town || lugar.address?.village || lugar.address?.county;
              
              // se crea un objeto mas pequeño del lugar
              // de aqui luego se cogera patchValue para seleccionar lo que sea y saldra uno de los dos
              const ciudadSimplificada = {
                nombre: lugar.display_name,
                ciudad: nombreCiudad
              };

              resultadosLimpios.push(ciudadSimplificada);
              // se mete este objeto simplificado en la lista limpia
            }

            this.sugerenciasCiudades = resultadosLimpios;
            // y esa lista limpia dentro de la variable de la clase
        });
}


// CHECKED
// Se ejecuta cada vez que el usuario hace click en una sugerencia de un lugar 
seleccionarCiudad(sugerencia: any): void {
    // patchValue sera la funcion que lograra que al hacer click en una ciudad escrita
    // se coloque, no borra el formuarlio, si no que cambia el valor por la sugerencia
    this.formularioEvento.patchValue({
        ciudad: sugerencia.ciudad || sugerencia.nombre
        // ciudad: Sevilla
        // nombre: Sevilla, Andalucia, España
    });
    // una vez seleccionada se limpian las sugerencias
    this.sugerenciasCiudades = [];
    // se oculta es desplegable
    this.mostrarSugerenciasCiudades = false;
}







// CHECKED
// es el mismo sistema que el de la ciudad
direccionInput(event: any): void {
    const query = event.target.value;
    this.buscarDirecciones(query);
}


// CHECKED
// esta funcion realizara la busqueda de direcciones de una ciudad ya conocida previamente por el otro campo
buscarDirecciones(query: string): void {
    // filtro de logintud al igual que en las ciudades
    if (query.length < 3) {
        this.sugerenciasDirecciones = [];
        return;
    }

    // aseguramos que hay una ciudad ya escrita en ese campo
    const ciudad = this.formularioEvento.value.ciudad;
    if (!ciudad) return; 

    // se crea la url y en este caso se coloca tambien la ciudad
    // street=${query}: se busca la calle
    // se busca la calle teniendo en cuenta de que tiene que pertenecer a la ciudad que se especifico
    const url = `https://nominatim.openstreetmap.org/search?street=${query}&city=${ciudad}&format=json&limit=5`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const resultadosLimpios = [];

            for (let i = 0; i < data.length; i++) {
              const lugar = data[i];

              let calleNombre = lugar.address?.road;

              // se busca expresamente el campo calle,
              // si no, usa el nombre comleto
              if (!calleNombre) {
                calleNombre = lugar.display_name;
              }

              // de aqui luego se cogera patchValue para seleccionar lo que sea y saldra uno de los dos
              const direccionSimplificada = {
                nombre: lugar.display_name,
                direccion: calleNombre
              };

              resultadosLimpios.push(direccionSimplificada)
            }

            this.sugerenciasDirecciones = resultadosLimpios;
        });
}


// CHECKED
// funciona de la misma manera que con ciudad
seleccionarDireccion(sugerencia: any): void {
    this.formularioEvento.patchValue({
        direccion: sugerencia.direccion || sugerencia.nombre
    });
    this.sugerenciasDirecciones = [];
    this.mostrarSugerenciasDirecciones = false;
}







// CHECKED
// esta funcion escucha constantemente los cambios que hace el usuario en ambos campos
// gracias al constructor se activa nada mas se accede a la vista de crear evento
validarHoraMaxima(): void {
  // cogemos ambos campos, no solo su valor, si no el valor que va cambiando inclusive (por el valueChanges)
  // verificarHoraMaxima se ejecuta y muestra los errores una vez haga submit,
  // este no, este es siempre que haya un cambio, llama a esta primera funcion
  const cambiosFecha = this.formularioEvento.get('fecha')?.valueChanges;
  const cambiosHora = this.formularioEvento.get('hora')?.valueChanges;
  // VALUECHANGES SERIA UN OBSERBABLE

  // cada vez que el usuario cambia el contenido del input llama a la funcion para que verifique
  cambiosFecha?.subscribe(() => this.verificarHoraValida());
  cambiosHora?.subscribe(() => this.verificarHoraValida());
}

// CHECKED
verificarHoraValida(): boolean {
  const fecha = this.formularioEvento.get('fecha')?.value;
  const hora = this.formularioEvento.get('hora')?.value;
  // valores de los inputs fecha y hora
  const horaInput = this.formularioEvento.get('hora');
  // input concreto de hora

  if (!fecha || !hora) return false;

  const ahora = new Date();

  const eventoFechaHora = new Date(`${fecha}T${hora}`);

  const diferencia = (eventoFechaHora.getTime() - ahora.getTime()) / (1000 * 60 * 60);

  // si la diferencia de horas es negativa
  if (diferencia < 0) {
    horaInput?.setErrors({ pasado: true });
    return false;
  } 
  // si es superior a las 12 horas
  if (diferencia > 12) {
    horaInput?.setErrors({ futuroLejano: true });
    return false;
  }

  // si esta bien se quitan los errores y se devuelve true
  horaInput?.setErrors(null);
  return true;
  }

}
