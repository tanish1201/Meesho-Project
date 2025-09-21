import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
}

interface UploadDropzoneProps {
  onImagesChange: (images: UploadedImage[]) => void;
  maxFiles?: number;
  className?: string;
}

export function UploadDropzone({ 
  onImagesChange, 
  maxFiles = 6, 
  className 
}: UploadDropzoneProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.slice(0, maxFiles - images.length).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
    }));
    
    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);
    onImagesChange(updatedImages);
  }, [images, maxFiles, onImagesChange]);

  const removeImage = (id: string) => {
    const updatedImages = images.filter((img) => img.id !== id);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const reorderImages = (dragIndex: number, hoverIndex: number) => {
    const draggedImage = images[dragIndex];
    const updatedImages = [...images];
    updatedImages.splice(dragIndex, 1);
    updatedImages.splice(hoverIndex, 0, draggedImage);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: maxFiles - images.length,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive 
            ? "border-primary bg-primary/5" 
            : "border-border hover:border-primary/50 hover:bg-primary/5",
          images.length >= maxFiles && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} disabled={images.length >= maxFiles} />
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {isDragActive ? "Drop images here" : "Drag & drop images"}
            </p>
            <p className="text-xs text-muted-foreground">
              or click to browse • {images.length}/{maxFiles} uploaded
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, WebP up to 5MB each
            </p>
          </div>
        </div>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div 
              key={image.id} 
              className="relative group bg-card rounded-lg overflow-hidden border border-border shadow-sm hover:shadow-md transition-all"
            >
              <div className="aspect-square bg-muted">
                <img
                  src={image.preview}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center">
                          <div class="text-center">
                            <ImageIcon class="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p class="text-xs text-muted-foreground">Error loading image</p>
                          </div>
                        </div>
                      `;
                    }
                  }}
                />
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              
              {/* Remove Button */}
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(image.id)}
              >
                <X className="h-3 w-3" />
              </Button>
              
              {/* Image Number */}
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                #{index + 1}
              </div>
              
              {/* File Info */}
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/70 text-white text-xs px-2 py-1 rounded max-w-20 truncate">
                  {(image.file.size / 1024 / 1024).toFixed(1)}MB
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}