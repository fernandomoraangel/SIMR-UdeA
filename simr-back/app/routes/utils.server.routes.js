"use strict";

const passport = require("passport");
const utils = require("../controllers/utils.server.controller");
const { isAdmin } = require("../middleware/authorize.middleware");

const requireAuth = passport.authenticate("jwt", { session: false });

module.exports = function (app) {
  app
    .route("/api/utils/db-search")
    .post(requireAuth, isAdmin, utils.searchDb);

  app
    .route("/api/utils/db-replace")
    .post(requireAuth, isAdmin, utils.replaceDb);
};
