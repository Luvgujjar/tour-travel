"use client";

import { useSyncExternalStore } from "react";

export type ThemeChoice = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

const KEY = "he-theme";
const listeners = new Set<() => void>();
const media = () => window.matchMedia("(prefers-color-scheme: light)");

function read(): ThemeChoice {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

export function setTheme(choice: ThemeChoice) {
  try {
    if (choice === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, choice);
  } catch {
    /* storage unavailable — still apply for this page view */
  }
  const root = document.documentElement;
  if (choice === "system") delete root.dataset.theme;
  else root.dataset.theme = choice;
  listeners.forEach((l) => l());
}

function resolve(): ResolvedTheme {
  const choice = document.documentElement.dataset.theme;
  if (choice === "light" || choice === "dark") return choice;
  return media().matches ? "light" : "dark";
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const mq = media();
  mq.addEventListener("change", cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    const v = e.newValue === "light" || e.newValue === "dark" ? e.newValue : "system";
    setTheme(v);
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    mq.removeEventListener("change", cb);
    window.removeEventListener("storage", onStorage);
  };
}

export const subscribeTheme = subscribe;
export const resolvedTheme = resolve;

export function useThemeChoice() {
  return useSyncExternalStore(subscribe, read, () => "system" as ThemeChoice);
}
