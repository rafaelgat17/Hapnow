import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    // Exporta la función 'authGuard' que el Router de Angular ejecutará antes de activar la ruta.
    // CanActivateFn decide si se puede o no acceder a una ruta
    const authService = inject(AuthService);
    // Pide acceso al servicio de autenticacion y comprueba si alguien esta logeado
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        // Llamada al AuthService. Pregunta: "¿El usuarioActual (la Signal) es diferente de null?"
        return true;
        // Si authService.isAuthenticated() devuelve true, el Router activa la navegación.
        // Si esta autenticado, redirige al dashboard (Comentario: En realidad, *permite* seguir la ruta).
    } else {
        // Si no está autenticado, redirigir a login
        router.navigate(['/login']);
        return false;
    }
};