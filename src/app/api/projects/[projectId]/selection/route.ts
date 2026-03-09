import { NextRequest, NextResponse } from "next/server";

import { logError, logInfo, logWarn } from "@/lib/logger";
import { updateProjectSelection } from "@/lib/project-store";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const body = await request.json();
  const selectedIds = Array.isArray(body?.selectedIds) ? body.selectedIds.filter((item: unknown) => typeof item === "string") : [];
  const selectedCount = Number(body?.selectedCount ?? selectedIds.length);

  if (!projectId || !Number.isFinite(selectedCount) || selectedCount < 0) {
    await logWarn("project.selection.invalid_payload", { projectId, selectedCount });
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  let project;
  try {
    project = await updateProjectSelection(projectId, {
      selectedIds,
      selectedCount,
    });
  } catch (error) {
    await logError("project.selection.failed", error, { projectId });
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  if (!project) {
    await logWarn("project.selection.not_found", { projectId });
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await logInfo("project.selection.updated", {
    projectId,
    selectedCount,
  });

  return NextResponse.json({ ok: true, project });
}
