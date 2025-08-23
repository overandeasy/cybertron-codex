import Logo from "~/components/Logo";

import { Link, useRouteLoaderData } from "react-router";
import type { Route } from "./+types/landingPage";
import type { Loader } from "lucide-react";
import { getActiveUserProfile } from "~/api/user";
import type { UserProfile } from "~/lib/zod";
import type { clientLoader } from "~/root";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Cybertron Codex" },
    { name: "description", content: "Welcome to Cybertron Codex!" },
  ];
}

export default function LandingPage({ loaderData }: Route.ComponentProps) {
  const { userProfile } = useRouteLoaderData("root");
  console.log("User profile on landing page:", userProfile);
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Three options for background */}

      {/* Still background, less attractive */}
      {/* <img
        src="/images/cybertron_bg.png"
        alt="Cybertron Background"
        className="absolute inset-0 w-full h-full object-cover"
      /> */}

      {/* Direct link to Youtube video, legally safe, but with play control issues */}
      {/* <iframe
        className="absolute top-0 left-0 w-full h-full"
        src="https://www.youtube.com/embed/QFZrL0x63c8?playlist=QFZrL0x63c8&start=5&end=124&autoplay=1&mute=1&loop=1&controls=0&showinfo=0&modestbranding=1&rel=0"
        title="Transformers: War for Cybertron - Full Trailer"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe> */}

      {/* Video background, more attractive, but not licensed */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/videos/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
        {userProfile ? (
          <Link to="/home" className="mb-4">
            <Logo className="mb-8" />
          </Link>
        ) : (
          <Link to="/auth/sign-in" className="mb-4">
            <Logo className="mb-8" />
          </Link>
        )}
        <h2 className="text-lg md:text-xl max-w-xl">Unbox. Upload. Unite.</h2>
        <p className=" text-shadow-2xs drop-shadow-accent">
          Your Transformers toy inventory and community sharing platform.
        </p>
        <p className="absolute bottom-4 right-4 text-muted-foreground text-xs z-20">
          Video source: Activision
        </p>
      </div>

      {/* Optional: dark overlay for contrast */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/40 z-0" />
    </div>
  );
}
