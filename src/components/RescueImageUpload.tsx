"use client";

import { useEffect, useRef, useState } from "react";

type PreviewItem = {
  file: File;
  url: string;
};

export default function RescueImageUpload() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previews, setPreviews] = useState<PreviewItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    return () => {
      previews.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [previews]);

  const updateFiles = (fileList: FileList | File[]) => {
    const nextFiles = Array.from(fileList).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (nextFiles.length === 0) {
      return;
    }

    setPreviews((current) => {
      current.forEach((item) => URL.revokeObjectURL(item.url));
      return nextFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }

    updateFiles(event.target.files);
  };

  const handleDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (event.dataTransfer.files.length > 0) {
      updateFiles(event.dataTransfer.files);
    }
  };

  const openPicker = () => {
    inputRef.current?.click();
  };

  const fileSummary = previews.length
    ? `${previews.length} image${previews.length === 1 ? "" : "s"} selected`
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
        <span className="upload-hint">PNG, JPG, WebP, and HEIC images are supported.</span>
      </button>

      <input
        ref={inputRef}
        accept="image/*"
        className="upload-input"
        multiple
        onChange={handleChange}
        type="file"
      />

      {previews.length > 0 && (
        <div className="upload-preview-grid" aria-label="Selected image previews">
          {previews.map((item) => (
            <figure key={`${item.file.name}-${item.file.lastModified}`} className="upload-preview-card">
              <img alt={item.file.name} src={item.url} />
              <figcaption>{item.file.name}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
