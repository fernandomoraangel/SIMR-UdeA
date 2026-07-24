"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var ResponseSchema = new Schema({
  message: { type: String, required: true, trim: true },
  user: { type: Schema.ObjectId, ref: "User" },
  isStaff: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

var SupportTicketSchema = new Schema({
  ticketNumber: { type: String, unique: true },
  subject: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ["abierto", "pendiente", "resuelto", "cerrado", "vencido"],
    default: "abierto",
  },
  priority: {
    type: String,
    enum: ["baja", "media", "alta", "urgente"],
    default: "media",
  },
  createdBy: { type: Schema.ObjectId, ref: "User" },
  assignedTo: { type: Schema.ObjectId, ref: "User", default: null },
  responses: [ResponseSchema],
  resolvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

SupportTicketSchema.set("toJSON", { getters: true, virtuals: true });

SupportTicketSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

SupportTicketSchema.statics.generateTicketNumber = async function () {
  const count = await this.countDocuments({});
  const num = String(count + 1).padStart(5, "0");
  return `TKT-${num}`;
};

mongoose.model("SupportTicket", SupportTicketSchema);
