"use client";

import { login, type FormState } from "@/lib/actions/admin";
import { useActionForm } from "@/lib/use-action-form";
import { Arrow } from "../ui";

export function LoginForm({ next, hint }: { next: string; hint?: string }) {
  const { state, pending, formProps } = useActionForm<FormState>(login, null);
  return (
    <form {...formProps} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="username" className="label">Username</label>
        <input id="username" name="username" autoComplete="username" required className="field" defaultValue="admin" />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" autoFocus />
      </div>
      {state && !state.ok && (
        <p role="alert" className="text-sm text-err">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-60">
        {pending ? "Signing in…" : "Sign in"} <Arrow />
      </button>
      {hint && <p className="text-center text-xs text-slate">{hint}</p>}
    </form>
  );
}
