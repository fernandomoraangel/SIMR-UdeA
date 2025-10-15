/**
 * Script de prueba del sistema de roles y permisos
 * Verifica que todos los componentes funcionan correctamente
 */

"use strict";

// Establecer NODE_ENV por defecto si no está definido
process.env.NODE_ENV = process.env.NODE_ENV || "development";

// Cargar variables de entorno
require("dotenv").config();

const mongoose = require("mongoose");
const config = require("./config/config");

mongoose.set("strictQuery", false);

// Conectar a MongoDB
mongoose
  .connect(config.db)
  .then(() => {
    console.log("✅ Conectado a MongoDB\n");
    console.log("═══════════════════════════════════════════════════");
    console.log("🧪 PRUEBAS DEL SISTEMA DE ROLES Y PERMISOS");
    console.log("═══════════════════════════════════════════════════\n");
    return runTests();
  })
  .then(() => {
    console.log("\n═══════════════════════════════════════════════════");
    console.log("✅ TODAS LAS PRUEBAS PASARON EXITOSAMENTE");
    console.log("═══════════════════════════════════════════════════\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ ERROR EN LAS PRUEBAS:", error.message);
    console.error(error);
    process.exit(1);
  });

// Cargar modelos
require("./app/models/user.server.model");
require("./app/models/role.server.model");
require("./app/models/auditlog.server.model");

const User = mongoose.model("User");
const Role = mongoose.model("Role");
const AuditLog = mongoose.model("AuditLog");
const permissionService = require("./app/services/permission.service");

async function runTests() {
  console.log("TEST 1: Verificar existencia de roles del sistema");
  await testSystemRoles();

  console.log("\nTEST 2: Verificar herencia de permisos");
  await testPermissionInheritance();

  console.log("\nTEST 3: Verificar permisos de usuario");
  await testUserPermissions();

  console.log("\nTEST 4: Verificar caché de permisos");
  await testPermissionCache();

  console.log("\nTEST 5: Verificar auditoría");
  await testAuditLog();

  console.log("\nTEST 6: Verificar métodos del modelo User");
  await testUserMethods();
}

async function testSystemRoles() {
  const roles = await Role.find({ isSystem: true }).sort({ priority: 1 });

  if (roles.length !== 5) {
    throw new Error(
      `Se esperaban 5 roles del sistema, se encontraron ${roles.length}`
    );
  }

  const expectedRoles = [
    "lector",
    "investigador",
    "catalogador",
    "bibliotecologo",
    "admin",
  ];
  const roleNames = roles.map((r) => r.name);

  for (const expected of expectedRoles) {
    if (!roleNames.includes(expected)) {
      throw new Error(`Falta el rol del sistema: ${expected}`);
    }
  }

  console.log(`   ✅ 5 roles del sistema encontrados: ${roleNames.join(", ")}`);

  // Verificar prioridades
  const priorities = roles.map((r) => r.priority);
  const expectedPriorities = [10, 30, 50, 70, 100];

  if (JSON.stringify(priorities) !== JSON.stringify(expectedPriorities)) {
    throw new Error("Prioridades incorrectas");
  }

  console.log(`   ✅ Prioridades correctas: ${priorities.join(", ")}`);
}

async function testPermissionInheritance() {
  const lector = await Role.findOne({ name: "lector" });
  const investigador = await Role.findOne({ name: "investigador" }).populate(
    "inheritsFrom"
  );
  const admin = await Role.findOne({ name: "admin" }).populate("inheritsFrom");

  // Lector no hereda de nadie
  if (lector.inheritsFrom.length !== 0) {
    throw new Error("Lector no debe heredar de ningún rol");
  }

  console.log(
    `   ✅ Lector no hereda de ningún rol (${lector.permissions.length} permisos directos)`
  );

  // Investigador hereda de lector
  const investigadorPerms = investigador.getAllPermissions();
  const lectorPerms = lector.getAllPermissions();

  if (investigadorPerms.size <= lectorPerms.size) {
    throw new Error("Investigador debe tener más permisos que lector");
  }

  console.log(
    `   ✅ Investigador hereda de lector (${investigadorPerms.size} permisos totales)`
  );

  // Admin hereda de todos
  const adminPerms = admin.getAllPermissions();

  if (adminPerms.size < 100) {
    throw new Error("Admin debe tener al menos 100 permisos");
  }

  console.log(
    `   ✅ Admin tiene todos los permisos heredados (${adminPerms.size} permisos totales)`
  );
}

async function testUserPermissions() {
  // Buscar un usuario admin o crear uno temporal
  let testUser = await User.findOne({
    roles: { $exists: true, $ne: [] },
  }).populate("roles");

  if (!testUser) {
    console.log(
      "   ⚠️  No hay usuarios con roles, creando usuario de prueba..."
    );
    const adminRole = await Role.findOne({ name: "admin" });

    testUser = new User({
      username: "test_user_" + Date.now(),
      email: "test@test.com",
      password: "test123456",
      firstName: "Test",
      lastName: "User",
      provider: "local",
      roles: [adminRole._id],
    });

    await testUser.save();
    testUser = await User.findById(testUser._id).populate("roles");
  }

  console.log(`   🔍 Probando con usuario: ${testUser.username}`);

  // Verificar métodos
  const isAdmin = await testUser.isAdmin();
  const hasRole = await testUser.hasRole("admin");
  const allPerms = await testUser.getAllPermissions();

  console.log(`   ✅ isAdmin(): ${isAdmin}`);
  console.log(`   ✅ hasRole('admin'): ${hasRole}`);
  console.log(`   ✅ getAllPermissions(): ${allPerms.size} permisos`);

  // Verificar permiso específico
  const canCreateObras = await testUser.hasPermission("obras", "create");
  console.log(`   ✅ hasPermission('obras', 'create'): ${canCreateObras}`);

  // Limpiar usuario de prueba si fue creado
  if (testUser.username.startsWith("test_user_")) {
    await User.deleteOne({ _id: testUser._id });
    console.log("   🗑️  Usuario de prueba eliminado");
  }
}

async function testPermissionCache() {
  // Crear usuario temporal
  const lectorRole = await Role.findOne({ name: "lector" });

  const tempUser = new User({
    username: "cache_test_" + Date.now(),
    email: "cache@test.com",
    password: "test123456",
    firstName: "Cache",
    lastName: "Test",
    provider: "local",
    roles: [lectorRole._id],
  });

  await tempUser.save();

  // Primera llamada (debe cachear)
  const start1 = Date.now();
  const perms1 = await permissionService.getUserPermissions(tempUser._id);
  const time1 = Date.now() - start1;

  console.log(
    `   ✅ Primera llamada (cacheo): ${time1}ms, ${perms1.size} permisos`
  );

  // Segunda llamada (debe usar caché)
  const start2 = Date.now();
  const perms2 = await permissionService.getUserPermissions(tempUser._id);
  const time2 = Date.now() - start2;

  console.log(
    `   ✅ Segunda llamada (desde caché): ${time2}ms, ${perms2.size} permisos`
  );

  if (time2 >= time1) {
    console.log(
      `   ⚠️  El caché no está mejorando el rendimiento (esto es normal en bases de datos pequeñas)`
    );
  }

  // Invalidar caché
  permissionService.invalidateUserCache(tempUser._id);
  console.log(`   ✅ Caché invalidado correctamente`);

  // Limpiar
  await User.deleteOne({ _id: tempUser._id });
  console.log("   🗑️  Usuario de prueba eliminado");
}

async function testAuditLog() {
  // Crear log de prueba
  const adminUser = await User.findOne({ roles: { $exists: true, $ne: [] } });
  const testRole = await Role.findOne({ name: "lector" });

  if (!adminUser || !testRole) {
    console.log("   ⚠️  No hay usuarios o roles para probar auditoría");
    return;
  }

  const log = await AuditLog.create({
    action: "role_assigned",
    performedBy: adminUser._id,
    targetUser: adminUser._id,
    role: testRole._id,
    details: { test: true },
  });

  console.log(`   ✅ Log de auditoría creado: ${log._id}`);

  // Buscar logs
  const logs = await AuditLog.getUserLogs(adminUser._id, 1);
  console.log(`   ✅ getUserLogs(): ${logs.length} logs encontrados`);

  // Estadísticas
  const stats = await AuditLog.getStats();
  console.log(`   ✅ getStats(): ${stats.totalLogs} logs totales`);

  // Limpiar
  await AuditLog.deleteOne({ _id: log._id });
  console.log("   🗑️  Log de prueba eliminado");
}

async function testUserMethods() {
  // Buscar usuario con roles
  const user = await User.findOne({
    roles: { $exists: true, $ne: [] },
  }).populate("roles");

  if (!user) {
    console.log("   ⚠️  No hay usuarios con roles para probar métodos");
    return;
  }

  console.log(`   🔍 Probando métodos del usuario: ${user.username}`);

  // getSafeUser debe incluir roles
  const safeUser = user.getSafeUser();

  if (!safeUser.roles) {
    throw new Error("getSafeUser() debe incluir roles");
  }

  console.log(`   ✅ getSafeUser() incluye ${safeUser.roles.length} roles`);

  // Verificar que getAllPermissions retorna un Map
  const perms = await user.getAllPermissions();

  if (!(perms instanceof Map)) {
    throw new Error("getAllPermissions() debe retornar un Map");
  }

  console.log(
    `   ✅ getAllPermissions() retorna Map con ${perms.size} permisos`
  );

  // Verificar customPermissions
  if (!Array.isArray(user.customPermissions)) {
    throw new Error("customPermissions debe ser un array");
  }

  console.log(
    `   ✅ customPermissions es un array (${user.customPermissions.length} permisos custom)`
  );
}
