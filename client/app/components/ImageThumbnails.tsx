import { Check, X } from "lucide-react";
import { cn } from "~/lib/utils";

type ImageThumbnailsProps = {
  images: string[];
  newImage?: string; // 1. Add prop for the new image preview
  onRemove: (url: string) => void;
  onRemoveNew: () => void; // 2. Add a specific handler for removing the new image
  onSelect: (url: string) => void;
  selectedImage: string | undefined;
};

export function ImageThumbnails({
  images,
  newImage,
  onRemove,
  onRemoveNew,
  onSelect,
  selectedImage,
}: ImageThumbnailsProps) {
  if (images.length === 0 && !newImage) {
    return <p className="text-sm text-muted-foreground">No profile images.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2 p-2 border rounded-md">
      {/* Render existing images */}
      {images.map((url, index) => (
        <div key={url} className="relative">
          <img
            src={url}
            alt={`Thumbnail ${index + 1}`}
            className={cn(
              "h-20 w-20 object-cover rounded-md cursor-pointer border-2",
              selectedImage === url ? "border-blue-500" : "border-transparent"
            )}
            onClick={() => onSelect(url)}
          />
          <button
            type="button"
            onClick={() => onRemove(url)}
            className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 -translate-y-1/2 translate-x-1/2 bg-red-600 rounded-full text-white hover:bg-red-700 focus:outline-none"
            aria-label="Remove image"
          >
            <X size={14} />
          </button>
          {selectedImage === url && (
            <div>
              <div
                className="absolute inset-0 flex items-center justify-center bg-accent-foreground opacity-20 rounded-md"
                aria-label="Selected image"
              ></div>
              <div
                className="absolute inset-0 flex items-center justify-center  rounded-md"
                aria-label="Selected image"
              >
                <Check className="text-white" size={60} />
              </div>
            </div>
          )}
        </div>
      ))}
      {/* 3. Render the new image thumbnail if it exists */}
      {newImage && (
        <div key={newImage} className="relative">
          <img
            src={newImage}
            alt="New image thumbnail"
            className={cn(
              "h-20 w-20 object-cover rounded-md cursor-pointer border-2",
              selectedImage === newImage
                ? "border-blue-500"
                : "border-transparent"
            )}
            onClick={() => onSelect(newImage)}
          />
          <button
            type="button"
            onClick={onRemoveNew}
            className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 -translate-y-1/2 translate-x-1/2 bg-red-600 rounded-full text-white hover:bg-red-700 focus:outline-none"
            aria-label="Remove new image"
          >
            <X size={14} />
          </button>
          {selectedImage === newImage && (
            <div>
              <div
                className="absolute inset-0 flex items-center justify-center bg-accent-foreground opacity-20 rounded-md"
                aria-label="Selected image"
              ></div>
              <div
                className="absolute inset-0 flex items-center justify-center  rounded-md"
                aria-label="Selected image"
              >
                <Check className="text-white" size={60} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
