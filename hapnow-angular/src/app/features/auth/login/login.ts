import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
// FormGroup: Clase que representa la colección de controles del formulario
// Validators: Clase que provee reglas de validacion
// ReactiveFormsModule: Modulo para habilitar la funcionalidad de formularios reactivos
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { LoginData } from '../../../shared/models/usuario.model';
// Importa la interfaz para tipar (dar forma) a los datos que se enviaran al servicio

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {

  private authService = inject(AuthService);
  // Inyeccion del AuthService. Permite llamar a authService.login()
  // para loguear en firebase
  private router = inject(Router);
  
  formularioLogin: FormGroup;
  // Objeto que representa el formulario y su estado (valido/invalido)
  cargando = false;
  // booleano para controlar el estado de carga, para deshabilitar botones por ejemplo (buena practica)
  mensajeError: string | null = null;
  // Variable para mostrar errores al usuario
  mensajeExito: string | null = null;
  // Variable para mostrar mensajes de feedback al usuario

  constructor() {
  this.formularioLogin = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(5)]),
  })

  // Esta estructura coincide con la de la interfaz de usuario.models.ts (la interfaz de login)
}


// CHECKED
async onSubmit(): Promise<void> {
  // funcion que se llama cuando el usuario envia el formulario, es asincrona porque llama a firebase
  
  if (this.formularioLogin.invalid) {
    // comprueba si alguna regla del validator no se cumple
    this.formularioLogin.markAllAsTouched();
    // Marca todos los campos como 'tocados' para que se muestren los mensajes de error
    this.mensajeError = "Por favor rellena los campos";
    return;
  }

  this.cargando = true;
  this.mensajeError = null;
  this.mensajeExito = null;

  const datosLogin: LoginData = {
    email: this.formularioLogin.value.email,
    password: this.formularioLogin.value.password
  };
  // Intentamos entrar usando los datos del formulario
  try {
    await this.authService.login(datosLogin);
    // Llama a la funcion de lógica de negocio y espera la respuesta de firebase
    // Si tiene exito, el authService.login() se encarga de la redirección al dashboard
  } catch (error: any) {
    this.mensajeError = error;
    // captura el error traducido del AuthService y lo guarda para mostrarlo en pantalla
    this.cargando = false;
    // Desactiva el estado de carga, independientemente del resultad
  } 
}

// CHECKED
irAlRegistro(): void {
  this.router.navigate(['/registro']);
}


// CHECKED
async recuperarPassword(): Promise<void> {
  // se coge el valor de email del formulario que ha escrito el usuario
  const email = this.formularioLogin.get('email')?.value;

  if (!email || this.formularioLogin.get('email')?.invalid) {
    this.mensajeError = "Por favor, introduce un email valido para recuperar tu contraseña"
    return;
    // si el email que ha escrito el usuario no es valido segun las espeficicaciones del constructor
    // o esta vacio, le salta el mensaje de error y se para el resto del codigo para que no mande un correo
  }

  this.cargando = true;
  this.mensajeError = null;
  this.mensajeExito = null;
  // si es valido se pone el cargando a true para que se inhabiliten segun que botones con la propiedad [disabled]
  // y se inicializan a null los dos mensajes posibles

  try {
    // llamammos a la funcion del servicio y le pasamos el email que puso el usuario
    await this.authService.recuperarPassword(email);
    this.mensajeExito = 'Se ha enviado un correo de recuperacion'
    // si sale bien manda este mensaje
  } catch (error: any) {
    this.mensajeError = error;
  } finally {
    this.cargando = false;
    // para que se habilite de nuevo el boton
  }
}

}


