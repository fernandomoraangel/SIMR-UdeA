'use strict';

const passport = require('passport');
const stats = require('../controllers/stats/stats.server.controller');
const { authorize } = require('../middleware/authorize.middleware');

const requireAuth = passport.authenticate('jwt', { session: false });

module.exports = function (app) {
  app.route('/api/stats')
    .get(stats.getAll);
};
