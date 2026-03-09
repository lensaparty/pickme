import { Folder, Photo } from "@/lib/types";

export const dashboardStats = [
  { label: "Active projects", value: "14", hint: "4 waiting for client review" },
  { label: "Selections received", value: "38", hint: "Across the last 7 days" },
  { label: "Avg. completion", value: "82%", hint: "From link open to send" },
  { label: "Storage linked", value: "Google Drive", hint: "Primary delivery source" },
];

export const galleryFolders: Folder[] = [
  {
    id: "all",
    name: "All Photos",
    photoCount: 1284,
    cover: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80",
    highlight: "Everything in one visual stream",
  },
  {
    id: "ceremony",
    name: "Ceremony",
    photoCount: 364,
    cover: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
    highlight: "The vows, details, and family moments",
  },
  {
    id: "portrait",
    name: "Portraits",
    photoCount: 218,
    cover: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80",
    highlight: "Editorial shots with cleaner composition",
  },
  {
    id: "reception",
    name: "Reception",
    photoCount: 428,
    cover: "https://images.unsplash.com/photo-1525258946800-98cfd641d0de?auto=format&fit=crop&w=900&q=80",
    highlight: "Dance floor, cheers, and candid reactions",
  },
  {
    id: "family",
    name: "Family & Guests",
    photoCount: 274,
    cover: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=80",
    highlight: "Group portraits and warm interactions",
  },
];

export const galleryPhotos: Photo[] = [
  {
    id: "PH-001",
    title: "Ceremony Kiss",
    folderId: "ceremony",
    src: "https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=1200&q=80",
    favorite: true,
  },
  {
    id: "PH-002",
    title: "Portrait Archway",
    folderId: "portrait",
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "PH-003",
    title: "Reception Toast",
    folderId: "reception",
    src: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "PH-004",
    title: "Bridal Details",
    folderId: "ceremony",
    src: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "PH-005",
    title: "Family Cheers",
    folderId: "family",
    src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "PH-006",
    title: "Sunset Portrait",
    folderId: "portrait",
    src: "https://images.unsplash.com/photo-1516589091380-5d8e87df6991?auto=format&fit=crop&w=1200&q=80",
    favorite: true
  },
  {
    id: "PH-007",
    title: "Dance Floor",
    folderId: "reception",
    src: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "PH-008",
    title: "Parents Portrait",
    folderId: "family",
    src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "PH-009",
    title: "Veil Motion",
    folderId: "portrait",
    src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "PH-010",
    title: "Friends Table",
    folderId: "reception",
    src: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1200&q=80"
  }
];
