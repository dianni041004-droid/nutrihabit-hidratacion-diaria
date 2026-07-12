// Modelo de Registro de Agua
export class RegistroAgua {
    constructor(id, idUsuario, cantidadML, fecha, hora, fechaHora, nota = '') {
        this.id = id;
        this.idUsuario = idUsuario;
        this.cantidadML = cantidadML;
        this.fecha = fecha;
        this.hora = hora;
        this.fechaHora = fechaHora;
        this.nota = nota;
    }

    // Calcular litros
    get litros() {
        return (this.cantidadML / 1000).toFixed(1);
    }

    // Fecha formateada
    get fechaFormateada() {
        if (!this.fecha) return '--';
        const partes = this.fecha.split('-');
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    // Validar
    esValido() {
        return this.idUsuario && this.cantidadML > 0 && this.cantidadML <= 5000;
    }
}