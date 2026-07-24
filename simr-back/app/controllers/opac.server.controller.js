const mongoose = require('mongoose');
const Obra = mongoose.model('Obra');
const Actor = mongoose.model('Actor');
const Recurso = mongoose.model('Recurso');
const Ejemplar = mongoose.model('Ejemplar');
const Fondo = mongoose.model('Fondo');
const Coleccion = mongoose.model('Coleccion');
const Proyecto = mongoose.model('Proyecto');

const getErrorMessage = (err) => {
  let message = '';
  if (err.code) {
    switch (err.code) {
      case 11000:
      case 11001:
        message = 'El registro ya existe';
        break;
      default:
        message = 'Se ha producido un error';
    }
  } else {
    for (const errName in err.errors) {
      if (err.errors[errName].message) message = err.errors[errName].message;
    }
  }
  return message;
};

exports.searchObras = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ results: [] });

    const obras = await Obra.find({ titulo: { $regex: q, $options: 'i' } })
      .select('titulo denominacionRegional descripcion tipo actores generosFormas materias proyectos')
      .populate('actores.id', 'nombres apellidos')
      .populate('generosFormas.id', 'nombre')
      .populate('materias.id', 'nombre')
      .limit(50)
      .lean();

    if (!obras.length) return res.json({ results: [] });

    const obraIds = obras.map(o => o._id);
    const recursos = await Recurso.find({ 'obrasRelacionadas.id': { $in: obraIds } })
      .select('titulo obrasRelacionadas')
      .populate('obrasRelacionadas.id', 'titulo')
      .limit(200)
      .lean();

    const recursoIds = recursos.map(r => r._id);
    const ejemplares = await Ejemplar.find({ recurso: { $in: recursoIds } })
      .select('numeroEjemplar disponibilidad recurso fondo coleccion procedencia')
      .populate('fondo', 'nombre')
      .populate('coleccion', 'nombre')
      .limit(500)
      .lean();

    const ejemplaresPorRecurso = {};
    for (const ej of ejemplares) {
      const rid = ej.recurso?.toString();
      if (rid) {
        if (!ejemplaresPorRecurso[rid]) ejemplaresPorRecurso[rid] = [];
        ejemplaresPorRecurso[rid].push({
          _id: ej._id,
          numeroEjemplar: ej.numeroEjemplar,
          disponibilidad: ej.disponibilidad,
          procedencia: ej.procedencia,
          fondo: ej.fondo,
          coleccion: ej.coleccion,
        });
      }
    }

    const recursosPorObra = {};
    for (const r of recursos) {
      for (const obraRef of (r.obrasRelacionadas || [])) {
        const oid = obraRef.id?._id?.toString() || obraRef.id?.toString();
        if (oid) {
          if (!recursosPorObra[oid]) recursosPorObra[oid] = [];
          recursosPorObra[oid].push({
            _id: r._id,
            titulo: r.titulo,
            ejemplares: ejemplaresPorRecurso[r._id.toString()] || [],
          });
        }
      }
    }

    const results = obras.map(o => ({
      _id: o._id,
      titulo: o.titulo,
      denominacionRegional: o.denominacionRegional,
      descripcion: o.descripcion,
      tipo: o.tipo,
      actores: (o.actores || []).map(a => ({
        id: a.id?._id || a.id,
        nombre: a.id?.nombres && a.id?.apellidos
          ? `${a.id.nombres} ${a.id.apellidos}` : '',
        rol: a.rol,
      })),
      generosFormas: (o.generosFormas || []).map(g => ({
        id: g.id?._id || g.id,
        nombre: g.id?.nombre || '',
      })),
      materias: (o.materias || []).map(m => ({
        id: m.id?._id || m.id,
        nombre: m.id?.nombre || '',
      })),
      recursos: recursosPorObra[o._id.toString()] || [],
    }));

    res.json({ results });
  } catch (err) {
    console.error('OPAC obras search error:', err);
    res.status(500).json({ message: getErrorMessage(err), results: [] });
  }
};

exports.searchActores = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ results: [] });

    const actores = await Actor.find({
      $or: [
        { nombres: { $regex: q, $options: 'i' } },
        { apellidos: { $regex: q, $options: 'i' } },
        { nombreReunion: { $regex: q, $options: 'i' } },
      ],
    })
      .select('nombres apellidos nombreReunion')
      .limit(50)
      .lean();

    if (!actores.length) return res.json({ results: [] });

    const actorIds = actores.map(a => a._id);

    const obras = await Obra.find({ 'actores.id': { $in: actorIds } })
      .select('titulo actores')
      .populate('actores.id', 'nombres apellidos')
      .limit(100)
      .lean();

    const obraIds = obras.map(o => o._id);
    const recursos = await Recurso.find({ 'obrasRelacionadas.id': { $in: obraIds } })
      .select('titulo')
      .limit(200)
      .lean();

    const recursoIds = recursos.map(r => r._id);
    const ejemplares = await Ejemplar.find({ recurso: { $in: recursoIds } })
      .select('numeroEjemplar disponibilidad recurso fondo coleccion')
      .populate('fondo', 'nombre')
      .populate('coleccion', 'nombre')
      .limit(500)
      .lean();

    const proyectos = await Proyecto.find({ 'investigadores.id': { $in: actorIds } })
      .select('nombre descripcion')
      .limit(50)
      .lean();

    const ejemplaresPorRecurso = {};
    for (const ej of ejemplares) {
      const rid = ej.recurso?.toString();
      if (rid) {
        if (!ejemplaresPorRecurso[rid]) ejemplaresPorRecurso[rid] = [];
        ejemplaresPorRecurso[rid].push(ej);
      }
    }

    const results = actores.map(actor => {
      const obrasDelActor = obras
        .filter(o => (o.actores || []).some(a =>
          a.id?._id?.toString() === actor._id.toString() || a.id?.toString() === actor._id.toString()
        ))
        .map(o => {
          const recursosDeObra = recursos.filter(r =>
            o._id && r.obrasRelacionadas?.some(or =>
              or.id?.toString() === o._id.toString()
            )
          );
          return {
            _id: o._id,
            titulo: o.titulo,
            recursos: recursosDeObra.map(r => ({
              _id: r._id,
              titulo: r.titulo,
              ejemplares: ejemplaresPorRecurso[r._id.toString()] || [],
            })),
          };
        });

      return {
        _id: actor._id,
        nombres: actor.nombres,
        apellidos: actor.apellidos,
        nombreReunion: actor.nombreReunion,
        fullName: [actor.nombres, actor.apellidos].filter(Boolean).join(' '),
        obras: obrasDelActor,
        proyectos: proyectos.filter(p =>
          p.investigadores?.some(i =>
            i.id?.toString() === actor._id.toString()
          )
        ).map(p => ({ _id: p._id, nombre: p.nombre, descripcion: p.descripcion })),
      };
    });

    res.json({ results });
  } catch (err) {
    console.error('OPAC actores search error:', err);
    res.status(500).json({ message: getErrorMessage(err), results: [] });
  }
};

exports.searchFondosColecciones = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ results: [] });

    const fondos = await Fondo.find({ nombre: { $regex: q, $options: 'i' } })
      .select('nombre tipo propiedadComodato fechaDeCreacion precision')
      .limit(50)
      .lean();

    const colecciones = await Coleccion.find({ nombre: { $regex: q, $options: 'i' } })
      .select('nombre tipo fechaDeCreacion precision propiedadComodato')
      .limit(50)
      .lean();

    const fondoIds = fondos.map(f => f._id);
    const coleccionIds = colecciones.map(c => c._id);

    const [ejemplaresPorFondo, ejemplaresPorColeccion] = await Promise.all([
      Ejemplar.find({ fondo: { $in: fondoIds } })
        .select('numeroEjemplar disponibilidad recurso fondo coleccion procedencia')
        .populate('recurso', 'titulo obrasRelacionadas')
        .limit(500)
        .lean(),
      Ejemplar.find({ coleccion: { $in: coleccionIds } })
        .select('numeroEjemplar disponibilidad recurso fondo coleccion procedencia')
        .populate('recurso', 'titulo obrasRelacionadas')
        .limit(500)
        .lean(),
    ]);

    const allEjemplares = [...ejemplaresPorFondo, ...ejemplaresPorColeccion];
    const recursoIds = [...new Set(allEjemplares
      .map(e => e.recurso?._id?.toString() || e.recurso?.toString())
      .filter(Boolean))];

    const obraIdsFromRecursos = await getObraIdsFromRecursos(recursoIds);
    const obras = await Obra.find({ _id: { $in: obraIdsFromRecursos } })
      .select('titulo actores')
      .populate('actores.id', 'nombres apellidos')
      .limit(300)
      .lean();

    const actoresDeObras = new Map();
    for (const o of obras) {
      for (const a of (o.actores || [])) {
        const aid = a.id?._id?.toString() || a.id?.toString();
        if (aid && !actoresDeObras.has(aid)) {
          actoresDeObras.set(aid, {
            _id: aid,
            nombre: a.id?.nombres && a.id?.apellidos
              ? `${a.id.nombres} ${a.id.apellidos}` : '',
          });
        }
      }
    }

    const buildResult = (entity, ejemplares) => {
      const ejPorRecurso = {};
      for (const ej of ejemplares) {
        const rid = ej.recurso?._id?.toString() || ej.recurso?.toString();
        if (rid) {
          if (!ejPorRecurso[rid]) ejPorRecurso[rid] = [];
          ejPorRecurso[rid].push({
            _id: ej._id,
            numeroEjemplar: ej.numeroEjemplar,
            disponibilidad: ej.disponibilidad,
            procedencia: ej.procedencia,
          });
        }
      }

      const recursosMap = new Map();
      for (const ej of ejemplares) {
        const r = ej.recurso;
        const rid = r?._id?.toString() || r?.toString();
          const exists = [...recursosMap.keys()].some(k => k === rid);
          if (rid && !exists) {
          const obrasDelRecurso = obras.filter(o =>
            r?.obrasRelacionadas?.some(or =>
              or.id?.toString() === o._id.toString()
            )
          );
          recursosMap.set(rid, {
            _id: rid,
            titulo: r?.titulo || '',
            ejemplares: ejPorRecurso[rid] || [],
            obras: obrasDelRecurso.map(o => ({
              _id: o._id,
              titulo: o.titulo,
              actores: (o.actores || []).map(a => ({
                id: a.id?._id || a.id,
                nombre: a.id?.nombres && a.id?.apellidos
                  ? `${a.id.nombres} ${a.id.apellidos}` : '',
              })),
            })),
          });
        }
      }

      return {
        _id: entity._id,
        nombre: entity.nombre,
        tipo: entity.tipo,
        propiedadComodato: entity.propiedadComodato,
        fechaDeCreacion: entity.fechaDeCreacion,
        precision: entity.precision,
        recursos: [...recursosMap.values()],
        actores: [...actoresDeObras.values()],
      };
    };

    const results = [
      ...fondos.map(f => ({
        tipoEntidad: 'Fondo',
        ...buildResult(f, ejemplaresPorFondo.filter(e =>
          e.fondo?.toString() === f._id.toString()
        )),
      })),
      ...colecciones.map(c => ({
        tipoEntidad: 'Colección',
        ...buildResult(c, ejemplaresPorColeccion.filter(e =>
          e.coleccion?.toString() === c._id.toString()
        )),
      })),
    ];

    res.json({ results });
  } catch (err) {
    console.error('OPAC fondos search error:', err);
    res.status(500).json({ message: getErrorMessage(err), results: [] });
  }
};

async function getObraIdsFromRecursos(recursoIds) {
  if (!recursoIds.length) return [];
  const recursos = await Recurso.find({ _id: { $in: recursoIds } })
    .select('obrasRelacionadas')
    .lean();
  const ids = new Set();
  for (const r of recursos) {
    for (const or of (r.obrasRelacionadas || [])) {
      if (or.id) ids.add(or.id.toString());
    }
  }
  return [...ids];
}
