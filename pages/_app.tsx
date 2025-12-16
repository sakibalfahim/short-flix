// pages/_app.tsx
import type { AppProps } from "next/app";
import "../styles/globals.css";
import { useEffect, useState } from "react";
import NetTheme from "../components/NetTheme";

function readInitialTheme(): "light" | "dark" {
  try {
    const pre = (globalThis as any).__SHORTFLIX_THEME as ("light" | "dark" | undefined);
    if (pre === "light" || pre === "dark") return pre;

    try {
      if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
        const stored = window.localStorage.getItem("shortflix-theme");
        if (stored === "light" || stored === "dark") return stored;
      }
    } catch {}

    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }
  } catch {}
  return "dark";
}

export default function App({ Component, pageProps }: AppProps) {
  const [theme, setTheme] = useState<"light" | "dark">(readInitialTheme);

  useEffect(() => {
    try {
      document.documentElement.setAttribute("data-theme", theme);
      try {
        if (typeof window !== "undefined" && typeof window.localStorage !== "undefined" && typeof window.localStorage.setItem === "function") {
          window.localStorage.setItem("shortflix-theme", theme);
        }
      } catch {}
      ;(globalThis as any).__SHORTFLIX_THEME = theme;
    } catch {}
  }, [theme]);

  return (
    <>
      <NetTheme />
      <Component {...pageProps} theme={theme} setTheme={setTheme} />
    </>
  );
}
