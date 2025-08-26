import { useState } from "react";
import { useRouteLoaderData } from "react-router";
import { removeFavorite } from "~/api/collection";
import CollectionCard from "~/components/CollectionCard/CollectionCard";
import type { UserCollection, UserProfile } from "~/lib/zod";

export interface UserFavoriteItem {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  user_profile_id: string;
  collection_item_id: Omit<UserCollection, "user_profile_id"> & {
    user_profile_id: {
      _id: string;
      user_id: string;
      first_name: string;
      last_name: string;
    };
  } & { createdAt?: Date; updatedAt?: Date };
}

function MyFavorites() {
  const [favorites, setFavorites] = useState<UserFavoriteItem[]>(
    (useRouteLoaderData("routes/collection/favorite/layout")
      .userFavorites as UserFavoriteItem[]) || []
  );

  const handleUnfavorite = async (removedCollectionId: string) => {
    // optimistic removal
    const previous = favorites;
    setFavorites((prev) =>
      prev.filter(
        (f) =>
          !(
            f.collection_item_id &&
            f.collection_item_id._id === removedCollectionId
          )
      )
    );

    try {
      await removeFavorite(removedCollectionId);
    } catch (err) {
      // rollback
      console.error("Failed to remove favorite, rolling back", err);
      setFavorites(previous);
      throw err;
    }
  };

  return (
    <div className="space-y-6 px-4">
      <h2 className="text-2xl font-bold mb-4">My Favorites</h2>
      {favorites.length === 0 ? (
        <div className="text-muted-foreground">No favorites yet</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((f) => (
            <div key={f._id}>
              {f.collection_item_id ? (
                <CollectionCard
                  collectionItem={f.collection_item_id as UserCollection}
                  key={f.collection_item_id._id}
                  location="/home"
                  // notify parent when an item is unfavorited so it can be removed immediately
                  onUnfavorite={() =>
                    handleUnfavorite(f.collection_item_id._id)
                  }
                />
              ) : (
                <div className="p-4 border rounded">
                  Favorited item missing (may have been deleted)
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyFavorites;
