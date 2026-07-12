// Repositorio de Usuarios
import { ServicioUsuarios } from '../servicios/ServicioFirebase.js';
import { Usuario } from '../modelos/Usuario.js';

export class RepositorioUsuarios {
    
    static async obtener(uid) {
        const data = await ServicioUsuarios.get(uid);
        if (!data) return null;
        return new Usuario(
            data.uid,
            data.nombre,
            data.correo,
            data.metaDiaria,
            data.notificacionesActivas,
            data.fechaRegistro
        );
    }

    static async guardar(usuario) {
        if (!(usuario instanceof Usuario)) {
            throw new Error('Se espera una instancia de Usuario');
        }
        return await ServicioUsuarios.set(usuario.uid, {
            nombre: usuario.nombre,
            correo: usuario.correo,
            metaDiaria: usuario.metaDiaria,
            notificacionesActivas: usuario.notificacionesActivas,
            fechaRegistro: usuario.fechaRegistro
        });
    }

    static async actualizarMeta(uid, metaDiaria) {
        return await ServicioUsuarios.updateMeta(uid, metaDiaria);
    }

    static async actualizarNotificaciones(uid, activas) {
        return await ServicioUsuarios.updateNotificaciones(uid, activas);
    }

    static async actualizarPerfil(uid, nombre, correo) {
        return await ServicioUsuarios.actualizarPerfil(uid, nombre, correo);
    }
}