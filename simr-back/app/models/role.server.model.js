/**
 * Modelo de Rol para el Sistema de Roles y Permisos de SIMR
 *
 * Define la estructura de roles con permisos granulares por recurso y acción.
 * Soporta herencia de roles, prioridades y roles del sistema (no eliminables).
 */

"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Esquema de Permisos: define qué puede hacer un rol en un recurso específico
const PermissionSchema = new Schema(
  {
    resource: {
      type: String,
      required: true,
      trim: true,
      // Recursos del sistema SIMR
      enum: [
        "user",
        "role",
        "obra",
        "actor",
        "recurso",
        "genero",
        "genero_no_musical",
        "instrumento",
        "materia",
        "medio",
        "proyecto",
        "sistema",
        "fondo",
        "coleccion",
        "ejemplar",
        "idioma",
        "diccionario",
        "archivo",
        "search",
      ],
    },
    actions: {
      type: Map,
      of: {
        type: String,
        enum: ["any", "own"], // "any" = todos los registros, "own" = solo propios
      },
      default: {},
      // Ejemplo: { "create": "any", "read": "any", "update": "own", "delete": "own" }
    },
  },
  { _id: false }
);

// Esquema Principal de Rol
const RoleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 50,
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    permissions: [PermissionSchema],
    inheritsFrom: [
      {
        type: Schema.Types.ObjectId,
        ref: "Role",
      },
    ],
    isSystem: {
      type: Boolean,
      default: false, // Los roles del sistema no se pueden eliminar
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 0, // Mayor número = mayor prioridad
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Índices para optimizar consultas
RoleSchema.index({ name: 1 });
RoleSchema.index({ isSystem: 1 });
RoleSchema.index({ isActive: 1 });

/**
 * Método de instancia: Obtener todos los permisos incluyendo los heredados
 * @returns {Array} Array de permisos combinados (propios + heredados)
 */
RoleSchema.methods.getAllPermissions = async function () {
  const allPermissions = new Map();

  const getInheritedPermissions = async (role) => {
    if (role.inheritsFrom && role.inheritsFrom.length > 0) {
      for (const parentRoleId of role.inheritsFrom) {
        const parentRole = await mongoose.model("Role").findById(parentRoleId);
        if (parentRole) {
          await getInheritedPermissions(parentRole);
          for (const perm of parentRole.permissions) {
            const key = perm.resource;
            if (!allPermissions.has(key)) {
              allPermissions.set(key, perm);
            }
          }
        }
      }
    }
  };

  await getInheritedPermissions(this);

  for (const perm of this.permissions) {
    allPermissions.set(perm.resource, perm);
  }

  return Array.from(allPermissions.values());
};

/**
 * Método estático: Crear roles del sistema por defecto
 * Se ejecuta al inicializar la base de datos
 */
RoleSchema.statics.createSystemRoles = async function () {
  const systemRoles = [
    {
      name: "admin",
      description: "Administrador del sistema con todos los permisos",
      isSystem: true,
      priority: 100,
      permissions: [
        {
          resource: "user",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
            ["delete", "any"],
          ]),
        },
        {
          resource: "role",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
            ["delete", "any"],
          ]),
        },
        {
          resource: "obra",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
            ["delete", "any"],
          ]),
        },
        {
          resource: "actor",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
            ["delete", "any"],
          ]),
        },
        {
          resource: "recurso",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
            ["delete", "any"],
          ]),
        },
        {
          resource: "genero",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
            ["delete", "any"],
          ]),
        },
        {
          resource: "genero_no_musical",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
            ["delete", "any"],
          ]),
        },
        {
          resource: "instrumento",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
            ["delete", "any"],
          ]),
        },
        {
          resource: "materia",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
            ["delete", "any"],
          ]),
        },
        {
          resource: "medio",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
            ["delete", "any"],
          ]),
        },
        {
          resource: "proyecto",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
            ["delete", "any"],
          ]),
        },
        {
          resource: "sistema",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
            ["delete", "any"],
          ]),
        },
        {
          resource: "fondo",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
            ["delete", "any"],
          ]),
        },
        {
          resource: "coleccion",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
            ["delete", "any"],
          ]),
        },
        {
          resource: "ejemplar",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
            ["delete", "any"],
          ]),
        },
        {
          resource: "idioma",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
            ["delete", "any"],
          ]),
        },
        {
          resource: "diccionario",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
            ["delete", "any"],
          ]),
        },
        {
          resource: "archivo",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
            ["delete", "any"],
          ]),
        },
        {
          resource: "search",
          actions: new Map([["read", "any"]]),
        },
        {
          resource: "search",
          actions: new Map([["read", "any"]]),
        },
      ],
    },
    {
      name: "lector",
      description: "Usuario con permisos de solo lectura",
      isSystem: true,
      priority: 10,
      permissions: [
        {
          resource: "obra",
          actions: new Map([["read", "any"]]),
        },
        {
          resource: "actor",
          actions: new Map([["read", "any"]]),
        },
        {
          resource: "recurso",
          actions: new Map([["read", "any"]]),
        },
        {
          resource: "genero",
          actions: new Map([["read", "any"]]),
        },
        {
          resource: "genero_no_musical",
          actions: new Map([["read", "any"]]),
        },
        {
          resource: "instrumento",
          actions: new Map([["read", "any"]]),
        },
        {
          resource: "materia",
          actions: new Map([["read", "any"]]),
        },
        {
          resource: "medio",
          actions: new Map([["read", "any"]]),
        },
        {
          resource: "proyecto",
          actions: new Map([["read", "any"]]),
        },
        {
          resource: "sistema",
          actions: new Map([["read", "any"]]),
        },
        {
          resource: "fondo",
          actions: new Map([["read", "any"]]),
        },
        {
          resource: "coleccion",
          actions: new Map([["read", "any"]]),
        },
        {
          resource: "ejemplar",
          actions: new Map([["read", "any"]]),
        },
        {
          resource: "idioma",
          actions: new Map([["read", "any"]]),
        },
        {
          resource: "diccionario",
          actions: new Map([["read", "any"]]),
        },
        {
          resource: "archivo",
          actions: new Map([["read", "any"]]),
        },
        {
          resource: "search",
          actions: new Map([["read", "any"]]),
        },
      ],
    },
    {
      name: "investigador",
      description:
        "Investigador con permisos de lectura y creación de contenido propio",
      isSystem: true,
      priority: 30,
      permissions: [
        {
          resource: "obra",
          actions: new Map([
            ["create", "own"],
            ["read", "any"],
            ["update", "own"],
          ]),
        },
        {
          resource: "actor",
          actions: new Map([
            ["create", "own"],
            ["read", "any"],
            ["update", "own"],
          ]),
        },
        {
          resource: "recurso",
          actions: new Map([
            ["create", "own"],
            ["read", "any"],
            ["update", "own"],
          ]),
        },
        {
          resource: "proyecto",
          actions: new Map([
            ["create", "own"],
            ["read", "any"],
            ["update", "own"],
          ]),
        },
        {
          resource: "archivo",
          actions: new Map([
            ["create", "own"],
            ["read", "any"],
            ["update", "own"],
            ["delete", "own"],
          ]),
        },
        {
          resource: "search",
          actions: new Map([["read", "any"]]),
        },
      ],
    },
    {
      name: "catalogador",
      description:
        "Catalogador con permisos de creación y edición de registros",
      isSystem: true,
      priority: 50,
      permissions: [
        {
          resource: "obra",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
          ]),
        },
        {
          resource: "actor",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
          ]),
        },
        {
          resource: "recurso",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
          ]),
        },
        {
          resource: "genero",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
          ]),
        },
        {
          resource: "genero_no_musical",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
          ]),
        },
        {
          resource: "instrumento",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
          ]),
        },
        {
          resource: "materia",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
          ]),
        },
        {
          resource: "medio",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
          ]),
        },
        {
          resource: "proyecto",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
          ]),
        },
        {
          resource: "sistema",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
          ]),
        },
        {
          resource: "fondo",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
          ]),
        },
        {
          resource: "coleccion",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
          ]),
        },
        {
          resource: "ejemplar",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
          ]),
        },
        {
          resource: "idioma",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
          ]),
        },
        {
          resource: "diccionario",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
          ]),
        },
        {
          resource: "archivo",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
          ]),
        },
        {
          resource: "search",
          actions: new Map([["read", "any"]]),
        },
      ],
    },
    {
      name: "bibliotecologo",
      description:
        "Bibliotecólogo con permisos avanzados excepto administración de usuarios",
      isSystem: true,
      priority: 70,
      permissions: [
        {
          resource: "obra",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
            ["delete", "any"],
          ]),
        },
        {
          resource: "actor",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
            ["delete", "any"],
          ]),
        },
        {
          resource: "recurso",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
            ["delete", "any"],
          ]),
        },
        {
          resource: "genero",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
            ["delete", "any"],
          ]),
        },
        {
          resource: "genero_no_musical",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
            ["delete", "any"],
          ]),
        },
        {
          resource: "instrumento",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
            ["delete", "any"],
          ]),
        },
        {
          resource: "materia",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
            ["delete", "any"],
          ]),
        },
        {
          resource: "medio",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
            ["delete", "any"],
          ]),
        },
        {
          resource: "proyecto",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
            ["delete", "any"],
          ]),
        },
        {
          resource: "sistema",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
            ["delete", "any"],
          ]),
        },
        {
          resource: "fondo",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
            ["delete", "any"],
          ]),
        },
        {
          resource: "coleccion",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
            ["delete", "any"],
          ]),
        },
        {
          resource: "ejemplar",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
            ["delete", "any"],
          ]),
        },
        {
          resource: "idioma",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
            ["delete", "any"],
          ]),
        },
        {
          resource: "diccionario",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
            ["delete", "any"],
          ]),
        },
        {
          resource: "archivo",
          actions: new Map([
            ["create", "any"],
            ["read", "any"],
            ["update", "any"],
            ["delete", "any"],
          ]),
        },
        // Puede ver usuarios pero no modificarlos
        {
          resource: "user",
          actions: new Map([["read", "any"]]),
        },
      ],
    },
  ];

  const createdRoles = [];
  for (const roleData of systemRoles) {
    try {
      const existingRole = await this.findOne({ name: roleData.name });
      if (!existingRole) {
        const role = await this.create(roleData);
        createdRoles.push(role);
        console.log(`✅ Rol del sistema creado: ${role.name}`);
      } else {
        const needsUpdate =
          JSON.stringify(existingRole.permissions) !== JSON.stringify(roleData.permissions);
        if (needsUpdate) {
          existingRole.permissions = roleData.permissions;
          await existingRole.save();
          createdRoles.push(existingRole);
          console.log(`🔄 Rol del sistema actualizado: ${roleData.name}`);
        } else {
          console.log(`ℹ️  Rol del sistema ya existe y está actualizado: ${roleData.name}`);
        }
      }
    } catch (error) {
      console.error(`❌ Error creando rol ${roleData.name}:`, error.message);
    }
  }

  return createdRoles;
};

mongoose.model("Role", RoleSchema);
