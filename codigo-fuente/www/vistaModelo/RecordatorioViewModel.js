// ViewModel de Recordatorios
import { RepositorioRecordatorios } from '../repositorios/RepositorioRecordatorios.js';

export class RecordatorioViewModel {
    
    constructor() {
        this.recordatorios = [];
        this.cargando = false;
        this.error = null;
        this._uid = null;
    }

    async cargarRecordatorios(uid) {
        if (!uid) {
            throw new Error('Usuario no autenticado');
        }
        
        this._uid = uid;
        this.cargando = true;
        this.error = null;
        
        try {
            console.log('📋 Cargando recordatorios para:', uid);
            this.recordatorios = await RepositorioRecordatorios.obtenerTodos(uid);
            console.log(`✅ ${this.recordatorios.length} recordatorios cargados`);
            this.cargando = false;
            return this.recordatorios;
        } catch (error) {
            console.error('❌ Error al cargar recordatorios:', error);
            this.error = error.message;
            this.cargando = false;
            throw error;
        }
    }

    async agregarRecordatorio(hora, frecuencia = 'diario') {
        console.log('➕ Intentando agregar recordatorio:', { hora, frecuencia });
        
        if (!this._uid) {
            console.error('❌ No hay UID');
            throw new Error('Usuario no autenticado');
        }
        
        this._validarHora(hora);
        
        this.cargando = true;
        this.error = null;
        
        try {
            console.log('📤 Creando recordatorio en Firebase...');
            const docRef = await RepositorioRecordatorios.crear(this._uid, hora, frecuencia);
            console.log('✅ Recordatorio creado con ID:', docRef.id);
            
            // Agregar a la lista local
            const nuevoRecordatorio = {
                id: docRef.id,
                idUsuario: this._uid,
                hora: hora,
                frecuencia: frecuencia,
                activo: true,
                fechaCreacion: new Date().toISOString()
            };
            this.recordatorios.push(nuevoRecordatorio);
            this._ordenarRecordatorios();
            
            console.log('📋 Lista actualizada:', this.recordatorios.length, 'recordatorios');
            
            this.cargando = false;
            return docRef;
        } catch (error) {
            console.error('❌ Error al agregar recordatorio:', error);
            this.error = error.message;
            this.cargando = false;
            throw error;
        }
    }

    async eliminarRecordatorio(id) {
        console.log('🗑️ Eliminando recordatorio:', id);
        
        try {
            await RepositorioRecordatorios.eliminar(id);
            this.recordatorios = this.recordatorios.filter(r => r.id !== id);
            console.log('✅ Recordatorio eliminado');
            return true;
        } catch (error) {
            console.error('❌ Error al eliminar:', error);
            this.error = error.message;
            throw error;
        }
    }

    async cambiarEstado(id, activo) {
        console.log('🔄 Cambiando estado:', id, 'a', activo);
        
        try {
            await RepositorioRecordatorios.cambiarEstado(id, activo);
            const recordatorio = this.recordatorios.find(r => r.id === id);
            if (recordatorio) {
                recordatorio.activo = activo;
            }
            console.log('✅ Estado actualizado');
            return true;
        } catch (error) {
            console.error('❌ Error al cambiar estado:', error);
            this.error = error.message;
            throw error;
        }
    }

    _validarHora(hora) {
        console.log('🔍 Validando hora:', hora);
        
        if (!hora) {
            console.error('❌ Hora vacía');
            throw new Error('Por favor, selecciona una hora');
        }
        
        const partes = hora.split(':');
        if (partes.length !== 2) {
            console.error('❌ Formato de hora inválido');
            throw new Error('Formato de hora inválido');
        }
        
        const h = parseInt(partes[0]);
        const m = parseInt(partes[1]);
        
        if (isNaN(h) || isNaN(m) || h > 23 || m > 59) {
            console.error('❌ Hora fuera de rango:', { h, m });
            throw new Error('Hora inválida');
        }
        
        console.log('✅ Hora válida:', { h, m });
        return true;
    }

    _ordenarRecordatorios() {
        this.recordatorios.sort((a, b) => a.hora.localeCompare(b.hora));
        console.log('📊 Recordatorios ordenados por hora');
    }

    get recordatoriosActivos() {
        return this.recordatorios.filter(r => r.activo);
    }

    get recordatoriosInactivos() {
        return this.recordatorios.filter(r => !r.activo);
    }

    get totalActivos() {
        return this.recordatoriosActivos.length;
    }

    get proximoRecordatorio() {
        const activos = this.recordatoriosActivos;
        return activos.length > 0 ? activos[0] : null;
    }

    get frecuenciasDisponibles() {
        return [
            { value: 'diario', label: 'Todos los dias' },
            { value: 'lunes-viernes', label: 'Lunes a Viernes' },
            { value: 'fines-semana', label: 'Fines de semana' }
        ];
    }

    get hayRecordatorios() {
        return this.recordatorios.length > 0;
    }

    get puedeAgregar() {
        return !this.cargando && this._uid !== null;
    }
}