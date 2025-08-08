import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Cybertron Codex" },
    { name: "description", content: "Welcome to Cybertron Codex!" },
  ];
}

export default function Home() {
  return <div>Home</div>;
}
