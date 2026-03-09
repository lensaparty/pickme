import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

describe("project-store-file", () => {
  let tempDir = "";

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), "pickme-store-"));
    process.env.PICKME_DATA_DIR = tempDir;
    process.env.APP_SECRET = "vitest-secret";
    vi.resetModules();
  });

  afterEach(async () => {
    delete process.env.PICKME_DATA_DIR;
    await rm(tempDir, { recursive: true, force: true });
  });

  it("creates, updates, and deletes projects in the file store", async () => {
    const store = await import("@/lib/project-store-file");

    const created = await store.createProjectInFileStore({
      name: "Luna Wedding",
      clientName: "Luna",
      eventType: "Wedding",
      driveLink: "https://drive.google.com/drive/folders/abc123",
      selectionLimit: 100,
      expiresAt: "2026-03-30",
      whatsapp: "+62 812-1111-2222",
      welcomeMessage: "Halo Luna",
      password: "LUNA2026",
      passwordProtected: true,
      allowDownloads: true,
      clientCode: "LUNA-WED",
    });

    expect(created.code).toBe("LUNA-WED");
    expect(created.password).not.toBe("LUNA2026");

    const byCode = await store.getProjectByCodeFromFileStore("luna-wed");
    expect(byCode?.name).toBe("Luna Wedding");

    const updated = await store.updateProjectByCodeInFileStore("luna-wed", {
      name: "Luna Wedding Updated",
      allowDownloads: false,
    });
    expect(updated?.name).toBe("Luna Wedding Updated");
    expect(updated?.allowDownloads).toBe(false);

    const selectionUpdated = await store.updateProjectSelectionInFileStore(created.id, {
      selectedCount: 12,
      selectedIds: ["photo-1", "photo-2"],
    });
    expect(selectionUpdated?.selectedCount).toBe(12);
    expect(selectionUpdated?.selectedIds).toEqual(["photo-1", "photo-2"]);

    const deleted = await store.deleteProjectByCodeFromFileStore("luna-wed");
    expect(deleted).toBe(true);

    const afterDelete = await store.getProjectByCodeFromFileStore("luna-wed");
    expect(afterDelete).toBeNull();
  });
});
