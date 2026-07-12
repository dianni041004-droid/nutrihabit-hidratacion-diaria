// ViewModel de Login - Maneja autenticación
import { ServicioAuth, ServicioUsuarios } from '../servicios/ServicioFirebase.js';
import { Usuario } from '../modelos/Usuario.js';

export class LoginViewModel {
    
    constructor() {
        this.usuario = null;
        this.cargando = false;
        this.error = null;
        this._observer = null;
    }

    // ============================================
    // MÉTODOS DE AUTENTICACIÓN
    // ============================================

    async iniciarSesion(email, password) {
        this.cargando = true;
        this.error = null;
        
        try {
            // Validaciones
            if (!email || !password) {
                throw new Error('Por favor, completa todos los campos');
            }
            if (!this._validarEmail(email)) {
                throw new Error('Correo electrónico inválido');
            }

            const result = await ServicioAuth.login(email, password);
            this.usuario = result.user;
            this.cargando = false;
            return result;
        } catch (error) {
            this.error = this._traducirError(error);
            this.cargando = false;
            throw error;
        }
    }

    async registrarUsuario(email, password, nombre) {
        this.cargando = true;
        this.error = null;
        
        try {
            // Validaciones
            if (!email || !password || !nombre) {
                throw new Error('Por favor, completa todos los campos');
            }
            if (!this._validarEmail(email)) {
                throw new Error('Correo electrónico inválido');
            }
            if (password.length < 6) {
                throw new Error('La contraseña debe tener al menos 6 caracteres');
            }
            if (nombre.length < 2) {
                throw new Error('El nombre debe tener al menos 2 caracteres');
            }

            // Crear usuario en Firebase Auth
            const userCredential = await ServicioAuth.register(email, password);
            const user = userCredential.user;

            // Crear usuario en Firestore
            const nuevoUsuario = new Usuario(
                user.uid,
                nombre,
                email,
                2500, // Meta por defecto
                true,  // Notificaciones activas
                new Date().toISOString()
            );

            await ServicioUsuarios.set(user.uid, {
                uid: nuevoUsuario.uid,
                nombre: nuevoUsuario.nombre,
                correo: nuevoUsuario.correo,
                metaDiaria: nuevoUsuario.metaDiaria,
                notificacionesActivas: nuevoUsuario.notificacionesActivas,
                fechaRegistro: nuevoUsuario.fechaRegistro
            });

            this.usuario = user;
            this.cargando = false;
            return userCredential;
        } catch (error) {
            this.error = this._traducirError(error);
            this.cargando = false;
            throw error;
        }
    }

    async cerrarSesion() {
        try {
            await ServicioAuth.logout();
            this.usuario = null;
            return true;
        } catch (error) {
            this.error = error.message;
            throw error;
        }
    }

    async verificarAutenticacion() {
        return new Promise((resolve) => {
            ServicioAuth.onAuthStateChanged((user) => {
                this.usuario = user;
                resolve(user !== null);
            });
        });
    }

    obtenerUsuarioActual() {
        return ServicioAuth.getCurrentUser();
    }

    // ============================================
    // MÉTODOS PRIVADOS
    // ============================================

    _validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    _traducirError(error) {
        const mensajes = {
            'auth/user-not-found': 'Usuario no encontrado. Verifica tu correo.',
            'auth/wrong-password': 'Contraseña incorrecta. Intenta nuevamente.',
            'auth/invalid-email': 'Correo electrónico inválido.',
            'auth/too-many-requests': 'Demasiados intentos fallidos. Espera un momento.',
            'auth/email-already-in-use': 'Este correo ya está registrado.',
            'auth/weak-password': 'La contraseña es demasiado débil.',
            'auth/network-request-failed': 'Error de conexión. Verifica tu internet.'
        };
        return mensajes[error.code] || error.message;
    }

    // ============================================
    // GETTERS
    // ============================================

    get estaAutenticado() {
        return this.usuario !== null;
    }

    get nombreUsuario() {
        return this.usuario?.displayName || this.usuario?.email || 'Usuario';
    }
}