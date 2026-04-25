"use client";

import { useId, useState } from "react";

type AnimalImageUploaderProps = {
  value: string[];
  onChange: (value: string[]) => void;
};

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error(`Unable to read ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

export default function AnimalImageUploader({ value, onChange }: AnimalImageUploaderProps) {
  const inputId = useId();
  const [isUploading, setIsUploading] = useState(false);

  async function handleFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    setIsUploading(true);

    try {
      const uploaded = await Promise.all(files.map((file) => fileToDataUrl(file)));
      onChange([...value, ...uploaded]);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  function removeImage(index: number) {
    onChange(value.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-800">Animal photos</p>
          <p className="text-xs text-slate-500">Add one or more images before saving.</p>
        </div>
        <label
          htmlFor={inputId}
          className="inline-flex cursor-pointer items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          {isUploading ? "Uploading..." : "Choose files"}
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFilesChange}
          className="sr-only"
        />
      </div>

      {value.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((imageUrl, index) => (
            <div key={`${imageUrl}-${index}`} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <img src={imageUrl} alt={`Animal upload preview ${index + 1}`} className="h-28 w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute right-2 top-2 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-white"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          No images selected yet.
        </div>
      )}
    </div>
  );
}
