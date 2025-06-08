# Sistema de Gestión de Inventario Full-Stack

Este proyecto es una aplicación completa de gestión de inventario, construida con un backend Node.js/Express/Mongoose y un frontend Quasar/Vue 3.

## Tabla de Contenidos
- [Visión General](#visión-general)
- [Características](#características)
- [Arquitectura](#arquitectura)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Prerrequisitos](#prerrequisitos)
- [Configuración del Backend](#configuración-del-backend)
  - [Configurar una Base de Datos MongoDB Local](#configurar-una-base-de-datos-mongodb-local-opcional-pero-recomendado-para-desarrollo)
- [Configuración del Frontend](#configuración-del-frontend)
- [Ejecutar la Aplicación](#ejecutar-la-aplicación)
- [Documentación API](#documentación-api)

## Visión General

El sistema permite gestionar productos, unidades de medida, almacenes, contactos (clientes/proveedores) y registrar entradas y salidas de inventario.

## Características

- **Gestión de Productos:** CRUD completo para productos, incluyendo stock mínimo.
- **Gestión de Catálogos:**
    - Unidades de Medida: CRUD.
    - Almacenes: CRUD.
    - Contactos: CRUD para clientes y proveedores, con filtrado por tipo.
- **Gestión de Registros de Inventario:**
    - Creación de registros de entrada y salida.
    - Lógica condicional para asociar proveedores a entradas y clientes a salidas.
    - Referencias a productos, almacenes y unidades de medida.
- **API RESTful:** Backend robusto con endpoints documentados para todas las operaciones.
- **Frontend Reactivo:** Interfaz de usuario intuitiva construida con Quasar y Vue 3.
- **Validación:** Validación de datos tanto en el frontend como en el backend.
- **Notificaciones:** Feedback al usuario para operaciones CRUD.

## Arquitectura

- **Backend:**
    - Node.js
    - Express.js (Framework web)
    - Mongoose (ODM para MongoDB)
    - API RESTful
    - Variables de entorno para configuración
    - Swagger para documentación de API
- **Frontend:**
    - Quasar Framework (v2, con Vue 3 y Vite)
    - Vue 3 (Composition API)
    - Pinia (Gestión de estado)
    - Axios (Cliente HTTP)
    - Componentes de Quasar para UI

## Tecnologías Utilizadas

**Backend:**
- Node.js (vLTS)
- Express.js
- Mongoose
- MongoDB
- `dotenv` (variables de entorno)
- `cors` (manejo de CORS)
- `helmet` (seguridad HTTP)
- `express-rate-limit` (limitación de tasa)
- `morgan` (logging HTTP)
- `express-validator` (validación de datos)
- `swagger-ui-express` & `swagger-jsdoc` (documentación API)

**Frontend:**
- Vue.js (v3)
- Quasar Framework (v2)
- Vite
- Pinia
- Axios
- ESLint, Prettier

**Base de Datos:**
- MongoDB (Atlas, local, o Docker)

## Prerrequisitos

- Node.js (versión LTS recomendada, ej: 18.x o 20.x)
- npm (o yarn)
- MongoDB: Una instancia de MongoDB debe estar accesible. Puede ser una instancia local o un servicio en la nube (ej. MongoDB Atlas). Consulta la sección "[Configurar una Base de Datos MongoDB Local](#configurar-una-base-de-datos-mongodb-local-opcional-pero-recomendado-para-desarrollo)" en "Configuración del Backend" para obtener ayuda con la configuración local.
- Quasar CLI (instalada globalmente si vas a usar comandos Quasar directamente, aunque el proyecto frontend ya está configurado)
  `npm install -g @quasar/cli`

## Configuración del Backend

1.  **Clonar el Repositorio (si aplica):**
    ```bash
    # git clone <tu-repo-url>
    # cd <directorio-proyecto>/inventario-backend
    ```
    (Navega a `inventario-backend` dentro de este proyecto si ya lo tienes)

2.  **Instalar Dependencias:**
    Dentro del directorio `inventario-backend`:
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    -   Crea un archivo `.env` en el directorio raíz de `inventario-backend`.
    -   Añade las siguientes variables (ajusta `MONGODB_URI` según tu configuración):
        ```env
        PORT=3000
        MONGODB_URI=mongodb://localhost:27017/inventario_db # Reemplaza con tu connection string de MongoDB
        MONGODB_URI_TEST=mongodb://localhost:27017/inventario_test_db # Para las pruebas de Jest
        NODE_ENV=development
        # API_BASE_URL=http://localhost:3000 # Usado por Swagger, ajustar si es necesario
        ```
    -   **Nota:** Asegúrate de que tu base de datos MongoDB esté corriendo y accesible. Si usas una instancia local, consulta la sección siguiente.

### Configurar una Base de Datos MongoDB Local (Opcional pero Recomendado para Desarrollo)

Si prefieres utilizar una instancia de MongoDB corriendo directamente en tu máquina local en lugar de un servicio en la nube (como MongoDB Atlas) para desarrollo y pruebas, sigue estos pasos:

1.  **Instalar MongoDB Community Server:**
    *   Descarga MongoDB Community Server desde la [página oficial de MongoDB](https://www.mongodb.com/try/download/community).
    *   Sigue las instrucciones de instalación específicas para tu sistema operativo:
        *   [Windows](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/)
        *   [macOS](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/)
        *   [Linux (selecciona tu distribución)](https://www.mongodb.com/docs/manual/administration/install-on-linux/)
    *   Durante la instalación, usualmente se te dará la opción de instalar MongoDB como un servicio que se inicia automáticamente con tu sistema. Esto es recomendable.

2.  **Iniciar el Servicio MongoDB:**
    *   Si MongoDB no se inició automáticamente después de la instalación, deberás iniciarlo manualmente.
        *   **Windows:** Busca "Services" en el menú de inicio, encuentra "MongoDB Server" y asegúrate de que esté corriendo. Puedes iniciarlo desde ahí.
        *   **macOS (usando Homebrew):** `brew services start mongodb-community`
        *   **Linux (dependiendo del sistema init, ej. systemd):** `sudo systemctl start mongod`
    *   Por defecto, MongoDB escuchará en el puerto `27017`.

3.  **Verificar la Conexión (Opcional):**
    *   Puedes usar `mongosh` (el shell de MongoDB, que se instala con el servidor) para conectarte a tu instancia local. Abre una terminal y escribe `mongosh`. Si se conecta, estás listo.

4.  **Actualizar el Archivo `.env` del Backend (Confirmación):**
    *   Como se mencionó en la sección anterior de "Configurar Variables de Entorno", asegúrate de que tu archivo `inventario-backend/.env` contenga:

        ```env
        # Para desarrollo y producción (si usas local para producción, lo cual no es típico)
        MONGODB_URI=mongodb://localhost:27017/inventario_db

        # Para pruebas (Jest usará esta variable cuando NODE_ENV=test)
        MONGODB_URI_TEST=mongodb://localhost:27017/inventario_test_db
        ```
    *   `inventario_db` será el nombre de la base de datos para desarrollo/uso general.
    *   `inventario_test_db` será una base de datos separada que se usará para las pruebas automatizadas (Jest). Las pruebas están configuradas para limpiar esta base de datos.
    *   No necesitas crear estas bases de datos manualmente; MongoDB las creará cuando la aplicación se conecte por primera vez y necesite escribir datos.

Con estos pasos, el backend del proyecto utilizará tu instancia local de MongoDB.


4.  **Ejecutar el Servidor Backend:**
    Dentro del directorio `inventario-backend`:
    ```bash
    npm start
    ```
    O para desarrollo (si tienes `nodemon` configurado en `scripts`):
    ```bash
    npm run dev
    ```
    El servidor backend debería estar corriendo en `http://localhost:3000` (o el puerto que hayas configurado).

## Configuración del Frontend

1.  **Navegar al Directorio del Frontend:**
    ```bash
    # cd <directorio-proyecto>/inventario-frontend
    ```
    (Navega a `inventario-frontend` dentro de este proyecto)

2.  **Instalar Dependencias:**
    Dentro del directorio `inventario-frontend`:
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    -   Crea un archivo `.env` en el directorio raíz de `inventario-frontend`.
    -   Añade la URL de tu API backend:
        ```env
        VITE_API_URL=http://localhost:3000/api
        ```
    -   **Importante:** Para Vite, las variables de entorno expuestas al cliente DEBEN empezar con `VITE_`.

4.  **Ejecutar la Aplicación Frontend:**
    Dentro del directorio `inventario-frontend`:
    ```bash
    npm run dev
    ```
    (Este script ejecuta `quasar dev`). La aplicación frontend debería abrirse en tu navegador, usualmente en un puerto como `http://localhost:9000` (Quasar CLI con Vite especificará el puerto en la consola).

    **Nota sobre `quasar dev`:** El entorno de desarrollo automatizado tuvo problemas para configurar `quasar dev` de forma no interactiva. Si encuentras problemas para ejecutar `quasar dev` con el script `npm run dev`:
    *   Asegúrate de que `@quasar/cli` está instalado globalmente: `npm install -g @quasar/cli`.
    *   Intenta ejecutar `quasar dev` directamente dentro de la carpeta `inventario-frontend`.
    *   Verifica la configuración de `quasar.config.js` y `vite.config.js` contra un proyecto Quasar estándar creado con la CLI si persisten los problemas.
    *   En el peor de los casos, como se mencionó en un subtask anterior, crear un nuevo proyecto Quasar con `npm init quasar` y migrar los archivos de `src/` de este proyecto al nuevo podría ser una solución. Los archivos de código en `src/` (páginas, stores, componentes, layouts, servicios, boot) son estándar y deberían ser portables.

## Ejecutar la Aplicación

1.  Asegúrate de que tu instancia de MongoDB esté activa y accesible.
2.  Inicia el servidor backend (desde `inventario-backend`): `npm start` (o `npm run dev`).
3.  Inicia la aplicación frontend (desde `inventario-frontend`): `npm run dev`.
4.  Abre tu navegador en la dirección que indique la CLI de Quasar (usualmente alrededor de `http://localhost:9000`).

## Documentación API

Una vez que el servidor backend esté corriendo, la documentación de la API generada por Swagger está disponible en:
`http://localhost:3000/api/docs`

Esta interfaz te permite explorar y probar todos los endpoints de la API.

---

¡Gracias por usar el Sistema de Gestión de Inventario!
