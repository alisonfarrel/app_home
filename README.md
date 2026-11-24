# Nuestro Hogar v9.1 — actualización de sincronización y protección de datos

Cambios:
- Fuerza recarga de config.js, app.js, styles.css y service worker mediante versiones 9.1.
- La primera vez que arranca esta versión preserva una copia del estado local en `localStorage` con la clave `nuestro_hogar_backup_pre_firebase_v91`, antes de que Firebase pueda sustituir los datos locales.
- **Ajustes > Proteger tus datos > Descargar copia local (.json)** permite guardar esa copia en Archivos.
- NO importa ni fusiona automáticamente copias antiguas en la nube: no debe sobrescribirse el documento de Firebase sin verificar primero su contenido y conservar ambos dispositivos.

## Procedimiento seguro
1. Publica todos los archivos de esta versión en GitHub Pages (mantén `config.js` con TU configuración real de Firebase, porque en el ZIP se entrega como `null`).
2. Antes de borrar nada en cualquiera de los iPhone, abre la PWA en su sesión habitual. La actualización crea el respaldo automáticamente, incluso si empieza sesión con Firebase.
3. En Ajustes, pulsa Descargar copia local (.json) en cada dispositivo y guarda los archivos con nombres diferenciados. Comprueba que se hayan guardado.
4. Entra con la MISMA cuenta de Firebase desde ambos teléfonos y confirma Ajustes > Almacenamiento: Firebase sincronizado.
5. Verifica la sincronización con una tarea de prueba. No importes todavía los dos respaldos: podrían contener datos distintos. Revisa qué tareas personalizadas necesitas recuperar antes de cualquier fusión.

**Importante:** al actualizar GitHub, conserva el `config.js` que funciona actualmente, o pega de nuevo tu configuración real. No borres Safari ni desinstales la aplicación hasta tener y revisar ambas copias.

---

# Nuestro Hogar v9.0 — Más alegre y divertido

Esta actualización visual mantiene el modelo de datos y todas las reglas de la v8.0.

## Cambios de la interfaz

- Colores más vivos (menta, coral, lavanda y amarillo suave), con tarjetas, navegación e iconos renovados.
- Pantalla «Hoy»: mini misión personal y barra de progreso que refleja tareas resueltas sobre las tareas del día y pendientes anteriores.
- Iconos de categoría en cada tarea y mensajes positivos cuando se termina el día.
- Pequeña animación de celebración al completar tareas a tiempo; respeta la preferencia de movimiento reducido.
- Marcador de puntos y desglose intactos, reparto por minutos intacto, sin recompensas nuevas ni alteraciones de puntuación.

## Cómo actualizar

Sube todos los archivos a tu repositorio GitHub Pages, incluido `sw.js`. Comprueba en la cabecera **v9.0**. Si el iPhone muestra una versión anterior, espera a que termine el despliegue, cierra y abre la PWA. No borres los datos del sitio en modo local. La sincronización entre teléfonos sigue requiriendo Firebase.

---

# Nuestro Hogar v8.0 — Rediseño visual

Esta versión renueva la estética de toda la aplicación: paleta verde salvia y crema, tarjetas más claras, marcador de puntos destacado, tipografía y espaciados consistentes, navegación inferior con iconos vectoriales, mejoras en formularios, lista de compra y semana global, y ajustes para pantallas pequeñas y accesibilidad.

**No cambia** el modelo de datos ni la lógica de tareas, recurrencias, puntuación, retrasos o sincronización. Para actualizar, reemplaza los archivos existentes, incluido `sw.js`. Comprueba que aparezca **v8.0** en la cabecera. No borres los datos locales de Safari.

---

# Nuestro Hogar v7.1 — desglose de puntos

Novedad: en la primera pestaña **Hoy**, debajo de los puntos de Alicia y José, pulsa **Ver desglose e historial de puntos** para consultar: tareas completadas a tiempo (+1), retrasos (−1), reasignaciones (−1), total individual e historial de movimientos con tarea, persona, fecha y variación. Se muestran hasta 40 movimientos recientes.

El marcador se recalcula desde los datos de tareas y reasignaciones; no se duplican puntos. Una tarea vencida resta una vez, incluso si permanece varios días pendiente. Las tareas omitidas no puntúan.

La aplicación sigue usando datos locales o Firebase según la configuración existente. Para actualizar GitHub Pages reemplaza todos los archivos de la versión anterior, incluido `sw.js`; comprueba que la cabecera diga **v7.1**. No borres almacenamiento local: podrías perder datos si aún no has conectado Firebase.

---

# Nuestro Hogar v7.0 — actualización

- **Hoy**: marcador de puntos de Alicia y José en la parte superior, justo después del selector de persona y antes de las tareas pendientes. Los puntos son independientes de los minutos de trabajo.
- **Semana global** sustituye a la antigua pestaña **Semana**. Mantiene la navegación por semanas, los 7 días, las dos columnas por persona y el reparto semanal por tiempo.
- **Tareas → Editar → Semanal**: el campo **Veces por semana** permite de 1 a 7 días. Cada repetición tiene su propio día y responsable. Los días no se pueden duplicar dentro de la misma tarea; si se eligen días repetidos aparece un aviso. Cada ocurrencia es independiente.
- Las tareas existentes se mantienen; no se combinan automáticamente tareas duplicadas, porque podría perderse su historial. Puedes fusionarlas manualmente en una sola tarea con varios días y archivar las anteriores.
- Se conservan la lista de la compra, el historial, las eliminaciones, los recordatorios existentes y las reglas de recompensas.

## Actualización en GitHub Pages

Sustituye todos los archivos del repositorio, incluido `sw.js`, y comprueba que la web indique **v7.0** en la cabecera. No borres los datos locales.

---

## Eliminar una tarea

En **Tareas** pulsa **Eliminar** junto a la tarea, o abre **Editar → Eliminar definitivamente**. Debes confirmar el borrado. Se eliminan el modelo y todas sus repeticiones (pasadas y futuras), registros de finalización, eventos de reasignación y efectos en la puntuación. Es irreversible. Si quieres mantener historial y detener repeticiones futuras, utiliza **Archivar**. Si borras una tarea de cocina vinculada a recogida, se conserva la otra tarea pero ya no quedan vinculadas. Para cancelar solo una fecha, abre las opciones de la repetición y usa **Omitir esta repetición**.

## Versión 6.2 — comprobar que la actualización se ve

En la cabecera de la aplicación debe aparecer **Alicia & José · v6.2**. Si no aparece, sigues usando una versión antigua. Para actualizar GitHub Pages, reemplaza **todos** los archivos del repositorio (incluyendo index.html, app.js, styles.css y sw.js), haz commit en main y comprueba que el despliegue de GitHub Actions termina correctamente. Vuelve a abrir la web en Safari; si usas el icono instalado en la pantalla de inicio, ciérralo y ábrelo después del despliegue. No borres datos del sitio ni desinstales la app para intentar actualizar: el modo local puede perder los datos.

Ruta: **Tareas → Editar** una tarea → **Repetición: Semanal** → **Veces por semana**. Elige 1, 2 o 3 y selecciona **Día** y **Responsable** para cada repetición. Pulsa **Guardar cambios**. La vista **Semana global** refleja el nuevo reparto.

---

# Nuestro Hogar — Alicia y José

Aplicación web instalable (PWA) para iPhone, **sin compilación ni dependencias npm**.

## Funciones incluidas

- Selector de perfil **Alicia / José**.
- Mis tareas de hoy, pendientes y días de retraso.
- Planning semanal navegable (por día y responsable).
- Listado global: crear, editar, archivar, eliminar definitivamente, cambiar periodicidad o responsable.
- Reasignación de una repetición concreta. Las tareas de cocina y recogida enlazadas conservan la regla «quien cocina no recoge».
- Repeticiones independientes, incluyendo tareas diarias, semanales, mensuales, anuales, puntuales y según necesidad.
- Completar/desmarcar/omitir tareas. Las tareas no hechas arrastran su pendiente a los días siguientes.
- Campo **tiempo activo estimado (minutos)** editable en cada tarea. Por ejemplo: limpiar un baño 30 min, poner una lavadora 5 min, recogerla/tender/doblar 15 min. No cuenta el ciclo automático. Las tareas anteriores se migran a minutos orientativos sin borrar el historial y el tiempo completado queda registrado. Los minutos no afectan a los puntos de recompensa.
- Pestaña **Semana global**: los siete días de la semana, en dos columnas Alicia / José, con todas las tareas, estado y marcado directo de tareas. Incluye reparto semanal por minutos activos, total realizado y pendiente por persona, atrasos arrastrados de semanas anteriores y marcador de puntos desplegable. Permite navegar entre semanas.
- Puntuación: **+1** por completar a tiempo, **−1** por incumplir el plazo y **−1** por ceder una tarea a otro usuario. La penalización por retraso se aplica una sola vez por repetición. Omisiones explícitas no puntúan.
- Lista de compra compartida (cuando se configura Firebase).
- Recordatorios dentro de la app; notificaciones del navegador cuando la app está abierta y se autoriza.
- Planning preconfigurado con las tareas acordadas para Alicia y José. No se programan comidas del viernes noche ni sábado y domingo.

## 1. Probar la app gratis en un ordenador

Para abrirla, basta con un servidor web estático (no requiere instalar módulos):

```sh
cd nuestro-hogar
python3 -m http.server 8080
```

Entrar en http://localhost:8080.

Por defecto la app funciona **en modo local**: datos guardados solo en ese navegador. Es útil para probarla, pero **no sincroniza dos iPhone**.

## 2. Publicarla con GitHub Pages (gratuito)

1. Crear un repositorio **público** en GitHub; por ejemplo `nuestro-hogar`.
2. Subir **todos** los archivos del proyecto (mantener `.github/workflows/deploy.yml`).
3. Publicar en la rama `main`.
4. Ir a **Settings → Pages** y seleccionar **GitHub Actions** como fuente de publicación.
5. Ir a la pestaña **Actions** y ejecutar, si hace falta, la acción «Publicar GitHub Pages».
6. Abrir `https://TU-USUARIO.github.io/nuestro-hogar/` (la URL concreta figura en Settings → Pages).

GitHub Pages aloja la aplicación, **pero no guarda datos compartidos**. Para ello hay que completar el paso siguiente.

## 3. Sincronizar Alicia y José con Firebase (plan Spark gratuito)

1. Abrir https://console.firebase.google.com/ y crear un proyecto.
2. Añadir una **aplicación web** dentro del proyecto y copiar su objeto de configuración.
3. En **Authentication → Sign-in method**, activar **Correo electrónico/contraseña**.
4. En **Authentication → Users**, crear **una única cuenta compartida** con un correo y contraseña propios para esta aplicación.
5. En **Firestore Database**, crear una base de datos en modo producción.
6. En **Firestore Database → Rules**, pegar el contenido exacto de `firestore.rules` y publicarlo. Las reglas restringen acceso al propietario autenticado.
7. Editar `config.js` sustituyendo `null` por el objeto de configuración web de Firebase. Ejemplo:

```js
window.HOGAR_FIREBASE_CONFIG = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  appId: "TU_APP_ID"
};
```

8. Guardar y subir ese archivo al repositorio. **No es una contraseña**: las claves de configuración web de Firebase son públicas. No subir nunca la contraseña compartida ni claves de cuentas de servicio.
9. Entrar en la app desde ambos teléfonos con **el mismo correo y contraseña**; después, cada persona usa su selector Alicia/José.

**Importante:** mientras no haya `config.js` válido, la app opera solo localmente. Al activar Firebase por primera vez, se crea un planning inicial en la nube; los cambios previos del modo local **no se migran automáticamente**. Configura Firebase antes de empezar a usarla en serio.

El acceso compartido se ha implementado por petición expresa. Cambiar el selector de perfil no constituye autenticación distinta; quien posea la contraseña puede ver y modificar los datos de ambos perfiles.

## 4. Instalar en iPhone

1. Abrir la URL de GitHub Pages **con Safari**.
2. Pulsar Compartir.
3. Elegir «Añadir a pantalla de inicio» (el nombre puede variar según la versión de iOS).
4. Repetir en el otro iPhone.

La app funciona también en el navegador de escritorio. La instalación en la pantalla de inicio no requiere cuenta Apple Developer ni App Store.

## 5. Cómo funcionan puntos y atrasos

- Cada tarea programada tiene un identificador de repetición propio: `id_de_tarea@fecha`.
- Una repetición pendiente de ayer sigue apareciendo hoy y muestra los días transcurridos desde su vencimiento.
- No se cuenta más de una penalización por retraso en la misma repetición.
- Completar fuera de plazo **no suma** punto, pero mantiene la penalización del retraso.
- Una reasignación resta un punto a la persona que cedió esa repetición, aunque la otra persona la complete puntualmente.
- Una tarea omitida explícitamente no se penaliza ni recompensa. Su uso debe ser excepcional para evitar que el marcador pierda sentido.
- Al editar la frecuencia de una plantilla, las ocurrencias futuras usan el nuevo calendario. Es recomendable no cambiar frecuencias retroactivamente tras muchos meses de actividad.

## 6. Limitaciones conocidas de esta primera versión

- **Notificaciones:** los avisos funcionan con la app abierta y permiso concedido. Para recibir notificaciones push fiables **con la aplicación cerrada** necesitaríais configurar un servicio de envío de notificaciones (p. ej. Firebase Cloud Messaging y un proceso programado en servidor); no está incluido en esta primera versión. Los recordatorios dentro de la app sí funcionan.
- **Sincronización:** la app usa un documento compartido de Firestore con transacciones para evitar sobrescribir cambios concurrentes. En el modo Firebase, se requiere conectividad para confirmar nuevas modificaciones; si fallan, aparece un aviso. Un uso mucho mayor o un historial muy largo requeriría dividir documentos.
- **Puntuación:** los cálculos se derivan de repeticiones y eventos; cambios retroactivos en el calendario pueden modificar estadísticas históricas. Se recomienda archivar una tarea y crear otra cuando cambia radicalmente su periodicidad.
- **Zona horaria:** utiliza el calendario local del móvil; ambos debéis usar la misma zona horaria (p. ej. Europe/Madrid).
- **Acceso compartido:** no permite distinguir quién pulsó realmente «completada» más allá del selector visible.
- No incluye exportación, ausencias, duración estimada ni publicación en App Store, de acuerdo con lo solicitado.

## Archivos

| Archivo | Función |
|---|---|
| `index.html` | Entrada de la PWA |
| `styles.css` | Interfaz móvil |
| `app.js` | Modelo, pantallas y reglas |
| `config.js` | Conexión opcional a Firebase |
| `firestore.rules` | Protección de los datos |
| `manifest.webmanifest`, `sw.js`, `icons/` | Instalación y caché offline |
| `.github/workflows/deploy.yml` | Publicación automática en GitHub Pages |

## Reparto por tiempo activo (v5)

La pantalla **Semana global** compara el **tiempo activo estimado** asignado a Alicia y José cada semana. Se edita desde **Tareas → Editar → Tiempo activo estimado (minutos)**. Las tareas reciben una sugerencia inicial editable, expresada en minutos u horas. Los trabajos pendientes de semanas anteriores se muestran separados. El cálculo es una estimación, no un cronómetro.

El marcador de cumplimiento (+1/−1) **es independiente** de estos minutos. La carga realizada atribuye los minutos al usuario que completa la repetición. La valoración de una repetición ya completada queda registrada; los minutos de tareas pendientes anteriores puede cambiar al editar el catálogo.

### Lavadoras por fases

Cada colada se divide en dos tareas separadas: **poner lavadora (5 min)** y **recoger/tender/doblar/guardar (15 min)**. Así pueden tener responsables diferentes. Una instalación que ya tenga tareas de lavadora combinadas convierte esas tareas en «poner lavadora» y crea su pareja «recoger lavadora». Las finalizaciones anteriores siguen registradas; revisar valores iniciales si el trabajo habitual difiere.

## V6: varias repeticiones por semana con responsables diferentes

En **Tareas → Crear/Editar → Repetición: Semanal**, seleccionar **1, 2 o 3 veces por semana**. Cada repetición permite elegir su propio día y responsable. No se admiten días duplicados dentro de la misma tarea. Los minutos estimados se contabilizan una vez por cada repetición programada. Las apariciones son independientes (`id@fecha`): una atrasada no reemplaza la siguiente. Las tareas antiguas de un solo día se mantienen sin necesitar migración.

Para las parejas de preparación de comida y fregado, editar una plantilla semanal sincroniza los mismos días y asigna la persona contraria a cada fregado. Las reasignaciones de repeticiones concretas mantienen la regla de que quien cocina no recoge.

Los cambios de calendario alteran futuras ocurrencias y, como en versiones anteriores, pueden cambiar el cálculo histórico de ocurrencias no completadas; para una política de historial inmutable habría que versionar calendarios.
