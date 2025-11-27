import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/test', pathMatch: 'full' },
    { path: 'login', loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent)},
    { path: 'registro', loadComponent: () => import('./features/auth/registro/registro').then(m => m.RegistroComponent)}
    // { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] }

];

