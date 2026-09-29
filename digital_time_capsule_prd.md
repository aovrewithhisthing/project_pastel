# Product Requirements Document (PRD)
## Digital Time Capsule (v1.0 Production Spec)

---

## 1. Executive Summary & Product Vision

**Digital Time Capsule** is a private, emotional digital space designed for users to write letters, save media, and store personal memories that remain strictly locked until a designated time in the future. 

Unlike conventional note-taking tools or SaaS dashboards, Digital Time Capsule prioritizes intimacy, nostalgia, and personal reflection. The system combines secure time-lock mechanics with a warm, paper-and-ink visual aesthetic, making the act of storing and retrieving memories feel meaningful and cinematic.

---

## 2. Target Users & Core Use Cases

| User Persona | Scenario / Use Case | Core Value Proposition |
| :--- | :--- | :--- |
| **Students & Graduates** | Writing letters to be opened on graduation day or 5-year reunions. | Documenting growth and setting long-term aspirations. |
| **Personal Reflectors** | Creating "Future Self" letters during transitional life phases. | Safe, private vault for personal growth tracking. |
| **Couples & Loved Ones** | Sending time-locked anniversary notes or future wedding letters. | Preserving emotional milestones in an intimate space. |
| **Friend Groups** | Group capsules where multiple users contribute before sealing. | Shared nostalgia and collaborative memory preservation. |

---

## 3. Core User Flow

```
   [ Landing Page ]
          │
          ▼
   [ Authenticate ] ───► [ Dashboard Archive ]
                               │
                               ▼
                     [ Create & Compose ]
                               │
                     ┌─────────┴─────────┐
                     ▼                   ▼
            (Attach Media / Tags)   (Set Time Lock / Type)
                               │
                               ▼
                     [ Review & Lock Seal ]
                               │
                               ▼
                     [ Locked State Vault ] (Content Encrypted & Hidden)
                               │
                               ▼ (Server Time >= Unlock Date)
                               │
                     [ Opening Experience ] (Cinematic Reveal)
                               │
                               ▼
                     [ Read & Reflect ] ───► [ Add Future Reflection ]
```

---

## 4. System Architecture & Technical Stack

To guarantee that locked content remains completely inaccessible prior to the exact unlock timestamp, the system decouples public metadata from payload delivery via server-side authorization checks.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (SPA)                               │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTPS / REST / WebSockets
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY / SERVER                          │
│     (Auth Middleware, Rate Limiting, Time-Lock Authorization Engine)     │
└──────────────────┬──────────────────────────────────────┬───────────────┘
                   │                                      │
                   ▼                                      ▼
┌──────────────────────────────────────┐┌─────────────────────────────────┐
│          PRIMARY DATABASE            ││      ENCRYPTED MEDIA STORE      │
│     (Users, Metadata, Reflections)   ││   (Private Object Bucket / S3)   │
└──────────────────────────────────────┘└─────────────────────────────────┘
```

* **Frontend Framework:** React / Next.js (App Router), Tailwind CSS, Framer Motion (for atmospheric reveals).
* **Backend Services:** Node.js (TypeScript) / Express or Next.js API Routes.
* **Database & ORM:** PostgreSQL with Prisma ORM.
* **Storage Engine:** AWS S3 / Compatible Object Storage using Private Buckets and Short-Lived Signed URLs.
* **Authentication:** NextAuth.js or Supabase Auth with HTTP-only, Secure, SameSite cookies.
* **Background Jobs:** BullMQ with Redis for scheduled delivery and notification dispatching.

---

## 5. Database Schema (Prisma Schema)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum CapsuleType {
  PRIVATE
  FUTURE_SELF
  TO_SOMEONE
  MILESTONE
  SHARED
  RANDOM
}

enum CapsuleStatus {
  DRAFT
  LOCKED
  READY
  OPENED
  ARCHIVED
}

enum Role {
  OWNER
  CONTRIBUTOR
  RECIPIENT
}

model User {
  id             String               @id @default(uuid())
  email          String               @unique
  passwordHash   String
  displayName    String
  avatarUrl      String?
  emailVerified  DateTime?
  createdAt      DateTime             @default(now())
  updatedAt      DateTime             @updatedAt
  capsules       CapsuleOwner[]
  contributions  CapsuleContributor[]
  reflections    Reflection[]
  notifications  Notification[]
}

model Capsule {
  id            String               @id @default(uuid())
  title         String
  description   String?
  type          CapsuleType          @default(PRIVATE)
  status        CapsuleStatus        @default(LOCKED)
  
  // Encrypted Payload (Nullified/Hidden on backend until unlock)
  content       String?              @db.Text
  
  // Time Lock Attributes
  createdAt     DateTime             @default(now())
  unlockAt      DateTime
  timezone      String               @default("UTC")
  openedAt      DateTime?
  
  // Metadata & Customization
  coverImageUrl String?
  mood          String?
  location      String?
  
  tags          TagOnCapsule[]
  media         MediaAttachment[]
  owners        CapsuleOwner[]
  contributors  CapsuleContributor[]
  reflections   Reflection[]
}

model CapsuleOwner {
  id        String   @id @default(uuid())
  userId    String
  capsuleId String
  role      Role     @default(OWNER)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  capsule   Capsule  @relation(fields: [capsuleId], references: [id], onDelete: Cascade)

  @@unique([userId, capsuleId])
}

model CapsuleContributor {
  id        String   @id @default(uuid())
  userId    String?  
  email     String?
  capsuleId String
  content   String?  @db.Text
  submitted DateTime @default(now())
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  capsule   Capsule  @relation(fields: [capsuleId], references: [id], onDelete: Cascade)
}

model MediaAttachment {
  id        String   @id @default(uuid())
  capsuleId String
  fileUrl   String   // Storage key
  fileName  String
  fileType  String
  fileSize  Int
  capsule   Capsule  @relation(fields: [capsuleId], references: [id], onDelete: Cascade)
}

model Reflection {
  id        String   @id @default(uuid())
  capsuleId String
  userId    String
  content   String   @db.Text
  createdAt DateTime @default(now())
  capsule   Capsule  @relation(fields: [capsuleId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Tag {
  id       String         @id @default(uuid())
  name     String         @unique
  capsules TagOnCapsule[]
}

model TagOnCapsule {
  capsuleId String
  tagId     String
  capsule   Capsule @relation(fields: [capsuleId], references: [id], onDelete: Cascade)
  tag       Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([capsuleId, tagId])
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  title     String
  message   String
  isRead    Boolean  @default(false)
  scheduled DateTime
  sentAt    DateTime?
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## 6. Detailed API Specifications

### 6.1 Fetch Capsule Endpoint
* **Endpoint:** `GET /api/v1/capsules/:id`
* **Headers:** `Authorization: Bearer <token>`
* **Server-Side Validation Sequence:**
  1. Authenticate context token.
  2. Query database for user permissions regarding requested `id`. Return `403 Forbidden` if unauthorized.
  3. Compare `server_timestamp` with `capsule.unlockAt`.
     * **If `server_timestamp < capsule.unlockAt`:** Return metadata, countdown timer, and tags. Strip `content` and media references completely.
     * **If `server_timestamp >= capsule.unlockAt`:** Return full payload including `content` and pre-signed media download links. Update status to `OPENED`.

#### Response Payload (Locked State - 200 OK)
```json
{
  "id": "c7b3d9e2-8f1a-4e3b-9a72-1d5e8f3a6b01",
  "title": "Dear Future Me",
  "description": "A snapshot of my life and goals.",
  "type": "FUTURE_SELF",
  "status": "LOCKED",
  "createdAt": "2026-09-29T08:00:00.000Z",
  "unlockAt": "2029-09-29T08:00:00.000Z",
  "timezone": "America/New_York",
  "mood": "Hopeful",
  "location": "Seattle, WA",
  "tags": ["goals", "growth"],
  "mediaCount": 2,
  "isLocked": true,
  "timeRemaining": {
    "totalSeconds": 94608000,
    "days": 1095,
    "hours": 0,
    "minutes": 0
  }
}
```

#### Response Payload (Unlocked State - 200 OK)
```json
{
  "id": "c7b3d9e2-8f1a-4e3b-9a72-1d5e8f3a6b01",
  "title": "Dear Future Me",
  "description": "A snapshot of my life and goals.",
  "type": "FUTURE_SELF",
  "status": "OPENED",
  "createdAt": "2026-09-29T08:00:00.000Z",
  "unlockAt": "2029-09-29T08:00:00.000Z",
  "openedAt": "2029-09-29T08:00:05.000Z",
  "content": "I hope you finally became the designer you wanted to be...",
  "mood": "Hopeful",
  "isLocked": false,
  "media": [
    {
      "id": "m1",
      "fileName": "workspace_2026.jpg",
      "fileType": "image/jpeg",
      "signedUrl": "https://storage.digitaltimecapsule.com/media/m1.jpg?token=exp17000000"
    }
  ],
  "reflections": []
}
```

---

## 7. Security & Anti-Tampering Matrix

| Vulnerability Vector | Threat Scenario | Mitigation Strategy |
| :--- | :--- | :--- |
| **IDOR Attack** | User modifies URL parameter (`/capsule/123` -> `/capsule/124`) to access another user's content. | Enforce direct user ownership validation queries on every payload request prior to database lookup. |
| **Client Clock Modification** | User shifts device date/time forward to bypass time lock. | The frontend clock is strictly visual. Unlock conditions are computed exclusively using server UTC time. |
| **Storage Bucket Snooping** | User guesses direct URL to media attachments. | Bucket storage policies block public access (`BlockPublicAccess`). Attachments are served via temporary, signed URLs valid for 15 minutes. |
| **Database Compromise** | Unauthorized database access reveals locked text messages. | Sensitive message payloads are encrypted at rest using AES-256-GCM encryption before storing in PostgreSQL. |
| **Brute Force Endpoint Mining** | Automated bots scanning capsule UUID endpoints. | Implement rate limiting (e.g., max 60 requests per minute) and use 128-bit cryptographically secure UUID v4 identifiers. |

---

## 8. UI/UX Design System & Aesthetics

### Visual Philosophy
Digital Time Capsule rejects high-contrast SaaS designs, neon cyberpunk themes, and standard note-taking tools in favor of an atmosphere that feels like a quiet library or personal leather journal.

### Palette Specifications
* **Background / Canvas:** Warm Parchment (`#FDFBF7`)
* **Primary Text:** Deep Ink Black (`#1A1918`)
* **Accent / Terracotta:** Dusty Clay (`#C48B71`)
* **Highlights & Seals:** Muted Gold (`#D4A359`)

### Typography Hierarchy
* **Headings & Statements:** Serif font (`Playfair Display` / `Newsreader`) for an elegant, literary feel.
* **Interface Text & Inputs:** Clean sans-serif (`Inter` / `Plus Jakarta Sans`) for optimal legibility across devices.

### Cinematic Unlocking Experience
1. **Transition:** When opening an unlocked capsule, the UI smoothly dims into an atmospheric backdrop.
2. **Unlatching:** A subtle animation reveals the seal opening, accompanied by low-contrast text fading in line by line.
3. **Reflection Mode:** Once the message is displayed, a secondary prompt opens below allowing the user to write a "Now vs. Then" reflection entry without altering the original letter.