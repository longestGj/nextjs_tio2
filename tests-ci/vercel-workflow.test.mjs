import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workflowPath = new URL(
  "../.github/workflows/deploy-vercel.yml",
  import.meta.url,
);

test("Vercel production deployment is gated by tests on main", async () => {
  const workflow = await readFile(workflowPath, "utf8");

  assert.match(
    workflow,
    /on:\s*\n\s+push:\s*\n\s+branches:\s*\n\s+- main\s*(?:\n|$)/,
  );
  assert.doesNotMatch(
    workflow,
    /^\s+(?:pull_request|workflow_dispatch|schedule):/m,
  );
  assert.match(workflow, /permissions:\s*\n\s+contents: read/);
  assert.match(
    workflow,
    /concurrency:\s*\n\s+group: vercel-production\s*\n\s+cancel-in-progress: false/,
  );

  const deployJob = workflow.slice(workflow.indexOf("  deploy:"));
  assert.notEqual(deployJob, workflow.slice(-1), "deploy job must exist");
  assert.match(deployJob, /\n\s+needs: test\s*(?:\n|$)/);
  assert.match(deployJob, /vars\.VERCEL_ORG_ID/);
  assert.match(deployJob, /vars\.VERCEL_PROJECT_ID/);
  assert.match(deployJob, /secrets\.VERCEL_TOKEN/);
  assert.doesNotMatch(workflow.slice(0, workflow.indexOf("  deploy:")), /VERCEL_TOKEN/);
  const testJob = workflow.slice(
    workflow.indexOf("  test:"),
    workflow.indexOf("  deploy:"),
  );
  assert.match(
    testJob,
    /NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY:\s*00000000-0000-4000-8000-000000000001/,
  );

  const cliCalls = deployJob.match(/vercel@54\.18\.7/g) ?? [];
  assert.equal(cliCalls.length, 3, "pull, build and deploy must pin Vercel CLI");
  assert.doesNotMatch(workflow, /vercel\s+git\s+connect/i);

  const deployStep = deployJob.indexOf("vercel@54.18.7 deploy");
  const buildStep = deployJob.indexOf("vercel@54.18.7 build");
  const prepareStep = deployJob.indexOf("node scripts/prepare-vercel-output.mjs");
  const smokeStep = deployJob.indexOf("node scripts/verify-deployment.mjs");
  assert.ok(deployStep >= 0, "production deploy command must exist");
  assert.ok(
    prepareStep > buildStep && prepareStep < deployStep,
    "static directory routes must be prepared after build and before deploy",
  );
  assert.ok(smokeStep > deployStep, "smoke verification must run after deploy");
  assert.match(
    deployJob,
    /PUBLIC_URL:\s*https:\/\/tio2-malaysia\.vercel\.app/,
  );
  assert.match(
    deployJob,
    /node scripts\/verify-deployment\.mjs "\$PUBLIC_URL"/,
  );
});
