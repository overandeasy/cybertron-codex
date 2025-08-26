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
import { X, Upload, Trash2 } from "lucide-react";
import type { UserCollection } from "~/lib/zod";
import { userCollectionFormSchema, imageFileSchema } from "~/lib/zod";
import { ALL_CURRENCIES } from "~/lib/utils";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { editCollection } from "~/api/collection";
import type { Route } from "./+types/editMyCollectionItem";
import { themeToast } from "~/components/ThemeToast";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Edit Collection Item" },
    { name: "description", content: "Edit your collection item details" },
  ];
}

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

  // Form state using react-hook-form + zod
  const clientUserCollectionSchema = userCollectionFormSchema.omit({
    user_profile_id: true,
    createdAt: true,
    updatedAt: true,
  });
  type FormValues = z.infer<typeof clientUserCollectionSchema>;
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(clientUserCollectionSchema) as any,
    defaultValues: {
      character_name: "",
      character_primary_faction: undefined,
      character_description: "",
      toy_line: "",
      toy_class: "",
      collection_notes: "",
      acquisition_date: undefined,
      acquisition_location: "",
      public: true,
      alt_character_name: [],
    } as Partial<FormValues>,
  });

  const {
    fields: altNames,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "alt_character_name" as any,
  });

  const [mediaImages, setMediaImages] = useState<string[]>([]);
  const [toyImages, setToyImages] = useState<string[]>([]);
  const [newMediaFiles, setNewMediaFiles] = useState<File[]>([]);
  const [newToyFiles, setNewToyFiles] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [mediaErrors, setMediaErrors] = useState<string[]>([]);
  const [toyErrors, setToyErrors] = useState<string[]>([]);
  const [mediaProgress, setMediaProgress] = useState<Record<number, number>>(
    {}
  );
  const [toyProgress, setToyProgress] = useState<Record<number, number>>({});
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
      reset({
        character_name: collectionItem.character_name || "",
        character_primary_faction:
          collectionItem.character_primary_faction || undefined,
        character_description: collectionItem.character_description || "",
        toy_line: collectionItem.toy_line || "",
        toy_class: collectionItem.toy_class || "",
        collection_notes: collectionItem.collection_notes || "",
        acquisition_date: collectionItem.acquisition_date
          ? new Date(collectionItem.acquisition_date)
              .toISOString()
              .split("T")[0]
          : undefined,
        acquisition_location: collectionItem.acquisition_location || "",
        public: collectionItem.public ?? true,
        price: (collectionItem as any).price ?? undefined,
        currency: (collectionItem as any).currency ?? "USD",
        alt_character_name: collectionItem.alt_character_name || [],
      } as Partial<FormValues>);

      setMediaImages(collectionItem.media_images || []);
      setToyImages(collectionItem.toy_images || []);
      // populate field array if alt names exist
      // useFieldArray will reflect reset values
    }
  }, [collectionItem, reset]);

  // field array helpers
  const handleAddAltName = () => append({ name: "" } as any);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "media" | "toy"
  ) => {
    const files = Array.from(e.target.files || []);
    const validateFiles = (incoming: File[]) => {
      const accepted: File[] = [];
      const errors: string[] = [];
      incoming.forEach((file) => {
        try {
          imageFileSchema.parse(file as File);
          accepted.push(file);
        } catch (err: any) {
          errors.push(
            `${file.name}: ${err?.errors?.[0]?.message || err.message}`
          );
        }
      });
      return { accepted, errors };
    };

    if (type === "media") {
      const { accepted, errors } = validateFiles(files);
      setMediaErrors(errors);
      setNewMediaFiles((prev) => {
        const next = [...prev, ...accepted].slice(0, 3);
        const baseIndex = prev.length;
        const newProgress = { ...mediaProgress };
        for (let i = 0; i < Math.min(accepted.length, 3 - prev.length); i++) {
          newProgress[baseIndex + i] = 0;
        }
        setMediaProgress(newProgress);
        return next;
      });
    } else {
      const { accepted, errors } = validateFiles(files);
      setToyErrors(errors);
      setNewToyFiles((prev) => {
        const next = [...prev, ...accepted].slice(0, 3);
        const baseIndex = prev.length;
        const newProgress = { ...toyProgress };
        for (let i = 0; i < Math.min(accepted.length, 3 - prev.length); i++) {
          newProgress[baseIndex + i] = 0;
        }
        setToyProgress(newProgress);
        return next;
      });
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
      setMediaErrors((prev) => prev.filter((_, i) => i !== index));
      setMediaProgress((prev) => {
        const copy = { ...prev };
        delete copy[index];
        return copy;
      });
    } else {
      setNewToyFiles((prev) => prev.filter((_, i) => i !== index));
      setToyErrors((prev) => prev.filter((_, i) => i !== index));
      setToyProgress((prev) => {
        const copy = { ...prev };
        delete copy[index];
        return copy;
      });
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      if (newMediaFiles.length > 3 || newToyFiles.length > 3) {
        throw new Error(
          "Too many files selected. Maximum 3 media and 3 toy images allowed."
        );
      }

      // simulate per-file progress
      Object.keys(mediaProgress).forEach(
        (k) => (mediaProgress[Number(k)] = 10)
      );
      setMediaProgress({ ...mediaProgress });

      const formDataToSubmit = new FormData();

      const keysToAppend: Array<keyof FormValues> = [
        "character_name",
        "character_primary_faction",
        "character_description",
        "toy_line",
        "toy_class",
        "collection_notes",
        "acquisition_location",
      ];

      keysToAppend.forEach((k) => {
        const v = values[k];
        if (v !== undefined && v !== null) {
          formDataToSubmit.append(k as string, String(v));
        }
      });

      if (values.acquisition_date) {
        const d = values.acquisition_date as unknown as Date;
        formDataToSubmit.append("acquisition_date", d.toISOString());
      }

      formDataToSubmit.append("public", String(values.public ?? true));

      formDataToSubmit.append(
        "alt_character_name",
        JSON.stringify(values.alt_character_name || [])
      );
      // price and currency
      if ((values as any).price !== undefined) {
        formDataToSubmit.append("price", String((values as any).price));
      }
      if ((values as any).currency) {
        formDataToSubmit.append("currency", String((values as any).currency));
      }

      // current images arrays
      formDataToSubmit.append("media_images", JSON.stringify(mediaImages));
      formDataToSubmit.append("toy_images", JSON.stringify(toyImages));

      if (imagesToDelete.length > 0) {
        formDataToSubmit.append(
          "imagesToDelete",
          JSON.stringify(imagesToDelete)
        );
      }

      newMediaFiles.forEach((file) =>
        formDataToSubmit.append("media_images", file)
      );
      newToyFiles.forEach((file) =>
        formDataToSubmit.append("toy_images", file)
      );

      const result = await editCollection(params._id!, formDataToSubmit);

      // mark progress complete
      setMediaProgress((prev) =>
        Object.keys(prev).reduce(
          (acc, k) => ({ ...acc, [Number(k)]: 100 }),
          {} as Record<number, number>
        )
      );
      setToyProgress((prev) =>
        Object.keys(prev).reduce(
          (acc, k) => ({ ...acc, [Number(k)]: 100 }),
          {} as Record<number, number>
        )
      );

      if ((result as any).type === "success") {
        themeToast(
          "success",
          "Collection updated successfully",
          `/collection/my-collection/${params._id}`,
          navigate
        );
      } else {
        themeToast("fail", "Failed to update collection");
      }
    } catch (error: any) {
      console.error("Failed to update collection:", error);
      if (error && typeof error === "object" && "fields" in error) {
        const fields = (error as any).fields as Record<string, string>;
        Object.entries(fields || {}).forEach(([k, v]) => {
          try {
            (control as any)._form.setError(k, { type: "server", message: v });
          } catch (e) {
            themeToast("fail", v);
          }
        });
      } else {
        themeToast(
          "fail",
          error instanceof Error ? error.message : "Failed to update collection"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Edit Collection Item</h1>
        <Button variant="theme_decepticon" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="character_name">Character Name *</Label>
                <Input id="character_name" {...register("character_name")} />
                {errors.character_name && (
                  <p className="text-sm text-red-600">
                    {String(errors.character_name?.message)}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="character_primary_faction">
                  Primary Faction *
                </Label>
                <Input
                  id="character_primary_faction"
                  {...register("character_primary_faction")}
                />
                {errors.character_primary_faction && (
                  <p className="text-sm text-red-600">
                    {String(errors.character_primary_faction?.message)}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="character_description">Description</Label>
              <Textarea
                id="character_description"
                {...register("character_description")}
                rows={3}
              />
              {errors.character_description && (
                <p className="text-sm text-red-600">
                  {String(errors.character_description?.message)}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="toy_line">Toy Line</Label>
                <Input id="toy_line" {...register("toy_line")} />
              </div>
              <div>
                <Label htmlFor="toy_class">Toy Class</Label>
                <Input id="toy_class" {...register("toy_class")} />
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
              <div key={altName.id} className="flex gap-2">
                <Input
                  {...register(`alt_character_name.${index}.name` as const)}
                  placeholder="Alternative character name"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => remove(index)}
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
                      {" "}
                      <X className="w-3 h-3" />{" "}
                    </Button>
                    {mediaProgress[index] !== undefined && (
                      <div className="absolute left-1 bottom-1 right-1 bg-black/25 rounded-md h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-md"
                          style={{ width: `${mediaProgress[index]}%` }}
                        />
                      </div>
                    )}
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
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    disabled={
                      newMediaFiles.length >= 3 ||
                      mediaImages.length + newMediaFiles.length >= 3
                    }
                  >
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Add Media Images
                    </span>
                  </Button>
                </Label>
              </div>
              {mediaErrors.length > 0 && (
                <div className="mt-2 text-sm text-red-600">
                  {mediaErrors.map((err, i) => (
                    <div key={i}>{err}</div>
                  ))}
                </div>
              )}
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
                      {" "}
                      <X className="w-3 h-3" />{" "}
                    </Button>
                    {toyProgress[index] !== undefined && (
                      <div className="absolute left-1 bottom-1 right-1 bg-black/25 rounded-md h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-md"
                          style={{ width: `${toyProgress[index]}%` }}
                        />
                      </div>
                    )}
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
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    disabled={
                      newToyFiles.length >= 3 ||
                      toyImages.length + newToyFiles.length >= 3
                    }
                  >
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Add Toy Images
                    </span>
                  </Button>
                </Label>
              </div>
              {toyErrors.length > 0 && (
                <div className="mt-2 text-sm text-red-600">
                  {toyErrors.map((err, i) => (
                    <div key={i}>{err}</div>
                  ))}
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
                {...register("collection_notes")}
                rows={3}
              />
              {errors.collection_notes && (
                <p className="text-sm text-red-600">
                  {String(errors.collection_notes?.message)}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="acquisition_date">Acquisition Date</Label>
                <Input
                  type="date"
                  id="acquisition_date"
                  {...register("acquisition_date" as any)}
                />
                {errors.acquisition_date && (
                  <p className="text-sm text-red-600">
                    {String(errors.acquisition_date?.message)}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="acquisition_location">
                  Acquisition Location
                </Label>
                <Input
                  id="acquisition_location"
                  {...register("acquisition_location")}
                />
                {errors.acquisition_location && (
                  <p className="text-sm text-red-600">
                    {String(errors.acquisition_location?.message)}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currency">Currency</Label>
                {(() => {
                  const top = ["AUD", "CNY", "EUR", "GBP", "HKD", "USD"];
                  const unique = Array.from(
                    new Set(
                      (ALL_CURRENCIES as string[]).map((c: string) =>
                        c.toUpperCase()
                      )
                    )
                  );
                  const rest = (unique as string[])
                    .filter((c: string) => !top.includes(c))
                    .sort();
                  const finalList: string[] = [...top, ...rest];
                  return (
                    <select
                      id="currency"
                      {...register("currency")}
                      className="w-full border rounded px-2 py-1"
                    >
                      {finalList.map((c) => {
                        let label = c;
                        try {
                          const parts = new Intl.NumberFormat(undefined, {
                            style: "currency",
                            currency: c,
                          }).formatToParts(1);
                          const currencyPart = parts.find(
                            (p) => p.type === "currency"
                          )?.value;
                          label = currencyPart ? `${c} (${currencyPart})` : c;
                        } catch (e) {
                          label = c;
                        }
                        return (
                          <option key={c} value={c}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  );
                })()}
                {errors.currency && (
                  <p className="text-sm text-red-600">
                    {String(errors.currency?.message)}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register("price")}
                  placeholder="e.g., 19.99"
                />
                {errors.price && (
                  <p className="text-sm text-red-600">
                    {String(errors.price?.message)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="public"
                {...register("public" as any)}
                className="rounded"
              />
              <Label htmlFor="public">Make this collection item public</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="theme_decepticon"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} variant="theme_autobot">
            {isSubmitting ? "Updating..." : "Update"}
          </Button>
        </div>
      </form>
    </div>
  );
}
