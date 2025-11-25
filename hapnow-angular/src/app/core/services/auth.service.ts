import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Usuario, RegistroData, LoginData } from '../../shared/models/usuario.model';

@Injectable({ providedIn: 'root' })
export class AuthService { private auth = inject(Auth); private firestore = inject(Firestore); private router = inject(Router);

// Signal para estado del usuario actual
usuarioActual = signal<Usuario | null>(null);

constructor() {
    // Escuchar cambios de autenticación
    user(this.auth).subscribe((firebaseUser: User | null) => {
        if (firebaseUser) {
            this.cargarDatosUsuario(firebaseUser.uid);
        } else {
            this.usuarioActual.set(null);
        }
    });
}

// REGISTRO
async registrar(datos: RegistroData): Promise<void> {
    try {
    // 1. Crear usuario en Firebase Auth
    const credencial = await createUserWithEmailAndPassword(
        this.auth,
        datos.email,
        datos.password
    );

    // 2. Crear perfil en Firestore
    const nuevoUsuario: Usuario = {
        uid: credencial.user.uid,
        email: datos.email,
        nombre: datos.nombre,
        reputacion: 0,
        eventosCreados: 0,
        eventosAsistidos: 0,
        rol: 'usuario',
        fechaRegistro: new Date()
    };

    // 3. Guardar en Firestore
    await setDoc(
        doc(this.firestore, `usuarios/${credencial.user.uid}`),
        nuevoUsuario
    );

    // 4. Actualizar signal
    this.usuarioActual.set(nuevoUsuario);

    // 5. Redirigir a dashboard
    this.router.navigate(['/dashboard']);
    
    console.log('✅ Usuario registrado:', nuevoUsuario);
    } catch (error: any) {
    console.error('❌ Error en registro:', error);
    throw this.manejarError(error);
    }
}

// LOGIN
async login(datos: LoginData): Promise<void> {
    try {
    // 1. Autenticar con Firebase
    const credencial = await signInWithEmailAndPassword(
        this.auth,
        datos.email,
        datos.password
    );

    // 2. Cargar datos del usuario desde Firestore
    await this.cargarDatosUsuario(credencial.user.uid);

    // 3. Redirigir a dashboard
    this.router.navigate(['/dashboard']);

    console.log('✅ Login exitoso');
    } catch (error: any) {
    console.error('❌ Error en login:', error);
    throw this.manejarError(error);
    }
}

  // LOGOUT
async logout(): Promise<void> {
    try {
    await signOut(this.auth);
    this.usuarioActual.set(null);
    this.router.navigate(['/login']);
    console.log('✅ Sesión cerrada');
    
    } catch (error) {
    console.error('❌ Error al cerrar sesión:', error);
    throw error;

    }
}

  // CARGAR DATOS DEL USUARIO
private async cargarDatosUsuario(uid: string): Promise<void> {
    try {
    const docRef = doc(this.firestore, `usuarios/${uid}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        this.usuarioActual.set(docSnap.data() as Usuario);
    } else {
        console.error('Usuario no encontrado en Firestore');
    }
    } catch (error) {
    console.error('Error al cargar datos del usuario:', error);
    }
}

  // VERIFICAR SI ESTÁ AUTENTICADO
isAuthenticated(): boolean {
    return this.usuarioActual() !== null;
}

  // MANEJAR ERRORES DE FIREBASE
private manejarError(error: any): string {
    const errores: { [key: string]: string } = {
    'auth/email-already-in-use': 'Este email ya está registrado',
    'auth/invalid-email': 'Email inválido',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
    'auth/user-not-found': 'Usuario no encontrado',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    'auth/network-request-failed': 'Error de conexión'
    };

    return errores[error.code] || 'Error desconocido. Intenta de nuevo';
    }
}