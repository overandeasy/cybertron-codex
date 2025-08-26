import React, { useEffect } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  redirect,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { Toaster } from "./components/ui/sonner";
import { getActiveUserProfile } from "./api/user";
import type { UserProfile } from "./lib/zod";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Audiowide&family=Exo+2:ital,wght@0,100..900;1,100..900&family=Orbitron:wght@400..900&display=swap",
  },
];
export async function clientLoader() {
  const token = localStorage.getItem("token");
  if (!token) {
    // If no token, just return the server's "logged out" state.
    console.warn("No auth token found in localStorage.");
    return { userProfile: null };
  }

  try {
    // If a token exists, fetch the user profile.
    const userProfile = (await getActiveUserProfile()) as UserProfile;
    console.log(
      "User profile fetched successfully on the client side on initial load."
    );
    return { userProfile };
  } catch (error) {
    console.error(
      "Failed to fetch user profile, token might be invalid.",
      error
    );
    // Clear invalid token and redirect to sign-in.
    try {
      localStorage.removeItem("token");
    } catch {}
    throw redirect("/auth/sign-in");
  }
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData() as { userProfile?: UserProfile } | undefined;
  const initialProfile = data?.userProfile ?? null;

  return (
    // suppressHydrationWarning prevents React from logging hydration
    // mismatches for attributes that are intentionally mutated by a
    // pre-hydration inline script (for example to set initial theme
    // based on prefers-color-scheme). See React docs:
    // https://react.dev/reference/react/DOM/suppressHydrationWarning
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline script to set initial theme based on system preference to avoid FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=window.matchMedia('(prefers-color-scheme: dark)'); if(m && m.matches) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark');}catch(e){} })()`,
          }}
        />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/images/logo/favicon.ico" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Toaster position="top-center" />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  // Listen for system theme changes on the client and toggle the `.dark` class
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      try {
        if ((e as any).matches) document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
      } catch (err) {
        /* ignore */
      }
    };
    // Some browsers support addEventListener on MediaQueryList
    if ((mq as any).addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange as any);
    return () => {
      if ((mq as any).removeEventListener)
        mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange as any);
    };
  }, []);

  // Read loader data (if present). Routes will use route loader data
  // (useRouteLoaderData("root")) to access `userProfile` as needed.
  useLoaderData();

  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
