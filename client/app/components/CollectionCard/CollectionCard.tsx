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
import { Link, useRouteLoaderData } from "react-router";
import { ImageOffIcon, Pencil, Trash2 } from "lucide-react";

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
  const { collectionItem, location } = props;

  const currentUser = loaderData?.userProfile;

  // Check if current user owns this collection

  const isOwner =
    currentUser &&
    currentUser.user_id._id === collectionItem.user_profile_id.user_id;
  // console.log("Is owner:", isOwner);

  return location === "/collection/my-collection" ? (
    <Link to={`${location}/${collectionItem._id}`}>
      <CollectionCardSummary
        collectionItem={collectionItem}
        isOwner={isOwner}
      />
    </Link>
  ) : (
    <Dialog>
      <DialogTrigger asChild>
        <CollectionCardSummary
          collectionItem={collectionItem}
          isOwner={isOwner}
        />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[80vw] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{collectionItem.character_name}</DialogTitle>
          <DialogDescription>
            {collectionItem.character_description}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
          <div className="col-span-1 space-y-4">
            <Badge>{collectionItem.character_primary_faction}</Badge>
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
        </div>

        {/* Owner controls - positioned at bottom right */}
        {isOwner && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button asChild size="sm" variant="outline">
              <Link to={`/collection/my-collection/${collectionItem._id}/edit`}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Link>
            </Button>

            <DeleteCollectionItemButton
              collectionItem={collectionItem}
              location={location}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
