/**
 * Script de inicialización de roles del sistema
 * Crea los 5 roles principales con sus permisos predefinidos
 *
 * Uso:
 *   node init-roles.js
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

// Conectar a MongoDB
mongoose
  .connect(config.db)
  .then(() => {
    console.log("✅ Conectado a MongoDB");
    return initializeRoles();
  })
  .then(() => {
    console.log("\n✅ Inicialización de roles completada");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });

// Cargar modelos
require("./app/models/role.server.model");
const Role = mongoose.model("Role");

async function initializeRoles() {
  console.log("\n🔧 Iniciando creación de roles del sistema...\n");

  try {
    // Verificar si ya existen roles del sistema
    const existingRoles = await Role.find({ isSystem: true });

    if (existingRoles.length > 0) {
      console.log("⚠️  Ya existen roles del sistema:");
      existingRoles.forEach((role) => {
        console.log(`   - ${role.name} (${role.permissions.length} permisos)`);
      });

      console.log(
        "\n¿Desea eliminarlos y recrearlos? (presione Ctrl+C para cancelar)"
      );
      console.log("Recreando en 3 segundos...");

      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Eliminar roles existentes
      await Role.deleteMany({ isSystem: true });
      console.log("🗑️  Roles anteriores eliminados\n");
    }

    // Crear roles del sistema usando el método estático
    const roles = await Role.createSystemRoles();

    console.log("✅ Roles creados exitosamente:\n");

    for (const role of roles) {
      console.log(`📌 ${role.name.toUpperCase()}`);
      console.log(`   Descripción: ${role.description}`);
      console.log(`   Prioridad: ${role.priority}`);
      console.log(`   Es sistema: ${role.isSystem}`);
      if (role.inheritsFrom && role.inheritsFrom.length > 0) {
        console.log(`   Hereda de: ${role.inheritsFrom.join(", ")}`);
      }
      console.log(`   Permisos: ${role.permissions.length}`);

      // Mostrar algunos permisos de ejemplo
      if (role.permissions.length > 0) {
        console.log(`   Ejemplos de permisos:`);
        role.permissions.slice(0, 5).forEach((perm) => {
          console.log(
            `      - ${perm.resource}:${perm.action} (scope: ${perm.scope})`
          );
        });
        if (role.permissions.length > 5) {
          console.log(`      ... y ${role.permissions.length - 5} más`);
        }
      }
      console.log("");
    }

    // Mostrar resumen
    console.log("📊 RESUMEN:");
    console.log(`   Total de roles creados: ${roles.length}`);
    console.log(
      `   Total de permisos únicos: ${countUniquePermissions(roles)}`
    );

    return roles;
  } catch (error) {
    console.error("❌ Error al crear roles:", error);
    throw error;
  }
}

function countUniquePermissions(roles) {
  const uniquePerms = new Set();
  roles.forEach((role) => {
    role.permissions.forEach((perm) => {
      uniquePerms.add(`${perm.resource}:${perm.action}:${perm.scope}`);
    });
  });
  return uniquePerms.size;
}
