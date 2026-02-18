"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";

type PageItem = {
  page: number;
  rotation: number;
};

export default function OrganizePdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [] },
    multiple: false,
    onDrop: async (acceptedFiles) => {
      const pdf = acceptedFiles[0];
      setFile(pdf);

      const buffer = await pdf.arrayBuffer();
      const res = await fetch("/api/organize-pdf", {
        method: "POST",
        body: buffer,
        headers: { "x-action": "analyze" },
      });

      const data = await res.json();
      setPages(data.pages.map((p: number) => ({ page: p, rotation: 0 })));
    },
  });

  const move = (from: number, to: number) => {
    const updated = [...pages];
    const [item] = updated.splice(from, 1);
    updated.splice(to, 0, item);
    setPages(updated);
  };

  const rotate = (index: number) => {
    const updated = [...pages];
    updated[index].rotation = (updated[index].rotation + 90) % 360;
    setPages(updated);
  };

  const organize = async () => {
    if (!file) return;
    setLoading(true);

    const form = new FormData();
    form.append("file", file);
    form.append("pages", JSON.stringify(pages));

    const res = await fetch("/api/organize-pdf", {
      method: "POST",
      body: form,
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "organized.pdf";
    a.click();

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div
        {...getRootProps()}
        className="border-2 border-dashed p-6 text-center cursor-pointer"
      >
        <input {...getInputProps()} />
        <p>Drop PDF here or click to upload</p>
      </div>

      {pages.length > 0 && (
        <>
          <div className="grid grid-cols-4 gap-4 mt-6">
            {pages.map((p, i) => (
              <div key={i} className="border p-3 text-center">
                <p>Page {p.page}</p>
                <p>{p.rotation}°</p>

                <button onClick={() => rotate(i)}>Rotate</button>

                <div className="flex justify-between mt-2">
                  <button disabled={i === 0} onClick={() => move(i, i - 1)}>
                    ←
                  </button>
                  <button
                    disabled={i === pages.length - 1}
                    onClick={() => move(i, i + 1)}
                  >
                    →
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={organize}
            disabled={loading}
            className="mt-6 px-4 py-2 bg-black text-white"
          >
            {loading ? "Processing..." : "Organize PDF"}
          </button>
        </>
      )}
    </div>
  );
}
