import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    // pathMatch: 'full' asegura que solo redirige si la URL coincide exactamente con la raiz
    { path: 'login', loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent)},
    // redirige haciendo uso de lazy loading, esos recursos del componente solo se cargan cuando el usuario va a esa url
    { path: 'registro', loadComponent: () => import('./features/auth/registro/registro').then(m => m.RegistroComponent)},
    { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent), canActivate: [authGuard] },
    // canActivate: [authGuard]: Este es el punto de seguridad. Antes de cargar el componente,
    // Angular ejecuta la función authGuard. Si el guard devuelve false,
    // la navegación se bloquea y se ejecuta la lógica de redirección del guard, en este caso al login.
    { path: 'crear-evento', loadComponent: () => import('./features/eventos/crear-evento/crear-evento').then(m => m.CrearEventoComponent), canActivate: [authGuard] },
    { path: 'evento/:id', loadComponent: () => import('./features/eventos/detalle-evento/detalle-evento').then(m => m.DetalleEventoComponent), canActivate: [authGuard] }
];

// { path: 'evento/:id', loadComponent: () => import('./features/eventos/detalle-evento/detalle-evento').then(m => m.DetalleEventoComponent), canActivate: [authGuard] }

// path es el segmento de la url que activa la ruta
// import es la parte importante del lazy loading, sirve para cargar el componente de destino solo cuando se navega a esa ruta
// posteriormente se accede a la propiedad concreta