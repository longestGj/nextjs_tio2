import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  workers: 2,
  globalSetup: "./tests/global-setup.ts",
  use: { baseURL: "http://127.0.0.1:8333", channel: "chrome" },
  reporter: [["list"], ["json", { outputFile: "test-results/results.json" }]],
  outputDir: "test-results",
});
