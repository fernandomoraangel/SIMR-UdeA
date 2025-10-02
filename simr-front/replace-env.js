const fs = require("fs");
const path = require("path");

try {
  const envFile = fs.readFileSync("../.env.production", "utf8");
  const envVars = {};
  envFile.split("\n").forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith("#")) {
      const [key, ...valueParts] = trimmedLine.split("=");
      if (key) {
        const value = valueParts.join("=").trim();
        envVars[key.trim()] = value;
      }
    }
  });

  let prodEnv = fs.readFileSync("src/environments/environment.prod.ts", "utf8");
  Object.keys(envVars).forEach((key) => {
    const regex = new RegExp(`\\$\\{${key}\\}`, "g");
    prodEnv = prodEnv.replace(regex, envVars[key]);
  });

  fs.writeFileSync("src/environments/environment.prod.ts", prodEnv);
  console.log("✅ Variables de entorno reemplazadas en environment.prod.ts");
} catch (error) {
  console.error("❌ Error al reemplazar variables de entorno:", error.message);
  process.exit(1);
}
