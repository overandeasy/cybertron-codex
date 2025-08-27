import { useMemo, useState, useEffect, useRef } from "react";
import type { UserProfile } from "~/lib/zod";
import { Avatar } from "./ui/avatar";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";
import { Link } from "react-router";
import { useFetcher } from "react-router";
import { themeToast } from "~/components/ThemeToast";
import { socialKeyLabel } from "~/lib/social";

type Props = {
  userProfile: UserProfile;
  className?: string;
};
export function UserProfileDisplay({ userProfile, className }: Props) {
  const fetcher = useFetcher();
  const images = userProfile.images ?? [];
  const [savingImage, setSavingImage] = useState<string | undefined>(undefined);
  const prevPreviewRef = useRef<string | undefined>(undefined);
  const initialPreview = useMemo(() => {
    if (userProfile.primary_profile_image)
      return userProfile.primary_profile_image;
    return images.length > 0 ? images[images.length - 1] : undefined;
  }, [images, userProfile.primary_profile_image]);
  const [preview, setPreview] = useState<string | undefined>(initialPreview);

  const fullName = [userProfile.first_name, userProfile.last_name]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    if (!fetcher.data) return;
    const data = fetcher.data as any;
    if (data.ok) {
      themeToast("success", "Primary profile image updated");
      setSavingImage(undefined);
    } else if (data.error) {
      themeToast(
        "fail",
        data.error?.message || "Failed to update primary image"
      );
      // revert optimistic preview
      setPreview(prevPreviewRef.current);
      setSavingImage(undefined);
    }
  }, [fetcher.data]);

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
              <fetcher.Form
                method="post"
                action="/user/my-profile/set-primary-image"
                key={src}
              >
                <input type="hidden" name="image" value={src} />
                <button
                  type="submit"
                  onClick={() => {
                    // remember previous preview so we can revert on error
                    prevPreviewRef.current = preview;
                    // Optimistic UI: set preview immediately
                    setPreview(src);
                    setSavingImage(src);
                  }}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-md ring-1 ring-border",
                    preview === src && "ring-2 ring-primary"
                  )}
                  title="Set as primary / View"
                >
                  <img
                    src={src}
                    alt="Thumbnail"
                    className="h-full w-full object-cover"
                  />
                  {userProfile.primary_profile_image === src && (
                    <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-1 rounded">
                      Primary
                    </span>
                  )}
                  {savingImage === src && fetcher.state !== "idle" ? (
                    <span className="absolute top-1 right-1 bg-yellow-500 text-white text-xs px-1 rounded">
                      Saving
                    </span>
                  ) : null}
                  {savingImage === src && fetcher.data && fetcher.data.error ? (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 rounded">
                      Error
                    </span>
                  ) : null}
                </button>
              </fetcher.Form>
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
                  .sort((a, b) => String(a.key).localeCompare(String(b.key)))
                  .map((s) =>
                    s.value ? (
                      <li key={`${s.key}-${s.value}`}>
                        <a
                          href={s.value}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary underline underline-offset-4 hover:text-primary/80"
                        >
                          {socialKeyLabel(s.key)}
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
