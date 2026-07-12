// ViewModel de Registro de Consumo
import { RepositorioAgua } from '../repositorios/RepositorioAgua.js';
import { RepositorioUsuarios } from '../repositorios/RepositorioUsuarios.js';
import { obtenerFechaActual } from '../utilidades/Helpers.js';

export class RegistroViewModel {
    
    constructor() {
        this.cantidad = 0;
        this.nota = '';
        this.metaDiaria = 2500;
        this.consumoHoy = 0;
        this.cargando = false;
        this.error = null;
        this._uid = null;
    }

    // ============================================
    // MÉTODOS PRINCIPALES
    // ============================================

    async inicializar(uid) {
        if (!uid) {
            throw new Error('Usuario no autenticado');
        }
        this._uid = uid;
        
        try {
            const usuario = await RepositorioUsuarios.obtener(uid);
            this.metaDiaria = usuario?.metaDiaria || 2500;
            
            const fechaActual = obtenerFechaActual();
            this.consumoHoy = await RepositorioAgua.obtenerPorFecha(uid, fechaActual);
            
            return {
                metaDiaria: this.metaDiaria,
                consumoHoy: this.consumoHoy
            };
        } catch (error) {
            this.error = error.message;
            throw error;
        }
    }

    async guardarConsumo(cantidad, nota = '') {
        if (!this._uid) {
            throw new Error('Usuario no autenticado');
        }

        this.cargando = true;
        this.error = null;

        try {
            // Validaciones
            this._validarCantidad(cantidad);
            
            // Verificar si supera la meta
            const totalConEste = this.consumoHoy + cantidad;
            if (totalConEste > this.metaDiaria) {
                const confirmar = confirm(
                    `Con este registro superarás tu meta diaria (${this.metaDiaria}ml) en ${totalConEste - this.metaDiaria}ml. ¿Deseas continuar?`
                );
                if (!confirmar) {
                    this.cargando = false;
                    return null;
                }
            }

            // Guardar
            const docRef = await RepositorioAgua.crear(this._uid, cantidad, nota);
            this.cantidad = cantidad;
            this.nota = nota;
            
            // Actualizar consumo de hoy
            this.consumoHoy = await RepositorioAgua.obtenerPorFecha(this._uid, obtenerFechaActual());
            
            this.cargando = false;
            return docRef;
        } catch (error) {
            this.error = error.message;
            this.cargando = false;
            throw error;
        }
    }

    // ============================================
    // MÉTODOS PRIVADOS
    // ============================================

    _validarCantidad(cantidad) {
        if (!cantidad || cantidad <= 0) {
            throw new Error('Por favor, ingresa una cantidad válida');
        }
        if (cantidad > 5000) {
            throw new Error('La cantidad no puede superar los 5000 ml');
        }
        if (!Number.isInteger(cantidad)) {
            throw new Error('La cantidad debe ser un número entero');
        }
        return true;
    }

    // ============================================
    // GETTERS
    // ============================================

    get opcionesRapidas() {
        return [250, 500, 750, 1000];
    }

    get puedeGuardar() {
        return !this.cargando && this._uid !== null;
    }

    get mensajeProgreso() {
        const restante = Math.max(this.metaDiaria - this.consumoHoy, 0);
        return `Te quedan ${restante} ml para completar tu meta diaria`;
    }
}