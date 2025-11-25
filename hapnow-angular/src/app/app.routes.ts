import { Routes } from '@angular/router';
import { TestFirebase } from './test-firebase/test-firebase';

export const routes: Routes = [
    { path: 'test', component: TestFirebase },
    { path: '', redirectTo: '/test', pathMatch: 'full' }
];

