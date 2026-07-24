const opac = require('../../app/controllers/opac.server.controller');

module.exports = function (app) {
  app.get('/api/opac/obras', opac.searchObras);
  app.get('/api/opac/actores', opac.searchActores);
  app.get('/api/opac/fondos', opac.searchFondosColecciones);
};
