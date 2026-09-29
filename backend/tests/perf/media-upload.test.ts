import test from "node:test";
import assert from "node:assert/strict";
import { assertUploadable } from "../../src/services/s3.service.js";
import { AppError } from "../../src/middlewares/errorHandler.js";
import { env } from "../../src/config/env.js";

test("=== QA PERFORMANCE & MEDIA UPLOAD TEST SUITE ===", async (t) => {

  await t.test("PERF-01: Valid Media Types and Sizes Under Threshold", () => {
    // 5 MB JPEG image
    assert.doesNotThrow(() => {
      assertUploadable("family_reunion_2026.jpg", "image/jpeg", 5 * 1024 * 1024);
    }, "Valid 5MB JPEG must be accepted");

    // 15 MB MP3 Audio
    assert.doesNotThrow(() => {
      assertUploadable("voice_diary.mp3", "audio/mpeg", 15 * 1024 * 1024);
    }, "Valid 15MB MP3 must be accepted");

    // 20 MB PDF Document
    assert.doesNotThrow(() => {
      assertUploadable("secret_letters.pdf", "application/pdf", 20 * 1024 * 1024);
    }, "Valid 20MB PDF must be accepted");
  });

  await t.test("PERF-02: Boundary Value Testing on File Size Limits", () => {
    const maxSize = env.S3_MAX_FILE_SIZE;

    // Boundary: 1 byte (minimum valid size)
    assert.doesNotThrow(() => {
      assertUploadable("tiny_note.jpg", "image/jpeg", 1);
    }, "Minimum size 1 byte must pass");

    // Boundary: Exactly maximum size
    assert.doesNotThrow(() => {
      assertUploadable("max_allowed.jpg", "image/jpeg", maxSize);
    }, "File exactly at max size must pass");

    // Boundary: Max size + 1 byte (must be rejected)
    assert.throws(
      () => {
        assertUploadable("too_large.jpg", "image/jpeg", maxSize + 1);
      },
      (err: any) => err instanceof AppError && err.statusCode === 422,
      "File exceeding max size by 1 byte must be rejected with 422"
    );

    // Boundary: Zero bytes (empty file)
    assert.throws(
      () => {
        assertUploadable("empty.png", "image/png", 0);
      },
      (err: any) => err instanceof AppError && err.statusCode === 422,
      "Zero byte file must be rejected with 422"
    );

    // Boundary: Negative byte size
    assert.throws(
      () => {
        assertUploadable("corrupt.png", "image/png", -500);
      },
      (err: any) => err instanceof AppError && err.statusCode === 422,
      "Negative size must be rejected with 422"
    );
  });

  await t.test("PERF-03: Security Rejection of Dangerous Extensions & MIME types", () => {
    const dangerousFiles = [
      { name: "trojan.exe", type: "application/x-msdownload" },
      { name: "script.sh", type: "text/x-shellscript" },
      { name: "hack.php", type: "application/x-php" },
      { name: "exploit.bat", type: "application/x-bat" },
    ];

    for (const f of dangerousFiles) {
      assert.throws(
        () => {
          assertUploadable(f.name, f.type, 1024);
        },
        (err: any) => err instanceof AppError && err.statusCode === 422,
        `Dangerous file ${f.name} (${f.type}) must be rejected with HTTP 422`
      );
    }
  });

  await t.test("PERF-04: High-Throughput Validation Latency Benchmark", () => {
    const iterations = 5000;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      assertUploadable(`image_${i}.png`, "image/png", 1024 * 50);
    }

    const duration = performance.now() - start;
    const avgPerValidationUs = (duration / iterations) * 1000;

    assert.ok(duration < 50, `5,000 validations should complete in under 50ms (took ${duration.toFixed(2)}ms)`);
    assert.ok(avgPerValidationUs < 100, `Average validation latency should be < 100 microseconds (was ${avgPerValidationUs.toFixed(2)}µs)`);
  });

});
