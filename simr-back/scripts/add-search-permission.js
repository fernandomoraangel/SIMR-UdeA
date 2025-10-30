"use strict";

// Script para agregar permisos de búsqueda al rol admin
require("../server.js");

async function addSearchPermission() {
  try {
    console.log("🔄 Esperando conexión a la base de datos...");

    // Esperar a que se conecte
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const mongoose = require("mongoose");
    const Role = mongoose.model("Role");

    console.log("🔍 Buscando rol admin...");
    const adminRole = await Role.findOne({ name: "admin" });

    if (!adminRole) {
      console.error("❌ Rol admin no encontrado");
      process.exit(1);
    }

    console.log("📝 Verificando permisos existentes...");
    const hasSearchPermission = adminRole.permissions.some(
      (p) => p.resource === "search"
    );

    if (hasSearchPermission) {
      console.log("✅ El rol admin ya tiene permisos de búsqueda");
      process.exit(0);
    }

    console.log("➕ Agregando permisos de búsqueda...");
    adminRole.permissions.push({
      resource: "search",
      actions: {
        read: "any",
        create: "any",
        update: "any",
        delete: "any",
      },
    });

    await adminRole.save();
    console.log("✅ Permisos de búsqueda agregados exitosamente al rol admin");

    // Limpiar caché de permisos si existe
    const permissionService = require("../app/services/permission.service");
    permissionService.invalidateAllCache();
    console.log("🧹 Caché de permisos limpiado");
  } catch (error) {
    console.error("❌ Error agregando permisos de búsqueda:", error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  addSearchPermission();
}

module.exports = { addSearchPermission };
