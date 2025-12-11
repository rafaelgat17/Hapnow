import { Component, inject } from '@angular/core';
// inject sirve para inyectar servicios (en este caso evento.service.ts)
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// reactiveformsmodule para formularios reactivos en el template
import { Router } from '@angular/router';
import { EventoService } from '../../../core/services/evento.service';
import { CrearEventoData } from '../../../shared/models/evento.model';
import { settings } from '@angular/fire/analytics';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-crear-evento',
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './crear-evento.html',
  styleUrl: './crear-evento.scss',
})
export class CrearEventoComponent {
  
  private fb = inject(FormBuilder);
  private eventoService = inject(EventoService);
  // inyecta el servicio eventoservice para meter la funcion crearEvento() 

  private router = inject(Router);

  // se usara para redirigir al dashboard una vez se guarde el evento

  
  formularioEvento: FormGroup;
  cargando = false;
  mensajeError: string | null = null;

  // formularioEvento sera la variable que contendra el formulario
  // se inicializa luego en el constructor

  // cargando esta a a true cuando pone creando... y el boton se encontrara deshabilitado

  categorias = [
    { valor: 'deportes', nombre: 'Deportes' },
    { valor: 'ocio', nombre: 'Ocio' },
    { valor: 'estudio', nombre: 'Estudio' },
    { valor: 'cultural', nombre: 'Cultural' },
    { valor: 'profesional', nombre: 'Profesional' }
  ];

  // categorias de los eventos disponibles

  constructor() {
    this.formularioEvento = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(500)]],
      categoria: ['', [Validators.required]],
      ciudad: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      fecha: ['', [Validators.required]],
      hora: ['', [Validators.required]],
      maxParticipantes: [null]
    });
  }

  // se ejecuta una sola vez, que es cuando se crea el formulario
  // crea el formgroup con los controles necesarios

  async onSubmit(): Promise<void> {

    // async permite usar await porque llamamos a firestore
    // promise<void> solo ejecuta acciones, no devuelve nada

    if (this.formularioEvento.invalid) {
      this.formularioEvento.markAllAsTouched();
      return;
    }

    // esto comprueba si el formulario es invalido (propiedad del formgroup)
    // en caso de que sea invalido pues se marcan todas y saltan los errores

    this.cargando = true;
    this.mensajeError = null;

    // pone el boton deshabilitado y se desactivan los botones de error

    try {
      const datos: CrearEventoData = {
        // crea una variable de tipo crearEventoData, de evento.model.ts
        ...this.formularioEvento.value, fecha: new Date(this.formularioEvento.value.fecha)

        // ...this.formularioEvento.value desempaqueta por asi decirlo los campos y valores del objeto
        // formularioEvento ya elaborado antes con el formGroup y se coge el "valor", que es todo eso

        // posteriormente se sobrescribe la propiedad fecha ya que es string y necesita ser tipo date
      };
      

      await this.eventoService.crearEvento(datos);

      // llama al metodo crearEvento de evento.service.ts que permite guardar con addDoc a la coleccion creada alla

      this.router.navigate(['/dashboard']);

      // te redirige al dashboard

    } catch (error: any) {
      this.mensajeError = 'No se ha podido crear el evento';
      setTimeout(() => this.mensajeError = null, 3000);

      // si hay error salta
    } finally {
      this.cargando = false;

      // el boton no se queda bloqueado en el mismo estado de crear evento....
    }

  }

  cancelar(): void {
    this.router.navigate(['/dashboard']);
  }

  // metodo simple para rediriger al dashboard al darle al boton cancelar








// sugerenciasCiudades y sugerenciasDirecciones almacena las sugerencias de ciudades y direcciones
// devueltas por nominatim, cada elemento es { nombre: string, ciudad: string }

// mostrarSugerenciasCiudades y mostrarSugerenciasDirecciones controla la visibilidad del desplegable
// en cada lado

sugerenciasCiudades: any[] = [];
mostrarSugerenciasCiudades = false;
sugerenciasDirecciones: any[] = [];
mostrarSugerenciasDirecciones = false;


// esta funcion realizara la busqueda de ciudades utilizadno la api segun el texto introducido por el usuario

buscarCiudades(query: string): void {

    if (query.length < 3) {
        this.sugerenciasCiudades = [];
        return;
    }

    // SI lo que introduce el usuario en el campo es menor a 3 letras no mostrara nada

    const url = `https://nominatim.openstreetmap.org/search?city=${query}&format=json&addressdetails=1&limit=5`;

    // query es lo que introducira el usuario en el input

    // hace la llamada asincrona a la api usando fetch
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // se mostrara el resultado de la busqueda de una forma mas legible
            this.sugerenciasCiudades = data.map((lugar: any) => ({
                nombre: lugar.display_name,
                // Intenta obtener la ciudad de diferentes campos de la respuesta de Nominatim de los que estan disponibles
                ciudad: lugar.address?.city || lugar.address?.town || lugar.address?.village || lugar.address?.county
            }));
        });
}


// maneja el evento de entrada, cada vez que hay una pulsacion

onCiudadInput(event: any): void {
    const query = event.target.value;
    this.buscarCiudades(query);
}

// Se ejecuta cada vez que el usuario hace click en una sugerencia de un lugar 

seleccionarCiudad(sugerencia: any): void {
    // ASUMIENDO QUE EXISTE this.formularioEvento
    this.formularioEvento.patchValue({
        // patchValue actualiza el campo ciudad del formulario con el valor elegido
        ciudad: sugerencia.ciudad || sugerencia.nombre
    });
    this.sugerenciasCiudades = [];
    this.mostrarSugerenciasCiudades = false;

    // una vez elegido se ocultan las sugerencias y desaparece el div de sugerencias
}





// Lógica de Direcciones

// esta funcion realizara la busqueda de direcciones de una ciudad ya conocida previamente por el otro campo

buscarDirecciones(query: string): void {
    // También limpiamos si la consulta es corta.
    if (query.length < 3) {
        this.sugerenciasDirecciones = [];
        return;
    }

    // Aseguramos que la ciudad ya esté seleccionada/escrita.
    const ciudad = this.formularioEvento.value.ciudad;
    if (!ciudad) return; 

    // Usamos el campo 'road' y la 'city' para mejorar la búsqueda
    const url = `https://nominatim.openstreetmap.org/search?street=${query}&city=${ciudad}&format=json&limit=5`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            this.sugerenciasDirecciones = data.map((lugar: any) => ({
                nombre: lugar.display_name,
                // Usamos 'road' o 'display_name' para la dirección
                direccion: lugar.address?.road || lugar.display_name 
            }));
        });
}

onDireccionInput(event: any): void {
    const query = event.target.value;
    this.buscarDirecciones(query);
}

seleccionarDireccion(sugerencia: any): void {
    // ¡CORREGIDO! DEBE HACER patchValue en el campo 'direccion', no 'ciudad'.
    this.formularioEvento.patchValue({
        direccion: sugerencia.direccion || sugerencia.nombre
    });
    this.sugerenciasDirecciones = [];
    this.mostrarSugerenciasDirecciones = false;
}









// Asegúrate de que tienes 'formularioEvento: FormGroup;' declarado e inicializado 
// en tu componente CrearEventoComponent.

/**
 * Configura los listeners para validar la hora y fecha del evento.
 * Se llama típicamente en ngOnInit o después de inicializar formularioEvento.
 */
validarHoraMaxima(): void {
    // 1. Verificar la hora al inicio para establecer el estado inicial.
    // Aunque la validación se hace a través de los listeners, es buena práctica
    // correrla una vez al inicio si los campos ya tienen valores.
    this.verificarHoraValida(); 

    // 2. Escuchar cambios en fecha y hora y disparar la validación.
    // Usamos el operador '?.' para seguridad, ya que los controles podrían no existir.
    
    this.formularioEvento.get('fecha')?.valueChanges.subscribe(() => {
        this.verificarHoraValida();
    });

    this.formularioEvento.get('hora')?.valueChanges.subscribe(() => {
        this.verificarHoraValida();
    });
    
    // NOTA: Para limpiar errores al cambiar la fecha, es mejor usar la función 
    // verificarHoraValida() que ya limpia los errores si la validación es correcta.
}

/**
 * Valida que la hora seleccionada no esté en el pasado 
 * y no exceda las 12 horas desde el momento actual.
 * @returns true si la hora es válida, false si es inválida.
 */
verificarHoraValida(): boolean {
    const fechaControl = this.formularioEvento.get('fecha');
    const horaControl = this.formularioEvento.get('hora');

    const fecha = fechaControl?.value;
    const hora = horaControl?.value;

    // Si falta alguno de los valores, asumimos que es válido temporalmente
    // (la validación 'required' se encarga de que no estén vacíos).
    if (!fecha || !hora) {
        // Importante: si no hay errores, se debe limpiar el control.
        horaControl?.setErrors(null);
        return true;
    }

    // 1. Obtener fecha/hora actual y del evento
    const ahora = new Date();
    // NOTA: Usar 'T' es esencial para asegurar que la fecha/hora se parsea como local o UTC, 
    // dependiendo del estándar del navegador, pero es la forma estándar de unir fecha e hora.
    const eventoDateTime = new Date(`${fecha}T${hora}`); 
    
    // 2. Calcular diferencia en horas: (evento - ahora) / milisegundos_en_una_hora
    const diferenciaHoras = (eventoDateTime.getTime() - ahora.getTime()) / (1000 * 60 * 60);
    
    // 3. Validación: No en el pasado
    if (diferenciaHoras < 0) {
        // Marcar error 'pasado'
        horaControl?.setErrors({ pasado: true });
        return false;
    }

    // 4. Validación: No más de 12 horas en el futuro
    if (diferenciaHoras > 12) {
        // Marcar error 'futuroLejano'
        horaControl?.setErrors({ futuroLejano: true });
        return false;
    }

    // Si pasa ambas validaciones:
    // Limpiar todos los errores personalizados del control.
    horaControl?.setErrors(null);
    return true;
}

}
