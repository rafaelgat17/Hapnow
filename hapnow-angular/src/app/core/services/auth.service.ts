  import { Injectable, inject, signal } from '@angular/core';
// iinject se usa para inyectar dependencias
// signal es una funcion de angular para crear un estado reactivo que cambia segun la informacion que haya en el input
import { Router } from '@angular/router';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user, User, sendPasswordResetEmail } from '@angular/fire/auth';
// Importa funciones específicas del SDK modular de Firebase Auth para crear, loguear, desloguear y escuchar el estado.
import { Firestore, doc, setDoc, getDoc, Timestamp } from '@angular/fire/firestore';
import { Usuario, RegistroData, LoginData } from '../../shared/models/usuario.model';
// Importa la estructura de datos que usa este servicio (tipo de usuario, datos para login/registro).



@Injectable({ providedIn: 'root' })
// providedIn: 'root' asegura que este servicio sea un singleton (una sola instancia)
// y esté disponible globalmente sin necesidad de módulos.
export class AuthService { 

// Se inyectan las herramientas que se configuraron en el app.config.ts
private auth = inject(Auth); 
private firestore = inject(Firestore); 
private router = inject(Router);


// Signal para estado del usuario actual
usuarioActual = signal<Usuario | null>(null);
// El estado reactivo central: guarda el objeto Usuario completo o null
// cualquier componente que lea este signal se actualizara automaticamente si cambia


// CHECKED
// REGISTRO
async registrar(datos: RegistroData): Promise<void> {
    try {
    // Crear usuario en Firebase Auth
    const credencial = await createUserWithEmailAndPassword(
        this.auth,
        datos.email,
        datos.password
        // Crea la credencial de inicio de sesion y obtiene un UID
    );
    // este es un metodo propio de firebase (createUserWithEmailAndPassword)
    // y crea un perifl para firebase, el cual le basta con el correo y la contraseña

    // Crear perfil en Firestore
    const nuevoUsuario: Usuario = {
        uid: credencial.user.uid,
        // usa el uid generado por firebase auth
        // pero tenemos que ponerlo porque setDoc no lo genera solo, eso lo hace addDoc
        email: datos.email,
        nombre: datos.nombre,
        // se ponen los datos que le llegaron de registo.ts
        reputacion: 0,
        totalValoraciones: 0,
        eventosCreados: 0,
        eventosAsistidos: 0,
        rol: 'usuario',
        fechaRegistro: new Date()
        // Estos serian los campos pertenecientes a cada usuario
        // segun el modelo
    };

    // Guardar en Firestore
    await setDoc(
        doc(this.firestore, `usuarios/${credencial.user.uid}`),
        // aqui se especifica donde guardar
        nuevoUsuario
        // setDoc: Escribe o sobrescribe el documento del perfil de usuario en la base de datos
    );

    // Actualizar signal
    this.usuarioActual.set(nuevoUsuario);
    // Actualiza el estado reactivo central con el nuevo perfil.

    // Redirige al dashboard
    this.router.navigate(['/dashboard']);
    
    } catch (error: any) {
    throw this.manejarError(error);
    }

    // Aqui saltarian los mensajes en caso de exito (Usuario registrado)
    // O el mensaje de error (Error en el registro)
}


// CHECKED
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

    const idUsuario = credencial.user.uid;
    // se crea un objeto llamado credencial con toda la informacion
    // del usuario, entre ellas el uid que crea firebase

    // Cargar datos del usuario desde Firestore
    await this.cargarDatosUsuario(idUsuario);

    this.router.navigate(['/dashboard']);

    } catch (error: any) {
    throw this.manejarError(error);
    }

    // Aqui se manejan los errores
}


// CHECKED
// LOGOUT
async logout(): Promise<void> {
    await signOut(this.auth);
    // funcion de firebase para cerrar la sesion actual
    this.usuarioActual.set(null);
    this.router.navigate(['/login']);
}



// CHECKED
private async cargarDatosUsuario(uid: string): Promise<void> {
  try {
    // Creamos la referencia al documento del usuario en la colección 'usuarios'
    // Usamos el UID que nos da Firebase Auth para saber exactamente qué documento leer
    const referencia = doc(this.firestore, `usuarios/${uid}`);
    
    // cogemos el documento del usuario concreto
    const resultado = await getDoc(referencia);

    // Verificamos si el documento realmente existe en Firestore
    if (resultado.exists()) {
      // Extraemos los datos del documento y le decimos a TS que tienen forma del modelo de usuario
      const datos = resultado.data() as Usuario;

      // si el campo suspendido es true, significa que el atributo de Usuario (de la interfaz) esta true
      // y por lo tanto el usuario esta suspendido por culpa de un admin
      if (datos.suspendido === true) {
        alert('Tu cuenta ha sido suspendida por un administrador');
        await this.logout(); 
        // importante return para que pare de ejecutarse el resto de codigo de la funcion
        return; 
      }

      // si no esta el usuario suspendido, actualizamos el estado global (el signal) a los 
      // datos que nos han proporcionado desde el login
      // Esto dispara automaticamente cambios en el Navbar y permite el paso a los Guards
      this.usuarioActual.set(datos);
    }
  } catch (error) {
    console.error(error);
    this.usuarioActual.set(null);
  }
}



// CHECKED
// verifica si esta autenticado 
isAuthenticated(): boolean {
    return this.usuarioActual() !== null;
}



// CHECKED
// manejo de errores, solo se ejecuta cuando algo sale mal en un try catch
// captura el error y lo manda por aqui
private manejarError(error: any): string {
  // codigo contendria esa cadena que identifica al error 
  const codigoError = error.code;

  switch (codigoError) {
    case 'auth/email-already-in-use':
      return 'Este email ya esta registrado, prueba con otro';

    case 'auth/invalid-email':
      return 'El correo electronico no tiene un formato valido';

    case 'auth/weak-password':
      return 'La contraseña necesita de al menos 6 caracteres';

    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'El email o la contraseña no son correctos';

    case 'auth/network-request-failed':
      return 'Parece que no tienes internet';

    default:
      return 'Ha ocurrido un error inesperado, intentalo de nuevo';
  }
}





  async recuperarPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
      // esta funcion es de firebase, precisamente para mandar ese correo de recuperacion
      // siempre para funciones de firebase requieren de auth
    } catch (error: any) {
      throw this.manejarError(error);
    }
  }


  // CHECKED
  // ESTA FUNCION ES PARA MODERACION (PARA LUEGO)
async obtenerUsuarioPorId(uid: string): Promise<Usuario | null> {
  const referencia = doc(this.firestore, `usuarios/${uid}`);
  const resultado = await getDoc(referencia);
  return resultado.exists() ? (resultado.data() as Usuario) : null;
}
}