// ViewModel de Perfil
import { RepositorioUsuarios } from '../repositorios/RepositorioUsuarios.js';
import { RepositorioAgua } from '../repositorios/RepositorioAgua.js';
import { RepositorioRecordatorios } from '../repositorios/RepositorioRecordatorios.js';
import { Usuario } from '../modelos/Usuario.js';

export class PerfilViewModel {
    
    constructor() {
        this.usuario = null;
        this.estadisticas = null;
        this.recordatoriosActivos = 0;
        this.proximoRecordatorio = null;
        this.cargando = false;
        this.error = null;
        this._uid = null;
    }

    // ============================================
    // MÉTODOS PRINCIPALES
    // ============================================

    async cargarPerfil(uid) {
        if (!uid) {
            throw new Error('Usuario no autenticado');
        }
        
        this._uid = uid;
        this.cargando = true;
        this.error = null;
        
        try {
            // 1. Obtener datos del usuario
            const usuarioData = await RepositorioUsuarios.obtener(uid);
            if (usuarioData) {
                this.usuario = new Usuario(
                    usuarioData.uid,
                    usuarioData.nombre,
                    usuarioData.correo,
                    usuarioData.metaDiaria,
                    usuarioData.notificacionesActivas,
                    usuarioData.fechaRegistro
                );
            }

            // 2. Calcular estadísticas
            const registros = await RepositorioAgua.obtenerTodos(uid);
            let totalLitros = 0;
            const dias = new Set();
            registros.forEach(reg => {
                totalLitros += reg.cantidadML;
                if (reg.fecha) dias.add(reg.fecha);
            });
            
            this.estadisticas = {
                totalRegistros: registros.length,
                totalLitros: (totalLitros / 1000).toFixed(1),
                diasActivos: dias.size,
                promedioDiario: dias.size > 0 ? Math.round(totalLitros / dias.size) : 0
            };

            // 3. Obtener recordatorios activos
            const recordatorios = await RepositorioRecordatorios.obtenerTodos(uid);
            const activos = recordatorios.filter(r => r.activo);
            this.recordatoriosActivos = activos.length;
            this.proximoRecordatorio = activos.length > 0 ? activos[0].hora : null;

            this.cargando = false;
            return this._obtenerDatosPerfil();
        } catch (error) {
            this.error = error.message;
            this.cargando = false;
            throw error;
        }
    }

    async actualizarPerfil(nombre, correo) {
        if (!this._uid) {
            throw new Error('Usuario no autenticado');
        }
        
        this._validarNombre(nombre);
        this._validarCorreo(correo);
        
        this.cargando = true;
        this.error = null;
        
        try {
            await RepositorioUsuarios.actualizarPerfil(this._uid, nombre, correo);
            
            // Actualizar datos locales
            if (this.usuario) {
                this.usuario.nombre = nombre;
                this.usuario.correo = correo;
            }
            
            this.cargando = false;
            return true;
        } catch (error) {
            this.error = error.message;
            this.cargando = false;
            throw error;
        }
    }

    async actualizarNotificaciones(activas) {
        if (!this._uid) {
            throw new Error('Usuario no autenticado');
        }
        
        try {
            await RepositorioUsuarios.actualizarNotificaciones(this._uid, activas);
            if (this.usuario) {
                this.usuario.notificacionesActivas = activas;
            }
            return true;
        } catch (error) {
            this.error = error.message;
            throw error;
        }
    }

    // ============================================
    // MÉTODOS PRIVADOS
    // ============================================

    _obtenerDatosPerfil() {
        return {
            usuario: this.usuario,
            estadisticas: this.estadisticas,
            recordatoriosActivos: this.recordatoriosActivos,
            proximoRecordatorio: this.proximoRecordatorio,
            cargando: this.cargando,
            error: this.error
        };
    }

    _validarNombre(nombre) {
        if (!nombre || nombre.trim().length < 2) {
            throw new Error('El nombre debe tener al menos 2 caracteres');
        }
        if (nombre.trim().length > 50) {
            throw new Error('El nombre es demasiado largo');
        }
        return true;
    }

    _validarCorreo(correo) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!correo || !regex.test(correo)) {
            throw new Error('Ingresa un correo electrónico válido');
        }
        return true;
    }

    // ============================================
    // GETTERS
    // ============================================

    get nombreCompleto() {
        return this.usuario?.nombre || 'Usuario';
    }

    get correoElectronico() {
        return this.usuario?.correo || 'usuario@email.com';
    }

    get iniciales() {
        return this.usuario?.iniciales || 'U';
    }

    get fechaRegistro() {
        if (!this.usuario?.fechaRegistro) return 'Reciente';
        const fecha = new Date(this.usuario.fechaRegistro);
        return fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    }

    get notificacionesActivas() {
        return this.usuario?.notificacionesActivas ?? true;
    }

    get metaDiaria() {
        return this.usuario?.metaDiaria || 2500;
    }

    get tieneEstadisticas() {
        return this.estadisticas !== null;
    }

    get puedeActualizar() {
        return !this.cargando && this._uid !== null;
    }
}