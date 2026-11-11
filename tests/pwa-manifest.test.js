import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const manifestUrl = new URL("../public/manifest.webmanifest", import.meta.url);
const iconUrl = new URL("../public/icons/icon.svg", import.meta.url);

test("PWA manifest declares an installable standalone application", async () => {
  const manifest = JSON.parse(await readFile(manifestUrl, "utf8"));
  assert.equal(manifest.name, "Student Monitoring System");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "/");
  assert.ok(manifest.icons.some((icon) => icon.src === "/icons/icon.svg" && icon.sizes === "any"));
  assert.ok((await readFile(iconUrl, "utf8")).includes("<svg"));
});
