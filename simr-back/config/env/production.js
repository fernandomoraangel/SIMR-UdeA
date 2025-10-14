module.exports = {
  // db:'mongodb://localhost/simr',
  // Si no es local mongodb://usuario:pass@hostname:puerto/basedatos
  // db: "mongodb://superAdmin:SOh3TbYhx8ypJPxmt1oOfL@simr-mongo:27017/simr",
  db: process.env.MONGO_URI,
  sessionSecret: "productionSessionSecret",
  google: {
    clientID:
      "424952915433-7ejq1nho03771k9nc8rmdqmasqjfsqr7.apps.googleusercontent.com",
    clientSecret: "S0l1DWc4y0NMYSpDmyrxy3kL",
    callbackURL:
      (process.env.API_URL || "http://172.23.0.97") + "/oauth/google/callback",
  },
};
