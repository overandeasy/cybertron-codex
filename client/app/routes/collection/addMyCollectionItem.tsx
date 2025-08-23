import { useState } from "react";
import { Navigate, useRouteLoaderData, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { X, Upload, Plus } from "lucide-react";
import type { UserCollection } from "~/lib/zod";
import { addCollection } from "~/api/collection";
import type { Route } from "./+types/addMyCollectionItem";
import { toast } from "sonner";
import { themeToast } from "~/components/ThemeToast";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Add Collection Item" },
    { name: "description", content: "Add a new item to your collection" },
  ];
}

export const handle = { breadcrumb: "Add Item" };

export default function AddMyCollectionItem() {
  const navigate = useNavigate();

  const loaderDataRoot = useRouteLoaderData("root") as {
    userProfile?: any;
  };
  const userProfile = loaderDataRoot?.userProfile;

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
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [toyFiles, setToyFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auth check
  if (localStorage.getItem("token") === null) {
    console.warn("No auth token found in localStorage.");
    return <Navigate to="/auth/sign-in" replace />;
  }

  if (!userProfile) return <div>Loading profile...</div>;

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
      setMediaFiles((prev) => [...prev, ...files]);
    } else {
      setToyFiles((prev) => [...prev, ...files]);
    }
  };

  const handleRemoveFile = (index: number, type: "media" | "toy") => {
    if (type === "media") {
      setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    } else {
      setToyFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.character_name || !formData.character_primary_faction) {
      alert("Character name and primary faction are required!");
      return;
    }

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

      // Add files
      mediaFiles.forEach((file) => {
        formDataToSubmit.append("media_images", file);
      });

      toyFiles.forEach((file) => {
        formDataToSubmit.append("toy_images", file);
      });

      const newCollection = await addCollection(formDataToSubmit);

      console.log("Collection added successfully:", newCollection);
      themeToast(
        "success",
        "Collection item added successfully!",
        "/collection/my-collection",
        navigate
      );
      // navigate("/collection/my-collection");
    } catch (error) {
      console.error("Failed to add collection:", error);
      themeToast("fail", "Failed to add collection item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Add New Collection Item</h1>
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
                  placeholder="e.g., Optimus Prime"
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
                  placeholder="e.g., Autobots"
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
                placeholder="Describe the character..."
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
                  placeholder="e.g., Generations"
                />
              </div>
              <div>
                <Label htmlFor="toy_class">Toy Class</Label>
                <Input
                  id="toy_class"
                  name="toy_class"
                  value={formData.toy_class}
                  onChange={handleInputChange}
                  placeholder="e.g., Voyager"
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
              <Plus className="w-4 h-4 mr-2" />
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
              <Label>Media Images (Max 3)</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {mediaFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Media ${index + 1}`}
                      className="aspect-square object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 w-6 h-6"
                      onClick={() => handleRemoveFile(index, "media")}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
              {mediaFiles.length < 3 && (
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
              )}
            </div>

            {/* Toy Images */}
            <div>
              <Label>Toy Images (Max 3)</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {toyFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Toy ${index + 1}`}
                      className="aspect-square object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 w-6 h-6"
                      onClick={() => handleRemoveFile(index, "toy")}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
              {toyFiles.length < 3 && (
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
              )}
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
                placeholder="Any notes about this item..."
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
                  placeholder="e.g., Target, Amazon, Comic Con"
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
            {isSubmitting ? "Adding..." : "Add to Collection"}
          </Button>
        </div>
      </form>
    </div>
  );
}
