import { Link, Navigate } from "react-router";
import type { Route } from "./+types/home";
import type { UserCollection } from "~/lib/zod";
import { getAllPublicCollections } from "~/api/collection";
import { Button } from "~/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu";

import { User, Library, Plus, HomeIcon } from "lucide-react";
import { cn } from "~/lib/utils";

import CollectionCard from "../components/CollectionCard/CollectionCard";
import { useEffect, useState } from "react";
import { themeToast } from "~/components/ThemeToast";
import NavMenu from "~/components/Navigation/NavMenu";

export async function clientLoader() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("No auth token found in localStorage.");
    return { allPublicCollections: null };
  }

  try {
    const allPublicCollections = await getAllPublicCollections();
    console.log(
      `All Collections fetched on the client: ${allPublicCollections?.length || 0} items.`
    );
    return { allPublicCollections };
  } catch (error) {
    console.error(
      "Failed to fetch all collections, token might be invalid.",
      error
    );
    return { allPublicCollections: null };
  }
}

function Home({ loaderData }: Route.ComponentProps) {
  const isLoggedIn = localStorage.getItem("token") !== null;
  const allPublicCollections =
    ((loaderData?.allPublicCollections as unknown as UserCollection[]) || []) ??
    null;
  if (!isLoggedIn) {
    console.warn("User not signed in.");
    return <Navigate to="/auth/sign-in" />;
  }
  return (
    <div className="space-y-6 px-4">
      {/* Navigation Menu */}
      <NavMenu />

      {/* Collections Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          {isLoggedIn ? "Community Collections" : "Featured Collections"}
        </h2>

        {allPublicCollections && allPublicCollections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allPublicCollections.map((collectionItem) => (
              <CollectionCard
                key={collectionItem._id}
                collectionItem={collectionItem}
                location="/home"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No collections to display</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
