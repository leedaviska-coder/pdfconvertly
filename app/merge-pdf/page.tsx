"use client";

import { useRef, useState } from "react";

export default function MergePdfPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);

    setFiles((prev) => [...prev, ...selectedFiles]);

    // reset input so same file can be added again if needed
    e.target.value = "";
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Merge PDF</h1>
      <p>Add multiple PDF files and merge them into one.</p>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
      >
        ➕ Add PDF
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        multiple
        hidden
        onChange={handleFileChange}
      />

      <ul style={{ marginTop: 20 }}>
        {files.map((file, index) => (
          <li key={index}>
            {file.name}{" "}
            <button
              type="button"
              onClick={() => removeFile(index)}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>

      {files.length > 1 && (
        <form
          action="/api/merge-pdf"
          method="post"
          encType="multipart/form-data"
        >
          <input
            type="file"
            name="files"
            multiple
            hidden
            ref={(el) => {
              if (!el) return;

              const dt = new DataTransfer();
              files.forEach((file) => dt.items.add(file));
              el.files = dt.files;
            }}
          />

          <button type="submit" style={{ marginTop: 20 }}>
            Merge PDFs
          </button>
        </form>
      )}
    </main>
  );
}
