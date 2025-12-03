// Define la forma (interfaz) que tendrá un objeto de Usuario completo en la base de datos (Firestore).
// Es el contrato que garantiza la consistencia de los datos.
export interface Usuario {
    uid: string;
    // Identificador Único Universal (Unique ID) asignado por Firebase Auth. Es la clave primaria en Firestore.
    email: string;
    // Correo electrónico del usuario (también usado por Firebase Auth).
    nombre: string;
    // Nombre visible del usuario.
    fotoPerfil?: string;
    // Campo opcional (por el signo '?'). Guardará la URL de la imagen en Firebase Storage.
    biografia?: string;
    // Campo opcional de texto libre.
    intereses?: string[];
    // Campo opcional. Un array de strings para guardar los intereses del usuario (ej. ['música', 'deporte']).
    reputacion: number;
    // Campo numérico para métricas de la app.
    eventosCreados: number;
    // Campo numérico para métricas de la app.
    eventosAsistidos: number;
    // Campo numérico para métricas de la app.
    rol: 'usuario' | 'admin';
    // Campo de tipo restringido (union type). Solo puede tomar uno de esos dos valores.
    fechaRegistro: Date;
    // Tipo Date. Es importante que sea un objeto Date para que Firebase Firestore lo guarde correctamente como Timestamp.
}

// Define la estructura de datos que se recibe del formulario de Registro.
// Contiene solo la información necesaria para crear la cuenta de Auth y el perfil inicial.
export interface RegistroData {
    email: string;
    password: string;
    // La contraseña solo se usa aquí y se envía a Firebase Auth; nunca se guarda en Firestore.
    nombre: string;
}

// Define la estructura de datos que se recibe del formulario de Login.
// Contiene solo lo necesario para autenticar la sesión.
export interface LoginData {
    email: string;
    password: string;
    // Estos dos campos se pasan directamente a la función signInWithEmailAndPassword del AuthService.
}