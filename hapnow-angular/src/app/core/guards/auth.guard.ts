import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

// CanActivateFn es una funcion que decide si se puede o no acceder a una ruta, devuevle un booleano
export const authGuard: CanActivateFn = (route, state) => {
    // usamos inject para obtener el servicio de autenticación y el router
    const authService = inject(AuthService);
    const router = inject(Router);

    // se consulta la funcion isAuthenticated del servicio (que devuelve un booleano) si hay o no un usuario guardado
    // en usuario actual
    if (authService.isAuthenticated()) {
        // si sale true, (hay un usuario guardado, no es nulo), redirige a la pagina deseada que se 
        // especifique en el archivo de rutas
        return true;
    } else {
        // si el isAuthenticated del auth.service nos devuelve null significa que no hay ningun usuario
        // por lo tanto redirige al login y no puede acceder
        router.navigate(['/login']);
        return false;
        // se para cualquier intento de conexion a la pagina de destino
    }
};