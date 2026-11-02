# Mi plan

App instalable (PWA) con el plan semanal de Joan: horario de 1º de Arquitectura (ULPGC, grupo 02), tareas del día, calendario y plan de sueño. Se publica con GitHub Pages y se instala en el iPhone desde Safari con "Añadir a pantalla de inicio".

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | La app entera (HTML, CSS y JS en un solo archivo) |
| `plan.json` | **El plan**: horario, rutina, fechas clave, tareas por día, escalera de sueño |
| `progress.json` | Lo que escribe la app: tareas hechas (`done`), notas por asignatura (`notes`) y agenda (`agenda`) |
| `sw.js` | Service worker: hace que funcione sin conexión |
| `manifest.webmanifest`, iconos `*.png` | Nombre e icono de la app |

## Cómo se sincroniza

- La app lee `plan.json`. Con la clave configurada lo lee de la API de GitHub, así que un cambio aparece al volver a abrir la app. Sin clave lo lee de GitHub Pages, con un par de minutos de retraso.
- Cuando Joan marca una tarea, se guarda en el móvil y, a los pocos segundos, se fusiona con `progress.json` en el repo.
- La clave (fine-grained token) solo tiene acceso a este repositorio y se guarda solo en el móvil.

## Para Claude: cómo editar el plan

Cuando Joan pida cambios ("mueve lo de Física al jueves", "añade la entrega de Sistemas del 3 de diciembre"):

1. Edita solo `plan.json`. No toques `index.html` salvo que Joan pida cambiar la app.
2. Las tareas van en `tasks["AAAA-MM-DD"]` como `{"id": "...", "text": "...", "type": ""}`.
   - `type`: `""` normal, `"exam"`, `"deadline"` o `"lab"`. La primera tarea normal del día se muestra como **Tarea A**: pon delante la más importante.
   - **Los `id` deben ser únicos y no cambiar nunca**, porque `progress.json` marca las tareas por `id`. Para mover una tarea a otro día, mueve el objeto entero con su mismo `id`. Para una tarea nueva, usa un id nuevo (p. ej. `261203a`, o `261203x` si ya existe).
   - Tareas concretas y pequeñas ("Física: tema 3, problemas 1–5"), máximo 2–3 por día.
3. Fechas importantes (exámenes, entregas): `key_dates["AAAA-MM-DD"] = {"type": "exam"|"deadline", "label": "..."}`. Salen como cuenta atrás arriba.
4. Prácticas de laboratorio: `lab_dates` (cambian la tarde de ese día).
5. Horario de clases: `classes["1".."5"]` (1 = lunes), `[asignatura, inicio, fin]`, asignaturas en `subjects`.
6. Actualiza `updated` con la fecha del cambio.
7. Para ver cómo va Joan, lee `progress.json`: `done[id].v = 1` está hecha, `0` desmarcada. Cruza los `id` con `plan.json`.
8. Sube los cambios a `main` con un mensaje claro.

## Para Claude: notas y agenda de Joan

En `progress.json` (lo escribe la app; si lo editas, respeta el formato y sube `t` a la hora actual en ms):

- `notes[id] = {"s": "mates", "text": "...", "d": "AAAA-MM-DD", "c": "HH:MM", "t": ms, "del": 0|1}`: lo que están dando en cada asignatura.
- `agenda[id] = {"text": "...", "date": "AAAA-MM-DD" o "", "done": 0|1, "c": ..., "t": ms, "del": 0|1}`: cosas sueltas tipo agenda.
- Los borrados se marcan con `del: 1`; no elimines claves, para que la sincronización no las resucite.

## Rutina (`plan.json` → `routine`)

Bus 07:45 (sale de casa 07:35), `bus_trip_min` = minutos de bus + andar (por confirmar), comer en la uni y biblio hasta `biblio_end`, cena fija a `dinner`, correr `run_weekdays` al llegar a casa y sábado por la mañana, repaso fijo los viernes en `friday_repaso`.
