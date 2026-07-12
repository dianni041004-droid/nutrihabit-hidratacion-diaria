// Sistema de Toasts - Notificaciones elegantes

export class ToastHelper {
    
    static mostrar(mensaje, tipo = 'success', duracion = 3000) {
        // Eliminar toast anterior si existe
        const containerExistente = document.querySelector('.toast-container');
        if (containerExistente) {
            containerExistente.remove();
        }

        // Crear contenedor
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);

        // Crear toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo}`;
        
        // Iconos SVG según tipo
        const iconos = {
            success: `<svg class="toast-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17L4 12"/></svg>`,
            error: `<svg class="toast-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>`,
            warning: `<svg class="toast-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
            info: `<svg class="toast-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`
        };

        toast.innerHTML = `
            ${iconos[tipo] || iconos.info}
            <span class="toast-mensaje">${mensaje}</span>
            <button class="toast-close">×</button>
        `;

        container.appendChild(toast);

        // Cerrar al hacer clic en la X
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });

        // Auto-cerrar después de la duración
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.opacity = '0';
                toast.style.transition = 'opacity 0.3s ease';
                setTimeout(() => {
                    toast.remove();
                }, 300);
            }
        }, duracion);
    }

    static success(mensaje) {
        this.mostrar(mensaje, 'success');
    }

    static error(mensaje) {
        this.mostrar(mensaje, 'error');
    }

    static warning(mensaje) {
        this.mostrar(mensaje, 'warning');
    }

    static info(mensaje) {
        this.mostrar(mensaje, 'info');
    }
}