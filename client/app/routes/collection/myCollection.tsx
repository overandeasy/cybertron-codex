import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Link, Outlet, useLocation, useRouteLoaderData } from "react-router";
import CollectionCard from "~/components/CollectionCard/CollectionCard";
import type { UserCollection } from "~/lib/zod";
import type { Route } from "./+types/myCollection";
import { PlusIcon } from "lucide-react";
import { de } from "zod/v4/locales";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Collection" },
    { name: "description", content: "View and manage your collection items" },
  ];
}

export default function MyCollectionDisplay({}: Route.ComponentProps) {
  const { userCollection } = useRouteLoaderData("routes/collection/layout");
  const [collections, setCollections] = useState<UserCollection[]>(
    (userCollection as UserCollection[]) || []
  );

  const { newestIds, updatedIds } = useMemo(() => {
    if (!collections || collections.length === 0) {
      return { newestIds: new Set(), updatedIds: new Set() };
    }
    const sortedByCreated = [...collections].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const newestIds = new Set(
      sortedByCreated.slice(0, 3).map((item) => item._id)
    );

    const sortedByUpdated = [...collections].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    const updatedIds = new Set(
      sortedByUpdated.slice(0, 3).map((item) => item._id)
    );

    return { newestIds, updatedIds };
  }, [collections]);

  // console.log("useLocation", useLocation());

  if (!collections || collections.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">No Collections Yet</h2>
        <p className="text-gray-600 mb-4">Start building your collection!</p>
        <Button variant="theme_autobot" asChild>
          <Link to="/collection/my-collection/add">Add First Item</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Collection</h1>
        <Button variant="theme_autobot" asChild>
          <Link
            to="/collection/my-collection/add"
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span className="hidden sm:flex">Add New Item</span>
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {collections.map((collectionItem) => {
          const isNew = newestIds.has(collectionItem._id);
          const isUpdated = !isNew && updatedIds.has(collectionItem._id);

          let statusFlag: "New" | "Updated" | null = null;
          if (isNew) {
            statusFlag = "New";
          } else if (isUpdated) {
            statusFlag = "Updated";
          }
          return (
            <CollectionCard
              key={collectionItem._id}
              collectionItem={collectionItem}
              location="/collection/my-collection"
              statusFlag={statusFlag}
            />
          );
        })}
      </div>
      <Outlet />
    </div>
  );
}
