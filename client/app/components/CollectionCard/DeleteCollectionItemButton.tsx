import { useState, type ComponentPropsWithRef } from "react";
import { Button } from "../ui/button";
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
} from "../ui/alert-dialog";
import { deleteCollectionItem } from "~/api/collection";
import { themeToast } from "../ThemeToast";
import { useNavigate, useRevalidator } from "react-router";
import type { UserCollection } from "~/lib/zod";
import { Trash2 } from "lucide-react";
// import { useDeleteCollectionItem } from "~/routes/home";

interface DeleteCollectionItemButtonProps {
  //   targetCollection: UserCollection[];
  //   targetCollectionItem: UserCollection;
  //   targetCollectionItemId: string;
  //   useDeleteCollectionItem: (
  //     targetCollection: UserCollection[],
  //     targetCollectionItemId: string
  //   ) => [UserCollection[]];
  //   location?: "my-collection" | "home";

  collectionItem: UserCollection;
  location: "/collection/my-collection" | "/home";
}
export const DeleteCollectionItemButton = (
  props: DeleteCollectionItemButtonProps & ComponentPropsWithRef<typeof Button>
) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    // targetCollection,
    // targetCollectionItem,
    // targetCollectionItemId,
    // useDeleteCollectionItem,
    // location,
    collectionItem,
    location,
  } = props;

  return (
    <AlertDialog open={open} onOpenChange={(open) => setOpen(open)}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="destructive">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{collectionItem.character_name}"?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async (event) => {
              try {
                event?.preventDefault();
                setLoading(true);
                setOpen(true);
                await deleteCollectionItem(collectionItem._id).then(
                  (deletionResult) => {
                    if (deletionResult.success) {
                      themeToast(
                        "success",
                        "Collection item deleted successfully.",
                        location,
                        navigate
                      );
                    } else {
                      themeToast(
                        "fail",
                        "Failed to delete collection item. Please try again."
                      );
                    }
                  }
                );
              } catch (error) {
                themeToast(
                  "fail",
                  "Failed to delete collection item. Please try again."
                );
              } finally {
                setLoading(false);
                setOpen(false);
                // useRevalidator().revalidate();
              }
            }}
          >
            {loading ? "Deleting..." : "Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
