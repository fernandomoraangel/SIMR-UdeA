const opac = require('../../app/controllers/opac.server.controller');

module.exports = function (app) {
  app.get('/api/opac/obras', opac.searchObras);
  app.get('/api/opac/actores', opac.searchActores);
  app.get('/api/opac/fondos', opac.searchFondosColecciones);
  app.get('/api/opac/roles', opac.searchByRole);
  app.get('/api/opac/instrumentos', opac.searchByInstrumento);
  app.get('/api/opac/generos', opac.searchByGenero);
  app.get('/api/opac/multi', opac.searchMulti);
};
