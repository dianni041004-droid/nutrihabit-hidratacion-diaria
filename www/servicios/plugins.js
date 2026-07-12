// servicios/plugins.js
// Este archivo maneja la carga de plugins de Capacitor de forma segura

let LocalNotifications = null;
let isNative = false;

// Detectar si estamos en un entorno nativo
export function isNativePlatform() {
    try {
        return typeof Capacitor !== 'undefined' && Capacitor.isNative;
    } catch (e) {
        return false;
    }
}

// Cargar plugins (solo en Android)
export async function loadPlugins() {
    isNative = isNativePlatform();
    
    if (isNative) {
        try {
            // Usar import dinámico para evitar errores en web
            const module = await import('/android/plugins.js');
            LocalNotifications = module.LocalNotifications;
            console.log('✅ Plugins de Capacitor cargados correctamente');
        } catch (error) {
            console.warn('⚠️ No se pudieron cargar los plugins de Capacitor:', error);
            LocalNotifications = null;
        }
    } else {
        console.log('🌐 Modo Web - Plugins de Capacitor no disponibles');
        LocalNotifications = null;
    }
    
    return { LocalNotifications, isNative };
}

export function getLocalNotifications() {
    return LocalNotifications;
}

export function isNative() {
    return isNative;
}