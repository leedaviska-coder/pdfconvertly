"use client";
import { useState } from "react";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);

  const convert = async () => {
    if (!file) return;

    const data = new FormData();
    data.append("file", file);

    const res = await fetch("/api/word-to-pdf", {
      method: "POST",
      body: data
    });

    const json = await res.json();

    if (!res.ok) {
      alert("Conversion failed");
      return;
    }

    window.open(json.downloadUrl, "_blank");
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Word to PDF</h2>

      <input
        type="file"
        accept=".doc,.docx"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <br /><br />

      <button onClick={convert}>Convert</button>
    </div>
  );
}