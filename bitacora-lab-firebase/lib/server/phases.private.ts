import { PhaseDefinition } from '../types';

export const PHASES: PhaseDefinition[] = [
  {
    phase: 0,
    title: "Registro de Aplicación en Firebase",
    actions: [
      { text: "Acceder a Firebase Console con usuario temporal", correct: true },
      { text: "Registrar alias de web app 'Pet Theory'", correct: true },
      { text: "Seleccionar 'Configurar Firebase Hosting'", correct: true },
      { text: "Ingresar tarjeta de crédito personal", correct: false }
    ],
    v1Prompt: "El primer paso fue registrar la aplicación en Firebase y habilitar Hosting. Explica por qué Rita mencionó que el principal beneficio es 'no pagar por servidores inactivos' (modelo Serverless).",
    ideas: [
      { id: "serverless", desc: "El modelo serverless (sin servidor) implica que solo pagas por el consumo real, sin necesidad de mantener ni pagar infraestructura encendida 24/7." },
      { id: "infra", desc: "Firebase Hosting elimina la necesidad de administrar servidores y su seguridad de forma manual." }
    ],
    guides: {
      "serverless": {
        type: "choice",
        prompt: "¿Qué significa que el Hosting de Firebase opere bajo un modelo 'pago por consumo' (Serverless)?",
        options: [
          { text: "Que debes pagar una mensualidad fija", correct: false, nudge: "Al contrario, se busca evitar pagos fijos." },
          { text: "Que solo pagas cuando los usuarios visitan tu sitio y consumen recursos", correct: true }
        ]
      },
      "infra": {
        type: "free",
        prompt: "Patricio (el de TI) menciona que le alivia administrar infraestructura. ¿Qué tareas operativas comunes ya no tendrá que hacer gracias a Firebase?"
      }
    },
    predict: {
      prompt: "Tras registrar la app web, ¿cuál será el siguiente servicio de Firebase que deberás configurar para que los usuarios puedan acceder?",
      options: [
        "Cloud Storage",
        "Firebase Authentication",
        "Compute Engine"
      ],
      correct: "Firebase Authentication"
    },
    closingPrompt: "¿Qué concepto te resultó más interesante de esta primera fase?"
  },
  {
    phase: 1,
    title: "Habilitación de Authentication y Firestore",
    actions: [
      { text: "Habilitar el proveedor de acceso Google", correct: true },
      { text: "Agregar dominio personalizado (PROJECT_ID.web.app)", correct: true },
      { text: "Crear base de datos Firestore en Modo de prueba", correct: true },
      { text: "Escribir reglas de seguridad para customers/{email}", correct: true }
    ],
    v1Prompt: "Configuraste reglas de seguridad de Firestore (`allow read, write: if request.auth.token.email == email;`). Explica con tus palabras qué hace exactamente esta regla y por qué es importante para la clínica.",
    ideas: [
      { id: "aislamiento", desc: "La regla asegura que un usuario autenticado solo pueda leer y escribir en su propio documento de cliente." },
      { id: "seguridad_backend", desc: "Aplica la seguridad directamente en la base de datos, independientemente de lo que haga la app cliente." }
    ],
    guides: {
      "aislamiento": {
        type: "choice",
        prompt: "Si un cliente intenta leer el documento de otro cliente a través de la web, ¿qué hará Firestore basándose en esta regla?",
        options: [
          { text: "Denegará el acceso porque el token.email no coincide con el email del documento", correct: true },
          { text: "Permitirá el acceso porque la base de datos está en modo de prueba", correct: false, nudge: "Aunque iniciaste en modo prueba, reemplazaste las reglas por unas estrictas." }
        ]
      },
      "seguridad_backend": {
        type: "free",
        prompt: "¿Por qué es más seguro definir esta regla directamente en Firestore y no programar la validación en el JavaScript del navegador?"
      }
    },
    predict: {
      prompt: "Con el backend configurado (Auth y Base de Datos), ¿dónde deberás trabajar ahora para escribir la interfaz web?",
      options: [
        "En la consola de Firebase",
        "En Cloud Shell / Editor de código",
        "En un editor de texto en tu computadora"
      ],
      correct: "En Cloud Shell / Editor de código"
    },
    closingPrompt: "Escribe brevemente qué hace Firebase Authentication."
  },
  {
    phase: 2,
    title: "Preparación del Entorno Local (Cloud Shell)",
    actions: [
      { text: "Clonar repositorio de gs://spls/gsp643/pet-theory", correct: true },
      { text: "Navegar a pet-theory/lab02", correct: true },
      { text: "Ejecutar npm install", correct: true }
    ],
    v1Prompt: "Descargaste el código a través de Cloud Storage (comando `gcloud storage cp`) e instalaste dependencias (`npm install`). ¿Qué contiene este directorio y por qué es necesario instalar paquetes con NPM antes de continuar?",
    ideas: [
      { id: "codigo_base", desc: "El directorio contiene el código base (HTML/CSS/JS) de la aplicación web de la clínica." },
      { id: "paquetes", desc: "NPM instala las dependencias o librerías externas que el proyecto necesita para funcionar localmente antes de subirlas." }
    ],
    guides: {
      "codigo_base": {
        type: "choice",
        prompt: "¿Qué tipo de aplicación estamos a punto de implementar en Firebase Hosting?",
        options: [
          { text: "Una base de datos SQL", correct: false, nudge: "Firebase Hosting sirve archivos web, no bases de datos SQL." },
          { text: "Una aplicación web estática (archivos web y Node.js)", correct: true }
        ]
      },
      "paquetes": {
        type: "free",
        prompt: "¿Qué comando usaste para que el gestor de paquetes de Node descargara las herramientas necesarias al directorio lab02?"
      }
    },
    predict: {
      prompt: "Antes de poder implementar este código local en la nube, ¿qué debes hacer para que Firebase CLI sepa a qué cuenta pertenece?",
      options: [
        "Iniciar sesión en Firebase (firebase login)",
        "Borrar los archivos",
        "Configurar el DNS"
      ],
      correct: "Iniciar sesión en Firebase (firebase login)"
    },
    closingPrompt: "Anota algún error o dificultad que hayas tenido al navegar en la terminal de Cloud Shell."
  },
  {
    phase: 3,
    title: "Autorización e Inicialización de Firebase CLI",
    actions: [
      { text: "Ejecutar firebase login --no-localhost", correct: true },
      { text: "Ejecutar firebase init", correct: true },
      { text: "Seleccionar Firestore y Hosting con la barra espaciadora", correct: true },
      { text: "Sobrescribir el archivo firestore.rules", correct: false }
    ],
    v1Prompt: "Al ejecutar `firebase init`, se te pidió no sobrescribir los archivos `firestore.rules` ni `index.html`. Explica por qué fue crucial presionar 'N' (No) en esos pasos del asistente.",
    ideas: [
      { id: "reglas_previas", desc: "Porque ya habías configurado las reglas de seguridad de Firestore en la consola, sobrescribirlas las hubiera borrado." },
      { id: "index_html", desc: "El archivo index.html contiene el código base de la app web de la clínica; sobrescribirlo pondría una plantilla en blanco de Firebase." }
    ],
    guides: {
      "reglas_previas": {
        type: "choice",
        prompt: "Si hubieras reemplazado firestore.rules, ¿qué problema de seguridad habrías causado?",
        options: [
          { text: "La base de datos borraría a todos los clientes", correct: false, nudge: "Las reglas no borran datos, controlan quién entra." },
          { text: "Se hubieran perdido las restricciones de acceso por email que configuraste en la consola", correct: true }
        ]
      },
      "index_html": {
        type: "free",
        prompt: "De igual forma, si hubieras dejado que Firebase sobrescribiera 'index.html', ¿qué hubiera pasado con el diseño web de Pet Theory?"
      }
    },
    predict: {
      prompt: "Ahora que el directorio está vinculado a tu proyecto en la nube, ¿qué comando usará Patricio para subir los archivos a Internet?",
      options: [
        "firebase deploy --only hosting",
        "npm run build",
        "git push origin master"
      ],
      correct: "firebase deploy --only hosting"
    },
    closingPrompt: "¿Qué tecla usaste en `firebase init` para seleccionar los servicios Firestore y Hosting de la lista?"
  },
  {
    phase: 4,
    title: "Implementación del Código Web (Hosting)",
    actions: [
      { text: "Actualizar firebase.json con la clave site (PROJECT_ID)", correct: true },
      { text: "Ejecutar firebase deploy --only hosting", correct: true },
      { text: "Visitar la URL generada (PROJECT_ID.web.app)", correct: true },
      { text: "Autenticar usando Acceder con Google", correct: true }
    ],
    v1Prompt: "Lograste implementar (deploy) la aplicación web y funcionó el acceso con Google. Explica cómo esto resuelve el problema original de Lily sobre que 'los usuarios no quieren crear otra contraseña' y 'el riesgo de seguridad para la empresa'.",
    ideas: [
      { id: "federacion", desc: "Al usar Google Authentication, los usuarios inician sesión con su cuenta existente sin tener que inventar contraseñas nuevas." },
      { id: "riesgo", desc: "La clínica delega la validación de identidad a Google, evitando almacenar y proteger contraseñas en su propia base de datos." }
    ],
    guides: {
      "federacion": {
        type: "free",
        prompt: "Imagina que eres un usuario de la app. ¿Por qué es más cómodo y rápido este sistema frente al clásico formulario de registro?"
      },
      "riesgo": {
        type: "choice",
        prompt: "¿De qué carga de seguridad se libera Patricio al habilitar este acceso federado?",
        options: [
          { text: "De preocuparse de que hackeen la base de datos de contraseñas, porque Pet Theory no guarda las contraseñas", correct: true },
          { text: "De que nadie pueda robar la información médica", correct: false, nudge: "Auth maneja la identidad, pero Firestore protege los datos médicos." }
        ]
      }
    },
    predict: {
      prompt: "Tras iniciar sesión con éxito, descubriste que falta algo en la app web. ¿Qué vas a agregar en el código a continuación?",
      options: [
        "Un formulario de contacto en el perfil de cliente (customer.js)",
        "Una pasarela de pagos",
        "Animaciones CSS 3D"
      ],
      correct: "Un formulario de contacto en el perfil de cliente (customer.js)"
    },
    closingPrompt: "Anota la URL exacta a la que accediste para ver tu aplicación web implementada."
  },
  {
    phase: 5,
    title: "Integración de Firestore en el Frontend",
    actions: [
      { text: "Copiar código de lectura/escritura en public/customer.js", correct: true },
      { text: "Copiar estilos en public/styles.css", correct: true },
      { text: "Hacer firebase deploy nuevamente", correct: true },
      { text: "Llenar el formulario en la web y guardar el perfil", correct: true }
    ],
    v1Prompt: "Pegaste código en `customer.js` que escucha el estado del usuario (`onAuthStateChanged`) y usa `docRef.set({...})` al guardar. ¿Cómo se relaciona la configuración de Firebase de la app web con que esos datos viajen directamente a Firestore sin pasar por un servidor backend propio?",
    ideas: [
      { id: "sdk_frontend", desc: "El código frontend usa los SDKs de Firebase para conectarse directo a la base de datos desde el navegador." },
      { id: "tiempo_real", desc: "La aplicación usa `onSnapshot` para escuchar y actualizar la interfaz si los datos en Firestore cambian en tiempo real." }
    ],
    guides: {
      "sdk_frontend": {
        type: "choice",
        prompt: "¿Qué innovación tecnológica permite que envíes datos a la base de datos directamente desde el archivo `customer.js`?",
        options: [
          { text: "Una conexión directa vía Firebase SDK, validada por las Reglas de Seguridad", correct: true },
          { text: "Una llamada REST oculta a un servidor PHP en la nube de Google", correct: false, nudge: "Recuerda que esta arquitectura es sin servidor, el navegador habla directo con Firestore." }
        ]
      },
      "tiempo_real": {
        type: "free",
        prompt: "En el código copiado aparece `onSnapshot()`. ¿Qué ventaja tiene esto si el recepcionista de la clínica modifica el teléfono del cliente desde su computadora?"
      }
    },
    predict: {
      prompt: "Para comprobar que el código en `customer.js` realmente funcionó y guardó los datos...",
      options: [
        "Verás la base de datos local del navegador",
        "Vas a la consola de Firebase > Firestore y buscas tus datos",
        "Imprimes los datos en la terminal"
      ],
      correct: "Vas a la consola de Firebase > Firestore y buscas tus datos"
    },
    closingPrompt: "Nombra un lenguaje de programación con el que interactuaste directamente en esta fase."
  },
  {
    phase: 6,
    title: "Cierre: Explicación para Lily",
    actions: [
      { text: "Revisar Firestore y confirmar el registro exitoso", correct: true }
    ],
    v1Prompt: "Imagina que Lily, la dueña de la clínica, te pregunta: 'Me dijeron que cada cliente solo puede ver su propia información, pero no entiendo cómo lo logramos si todos entran al mismo sitio, y me contaron que ya no pagaremos por servidores apagados. ¿Me lo explicas de manera sencilla?' (mín. 40 palabras).",
    ideas: [
      { id: "autenticacion", desc: "Mencionar que usamos el inicio de sesión de Google para saber con seguridad quién es el cliente." },
      { id: "reglas", desc: "Explicar que la base de datos tiene reglas o cerraduras automáticas que solo permiten acceder a la carpeta que coincide con su correo." },
      { id: "serverless_costo", desc: "Explicar que el sistema (nube) solo cobra cuando la aplicación se usa, sin pagar rentas fijas por máquinas." }
    ],
    guides: {
      "autenticacion": {
        type: "free",
        prompt: "¿Cómo le garantizas a Lily que sabemos la identidad real de las personas que entran, sin que nosotros manejemos contraseñas?"
      },
      "reglas": {
        type: "choice",
        prompt: "¿Qué metáfora usarías para explicarle a Lily la regla de Firestore `request.auth.token.email == email`?",
        options: [
          { text: "Es como un guardia que compara la identificación del cliente con el nombre de la carpeta antes de dársela", correct: true },
          { text: "Es un filtro en la página web que oculta los datos visualmente", correct: false, nudge: "La seguridad ocurre en la base de datos (backend), no en la vista." }
        ]
      },
      "serverless_costo": {
        type: "free",
        prompt: "Explica a Lily de forma sencilla cómo funciona el modelo de cobro de Firebase Hosting respecto a los servidores."
      }
    },
    predict: {
      prompt: "El lab indica que la pestaña 'Appointments' está en blanco. ¿Cuál crees que será el siguiente proyecto técnico de Pet Theory?",
      options: [
        "Diseñar un logo nuevo",
        "Construir la lógica y los módulos de base de datos para la programación de citas",
        "Migrar a un servidor SQL"
      ],
      correct: "Construir la lógica y los módulos de base de datos para la programación de citas"
    },
    closingPrompt: "Gracias por completar la bitácora guiada de GSP643."
  }
];
