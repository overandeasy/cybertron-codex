import { useState, useEffect } from "react";
import { useRouteLoaderData } from "react-router";
import { UserProfileForm } from "~/components/UserProfileForm";
import { ImageThumbnails } from "~/components/ImageThumbnails";
import type { clientLoader } from "../appLayout";

export default function EditMyProfile() {
  const loaderData = useRouteLoaderData("routes/appLayout");
  const userProfile = loaderData?.userProfile;

  const [images, setImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | undefined>();
  const [newImageFile, setNewImageFile] = useState<File | undefined>();
  const [newImagePreview, setNewImagePreview] = useState<string | undefined>();

  useEffect(() => {
    if (userProfile?.images) {
      setImages(userProfile.images);
      if (userProfile.images.length > 0) {
        setPreview(userProfile.images[userProfile.images.length - 1]);
      }
    }
    return () => {
      if (newImagePreview) {
        URL.revokeObjectURL(newImagePreview);
      }
    };
  }, [userProfile]);

  const handleRemoveImage = (url: string) => {
    setImages((prev) => prev.filter((img) => img !== url));
    setImagesToDelete((prev) => [...prev, url]);
    if (preview === url) {
      setPreview(undefined);
    }
  };

  const handleRemoveNewImage = () => {
    if (newImagePreview) {
      URL.revokeObjectURL(newImagePreview);
    }
    setNewImageFile(undefined);
    setNewImagePreview(undefined);
    if (preview === newImagePreview) {
      setPreview(images.length > 0 ? images[images.length - 1] : undefined);
    }
  };

  const handleSelectImage = (url: string) => {
    setPreview(url);
  };

  const handleNewImageSelect = (file: File | undefined) => {
    if (newImagePreview) {
      URL.revokeObjectURL(newImagePreview);
    }

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setNewImageFile(file);
      setNewImagePreview(previewUrl);
      setPreview(previewUrl);
    } else {
      handleRemoveNewImage();
    }
  };

  if (!userProfile) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile Images</h3>
        <p className="text-sm text-muted-foreground">
          Manage your profile images. Click a thumbnail to preview it.
        </p>
      </div>

      {/* This is the new section for the large image preview */}
      <div className="flex items-center justify-center p-4 border rounded-lg min-h-80 bg-muted/30">
        {preview ? (
          <img
            src={preview}
            alt="Selected preview"
            className="object-contain rounded-lg max-h-80"
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Select an image below or upload a new one to see a preview.
          </p>
        )}
      </div>

      <ImageThumbnails
        images={images}
        newImagePreview={newImagePreview}
        onRemove={handleRemoveImage}
        onRemoveNew={handleRemoveNewImage}
        onSelect={handleSelectImage}
        selectedImage={preview}
      />

      <hr />

      <UserProfileForm
        userProfile={userProfile}
        onNewImageSelect={handleNewImageSelect}
      />
    </div>
  );
}
