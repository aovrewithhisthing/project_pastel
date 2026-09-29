/**
 * Chronicle Seal - Frontend-Backend API Client & Data Adapter
 * QA Engineer & Full-Stack Integration Module
 */

import { Capsule, CapsuleStatus, MediaItem } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const TOKEN_KEY = "chronicle_auth_token";

export interface BackendCapsuleRow {
  id: string;
  title: string;
  openAt: string;
  status: "LOCKED" | "UNLOCKED";
  locked: boolean;
  attachmentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BackendAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  downloadUrl: string;
  downloadUrlExpiresIn: number;
  createdAt: string;
}

export interface BackendEnvelopeResponse {
  success: boolean;
  locked: boolean;
  capsule: {
    id: string;
    title: string;
    contentText?: string | null;
    openAt: string;
    status: "LOCKED" | "UNLOCKED";
    locked: boolean;
    attachments?: BackendAttachment[];
    createdAt: string;
    updatedAt: string;
  };
}

export class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem(TOKEN_KEY);
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    return headers;
  }

  /**
   * Adapter: Normalizes Backend Envelope into Frontend Capsule model
   */
  adaptBackendEnvelope(res: BackendEnvelopeResponse): Capsule {
    const b = res.capsule;
    const now = Date.now();
    const openTime = new Date(b.openAt).getTime();
    
    let uiStatus: CapsuleStatus = "LOCKED";
    if (!res.locked && b.status === "UNLOCKED") {
      uiStatus = "OPENED";
    } else if (openTime <= now) {
      uiStatus = "READY";
    }

    const media: MediaItem[] = (b.attachments || []).map((att) => ({
      id: att.id,
      name: att.fileName,
      size: `${(att.fileSize / (1024 * 1024)).toFixed(1)} MB`,
      kind: att.fileType.startsWith("audio")
        ? "audio"
        : att.fileType.startsWith("video") || att.fileType.startsWith("image")
        ? "photo"
        : "doc",
      preview: att.downloadUrl,
    }));

    return {
      id: b.id,
      title: b.title,
      description: b.contentText ? b.contentText.slice(0, 120) + "..." : "Amplop terkunci rahasia",
      type: "FUTURE_SELF",
      status: uiStatus,
      createdAt: b.createdAt,
      unlockAt: b.openAt,
      timezone: "Asia/Jakarta",
      content: b.contentText || "",
      mood: "Reflektif",
      location: "Indonesia",
      tags: ["kapsul-waktu"],
      media,
      reflections: [],
      coverGradient: res.locked ? "from-[#ffdbcc] to-[#f2edeb]" : "from-[#fec97b] via-[#ece7e5] to-[#f7f3f0]",
      icon: res.locked ? "lock" : "hourglass_empty",
    };
  }

  /**
   * Fetch a single capsule by ID with time-lock validation
   */
  async getCapsuleById(id: string): Promise<Capsule> {
    const res = await fetch(`${API_BASE}/api/capsules/${id}`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      if (res.status === 404) throw new Error("Capsule not found or access denied (IDOR protection)");
      if (res.status === 401) throw new Error("Unauthorized: Silakan login terlebih dahulu");
      throw new Error(`API error: ${res.statusText}`);
    }

    const json: BackendEnvelopeResponse = await res.json();
    return this.adaptBackendEnvelope(json);
  }

  /**
   * Create a new time capsule
   */
  async createCapsule(payload: { title: string; contentText?: string; openAt: string }): Promise<{ id: string }> {
    const res = await fetch(`${API_BASE}/api/capsules`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || "Gagal membuat kapsul");
    }

    const data = await res.json();
    return data.data;
  }

  /**
   * Request Presigned S3 Upload URL for media attachment
   */
  async getAttachmentUploadUrl(
    capsuleId: string,
    fileMeta: { fileName: string; fileType: string; fileSize: number }
  ): Promise<{ uploadUrl: string; expiresIn: number; attachmentId: string }> {
    const res = await fetch(`${API_BASE}/api/capsules/${capsuleId}/attachments/upload-url`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(fileMeta),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || "Gagal mendapatkan upload URL");
    }

    const result = await res.json();
    return {
      uploadUrl: result.uploadUrl,
      expiresIn: result.expiresIn,
      attachmentId: result.attachment.id,
    };
  }

  /**
   * Direct PUT upload to AWS S3 via presigned URL
   */
  async uploadFileToS3(uploadUrl: string, file: Blob, contentType: string): Promise<boolean> {
    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
      },
      body: file,
    });
    return res.ok;
  }
}

export const apiClient = new ApiClient();
