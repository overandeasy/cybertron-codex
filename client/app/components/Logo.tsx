import { cn } from "~/lib/utils";

export default function Logo({
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        `flex flex-col justify-center items-center ${props.className}`
      )}
    >
      <img src="/images/logo/favicon.ico" alt="Logo" className="size-30 mb-6" />
      <h1 className="text-4xl font-bold text-shadow-energon-cyan drop-shadow-energon-cyan">
        Cybertron Codex
      </h1>
    </div>
  );
}
