/**
 * Script para listar usuarios de la base de datos
 */

"use strict";

process.env.NODE_ENV = process.env.NODE_ENV || "development";
require("dotenv").config();

const mongoose = require("mongoose");
const config = require("./config/config");

mongoose.set("strictQuery", false);

mongoose
  .connect(config.db)
  .then(async () => {
    console.log("✅ Conectado a MongoDB\n");

    require("./app/models/user.server.model");
    const User = mongoose.model("User");

    const users = await User.find({}).select(
      "username email firstName lastName roles"
    );

    if (users.length === 0) {
      console.log("⚠️  No hay usuarios en la base de datos");
    } else {
      console.log(`📋 Usuarios encontrados (${users.length}):\n`);
      users.forEach((user, i) => {
        console.log(`${i + 1}. Username: ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Nombre: ${user.firstName} ${user.lastName}`);
        console.log(`   Roles: ${user.roles?.length || 0}`);
        console.log("");
      });
    }

    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error.message);
    process.exit(1);
  });
