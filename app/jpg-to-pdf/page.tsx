"use client";

import { useState } from "react";

export default function JpgPngToPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const convert = async () => {
    if (!files.length) return;
    setLoading(true);

    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));

    const res = await fetch("/api/jpg-to-pdf", {
      method: "POST",
      body: fd,
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "images.pdf";
    a.click();

    URL.revokeObjectURL(url);
    setLoading(false);
  };

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/png"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files || []))}
      />
      <button onClick={convert} disabled={loading}>
        {loading ? "Converting..." : "Convert to PDF"}
      </button>
    </div>
  );
}
