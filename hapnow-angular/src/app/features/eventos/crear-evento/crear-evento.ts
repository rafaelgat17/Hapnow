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
}
