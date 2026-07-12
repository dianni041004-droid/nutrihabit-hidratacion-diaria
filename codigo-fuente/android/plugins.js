// android/plugins.js
// Este archivo solo se ejecuta en Android
// Importa los plugins de Capacitor

import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

console.log('📱 Plugins de Capacitor cargados en Android');

export { LocalNotifications, Capacitor };