// ViewModel de Historial
import { RepositorioAgua } from '../repositorios/RepositorioAgua.js';
import { obtenerFechaActual } from '../utilidades/Helpers.js';

export class HistorialViewModel {
    
    constructor() {
        this.registros = [];
        this.registrosFiltrados = [];
        this.filtro = 'todas';
        this.cargando = false;
        this.error = null;
        this._uid = null;
    }

    // ============================================
    // MÉTODOS PRINCIPALES
    // ============================================

    async cargarHistorial(uid) {
        if (!uid) {
            throw new Error('Usuario no autenticado');
        }
        
        this._uid = uid;
        this.cargando = true;
        this.error = null;
        
        try {
            let registros = await RepositorioAgua.obtenerTodos(uid);
            
            // Ordenar por fecha más reciente
            registros.sort((a, b) => (b.fechaHora || '').localeCompare(a.fechaHora || ''));
            
            this.registros = registros;
            this._aplicarFiltro();
            
            this.cargando = false;
            return this.registrosFiltrados;
        } catch (error) {
            this.error = error.message;
            this.cargando = false;
            throw error;
        }
    }

    async eliminarRegistro(id) {
        try {
            await RepositorioAgua.eliminar(id);
            // Actualizar lista
            this.registros = this.registros.filter(r => r.id !== id);
            this._aplicarFiltro();
            return true;
        } catch (error) {
            this.error = error.message;
            throw error;
        }
    }

    async editarRegistro(id, nuevaCantidad) {
        try {
            this._validarCantidad(nuevaCantidad);
            await RepositorioAgua.actualizar(id, nuevaCantidad);
            
            // Actualizar en la lista
            const registro = this.registros.find(r => r.id === id);
            if (registro) {
                registro.cantidadML = nuevaCantidad;
                registro.fechaHora = new Date().toISOString();
                registro.editado = true;
            }
            this._aplicarFiltro();
            return true;
        } catch (error) {
            this.error = error.message;
            throw error;
        }
    }

    cambiarFiltro(filtro) {
        this.filtro = filtro;
        this._aplicarFiltro();
        return this.registrosFiltrados;
    }

    // ============================================
    // MÉTODOS PRIVADOS
    // ============================================

    _aplicarFiltro() {
        if (this.filtro === 'hoy') {
            const hoy = obtenerFechaActual();
            this.registrosFiltrados = this.registros.filter(r => r.fecha === hoy);
        } else {
            this.registrosFiltrados = [...this.registros];
        }
    }

    _validarCantidad(cantidad) {
        if (!cantidad || cantidad <= 0) {
            throw new Error('Por favor, ingresa una cantidad válida');
        }
        if (cantidad > 5000) {
            throw new Error('La cantidad no puede superar los 5000 ml');
        }
        return true;
    }

    // ============================================
    // GETTERS
    // ============================================

    get totalRegistros() {
        return this.registros.length;
    }

    get totalFiltrados() {
        return this.registrosFiltrados.length;
    }

    get hayRegistros() {
        return this.registrosFiltrados.length > 0;
    }

    get estadisticas() {
        const total = this.registrosFiltrados.reduce((sum, r) => sum + r.cantidadML, 0);
        return {
            total: total,
            promedio: this.registrosFiltrados.length > 0 ? Math.round(total / this.registrosFiltrados.length) : 0,
            litros: (total / 1000).toFixed(1)
        };
    }
}