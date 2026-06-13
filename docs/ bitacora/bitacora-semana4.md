# Bitácora de Cambios – Semana 4

**Proyecto:** NutriHabit: Seguimiento de Hidratación Diaria

## Sesión de Trabajo 1

**Fecha:** 11/06/2026

### Actividades realizadas

* Análisis de las historias de usuario para identificar las entidades principales de la base de datos.
* Diseño del modelo de datos utilizando Firebase Firestore.
* Definición de las colecciones: Usuarios, RegistroHidratacion, MetaHidratacion, Recordatorio, Progreso, Estadistica y Notificacion.
* Elaboración del Diagrama Entidad-Relación (DER).
* Creación del diccionario de datos y definición de los atributos de cada entidad.
* Aplicación de las reglas de normalización (1FN, 2FN y 3FN).

### Problemas encontrados

* Dificultad para definir las relaciones entre algunas entidades y determinar cuáles debían almacenarse de forma independiente en Firestore.
* Ajustes en la estructura inicial para evitar redundancia de datos.

### Decisiones tomadas

* Utilizar Firebase Firestore como base de datos NoSQL remota.
* Mantener una estructura de colecciones separadas para facilitar la escalabilidad y el mantenimiento del sistema.
* Relacionar las colecciones mediante el identificador único del usuario.

### Commit realizado

* Diseño de la base de datos en Firebase Firestore.
* Creación de colecciones y estructura inicial de datos.
* Elaboración del Diagrama Entidad-Relación (DER).

---

## Sesión de Trabajo 2

**Fecha:** 10/06/2026

### Actividades realizadas

* Desarrollo del prototipo navegable del sistema.
* Implementación de las pantallas Inicio, Historial, Metas, Perfil y Registrar Consumo.
* Configuración de la navegación entre pantallas.
* Integración conceptual entre las pantallas y las entidades definidas en la base de datos.
* Organización de la estructura de carpetas del proyecto.
* Actualización del repositorio y de la documentación de la Semana 4.

### Problemas encontrados

* Ajuste de la navegación para mantener coherencia entre las pantallas y las entidades de la base de datos.
* Organización de la documentación para cumplir con los requisitos de la entrega.

### Decisiones tomadas

* Mantener una estructura modular para separar documentación, diagramas y recursos del proyecto.
* Utilizar componentes reutilizables para facilitar futuras mejoras del prototipo.
* Documentar cada avance en el repositorio para mantener trazabilidad del desarrollo.

### Commit realizado

* Desarrollo del prototipo navegable.
* Implementación de pantallas principales.
* Organización de la documentación del proyecto.
* Actualización de la ficha de trabajo de la Semana 4.
