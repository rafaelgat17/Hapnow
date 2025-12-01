import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// PRIMER IMPORT: tipos y funciones propias de angular
// ApplicationConfig: tipo para la configuracion base de la aplicacion
// provideBrowserGlobalErrorListeners y provideZoneChangeDetection son servicios que registran a nivel global

// SEGUNDO IMPORT: importa la funcion que actua de configurador de las rutas

// TERCER IMPORT: importa el mapa de rutas que esta definido en otro archivo

// Firebase
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
// provideFirebaseApp registra la app principal de firebase
// initializeApp es la funcion de firebase que usa las credenciales para iniciar conexion
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
// provideFirestore registra el servicio en la base de datos de firebase
import { provideAuth, getAuth } from '@angular/fire/auth';
// provideAuth registra el servicio de Autenticación de Firebase
// getAuth es una función para obtener la instancia del servicio de autenticación
import { provideStorage, getStorage } from '@angular/fire/storage';
// provideStorage: Registra el servicio de Almacenamiento (manejo de archivos, imágenes).
// getStorage: Función para obtener la instancia del servicio de almacenamiento.
import { provideMessaging, getMessaging } from '@angular/fire/messaging';
// provideMessaging: Registra el servicio de Mensajería (Notificaciones Push, FCM).
// getMessaging: Función para obtener la instancia del servicio de mensajería.

import { firebaseConfig } from './firebase-config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Configura Zone.js (mecanismo que usa Angular para detectar cambios) con optimizaciones de rendimiento.
    provideRouter(routes),

    // Inicialización Firebase correcta
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    // esteblece la conexion con las credenciales de Firebase establecidas en firebase-config.ts
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage()),
    provideMessaging(() => getMessaging())
    // estos son los servicios establecidos para el proyecto en firebase
  ]
};
