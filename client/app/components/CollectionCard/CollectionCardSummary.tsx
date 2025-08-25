import React from "react";
import type { UserCollection } from "~/lib/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { ImageOffIcon } from "lucide-react";
import { Star } from "lucide-react";
import { Button } from "../ui/button";

function CollectionCardSummary({
  collectionItem,
  isOwner,
  isFavorited,
  onToggleFavorite,
  ...props // Accept additional props so parent component's asChild would work
}: {
  collectionItem: UserCollection;
  isOwner: boolean | null;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
}) {
  const lastMediaImage =
    collectionItem.media_images && collectionItem.media_images.length > 0
      ? collectionItem.media_images[collectionItem.media_images.length - 1]
      : null;
  return (
    <Card
      {...props} // Spread additional props to the root DOM element (mainly for parent component's asChild to work)
      className="hover:cursor-pointer hover:scale-105 transition-transform duration-200"
    >
      <CardHeader>
        <CardTitle>{collectionItem.character_name}</CardTitle>
        <div className="flex items-center gap-1">
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
          {onToggleFavorite && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className="ml-2"
            >
              <Star
                fill={isFavorited ? "currentColor" : "none"}
                strokeWidth={1}
                aria-hidden
                role="img"
                className={
                  isFavorited
                    ? "w-5 h-5 text-yellow-400"
                    : "w-5 h-5 text-muted-foreground"
                }
              />
            </Button>
          )}
        </div>
        <CardDescription className="line-clamp-1 h-5">
          {collectionItem.character_description}
        </CardDescription>
      </CardHeader>
      <CardContent className="items-center">
        {lastMediaImage ? (
          <img
            src={lastMediaImage}
            alt="Collection Preview"
            className="w-full aspect-square object-cover rounded-md"
          />
        ) : (
          <div className="w-full flex justify-around items-center aspect-square object-cover rounded-md">
            <ImageOffIcon size={64} strokeWidth={1} />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex text-muted-foreground text-sm">
          Shared by:{" "}
          {isOwner
            ? "Me"
            : `${collectionItem.user_profile_id.first_name} ${collectionItem.user_profile_id.last_name}`}
        </div>
      </CardFooter>
    </Card>
  );
}

export default CollectionCardSummary;
