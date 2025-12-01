import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    // CanActivateFn decide si se puede o no acceder a una ruta
const authService = inject(AuthService);
// Pide acceso al servicio de autenticacion y comprueba si alguien esta logeado
const router = inject(Router);

if (authService.isAuthenticated()) {
    return true;
    // Si esta autenticado, redirige al dashboard
} else {
    // Si no está autenticado, redirigir a login
    router.navigate(['/login']);
    return false;
}
};