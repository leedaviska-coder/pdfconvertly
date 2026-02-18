"use client";

import { useState } from "react";

export default function CompressPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState("screen");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("quality", quality);

    const res = await fetch("/api/compress-pdf", {
      method: "POST",
      body: formData,
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "compressed.pdf";
    a.click();

    URL.revokeObjectURL(url);
    setLoading(false);
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Compress PDF</h1>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <select
        value={quality}
        onChange={(e) => setQuality(e.target.value)}
      >
        <option value="screen">screen</option>
        <option value="ebook">ebook</option>
        <option value="printer">printer</option>
        <option value="prepress">prepress</option>
      </select>

      <button onClick={submit} disabled={loading}>
        {loading ? "Compressing..." : "Compress PDF"}
      </button>
    </div>
  );
}
