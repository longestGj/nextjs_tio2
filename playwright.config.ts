import { defineConfig } from "@playwright/test";

const requestedPort = process.env.PLAYWRIGHT_PORT;
const port = requestedPort && /^\d{2,5}$/.test(requestedPort) ? requestedPort : "8333";
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests",
  workers: 1,
  expect: { timeout: 10_000 },
  use: { baseURL, channel: "chrome" },
  webServer: {
    command: `python -m http.server ${port} --bind 127.0.0.1 --directory out`,
    url: baseURL,
    reuseExistingServer: false,
    stderr: "ignore",
    stdout: "ignore",
  },
  reporter: [["list"], ["json", { outputFile: "test-results/results.json" }]],
  outputDir: "test-results",
});
