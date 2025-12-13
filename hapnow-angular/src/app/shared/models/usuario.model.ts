// Define la forma del interaz que tendra un objeto usuario en la base de datos de Firestore
export interface Usuario {
    uid: string;
    // Identificador Único Universal (Unique ID) asignado por Firebase Auth. Es la clave primaria en Firestore
    email: string;
    // Correo electrónico del usuario (también usado por Firebase Auth)
    nombre: string;
    fotoPerfil?: string;
    // Guardará la URL de la imagen en Firebase Storage
    biografia?: string;
    intereses?: string[];
    reputacion: number;
    eventosCreados: number;
    eventosAsistidos: number;
    rol: 'usuario' | 'admin';
    // solo puede tomar uno de esos dos valores
    fechaRegistro: Date;
}

// Define la estructura de datos del registro
export interface RegistroData {
    email: string;
    password: string;
    // La contraseña solo se usa aquí y se envía a Firebase Auth; nunca se guarda en Firestore.
    nombre: string;
}

// Define la estructura de datos del login
export interface LoginData {
    email: string;
    password: string;
    // Estos dos campos se pasan directamente a la función signInWithEmailAndPassword del AuthService.
}