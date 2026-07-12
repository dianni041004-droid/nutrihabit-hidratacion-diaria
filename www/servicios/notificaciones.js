// servicios/notificaciones.js
// Este archivo decide qué versión cargar

// Detectar si estamos en Android
function isAndroid() {
    try {
        const userAgent = navigator.userAgent.toLowerCase();
        const isCapacitor = typeof Capacitor !== 'undefined' && Capacitor.isNative;
        return isCapacitor || userAgent.includes('android');
    } catch (e) {
        return navigator.userAgent.toLowerCase().includes('android');
    }
}

// Variable para el servicio
let ServicioNotificaciones = null;

// Cargar la versión correcta
async function cargarServicio() {
    if (ServicioNotificaciones) {
        return ServicioNotificaciones;
    }

    try {
        if (isAndroid()) {
            console.log('📱 Cargando versión ANDROID');
            const module = await import('./notificaciones-android.js');
            ServicioNotificaciones = module.ServicioNotificaciones;
        } else {
            console.log('🌐 Cargando versión WEB');
            const module = await import('./notificaciones-web.js');
            ServicioNotificaciones = module.ServicioNotificaciones;
        }
    } catch (error) {
        console.error('❌ Error:', error);
        console.log('🌐 Usando fallback WEB');
        const module = await import('./notificaciones-web.js');
        ServicioNotificaciones = module.ServicioNotificaciones;
    }

    return ServicioNotificaciones;
}

// Exportar como promesa
export const ServicioNotificaciones = {
    async getInstance() {
        return await cargarServicio();
    },
    
    async registrarServiceWorker() {
        const service = await cargarServicio();
        return service.registrarServiceWorker();
    },
    
    async solicitarPermiso() {
        const service = await cargarServicio();
        return service.solicitarPermiso();
    },
    
    async enviarNotificacion(title, body, icon, url) {
        const service = await cargarServicio();
        return service.enviarNotificacion(title, body, icon, url);
    },
    
    async enviarNotificacionPrueba() {
        const service = await cargarServicio();
        return service.enviarNotificacionPrueba();
    },
    
    async enviarRecordatorioInmediato(hora, frecuencia) {
        const service = await cargarServicio();
        return service.enviarRecordatorioInmediato(hora, frecuencia);
    },
    
    async programarRecordatorio(hora, frecuencia) {
        const service = await cargarServicio();
        return service.programarRecordatorio(hora, frecuencia);
    },
    
    async programarRecordatoriosDesdeLista(recordatorios) {
        const service = await cargarServicio();
        return service.programarRecordatoriosDesdeLista(recordatorios);
    },
    
    async verificarEstado() {
        const service = await cargarServicio();
        return service.verificarEstado();
    },
    
    limpiarTimeouts() {
        if (ServicioNotificaciones) {
            ServicioNotificaciones.limpiarTimeouts();
        }
    },
    
    getNotificacionesPendientes() {
        if (ServicioNotificaciones) {
            return ServicioNotificaciones.getNotificacionesPendientes();
        }
        return [];
    }
};