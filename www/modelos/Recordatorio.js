// Modelo de Recordatorio
export class Recordatorio {
    constructor(id, idUsuario, hora, frecuencia = 'diario', activo = true, fechaCreacion = null) {
        this.id = id;
        this.idUsuario = idUsuario;
        this.hora = hora;
        this.frecuencia = frecuencia;
        this.activo = activo;
        this.fechaCreacion = fechaCreacion || new Date().toISOString();
    }

    // Obtener texto de frecuencia
    get frecuenciaTexto() {
        const frecuencias = {
            'diario': 'Todos los dias',
            'lunes-viernes': 'Lunes a Viernes',
            'fines-semana': 'Fines de semana'
        };
        return frecuencias[this.frecuencia] || this.frecuencia;
    }

    // Validar
    esValido() {
        return this.idUsuario && this.hora && this.frecuencia;
    }
}