/**
 * Script de inicialización completa del sistema de roles
 * 1. Crea los 5 roles del sistema
 * 2. Asigna rol admin al usuario especificado
 *
 * Uso:
 *   node setup-roles.js <username>
 *
 * Ejemplo:
 *   node setup-roles.js admin
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

// Obtener username del argumento (opcional)
const username = process.argv[2];

// Conectar a MongoDB
mongoose
  .connect(config.db)
  .then(() => {
    console.log("✅ Conectado a MongoDB\n");
    console.log("═══════════════════════════════════════════════════");
    console.log("🚀 INICIALIZACIÓN DEL SISTEMA DE ROLES Y PERMISOS");
    console.log("═══════════════════════════════════════════════════\n");
    return setupRoles();
  })
  .then(() => {
    console.log("\n═══════════════════════════════════════════════════");
    console.log("✅ INICIALIZACIÓN COMPLETADA EXITOSAMENTE");
    console.log("═══════════════════════════════════════════════════\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ ERROR:", error.message);
    process.exit(1);
  });

// Cargar modelos
require("./app/models/user.server.model");
require("./app/models/role.server.model");

const User = mongoose.model("User");
const Role = mongoose.model("Role");

async function setupRoles() {
  // Paso 1: Crear roles del sistema
  console.log("PASO 1: Creando roles del sistema\n");
  await createSystemRoles();

  // Paso 2: Asignar admin si se especificó username
  if (username) {
    console.log("\n\nPASO 2: Asignando rol de administrador\n");
    await assignAdminRole(username);
  } else {
    console.log("\n\n⚠️  No se especificó usuario para asignar como admin");
    console.log("💡 Para asignar admin a un usuario, ejecute:");
    console.log("   node setup-roles.js <username>");
    console.log("   O ejecute: node assign-admin.js <username>\n");
  }
}

async function createSystemRoles() {
  try {
    // Verificar si ya existen roles del sistema
    const existingRoles = await Role.find({ isSystem: true });

    if (existingRoles.length > 0) {
      console.log("⚠️  Ya existen roles del sistema. Eliminando...");
      await Role.deleteMany({ isSystem: true });
      console.log("🗑️  Roles anteriores eliminados\n");
    }

    // Crear roles del sistema
    const roles = await Role.createSystemRoles();

    console.log("✅ Roles creados exitosamente:\n");

    for (const role of roles) {
      console.log(`📌 ${role.name.toUpperCase()}`);
      console.log(`   Descripción: ${role.description}`);
      console.log(`   Prioridad: ${role.priority}`);
      if (role.inheritsFrom && role.inheritsFrom.length > 0) {
        const parentNames = await Role.find({
          _id: { $in: role.inheritsFrom },
        }).select("name");
        console.log(
          `   Hereda de: ${parentNames.map((r) => r.name).join(", ")}`
        );
      }
      console.log(`   Permisos directos: ${role.permissions.length}`);

      // Calcular permisos totales (con herencia)
      const allPerms = role.getAllPermissions();
      console.log(`   Permisos totales (con herencia): ${allPerms.size}`);
      console.log("");
    }

    console.log("📊 RESUMEN DE ROLES:");
    console.log(`   Total de roles creados: ${roles.length}`);
    console.log(
      `   Jerarquía: admin > bibliotecologo > catalogador > investigador > lector`
    );

    return roles;
  } catch (error) {
    console.error("❌ Error al crear roles:", error);
    throw error;
  }
}

async function assignAdminRole(username) {
  try {
    console.log(`🔍 Buscando usuario: ${username}...`);

    // Buscar usuario
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error(`Usuario "${username}" no encontrado`);
    }

    console.log(`✅ Usuario encontrado: ${user.username} (${user.email})`);

    // Buscar rol admin
    const adminRole = await Role.findOne({ name: "admin", isSystem: true });
    if (!adminRole) {
      throw new Error('Rol "admin" no encontrado');
    }

    // Verificar si ya tiene el rol
    if (
      user.roles &&
      user.roles.some((roleId) => roleId.equals(adminRole._id))
    ) {
      console.log("⚠️  El usuario ya tiene el rol de administrador");
      return;
    }

    // Asignar rol
    console.log("🔧 Asignando rol de administrador...");
    if (!user.roles) {
      user.roles = [];
    }
    user.roles.push(adminRole._id);
    await user.save();

    console.log(`✅ Rol "admin" asignado exitosamente`);

    console.log("\n📊 INFORMACIÓN DEL USUARIO:");
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Nombre: ${user.firstName} ${user.lastName}`);
    console.log(`   Roles: admin`);
  } catch (error) {
    console.error("❌ Error al asignar rol admin:", error);
    throw error;
  }
}
