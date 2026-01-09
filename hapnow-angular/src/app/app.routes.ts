import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
    // si el usuario no escribe nada lo redirige al login
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    // pathMatch: 'full' asegura que solo redirige si la URL coincide exactamente con la raiz

    // estas dos no requieren de Guard
    { path: 'login', loadComponent: () => import('./features/auth/login/login').then(archivo => archivo.LoginComponent)},
    // redirige haciendo uso de lazy loading, esos recursos del componente solo se cargan cuando el usuario va a esa url
    { path: 'registro', loadComponent: () => import('./features/auth/registro/registro').then(archivo => archivo.RegistroComponent)},


    // estas rutas de aqui si requieren de guard
    { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard').then(archivo => archivo.DashboardComponent), canActivate: [authGuard] },
    { path: 'crear-evento', loadComponent: () => import('./features/eventos/crear-evento/crear-evento').then(archivo => archivo.CrearEventoComponent), canActivate: [authGuard] },
    { path: 'evento/:id', loadComponent: () => import('./features/eventos/detalle-evento/detalle-evento').then(archivo => archivo.DetalleEventoComponent), canActivate: [authGuard] },
    { path: 'mis-eventos', loadComponent: () => import('./features/mis-eventos/mis-eventos').then(archivo => archivo.MisEventosComponent), canActivate: [authGuard] },
    { path: 'admin-dashboard', loadComponent: () => import('./features/admin-dashboard/admin-dashboard').then(archivo => archivo.AdminDashboardComponent), canActivate: [authGuard, adminGuard] }
];

// { path: 'evento/:id', loadComponent: () => import('./features/eventos/detalle-evento/detalle-evento').then(archivo => archivo.DetalleEventoComponent), canActivate: [authGuard] }

// path es el segmento de la url que activa la ruta
// import es la parte importante del lazy loading, sirve para cargar el componente de destino solo cuando se navega a esa ruta
// posteriormente se accede a la propiedad concreta