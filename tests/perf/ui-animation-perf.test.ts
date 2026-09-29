import test from "node:test";
import assert from "node:assert/strict";
import { validateMediaFile, checkFrameBudget } from "../../src/lib/media-upload-validator.js";

test("=== QA UI ANIMATION & CLIENT MEDIA VALIDATION TEST SUITE ===", async (t) => {

  await t.test("UI-PERF-01: Wax Melting Animation Frame Budget Compliance", () => {
    // Simulate complex calculation during wax melting frame render:
    // CSS opacity easing, SVG droplet path interpolation, and countdown timer update
    const animationFrameWork = () => {
      let sum = 0;
      for (let i = 0; i < 5000; i++) {
        sum += Math.sin(i) * Math.cos(i);
      }
      return sum;
    };

    const result = checkFrameBudget(animationFrameWork);

    assert.equal(
      result.is60FpsCompliant,
      true,
      `Animation frame calculation took ${result.durationMs.toFixed(3)}ms (must be under 16.6ms for 60 FPS)`
    );
  });

  await t.test("UI-PERF-02: Client Pre-Flight Media Size & ETA Estimation", () => {
    // Valid 10 MB image
    const validPhoto = { name: "sunset_bali.jpg", size: 10 * 1024 * 1024, type: "image/jpeg" };
    const resValid = validateMediaFile(validPhoto);

    assert.equal(resValid.valid, true);
    assert.equal(resValid.formattedSize, "10.0 MB");
    assert.equal(resValid.estimatedSecondsAt10Mbps, 8); // 10 / 1.25 = 8 seconds

    // Exceeding 25 MB
    const oversizedVideo = { name: "full_concert.mp4", size: 30 * 1024 * 1024, type: "video/mp4" };
    const resOver = validateMediaFile(oversizedVideo);

    assert.equal(resOver.valid, false);
    assert.match(resOver.error!, /melebihi batas maksimum 25 MB/);

    // Disallowed extension (.exe)
    const dangerousExecutable = { name: "game.exe", size: 1024 * 1024, type: "application/x-msdownload" };
    const resDangerous = validateMediaFile(dangerousExecutable);

    assert.equal(resDangerous.valid, false);
    assert.match(resDangerous.error!, /tidak didukung/);
  });

});
