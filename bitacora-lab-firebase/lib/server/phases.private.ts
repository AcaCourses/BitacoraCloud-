import { PhaseDefinition } from '../types';

export const PHASES: PhaseDefinition[] = [
  {
    phase: 0,
    title: "Módulo 1: Arquitectura Serverless y Modelo de Costos",
    actions: [],
    v1Prompt: "En los correos iniciales, Patricio menciona el alivio de 'dejar de pagar por servidores inactivos'. Explica cómo cambia la gestión de infraestructura y el esquema financiero de Pet Theory al migrar de un servidor tradicional propio a Firebase Hosting y Firestore.",
    ideas: [
      { id: "serverless_concept", desc: "El modelo serverless transfiere la administración de la infraestructura al proveedor de nube y cambia el esquema de costos a un modelo de pago estricto por consumo." }
    ],
    guides: {
      "serverless_concept": {
        type: "choice",
        prompt: "¿Cuál es la principal implicación operativa de adoptar un esquema serverless para Pet Theory?",
        options: [
          { text: "Los desarrolladores deben configurar balanceadores de carga y reglas de autoescalado manualmente.", correct: false },
          { text: "El proveedor de nube administra el aprovisionamiento y escalado de hardware; el costo se vincula estrictamente al uso de recursos.", correct: true },
          { text: "La aplicación queda exenta de necesitar políticas de autenticación o reglas de acceso a datos.", correct: false },
          { text: "Se requiere mantener al menos una máquina virtual encendida como nodo de contingencia.", correct: false }
        ]
      }
    },
    predict: {
      prompt: "Durante una campaña de vacunación, el tráfico del sitio web se multiplica repentinamente por 20. ¿Qué ocurrirá con la infraestructura desplegada en Firebase?",
      options: [
        "El sitio se caerá si el administrador no amplía la memoria RAM del servidor desde la consola.",
        "Firebase absorberá el incremento de tráfico de forma transparente, reflejándose únicamente en el consumo facturado.",
        "Las conexiones entrantes fallarán porque Firebase Hosting admite un único despliegue concurrente.",
        "Se bloqueará la base de datos hasta que se reinicien las instancias de Firestore."
      ],
      correct: "Firebase absorberá el incremento de tráfico de forma transparente, reflejándose únicamente en el consumo facturado."
    },
    closingPrompt: "¿Qué concepto te pareció más revelador de este módulo?"
  },
  {
    phase: 1,
    title: "Módulo 2: Autenticación vs Autorización",
    actions: [],
    v1Prompt: "Explica la diferencia técnica entre autenticación y autorización dentro del lab. En tu explicación, detalla por qué fue necesario registrar PROJECT_ID.web.app en la sección de Dominios autorizados de Firebase Authentication.",
    ideas: [
      { id: "auth_diff", desc: "La autenticación verifica la identidad delegada a Google, la autorización verifica permisos. El dominio se autoriza para prevenir suplantación (CORS/OAuth)." }
    ],
    guides: {
      "auth_diff": {
        type: "choice",
        prompt: "Al habilitar el acceso con Google, ¿qué beneficio directo de seguridad obtiene Pet Theory frente a un login tradicional?",
        options: [
          { text: "Firestore cifra automáticamente toda la base de datos con la contraseña del usuario.", correct: false },
          { text: "Los usuarios pueden escribir en cualquier colección sin necesidad de reglas de seguridad.", correct: false },
          { text: "Pet Theory delega el almacenamiento y verificación de credenciales a Google, eliminando el riesgo de custodiar contraseñas.", correct: true },
          { text: "Se habilita automáticamente el despliegue continuo con Cloud Build.", correct: false }
        ]
      }
    },
    predict: {
      prompt: "Un desarrollador despliega la web en un dominio personalizado nuevo (citas.pettheory.com), pero olvida agregarlo a la lista de Dominios autorizados en Firebase Auth. ¿Qué ocurre cuando un cliente presiona 'Acceder con Google'?",
      options: [
        "El proveedor de identidad rechaza la solicitud de autenticación y muestra un error de origen no autorizado.",
        "El usuario inicia sesión normalmente, pero sus lecturas en Firestore devuelven documentos vacíos.",
        "El cliente ingresa con permisos de administrador globales por defecto.",
        "El navegador bloquea la descarga del archivo customer.js."
      ],
      correct: "El proveedor de identidad rechaza la solicitud de autenticación y muestra un error de origen no autorizado."
    },
    closingPrompt: "Anota un apunte rápido sobre Autenticación vs Autorización."
  },
  {
    phase: 2,
    title: "Módulo 3: Seguridad Declarativa",
    actions: [],
    v1Prompt: "Analiza las reglas de seguridad publicadas en el laboratorio:\nmatch /customers/{email} { allow read, write: if request.auth.token.email == email; }\nmatch /customers/{email}/{document=**} { allow read, write: if request.auth.token.email == email; }\nExplica qué valida la expresión `request.auth.token.email == email` y cuál es el propósito del comodín `{document=**}` en la segunda regla.",
    ideas: [
      { id: "firestore_rules", desc: "Garantiza que el email del token coincida con la ruta del documento, aislando datos. El comodín propaga esta regla a las subcolecciones." }
    ],
    guides: {
      "firestore_rules": {
        type: "choice",
        prompt: "¿Qué sucedía con la seguridad de la base de datos antes de reemplazar las reglas predeterminadas del modo de prueba (allow read, write: if true;)?",
        options: [
          { text: "Solo los administradores del proyecto de Google Cloud podían escribir datos.", correct: false },
          { text: "Nadie podía leer ni escribir hasta que se conectara Cloud Shell.", correct: false },
          { text: "Cualquier usuario de internet con el identificador del proyecto podía leer o sobrescribir la base de datos completa.", correct: true },
          { text: "Las operaciones de escritura estaban limitadas a 100 registros por día.", correct: false }
        ]
      }
    },
    predict: {
      prompt: "El usuario autenticado como carlos@gmail.com ejecuta una consulta en el cliente web intentando leer el documento localizado en /customers/maria@gmail.com/appointments/cita123. ¿Cuál es el resultado de la petición?",
      options: [
        "Firestore devuelve la cita porque ambos usuarios están autenticados en la plataforma.",
        "La consulta es denegada inmediatamente por el motor de reglas de Firestore sin devolver ningún dato.",
        "Se permite la lectura, pero se bloquean las modificaciones posteriores.",
        "El servidor procesa la lectura y envía una alerta por correo a maria@gmail.com."
      ],
      correct: "La consulta es denegada inmediatamente por el motor de reglas de Firestore sin devolver ningún dato."
    },
    closingPrompt: "¿Por qué es importante establecer reglas de base de datos restrictivas desde el inicio?"
  },
  {
    phase: 3,
    title: "Módulo 4: Configuración CLI",
    actions: [],
    v1Prompt: "Durante la ejecución de firebase init, se te indicó responder 'N' (No) a la pregunta de si deseabas sobrescribir el archivo index.html. ¿Qué habría sucedido si aceptabas la sobrescritura y qué rol cumple el archivo firebase.json en el flujo de despliegue?",
    ideas: [
      { id: "cli_config", desc: "Si aceptabas, Firebase habría borrado tu código HTML y puesto una plantilla blanca. firebase.json mapea el entorno local con los recursos de la nube." }
    ],
    guides: {
      "cli_config": {
        type: "choice",
        prompt: "¿Por qué fue indispensable utilizar el parámetro --no-localhost al ejecutar firebase login en Cloud Shell?",
        options: [
          { text: "Porque deshabilita las restricciones de CORS en el navegador.", correct: false },
          { text: "Porque fuerza a Firebase a crear un entorno de pruebas sin conexión a internet.", correct: false },
          { text: "Porque Cloud Shell corre en una máquina virtual remota sin un navegador web local para completar el flujo OAuth interactivo.", correct: true },
          { text: "Porque evita que las credenciales de acceso se sincronicen con el repositorio Git.", correct: false }
        ]
      }
    },
    predict: {
      prompt: "Un alumno omite agregar la directiva \"site\": \"PROJECT_ID\" dentro de firebase.json y corre firebase deploy --only hosting. ¿Qué problema enfrentará?",
      options: [
        "Se borrarán todas las colecciones existentes en Firestore.",
        "La CLI no sabrá a cuál de los sitios de Hosting del proyecto enviar los archivos estáticos o fallará por destino ambiguo.",
        "El archivo customer.js se subirá como archivo binario no ejecutable.",
        "Las reglas de Firestore volverán al modo de prueba de forma obligatoria."
      ],
      correct: "La CLI no sabrá a cuál de los sitios de Hosting del proyecto enviar los archivos estáticos o fallará por destino ambiguo."
    },
    closingPrompt: "¿Qué comandos usaste para inicializar y desplegar la aplicación?"
  },
  {
    phase: 4,
    title: "Módulo 5: Sincronización Real (onSnapshot)",
    actions: [],
    v1Prompt: "En customer.js, la carga de datos del perfil utiliza onSnapshot en lugar de una función de lectura estándar como get(). Explica qué diferencia de comportamiento existe entre ambos métodos y qué ventaja ofrece a nivel de experiencia de usuario en una clínica veterinaria.",
    ideas: [
      { id: "realtime", desc: "get() lee una sola vez. onSnapshot abre un listener en tiempo real. Permite que actualizaciones concurrentes se vean instantáneamente sin recargar la página." }
    ],
    guides: {
      "realtime": {
        type: "choice",
        prompt: "¿Cómo garantiza el siguiente fragmento que el documento guardado se asocie de forma unívoca con el usuario que inició sesión? `var docRef = db.collection('customers').doc(user.email);`",
        options: [
          { text: "Genera un ID numérico autoincremental en cada inserción.", correct: false },
          { text: "Utiliza la dirección de correo (user.email) como clave primaria del documento, alineándose con las reglas.", correct: true },
          { text: "Encripta el contenido de los campos de texto usando el correo como llave privada.", correct: false },
          { text: "Convierte la colección customers en una tabla relacional indexada.", correct: false }
        ]
      }
    },
    predict: {
      prompt: "Un cliente abre el sitio en su laptop y en su teléfono móvil. Si actualiza su número de teléfono desde la laptop y pulsa 'Save profile', ¿qué ocurre en la pantalla del teléfono sin recargar?",
      options: [
        "El teléfono muestra un diálogo de conflicto de concurrencia y solicita refrescar.",
        "El listener onSnapshot en el teléfono recibe la mutación y actualiza el campo en tiempo real.",
        "El teléfono mantiene el dato anterior hasta que el usuario cierre sesión e ingrese de nuevo.",
        "La base de datos bloquea el documento temporalmente por doble conexión."
      ],
      correct: "El listener onSnapshot en el teléfono recibe la mutación y actualiza el campo en tiempo real."
    },
    closingPrompt: "¿Qué impacto tiene onSnapshot en las apps web modernas?"
  },
  {
    phase: 5,
    title: "Módulo 6: Síntesis de Negocio",
    actions: [],
    v1Prompt: "Lily (dueña) te pide un balance: 'Entiendo que la app funciona, pero ¿por qué esta arquitectura nos protege mejor contra robo de datos y caídas del sistema que nuestro servidor anterior?'. Redacta una respuesta dirigida a una persona de negocio, cubriendo identidad, aislamiento y disponibilidad serverless.",
    ideas: [
      { id: "business_value", desc: "Se delega la autenticación, se blindan los registros impidiendo robo masivo, y la infraestructura sin servidores absorbe el tráfico sin colapsar." }
    ],
    guides: {
      "business_value": {
        type: "choice",
        prompt: "Si Lily pregunta: '¿Qué pasa si un programador malicioso modifica la web (frontend) para intentar leer todas las citas de la clínica?', ¿qué le responderías?",
        options: [
          { text: "El frontend lo permitirá porque JavaScript es inseguro.", correct: false },
          { text: "La base de datos rechazará la petición sin importar lo que el frontend intente, gracias a las reglas backend de seguridad.", correct: true },
          { text: "Solo podemos confiar en que los programadores no hagan eso.", correct: false }
        ]
      }
    },
    predict: {
      prompt: "¿Cuál consideras que es el siguiente gran paso de negocio para Pet Theory?",
      options: [
        "Volver a migrar a un servidor propio por costos",
        "Implementar la función para programar citas, ahora que la identidad y base de datos son sólidas",
        "Hacer una aplicación de escritorio"
      ],
      correct: "Implementar la función para programar citas, ahora que la identidad y base de datos son sólidas"
    },
    closingPrompt: "¡Felicidades por completar la bitácora!"
  }
];
