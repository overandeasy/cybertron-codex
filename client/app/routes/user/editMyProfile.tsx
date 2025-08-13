import { useState, useEffect, useRef } from "react";
import { Navigate, useNavigate, useRouteLoaderData } from "react-router";
import { UserProfileForm } from "~/components/UserProfileForm";
import { ImageThumbnails } from "~/components/ImageThumbnails";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  imageFileSchema,
  type UserProfile,
  type UserProfileFormData,
} from "~/lib/zod";
import { updateUserProfile } from "~/api/user";
import { SquareUserRound } from "lucide-react";
import { toast } from "sonner";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/editMyProfile";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Edit Profile" },
    { name: "description", content: "Edit your profile information" },
  ];
}

export const handle = { breadcrumb: "Edit Profile" };

export default function EditMyProfile() {
  const loaderData = useRouteLoaderData("routes/appLayout");
  const userProfile = loaderData?.userProfile;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | undefined>();
  const [newImageFile, setNewImageFile] = useState<File | undefined>();
  const [fileError, setFileError] = useState<string | null>(null); // For file validation errors
  const [newImage, setNewImage] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateUserProfileResult, setUpdateUserProfileResult] = useState<
    UserProfile | { error: string } | null
  >(null);
  const navigate = useNavigate();

  // Effect 1: ONLY for initializing state from the loader. Runs once.
  useEffect(() => {
    if (userProfile?.images) {
      setImages(userProfile.images);
      if (userProfile.images.length > 0) {
        setPreview(userProfile.images[userProfile.images.length - 1]);
      }
    }
  }, [userProfile]); // <-- Dependency array only has userProfile

  // Effect 2: ONLY for cleaning up the new image blob URL.
  useEffect(() => {
    // This is the cleanup function. It runs when the component unmounts
    // or when newImage changes (cleaning up the *previous* one).
    return () => {
      if (newImage) {
        URL.revokeObjectURL(newImage);
      }
    };
  }, [newImage]); // <-- Dependency array only has newImage

  const handleRemoveImage = (url: string) => {
    setImages((prev) => prev.filter((img) => img !== url));
    setImagesToDelete((prev) => [...prev, url]);
    if (preview === url) {
      const remainingImages = images.filter((img) => img !== url);
      setPreview(
        remainingImages.length > 0
          ? remainingImages[remainingImages.length - 1]
          : newImage
            ? newImage
            : undefined
      );
    }
  };

  const handleRemoveNewImage = () => {
    if (newImage) {
      URL.revokeObjectURL(newImage);
    }
    setNewImageFile(undefined);
    setNewImage(undefined);
    if (preview === newImage) {
      setPreview(images.length > 0 ? images[images.length - 1] : undefined);
    }
    // 3. Reset the file input's value
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSelectImage = (url: string) => {
    setPreview(url);
  };

  const handleUploadNewImage = (file: File | undefined) => {
    // console.log("handleUploadNewImage called with file:", file);
    // Clear previous errors first
    setFileError(null);
    setUpdateUserProfileResult(null);

    if (!file) {
      handleRemoveNewImage();
      return;
    }

    // Validate the file type and size
    const validationResult = imageFileSchema.safeParse(file);
    if (!validationResult.success) {
      setFileError(validationResult.error.issues[0].message);
      return;
    }
    // If validation passes, proceed with setting the new image
    if (newImage) {
      // Revoke the previous object URL to free up memory
      URL.revokeObjectURL(newImage);
    }

    // Proceed with setting the new image
    const previewUrl = URL.createObjectURL(file);
    console.log("New image URL:", previewUrl);
    setNewImageFile(file);
    setNewImage(previewUrl);
    setPreview(previewUrl);
  };

  const handleFormSubmit = async (data: UserProfileFormData) => {
    setIsSubmitting(true);
    // console.log("Form Data Received:", data);
    // console.log("New Image File to Upload:", newImageFile);
    // console.log("Images Marked for Deletion:", imagesToDelete);

    const formData = new FormData();

    // 1. Append the new image file if it exists.
    // The field name 'newImage' must match what your multer middleware expects on the route.
    if (newImageFile) {
      formData.append("new_profile_image", newImageFile);
    }

    // 2. Append the list of images to delete as a JSON string.
    if (imagesToDelete.length > 0) {
      formData.append("imagesToDelete", JSON.stringify(imagesToDelete));
    }

    // 3. Append each text field individually.
    // Use a loop to avoid many 'if (data.field)' checks.
    for (const key in data) {
      const value = data[key as keyof UserProfileFormData];

      // Skip the newImage field from the form data, as it's handled separately.
      if (key === "newImage") continue;

      if (value !== undefined && value !== null) {
        // 4. IMPORTANT: Stringify arrays/objects before appending.
        if (
          Array.isArray(value) ||
          (typeof value === "object" && value !== null)
        ) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    }

    // The images field is probably modified by the user and can be empty if user removed all images, so we need to append it as a JSON string to set the database no matter what.
    formData.append("images", JSON.stringify(images));

    console.log("--- FormData to be sent ---");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
    console.log("---------------------------");

    // setTimeout(() => setIsSubmitting(false), 2000); // Simulate network request
    const res = await updateUserProfile(formData);
    const updateUserProfileResult = await res.json();
    if (!res.ok) {
      setUpdateUserProfileResult({
        error: updateUserProfileResult.error || "Unknown error",
      });
      setIsSubmitting(false);
      return;
    }
    setUpdateUserProfileResult(updateUserProfileResult);
    toast.success("Profile updated successfully.", {
      className: cn(
        // "text-shadow-energon-cyan",
        "font-special",
        "justify-center",
        "p-8",
        "m-auto",
        "rounded-lg",
        "min-w-md",
        "max-w-1/2"
        // "border-4"
      ),
      style: {
        fontSize: "1.25rem",
      },
      // action: {
      //   label: "OK",
      //   onClick: () => navigate("/user/my-profile"), // Redirect to the dashboard or any other page after successful update
      // },
      onAutoClose: () => {
        navigate("/user/my-profile");
      }, // Redirect after auto-close
      // style: {
      //   minWidth: "200px",
      //   maxWidth: "50vw",
      //   fontSize: "1.25rem",
      //   borderRadius: "0.5rem",
      //   whiteSpace: "pre-line", // or "normal" for standard wrapping
      //   textAlign: "center", // optional: center the text
      //   margin: "auto",
      //   boxSizing: "border-box",
      // },
    });
    setIsSubmitting(false);

    console.log("Response from updateUserProfile:", updateUserProfileResult);
  };

  if (localStorage.getItem("token") === null) {
    console.warn("No auth token found in localStorage.");
    return <Navigate to="/auth/sign-in" replace />;
  }
  if (!userProfile) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
      {/* --- LEFT COLUMN --- */}
      <div className="md:col-span-2 space-y-6">
        <div>
          <h3 className="text-lg font-medium">Profile Images</h3>
          {/* <p className="text-sm text-muted-foreground">
            Manage your profile images.
          </p> */}
        </div>

        <div className="flex items-center justify-center p-4 border rounded-lg min-h-80 ">
          {preview ? (
            <img
              src={preview}
              alt="Selected preview"
              className="object-contain rounded-lg max-h-80"
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              <SquareUserRound
                className="justify-center mx-auto mb-6 stroke-1"
                size={200}
              />
              Select an image below or upload a new one to see a preview.
            </p>
          )}
        </div>

        <ImageThumbnails
          images={images}
          newImage={newImage}
          onRemove={handleRemoveImage}
          onRemoveNew={handleRemoveNewImage}
          onSelect={handleSelectImage}
          selectedImage={preview}
        />

        <div className="space-y-2">
          <Label htmlFor="picture">Upload New Profile Image</Label>
          <Input
            ref={fileInputRef}
            id="picture"
            type="file"
            accept="image/*"
            onChange={(e) => handleUploadNewImage(e.target.files?.[0])}
            disabled={isSubmitting}
          />
          {fileError && (
            <p className="text-sm font-medium text-destructive">{fileError}</p>
          )}
          {updateUserProfileResult && "error" in updateUserProfileResult && (
            <p className="text-sm font-medium text-destructive">
              {updateUserProfileResult.error}
            </p>
          )}
        </div>
      </div>

      {/* --- RIGHT COLUMN --- */}
      <div className="md:col-span-3">
        <UserProfileForm
          userProfile={userProfile}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
