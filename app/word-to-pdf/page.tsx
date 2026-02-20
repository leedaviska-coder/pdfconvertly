"use client";

import { useState } from "react";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);

  const upload = async () => {
    if (!file) return alert("Select a file");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/word-to-pdf", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      alert("Conversion failed");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "converted.pdf";
    a.click();
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Word → PDF</h1>

      <input
        type="file"
        accept=".doc,.docx"
        onChange={(e) =>
          setFile(e.target.files?.[0] || null)
        }
      />

      <br /><br />

      <button onClick={upload}>
        Convert
      </button>
    </div>
  );
}
