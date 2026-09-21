import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "pnpm --filter @vientos/api dev",
      cwd: "../..",
      // Placeholder values, not real credentials: `config/env.ts` refuses to boot without
      // them, and the e2e run must not spend Imascono's OpenRouter account or your Reducto
      // credits. Any test that needs a real model call is out of scope here — stub the
      // service instead, the way `ANSWER_SERVICE=stub` works on other Imascono projects.
      env: {
        DATABASE_URL: "postgres://vientos:vientos@localhost:5432/vientos",
        OPENROUTER_API_KEY: "e2e-placeholder",
        REDUCTO_API_KEY: "e2e-placeholder",
        INNGEST_DEV: "1",
      },
      url: "http://localhost:3001/health",
      // Never reuse. A stray dev server on this port gets silently tested
      // instead of ours — that is not hypothetical, it happened on the first
      // run of this suite and two specs failed against someone else's app.
      // Better to refuse to start than to report a green run about nothing.
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: "pnpm --filter @vientos/web dev",
      cwd: "../..",
      url: "http://localhost:5173",
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
});
