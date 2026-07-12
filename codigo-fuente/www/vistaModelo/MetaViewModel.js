// ViewModel de Metas
import { RepositorioUsuarios } from '../repositorios/RepositorioUsuarios.js';
import { Meta } from '../modelos/Meta.js';

export class MetaViewModel {
    
    constructor() {
        this.metaDiaria = 2500;
        this.cargando = false;
        this.error = null;
        this._uid = null;
    }

    // ============================================
    // MÉTODOS PRINCIPALES
    // ============================================

    async cargarMeta(uid) {
        if (!uid) {
            throw new Error('Usuario no autenticado');
        }
        
        this._uid = uid;
        this.cargando = true;
        this.error = null;
        
        try {
            const usuario = await RepositorioUsuarios.obtener(uid);
            this.metaDiaria = usuario?.metaDiaria || 2500;
            this.cargando = false;
            return this.metaDiaria;
        } catch (error) {
            this.error = error.message;
            this.cargando = false;
            throw error;
        }
    }

    async actualizarMeta(uid, nuevaMeta) {
        if (!uid) {
            throw new Error('Usuario no autenticado');
        }
        
        this._validarMeta(nuevaMeta);
        
        this.cargando = true;
        this.error = null;
        
        try {
            await RepositorioUsuarios.actualizarMeta(uid, nuevaMeta);
            this.metaDiaria = nuevaMeta;
            this.cargando = false;
            return true;
        } catch (error) {
            this.error = error.message;
            this.cargando = false;
            throw error;
        }
    }

    // ============================================
    // MÉTODOS PRIVADOS
    // ============================================

    _validarMeta(meta) {
        if (!meta || meta < 500) {
            throw new Error('La meta debe ser al menos 500 ml');
        }
        if (meta > 10000) {
            throw new Error('La meta no puede superar los 10,000 ml');
        }
        if (!Number.isInteger(meta)) {
            throw new Error('La meta debe ser un número entero');
        }
        return true;
    }

    // ============================================
    // GETTERS
    // ============================================

    get metaFormateada() {
        return `${this.metaDiaria} ml`;
    }

    get metaEnLitros() {
        return (this.metaDiaria / 1000).toFixed(1);
    }

    get opcionesPredefinidas() {
        return [2000, 2500, 3000];
    }

    get puedeActualizar() {
        return !this.cargando && this._uid !== null;
    }
}