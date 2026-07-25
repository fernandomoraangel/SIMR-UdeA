"use strict";

const passport = require("passport");
const multer = require("multer");
const importCtrl = require("../controllers/import.server.controller");
const { isAdmin } = require("../middleware/authorize.middleware");

const requireAuth = passport.authenticate("jwt", { session: false });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

module.exports = function (app) {
  app
    .route("/api/import/preview")
    .post(requireAuth, isAdmin, upload.single("file"), importCtrl.preview);

  app
    .route("/api/import/dedup")
    .post(requireAuth, isAdmin, importCtrl.dedup);

  app
    .route("/api/import/execute")
    .post(requireAuth, isAdmin, importCtrl.execute);
};
