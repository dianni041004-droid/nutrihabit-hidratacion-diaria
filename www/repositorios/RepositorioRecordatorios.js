// Repositorio de Recordatorios
import { ServicioRecordatorios } from '../servicios/ServicioFirebase.js';
import { Recordatorio } from '../modelos/Recordatorio.js';

export class RepositorioRecordatorios {
    
    static async obtenerTodos(uid) {
        console.log('📥 Repositorio: obtenerTodos para', uid);
        try {
            const data = await ServicioRecordatorios.getAll(uid);
            console.log('📦 Datos obtenidos:', data);
            
            if (!data) {
                console.warn('⚠️ No hay datos');
                return [];
            }
            
            const result = data.map(item => new Recordatorio(
                item.id,
                item.idUsuario,
                item.hora,
                item.frecuencia,
                item.activo,
                item.fechaCreacion
            ));
            
            console.log(`✅ ${result.length} recordatorios mapeados`);
            return result;
        } catch (error) {
            console.error('❌ Error en obtenerTodos:', error);
            throw error;
        }
    }

    static async crear(uid, hora, frecuencia = 'diario') {
        console.log('📤 Repositorio: crear recordatorio', { uid, hora, frecuencia });
        
        try {
            const docRef = await ServicioRecordatorios.create(uid, hora, frecuencia);
            console.log('✅ Recordatorio creado en Firebase:', docRef.id);
            return docRef;
        } catch (error) {
            console.error('❌ Error en crear:', error);
            throw error;
        }
    }

    static async eliminar(id) {
        console.log('🗑️ Repositorio: eliminar', id);
        
        try {
            const result = await ServicioRecordatorios.delete(id);
            console.log('✅ Recordatorio eliminado');
            return result;
        } catch (error) {
            console.error('❌ Error en eliminar:', error);
            throw error;
        }
    }

    static async cambiarEstado(id, activo) {
        console.log('🔄 Repositorio: cambiar estado', { id, activo });
        
        try {
            const result = await ServicioRecordatorios.toggleEstado(id, activo);
            console.log('✅ Estado actualizado');
            return result;
        } catch (error) {
            console.error('❌ Error en cambiarEstado:', error);
            throw error;
        }
    }
}