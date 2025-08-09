// init.mongo.js

// Connect to admin database
db = db.getSiblingDB("admin");

// Create user
db.createUser({
  user: "superAdmin",
  pwd: "sadmin1990",
  roles: [{ role: "root", db: "admin" }],
});
