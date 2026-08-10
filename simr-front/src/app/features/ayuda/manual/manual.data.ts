export type Acceso = 'publico' | 'sesion' | 'admin';

export interface ManualModulo {
  nombre: string;
  ruta?: string;
  acceso: Acceso;
  descripcion: string;
  contenido?: string[];
  campos?: string[];
  extras?: string[];
}

export interface ManualGrupo {
  id: string;
  titulo: string;
  icono: string;
  descripcion: string;
  modulos: ManualModulo[];
}

export const MANUAL_GRUPOS: ManualGrupo[] = [
  {
    id: 'el-proyecto',
    titulo: 'El proyecto SIMR: qué es y para quién',
    icono: 'auto_stories',
    descripcion:
      'Contexto, sentido y trayectoria del Sistema de Información de Músicas Regionales: de dónde viene, qué resuelve y a quién está dirigido.',
    modulos: [
      {
        nombre: '¿Qué es el SIMR?',
        acceso: 'publico',
        descripcion:
          'El Sistema de Información de Músicas Regionales (SIMR) es una aplicación de gestión bibliotecaria y archivística, y de gestión del conocimiento, elaborada para administrar y analizar el catálogo del Fondo de documentación del grupo de investigación Músicas Regionales de la Universidad de Antioquia.',
        contenido: [
          'El SIMR no es solo un catálogo: sistematiza la experiencia de más de 30 años del grupo Músicas Regionales estudiando las músicas del país y del continente desde la musicología, con base en principios de la bibliotecología y la archivística.',
          'Permite integrar la información de los proyectos de investigación y del conocimiento de los investigadores con los registros de obras, actores, recursos y ejemplares, y con los diversos tesauros (vocabularios controlados).',
          'Sus colecciones virtuales incluyen audios, partituras, imágenes y vídeos, almacenados en una nube privada de archivos (MinIO) bajo el control del grupo.',
        ],
      },
      {
        nombre: 'El sentido de la aplicación',
        acceso: 'publico',
        descripcion:
          'El SIMR permite hacer procesos de análisis y catalogación de obras musicales (y no musicales) y relacionarlas con los elementos de las colecciones del grupo y con el conocimiento que sobre ellas acumulan los investigadores y los proyectos.',
        contenido: [
          'Vocación científica: orientada a investigadores, integra y consulta las relaciones entre obras, personas, contextos geográficos y temporales.',
          'Vocación patrimonial: preserva la memoria de las músicas regionales del país y de América Latina.',
          'Vocación educativa: sirve de insumo para proyectos de investigación, docencia y difusión del patrimonio sonoro.',
        ],
      },
      {
        nombre: '¿Para quién está hecha?',
        acceso: 'publico',
        descripcion:
          'La aplicación tiene tres tipos de audiencia: el público general que consulta el catálogo, los investigadores y catalogadores que registran y analizan datos, y el administrador técnico que configura y mantiene el sistema.',
        contenido: [
          'Público general: navega el catálogo público (OPAC), busca obras, actores, instrumentos y géneros, y explora el mapa y la línea de tiempo.',
          'Investigadores: crean y editan registros completos con anotaciones cartográfico-temporales, clasificaciones académicas y relaciones entre entidades.',
          'Catalogadores: mantienen los vocabularios controlados (materias, géneros, idiomas, listas) para una catalogación consistente.',
          'Administradores: gestionan usuarios, roles, auditoría, respaldos, importaciones masivas y la configuración de la nube de archivos.',
        ],
      },
      {
        nombre: 'Historia y autores',
        acceso: 'publico',
        descripcion:
          'El SIMR nace del grupo de investigación Músicas Regionales como herramienta propia de archivo y análisis. La conceptualización es del grupo de investigación Músicas Regionales y el desarrollo principal ha estado a cargo de Fernando Mora Ángel.',
        contenido: [
          'Conceptualización: Grupo de Investigación Músicas Regionales.',
          'Institución: Universidad de Antioquia.',
          'Desarrollo: Fernando Mora Ángel.',
          'El proyecto evoluciona de forma continua; la versión actual del aplicativo se muestra en el apartado "Acerca de".',
        ],
      },
    ],
  },
  {
    id: 'conceptos',
    titulo: 'Conceptos clave para trabajar con SIMR',
    icono: 'menu_book',
    descripcion:
      'Definiciones breves de los términos que se usan a lo largo de las plantillas de catalogación. Útil para empezar con bases claras.',
    modulos: [
      {
        nombre: 'Catalogación',
        acceso: 'publico',
        descripcion:
          'Proceso estructurado de descripción de un recurso (obra, actor, ejemplar…) para que pueda ser encontrado y analizado. En SIMR la catalogación se hace mediante formularios en secciones que siguen principios de la bibliotecología.',
        contenido: [
          'Cada módulo de catalogación tiene tres capas: listado (buscar y filtrar), formulario (crear y editar) y detalle (ver la ficha completa).',
          'La consistencia se cuida mediante vocabularios controlados (materias, géneros, idiomas) y listas cerradas.',
        ],
      },
      {
        nombre: 'Anotaciones cartográfico-temporales',
        acceso: 'publico',
        descripcion:
          'Un registro puede incluir anotaciones cartográfico-temporales: un evento con lugar (coordenadas geográficas), fechas con precisión, evidencia y notas. Se ven en el mapa del registro y en las vistas globales de mapa y línea de tiempo.',
        contenido: [
          'Cuando un registro tiene anotaciones, aparecen secciones especiales con un mapa (MapLibre) y una línea de tiempo (timeline).',
          'Todas las anotaciones del catálogo pueden visualizarse en conjunto en el Mapa visualizador y en la Línea de tiempo.',
        ],
      },
      {
        nombre: 'Vocabularios controlados',
        acceso: 'publico',
        descripcion:
          'Listas de términos estandarizados para describir un mismo concepto de la misma forma en toda la base de datos: materias, géneros, medios y sistemas sonoros, instrumentos, idiomas y listas cerradas.',
      },
      {
        nombre: 'Clasificación Hornbostel-Sachs',
        acceso: 'publico',
        descripcion:
          'Sistema académico de clasificación de instrumentos musicales. SIMR lo integra como asistente con el árbol jerárquico completo (643 nodos desde MIMO) y la posibilidad de afinar con sufijos como «-6 con púa» o «-8 con teclado».',
        contenido: [
          'Al escribir el nombre del instrumento, el sistema detecta automáticamente el instrumento universal más cercano entre más de 1760 y sugiere su clasificación.',
        ],
      },
      {
        nombre: 'Formatos de presentación de búsqueda',
        acceso: 'publico',
        descripcion:
          'Los resultados de la búsqueda general pueden verse en tres formatos bibliográficos: formato SIMR, MARC 21 (estándar internacional de catalogación) y Dublin Core (esquema de metadatos para recursos digitales).',
      },
      {
        nombre: 'Números normalizados',
        acceso: 'publico',
        descripcion:
          'Estándar que identifica unívocamente al recurso, junto con la sigla del estándar universal correspondiente. Su sigla y frase se gestionan desde el módulo Listas (lista «nNormalizados»).',
        contenido: [
          'DOI (Digital Object Identifier) — ISO 26324: código de 16 dígitos que identifica de forma inequívoca un objeto digital: artículo de revista, libro, archivo de audio o sitio web.',
          'ISAN (International Standard Audiovisual Number) — ISO 15706: código de 12 dígitos para obras audiovisuales: películas, programas de televisión y vídeos musicales.',
          'ISBN (International Standard Book Number) — ISO 2108: código de 13 dígitos para publicaciones monográficas y otros materiales impresos.',
          'ISMN (International Standard Music Number) — ISO 10957: código de 13 dígitos para publicaciones de música notada.',
          'ISRC (International Standard Recording Code) — ISO 3901: código de 12 dígitos para grabaciones sonoras y videograbaciones de música.',
          'ISSN (International Standard Serial Number) — ISO 3297: código de 8 dígitos para publicaciones seriadas, como revistas y periódicos.',
          'ISWC (International Standard Musical Work Code) — ISO 15707: código de 12 dígitos para obras musicales.',
          'Estos son los números normalizados que se encuentran con más frecuencia entre los tipos de recursos del Fondo de Investigación y Documentación de Músicas Regionales.',
        ],
      },
      {
        nombre: 'Glottocode, ISO, endónimo y exónimo',
        acceso: 'publico',
        descripcion:
          'El registro de idiomas usa códigos internacionales (ISO 639, Glottocode) junto con el endónimo (nombre que una lengua se da a sí misma) y el exónimo en español, respetando las denominaciones propias de cada comunidad.',
      },
      {
        nombre: 'Disponibilidad y ejemplar',
        acceso: 'publico',
        descripcion:
          'Un mismo recurso puede tener varios ejemplares físicos; de cada uno se registra su ubicación (fondo y colección), número de ejemplar, disponibilidad y estados asociados.',
        contenido: [
          'Fondo: conjunto orgánico de documentos reunidos en un proceso natural, generados o recibidos por una persona física o jurídica a lo largo de su existencia y en el ejercicio de sus funciones. Es el nivel más alto de la descripción archivística.',
          'Colección: conjunto de documentos reunidos según criterios subjetivos (por ejemplo, un tema determinado) que no conserva una estructura orgánica ni responde al principio de procedencia.',
          'La distinción es clave: el fondo se formó de manera orgánica y natural, mientras que la colección es una acumulación artificial unida por alguna característica común (procedencia, materia, lengua, soporte o coleccionista).',
        ],
      },
      {
        nombre: 'Flujo de trabajo básico',
        acceso: 'publico',
        descripcion:
          'El trabajo en todos los módulos de catalogación sigue el mismo flujo: buscar en el listado, crear con el formulario, ver el detalle, editar y, si hace falta, borrar con confirmación.',
        contenido: [
          '1. Listado: cada módulo abre en su lista de registros, con buscador, filtros y selector de columnas. Desde aquí se llega a crear, ver y editar.',
          '2. Crear: el botón «Nuevo» abre el formulario organizado en secciones colapsables; se guarda al final de la página.',
          '3. Ver detalle: la ficha completa del registro, con las mismas secciones y con mapa y línea de tiempo cuando hay anotaciones.',
          '4. Editar: el formulario se vuelve a abrir con los datos cargados; cualquier cambio se guarda con el mismo botón.',
          '5. Borrar: la eliminación siempre pide confirmación antes de ejecutarse y queda registrada en la auditoría.',
        ],
      },
    ],
  },
  {
    id: 'modelo-datos',
    titulo: 'Modelo de datos: campos y definiciones',
    icono: 'schema',
    descripcion:
      'Glosario de las entidades del modelo de datos y de cada campo de catalogación, con las definiciones conceptuales (IASA, ISBD, RDA) en las que se basan los formularios.',
    modulos: [
      {
        nombre: 'Obra',
        acceso: 'publico',
        descripcion:
          'Elemento abstracto que hace referencia al resultado de un trabajo creativo que constituye una unidad en sí mismo.',
        contenido: [
          'Título (IASA): el título propio es el nombre principal de un documento, incluyendo cualquier título alternativo, pero excluyendo los títulos paralelos, el subtítulo y la información complementaria sobre el título.',
          'Transcripción (IASA): el título propio se transcribe exactamente como aparece en la fuente principal de información, con acentos y signos diacríticos, aunque sin atenerse necesariamente a su puntuación o uso de mayúsculas.',
          'Títulos paralelos (ISBD): título en otra lengua o escritura que se presenta como equivalente del título propiamente dicho en las fuentes de información preferidas.',
          'Subtítulo o información complementaria (ISBD): palabra o frase unida y subordinada al título propio que califica, explica o complementa el título.',
          'Descripción: texto que resume de manera abreviada, objetiva y precisa aspectos como la procedencia, el tipo y las características de la obra, sin interpretación crítica.',
          'Tipo: medio dentro del cual se expresa una creación.',
          'Contenedor: indicación de si una obra contiene o no otras obras y cuáles son sus títulos.',
          'Asiento ligado: identificador de una segunda obra y su relación con la actual. Tiene dos campos: dirección (A-B: de la obra actual a la asiento, B-A o bi-direccional) y fuente (actor que suministra la información de la relación).',
          'Género forma: categoría que reúne obras musicales que comparten criterios de afinidad estructural, de función social o de contextualidad o denominación de un grupo social.',
          'Materia: áreas o campos del conocimiento en los que se inscribe o podría relacionarse el recurso.',
          'Medio sonoro: tipo de agrupación, instrumento o instrumentos (con cantidad) que caracterizan el recurso; aplica solo a recursos musicales.',
          'Sistema sonoro: conjunto de elementos correlacionados que definen la estructura musical (afinación, organización melódico-armónica, sistemas rítmicos); aplica solo a recursos musicales.',
          'Idioma: sistema o sistemas lingüísticos del recurso; puede referirse a familia, idioma o dialecto, y no coincide por completo con el estándar ISO 639-1.',
          'Actor: sujeto(s) que interviene(n) en el evento relacionado con la obra. Incluye las menciones de responsabilidad, pero no se limita a ellas.',
          'Denominación regional: nombre con el que un grupo social específico identifica la obra.',
          'Género forma no musical: categorías que se aplican a obras no musicales o a asuntos no musicales de obras musicales.',
          'Anotación cartográfico-temporal: descripción del origen, localización y ámbito de vigencia de la obra en términos cartográficos (geográfico, socio-cultural) y cronológicos.',
          'Descriptor libre: categoría que agrupa elementos específicos no clasificables en los demás descriptores de la base de datos.',
          'Proyectos asociados y Enlaces y archivos: proyectos de investigación vinculados y URLs de recursos relacionados.',
        ],
        extras: ['IASA', 'ISBD', 'RDA'],
      },
      {
        nombre: 'Actor',
        acceso: 'publico',
        descripcion:
          'Sujeto (natural o jurídico) relacionado con un registro por distintas razones.',
        contenido: [
          'Nombre: nombre de pila o nombre que consiste en palabras, iniciales, letras, etc., en formato de orden directo.',
          'Apellidos: apellido simple o compuesto con formato de orden invertido, o nombre simple sin nombres de pila que se sabe se usa como apellido.',
          'Nombre corporativo: nombre de una entidad corporativa (o de su primera subordinada), de una jurisdicción bajo la que se asientan una entidad, una sección de ciudad o el título de una obra, o de una jurisdicción que corresponde a una entidad eclesiástica.',
          'Nombre de reunión: nombre de un conjunto de actores reunidos para un evento determinado.',
          'Asiento ligado: identificador de un segundo recurso y su relación con el recurso actual.',
          'Contenedor: actores que forman parte de una reunión.',
          'Anotaciones cartográfico-temporales: fechas o rangos asociados (composición, grabación, copyright) con lugar, registrados en términos geográfico-sociales y cronológicos.',
          'Descriptor libre y enlaces y archivos: elementos no clasificables y URLs de recursos relacionados con el actor.',
        ],
        extras: ['RDA', 'IASA'],
      },
      {
        nombre: 'Recurso',
        acceso: 'publico',
        descripcion:
          'Elemento tangible o intangible que forma parte de la colección y puede o no contener otros recursos. En el SIMR los recursos del Fondo son siempre elementos físicos o digitales tangibles.',
        contenido: [
          'Título: título completo del documento.',
          'Descripción (RDA): resumen abreviado de procedencia, tipo y contenido; puede ser integral (describe el recurso como un todo), analítica (describe una parte de un recurso mayor) o jerárquica (el todo y al menos una de sus partes, nivel a nivel).',
          'Menciones de responsabilidad: actores responsables de la existencia del recurso (escritores, compositores, intérpretes, arreglistas, cartógrafos, programadores, investigadores principales…).',
          'Números normalizados: estándar que identifica unívocamente el recurso (DOI, ISAN, ISBN, ISMN, ISRC, ISSN, ISWC).',
          'Faceta: código alfanumérico interno de la unidad de información que identifica el recurso.',
          'Tipo: categoría a la que pertenece el recurso, según el tipo de soporte y el dispositivo necesario para verlo, reproducirlo o ejecutarlo.',
          'Fuente: datos técnicos del origen: lugar, nombre del editor/productor/distribuidor, fecha de publicación, y lugar o fecha de impresión cuando se conocen.',
          'Contenedor: precisión sobre si el recurso contiene o no otros recursos.',
          'Obras relacionadas: obras incluidas o mencionadas en el recurso.',
          'Material acompañante y mención de serie: material que hace parte integral del recurso, y la serie de la que hace parte.',
          'Descripción técnica (condensada): extensión física (número de unidades), tipo de soporte (CD, casete, disco de pasta…), duración en HH:MM:SS, tipo de grabación, código SPARS (AAA/ADD/DDD: grabación-mezcla-reproducción analógica o digital), velocidad de reproducción (rpm en discos, cm/s en cintas), n.º de pistas y canales (mono, estéreo…), sonido y color en vídeo, y las dimensiones físicas del soporte.',
          'Materia e idiomas: áreas del conocimiento y sistemas lingüísticos del recurso.',
          'Anotaciones cartográfico-temporales: origen, localización y ámbito de vigencia en términos geográfico-sociales y cronológicos.',
          'Descriptor libre, proyectos asociados, enlaces y archivos: elementos no clasificables, proyectos y URLs relacionados.',
        ],
        extras: ['RDA', 'ISBD', 'IASA', 'SPARS'],
      },
      {
        nombre: 'Ejemplar',
        acceso: 'publico',
        descripcion:
          'Cada uno de los ítems de un documento, resultado de una edición o tiraje determinada.',
        contenido: [
          'Recurso: elemento tangible que forma parte de la colección y al que corresponde el ejemplar.',
          'Número de ejemplar: número que identifica unívocamente un ejemplar de un recurso determinado.',
          'Disponibilidad: palabra o frase que describe si el ejemplar está a disposición de uso y, en caso contrario, en dónde se encuentra.',
          'Fondo: conjunto orgánico de documentos surgidos de forma natural a lo largo de la existencia del organismo que los generó o recibió.',
          'Colección: conjunto de documentos reunidos según criterios subjetivos (p. ej. un tema), sin estructura orgánica.',
          'Procedencia: origen del ejemplar y la historia de su custodia y llegada a la colección.',
          'Estado: descripción del momento del ciclo de vida y las propiedades físicas actuales del ejemplar.',
        ],
        extras: ['Descripción archivística'],
      },
      {
        nombre: 'Proyecto',
        acceso: 'publico',
        descripcion:
          'Proyectos de investigación o extensión asociados a un registro.',
        contenido: [
          'Nombre: identifica unívocamente el proyecto',
          'Estado: momento actual del ciclo de vida del proyecto.',
          'Actores: actores relacionados con el proyecto, con su rol y las fechas de la relación.',
          'Fechas: fechas ligadas al desarrollo o al objeto del proyecto.',
          'Descriptores libres y enlaces: elementos no clasificables y URLs relacionados.',
        ],
      },
      {
        nombre: 'Fondo',
        acceso: 'publico',
        descripcion:
          'Fondo bibliográfico de una unidad de información o parte caracterizada por su disciplina, procedencia o encuadernación. En descripción archivística es el nivel más alto de descripción.',
        contenido: [
          'Nombre: identifica unívocamente el fondo documental y se asigna en el momento de su constitución.',
          'Fecha de creación: fecha en que se constituye formalmente el fondo.',
          'Tipo: categoría que describe o agrupa los tipos principales de elementos del fondo.',
          'Propiedad o comodato: descripción de la relación de posesión sobre el fondo y de los que la respaldan.',
        ],
        extras: ['Descripción archivística'],
      },
      {
        nombre: 'Colección',
        acceso: 'publico',
        descripcion:
          'Conjunto de elementos de la unidad de información que presenta una unidad temática; acumulación artificial de materiales unidos por una característica común.',
        contenido: [
          'Nombre: identifica unívocamente la colección y se asigna en su constitución.',
          'Fecha: constitución formal de la colección.',
          'Tipo: categoría de los elementos principales de la colección.',
          'Propiedad o comodato: descripción de la relación de posesión y los documentos que la respaldan.',
        ],
      },
      {
        nombre: 'Instrumento',
        acceso: 'publico',
        descripcion:
          'Objeto que produce sonido y utilizado para hacer música.',
        contenido: [
          'Nombre: denominación comúnmente usada para designar el instrumento.',
          'Clasificación: sistema de clasificación Hornbostel-Sachs.',
          'Nombres alternativos: otras denominaciones asociadas a un contexto sociocultural.',
          'Proyectos asociados: proyectos de investigación vinculados.',
          'Anotaciones cartográfico-temporales: origen, localización y vigencia del instrumento.',
          'Descriptor libre y enlaces: elementos no clasificables y URLs.',
        ],
        extras: ['Hornbostel-Sachs'],
      },
      {
        nombre: 'Medio (sonoro)',
        acceso: 'publico',
        descripcion:
          'Medio sonoro o formato: tipo de agrupación o formato en el que suele interpretarse la música.',
        contenido: [
          'Nombre: denominación común del medio o formato.',
          'Nombres alternativos: otras denominaciones según el contexto sociocultural.',
          'Instrumentos: instrumentos que participan del medio, con su rol (función en el discurso sonoro) y cantidad.',
          'Proyectos asociados: proyectos vinculados.',
          'Anotaciones cartográfico-temporales: origen y vigencia del medio.',
          'Descriptor libre y enlaces: elementos no clasificables y URLs.',
        ],
      },
      {
        nombre: 'Sistema',
        acceso: 'publico',
        descripcion:
          'Conjunto de elementos correlacionados que definen la estructura musical respecto de un aspecto específico; aplica solo a recursos musicales.',
        contenido: [
          'Nombre: denominación del sistema (afinación, organización melódico-armónica, rítmica, métrica).',
          'Descripción: resumen objetivo de las características del sistema.',
          'Nombres alternativos: otras denominaciones socio-culturales.',
          'Sistemas relacionados, padre e hijo: relaciones jerárquicas y no jerárquicas entre sistemas.',
          'Proyectos, anotaciones cartográfico-temporales, descriptores y enlaces: como en los demás módulos.',
        ],
      },
      {
        nombre: 'Materia',
        acceso: 'publico',
        descripcion:
          'Áreas o campos del conocimiento en los que se inscribe o podría relacionarse un recurso.',
        contenido: [
          'Nombre: designación formal y estandarizada de la materia.',
          'Descripción y nombres alternativos: resumen y otras denominaciones epistemológicas o regionales.',
          'Relaciones: materias relacionadas (no jerárquica) y jerárquicas (padres e hijas).',
          'Descriptores libres y enlaces: elementos no clasificables y URLs.',
        ],
      },
      {
        nombre: 'Género (musical)',
        acceso: 'publico',
        descripcion:
          'Categoría que reúne obras musicales que comparten criterios de afinidad estructural, de función social o de género.',
        contenido: [
          'Nombre y descripción: denominación y resumen del género o forma musical.',
          'Nombres alternativos: otras denominaciones socio-culturales.',
          'Relaciones: géneros relacionados, padre e hijo.',
          'Medios y sistemas asociados: medios sonoros donde se interpreta y sistemas de la estructura musical.',
          'Idiomas, proyectos, anotaciones cartográfico-temporales, descriptores y enlaces.',
        ],
      },
      {
        nombre: 'Género no musical',
        acceso: 'publico',
        descripcion:
          'Categorías de recursos no musicales con características compartidas por estructura, función o contexto.',
        contenido: [
          'Nombre, descripción y nombres alternativos: como en Géneros musicales.',
          'Relaciones: géneros relacionados, padres e hijos.',
          'Idiomas: familia, idioma o dialecto de las obras no musicales.',
          'Anotaciones cartográfico-temporales, descriptores libres y enlaces: como en el resto de módulos.',
        ],
      },
      {
        nombre: 'Diccionario',
        acceso: 'publico',
        descripcion:
          'Diccionario del sistema: describe cada campo de la base para guiar la catalogación.',
        contenido: [
          'Tabla: entidad de la base de datos a la pertenece el campo.',
          'Campo abreviado: abreviatura del nombre del campo.',
          'Campo largo: nombre extendido del campo.',
          'Definición: explicación que delimita el concepto del campo.',
        ],
      },
    ],
  },
  {
    id: 'catalogacion',
    titulo: 'Catalogación',
    icono: 'inventory_2',
    descripcion:
      'Registro y gestión de los registros del acervo: obras, actores, recursos, ejemplares, proyectos, fondos y colecciones. Requiere sesión para crear o editar.',
    modulos: [
      {
        nombre: 'Obras',
        ruta: '/obras',
        acceso: 'sesion',
        descripcion:
          'Catalogación completa de obras musicales y no musicales: títulos, actores con rol, géneros, materias, fechas con precisión, notas de programa, anotaciones cartográfico-temporales, descriptores, enlaces y archivos.',
        campos: ['Título', 'Actores y roles', 'Géneros', 'Materias', 'Fechas con precisión', 'Notas de programa'],
        extras: ['15 secciones colapsables', 'Autocompletado con creación', 'Mapa y línea de tiempo', 'Archivos'],
      },
      {
        nombre: 'Actores',
        ruta: '/actores',
        acceso: 'sesion',
        descripcion:
          'Registro de personas y colectivos relacionados con el acervo: compositores, intérpretes, agrupaciones. Incluye nombre artístico, nombre de reunión, contenedores, anotaciones cartográfico-temporales y descriptores.',
        campos: ['Nombres', 'Apellidos', 'Nombre artístico', 'Nombre de reunión', 'Contenedores', 'Descriptores'],
        extras: ['Anotaciones cartográficas con mapa', 'Selector de columnas', 'Archivos'],
      },
      {
        nombre: 'Recursos',
        ruta: '/recursos',
        acceso: 'sesion',
        descripcion:
          'Catalogación de los recursos o documentos del acervo: partituras, audios, textos, materiales audiovisuales. Formulario extenso en secciones colapsables con autocompletado de entidades relacionadas.',
        campos: ['Título', 'Menciones de responsabilidad', 'Tipos de recurso', 'Materias', 'Idiomas', 'Contenedores', 'Series'],
        extras: ['15 secciones colapsables', 'Editor inline de tipos y fechas', 'Autocompletado con creación', 'Mapa y línea de tiempo'],
      },
      {
        nombre: 'Ejemplares',
        ruta: '/ejemplares',
        acceso: 'sesion',
        descripcion:
          'Gestión de las copias físicas de los recursos: número de ejemplar, disponibilidad, fondo y colección a la que pertenece, procedencia y estados.',
        campos: ['Recurso', 'Número de ejemplar', 'Disponibilidad', 'Fondo', 'Colección', 'Procedencia', 'Estados'],
        extras: ['Estados editables en línea', 'Autocompletado'],
      },
      {
        nombre: 'Proyectos',
        ruta: '/proyectos',
        acceso: 'sesion',
        descripcion:
          'Registro de proyectos de investigación o producción vinculados al acervo: investigadores, fechas asociadas, estado y descriptores.',
        campos: ['Nombre', 'Investigadores', 'Fechas asociadas con precisión', 'Estado', 'Descriptores'],
        extras: ['Relaciones con actores', 'Fechas con precisión', 'Archivos'],
      },
      {
        nombre: 'Fondos',
        ruta: '/fondos',
        acceso: 'sesion',
        descripcion:
          'Registro de fondos documentales o patrimoniales: nombre, tipo, propiedad o comodato y fecha de creación con precisión.',
        campos: ['Nombre', 'Tipo', 'Propiedad o comodato', 'Fecha con precisión'],
      },
      {
        nombre: 'Colecciones',
        ruta: '/colecciones',
        acceso: 'sesion',
        descripcion:
          'Registro de colecciones con la misma estructura que Fondos: nombre, tipo, propiedad o comodato y fecha.',
        campos: ['Nombre', 'Tipo', 'Propiedad o comodato', 'Fecha con precisión'],
      },
    ],
  },
  {
    id: 'vocabularios',
    titulo: 'Vocabularios controlados',
    icono: 'local_library',
    descripcion:
      'Tesauros y listas controladas que alimentan la catalogación: materias, medios y sistemas sonoros, instrumentos, géneros, idiomas, diccionario y listas cerradas. Requieren sesión para editar.',
    modulos: [
      {
        nombre: 'Materias',
        ruta: '/materias',
        acceso: 'sesion',
        descripcion:
          'Registro de materias o temas controlados con relaciones jerárquicas (padres, hijos, relacionadas).',
        campos: ['Nombre', 'Alias', 'Relaciones', 'Descripción', 'Descriptores'],
        extras: ['Selector de columnas con preferencias', 'Relaciones jerárquicas'],
      },
      {
        nombre: 'Medios sonoros',
        ruta: '/medios',
        acceso: 'sesion',
        descripcion:
          'Registro de medios sonoros (formatos de difusión sonora): instrumentos asociados con cantidad y rol, proyectos y anotaciones cartográfico-temporales.',
        campos: ['Nombre', 'Alias', 'Instrumentos con cantidad y rol', 'Proyectos'],
        extras: ['Mapa y línea de tiempo', 'Patrón visual de la plataforma'],
      },
      {
        nombre: 'Sistemas sonoros',
        ruta: '/sistemas',
        acceso: 'sesion',
        descripcion:
          'Registro de sistemas sonoros con relaciones entre sí: sistemas padre, hijo y relacionados.',
        campos: ['Nombre', 'Descripción', 'Alias', 'Relaciones', 'Proyectos'],
        extras: ['Relaciones padre/hijo/relacionado', 'Mapa y línea de tiempo'],
      },
      {
        nombre: 'Instrumentos',
        ruta: '/instrumentos',
        acceso: 'sesion',
        descripcion:
          'Catalogación de instrumentos musicales con clasificación académica Hornbostel-Sachs: asistente guiado, árbol jerárquico y auto-detección universal al escribir el nombre.',
        campos: ['Nombre', 'Clasificación Hornbostel-Sachs', 'Alias', 'Proyectos'],
        extras: [
          'Asistente HS con 643 nodos desde MIMO',
          'Auto-detect con más de 1760 instrumentos universales',
          'Sufijos: -6 con púa, -8 con teclado',
        ],
      },
      {
        nombre: 'Géneros o formas',
        ruta: '/generos',
        acceso: 'sesion',
        descripcion:
          'Registro de géneros o formas musicales con relaciones padre/hijo/relacionado, idiomas, sistemas y medios sonoros, proyectos y anotaciones.',
        campos: ['Nombre', 'Descripción', 'Alias', 'Relaciones', 'Idiomas', 'Sistemas y medios sonoros', 'Proyectos'],
        extras: ['Relaciones jerárquicas completas', 'Mapa y línea de tiempo'],
      },
      {
        nombre: 'Géneros no musicales',
        ruta: '/generos-no-musicales',
        acceso: 'sesion',
        descripcion:
          'Registro de formas no musicales con una estructura similar a Géneros, pero sin sistemas sonoros ni medios sonoros ni proyectos.',
        campos: ['Nombre', 'Descripción', 'Alias', 'Relaciones', 'Idiomas'],
        extras: ['Mapa y línea de tiempo'],
      },
      {
        nombre: 'Idiomas',
        ruta: '/idiomas',
        acceso: 'sesion',
        descripcion:
          'Registro de lenguas con una perspectiva decolonial: glottocode, código ISO, endónimo y exónimo en español, familia lingüística, transmisión y contexto territorial.',
        campos: ['Nombre', 'Glottocode', 'Código ISO', 'Endónimo', 'Exónimo en español', 'Familia', 'Transmisión', 'Contexto territorial'],
        extras: [
          'Carga inicial de 334 lenguas de América (botón Semillero)',
          'Ayudas contextuales con definiciones del diccionario',
        ],
      },
      {
        nombre: 'Diccionario',
        ruta: '/diccionarios',
        acceso: 'sesion',
        descripcion:
          'Diccionario del sistema: definiciones de términos para guiar la catalogación. Alimenta las ayudas contextuales (help-popup) de otros módulos.',
        campos: ['Tabla', 'Campo', 'Campo largo', 'Definición'],
      },
      {
        nombre: 'Listas',
        ruta: '/listas',
        acceso: 'sesion',
        descripcion:
          'Mantenimiento de listas cerradas que alimentan los formularios (como la de números normalizados).',
        campos: ['Nombre de la lista', 'Elementos (sigla, frase, texto)'],
      },
    ],
  },
  {
    id: 'visualizacion',
    titulo: 'Visualización de datos',
    icono: 'insights',
    descripcion:
      'Herramientas para analizar el conjunto del catálogo de forma visual. Son públicas: no se necesita sesión para consultarlas.',
    modulos: [
      {
        nombre: 'Grafo de base de datos',
        ruta: '/graph',
        acceso: 'publico',
        descripcion:
          'Visualiza todo el grafo de la base: nodos de obras, actores, recursos, géneros, materias y más, unidos por sus relaciones. Haz clic en un nodo para ir a su ficha.',
        extras: ['Gráfico de fuerzas D3', 'Zoom, desplazamiento y arrastre', 'Tooltip de nodos', 'Filtrado por entidad'],
      },
      {
        nombre: 'Mapa visualizador global',
        ruta: '/mapa-visualizador',
        acceso: 'publico',
        descripcion:
          'Visualizador cartográfico global: todas las anotaciones con coordenadas del catálogo en un mapa, con filtros por entidad y búsqueda de texto.',
        extras: ['MapLibre GL', 'Filtros por entidad con colores', 'Popups en hover'],
      },
      {
        nombre: 'Línea de tiempo global',
        ruta: '/linea-tiempo',
        acceso: 'publico',
        descripcion:
          'Línea de tiempo con todas las anotaciones temporales del catálogo; cada anotación muestra su detalle: lugar, fechas, precisión, evidencia y coordenadas.',
        extras: ['ngx-timeline', 'Filtro por tipo y texto', 'Detalle desplegable'],
      },
      {
        nombre: 'Estadísticas',
        ruta: '/estadisticas',
        acceso: 'publico',
        descripcion:
          'Estadísticas del estado del catálogo: cuántos registros hay por tipo, qué campos están completos y búsqueda directa hasta los registros reales.',
        extras: ['Gráficos Chart.js', 'Tarjetas de resumen', 'Drill-down por campo y completitud'],
      },
    ],
  },
  {
    id: 'opac',
    titulo: 'Catálogo público (OPAC)',
    icono: 'travel_explore',
    descripcion:
      'Consulta para visitantes sin sesión. Con el buscador puedes navegar por toda la información pública del catálogo.',
    modulos: [
      {
        nombre: 'Búsqueda general',
        ruta: '/search',
        acceso: 'publico',
        descripcion:
          'Búsqueda global en todas las entidades con soporte de formatos de presentación: SIMR, MARC 21 y Dublin Core. Incluye resaltado de resultados y operadores booleanos.',
        extras: ['3 formatos de presentación', 'Resaltado en resultados', 'Sugerencias'],
      },
      {
        nombre: 'Búsqueda avanzada',
        ruta: '/opac/multi',
        acceso: 'publico',
        descripcion:
          'Búsqueda multicriterio que combina obra, actor, rol, género, recurso, instrumento, materia, medio, sistema, idioma y proyecto.',
      },
      {
        nombre: 'Obras, Actores, Fondos, Roles, Instrumentos y Géneros',
        ruta: '/opac',
        acceso: 'publico',
        descripcion:
          'Vistas públicas para consultar por título de obra, por actor, por fondos y colecciones, por rol en el acervo, por instrumento y por géneros.',
      },
    ],
  },
  {
    id: 'utilidades',
    titulo: 'Utilidades',
    icono: 'construction',
    descripcion:
      'Herramientas complementarias de la aplicación: repositorio de archivos, estadísticas de uso y soporte.',
    modulos: [
      {
        nombre: 'Nube de archivos',
        ruta: '/nube-archivos',
        acceso: 'sesion',
        descripcion:
          'Repositorio de los archivos digitales en MinIO: subir, añadir etiquetas, asignar color y buscar.',
        campos: ['Nombre original', 'Tipo MIME', 'Tamaño', 'Etiquetas', 'Color', 'Usuario'],
        extras: ['Subida de archivos', 'Filtro por etiquetas', 'Carátulas de color', 'Paginación'],
      },
      {
        nombre: 'Estadísticas de uso',
        ruta: '/estadisticas-uso',
        acceso: 'sesion',
        descripcion:
          'Panel de uso de la plataforma: sesiones por día, visitas a los módulos, uso por rol y acciones por tipo de registro.',
        extras: ['Gráficos de barras y dona', 'Pestañas por vista'],
      },
      {
        nombre: 'Soporte',
        ruta: '/soporte',
        acceso: 'sesion',
        descripcion:
          'Mesa de tickets: crear, seguir el estado y la prioridad; el equipo de soporte responde en el mismo ticket.',
        campos: ['N.º de ticket', 'Asunto', 'Descripción', 'Estado', 'Prioridad', 'Respuestas'],
        extras: ['Resaltado de las respuestas del personal'],
      },
    ],
  },
  {
    id: 'administracion',
    titulo: 'Administración',
    icono: 'admin_panel_settings',
    descripcion:
      'Herramientas exclusivas del rol administrador: usuarios, roles, auditoría, configuración de la nube, reemplazo masivo, importación de Excel y respaldos.',
    modulos: [
      {
        nombre: 'Usuarios',
        ruta: '/admin/usuarios',
        acceso: 'admin',
        descripcion: 'Gestionar cuentas de usuario: crear, editar, activar y asignar roles.',
      },
      {
        nombre: 'Roles y permisos',
        ruta: '/admin/roles',
        acceso: 'admin',
        descripcion:
          'Crear y editar los roles con su prioridad, nombre visible y permisos sobre cada entidad del sistema.',
      },
      {
        nombre: 'Auditoría',
        ruta: '/admin/auditoria',
        acceso: 'admin',
        descripcion:
          'Registro de todas las acciones de la plataforma (crear, actualizar, eliminar, inicio y cierre de sesión, asignación de roles) con filtros y paginación.',
        extras: ['Filtro por entidad, acción y rango de fechas', 'Paginación'],
      },
      {
        nombre: 'Nube de archivos (config)',
        ruta: '/admin/nube-config',
        acceso: 'admin',
        descripcion:
          'Configuración de la nube de almacenamiento, por ejemplo el tamaño máximo permitido para los archivos.',
      },
      {
        nombre: 'Reemplazar en BD',
        ruta: '/admin/db-replace',
        acceso: 'admin',
        descripcion:
          'Buscar un valor que aparezca en cualquier campo de la base y reemplazarlo en lote en los documentos seleccionados.',
      },
      {
        nombre: 'Importar desde Excel',
        ruta: '/admin/importar-excel',
        acceso: 'admin',
        descripcion:
          'Asistente de importación de datos desde Excel: subir el archivo, enlazar cada columna con el campo del sistema, revisar las validaciones y resolver valores de referencia antes de ejecutar.',
        extras: ['Asistente en pasos', 'Asignación de columnas', 'Detección de duplicados'],
      },
      {
        nombre: 'Respaldo y restauración',
        ruta: '/admin/backup-restore',
        acceso: 'admin',
        descripcion:
          'Exportar las entidades seleccionadas a un archivo de respaldo JSON y restaurar la base desde un respaldo.',
      },
    ],
  },
  {
    id: 'cuenta',
    titulo: 'Cuenta y acceso',
    icono: 'account_circle',
    descripcion:
      'Iniciar sesión, crear cuenta, recuperar o cambiar la contraseña. La cuenta nueva empieza con permiso de solo lectura.',
    modulos: [
      {
        nombre: 'Iniciar sesión y registrarse',
        acceso: 'publico',
        descripcion:
          'El registro es abierto; la cuenta nueva empieza con permiso de solo lectura. El administrador asigna roles y permisos con los que podrás catalogar o administrar.',
      },
      {
        nombre: 'Recuperación y cambio de contraseña',
        acceso: 'publico',
        descripcion:
          'La contraseña se recupera por correo desde la pantalla de inicio de sesión y se cambia en cualquier momento desde el menú de la cuenta.',
      },
    ],
  },
  {
    id: 'arquitectura',
    titulo: 'Arquitectura y tecnología',
    icono: 'lan',
    descripcion:
      'Cómo está construido el SIMR por dentro: arquitectura, pilas, servicios, despliegue y estructura del código. Información para perfiles técnicos, actualizada a la versión actual.',
    modulos: [
      {
        nombre: 'Vista general de la arquitectura',
        acceso: 'publico',
        descripcion:
          'El sistema es una arquitectura MEAN: MongoDB (M), Express (E), Angular (A) y Node (N), más una nube privada de archivos compatible con S3 (MinIO).',
        contenido: [
          'La API (Express) expone los endpoints de catalogación, búsqueda y configuración sobre MongoDB.',
          'La interfaz está hecha en Angular (componentes standalone) y se sirve a través de Nginx, que también actúa como proxy inverso de la API.',
          'Los archivos se suben a MinIO (nube privada) y sus metadatos quedan registrados en la base de datos.',
          'Cada módulo del front se organiza en «features/<modulo>» con el mismo patrón: datos, dominio y presentación.',
        ],
        campos: ['Angular', 'Express', 'MongoDB', 'MinIO', 'Node.js', 'Nginx'],
      },
      {
        nombre: 'Stack del front-end',
        acceso: 'publico',
        descripcion:
          'Estado actual: Angular 20+ (v21) con componentes standalone, Angular Material con un tema propio de la identidad SIMR, estado con @ngrx/signals y visualizaciones web con MapLibre, D3, Chart.js y ngx-timeline.',
        contenido: [
          'Angular 21 compilado con el builder @angular/build.',
          'Formularios reactivos como estándar de todos los módulos.',
          'Rutas lazy con loadComponent y guards de permisos.',
          'Estado de listas, filtros y paginación en SignalStore.',
          'Mapas con MapLibre GL (WebGL) y popups en hover; línea de tiempo con ngx-timeline.',
          'Gráficos con Chart.js y grafo con D3.js v7.',
        ],
        campos: ['Angular Material', '@ngrx/signals', 'MapLibre GL', 'D3.js', 'Chart.js', 'ngx-timeline'],
      },
      {
        nombre: 'Stack del back-end',
        acceso: 'publico',
        descripcion:
          'El back-end está en Node.js con Express 4 y Mongoose: modelos Mongo, controladores REST, autenticación Passport (JWT y cookies), servicios de archivos y auditoría.',
        contenido: [
          'Autenticación con JWT y refresh token en cookies; soporta Google OAuth.',
          'Modelos de todas las entidades: obras, actores, recursos, ejemplares y demás.',
          'Endpoints: /api/<entidad> y servicios transversales como /api/search, /api/opac, /api/graph, /api/stats, /api/import, /api/backup y /api/files.',
          'Todas las acciones relevantes se registran en la colección de auditoría.',
        ],
        campos: ['Express', 'Mongoose', 'Passport (JWT, OAuth)', 'Multer', 'MinIO SDK', 'jsonwebtoken'],
      },
      {
        nombre: 'Base de datos MongoDB',
        acceso: 'publico',
        descripcion:
          'La base es MongoDB; las colecciones principales reflejan los módulos de catalogación y las colecciones de sistema gestionan acceso y auditoría.',
        contenido: [
          'Colecciones de módulos: obras, actores, recursos, ejemplares, materias, medios, sistemas, instrumentos, géneros, idiomas…',
          'Colecciones de sistema: usuarios, roles, permisos, auditlogs, soporte, listas.',
          'Los registros se guardan como documentos JSON flexibles; las relaciones suelen guardarse como referencias entre documentos.',
        ],
      },
      {
        nombre: 'Despliegue y entorno',
        acceso: 'publico',
        descripcion:
          'El proyecto se despliega con Docker Compose: MongoDB, MinIO, front, back y Nginx se definen como servicios y se levantan juntos.',
        contenido: [
          'docker-compose.dev.yml define: mongodb, minio, minio-init, simr-back, simr-front y web_server (nginx).',
          'Puertos típicos: MongoDB 27017, MinIO 9000/9001, backend 3000, front 4200 (desarrollo), web 80.',
          'La persistencia se guarda en volúmenes de Docker.',
        ],
      },
      {
        nombre: 'Puesta en marcha (desarrollo)',
        acceso: 'publico',
        descripcion:
          'Para levantar todo el entorno (comandos para el equipo técnico):',
        contenido: [
          'docker compose -f docker-compose.dev.yml up -d --build',
          'docker compose -f docker-compose.dev.yml logs -f simr-front',
          'docker compose -f docker-compose.dev.yml down',
          'Tras cambios en el front puede ser necesario reconstruir el contenedor para limpiar la caché de Angular.',
        ],
      },
    ],
  },
  {
    id: 'desarrolladores',
    titulo: 'Guía para desarrolladores',
    icono: 'terminal',
    descripcion:
      'Buenas prácticas, estructura de los módulos, componentes compartidos y comandos útiles para editar y mantener el código del SIMR.',
    modulos: [
      {
        nombre: 'Patrón de cada módulo CRUD',
        acceso: 'publico',
        descripcion:
          'Cada módulo de catalogación sigue el mismo patrón para mantener estilo y comportamiento consistente: ruta lazy, listado, formulario, detalle y servicio de datos.',
        contenido: [
          '1. Entrada del menú con ruta «/<modulo>» usando loadComponent y guards de permisos.',
          '2. Listado: tabla o rejilla de tarjetas con filtros y selector de columnas.',
          '3. Formulario: formularios reactivos, secciones con CollapsibleSection y guardado.',
          '4. Detalle: ficha completa en secciones con anotaciones y archivos.',
          '5. Servicio: HttpClient hacia el endpoint, con estado de listado en @ngrx/signals.',
        ],
      },
      {
        nombre: 'Componentes compartidos reutilizables',
        acceso: 'publico',
        descripcion:
          'Componentes compartidos para no reinventar la rueda en cada módulo:',
        contenido: [
          'CollapsibleSectionComponent: secciones plegables en formularios y fichas.',
          'AnotacionesCartograficasComponent: mapa + línea de tiempo para anotaciones.',
          'ArchivoManagerComponent: gestión de archivos en MinIO.',
          'ColumnSelectorComponent: elegir columnas visibles en las tablas.',
          'ListEditorComponent: edición de listas con etiquetas.',
          'AutocompleteCreate: autocompletar y crear el registro con un clic.',
          'HsWizardComponent y HsClassificationService: asistente Hornbostel-Sachs.',
        ],
      },
      {
        nombre: 'Convenciones de código',
        acceso: 'publico',
        descripcion:
          'Convenciones para mantener el código del simr-front coherente:',
        contenido: [
          'TypeScript en modo estricto; código standalone para componentes nuevos.',
          'Estilo visual con las variables CSS de :root (--simr-…).',
          'Formularios siempre en modo reactivo (no mezclar con ngModel).',
          'Rutas lazy con loadComponent; evitar módulos pesados cargados al inicio.',
          'Los colores y tipografías siguen la identidad del archivo.',
        ],
      },
      {
        nombre: 'Git y versionado',
        acceso: 'publico',
        descripcion:
          'El flujo de trabajo con Git tiene rama de desarrollo activa; la versión de la aplicación se mantiene en package.json (visible en «Acerca de»).',
        contenido: [
          'Rama principal de desarrollo: migracion; main para producción.',
          'Commits pequeños y mensajes descriptivos siguiendo el estilo del repositorio.',
          'La versión se actualiza con npm version (<mayor|menor|parche>) y aparece automáticamente en Acerca de.',
        ],
      },
    ],
  },
];