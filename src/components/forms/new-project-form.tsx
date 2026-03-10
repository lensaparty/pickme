"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  Link2,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import { createProjectAction } from "@/app/projects/actions";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AuthActor, User } from "@/lib/types";
import { Field } from "./field";
import { FormSection } from "./form-section";

const initialState = {
  error: "",
  values: {
    ownerUserId: "",
    name: "Luna & Arya Wedding",
    clientName: "Luna Prameswari",
    eventType: "Wedding",
    driveLink: "https://drive.google.com/drive/folders/luna-arya-premium-gallery",
    selectionLimit: "120",
    expiresAt: "2026-03-20",
    whatsapp: "+62 812-2200-4411",
    welcomeMessage:
      "Halo Luna, silakan pilih maksimal 120 foto favorit. Kamu juga bisa download semua folder jika diperlukan. Setelah selesai, kirim hasil pilihan lewat tombol WhatsApp di halaman review.",
    clientCode: "LUNA-ARYA",
    password: "LUNA2026",
  },
};

function buildWelcomeMessage({
  clientName,
  selectionLimit,
  allowDownloads,
}: {
  clientName: string;
  selectionLimit: string;
  allowDownloads: boolean;
}) {
  const cleanName = clientName.trim() || "there";
  const cleanLimit = selectionLimit.trim() || "0";
  const downloadLine = allowDownloads
    ? " Kamu juga bisa download semua folder jika diperlukan."
    : "";

  return `Halo ${cleanName}, silakan pilih maksimal ${cleanLimit} foto favorit.${downloadLine} Setelah selesai, kirim hasil pilihan lewat tombol WhatsApp di halaman review.`;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" size="lg" type="submit" disabled={pending}>
      {pending ? "Creating project..." : "Create project link"}
    </Button>
  );
}

export function NewProjectForm({ actor, users }: { actor: AuthActor; users: User[] }) {
  const [state, formAction] = useActionState(createProjectAction, initialState);
  const [formValues, setFormValues] = useState(() => ({
    ...initialState.values,
    ownerUserId: actor.kind === "super_admin" ? users[0]?.id || "" : actor.user.id,
    welcomeMessage: buildWelcomeMessage({
      clientName: initialState.values.clientName,
      selectionLimit: initialState.values.selectionLimit,
      allowDownloads: true,
    }),
  }));
  const [passwordProtected, setPasswordProtected] = useState(true);
  const [allowDownloads, setAllowDownloads] = useState(true);
  const [welcomeMessageTouched, setWelcomeMessageTouched] = useState(false);

  const ownerLabel = useMemo(() => {
    if (actor.kind === "admin") return actor.user.name;
    return users.find((user) => user.id === formValues.ownerUserId)?.name || "Unassigned";
  }, [actor, formValues.ownerUserId, users]);

  function updateField(name: keyof typeof initialState.values, value: string) {
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function updateFieldWithWelcomeSync(name: keyof typeof initialState.values, value: string) {
    setFormValues((current) => {
      const next = {
        ...current,
        [name]: value,
      };

      if (!welcomeMessageTouched && (name === "clientName" || name === "selectionLimit")) {
        next.welcomeMessage = buildWelcomeMessage({
          clientName: name === "clientName" ? value : next.clientName,
          selectionLimit: name === "selectionLimit" ? value : next.selectionLimit,
          allowDownloads,
        });
      }

      return next;
    });
  }

  function updateAllowDownloads(checked: boolean) {
    setAllowDownloads(checked);

    if (!welcomeMessageTouched) {
      setFormValues((current) => ({
        ...current,
        welcomeMessage: buildWelcomeMessage({
          clientName: current.clientName,
          selectionLimit: current.selectionLimit,
          allowDownloads: checked,
        }),
      }));
    }
  }

  return (
    <form action={formAction} className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-5">
        <FormSection
          step="01"
          title="Core project info"
          description="Start with the essentials only. This should feel closer to setting a scene than filling a system."
        >
          <FormError message={state.error} />
          {actor.kind === "super_admin" && users.length > 0 ? (
            <div className="rounded-[28px] border border-white/8 bg-white/4 p-4 sm:p-5">
              <Field label="Project owner" hint="Choose which admin workspace this project should live inside.">
                <Select name="ownerUserId" value={formValues.ownerUserId} onChange={(event) => updateField("ownerUserId", event.target.value)}>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.name} • {user.email}</option>
                  ))}
                </Select>
              </Field>
            </div>
          ) : (
            <input type="hidden" name="ownerUserId" value={formValues.ownerUserId} />
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Project name" hint="A clean internal title for your dashboard.">
              <Input name="name" value={formValues.name} onChange={(event) => updateField("name", event.target.value)} />
            </Field>
            <Field label="Client name" hint="Shown across the client-facing flow.">
              <Input
                name="clientName"
                value={formValues.clientName}
                onChange={(event) => updateFieldWithWelcomeSync("clientName", event.target.value)}
              />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Event type" hint="Used for faster scanning later.">
              <Select name="eventType" value={formValues.eventType} onChange={(event) => updateField("eventType", event.target.value)}>
                <option value="Wedding">Wedding</option>
                <option value="Engagement">Engagement</option>
                <option value="Family">Family</option>
                <option value="Graduation">Graduation</option>
                <option value="Photo Session">Photo Session</option>
              </Select>
            </Field>
            <Field label="Link expiry" hint="The client link quietly closes after this date.">
              <Input name="expiresAt" type="date" value={formValues.expiresAt} onChange={(event) => updateField("expiresAt", event.target.value)} />
            </Field>
          </div>
          <Field label="Google Drive folder" hint="The source gallery for browsing, downloading, and final selections.">
            <div className="relative">
              <Link2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
              <Input
                name="driveLink"
                className="pl-10"
                value={formValues.driveLink}
                onChange={(event) => updateField("driveLink", event.target.value)}
              />
            </div>
          </Field>
        </FormSection>

        <FormSection
          step="02"
          title="Selection settings"
          description="Keep the client task simple, clear, and comfortable to complete."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Selection limit" hint="How many photos the client can shortlist.">
              <Input
                name="selectionLimit"
                type="number"
                min="1"
                value={formValues.selectionLimit}
                onChange={(event) => updateFieldWithWelcomeSync("selectionLimit", event.target.value)}
              />
            </Field>
            <Field label="Client code" hint="Used in the shareable link path.">
              <Input name="clientCode" value={formValues.clientCode} onChange={(event) => updateField("clientCode", event.target.value)} />
            </Field>
          </div>
          <div className="rounded-[28px] border border-white/8 bg-white/4 p-4 sm:p-5">
            <Field label="Welcome message" hint="A short note that makes the review feel guided, not technical.">
              <Textarea
                name="welcomeMessage"
                value={formValues.welcomeMessage}
                onChange={(event) => {
                  setWelcomeMessageTouched(true);
                  updateField("welcomeMessage", event.target.value);
                }}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection
          step="03"
          title="Delivery details"
          description="Useful communication settings, kept separate so they do not compete with the main setup."
        >
          <div className="rounded-[28px] border border-white/8 bg-white/4 p-4 sm:p-5">
            <Field label="WhatsApp number" hint="Where the client’s final shortlist and share message should go.">
              <div className="relative">
                <MessageCircle className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                <Input
                  name="whatsapp"
                  className="pl-10"
                  value={formValues.whatsapp}
                  onChange={(event) => updateField("whatsapp", event.target.value)}
                />
              </div>
            </Field>
          </div>
        </FormSection>

        <FormSection
          step="04"
          title="Security and advanced"
          description="Optional controls for private deliveries, cleaner access, and extra flexibility."
        >
          <Accordion type="single" collapsible defaultValue="security" className="w-full">
            <AccordionItem value="security">
              <AccordionTrigger>Access and sharing</AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Password" hint="Add a light gate for private galleries.">
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                      <Input
                        name="password"
                        className="pl-10"
                        value={formValues.password}
                        onChange={(event) => updateField("password", event.target.value)}
                      />
                    </div>
                  </Field>
                  <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                    <p className="text-sm font-medium text-white">Sharing behavior</p>
                    <p className="mt-1 text-sm leading-6 text-stone-500">Keep these optional controls softer so the main setup never feels crowded.</p>
                  </div>
                </div>
                <div className="mt-4 space-y-3 rounded-3xl border border-white/8 bg-white/4 p-4">
                  <label className="flex items-start gap-3">
                    <Checkbox name="passwordProtected" checked={passwordProtected} onCheckedChange={(checked) => setPasswordProtected(checked === true)} />
                    <span className="space-y-1">
                      <span className="block text-sm font-medium text-white">Require password before entry</span>
                      <span className="block text-sm leading-6 text-stone-500">Best for private client deliveries or more curated access.</span>
                    </span>
                  </label>
                  <label className="flex items-start gap-3">
                    <Checkbox name="allowDownloads" checked={allowDownloads} onCheckedChange={(checked) => updateAllowDownloads(checked === true)} />
                    <span className="space-y-1">
                      <span className="block text-sm font-medium text-white">Allow downloads</span>
                      <span className="block text-sm leading-6 text-stone-500">Keep direct downloads available alongside photo selection.</span>
                    </span>
                  </label>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </FormSection>
      </div>

      <div className="space-y-5">
        <Card className="sticky top-6 overflow-hidden">
          <CardContent className="space-y-5 p-5 sm:p-6">
            <div>
              <Badge tone="warning">PickMe by Lensaparty</Badge>
              <h2 className="mt-4 font-display text-[2rem] leading-[0.98] text-white sm:text-[2.45rem]">Create a polished client handoff.</h2>
              <p className="mt-3 text-[15px] leading-6 text-stone-400 sm:text-sm sm:leading-7">
                Luxury photo workflow, built for modern photographers. Keep the setup calm, then send a link that already feels finished.
              </p>
            </div>

            <div className="space-y-3 rounded-[28px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(248,217,139,0.14),transparent_42%),rgba(255,255,255,0.03)] p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-amber-200/14 p-2 text-amber-100">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Share path</p>
                  <p className="mt-1 text-sm leading-6 text-stone-400 break-all">/client/{formValues.clientCode || "preview-code"}</p>
                </div>
              </div>
              <div className="rounded-[22px] border border-white/8 bg-black/20 px-4 py-3 text-sm text-stone-300">
                Selection limit: {formValues.selectionLimit || "0"} photos
              </div>
              <div className="rounded-[22px] border border-white/8 bg-black/20 px-4 py-3 text-sm text-stone-300">
                Assigned workspace: {ownerLabel}
              </div>
              <div className="rounded-[22px] border border-white/8 bg-black/20 px-4 py-3 text-sm text-stone-300">
                {allowDownloads ? "Client handoff sent through WhatsApp" : "Selection-only flow with no direct downloads"}
              </div>
              <div className="rounded-[22px] border border-white/8 bg-black/20 px-4 py-3 text-sm text-stone-300">
                {passwordProtected ? "Password protection stays enabled" : "Open entry without a password gate"}
              </div>
            </div>

            <SubmitButton />
            <Button variant="ghost" className="w-full" type="button">Save for later</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-emerald-500/14 p-2 text-emerald-200">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Refined setup</p>
                <p className="mt-1 text-sm leading-6 text-stone-500">Core details are surfaced first. Optional controls stay quiet until you need them.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-white/8 p-2 text-stone-200">
                <WandSparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Luxury, still usable</p>
                <p className="mt-1 text-sm leading-6 text-stone-500">The page keeps the same calm visual language as the dashboard, but makes the setup feel lighter and easier to finish.</p>
              </div>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-white/4 p-4 text-sm leading-6 text-stone-500">
              When you create the project, PickMe validates the Drive source, preserves the selection cap, and prepares a polished share page ready to send.
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
