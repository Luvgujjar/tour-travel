"use client";

import { useActionState, useTransition, type FormEvent } from "react";

/**
 * useActionState without React's automatic form reset, so a validation error
 * never wipes what the user typed. The `action` prop keeps no-JS submissions working.
 */
export function useActionForm<S>(action: (state: Awaited<S>, form: FormData) => S | Promise<S>, initial: Awaited<S>) {
  const [state, dispatch, pending] = useActionState(action, initial);
  const [transitioning, startTransition] = useTransition();
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
    startTransition(() => dispatch(data));
  };
  return { state, pending: pending || transitioning, formProps: { action: dispatch, onSubmit } };
}
