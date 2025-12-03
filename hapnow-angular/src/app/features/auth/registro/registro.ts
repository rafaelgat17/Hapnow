import { Component, inject } from '@angular/core';
// Component: Decorador para la clase. inject: Función de inyección moderna.

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// Importa las herramientas para la gestión de formularios reactivos:
// FormGroup: Estructura que contiene los controles.
// Validators: Reglas de validación (required, email, minLength).

import { Router } from '@angular/router';
// Permite la navegación programática (ej. irAlLogin).

import { CommonModule } from '@angular/common';
// Módulo para usar directivas estructurales (ej. *ngIf, *ngFor).

import { AuthService } from '../../../core/services/auth.service';
// Importa el servicio clave que contiene la lógica de negocio y la comunicación con Firebase.

import { RegistroData } from '../../../shared/models/usuario.model';
// Importa la interfaz para tipar los datos que se enviarán a AuthService.registrar().

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class RegistroComponent {

  private fb = inject(FormBuilder);
  // Inyección de FormBuilder para construir el formulario en el constructor.

    private authService = inject(AuthService);
  // Inyección del servicio para llamar a la función registrar().

    private router = inject(Router);
  // Inyección del router para la navegación.
  
  formularioRegistro: FormGroup;
  cargando = false;
  mensajeError: string | null = null;

  constructor() {
  this.formularioRegistro = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(5)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(5)]],
  })
}

async onSubmit(): Promise<void>{
// Método que se ejecuta al enviar el formulario. Es asíncrono porque espera la respuesta de Firebase.
  if (this.formularioRegistro.invalid) {
    this.formularioRegistro.markAllAsTouched();
    // marca todos los campos como 'tocados' para que se activen las alertas de error en el HTML.
    // Si el formulario es invalido...
    return;
    // Detiene la ejecución si la validación falla.
  }

  this.cargando = true;
  this.mensajeError = null;

  const datos: RegistroData = {
    nombre: this.formularioRegistro.value.nombre,
    email: this.formularioRegistro.value.email,
    password: this.formularioRegistro.value.password
  }
  // Obtiene los datos del registro

try {
    await this.authService.registrar(datos);
    // Llama al servicio, que se encarga del proceso de dos pasos (Auth y Firestore).
    // Si tiene éxito, el AuthService también se encarga de la redirección.
  } catch (error: any) {
    this.mensajeError = error;
    // Captura el error devuelto por el AuthService (ya traducido a un string amigable).
  } finally {
    this.cargando = false;
    // Finaliza el estado de carga, independientemente del resultado.
  }
}
// Se ejecutara cuando el usuario le de a Registrarse, validara si el formulario es correcto

tieneError(campo: string): boolean {
// Función de utilidad para verificar si un campo debe mostrar un error en el HTML.
  
  const control = this.formularioRegistro.get(campo);
// Obtiene el control específico (ej. 'email') del formulario.

  return !!(control?.invalid && (control?.touched || control?.dirty));
// Retorna true si el campo es inválido Y (el usuario lo tocó O ha escrito algo en él).
}

// Hara que muestre errores debajo de cada campo
// se usa la doble negacion (!!) para devolver siempre un booleano
// invalid comprueba que el campo cumple o no con los requisitos que debe tener
// touched salta a true cuando entra al campo y sale sin cumplir las validaciones
// dirty salta a true cuando entra al campo, y, al ir escribiendo, no cumple con los requisitos ya que se actualiza

obtenerMensajeError(campo: string): string {
  const controlDeError = this.formularioRegistro.get(campo)

  if (!controlDeError || !controlDeError.errors) return '';
  // Si no hay control de errores o no hay error se retorna vacio

  if (controlDeError.errors['required']) return 'Este campo es obligatorio';
  if (controlDeError.errors['email']) return 'El email no es correcto';
  if (controlDeError.errors['minlength']) {
    const min = controlDeError.errors['minlength'].requiredLength;
    return `El minimo de caracteres es de ${min}`;
  }

  return 'Error de validación';
  
  // Este metodo devolvera el mensaje de error correspondiente a segun que campo del formulario
  
}

irAlLogin(): void {
  this.router.navigate(['/login']);
}

}




