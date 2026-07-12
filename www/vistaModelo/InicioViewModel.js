// ViewModel del Dashboard (Inicio)
import { RepositorioUsuarios } from '../repositorios/RepositorioUsuarios.js';
import { RepositorioAgua } from '../repositorios/RepositorioAgua.js';
import { Meta } from '../modelos/Meta.js';
import { obtenerFechaActual, parsearFechaLocal } from '../utilidades/Helpers.js';

export class InicioViewModel {
    
    constructor() {
        this.metaDiaria = 2500;
        this.consumoHoy = 0;
        this.porcentaje = 0;
        this.resumenSemanal = null;
        this.registros = [];
        this.cargando = false;
        this.error = null;
        this._uid = null;
        this._offsetSemanas = 0;
        this._inicializado = false;
    }

    async cargarDatos(uid) {
        if (!uid) {
            throw new Error('Usuario no autenticado');
        }
        
        this._uid = uid;
        this.cargando = true;
        this.error = null;
        this._inicializado = false;
        
        try {
            const usuario = await RepositorioUsuarios.obtener(uid);
            this.metaDiaria = usuario?.metaDiaria || 2500;

            this.registros = await RepositorioAgua.obtenerTodos(uid);
            this._registros = this.registros;

            const fechaActual = obtenerFechaActual();
            this.consumoHoy = await RepositorioAgua.obtenerPorFecha(uid, fechaActual);

            const meta = new Meta(uid, this.metaDiaria);
            this.porcentaje = meta.calcularProgreso(this.consumoHoy);

            await this.cargarResumenSemanal(0);

            this.cargando = false;
            this._inicializado = true;
            return this._obtenerDatosDashboard();
        } catch (error) {
            this.error = error.message;
            this.cargando = false;
            throw error;
        }
    }

    async refrescar() {
        if (!this._uid) return;
        return await this.cargarDatos(this._uid);
    }

    setOffsetSemanas(offset) {
        this._offsetSemanas = offset;
    }

    getOffsetSemanas() {
        return this._offsetSemanas;
    }

    async cargarResumenSemanal(offsetSemanas = null) {
        const offset = offsetSemanas !== null ? offsetSemanas : this._offsetSemanas;
        
        if (!this._uid) {
            console.warn('cargarResumenSemanal: No hay uid');
            return this.resumenSemanal;
        }

        this._offsetSemanas = offset;

        try {
            const hoy = new Date();
            // Obtener el día de la semana (0 = Domingo, 1 = Lunes, ...)
            const diaSemana = hoy.getDay();
            
            // Calcular el inicio de la semana (Domingo) con el offset
            // Si hoy es Miércoles (3), restamos 3 días para llegar al Domingo
            const inicioSemana = new Date(hoy);
            inicioSemana.setDate(hoy.getDate() - diaSemana + (offset * 7));
            inicioSemana.setHours(0, 0, 0, 0);
            
            const finSemana = new Date(inicioSemana);
            finSemana.setDate(inicioSemana.getDate() + 6);
            finSemana.setHours(23, 59, 59, 999);
            
            console.log('📅 Semana calculada:', {
                offset: offset,
                inicio: inicioSemana.toLocaleDateString('es'),
                fin: finSemana.toLocaleDateString('es'),
                diaSemanaHoy: diaSemana
            });
            
            const registros = this.registros || this._registros || [];
            
            // Filtrar registros de la semana
            const registrosSemana = registros.filter(reg => {
                if (!reg.fecha) return false;
                const fechaReg = parsearFechaLocal(reg.fecha);
                return fechaReg >= inicioSemana && fechaReg <= finSemana;
            });
            
            console.log('📊 Registros en la semana:', registrosSemana.length);
            
            // Días de la semana (Domingo = 0)
            const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            const consumoPorDia = [0, 0, 0, 0, 0, 0, 0];
            
            // Agrupar por día de la semana (usando fecha LOCAL)
            registrosSemana.forEach(reg => {
                const fecha = parsearFechaLocal(reg.fecha);
                const indice = fecha.getDay(); // 0 = Domingo
                consumoPorDia[indice] = (consumoPorDia[indice] || 0) + reg.cantidadML;
            });
            
            console.log('💧 Consumo por día:', consumoPorDia.map((v, i) => `${diasSemana[i]}: ${v}ml`));
            
            const datosSemana = [];
            let totalSemana = 0;
            let diasCompletados = 0;
            const hoyActual = new Date();
            
            for (let i = 0; i < 7; i++) {
                const consumo = consumoPorDia[i] || 0;
                const porcentajeDia = Math.min((consumo / this.metaDiaria) * 100, 100);
                
                let claseBarra = 'barra-baja';
                if (consumo > 0 && porcentajeDia >= 80) {
                    claseBarra = 'barra-alta';
                } else if (consumo > 0 && porcentajeDia >= 50) {
                    claseBarra = 'barra-media';
                }
                
                const fechaDia = new Date(inicioSemana);
                fechaDia.setDate(inicioSemana.getDate() + i);
                
                // Verificar si es hoy
                const esHoy = fechaDia.getFullYear() === hoyActual.getFullYear() &&
                              fechaDia.getMonth() === hoyActual.getMonth() &&
                              fechaDia.getDate() === hoyActual.getDate();
                
                datosSemana.push({
                    dia: diasSemana[i],
                    consumo: consumo,
                    porcentaje: porcentajeDia,
                    claseBarra: claseBarra,
                    litros: (consumo / 1000).toFixed(1),
                    esHoy: esHoy,
                    fechaDia: `${fechaDia.getFullYear()}-${String(fechaDia.getMonth() + 1).padStart(2, '0')}-${String(fechaDia.getDate()).padStart(2, '0')}`
                });
                
                totalSemana += consumo;
                if (consumo >= this.metaDiaria) diasCompletados++;
            }
            
            this.resumenSemanal = {
                inicioSemana: inicioSemana,
                finSemana: finSemana,
                datosSemana: datosSemana,
                totalSemana: totalSemana,
                diasCompletados: diasCompletados,
                totalLitros: (totalSemana / 1000).toFixed(1),
                promedioDiario: Math.round(totalSemana / 7),
                offset: offset
            };
            
            return this.resumenSemanal;
        } catch (error) {
            console.error('Error en resumen semanal:', error);
            this.error = error.message;
            return this.resumenSemanal;
        }
    }

    _obtenerDatosDashboard() {
        return {
            metaDiaria: this.metaDiaria,
            consumoHoy: this.consumoHoy,
            porcentaje: this.porcentaje,
            resumenSemanal: this.resumenSemanal,
            cargando: this.cargando,
            error: this.error
        };
    }

    get textoProgreso() {
        return `${Math.round(this.porcentaje)}% completado`;
    }

    get textoRestante() {
        const restante = Math.max(this.metaDiaria - this.consumoHoy, 0);
        return `Te faltan ${restante} ml para alcanzar tu meta`;
    }

    get mensajeMotivacional() {
        if (this.porcentaje >= 100) {
            return '🎉 ¡Felicidades! Alcanzaste tu meta diaria';
        } else if (this.porcentaje >= 80) {
            return '💪 ¡Muy bien! Estás cerca de tu meta';
        } else if (this.porcentaje >= 50) {
            return '👍 Vas por buen camino, ¡sigue así!';
        } else if (this.consumoHoy > 0) {
            return '💧 ¡Empieza fuerte, cada gota cuenta!';
        } else {
            return '💧 Registra tu primer consumo del día';
        }
    }
}