import { Injectable, inject, signal } from '@angular/core';
// inject: Función moderna de Angular para inyectar dependencias.
// signal: Función de Angular para crear un estado reactivo que notifica a la UI sobre cambios.
import { Router } from '@angular/router';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user, User } from '@angular/fire/auth';
// Importa funciones específicas del SDK modular de Firebase Auth para crear, loguear, desloguear y escuchar el estado.
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
// Importa funciones del SDK modular de Firebase Firestore (DB):
// Firestore: Tipo base para la inyección.
// doc: Crea una referencia a un documento específico.
// setDoc/getDoc: Escriben o leen un documento en la DB.
import { Usuario, RegistroData, LoginData } from '../../shared/models/usuario.model';
// Importa la estructura de datos que usa este servicio (tipo de usuario, datos para login/registro).



@Injectable({ providedIn: 'root' })
// providedIn: 'root' asegura que este servicio sea un singleton (una sola instancia)
// y esté disponible globalmente sin necesidad de módulos.
export class AuthService { private auth = inject(Auth); private firestore = inject(Firestore); private router = inject(Router);


// Signal para estado del usuario actual
usuarioActual = signal<Usuario | null>(null);
// El estado reactivo central: guarda el objeto Usuario completo o null.
// Cualquier componente que lea este Signal se actualizará automáticamente si cambia.

constructor() {
  // Escuchar cambios de autenticación
  user(this.auth).subscribe((firebaseUser: User | null) => {
    // Listener reactivo de Firebase que se dispara inmediatamente y cada vez que el estado de Auth cambia (login/logout).
    if (firebaseUser) {
      // Si Firebase confirma un usuario logueado:
      // Usar setTimeout para evitar problemas de contexto
      setTimeout(() => this.cargarDatosUsuario(firebaseUser.uid), 0);
      // Llama a la función para cargar el perfil completo (nombre, rol, etc.) desde Firestore.
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
        // Crea la credencial de inicio de sesión y obtiene un UID (ID de usuario único).
    );
    // este es un metodo propio de firebase (createUserWithEmailAndPassword)

    // Crear perfil en Firestore
    const nuevoUsuario: Usuario = {
        uid: credencial.user.uid, // usa el uid generado por firebase auth
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
        // setDoc: Escribe o sobrescribe el documento del perfil de usuario en la base de datos.
    );

    // Actualizar signal
    this.usuarioActual.set(nuevoUsuario);
    // Actualiza el estado reactivo central con el nuevo perfil.

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
    // Llama a la función que recuperará el perfil completo desde Firestore.

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
    // signOut(): Instrucción directa a Firebase para cerrar la sesión activa.
    this.usuarioActual.set(null);
    // Se setea el usuarioActual a null (buena practica)
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
    // docRef: Crea la referencia (dirección) al documento del perfil de usuario en Firestore.
    const docSnap = await getDoc(docRef);
    // getDoc: Comando que lee el documento desde el servidor de Firestore.
    // docSnap: Es la "instantánea" del resultado de la lectura.

    if (docSnap.exists()) {
      // docSnap.exists(): Verifica si el documento fue encontrado en esa dirección.
      this.usuarioActual.set(docSnap.data() as Usuario);
      // docSnap.data(): Extrae los datos del documento y actualiza la Signal.
    }
  } catch (error) {
    console.error('Error al cargar datos del usuario:', error);
    // Función simple que devuelve true si la Signal contiene un objeto Usuario (está logueado).
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
    // Mapeo de códigos de error de Firebase a mensajes amigables y legibles para el usuario final.

    return errores[error.code] || 'Error desconocido. Intenta de nuevo';
    }
}