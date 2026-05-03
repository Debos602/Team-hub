"use client";

import { useState, useEffect } from "react";

export default function AvatarUpload({ currentAvatar, name, onFileSelect }) {
  const [preview, setPreview] = useState(currentAvatar);
  const [file, setFile] = useState(null);

  useEffect(() => {
    setPreview(currentAvatar);
  }, [currentAvatar]);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      if (typeof onFileSelect === "function") onFileSelect(selected);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(selected);
    }
  };

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <img
        
          src={preview || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=random`}
          alt="Avatar"
          className="h-24 w-24 rounded-full border-4 border-[var(--border)] object-cover"
        />
        {file && (
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-green-500 px-2 py-0.5 text-xs text-white">
            New
          </span>
        )}
      </div>
      <div>
        <label className="cursor-pointer rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)] hover:opacity-90">
          Upload Photo
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          JPG, PNG. Max 2MB. (Preview only in demo)
        </p>
      </div>
    </div>
  );
}
