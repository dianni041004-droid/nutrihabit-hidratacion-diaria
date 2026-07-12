// Repositorio de Registros de Agua
import { ServicioAgua } from '../servicios/ServicioFirebase.js';
import { RegistroAgua } from '../modelos/RegistroAgua.js';

export class RepositorioAgua {
    
    static async obtenerTodos(uid) {
        const data = await ServicioAgua.getAll(uid);
        return data.map(item => new RegistroAgua(
            item.id,
            item.idUsuario,
            item.cantidadML,
            item.fecha,
            item.hora,
            item.fechaHora,
            item.nota
        ));
    }

    static async obtenerPorFecha(uid, fecha) {
        return await ServicioAgua.getByFecha(uid, fecha);
    }

    static async crear(uid, cantidadML, nota = '') {
        const docRef = await ServicioAgua.create(uid, cantidadML, nota);
        return docRef;
    }

    static async actualizar(id, cantidadML) {
        return await ServicioAgua.update(id, cantidadML);
    }

    static async eliminar(id) {
        return await ServicioAgua.delete(id);
    }
}