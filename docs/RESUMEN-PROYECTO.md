# NutriHabit - Resumen del Proyecto

## Ficha Técnica

| Campo | Detalle |
|---|---|
| **Nombre** | NutriHabit - Hidratación Diaria |
| **Autora** | Dianni Paredes Tavarez |
| **Institución** | Universidad Abierta para Adultos (UAPA) |
| **Materia** | Seminario de Proyecto II |
| **Año** | 2026 |
| **Plataforma** | Android (Capacitor 8.x + WebView) |
| **Backend** | Firebase (Authentication + Firestore) |
| **Arquitectura** | MVVM (Model-View-ViewModel) |
| **Paquete** | com.nutrihabit.app |

---

## Descripción del Problema

La deshidratación es un problema de salud pública que afecta a millones de personas diariamente. Muchos usuarios no tienen una herramienta sencilla y accesible para registrar, monitorear y mantener un hábito de consumo adecuado de agua. La falta de recordatorios personalizados y seguimiento visual del progreso dificulta la consolidación de este hábito esencial para la salud.

---

## Objetivos

**General:** Desarrollar una aplicación móvil que permita a los usuarios registrar su consumo diario de agua, establecer metas personalizadas y recibir recordatorios para mantener una hidratación adecuada.

**Específicos:**
- Registrar consumos de agua con cantidad, fecha, hora y notas.
- Visualizar progreso diario y semanal con gráficas.
- Configurar metas de hidratación personalizadas.
- Programar recordatorios con notificaciones nativas.
- Gestionar un perfil de usuario con estadísticas de consumo.

---

## Alcance

La aplicación incluye 8 pantallas funcionales:
1. **Bienvenida** - Landing page con acceso a login/registro
2. **Inicio de sesión** - Autenticación con email y contraseña
3. **Registro** - Creación de cuenta con validaciones
4. **Dashboard** - Progreso diario, metas y resumen semanal con gráfica de barras
5. **Registrar consumo** - Formulario con cantidades rápidas (250, 500, 750, 1000 ml)
6. **Historial** - Lista de registros con filtros (hoy/todas) y opciones de editar/eliminar
7. **Metas** - Configuración de meta diaria con opciones predefinidas
8. **Recordatorios** - Gestión de alarmas con frecuencia (diario, lunes-viernes, fines de semana)
9. **Perfil** - Datos del usuario, estadísticas, toggle de notificaciones y cerrar sesión

---

## Tecnologías Utilizadas

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend | HTML5, CSS3, JavaScript (ES Modules) | - |
| Framework nativo | Capacitor | 8.x |
| Backend/Auth | Firebase Authentication | 10.8.0 |
| Base de datos | Cloud Firestore | 10.8.0 |
| Notificaciones | Capacitor Local Notifications | 8.2.0 |
| Diseño UI | CSS personalizado (sistema de diseño) | - |
| Fuente tipográfica | Inter (Google Fonts) | 400-800 |
| SDK Firebase | CDN (import maps, sin bundler) | 10.8.0 |

---

## Arquitectura del Sistema (MVVM)

```
┌─────────────────────────────────────────────┐
│                    VISTA                     │
│  HTML + CSS (pantallas, navegación, UI)     │
└─────────────────┬───────────────────────────┘
                  │ observa / llama
┌─────────────────▼───────────────────────────┐
│               VIEWMODEL                      │
│  Lógica de negocio, estado, validaciones     │
│  (InicioVM, LoginVM, RegistroVM, etc.)      │
└─────────────────┬───────────────────────────┘
                  │ consulta / modifica
┌─────────────────▼───────────────────────────┐
│              REPOSITORIO                     │
│  Capa de abstracción sobre servicios        │
│  (R Usuarios, R Agua, R Recordatorios)      │
└─────────────────┬───────────────────────────┘
                  │ delega
┌─────────────────▼───────────────────────────┐
│               SERVICIO                       │
│  Conexión directa a Firebase Firestore       │
│  (ServicioFirebase.js, ServicioNotificaciones)│
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│              MODELO                           │
│  Usuario, RegistroAgua, Meta, Recordatorio   │
└─────────────────────────────────────────────┘
```

**Separación de responsabilidades:**
- **Modelos** (4): Definen la estructura de datos (`Usuario`, `RegistroAgua`, `Meta`, `Recordatorio`)
- **Repositorios** (4): Acceso abstracto a Firebase por colección
- **ViewModels** (7): Lógica de negocio, validaciones, estado reactivo
- **Vistas** (9 pantallas HTML): Interfaz de usuario con binding directo al ViewModel

---

## Modelo de Datos (Firestore)

### Colecciones

| Colección | Documentos | Campos principales |
|---|---|---|
| `usuarios` | 1 por usuario | uid, nombre, correo, metaDiaria (2500ml), notificacionesActivas, fechaRegistro |
| `registro_hidratacion` | N por usuario | idUsuario, cantidadML, fecha (YYYY-MM-DD), hora, fechaHora, nota, editado |
| `recordatorios` | N por usuario | idUsuario, hora (HH:MM), frecuencia (diario/lunes-viernes/fines-semana), activo, fechaCreacion |

### Diccionario de Datos

| Entidad | Atributo | Tipo | Descripción |
|---|---|---|---|
| Usuario | uid | string | Identificador único de Firebase Auth |
| Usuario | nombre | string | Nombre completo del usuario |
| Usuario | correo | string | Correo electrónico |
| Usuario | metaDiaria | number | Meta en mililitros (500-10000, default: 2500) |
| Usuario | notificacionesActivas | boolean | Estado del toggle de notificaciones |
| Registro | cantidadML | number | Cantidad consumida en ml (1-5000) |
| Registro | fecha | string | Fecha local YYYY-MM-DD |
| Registro | hora | string | Hora local HH:MM |
| Registro | nota | string | Observación opcional |
| Recordatorio | hora | string | Hora programada HH:MM |
| Recordatorio | frecuencia | string | diario, lunes-viernes, fines-semana |
| Recordatorio | activo | boolean | Si el recordatorio está habilitado |

---

## Decisiones de Diseño

1. **Sin bundler (Vite/Webpack):** Se optó por import maps nativos del navegador para cargar Firebase SDK vía CDN, reduciendo la complejidad de build.
2. **Capacitor sobre Cordova:** Mejor soporte para WebView moderno, plugins nativos y sincronización `npx cap sync android`.
3. **Notificaciones unificadas:** Un solo `ServicioNotificaciones.js` detecta la plataforma (Android/Web) y usa el mecanismo apropiado (plugin nativo o Service Worker).
4. **Fechas locales:** Se corrigió el manejo de zonas horarias usando `getMonth()`, `getDate()` en lugar de `toISOString()` para evitar desfases UTC.
5. **CSS sin framework:** Sistema de diseño propio con variables CSS, glassmorphism, animaciones y responsive design.
6. **IDs numéricos para Android:** Los IDs de notificación se limitan a `< 2^31 - 1` por restricción de Java `int`.

---

## Plan de Pruebas (8 Casos)

| # | Caso | Entrada | Resultado esperado |
|---|---|---|---|
| 1 | Registro de usuario nuevo | email + password + nombre | Cuenta creada, redirige al dashboard |
| 2 | Inicio de sesión válido | email + password correctos | Acceso al dashboard con datos del usuario |
| 3 | Registro de consumo de agua | Cantidad: 500ml | Registro guardado en Firestore, progreso actualizado |
| 4 | Edición de consumo | Cambiar 500ml a 750ml | Registro modificado, badge "editado" visible |
| 5 | Eliminación de consumo | Eliminar registro | Registro eliminado, lista actualizada |
| 6 | Actualización de meta diaria | Cambiar a 3000ml | Meta actualizada en dashboard y perfil |
| 7 | Creación de recordatorio | Hora: 10:00, frecuencia: diario | Recordatorio guardado, notificación programada |
| 8 | Notificación nativa Android | Botón "Probar notificación" | Notificación push aparece en el dispositivo |

---

## Resultados de Pruebas

| # | Caso | Estado | Observación |
|---|---|---|---|
| 1 | Registro | ✅ Pass | Creación exitosa en Firebase Auth + Firestore |
| 2 | Login | ✅ Pass | Autenticación correcta con redirección |
| 3 | Registro consumo | ✅ Pass | CRUD completo funcional |
| 4 | Edición | ✅ Pass | Actualización inmediata con indicador |
| 5 | Eliminación | ✅ Pass | Borrado confirmado con diálogo |
| 6 | Meta diaria | ✅ Pass | Propagación al dashboard y perfil |
| 7 | Recordatorio | ✅ Pass | Persistencia en Firestore |
| 8 | Notificación Android | ✅ Pass | Plugin LocalNotifications funcional (corregido ID Java int) |

---

## Conclusiones

NutriHabit demuestra que es posible desarrollar una aplicación móvil completa y funcional utilizando tecnologías web (HTML/CSS/JS) combinadas con Capacitor para despliegue nativo en Android. La arquitectura MVVM permitió una separación clara de responsabilidades, facilitando el mantenimiento y la escalabilidad del código. La integración con Firebase proporcionó un backend robusto sin necesidad de servidores propios. El mayor desafío técnico fue el manejo de notificaciones locales en Android, resuelto mediante la corrección del rango de IDs numéricos para compatibilidad con Java.

---

## Referencias APA 7

1. Firebase. (2024). *Firebase Documentation: Cloud Firestore*. https://firebase.google.com/docs/firestore

2. Firebase. (2024). *Firebase Documentation: Authentication*. https://firebase.google.com/docs/auth

3. Capacitor. (2024). *Capacitor Documentation: Local Notifications*. https://capacitorjs.com/docs/apis/local-notifications

4. Capacitor. (2024). *Capacitor Documentation: Getting Started*. https://capacitorjs.com/docs/getting-started

5. Google Fonts. (2024). *Inter Font Family*. https://fonts.google.com/specimen/Inter

6. Mozilla Developer Network. (2024). *Web Notifications API*. https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API

7. World Health Organization. (2023). *Guidelines on drinking-water quality*. WHO Press.

8. Mozilla Developer Network. (2024). *Service Worker API*. https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API

9. Google. (2024). *Import Maps*. https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap

10. Android Developers. (2024). *POST_NOTIFICATIONS Permission*. https://developer.android.com/reference/android/Manifest.permission#POST_NOTIFICATIONS

---

## Manual de Usuario

### 1. Registro
1. Abre la app y toca **"Registrarse"**
2. Ingresa tu nombre, correo y contraseña (mínimo 6 caracteres)
3. Confirma la contraseña
4. Toca **"Crear cuenta"**

### 2. Inicio de sesión
1. Ingresa tu correo y contraseña
2. Toca **"Iniciar sesión"**

### 3. Registrar consumo de agua
1. En el Dashboard, toca **"Registrar consumo"**
2. Selecciona una cantidad rápida (250, 500, 750, 1000 ml) o escribe una personalizada
3. Opcionalmente agrega una nota
4. Toca **"Guardar registro"**

### 4. Ver historial
1. Toca **"Historial"** en la barra inferior
2. Usa los filtros **"Todas"** o **"Hoy"**
3. Para editar: toca **"Editar"** y modifica la cantidad
4. Para eliminar: toca **"Eliminar"** y confirma

### 5. Configurar meta diaria
1. Toca **"Metas"** en la barra inferior
2. Selecciona una meta predefinida (2000, 2500, 3000 ml) o escribe una personalizada
3. Toca **"Actualizar meta"**

### 6. Crear recordatorio
1. Toca **"Recordatorios"** en la barra inferior
2. Selecciona la hora deseada
3. Elige la frecuencia: Todos los días, Lunes a Viernes, Fines de semana
4. Toca **"Agregar recordatorio"**

### 7. Perfil y configuración
1. Toca **"Perfil"** en la barra inferior
2. Edita tu nombre o correo y guarda los cambios
3. Activa/desactiva notificaciones con el toggle
4. Para cerrar sesión, toca **"Cerrar sesión"**
