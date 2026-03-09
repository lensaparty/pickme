"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink, Eye, MessageCircleMore } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ProjectShareActions({
  clientPath,
  reviewPath,
  inviteMessage,
  inviteUrl,
}: {
  clientPath: string;
  reviewPath: string;
  inviteMessage: string;
  inviteUrl: string;
}) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  const clientLink = useMemo(() => {
    if (typeof window === "undefined") return clientPath;
    return `${window.location.origin}${clientPath}`;
  }, [clientPath]);

  async function handleCopyLink() {
    await navigator.clipboard.writeText(clientLink);
    setCopiedLink(true);
    window.setTimeout(() => setCopiedLink(false), 1800);
  }

  async function handleCopyMessage() {
    await navigator.clipboard.writeText(inviteMessage);
    setCopiedMessage(true);
    window.setTimeout(() => setCopiedMessage(false), 1800);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-white/8 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Client link</p>
        <p className="mt-3 break-all text-sm leading-6 text-stone-300">{clientLink}</p>
      </div>

      <div className="flex flex-col gap-3">
        <Button className="w-full" asChild>
          <a href={inviteUrl} target="_blank" rel="noreferrer">
            <MessageCircleMore className="h-4 w-4" /> Send link via WhatsApp
          </a>
        </Button>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button variant="secondary" className="w-full" onClick={handleCopyLink}>
            {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copiedLink ? "Link copied" : "Copy client link"}
          </Button>
          <Button variant="secondary" className="w-full" asChild>
            <Link href={clientPath}>
              <Eye className="h-4 w-4" /> Open client flow
            </Link>
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button variant="outline" className="w-full" onClick={handleCopyMessage}>
            {copiedMessage ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copiedMessage ? "Message copied" : "Copy invite text"}
          </Button>
          <Button variant="ghost" className="w-full" asChild>
            <Link href={reviewPath}>
              <ExternalLink className="h-4 w-4" /> Preview shortlist
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
