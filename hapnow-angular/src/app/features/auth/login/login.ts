import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// FormBuilder: Clase para construir el formulario de forma programática.
// FormGroup: Clase que representa la colección de controles del formulario.
// Validators: Clase que provee reglas de validación (ej. requerido, email).
// ReactiveFormsModule: Módulo para habilitar la funcionalidad de formularios reactivos.
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
// Conexión principal: Importa el servicio de lógica de negocio (el que habla con Firebase).
import { LoginData } from '../../../shared/models/usuario.model';
// Importa la interfaz para tipar (dar forma) a los datos que se enviarán al servicio.

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  // Inyección del FormBuilder para construir la estructura del formulario.
  private authService = inject(AuthService);
  // Inyección del AuthService. Permite llamar a authService.login().
  private router = inject(Router);
  // Inyección del Router para navegación local (ej. irAlRegistro).
  
  formularioLogin: FormGroup;
  // Objeto que representa el formulario y su estado (válido/inválido).
  cargando = false;
  // Flag booleano para controlar el estado de carga (ej. deshabilitar el botón Submit).
  mensajeError: string | null = null;
  // Variable para mostrar errores al usuario (ej. "Contraseña incorrecta").

  constructor() {
  this.formularioLogin = this.fb.group({
    // Usa FormBuilder para crear un grupo de controles.
    email: ['', [Validators.required, Validators.email]],
    // Control 'email': valor inicial vacío, requerido, y debe tener formato de email.
    password: ['', [Validators.required, Validators.minLength(5)]],
    // Control 'password': valor inicial vacío, requerido, y longitud mínima de 5 caracteres.
  })

  // Esta estructura coincide con la de la interfaz de usuario.models.ts
}

async onSubmit(): Promise<void> {
  // Función que se llama cuando el usuario envía el formulario. Es asíncrona porque llama a Firebase.
  
  if (this.formularioLogin.invalid) {
    // 1. Validación: Comprueba si alguna regla de Validator no se cumple.
    this.formularioLogin.markAllAsTouched();
    // Marca todos los campos como 'tocados' para que se muestren los mensajes de error en la UI.
    return;
  }

  this.cargando = true;
  this.mensajeError = null;

  const datos: LoginData = this.formularioLogin.value;
  // Extrae los valores del formulario y los tipa como LoginData.

  try {
    await this.authService.login(datos);
    // 2. Delegación: Llama a la función de lógica de negocio y espera la respuesta de Firebase.
    // Si tiene éxito, el authService.login() se encarga de la redirección al dashboard.
  } catch (error: any) {
    this.mensajeError = error;
    // 3. Manejo de error: Captura el error traducido del AuthService y lo guarda para mostrarlo en pantalla.
  } finally {
    this.cargando = false;
    // Desactiva el estado de carga, independientemente del resultado (éxito o fallo).
  }
}

irAlRegistro(): void {
  this.router.navigate(['/registro']);
}

// Aqui no se hace control de errores
}
