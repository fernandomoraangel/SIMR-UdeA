/**
 * Script para asignar rol de administrador a un usuario
 *
 * Uso:
 *   node assign-admin.js <username>
 *
 * Ejemplo:
 *   node assign-admin.js admin
 */

"use strict";

// Establecer NODE_ENV por defecto si no está definido
process.env.NODE_ENV = process.env.NODE_ENV || "development";

// Cargar variables de entorno
require("dotenv").config();

const mongoose = require("mongoose");
const config = require("./config/config");

// Configurar mongoose
mongoose.set("strictQuery", false);

// Obtener username del argumento
const username = process.argv[2];

if (!username) {
  console.error("❌ Error: Debe proporcionar un nombre de usuario");
  console.log("\nUso: node assign-admin.js <username>");
  console.log("Ejemplo: node assign-admin.js admin\n");
  process.exit(1);
}

// Conectar a MongoDB
mongoose
  .connect(config.db)
  .then(() => {
    console.log("✅ Conectado a MongoDB");
    return assignAdminRole(username);
  })
  .then(() => {
    console.log("\n✅ Rol de administrador asignado exitosamente");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error.message);
    process.exit(1);
  });

// Cargar modelos
require("./app/models/user.server.model");
require("./app/models/role.server.model");

const User = mongoose.model("User");
const Role = mongoose.model("Role");

async function assignAdminRole(username) {
  console.log(`\n🔍 Buscando usuario: ${username}...`);

  // Buscar usuario
  const user = await User.findOne({ username });
  if (!user) {
    throw new Error(`Usuario "${username}" no encontrado`);
  }

  console.log(`✅ Usuario encontrado: ${user.username} (${user.email})`);

  // Buscar rol admin
  console.log("\n🔍 Buscando rol de administrador...");
  const adminRole = await Role.findOne({ name: "admin", isSystem: true });

  if (!adminRole) {
    throw new Error(
      'Rol "admin" no encontrado. Ejecute primero: node init-roles.js'
    );
  }

  console.log(
    `✅ Rol encontrado: ${adminRole.name} (${adminRole.description})`
  );

  // Verificar si ya tiene el rol
  if (user.roles && user.roles.some((roleId) => roleId.equals(adminRole._id))) {
    console.log("\n⚠️  El usuario ya tiene el rol de administrador");
    return;
  }

  // Asignar rol
  console.log("\n🔧 Asignando rol de administrador...");
  if (!user.roles) {
    user.roles = [];
  }
  user.roles.push(adminRole._id);
  await user.save();

  console.log(
    `✅ Rol "${adminRole.name}" asignado a usuario "${user.username}"`
  );

  // Mostrar información del usuario
  console.log("\n📊 INFORMACIÓN DEL USUARIO:");
  console.log(`   Username: ${user.username}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Nombre completo: ${user.firstName} ${user.lastName}`);
  console.log(`   Roles asignados: ${user.roles.length}`);
}
