import Logo from "~/components/Logo";
import { Link } from "react-router";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import type { Route } from "./+types/about";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "About — Cybertron Codex" },
    {
      name: "description",
      content: "About Cybertron Codex: toy collection inventory and community.",
    },
  ];
}

export default function AboutPage({}: Route.ComponentProps) {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader className="flex items-center gap-4">
            <img src="images/logo/favicon.ico" className="w-10 h-10" />
            <CardTitle>About Cybertron Codex</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none text-muted-foreground space-y-2">
              <p>
                Cybertron Codex is an online inventory and community showcase
                for your Transformers toy collection.
              </p>
              <p>
                Curate your items, upload photos and details, and share your
                collection with other Transformers fans. Browse, comment, and
                save favorites from the community, too.
              </p>
              <p>
                Getting started is simple: unbox your toys, take a few photos,
                upload them with item details, and save. To make an item visible
                to the community, check the <strong>Public </strong>
                option on the item form.
              </p>
              <p>
                We built Cybertron Codex to make collecting more social and more
                fun — whether you're cataloging your whole archive or sharing a
                favorite find. Happy unboxing!
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <Link to="/home">
                <Button variant={"theme_autobot"}>Home</Button>
              </Link>
              <Link to="/collection/my-collection">
                <Button variant="ghost">My Collection</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
