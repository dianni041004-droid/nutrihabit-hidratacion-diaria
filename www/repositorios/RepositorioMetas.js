// Repositorio de Metas
import { ServicioUsuarios } from '../servicios/ServicioFirebase.js';
import { Meta } from '../modelos/Meta.js';

export class RepositorioMetas {
    
    static async obtener(uid) {
        const usuario = await ServicioUsuarios.get(uid);
        if (!usuario) return null;
        return new Meta(
            uid,
            usuario.metaDiaria || 2500,
            usuario.fechaActualizacion
        );
    }

    static async actualizar(uid, metaDiaria) {
        return await ServicioUsuarios.updateMeta(uid, metaDiaria);
    }
}