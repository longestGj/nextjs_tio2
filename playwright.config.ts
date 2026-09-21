import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  workers: 2,
  expect: { timeout: 10_000 },
  use: { baseURL: "http://127.0.0.1:8333", channel: "chrome" },
  webServer: {
    command: "npm run preview",
    url: "http://127.0.0.1:8333",
    reuseExistingServer: false,
    stderr: "ignore",
    stdout: "ignore",
  },
  reporter: [["list"], ["json", { outputFile: "test-results/results.json" }]],
  outputDir: "test-results",
});
