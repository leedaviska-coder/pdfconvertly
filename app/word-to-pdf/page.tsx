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