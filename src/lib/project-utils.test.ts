import { describe, expect, it } from "vitest";

import {
  buildClientPath,
  buildProjectInviteMessage,
  extractDriveFolderId,
  generateShareCode,
  normalizeShareCode,
} from "@/lib/project-utils";
import { Project } from "@/lib/types";

const baseProject: Project = {
  id: "project-1",
  code: "LUNA-ARYA",
  name: "Luna & Arya Wedding",
  clientName: "Luna",
  eventType: "Wedding",
  createdAt: "2026-03-09T00:00:00.000Z",
  expiresAt: "2026-03-20T00:00:00.000Z",
  selectionLimit: 120,
  selectedCount: 0,
  selectedIds: [],
  folderCount: 5,
  photoCount: 1200,
  driveLink: "https://drive.google.com/drive/folders/abc123",
  driveFolderId: "abc123",
  whatsapp: "+62 812-0000-0000",
  status: "active",
  passwordProtected: true,
  password: "SUPER-SECRET",
  allowDownloads: true,
  welcomeMessage: "Hi Luna",
  lastActivity: "2026-03-09T00:00:00.000Z",
};

describe("project-utils", () => {
  it("normalizes share codes cleanly", () => {
    expect(normalizeShareCode(" luna & arya / wedding ")).toBe("LUNA-ARYA-WEDDING");
  });

  it("generates a safe share code from multiple parts", () => {
    expect(generateShareCode("Luna", "Arya Wedding")).toBe("LUNA-ARYA-WEDDING");
  });

  it("extracts drive folder ids from common link formats", () => {
    expect(extractDriveFolderId("https://drive.google.com/drive/folders/abc123")).toBe("abc123");
    expect(extractDriveFolderId("https://drive.google.com/open?id=xyz890")).toBe("xyz890");
  });

  it("builds client paths with normalized codes", () => {
    expect(buildClientPath("luna arya")).toBe("/client/LUNA-ARYA");
  });

  it("does not expose the password in invite messages", () => {
    const message = buildProjectInviteMessage(baseProject, "https://pickme.test/client/LUNA-ARYA");
    expect(message).toContain("Password protected. Share the gallery password separately.");
    expect(message).not.toContain("SUPER-SECRET");
  });
});

