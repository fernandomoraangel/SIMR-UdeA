"use strict";

const passport = require("passport");
const backup = require("../controllers/backup.server.controller");
const { isAdmin } = require("../middleware/authorize.middleware");

const requireAuth = passport.authenticate("jwt", { session: false });

module.exports = function (app) {
  app
    .route("/api/backup/entities")
    .get(requireAuth, isAdmin, backup.listEntities);

  app
    .route("/api/backup/export")
    .post(requireAuth, isAdmin, backup.exportBackup);

  app
    .route("/api/backup/restore-preview")
    .post(requireAuth, isAdmin, backup.restorePreview);

  app
    .route("/api/backup/restore")
    .post(requireAuth, isAdmin, backup.restoreBackup);
};
