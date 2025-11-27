import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { LoginData } from '../../../shared/models/usuario.model';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  formularioLogin: FormGroup;
  cargando = false;
  mensajeError: string | null = null;

  constructor() {
  this.formularioLogin = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(5)]],
  })

  // Esta estructura coincide con la de la interfaz de usuario.models.ts
}

async onSubmit(): Promise<void>{
  if (this.formularioLogin.invalid) {
    this.formularioLogin.markAllAsTouched();

    // Si el formulario es invalido...
    return;
  }

  this.cargando = true;
  this.mensajeError = null;

  const datos: LoginData = {
    email: this.formularioLogin.value.email,
    password: this.formularioLogin.value.password
  }
  // Obtiene los datos del login

  try {
    await this.authService.login(datos);
  } catch (error: any) {
    this.mensajeError = error;
  } finally {
    this.cargando = false;
  }
}

irAlRegistro(): void {
  this.router.navigate(['/registro']);
}

// Aqui no se hace control de errores
}
