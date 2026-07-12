// Modelo de Usuario
export class Usuario {
    constructor(uid, nombre, correo, metaDiaria = 2500, notificacionesActivas = true, fechaRegistro = null) {
        this.uid = uid;
        this.nombre = nombre;
        this.correo = correo;
        this.metaDiaria = metaDiaria;
        this.notificacionesActivas = notificacionesActivas;
        this.fechaRegistro = fechaRegistro || new Date().toISOString();
    }

    // Obtener iniciales para avatar
    get iniciales() {
        if (!this.nombre) return 'U';
        const partes = this.nombre.trim().split(' ');
        if (partes.length >= 2) {
            return (partes[0].charAt(0) + partes[1].charAt(0)).toUpperCase();
        }
        return this.nombre.charAt(0).toUpperCase();
    }

    // Validar datos
    esValido() {
        return this.uid && this.nombre && this.correo && this.metaDiaria >= 500 && this.metaDiaria <= 10000;
    }
}