import { useMemo, useState } from "react";
import type { UserProfile } from "~/lib/zod";
import { Avatar } from "./ui/avatar";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";
import { Link } from "react-router";

type Props = {
  userProfile: UserProfile;
  className?: string;
};
export function UserProfileDisplay({ userProfile, className }: Props) {
  const images = userProfile.images ?? [];
  const initialPreview = useMemo(
    () => (images.length > 0 ? images[images.length - 1] : undefined),
    [images]
  );
  const [preview, setPreview] = useState<string | undefined>(initialPreview);

  const fullName = [userProfile.first_name, userProfile.last_name]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-5 gap-8", className)}>
      {/* --- LEFT COLUMN --- */}
      <div className="md:col-span-2 space-y-6">
        <div>
          <h3 className="text-lg font-medium">Profile Images</h3>
        </div>

        <div className="flex items-center justify-center p-4 border rounded-lg min-h-80">
          {preview ? (
            <img
              src={preview}
              alt="Selected preview"
              className="object-contain rounded-lg max-h-80"
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              <Avatar className="justify-center mx-auto mb-6 stroke-1" />
              No image available.
            </p>
          )}
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-5 gap-2">
            {images.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setPreview(src)}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-md ring-1 ring-border",
                  preview === src && "ring-2 ring-primary"
                )}
                title="View"
              >
                <img
                  src={src}
                  alt="Thumbnail"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* --- RIGHT COLUMN --- */}
      <div className="md:col-span-3 space-y-6">
        <header>
          <h1 className="font-headline text-2xl">
            {fullName || "Unknown User"}
          </h1>
          {/* <p className="text-sm text-muted-foreground">
            {userProfile.species ?? "—"} • {userProfile.faction ?? "—"}
            {userProfile.country ? ` • ${userProfile.country}` : ""}
          </p> */}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* <InfoField label="First Name" value={userProfile.first_name} />
          <InfoField label="Last Name" value={userProfile.last_name} /> */}

          <InfoField label="Species" value={userProfile.species} />
          <InfoField label="Faction" value={userProfile.faction} />
          <InfoField label="Country" value={userProfile.country} />
        </div>

        <section className="space-y-2">
          <div className="text-sm text-muted-foreground">Bio</div>
          <div className="bg-muted/30 rounded-md px-3 py-2 whitespace-pre-wrap">
            {userProfile.bio || "—"}
          </div>
        </section>

        {Array.isArray(userProfile.languages) &&
          userProfile.languages.length > 0 && (
            <section className="space-y-2">
              <div className="text-sm text-muted-foreground">Languages</div>
              <ul className="mt-1 flex flex-wrap gap-2">
                {userProfile.languages
                  .slice()
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((l) => (
                    <li
                      key={l.name}
                      className="rounded-md bg-muted/40 px-2 py-1 text-sm"
                    >
                      {l.name}
                    </li>
                  ))}
              </ul>
            </section>
          )}

        {Array.isArray(userProfile.social_links) &&
          userProfile.social_links.length > 0 && (
            <section className="space-y-2">
              <div className="text-sm text-muted-foreground">Social</div>
              <ul className="flex space-x-4 flex-wrap">
                {userProfile.social_links
                  .slice()
                  .sort((a, b) => a.key.localeCompare(b.key))
                  .map((s) =>
                    s.value ? (
                      <li key={`${s.key}-${s.value}`}>
                        <a
                          href={s.value}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary underline underline-offset-4 hover:text-primary/80"
                        >
                          {s.key}
                        </a>
                      </li>
                    ) : null
                  )}
              </ul>
            </section>
          )}

        <Link to="/user/my-profile/edit">
          <Button variant="default" className="w-full">
            Edit Profile
          </Button>
        </Link>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-1">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="bg-muted/30 rounded-md px-3 py-2">{value || "—"}</div>
    </div>
  );
}

export default UserProfileDisplay;
