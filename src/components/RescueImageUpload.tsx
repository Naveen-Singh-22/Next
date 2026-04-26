"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type PreviewItem = {
  file: File;
  url: string;
};

type RescueImageUploadProps = {
  onImageChange?: (imageDataUrl: string | null) => void;
};

const MAX_FILE_SIZE_BYTES = 3 * 1024 * 1024;

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Unsupported image format."));
    };

    reader.onerror = () => {
      reject(new Error("Unable to read the selected image."));
    };

    reader.readAsDataURL(file);
  });
}

export default function RescueImageUpload({ onImageChange }: RescueImageUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previews, setPreviews] = useState<PreviewItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  useEffect(() => {
    return () => {
      previews.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [previews]);

  const updateFiles = async (fileList: FileList | File[]) => {
    const nextFile = Array.from(fileList).find((file) => file.type.startsWith("image/"));

    if (!nextFile) {
      setUploadMessage("Please select a valid image file.");
      onImageChange?.(null);
      return;
    }

    if (nextFile.size > MAX_FILE_SIZE_BYTES) {
      setUploadMessage("Image is too large. Please upload a file smaller than 3MB.");
      onImageChange?.(null);
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(nextFile);

      setPreviews((current) => {
        current.forEach((item) => URL.revokeObjectURL(item.url));
        return [
          {
            file: nextFile,
            url: URL.createObjectURL(nextFile),
          },
        ];
      });

      setUploadMessage("Image ready and will be submitted with this report.");
      onImageChange?.(dataUrl);
    } catch {
      setUploadMessage("Could not process the selected image. Try another file.");
      onImageChange?.(null);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }

    void updateFiles(event.target.files);
  };

  const handleDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (event.dataTransfer.files.length > 0) {
      void updateFiles(event.dataTransfer.files);
    }
  };

  const openPicker = () => {
    inputRef.current?.click();
  };

  const fileSummary = previews.length
    ? `${previews.length} image selected`
    : "Drag and drop or click to upload";

  return (
    <div className="upload-shell">
      <button
        className={`upload-box${isDragging ? " is-dragging" : ""}${previews.length ? " has-files" : ""}`}
        type="button"
        onClick={openPicker}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
      >
        <span className="upload-icon">📷</span>
        <strong>Photo Upload (Optional)</strong>
        <small>{fileSummary}</small>
        <span className="upload-hint">PNG, JPG, WebP, and HEIC images are supported. Max 3MB.</span>
      </button>

      <input
        ref={inputRef}
        accept="image/*"
        className="upload-input"
        onChange={handleChange}
        type="file"
      />

      {uploadMessage ? <p className="upload-status-text">{uploadMessage}</p> : null}

      {previews.length > 0 && (
        <div className="upload-preview-grid" aria-label="Selected image previews">
          {previews.map((item) => (
            <figure key={`${item.file.name}-${item.file.lastModified}`} className="upload-preview-card">
              <Image
                alt={item.file.name}
                className="upload-preview-image"
                height={180}
                src={item.url}
                unoptimized
                width={180}
              />
              <figcaption>{item.file.name}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
