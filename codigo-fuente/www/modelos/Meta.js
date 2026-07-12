// Modelo de Meta
export class Meta {
    constructor(uid, metaDiaria = 2500, fechaActualizacion = null) {
        this.uid = uid;
        this.metaDiaria = metaDiaria;
        this.fechaActualizacion = fechaActualizacion || new Date().toISOString();
    }

    // Calcular progreso
    calcularProgreso(consumoActual) {
        return Math.min((consumoActual / this.metaDiaria) * 100, 100);
    }

    // Validar
    esValido() {
        return this.uid && this.metaDiaria >= 500 && this.metaDiaria <= 10000;
    }
}