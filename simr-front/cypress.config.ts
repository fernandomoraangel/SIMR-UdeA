import { defineConfig } from "cypress";
import * as fs from "fs";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:4200",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.ts",
    video: false,
    defaultCommandTimeout: 10000,
    setupNodeEvents(on, config) {
      on("task", {
        logError(message: string) {
          fs.appendFileSync("cypress/error-log.txt", message + "\n");
          return null;
        },
      });
      return config;
    },
  },
});
