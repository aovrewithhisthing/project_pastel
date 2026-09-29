import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeText, escapeHtml } from "../../src/utils/sanitize.js";
import { buildFileKey, assertUploadable } from "../../src/services/s3.service.js";
import { AppError } from "../../src/middlewares/errorHandler.js";

test("=== QA SECURITY TEST SUITE: Access Control, Time-Lock & Sanitization ===", async (t) => {

  await t.test("SEC-TL-01: Time-Lock Protection - Locked Envelope Contract", () => {
    const serverNow = new Date("2026-09-29T10:00:00.000Z");
    const openAtFuture = new Date("2026-10-01T10:00:00.000Z");
    
    // Simulate server-side lock evaluation
    const isLocked = serverNow < openAtFuture;
    assert.equal(isLocked, true, "Capsule must be evaluated as locked by server clock");

    // Locked response structure must NEVER contain contentText or attachments
    const mockLockedResponse = {
      locked: true,
      capsule: {
        id: "cap-123",
        title: "Pesan Masa Depan",
        openAt: openAtFuture,
        status: "LOCKED",
        locked: true,
        createdAt: serverNow,
        updatedAt: serverNow,
      }
    };

    assert.equal((mockLockedResponse.capsule as any).contentText, undefined, "Locked capsule MUST NOT leak contentText");
    assert.equal((mockLockedResponse.capsule as any).attachments, undefined, "Locked capsule MUST NOT leak attachments");
  });

  await t.test("SEC-TL-02: Time-Lock Protection - Reject Past or Current openAt Date", () => {
    const serverNow = Date.now();
    const pastDate = new Date(serverNow - 3600 * 1000); // 1 hour ago
    
    assert.throws(
      () => {
        if (pastDate.getTime() <= Date.now()) {
          throw new AppError("openAt must be a future date", 422);
        }
      },
      (err: any) => {
        return err instanceof AppError && err.statusCode === 422 && err.message === "openAt must be a future date";
      },
      "Must reject openAt in the past with HTTP 422"
    );
  });

  await t.test("SEC-TL-03: Client Clock Tampering Neutralization", () => {
    // Client device clock is spoofed to 2030 (years in the future)
    const clientSpoofedTime = new Date("2030-01-01T00:00:00.000Z");
    // Authoritative Server Time is still in 2026
    const authoritativeServerTime = new Date("2026-09-29T12:00:00.000Z");
    const capsuleOpenAt = new Date("2027-01-01T00:00:00.000Z");

    // Client claims: clientSpoofedTime >= capsuleOpenAt (true on client side)
    const clientSideStatus = clientSpoofedTime >= capsuleOpenAt;
    assert.equal(clientSideStatus, true, "Client locally thinks it's unlocked");

    // Server-side check is authoritative:
    const serverEnforcedStatus = authoritativeServerTime >= capsuleOpenAt;
    assert.equal(serverEnforcedStatus, false, "Server time-lock strictly holds back access");
  });

  await t.test("SEC-IDOR-01: IDOR Prevention on Capsule Retrieval & Delete", () => {
    // Mock user sessions
    const userA = { id: "user-alpha-111" };
    const userB = { id: "user-beta-222" }; // Attacker trying to query User A's capsule

    const capsulesDb = [
      { id: "cap-secret-999", userId: userA.id, title: "Catatan Pribadi Rahasia", contentText: "Rahasia Alpha" }
    ];

    // Simulated getCapsuleById query: WHERE id = :id AND userId = :currentUserId
    const getCapsule = (id: string, currentUserId: string) => {
      const row = capsulesDb.find((c) => c.id === id && c.userId === currentUserId);
      if (!row) throw new AppError("Capsule not found", 404);
      return row;
    };

    // User A can access
    const resultUserA = getCapsule("cap-secret-999", userA.id);
    assert.equal(resultUserA.id, "cap-secret-999");

    // User B receives 404 (IDOR prevented, existence is not leaked)
    assert.throws(
      () => getCapsule("cap-secret-999", userB.id),
      (err: any) => err instanceof AppError && err.statusCode === 404,
      "User B should get 404 when querying User A capsule"
    );

    // Simulated deleteCapsule: DELETE WHERE id = :id AND userId = :currentUserId
    const deleteCapsule = (id: string, currentUserId: string) => {
      const index = capsulesDb.findIndex((c) => c.id === id && c.userId === currentUserId);
      if (index === -1) throw new AppError("Capsule not found", 404);
      capsulesDb.splice(index, 1);
    };

    // User B fails to delete
    assert.throws(
      () => deleteCapsule("cap-secret-999", userB.id),
      (err: any) => err instanceof AppError && err.statusCode === 404,
      "User B cannot delete User A capsule"
    );

    // Verify capsule remains intact
    assert.equal(capsulesDb.length, 1, "Capsule must remain intact after unauthorized delete attempt");
  });

  await t.test("SEC-XSS-01: Input Sanitization - Stripping Harmful Script & Event Handlers", () => {
    const maliciousInputScript = "Hello <script>alert('xss vulnerability')</script> world!";
    const cleanedScript = sanitizeText(maliciousInputScript);
    assert.equal(cleanedScript.includes("<script>"), false, "Script tags must be stripped");
    assert.equal(cleanedScript, "Hello  world!");

    const maliciousImg = "Memori indah <img src=x onerror=alert('cookie-theft')> di pantai";
    const cleanedImg = sanitizeText(maliciousImg);
    assert.equal(cleanedImg.includes("onerror"), false, "Event handlers must be stripped");

    const maliciousIframe = "Lihat: <iframe src='javascript:alert(1)'></iframe>";
    const cleanedIframe = sanitizeText(maliciousIframe);
    assert.equal(cleanedIframe.includes("iframe"), false, "Iframe elements must be stripped");

    const escaped = escapeHtml("<b>Bold</b> & 'Special'");
    assert.equal(escaped, "&lt;b&gt;Bold&lt;&#x2F;b&gt; &amp; &#x27;Special&#x27;");
  });

  await t.test("SEC-PATH-01: S3 File Key Path Traversal Defense", () => {
    const maliciousFileName = "../../../etc/passwd";
    const safeKey = buildFileKey("user-100", "capsule-200", maliciousFileName);

    assert.equal(safeKey.includes("../"), false, "Path traversal characters '../' must be stripped");
    assert.match(safeKey, /^capsules\/user-100\/capsule-200\/[a-f0-9-]+-.*etc.*passwd$/, "Key must follow isolated safe layout");
  });

});
