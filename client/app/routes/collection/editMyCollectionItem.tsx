import { useState, useEffect } from "react";
import {
  Navigate,
  useParams,
  useRouteLoaderData,
  useNavigate,
} from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { X, Upload, Trash2 } from "lucide-react";
import type { UserCollection } from "~/lib/zod";
import { editCollection } from "~/api/collection";
import type { Route } from "./+types/editMyCollectionItem";
import { themeToast } from "~/components/ThemeToast";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Edit Collection Item" },
    { name: "description", content: "Edit your collection item details" },
  ];
}

export const handle = { breadcrumb: "Edit" };

// export async function clientLoader({ params }: Route.ClientLoaderArgs) {
//   const token = localStorage.getItem("token");
//   if (!token) {
//     console.warn("No auth token found in localStorage.");
//     return { collection: null };
//   }

//   try {
//     const collection = await getCollectionById(params._id);
//     console.log("Collection fetched for editing:", collection);
//     return { collection };
//   } catch (error) {
//     console.error("Failed to fetch collection for editing:", error);
//     return { collection: null };
//   }
// }

export default function EditMyCollectionItem() {
  const navigate = useNavigate();
  const params = useParams();
  console.log("EditMyCollectionItem params:", params);
  const loaderData = useRouteLoaderData("routes/collection/layout");
  const collection = loaderData?.userCollection;
  console.log("EditMyCollectionItem collection:", { collection });

  const userProfile = useRouteLoaderData("root")?.userProfile;
  // console.log("User profile in EditMyCollectionItem:", userProfile);

  // Form state
  const [formData, setFormData] = useState({
    character_name: "",
    character_primary_faction: "",
    character_description: "",
    toy_line: "",
    toy_class: "",
    collection_notes: "",
    acquisition_date: "",
    acquisition_location: "",
    public: true,
  });

  const [altNames, setAltNames] = useState<{ name: string }[]>([]);
  const [mediaImages, setMediaImages] = useState<string[]>([]);
  const [toyImages, setToyImages] = useState<string[]>([]);
  const [newMediaFiles, setNewMediaFiles] = useState<File[]>([]);
  const [newToyFiles, setNewToyFiles] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auth check
  // console.log("Auth token in localStorage:", localStorage.getItem("token"));
  if (localStorage.getItem("token") === null) {
    console.warn("No auth token found in localStorage.");
    return <Navigate to="/auth/sign-in" replace />;
  }

  if (!userProfile) return <div>Loading profile...</div>;
  if (!collection) return <div>Collection not found</div>;

  const collectionItem: UserCollection | undefined = collection.find(
    (item: UserCollection) => item._id === params._id
  );
  console.log("EditMyCollectionItem collection item:", collectionItem);

  if (!collectionItem) return <div>Collection item not found</div>;
  // Check ownership
  const isOwner =
    userProfile.user_id._id === collectionItem.user_profile_id.user_id;
  console.log("Item is owned by user:", isOwner);
  if (!isOwner) {
    return <Navigate to="/collection/my-collection" replace />;
  }

  // Initialize form data
  useEffect(() => {
    if (collectionItem) {
      setFormData({
        character_name: collectionItem.character_name || "",
        character_primary_faction:
          collectionItem.character_primary_faction || "",
        character_description: collectionItem.character_description || "",
        toy_line: collectionItem.toy_line || "",
        toy_class: collectionItem.toy_class || "",
        collection_notes: collectionItem.collection_notes || "",
        acquisition_date: collectionItem.acquisition_date
          ? new Date(collectionItem.acquisition_date)
              .toISOString()
              .split("T")[0]
          : "",
        acquisition_location: collectionItem.acquisition_location || "",
        public: collectionItem.public ?? true,
      });

      setAltNames(collectionItem.alt_character_name || []);
      setMediaImages(collectionItem.media_images || []);
      setToyImages(collectionItem.toy_images || []);
    }
  }, [collectionItem]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleAddAltName = () => {
    setAltNames((prev) => [...prev, { name: "" }]);
  };

  const handleAltNameChange = (index: number, value: string) => {
    setAltNames((prev) =>
      prev.map((item, i) => (i === index ? { name: value } : item))
    );
  };

  const handleRemoveAltName = (index: number) => {
    setAltNames((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "media" | "toy"
  ) => {
    const files = Array.from(e.target.files || []);
    if (type === "media") {
      setNewMediaFiles((prev) => [...prev, ...files]);
    } else {
      setNewToyFiles((prev) => [...prev, ...files]);
    }
  };

  const handleRemoveExistingImage = (
    imageUrl: string,
    type: "media" | "toy"
  ) => {
    setImagesToDelete((prev) => [...prev, imageUrl]);
    if (type === "media") {
      setMediaImages((prev) => prev.filter((img) => img !== imageUrl));
    } else {
      setToyImages((prev) => prev.filter((img) => img !== imageUrl));
    }
  };

  const handleRemoveNewFile = (index: number, type: "media" | "toy") => {
    if (type === "media") {
      setNewMediaFiles((prev) => prev.filter((_, i) => i !== index));
    } else {
      setNewToyFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSubmit = new FormData();

      // Add text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataToSubmit.append(key, value.toString());
        }
      });

      // Add arrays as JSON strings
      formDataToSubmit.append("alt_character_name", JSON.stringify(altNames));
      formDataToSubmit.append("media_images", JSON.stringify(mediaImages));
      formDataToSubmit.append("toy_images", JSON.stringify(toyImages));

      if (imagesToDelete.length > 0) {
        formDataToSubmit.append(
          "imagesToDelete",
          JSON.stringify(imagesToDelete)
        );
      }

      // Add new files
      newMediaFiles.forEach((file) => {
        formDataToSubmit.append("media_images", file);
      });

      newToyFiles.forEach((file) => {
        formDataToSubmit.append("toy_images", file);
      });

      console.log("Submitting form data: ", formDataToSubmit);

      // TODO: Implement updateCollection API call
      const result = await editCollection(params._id!, formDataToSubmit);

      if (result.type === "success") {
        themeToast(
          "success",
          "Collection updated successfully",
          `/collection/my-collection/${params._id}`,
          navigate
        );
        console.log("Collection updated successfully");
      } else {
        themeToast("fail", "Failed to update collection");
      }
    } catch (error) {
      console.error("Failed to update collection:", error);
      // Show error message to user
      themeToast(
        "fail",
        error instanceof Error ? error.message : "Failed to update collection"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Edit Collection Item</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="character_name">Character Name *</Label>
                <Input
                  id="character_name"
                  name="character_name"
                  value={formData.character_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="character_primary_faction">
                  Primary Faction *
                </Label>
                <Input
                  id="character_primary_faction"
                  name="character_primary_faction"
                  value={formData.character_primary_faction}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="character_description">Description</Label>
              <Textarea
                id="character_description"
                name="character_description"
                value={formData.character_description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="toy_line">Toy Line</Label>
                <Input
                  id="toy_line"
                  name="toy_line"
                  value={formData.toy_line}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="toy_class">Toy Class</Label>
                <Input
                  id="toy_class"
                  name="toy_class"
                  value={formData.toy_class}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alternative Names</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {altNames.map((altName, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={altName.name}
                  onChange={(e) => handleAltNameChange(index, e.target.value)}
                  placeholder="Alternative character name"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemoveAltName(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={handleAddAltName}>
              Add Alternative Name
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Media Images */}
            <div>
              <Label>Media Images</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {mediaImages.map((imageUrl, index) => (
                  <div key={index} className="relative">
                    <img
                      src={imageUrl}
                      alt={`Media ${index + 1}`}
                      className="aspect-square object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 w-6 h-6"
                      onClick={() =>
                        handleRemoveExistingImage(imageUrl, "media")
                      }
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                {newMediaFiles.map((file, index) => (
                  <div key={`new-${index}`} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`New Media ${index + 1}`}
                      className="aspect-square object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 w-6 h-6"
                      onClick={() => handleRemoveNewFile(index, "media")}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileChange(e, "media")}
                  className="hidden"
                  id="media-upload"
                />
                <Label htmlFor="media-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Add Media Images
                    </span>
                  </Button>
                </Label>
              </div>
            </div>

            {/* Toy Images */}
            <div>
              <Label>Toy Images</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {toyImages.map((imageUrl, index) => (
                  <div key={index} className="relative">
                    <img
                      src={imageUrl}
                      alt={`Toy ${index + 1}`}
                      className="aspect-square object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 w-6 h-6"
                      onClick={() => handleRemoveExistingImage(imageUrl, "toy")}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                {newToyFiles.map((file, index) => (
                  <div key={`new-${index}`} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`New Toy ${index + 1}`}
                      className="aspect-square object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 w-6 h-6"
                      onClick={() => handleRemoveNewFile(index, "toy")}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileChange(e, "toy")}
                  className="hidden"
                  id="toy-upload"
                />
                <Label htmlFor="toy-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Add Toy Images
                    </span>
                  </Button>
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="collection_notes">Collection Notes</Label>
              <Textarea
                id="collection_notes"
                name="collection_notes"
                value={formData.collection_notes}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="acquisition_date">Acquisition Date</Label>
                <Input
                  type="date"
                  id="acquisition_date"
                  name="acquisition_date"
                  value={formData.acquisition_date}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="acquisition_location">
                  Acquisition Location
                </Label>
                <Input
                  id="acquisition_location"
                  name="acquisition_location"
                  value={formData.acquisition_location}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="public"
                name="public"
                checked={formData.public}
                onChange={handleInputChange}
                className="rounded"
              />
              <Label htmlFor="public">Make this collection item public</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update"}
          </Button>
        </div>
      </form>
    </div>
  );
}
