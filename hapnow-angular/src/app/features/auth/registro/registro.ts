import { Component, inject } from '@angular/core';
import { FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
// Importa las herramientas para la gestion de formularios reactivos:
// FormGroup: Estructura que contiene los controles
// Validators: Reglas de validacion (required, email, minLength)
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
// modulo para usar directivas estructurales (ej. *ngIf, *ngFor)
import { AuthService } from '../../../core/services/auth.service';
import { RegistroData } from '../../../shared/models/usuario.model';
// Importa la interfaz para tipar los datos que se enviarán a AuthService.registrar()

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class RegistroComponent {

  private authService = inject(AuthService);
  private router = inject(Router);

  formularioRegistro: FormGroup;
  cargando = false;
  mensajeError: string | null = null;

  constructor() {
  this.formularioRegistro = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(5)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(5)]),
    // estos serian los validadores por si algun campo esta vacio o no cumple con la longitud minima
  })
}

async onSubmit(): Promise<void>{
// metodo que se ejecutara al enviar el formulario, es asincrono porque espera la respuesta de firebase
  if (this.formularioRegistro.invalid) {
    this.formularioRegistro.markAllAsTouched();
    // si el formulario (el formgroup), da error porque alguno de los campos es invalido,
    // se marcan todos como tocados y dan error e impide que el formulario se envie y reedirija
    return;
  }

  this.cargando = true;
  this.mensajeError = null;

  const datosRegistro: RegistroData = {
    nombre: this.formularioRegistro.value.nombre,
    email: this.formularioRegistro.value.email,
    password: this.formularioRegistro.value.password
  }
  // Obtiene los datos del registro y los guarda como objeto Registro en datosRegistro

try {
  await this.authService.registrar(datosRegistro);
  // Llama al servicio, que se encarga del proceso de dos pasos (Auth y Firestore)
  // si tiene exito, la propia funcion del servicio lo manda al dashboard
  } catch (error: any) {
    this.mensajeError = error;
    this.cargando = false;
  } 
}
// Se ejecutara cuando el usuario le de a Registrarse, validara si el formulario es correcto





tieneError(campo: string): boolean {
// Función de utilidad para verificar si un campo debe mostrar un error en el HTML
const control = this.formularioRegistro.get(campo);
// Obtiene el control específico (ej. 'email') del formulario
return !!(control?.invalid && (control?.touched || control?.dirty));
// Retorna true si el campo es inválido Y (el usuario lo tocó O ha escrito algo en él)
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

  if (controlDeError.errors['required']) { 
    return 'Este campo es obligatorio'
  } 
  if (controlDeError.errors['email']) {
    return 'El email no es correcto'
  }
  if (controlDeError.errors['minlength']) { 
    return 'El minimo de caracteres es de 5'
  }

  return 'Error de validacion';
  
  
}

  // CHECKED
  irAlLogin(): void {
    this.router.navigate(['/login']);
  }

}




