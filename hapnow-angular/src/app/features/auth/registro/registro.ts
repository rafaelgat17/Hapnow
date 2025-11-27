import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { RegistroData } from '../../../shared/models/usuario.model';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class RegistroComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  
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
  if (this.formularioRegistro.invalid) {
    this.formularioRegistro.markAllAsTouched();

    // Si el formulario es invalido...
    return;
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
  } catch (error: any) {
    this.mensajeError = error;
  } finally {
    this.cargando = false;
  }
}

// Se ejecutara cuando el usuario le de a Registrarse, validara si el formulario es correcto

tieneError(campo: string): boolean {
  
  const control = this.formularioRegistro.get(campo);

  return !!(control?.invalid && (control?.touched || control?.dirty));
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

  
}

irAlLogin(): void {
  this.router.navigate(['/login']);
}

// Este metodo devolvera el mensaje de error correspondiente a segun que campo del formulario

}




