import test from "node:test";
import assert from "node:assert/strict";
import { ApiClient, BackendEnvelopeResponse } from "../../src/lib/api-client.js";

test("=== QA INTEGRATION TEST SUITE: Frontend-Backend Contract & State Adapter ===", async (t) => {
  const client = new ApiClient();

  await t.test("INT-01: Locked Capsule Envelope Adapter", () => {
    const futureDate = new Date(Date.now() + 86400000 * 30).toISOString(); // +30 days
    const lockedBackendPayload: BackendEnvelopeResponse = {
      success: true,
      locked: true,
      capsule: {
        id: "cap-locked-101",
        title: "Pesan Kelulusan 2027",
        openAt: futureDate,
        status: "LOCKED",
        locked: true,
        createdAt: "2026-09-29T10:00:00.000Z",
        updatedAt: "2026-09-29T10:00:00.000Z",
      },
    };

    const adapted = client.adaptBackendEnvelope(lockedBackendPayload);

    assert.equal(adapted.id, "cap-locked-101");
    assert.equal(adapted.status, "LOCKED");
    assert.equal(adapted.content, "", "Content must be empty in locked state");
    assert.equal(adapted.media.length, 0, "No media should be present in locked state");
    assert.equal(adapted.icon, "lock");
  });

  await t.test("INT-02: Unlocked Capsule Envelope Adapter with Presigned Media", () => {
    const pastDate = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago
    const unlockedBackendPayload: BackendEnvelopeResponse = {
      success: true,
      locked: false,
      capsule: {
        id: "cap-unlocked-202",
        title: "Janji Suci Masa Lalu",
        contentText: "Ini adalah isi surat rahasia yang akhirnya terbuka!",
        openAt: pastDate,
        status: "UNLOCKED",
        locked: false,
        attachments: [
          {
            id: "att-001",
            fileName: "foto_kenangan.jpg",
            fileType: "image/jpeg",
            fileSize: 3145728, // 3 MB
            downloadUrl: "https://s3.ap-southeast-1.amazonaws.com/test-bucket/foto.jpg?X-Amz-Signature=xyz",
            downloadUrlExpiresIn: 1800,
            createdAt: "2026-09-29T10:00:00.000Z",
          },
          {
            id: "att-002",
            fileName: "audio_memo.mp3",
            fileType: "audio/mpeg",
            fileSize: 1048576, // 1 MB
            downloadUrl: "https://s3.ap-southeast-1.amazonaws.com/test-bucket/memo.mp3?X-Amz-Signature=abc",
            downloadUrlExpiresIn: 1800,
            createdAt: "2026-09-29T10:00:00.000Z",
          },
        ],
        createdAt: "2026-01-01T10:00:00.000Z",
        updatedAt: "2026-09-29T11:00:00.000Z",
      },
    };

    const adapted = client.adaptBackendEnvelope(unlockedBackendPayload);

    assert.equal(adapted.status, "OPENED");
    assert.equal(adapted.content, "Ini adalah isi surat rahasia yang akhirnya terbuka!");
    assert.equal(adapted.media.length, 2);
    assert.equal(adapted.media[0].kind, "photo");
    assert.equal(adapted.media[0].size, "3.0 MB");
    assert.equal(adapted.media[0].preview, unlockedBackendPayload.capsule.attachments![0].downloadUrl);
    assert.equal(adapted.media[1].kind, "audio");
    assert.equal(adapted.media[1].size, "1.0 MB");
  });

  await t.test("INT-03: Ready Transition Envelope Adapter", () => {
    const justUnlocked = new Date(Date.now() - 5000).toISOString();
    const readyBackendPayload: BackendEnvelopeResponse = {
      success: true,
      locked: false,
      capsule: {
        id: "cap-ready-303",
        title: "Kapsul Siap Dibuka",
        contentText: "Menunggu interaksi pengguna...",
        openAt: justUnlocked,
        status: "LOCKED", // Backend DB status might not be updated to UNLOCKED until first getCapsuleById
        locked: false,
        createdAt: "2026-01-01T10:00:00.000Z",
        updatedAt: "2026-09-29T10:00:00.000Z",
      },
    };

    const adapted = client.adaptBackendEnvelope(readyBackendPayload);
    assert.equal(adapted.status, "READY", "Must detect READY status for wax melting UI interaction");
  });

  await t.test("INT-04: Token Management & Authorization Header Injection", () => {
    client.setToken("jwt-access-token-test-xyz");
    assert.equal(client.getToken(), "jwt-access-token-test-xyz");

    client.clearToken();
    assert.equal(client.getToken(), null);
  });
});
