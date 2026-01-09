import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
// Importamos las herramientas de Firebase
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
// Importamos nuestras llaves del archivo anterior
import { firebaseConfig } from './firebase-config';

export const appConfig: ApplicationConfig = {
  providers: [
    //  es un servicio que ayuda a Angular a detectar cambios en la pantalla y por lo tanto a actualizarse
    provideZoneChangeDetection({ eventCoalescing: true }),

    // sistema de rutas principal de Angular que permitira la navegacion entre paginas
    provideRouter(routes),
    // este es el servicio mas importante ya que es la que coge esos ids 
    // del anterior archivo y provoca la comunicación correcta entre Angular 
    // y Firebase, se le pasa el array de firebase-config.ts
    provideFirebaseApp(() => initializeApp(firebaseConfig)),

    // servicio de firebase que permite guardar y leer datos
    provideFirestore(() => getFirestore()),

    // servicio de firebase que activa el sistema de registro de correos y contraseñas
    provideAuth(() => getAuth()),
  ]
};