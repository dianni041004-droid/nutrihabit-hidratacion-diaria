// ViewModel de Hidratación
import { FirebaseService } from "../services/FirebaseService.js";
import { WaterRecord } from "../model/WaterRecord.js";
import { Goal } from "../model/Goal.js";

export class HydrationViewModel {
    
    // Estado
    constructor() {
        this.metaDiaria = 2500;
        this.consumoHoy = 0;
        this.registros = [];
        this.porcentaje = 0;
    }

    // Cargar todos los datos del dashboard
    async cargarDashboard() {
        try {
            // Cargar meta
            const meta = await FirebaseService.getMeta();
            if (meta) {
                this.metaDiaria = meta.metaDiaria;
                this.metaId = meta.id;
            }

            // Cargar consumo de hoy
            const hoy = new Date().toISOString().split('T')[0];
            this.consumoHoy = await FirebaseService.getRegistrosPorDia(hoy);
            
            // Calcular porcentaje
            this.porcentaje = Math.min((this.consumoHoy / this.metaDiaria) * 100, 100);
            
            return {
                metaDiaria: this.metaDiaria,
                consumoHoy: this.consumoHoy,
                porcentaje: this.porcentaje,
                restante: Math.max(this.metaDiaria - this.consumoHoy, 0)
            };
        } catch (error) {
            console.error("Error en cargarDashboard:", error);
            throw error;
        }
    }

    // Guardar nuevo consumo
    async guardarConsumo(cantidad, nota) {
        if (!cantidad || cantidad <= 0) {
            throw new Error('Cantidad inválida');
        }
        if (cantidad > 5000) {
            throw new Error('La cantidad no puede superar los 5000 ml');
        }
        return await FirebaseService.guardarRegistro(cantidad, nota);
    }

    // Cargar historial
    async cargarHistorial(filtro = 'todas') {
        try {
            const registros = await FirebaseService.getRegistros();
            
            // Ordenar por fecha más reciente
            registros.sort((a, b) => (b.fechaHora || '').localeCompare(a.fechaHora || ''));
            
            // Aplicar filtro
            if (filtro === 'hoy') {
                const hoy = new Date().toISOString().split('T')[0];
                return registros.filter(r => r.fecha === hoy);
            }
            
            return registros;
        } catch (error) {
            console.error("Error en cargarHistorial:", error);
            throw error;
        }
    }

    // Eliminar registro
    async eliminarRegistro(id) {
        return await FirebaseService.eliminarRegistro(id);
    }

    // Editar registro
    async editarRegistro(id, nuevaCantidad) {
        if (!nuevaCantidad || nuevaCantidad <= 0) {
            throw new Error('Cantidad inválida');
        }
        return await FirebaseService.editarRegistro(id, nuevaCantidad);
    }

    // Actualizar meta
    async actualizarMeta(nuevaMeta) {
        if (!nuevaMeta || nuevaMeta < 500) {
            throw new Error('La meta debe ser al menos 500 ml');
        }
        if (nuevaMeta > 10000) {
            throw new Error('La meta no puede superar los 10,000 ml');
        }
        
        const meta = await FirebaseService.getMeta();
        if (meta) {
            await FirebaseService.actualizarMeta(meta.id, nuevaMeta);
            this.metaId = meta.id;
        } else {
            await FirebaseService.crearMeta(nuevaMeta);
        }
        this.metaDiaria = nuevaMeta;
        return true;
    }

    // Cargar resumen semanal
    async cargarResumenSemanal() {
        try {
            const hoy = new Date();
            const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
            
            const diaSemana = hoy.getDay();
            const diffLunes = diaSemana === 0 ? 6 : diaSemana - 1;
            const lunes = new Date(hoy);
            lunes.setDate(hoy.getDate() - diffLunes);
            
            const registros = await FirebaseService.getRegistros();
            
            const consumoPorDia = {};
            registros.forEach(reg => {
                if (reg.fecha) {
                    consumoPorDia[reg.fecha] = (consumoPorDia[reg.fecha] || 0) + (reg.cantidadML || 0);
                }
            });
            
            // Obtener meta
            const meta = await FirebaseService.getMeta();
            const metaDiaria = meta ? meta.metaDiaria : 2500;
            
            const datosSemana = [];
            let totalSemana = 0;
            let diasCompletados = 0;
            
            for (let i = 0; i < 7; i++) {
                const fecha = new Date(lunes);
                fecha.setDate(lunes.getDate() + i);
                const fechaStr = fecha.toISOString().split('T')[0];
                const consumo = consumoPorDia[fechaStr] || 0;
                const porcentajeDia = Math.min((consumo / metaDiaria) * 100, 100);
                
                let claseBarra = 'barra-baja';
                if (porcentajeDia >= 80) claseBarra = 'barra-alta';
                else if (porcentajeDia >= 50) claseBarra = 'barra-media';
                
                datosSemana.push({
                    dia: diasSemana[i],
                    consumo: consumo,
                    porcentaje: porcentajeDia,
                    claseBarra: claseBarra,
                    litros: (consumo / 1000).toFixed(1)
                });
                
                totalSemana += consumo;
                if (consumo >= metaDiaria) diasCompletados++;
            }
            
            const promedioDiario = Math.round(totalSemana / 7);
            
            return {
                datosSemana: datosSemana,
                totalSemana: totalSemana,
                diasCompletados: diasCompletados,
                promedioDiario: promedioDiario,
                metaDiaria: metaDiaria,
                totalLitros: (totalSemana / 1000).toFixed(1),
                promedioLitros: (promedioDiario / 1000).toFixed(1)
            };
        } catch (error) {
            console.error("Error en cargarResumenSemanal:", error);
            throw error;
        }
    }
}