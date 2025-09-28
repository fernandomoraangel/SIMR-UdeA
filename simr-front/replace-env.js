const fs = require("fs");
const path = require("path");

const envFile = fs.readFileSync("../.env.production", "utf8");
const envVars = {};
envFile.split("\n").forEach((line) => {
  const [key, value] = line.split("=");
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

let prodEnv = fs.readFileSync("src/environments/environment.prod.ts", "utf8");
Object.keys(envVars).forEach((key) => {
  const regex = new RegExp(`\\$\\{${key}\\}`, "g");
  prodEnv = prodEnv.replace(regex, envVars[key]);
});

fs.writeFileSync("src/environments/environment.prod.ts", prodEnv);
console.log("✅ Variables de entorno reemplazadas en environment.prod.ts");
