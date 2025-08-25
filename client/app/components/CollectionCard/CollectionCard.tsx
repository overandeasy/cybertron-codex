import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import { Link, useRouteLoaderData, useNavigate } from "react-router";
import { ImageOffIcon, Pencil, Trash2, Star } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { themeToast } from "~/components/ThemeToast";
import {
  getComments,
  addComment,
  editComment,
  deleteComment,
  addFavorite,
  removeFavorite,
  getMyFavorites,
} from "~/api/collection";

import type { UserCollection, UserProfile } from "~/lib/zod";

import CollectionCardSummary from "./CollectionCardSummary";
import { DeleteCollectionItemButton } from "./DeleteCollectionItemButton";

// interface CollectionCardProps {
//   targetCollection: UserCollection[];
//   collectionItem: UserCollection;
//   targetCollectionItemId: string;
//   useDeleteCollectionItem: (
//     targetCollection: UserCollection[],
//     targetCollectionItemId: string
//   ) => UserCollection[];
//   location?: "my-collection" | "home";
// }

export default function CollectionCard(props: {
  key: string;
  collectionItem: UserCollection;
  location: "/collection/my-collection" | "/home";
  // if provided, parent will handle unfavorite API call and optimistic removal
  onUnfavorite?: (collectionItemId: string) => Promise<void> | void;
}) {
  // {
  // useDeleteCollectionItem,
  // targetCollection,
  // collectionItem,
  // targetCollectionItemId,
  // location,
  // }: CollectionCardProps

  const loaderData = useRouteLoaderData("root") as {
    userProfile: UserProfile | null;
  };
  const { collectionItem, location, onUnfavorite } = props;

  const currentUser = loaderData?.userProfile;

  // Check if current user owns this collection

  const isOwner = (() => {
    try {
      if (!currentUser || !collectionItem?.user_profile_id) return false;
      const currentUserId = String(currentUser.user_id._id);
      const ownerUserId = String(collectionItem.user_profile_id.user_id);
      return currentUserId === ownerUserId;
    } catch (e) {
      return false;
    }
  })();
  // console.log("Is owner:", isOwner);

  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const favs = await getMyFavorites();
        const found = (favs || []).some(
          (f: any) =>
            f.collection_item_id &&
            f.collection_item_id._id === collectionItem._id
        );
        setIsFavorited(!!found);
      } catch (err) {
        // ignore
      }
    })();
  }, [collectionItem._id]);

  const toggleFavorite = async (e?: any) => {
    // stop the click from bubbling to parent link/dialog trigger
    if (e && typeof e.stopPropagation === "function") e.stopPropagation();
    try {
      if (isFavorited) {
        // If parent provided an async onUnfavorite handler, call it and
        // optimistically update local state. Parent is responsible for
        // removing the card from lists (e.g. MyFavorites) and rolling back on error.
        if (typeof onUnfavorite === "function") {
          setIsFavorited(false);
          try {
            await onUnfavorite(collectionItem._id);
            themeToast("success", "Removed from favorites");
          } catch (err: any) {
            // rollback
            setIsFavorited(true);
            themeToast("fail", err?.message || "Failed to remove favorite");
            throw err;
          }
        } else {
          await removeFavorite(collectionItem._id);
          setIsFavorited(false);
          themeToast("success", "Removed from favorites");
        }
      } else {
        // optimistic local update for adding
        setIsFavorited(true);
        try {
          await addFavorite(collectionItem._id);
          themeToast("success", "Added to favorites");
        } catch (err: any) {
          setIsFavorited(false);
          themeToast("fail", err?.message || "Failed to add favorite");
          throw err;
        }
      }
    } catch (err: any) {
      themeToast("fail", err?.message || "Failed");
    }
  };

  // Prevent navigation when the favorite button is clicked by relying on
  // stopPropagation inside the toggle handler. Wrap in Link only for
  // the my-collection listing; for /home we keep the dialog trigger.
  const navigate = useNavigate();

  return location === "/collection/my-collection" ? (
    // Use programmatic navigation on card click so inner button clicks can
    // reliably call e.stopPropagation() to prevent navigation.
    <div
      onClick={() => navigate(`${location}/${collectionItem._id}`)}
      role="button"
      tabIndex={0}
    >
      <CollectionCardSummary
        collectionItem={collectionItem}
        isOwner={isOwner}
        isFavorited={isFavorited}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  ) : (
    <Dialog>
      <DialogTrigger asChild>
        <CollectionCardSummary
          collectionItem={collectionItem}
          isOwner={isOwner}
          isFavorited={isFavorited}
          onToggleFavorite={toggleFavorite}
        />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[80vw] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{collectionItem.character_name}</DialogTitle>
          <DialogDescription>
            {collectionItem.character_description}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4">
          <div className="col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <img
                src={
                  collectionItem.character_primary_faction === "Autobot"
                    ? "/images/logo/autobot_color.svg"
                    : "/images/logo/decepticon_color.svg"
                }
                alt={`${collectionItem.character_primary_faction} logo`}
                className="w-6 h-6"
              />
              <Badge
                variant={
                  collectionItem.character_primary_faction === "Autobot"
                    ? "theme_autobot"
                    : "theme_decepticon"
                }
              >
                {collectionItem.character_primary_faction}
              </Badge>
            </div>
            {collectionItem.toy_line && (
              <Badge variant="secondary">{collectionItem.toy_line}</Badge>
            )}
            {collectionItem.toy_class && (
              <Badge variant="outline">{collectionItem.toy_class}</Badge>
            )}

            {collectionItem.collection_notes && (
              <div>
                <h4 className="text-sm font-medium">Collection Notes</h4>
                <p className="text-sm">{collectionItem.collection_notes}</p>
              </div>
            )}

            {collectionItem.acquisition_date && (
              <div>
                <h4 className="text-sm font-medium">Acquisition Date</h4>
                <p className="text-sm">
                  {new Date(
                    collectionItem.acquisition_date
                  ).toLocaleDateString()}
                </p>
              </div>
            )}

            {collectionItem.acquisition_location && (
              <div>
                <h4 className="text-sm font-medium">Acquisition Location</h4>
                <p className="text-sm">{collectionItem.acquisition_location}</p>
              </div>
            )}

            {collectionItem.alt_character_name &&
              collectionItem.alt_character_name.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium">Alternative Names</h4>
                  <ul className="list-disc pl-5">
                    {collectionItem.alt_character_name.map((altName, index) => (
                      <li key={index} className="text-sm">
                        {altName.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>

          {collectionItem.media_images &&
            (collectionItem.media_images.length > 0 ? (
              <div className="col-span-1">
                <h4 className="text-sm font-medium">Media Appearances</h4>
                <Carousel className="w-full">
                  <CarouselContent>
                    {collectionItem.media_images.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="p-1">
                          <img
                            src={image}
                            alt={`Media ${index + 1}`}
                            className="aspect-square object-cover rounded-md"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </Carousel>
              </div>
            ) : (
              <div className="col-span-1 w-full flex justify-around items-center aspect-square object-cover rounded-md">
                <ImageOffIcon size={64} strokeWidth={1} />
              </div>
            ))}

          {collectionItem.toy_images && collectionItem.toy_images.length > 0 ? (
            <div className="col-span-1">
              <h4 className="text-sm font-medium">My Unboxed Toy</h4>
              <Carousel className="w-full">
                <CarouselContent>
                  {collectionItem.toy_images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="p-1">
                        <img
                          src={image}
                          alt={`Toy ${index + 1}`}
                          className="aspect-square object-cover rounded-md"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            </div>
          ) : (
            <div className="col-span-1 w-full flex justify-around items-center aspect-square object-cover rounded-md">
              <ImageOffIcon size={64} strokeWidth={1} />
            </div>
          )}

          {/* Insert comments column as rightmost column */}
          <CommentsColumn
            collectionItemId={collectionItem._id}
            currentUser={currentUser}
          />
        </div>

        {/* Favorite + Owner controls - positioned at bottom right */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button size="sm" variant="ghost" onClick={toggleFavorite}>
            <Star
              className={
                isFavorited
                  ? "w-4 h-4 mr-2 text-yellow-400"
                  : "w-4 h-4 mr-2 text-muted-foreground"
              }
              fill={isFavorited ? "currentColor" : "none"}
              strokeWidth={1}
            />
            {isFavorited ? "Favorited" : "Favorite"}
          </Button>
          {isOwner && (
            <>
              <Button asChild size="sm" variant="theme_autobot">
                <Link
                  to={`/collection/my-collection/${collectionItem._id}/edit`}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              </Button>

              <DeleteCollectionItemButton
                collectionItem={collectionItem}
                location={location}
              />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CommentsColumn({
  collectionItemId,
  currentUser,
}: {
  collectionItemId: string;
  currentUser: any;
}) {
  const [comments, setComments] = useState<Array<any>>([]);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getComments(collectionItemId);
        setComments(data || []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [collectionItemId]);

  return (
    <div className="col-span-1 md:col-span-1 max-h-[60vh] overflow-hidden min-h-0">
      <Card className="h-full min-h-0">
        <CardHeader>
          <CardTitle>Comments</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Discuss this item
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2 flex flex-col gap-2 h-full min-h-0 relative">
          <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-2 min-h-0">
            {comments.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No comments yet — be the first.
              </div>
            )}
            {comments.map((c) => (
              <div key={c._id} className="border rounded p-2 text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">
                      {c.user_profile_id?.first_name || "Anonymous"}{" "}
                      {c.user_profile_id?.last_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(c.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {currentUser &&
                    currentUser.user_id._id === c.user_profile_id?.user_id && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="theme_autobot"
                          onClick={() => {
                            setEditingId(c._id);
                            setEditingContent(c.content);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="theme_decepticon"
                          onClick={async () => {
                            try {
                              await deleteComment(collectionItemId, c._id);
                              setComments((p) =>
                                p.filter((x) => x._id !== c._id)
                              );
                              themeToast("success", "Comment deleted");
                            } catch (err: any) {
                              themeToast("fail", err?.message || "Failed");
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                </div>
                <div className="mt-2">
                  {editingId === c._id ? (
                    <div>
                      <textarea
                        className="w-full border rounded p-1 text-sm"
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                      />
                      <div className="flex gap-2 justify-end mt-1">
                        <Button
                          size="sm"
                          onClick={async () => {
                            try {
                              if (!editingId) return;
                              const updated = await editComment(
                                collectionItemId,
                                editingId,
                                editingContent
                              );
                              const updatedWithUser = {
                                ...updated,
                                user_profile_id:
                                  updated.user_profile_id || currentUser,
                              };
                              setComments((p) =>
                                p.map((x) =>
                                  x._id === updatedWithUser._id
                                    ? updatedWithUser
                                    : x
                                )
                              );
                              setEditingId(null);
                              setEditingContent("");
                              themeToast("success", "Updated");
                            } catch (err: any) {
                              themeToast("fail", err?.message || "Failed");
                            }
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(null);
                            setEditingContent("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>{c.content}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="sticky bottom-0 z-10 mt-2 bg-white/60 backdrop-blur-sm py-2 -mx-2 px-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full border rounded p-1 text-sm"
              placeholder="Write a comment..."
            />
            <div className="flex justify-end mt-2">
              <Button
                size="sm"
                variant="theme_autobot"
                onClick={async () => {
                  try {
                    const saved = await addComment(
                      collectionItemId,
                      newComment
                    );
                    const withUser = {
                      ...saved,
                      user_profile_id: currentUser || saved.user_profile_id,
                    };
                    setComments((p) => [withUser, ...p]);
                    setNewComment("");
                    themeToast("success", "Comment added");
                  } catch (err: any) {
                    themeToast("fail", err?.message || "Failed");
                  }
                }}
              >
                Post
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
