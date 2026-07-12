// Utilidades y Helpers

// Formatear fecha
export function formatearFecha(fecha) {
    if (!fecha) return '--';
    const partes = fecha.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// Formatear hora
export function formatearHora(hora) {
    if (!hora) return '--:--';
    return hora;
}

// Calcular porcentaje
export function calcularPorcentaje(valor, total) {
    if (total === 0) return 0;
    return Math.min((valor / total) * 100, 100);
}

// Validar email
export function esEmailValido(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Obtener días de la semana
export function obtenerDiasSemana() {
    return ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
}

// Obtener fecha de inicio de semana
export function obtenerInicioSemana(fecha) {
    const fechaObj = new Date(fecha);
    const diaSemana = fechaObj.getDay();
    const diffLunes = diaSemana === 0 ? 6 : diaSemana - 1;
    const lunes = new Date(fechaObj);
    lunes.setDate(fechaObj.getDate() - diffLunes);
    return lunes;
}

// Obtener fecha actual en formato YYYY-MM-DD (hora LOCAL, no UTC)
export function obtenerFechaActual() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Parsear una fecha YYYY-MM-DD como hora LOCAL (no UTC)
export function parsearFechaLocal(fechaStr) {
    if (!fechaStr) return null;
    const partes = fechaStr.split('T')[0].split('-');
    if (partes.length !== 3) return null;
    return new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
}

// Obtener hora actual en formato HH:MM
export function obtenerHoraActual() {
    return new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}