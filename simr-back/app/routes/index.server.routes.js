const legacyShellGuard = require('../middleware/legacyShellGuard');

module.exports = function (app) {
    var index = require('../controllers/index.server.controller');
    // Auth-gating: el shell legacy AngularJS (y con él, angular.js v1.8.2,
    // EOL) ya no se sirve a visitantes anónimos. Ver app/middleware/legacyShellGuard.js
    app.get('/', legacyShellGuard, index.render);
};
