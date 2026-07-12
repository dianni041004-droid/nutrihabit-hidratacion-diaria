// servicios/ServicioNotificaciones.js
// Versión ÚNICA que funciona en WEB y ANDROID

function isAndroid() {
    try {
        if (typeof Capacitor !== 'undefined' && Capacitor.isNative) return true;
    } catch (e) {}
    return navigator.userAgent.toLowerCase().includes('android');
}

function getLocalNotifications() {
    try {
        if (typeof Capacitor !== 'undefined' && Capacitor.Plugins && Capacitor.Plugins.LocalNotifications) {
            return Capacitor.Plugins.LocalNotifications;
        }
    } catch (e) {
        console.error('Error accediendo a LocalNotifications:', e);
    }
    return null;
}

function getDiagnosticInfo() {
    const info = {
        capacitorDefined: typeof Capacitor !== 'undefined',
        capacitorIsNative: false,
        capacitorPlugins: [],
        localNotificationsAvailable: false,
        isAndroidDevice: isAndroid(),
        notificationApiAvailable: typeof Notification !== 'undefined',
        notificationPermission: typeof Notification !== 'undefined' ? Notification.permission : 'N/A'
    };
    try {
        if (typeof Capacitor !== 'undefined') {
            info.capacitorIsNative = !!Capacitor.isNative;
            info.capacitorPlugins = Object.keys(Capacitor.Plugins || {});
            info.localNotificationsAvailable = !!(Capacitor.Plugins && Capacitor.Plugins.LocalNotifications);
        }
    } catch (e) {}
    return info;
}

export class ServicioNotificaciones {
    
    static _timeouts = [];
    static _registrado = false;
    static _notificacionesPendientes = [];
    static _inicializado = false;
    static _diagLog = [];

    static _log(msg) {
        const entry = `[${new Date().toLocaleTimeString('es-ES')}] ${msg}`;
        this._diagLog.push(entry);
        if (this._diagLog.length > 50) this._diagLog.shift();
        console.log(msg);
    }

    static getDiagnostico() {
        const info = getDiagnosticInfo();
        const ln = getLocalNotifications();
        return {
            info,
            pluginDisponible: !!ln,
            log: this._diagLog.slice(-15)
        };
    }

    static async init() {
        if (this._inicializado) return;
        this._inicializado = true;
        const info = getDiagnosticInfo();
        this._log(`📱 Diagnóstico: Capacitor=${info.capacitorDefined}, Native=${info.capacitorIsNative}, Plugins=[${info.capacitorPlugins.join(',')}], LN=${info.localNotificationsAvailable}, Android=${info.isAndroidDevice}`);
    }

    static async registrarServiceWorker() {
        await this.init();
        
        if (isAndroid()) {
            this._log('📱 Modo Android - Service Worker no necesario');
            return null;
        }

        if (!('serviceWorker' in navigator)) {
            this._log('⚠️ Service Workers no soportados');
            return null;
        }

        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js', { scope: '/' });
            this._log('✅ Service Worker registrado');
            this._registrado = true;
            return registration;
        } catch (error) {
            this._log('⚠️ Error SW: ' + error.message);
            this._registrado = false;
            return null;
        }
    }

    static async solicitarPermiso() {
        await this.init();
        
        const LocalNotifications = getLocalNotifications();
        
        if (isAndroid() && LocalNotifications) {
            this._log('📱 Solicitando permiso Android nativo...');
            try {
                const permiso = await LocalNotifications.requestPermissions();
                const granted = permiso.display === 'granted';
                this._log(granted ? '✅ Permiso Android CONCEDIDO' : '❌ Permiso Android DENEGADO');
                return granted;
            } catch (error) {
                this._log('❌ Error permiso Android: ' + error.message);
                return false;
            }
        }

        if (isAndroid() && !LocalNotifications) {
            this._log('❌ Android sin plugin - no se puede solicitar permiso');
            return false;
        }

        if (!('Notification' in window)) {
            this._log('⚠️ Notification API no disponible');
            return false;
        }

        if (Notification.permission === 'granted') return true;
        if (Notification.permission === 'denied') return false;

        try {
            const permission = await Notification.requestPermission();
            const granted = permission === 'granted';
            if (granted) await this.registrarServiceWorker();
            return granted;
        } catch (error) {
            this._log('❌ Error permiso web: ' + error.message);
            return false;
        }
    }

    static async enviarNotificacion(title, body, icon = '/icons/icon-192.png', url = '/ui/inicio/index.html') {
        await this.init();
        
        const LocalNotifications = getLocalNotifications();
        
        if (isAndroid() && LocalNotifications) {
            this._log('📱 Enviando notificación nativa Android...');
            try {
                const result = await LocalNotifications.schedule({
                    notifications: [{
                        id: Math.floor(Date.now() % 2147483647),
                        title: title || '💧 NutriHabit',
                        body: body || '¡Hora de hidratarte!',
                        sound: 'default',
                        vibrate: true
                    }]
                });
                this._log('✅ Notificación Android programada: ' + JSON.stringify(result));
                return true;
            } catch (error) {
                this._log('❌ Error notificación Android: ' + error.message);
                return false;
            }
        }

        this._log('🌐 Enviando notificación web: ' + title);
        
        if (!('Notification' in window)) {
            this._log('⚠️ Notificaciones no soportadas');
            return false;
        }

        if (Notification.permission !== 'granted') {
            const permisos = await this.solicitarPermiso();
            if (!permisos) return false;
        }

        try {
            if (this._registrado || await this.registrarServiceWorker()) {
                const registration = await navigator.serviceWorker.ready;
                await registration.showNotification(title || '💧 NutriHabit', {
                    body: body || '¡Hora de hidratarte!',
                    icon: icon,
                    badge: icon || '/icons/icon-192.png',
                    vibrate: [200, 100, 200],
                    tag: 'nutrihabit-notification-' + Date.now(),
                    requireInteraction: true,
                    data: { url: url }
                });
                this._log('✅ Notificación web enviada via SW');
                return true;
            }
        } catch (error) {
            this._log('⚠️ Error SW: ' + error.message);
        }

        try {
            new Notification(title || '💧 NutriHabit', {
                body: body || '¡Hora de hidratarte!',
                icon: icon,
                requireInteraction: true
            });
            this._log('✅ Notificación web enviada via Notification API');
            return true;
        } catch (error) {
            this._log('❌ Error notificación web: ' + error.message);
            return false;
        }
    }

    static async enviarNotificacionPrueba() {
        await this.init();
        this._log('🧪 === PRUEBA DE NOTIFICACIÓN ===');
        
        const info = getDiagnosticInfo();
        this._log('🧪 Info: ' + JSON.stringify(info));
        
        if (isAndroid() && !info.localNotificationsAvailable) {
            this._log('❌ FAIL: Android pero plugin NO disponible');
            return false;
        }
        
        const result = await this.enviarNotificacion(
            '🔔 Prueba NutriHabit',
            '¡Funciona! Si ves esta notificación, el sistema está correcto.'
        );
        this._log('🧪 Resultado prueba: ' + result);
        return result;
    }

    static async enviarRecordatorioInmediato(hora, frecuencia = 'diario') {
        await this.init();
        const mensaje = frecuencia === 'diario' ? 
            '💧 ¡Es momento de beber agua! Mantente hidratado.' :
            `💧 ¡Recordatorio! (${frecuencia})`;
        return await this.enviarNotificacion('💧 ¡Hora de hidratarte!', mensaje);
    }

    static async programarRecordatorio(hora, frecuencia = 'diario') {
        await this.init();
        
        const LocalNotifications = getLocalNotifications();
        
        if (isAndroid() && LocalNotifications) {
            this._log('📱 Programando recordatorio nativo: ' + hora);
            try {
                const [h, m] = hora.split(':').map(Number);
                const ahora = new Date();
                const fechaNotificacion = new Date();
                fechaNotificacion.setHours(h, m, 0, 0);
                
                if (fechaNotificacion <= ahora) {
                    fechaNotificacion.setDate(fechaNotificacion.getDate() + 1);
                }

                const notifId = Math.floor(1000 + Math.random() * 9000);

                await LocalNotifications.schedule({
                    notifications: [{
                        id: notifId,
                        title: '💧 ¡Hora de hidratarte!',
                        body: 'Es momento de beber agua. ¡Mantente hidratado!',
                        schedule: {
                            at: fechaNotificacion,
                            repeats: true,
                            every: 'day'
                        },
                        sound: 'default',
                        vibrate: true,
                        smallIcon: 'ic_launcher',
                        largeIcon: 'ic_launcher'
                    }]
                });
                this._log('✅ Recordatorio programado: ID=' + notifId + ', hora=' + hora + ', fecha=' + fechaNotificacion.toLocaleString());
                return true;
            } catch (error) {
                this._log('❌ Error programar Android: ' + error.message);
                return false;
            }
        }

        if (isAndroid() && !LocalNotifications) {
            this._log('❌ Android sin plugin - saltando programación');
            return false;
        }

        if (!hora) return false;

        const [h, m] = hora.split(':').map(Number);
        if (isNaN(h) || isNaN(m)) return false;

        const ahora = new Date();
        const proxima = new Date();
        proxima.setHours(h, m, 0, 0);
        if (proxima <= ahora) proxima.setDate(proxima.getDate() + 1);

        const tiempoHasta = proxima.getTime() - ahora.getTime();
        this._log('⏰ Web: programado para las ' + hora + ' (en ' + Math.round(tiempoHasta / 60000) + ' min)');

        const timeoutId = setTimeout(async () => {
            await this.enviarRecordatorioInmediato(hora, frecuencia);
            this.programarRecordatorio(hora, frecuencia);
        }, tiempoHasta);

        this._timeouts.push(timeoutId);
        this._notificacionesPendientes.push({ hora, frecuencia, minutos: Math.round(tiempoHasta / 60000) });
        return true;
    }

    static async programarRecordatoriosDesdeLista(recordatorios) {
        await this.init();
        
        const LocalNotifications = getLocalNotifications();
        
        if (!recordatorios || recordatorios.length === 0) {
            this._log('📋 No hay recordatorios para programar');
            return false;
        }

        this._log('📋 Programando ' + recordatorios.length + ' recordatorios...');

        if (isAndroid() && LocalNotifications) {
            try {
                await LocalNotifications.cancelAll();
                this._log('✅ Canceladas notificaciones anteriores');
            } catch (error) {
                this._log('⚠️ Error cancelar: ' + error.message);
            }
        }

        this._timeouts.forEach(id => clearTimeout(id));
        this._timeouts = [];
        this._notificacionesPendientes = [];

        let programados = 0;
        for (const rec of recordatorios) {
            if (rec.activo && rec.hora) {
                const programado = await this.programarRecordatorio(rec.hora, rec.frecuencia);
                if (programado) programados++;
            }
        }

        this._log('✅ ' + programados + '/' + recordatorios.length + ' programados');
        
        if (isAndroid()) {
            const pendientes = await this.obtenerPendientesAndroid();
            this._log('📱 Pendientes en sistema: ' + pendientes.length);
        }
        
        return programados > 0;
    }

    static async obtenerPendientesAndroid() {
        const LocalNotifications = getLocalNotifications();
        if (!LocalNotifications) return [];
        
        try {
            const result = await LocalNotifications.getPending();
            return result.notifications || [];
        } catch (error) {
            this._log('❌ Error getPending: ' + error.message);
            return [];
        }
    }

    static async verificarEstado() {
        await this.init();
        
        const LocalNotifications = getLocalNotifications();
        
        if (isAndroid() && LocalNotifications) {
            this._log('📱 Verificando estado Android...');
            try {
                const permiso = await LocalNotifications.checkPermissions();
                const granted = permiso.display === 'granted';
                
                let pendientes = [];
                try {
                    const result = await LocalNotifications.getPending();
                    pendientes = (result.notifications || []).map(n => ({
                        id: n.id,
                        titulo: n.title,
                        hora: n.schedule ? new Date(n.schedule.at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '--'
                    }));
                } catch (e) {
                    this._log('⚠️ Error getPending: ' + e.message);
                }
                
                this._log('📱 Estado: permiso=' + granted + ', pendientes=' + pendientes.length);
                
                return {
                    soportado: true,
                    registro: true,
                    permiso: granted,
                    worker: null,
                    pendientes: pendientes
                };
            } catch (error) {
                this._log('❌ Error verificar Android: ' + error.message);
                return { soportado: true, registro: false, permiso: false, worker: null, pendientes: [] };
            }
        }

        if (isAndroid() && !LocalNotifications) {
            this._log('❌ Android sin plugin');
            return { soportado: false, registro: false, permiso: false, worker: null, pendientes: [] };
        }

        if (!('serviceWorker' in navigator)) {
            return { soportado: false, registro: false, permiso: false };
        }

        try {
            const registro = await navigator.serviceWorker.ready;
            const permiso = Notification.permission === 'granted';
            return {
                soportado: true,
                registro: !!registro,
                permiso: permiso,
                worker: registro,
                pendientes: this._notificacionesPendientes
            };
        } catch {
            return {
                soportado: true,
                registro: false,
                permiso: Notification.permission === 'granted',
                pendientes: this._notificacionesPendientes
            };
        }
    }

    static limpiarTimeouts() {
        this._timeouts.forEach(id => clearTimeout(id));
        this._timeouts = [];
        this._notificacionesPendientes = [];
    }

    static getNotificacionesPendientes() {
        return this._notificacionesPendientes;
    }
}

ServicioNotificaciones.init();
