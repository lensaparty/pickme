"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight } from "lucide-react";

import { unlockGalleryAction, UnlockGalleryState } from "@/app/client/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: UnlockGalleryState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" size="lg" type="submit" disabled={pending}>
      Enter gallery <ArrowRight className="h-4 w-4" />
    </Button>
  );
}

export function PasswordGate({ shareCode }: { shareCode: string }) {
  const action = unlockGalleryAction.bind(null, shareCode);
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction}>
      <div className="mt-5 space-y-3 sm:mt-6">
        <Input
          name="password"
          placeholder="Password"
          type="password"
          aria-label="Gallery password"
        />
        <div className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.22em] text-stone-500 sm:text-[11px] sm:tracking-[0.24em]">
          <span>Case sensitive</span>
          <span>Private access</span>
        </div>
        {state.error ? <p className="text-sm text-rose-200">{state.error}</p> : null}
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:mt-6">
        <SubmitButton />
      </div>
    </form>
  );
}
