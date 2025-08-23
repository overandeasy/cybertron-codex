import { ImageOffIcon, Pencil, Trash2 } from "lucide-react";
import { useState, type ComponentPropsWithRef } from "react";
import { Link, useNavigate, useParams, useRouteLoaderData } from "react-router";
import { DeleteCollectionItemButton } from "~/components/CollectionCard/DeleteCollectionItemButton";
import { themeToast } from "~/components/ThemeToast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
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

export default function MyCollectionItem() {
  const loaderData = useRouteLoaderData("routes/collection/layout");
  const collection = loaderData?.userCollection as UserCollection[];
  console.log("MyCollectionItem page loaded with collection: ", collection);
  const { _id: itemId } = useParams();
  console.log("MyCollectionItem ID:", { itemId });
  const collectionItem = collection.find((item) => item._id === itemId);

  const currentUser = useRouteLoaderData("root").userProfile;

  if (!collectionItem) {
    return <div>Collection item not found</div>;
  }
  const isOwner =
    currentUser &&
    currentUser.user_id._id === collectionItem.user_profile_id.user_id;
  console.log("Is owner:", isOwner);

  // const ClickToast = ({ ...props }: ComponentPropsWithRef<typeof Button>) => {
  //   const [open, setOpen] = useState(false);

  //   return (
  //     <AlertDialog open={open} onOpenChange={(open) => setOpen(open)}>
  //       <AlertDialogTrigger asChild>
  //         <Button size="sm" variant="theme_decepticon">
  //           Delete
  //         </Button>
  //       </AlertDialogTrigger>
  //       <AlertDialogContent>
  //         <AlertDialogHeader>
  //           <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
  //           <AlertDialogDescription>
  //             Are you sure you want to delete "{collectionItem.character_name}"?
  //           </AlertDialogDescription>
  //         </AlertDialogHeader>
  //         <AlertDialogFooter>
  //           <AlertDialogCancel>Cancel</AlertDialogCancel>
  //           <AlertDialogAction
  //             onClick={async () => {
  //               themeToast("fail", "Button clicked.");
  //             }}
  //           >
  //             Continue
  //           </AlertDialogAction>
  //         </AlertDialogFooter>
  //       </AlertDialogContent>
  //     </AlertDialog>
  //   );
  // };
  return (
    <div className=" space-y-6">
      {/* <ClickToast /> */}
      <Card>
        <CardHeader>
          <CardTitle className=" text-xl  font-bold">
            {collectionItem.character_name}
            <span className="gap-2 ml-2">
              {collectionItem.public ? (
                <Badge variant="theme_autobot">Public</Badge>
              ) : (
                <Badge variant="theme_decepticon">Private</Badge>
              )}
            </span>
            {isOwner && (
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                <Button asChild size="sm" variant="outline">
                  <Link
                    to={`/collection/my-collection/${collectionItem._id}/edit`}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <DeleteCollectionItemButton
                    collectionItem={collectionItem}
                    location={"/collection/my-collection"}
                  />
                </Button>
              </div>
            )}
          </CardTitle>
          <CardDescription className="text-lg">
            {collectionItem.character_description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-1">
            <img
              src={
                collectionItem.character_primary_faction === "Autobot"
                  ? "/images/logo/autobot_color.svg"
                  : "/images/logo/decepticon_color.svg"
              }
              alt={`${collectionItem.character_primary_faction} logo`}
              className="w-8 h-8"
            />
            <Badge
              className=""
              variant={
                collectionItem.character_primary_faction === "Autobot"
                  ? "theme_autobot"
                  : "theme_decepticon"
              }
            >
              {collectionItem.character_primary_faction}
            </Badge>
          </div>
          {collectionItem.alt_character_name &&
            collectionItem.alt_character_name.length > 0 && (
              <div className="">
                <h4 className="">Alternative Names</h4>
                <ul className="list-disc pl-5">
                  {collectionItem.alt_character_name.map((altName, index) => (
                    <li key={index} className="">
                      {altName.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">
            Acquisition Information
          </CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>
          {collectionItem.acquisition_date && (
            <div>
              <h4 className="">Acquisition Date</h4>
              <p className="">
                {new Date(collectionItem.acquisition_date).toLocaleDateString()}
              </p>
            </div>
          )}
          {collectionItem.acquisition_location && (
            <div>
              <h4 className="">Acquisition Location</h4>
              <p className="">{collectionItem.acquisition_location}</p>
            </div>
          )}
          {collectionItem.collection_notes && (
            <div>
              <h4 className="">Collection Notes</h4>
              <p className="">{collectionItem.collection_notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">Collection Notes</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>
          {collectionItem.collection_notes && (
            <div>
              <h4 className="">Collection Notes</h4>
              <p className="">{collectionItem.collection_notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">Images</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {collectionItem.media_images &&
          collectionItem.media_images.length > 0 ? (
            <div className="col-span-1">
              <h4 className="">Media Appearances</h4>
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
                <CarouselPrevious variant="theme_autobot" className="left-2" />
                <CarouselNext variant="theme_autobot" className="right-2" />
              </Carousel>
            </div>
          ) : (
            <div className="w-full flex justify-around items-center aspect-square object-cover rounded-md">
              <ImageOffIcon size={64} strokeWidth={1} />
            </div>
          )}

          {collectionItem.toy_images && collectionItem.toy_images.length > 0 ? (
            <div className="col-span-1">
              <h4 className="">My Unboxed Toy</h4>
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
                <CarouselPrevious
                  variant="theme_decepticon"
                  className="left-2"
                />
                <CarouselNext variant="theme_decepticon" className="right-2" />
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
  );
}
