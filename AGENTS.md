# Reglas para Agentes de IA en Barrabox Gym

Este archivo contiene las directrices principales que deben seguir todos los agentes que colaboren en este repositorio.

## 🔴 REGLA CRÍTICA UNIVERSAL

**Todo agente que modifique el estado de este proyecto (código, configuración o arquitectura) DEBE, sin excepción, actualizar el archivo `ESTADO_PROYECTO.md` detallando el tipo de cambio, los archivos modificados y la fecha en la sección de "Registro de Modificaciones Recientes".**

- `ESTADO_PROYECTO.md` es la única fuente de verdad rápida sobre dónde se encuentra el proyecto. Antes de hacer cambios o continuar una tarea, debes leer ese archivo.
- Al terminar tu turno de modificaciones, o al lograr un hito, registra lo realizado ahí.

## Flujo de Trabajo del Agente

1. **Leer Contexto**: Comienza siempre revisando `ESTADO_PROYECTO.md` y `PROYECTO_COMPLETO.md`.
2. **Implementación Precisa**: Asegurarse que cualquier cambio esté alineado con la arquitectura Frontend-Only / `localStorage` actual del proyecto, a menos que el usuario explicitly pida migrar a backend.
3. **Mantenimiento**: Limpiarse después del trabajo, borrar logs excesivos (o comentarlos) para asegurar que la app sigue lista para producción / demo final.
4. **Actualizar Registro**: Registrar el trabajo en `ESTADO_PROYECTO.md`.
