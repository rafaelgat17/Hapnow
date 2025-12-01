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
      // Usar setTimeout para evitar problemas de contexto
      setTimeout(() => this.cargarDatosUsuario(firebaseUser.uid), 0);
    } else {
      this.usuarioActual.set(null);
    }
  });
}

// REGISTRO
async registrar(datos: RegistroData): Promise<void> {
    try {
    // Crear usuario en Firebase Auth
    const credencial = await createUserWithEmailAndPassword(
        this.auth,
        datos.email,
        datos.password
        // Ingresa un email y contraseña 
    );
    // este es un metodo propio de firebase

    // Crear perfil en Firestore
    const nuevoUsuario: Usuario = {
        uid: credencial.user.uid,
        email: datos.email,
        nombre: datos.nombre,
        reputacion: 0,
        eventosCreados: 0,
        eventosAsistidos: 0,
        rol: 'usuario',
        fechaRegistro: new Date()
        // Estos serian los campos pertenecientes a cada usuario
    };

    // Guardar en Firestore
    await setDoc(
        doc(this.firestore, `usuarios/${credencial.user.uid}`),
        // aqui se especifica donde guardar
        nuevoUsuario
        // aqui que guardar, concretamente el nuevo perfil creado
    );

    // Actualizar signal
    this.usuarioActual.set(nuevoUsuario);
    // Guarda en memoria quien esta registrado ahora mismo. (signal es una variable reactiva)

    // Redirige al dashboard
    this.router.navigate(['/dashboard']);
    
    } catch (error: any) {
    console.error('Error en registro:', error);
    throw this.manejarError(error);
    }

    // Aqui saltarian los mensajes en caso de exito (Usuario registrado)
    // O el mensaje de error (Error en el registro)
}



// LOGIN
async login(datos: LoginData): Promise<void> {
    try {
    // Autenticar con Firebase
    const credencial = await signInWithEmailAndPassword(
        this.auth,
        datos.email,
        datos.password
        // comprueba que son credenciales correctas
    );

    // Cargar datos del usuario desde Firestore
    await this.cargarDatosUsuario(credencial.user.uid);

    // Redirigir a dashboard
    this.router.navigate(['/dashboard']);

    } catch (error: any) {
    console.error('Error en login:', error);
    throw this.manejarError(error);
    }

    // Aqui se manejan los errores
}



  // LOGOUT
async logout(): Promise<void> {
    try {
    await signOut(this.auth);
    this.usuarioActual.set(null);
    // Se setea el usuarioActual a null
    this.router.navigate(['/login']);
    // Se redirige a la pagina de login
    
    } catch (error) {
    console.error('Error al cerrar sesión:', error);
    throw error;

    }
}




  // CARGAR DATOS DEL USUARIO
private async cargarDatosUsuario(uid: string): Promise<void> {
  try {
    const docRef = doc(this.firestore, `usuarios/${uid}`);
    // seria la ubicacion exacta de donde se ha guardado con setdoc el documento de registro de firestore de antes
    const docSnap = await getDoc(docRef);
    // ejecuta la lectura

    if (docSnap.exists()) {
      this.usuarioActual.set(docSnap.data() as Usuario);
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