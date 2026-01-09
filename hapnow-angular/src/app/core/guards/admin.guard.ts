import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

// CHECKED
export const adminGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    // se inyecta las funciones del auth service
    const router = inject(Router);

    const usuario = authService.usuarioActual(); 
    // se obtiene el valor de la signal (null o usuario)

    // se comprueba que el usuario exista y que 
    // comprueba que el rol del usuario es administrador
    if (usuario && usuario.rol === 'admin') {
        return true;
        // si es asi devuelve true
    } else {
        // si no es admin lo redirige al login y devuelve false
        console.warn('No se puede acceder, necesita ser administrador');
        router.navigate(['/login']);
        return false;
    }
};