# Bitácora de Desarrollo – Semana 5

## Proyecto: NutriHabit – Seguimiento de Hidratación Diaria

### Objetivo de la semana

Implementar el primer incremento funcional de la aplicación, conectando las pantallas con una base de datos real mediante Firebase Firestore y desarrollando una funcionalidad CRUD completa para el registro y seguimiento del consumo de agua.

---

## Sesión de Trabajo 1

**Fecha:** 09/06/2026

### Actividades realizadas

* Configuración y validación de la conexión con Firebase Firestore.
* Creación de la colección `registro_hidratacion`.
* Implementación de la funcionalidad de registro de consumo de agua (CREATE).
* Diseño del formulario de registro con validaciones básicas.
* Pruebas iniciales de almacenamiento de datos en la nube.

### Problemas encontrados

* Dificultades iniciales para sincronizar la aplicación con Firestore.
* Errores de configuración en las credenciales del proyecto Firebase.

### Soluciones aplicadas

* Revisión de la configuración del proyecto Firebase.
* Verificación de permisos de lectura y escritura en Firestore.
* Corrección de parámetros de conexión.

### Resultado

Los registros de consumo comenzaron a almacenarse correctamente en la base de datos.

### Commits realizados

* feat(firebase): configuración inicial de Firestore
* feat(registro): implementación de registro de consumo

---

## Sesión de Trabajo 2

**Fecha:** 11/06/2026

### Actividades realizadas

* Desarrollo de la pantalla Historial.
* Implementación de consulta de registros desde Firestore (READ).
* Implementación de edición de registros (UPDATE).
* Implementación de eliminación de registros (DELETE).
* Integración de filtros para visualizar registros del día o historial completo.

### Problemas encontrados

* Los cambios realizados en los registros no se reflejaban inmediatamente en la interfaz.
* Algunos registros permanecían visibles después de ser eliminados.

### Soluciones aplicadas

* Recarga automática de datos después de cada operación CRUD.
* Actualización dinámica de la interfaz de usuario.

### Resultado

Se completó el CRUD funcional para los registros de hidratación.

### Commits realizados

* feat(historial): lectura de registros desde Firestore
* feat(historial): edición de consumos registrados
* feat(historial): eliminación de registros
* fix(historial): actualización automática de datos

---

## Sesión de Trabajo 3

**Fecha:** 13/06/2026

### Actividades realizadas

* Implementación y prueba de la configuración de metas diarias.
* Integración del Dashboard con datos reales provenientes de Firestore.
* Desarrollo del resumen semanal y estadísticas de consumo.
* Aplicación de validaciones avanzadas en formularios.
* Revisión técnica por pares y corrección de errores reportados.
* Elaboración de documentación y evidencias para la entrega.

### Problemas encontrados

* La meta diaria no se actualizaba correctamente en el Dashboard.
* Errores ocasionados por elementos nulos en el DOM.

### Soluciones aplicadas

* Implementación de actualización automática de metas.
* Validaciones previas antes de acceder a elementos del DOM.
* Optimización de la carga de datos y manejo de errores.

### Resultado

Se obtuvo un primer incremento funcional estable, con operaciones CRUD completas y conexión exitosa entre interfaz y base de datos.

### Commits realizados

* feat(meta): actualización de meta diaria
* feat(dashboard): integración de progreso diario y semanal
* fix(validaciones): corrección de formularios
* fix(dashboard): actualización automática de estadísticas
* docs(week5): documentación del primer incremento funcional

---

## Resumen de la Semana

### Funcionalidades completadas

Registro de consumo de agua (CREATE)

  Consulta de historial y estadísticas (READ)

 Edición de registros de consumo (UPDATE)

 Eliminación de registros (DELETE)

 Configuración de metas diarias

 Dashboard conectado a datos reales

 Resumen semanal con estadísticas

 Validaciones de formularios

 Revisión técnica por pares

### Estado del proyecto

El primer incremento funcional fue completado satisfactoriamente. La aplicación NutriHabit cuenta con una funcionalidad CRUD completa conectada a Firebase Firestore, permitiendo registrar, consultar, actualizar y eliminar datos de hidratación en tiempo real.
