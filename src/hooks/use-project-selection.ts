"use client";

import { useEffect, useMemo, useState } from "react";

import { Photo } from "@/lib/types";

function getStorageKey(shareCode: string) {
  return `pickme.selection.${shareCode}`;
}

export function useProjectSelection({
  shareCode,
  initialPhotos,
  selectionLimit,
}: {
  shareCode: string;
  initialPhotos: Photo[];
  selectionLimit: number;
}) {
  const [photos] = useState(initialPhotos);
  const [activeFolderId, setActiveFolderId] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    initialPhotos.filter((photo) => photo.selected).map((photo) => photo.id),
  );
  const [limitMessage, setLimitMessage] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(getStorageKey(shareCode));
      if (raw) {
        const parsed = JSON.parse(raw) as { selectedIds?: string[] };
        if (Array.isArray(parsed.selectedIds)) {
          setSelectedIds(parsed.selectedIds);
        }
      }
    } catch {
      // Ignore invalid local state and keep the seeded selection.
    } finally {
      setHydrated(true);
    }
  }, [shareCode]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(getStorageKey(shareCode), JSON.stringify({ selectedIds }));
  }, [hydrated, selectedIds, shareCode]);

  const visiblePhotos = useMemo(() => {
    if (activeFolderId === "all") return photos;
    return photos.filter((photo) => photo.folderId === activeFolderId);
  }, [activeFolderId, photos]);

  const selectedPhotos = useMemo(() => {
    const selectedSet = new Set(selectedIds);
    return photos.filter((photo) => selectedSet.has(photo.id));
  }, [photos, selectedIds]);

  function toggleSelection(photoId: string) {
    setSelectedIds((current) => {
      if (current.includes(photoId)) {
        setLimitMessage("");
        return current.filter((id) => id !== photoId);
      }
      if (current.length >= selectionLimit) {
        setLimitMessage(`Selection limit reached. Remove one photo before adding another.`);
        return current;
      }
      setLimitMessage("");
      return [...current, photoId];
    });
  }

  function removeSelection(photoId: string) {
    setLimitMessage("");
    setSelectedIds((current) => current.filter((id) => id !== photoId));
  }

  function clearSelection() {
    setLimitMessage("");
    setSelectedIds([]);
  }

  return {
    hydrated,
    photos,
    visiblePhotos,
    selectedPhotos,
    selectedIds,
    selectedCount: selectedIds.length,
    remainingCount: Math.max(0, selectionLimit - selectedIds.length),
    activeFolderId,
    setActiveFolderId,
    toggleSelection,
    removeSelection,
    clearSelection,
    limitMessage,
  };
}
