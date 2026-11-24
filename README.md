# Nuestro Hogar — Alicia y José

Aplicación web instalable (PWA) para iPhone, **sin compilación ni dependencias npm**.

## Funciones incluidas

- Selector de perfil **Alicia / José**.
- Mis tareas de hoy, pendientes y días de retraso.
- Planning semanal navegable (por día y responsable).
- Listado global: crear, editar, archivar, cambiar periodicidad o responsable.
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
