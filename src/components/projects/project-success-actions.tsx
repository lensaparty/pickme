"use client";

import Link from "next/link";
import { useState } from "react";
import { Copy, ExternalLink, LayoutDashboard, MessageCircleMore, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  link: string;
  previewPath: string;
  whatsappUrl: string;
};

export function ProjectSuccessActions({ link, previewPath, whatsappUrl }: Props) {
  const [copied, setCopied] = useState(false);
  const [templateCopied, setTemplateCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function handleCopyTemplate() {
    const template = `Hi, your PickMe gallery is ready:\n${link}`;
    await navigator.clipboard.writeText(template);
    setTemplateCopied(true);
    window.setTimeout(() => setTemplateCopied(false), 1800);
  }

  return (
    <div className="mt-6 space-y-3.5 sm:mt-8 sm:space-y-4">
      <div className="grid gap-3 sm:grid-cols-1">
        <Button size="lg" className="w-full" asChild>
          <a href={whatsappUrl} target="_blank" rel="noreferrer">
            <MessageCircleMore className="h-4 w-4" /> Send to client via WhatsApp
          </a>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="secondary" className="w-full" onClick={handleCopy}>
          <Copy className="h-4 w-4" /> {copied ? "Client link copied" : "Copy client link"}
        </Button>
        <Button variant="secondary" className="w-full" asChild>
          <a href={previewPath}>
            <ExternalLink className="h-4 w-4" /> Open client flow
          </a>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Button variant="outline" className="w-full" onClick={handleCopyTemplate}>
          <Copy className="h-4 w-4" /> {templateCopied ? "Message copied" : "Copy message"}
        </Button>
        <Button variant="ghost" className="w-full justify-center" asChild>
          <Link href="/projects/new">
            <Plus className="h-4 w-4" /> Create another
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-center" asChild>
          <Link href="/">
            <LayoutDashboard className="h-4 w-4" /> Return to dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
