export interface Usuario {
    uid: string;
    email: string;
    nombre: string;
    fotoPerfil?: string;
    biografia?: string;
    intereses?: string[];
    reputacion: number;
    eventosCreados: number;
    eventosAsistidos: number;
    rol: 'usuario' | 'admin';
    fechaRegistro: Date;
}

export interface RegistroData {
    email: string;
    password: string;
    nombre: string;
}

export interface LoginData {
    email: string;
    password: string;
}