// Script para crear un usuario administrador
// Ejecutar con: node create-admin.js

// Cargar el modelo de usuario
require("./app/models/user.server.model");
require("dotenv").config();
const mongoose = require("./config/mongoose");
const User = require("mongoose").model("User");

// Conectar a la base de datos
const db = mongoose();

async function createAdmin() {
  try {
    console.log("🔄 Creando usuario administrador...");

    // Datos del administrador
    const adminData = {
      firstName: "Admin",
      lastName: "Sistema",
      email: "admin@simr.com",
      username: "admin",
      password: "admin123",
      role: "admin",
      provider: "local",
    };

    // Verificar si ya existe un admin
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("⚠️ Ya existe un usuario administrador:");
      console.log("   Username:", existingAdmin.username);
      console.log("   Email:", existingAdmin.email);
      console.log("   Para cambiar la contraseña, usa la aplicación web.");
      return;
    }

    // Crear el usuario administrador
    const { user, tokens } = await User.createUserWithTokens(adminData);

    console.log("✅ Usuario administrador creado exitosamente!");
    console.log("📋 Datos de acceso:");
    console.log("   Username: admin");
    console.log("   Email: admin@simr.com");
    console.log("   Password: admin123");
    console.log("   Rol: admin");
    console.log("");
    console.log(
      "🔒 IMPORTANTE: Cambia la contraseña después del primer login!"
    );
  } catch (error) {
    console.error("❌ Error creando administrador:", error.message);
  } finally {
    // Cerrar conexión
    mongoose.connection.close();
    process.exit(0);
  }
}

// Ejecutar el script
createAdmin();
