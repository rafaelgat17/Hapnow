// INTERFAZ DEL PERFIL DE USUARIO (cualqueir usuario)
export interface Usuario {
    uid: string;
    // ID unico que asigna el propio firebase auth
    email: string;
    // Su dirección de correo
    nombre: string;
    // el nombre que elige el usuario al registrarse
    
    suspendido?: boolean;
    reputacion: number;
    totalValoraciones: number;
    eventosCreados: number;
    eventosAsistidos: number;
    rol: 'usuario' | 'admin';

    fechaRegistro: Date;
}

// Define la estructura de datos del registro
export interface RegistroData {
    email: string;
    password: string;
    // La contraseña solo se usa aquí y se envía a Firebase Auth, nunca se guarda en Firestore
    nombre: string;
}

// Define la estructura de datos del login
export interface LoginData {
    email: string;
    password: string;
    // Estos dos campos se pasan directamente a la función signInWithEmailAndPassword del AuthService
}