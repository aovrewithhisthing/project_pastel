export type CapsuleType = "FUTURE_SELF" | "TO_SOMEONE" | "SHARED" | "MILESTONE" | "PRIVATE";
export type CapsuleStatus = "LOCKED" | "READY" | "OPENED";

export interface MediaItem {
  id: string;
  name: string;
  size: string;
  kind: "audio" | "photo" | "doc";
  duration?: string;
  preview?: string;
}

export interface Capsule {
  id: string;
  title: string;
  description: string;
  type: CapsuleType;
  status: CapsuleStatus;
  createdAt: string;
  unlockAt: string;
  timezone: string;
  openedAt?: string;
  content: string;
  mood: string;
  location: string;
  tags: string[];
  media: MediaItem[];
  recipient?: string;
  contributors?: string[];
  reflections: { id: string; content: string; createdAt: string }[];
  coverGradient: string;
  icon: string;
}

export interface DraftCapsule {
  title: string;
  content: string;
  type: CapsuleType;
  mood: string;
  location: string;
  tags: string[];
  unlockDate: string;
  unlockTime: string;
  recipient: string;
}
