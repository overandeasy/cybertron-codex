import { ImageOffIcon, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect, type ComponentPropsWithRef } from "react";
import { Link, useParams, useRouteLoaderData } from "react-router";
import { DeleteCollectionItemButton } from "~/components/CollectionCard/DeleteCollectionItemButton";
import { themeToast } from "~/components/ThemeToast";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";

import type { UserCollection } from "~/lib/zod";
import {
  getComments,
  addComment,
  editComment,
  deleteComment,
} from "~/api/collection";
import type { Route } from "./+types/myCollectionItem";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Collection Item" },
    { name: "description", content: "View and edit your collection item" },
  ];
}

export default function MyCollectionItem() {
  const loaderData = useRouteLoaderData("routes/collection/layout");
  const collection = loaderData?.userCollection as UserCollection[];
  const { _id: itemId } = useParams();
  const collectionItem = collection?.find((item) => item._id === itemId);

  const currentUser = useRouteLoaderData("root")?.userProfile;
  const [comments, setComments] = useState<Array<any>>([]);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        if (collectionItem) {
          const data = await getComments(collectionItem._id);
          setComments(data || []);
        }
      } catch (e) {
        console.error("Failed to load comments", e);
      }
    })();
  }, [collectionItem?._id]);

  if (!collectionItem) return <div>Collection item not found</div>;

  const isOwner =
    !!currentUser &&
    currentUser.user_id._id === collectionItem.user_profile_id.user_id;

  return (
    <div className="space-y-6">
      {/* Top header: title area with action buttons aligned right */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {collectionItem.character_name}
          </h1>
        </div>
        <div className="flex items-center">
          {isOwner && (
            <div className="flex gap-2">
              <Button asChild size="sm" variant="theme_autobot">
                <Link
                  to={`/collection/my-collection/${collectionItem._id}/edit`}
                >
                  <Pencil className="w-4 h-4 mr-1" /> Edit
                </Link>
              </Button>
              <Button size="sm" asChild>
                <DeleteCollectionItemButton
                  collectionItem={collectionItem}
                  location="/collection/my-collection"
                />
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left column: character+acq (side-by-side) and images below */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex text-lg font-bold">
                  <h1>{collectionItem.character_name}</h1>
                  <Badge
                    variant={
                      collectionItem.public
                        ? "theme_autobot"
                        : "theme_decepticon"
                    }
                    className="ml-auto h-4"
                  >
                    {collectionItem.public ? "Public" : "Private"}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {collectionItem.character_description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
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

                <div className="text-sm">
                  {collectionItem.alt_character_name?.length ? (
                    <div>
                      <strong>Alt names:</strong>{" "}
                      {collectionItem.alt_character_name
                        .map((a) => a.name)
                        .join(", ")}
                    </div>
                  ) : null}
                </div>

                {/* actions moved to top header */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-md">Acquisition & Notes</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                {collectionItem.acquisition_date && (
                  <div>
                    <strong>Acquired:</strong>{" "}
                    {new Date(
                      collectionItem.acquisition_date
                    ).toLocaleDateString()}
                  </div>
                )}
                {typeof (collectionItem as any).price === "number" && (
                  <div>
                    <strong>Price:</strong>{" "}
                    {new Intl.NumberFormat(undefined, {
                      style: "currency",
                      currency: (collectionItem as any).currency || "USD",
                    }).format((collectionItem as any).price)}
                  </div>
                )}
                {collectionItem.acquisition_location && (
                  <div>
                    <strong>Location:</strong>{" "}
                    {collectionItem.acquisition_location}
                  </div>
                )}
                {collectionItem.collection_notes && (
                  <div>
                    <strong>Notes:</strong>
                    <div className="text-sm text-muted-foreground">
                      {collectionItem.collection_notes}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold">Images</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                {collectionItem.media_images &&
                collectionItem.media_images.length > 0 ? (
                  <div className="col-span-1">
                    <h4 className="text-sm font-medium">Media Appearances</h4>
                    <Carousel className="w-full">
                      <CarouselContent>
                        {collectionItem.media_images.map(
                          (image: string, index: number) => (
                            <CarouselItem key={index}>
                              <div className="p-1">
                                <img
                                  src={image}
                                  alt={`Media ${index + 1}`}
                                  className="aspect-square object-cover rounded-md"
                                />
                              </div>
                            </CarouselItem>
                          )
                        )}
                      </CarouselContent>
                      <CarouselPrevious
                        variant="theme_autobot"
                        className="left-2"
                      />
                      <CarouselNext
                        variant="theme_autobot"
                        className="right-2"
                      />
                    </Carousel>
                  </div>
                ) : (
                  <div className="w-full flex justify-around items-center aspect-square object-cover rounded-md">
                    <ImageOffIcon size={64} strokeWidth={1} />
                  </div>
                )}

                {collectionItem.toy_images &&
                collectionItem.toy_images.length > 0 ? (
                  <div className="col-span-1">
                    <h4 className="text-sm font-medium">My Unboxed Toy</h4>
                    <Carousel className="w-full">
                      <CarouselContent>
                        {collectionItem.toy_images.map(
                          (image: string, index: number) => (
                            <CarouselItem key={index}>
                              <div className="p-1">
                                <img
                                  src={image}
                                  alt={`Toy ${index + 1}`}
                                  className="aspect-square object-cover rounded-md"
                                />
                              </div>
                            </CarouselItem>
                          )
                        )}
                      </CarouselContent>
                      <CarouselPrevious
                        variant="theme_decepticon"
                        className="left-2"
                      />
                      <CarouselNext
                        variant="theme_decepticon"
                        className="right-2"
                      />
                    </Carousel>
                  </div>
                ) : (
                  <div className="w-full flex justify-around items-center aspect-square object-cover rounded-md">
                    <ImageOffIcon size={64} strokeWidth={1} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right column: comments that can grow independently */}
        <div
          className="md:col-span-1 max-h-[calc(100vh-8rem)] overflow-hidden min-h-0"
          style={{ maxHeight: "calc(100vh - 8rem)" }}
        >
          <Card className="h-full min-h-0">
            <CardHeader>
              <CardTitle className="text-lg">Comments</CardTitle>
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
                        currentUser.user_id._id ===
                          c.user_profile_id?.user_id && (
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
                                  await deleteComment(
                                    collectionItem._id,
                                    c._id
                                  );
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
                              variant="theme_autobot"
                              onClick={async () => {
                                try {
                                  if (!editingId) return;
                                  const updated = await editComment(
                                    collectionItem._id,
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
                              variant="theme_decepticon"
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
                          collectionItem._id,
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
      </div>
    </div>
  );
}
