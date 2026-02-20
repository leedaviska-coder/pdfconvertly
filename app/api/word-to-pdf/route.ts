import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.CLOUDCONVERT_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const jobRes = await fetch("https://api.cloudconvert.com/v2/jobs", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        tasks: {
          upload: { operation: "import/upload" },
          convert: {
            operation: "convert",
            input: "upload",
            output_format: "pdf"
          },
          export: {
            operation: "export/url",
            input: "convert"
          }
        }
      })
    });

    const job = await jobRes.json();
    const uploadTask = job.data.tasks.find((t: any) => t.name === "upload");

    const uploadForm = new FormData();
    Object.entries(uploadTask.result.form.parameters).forEach(([k, v]: any) =>
      uploadForm.append(k, v)
    );
    uploadForm.append("file", file);

    await fetch(uploadTask.result.form.url, {
      method: "POST",
      body: uploadForm
    });

    return NextResponse.json({
      downloadUrl: `https://api.cloudconvert.com/v2/jobs/${job.data.id}`
    });
  } catch {
    return NextResponse.json({ error: "Conversion failed" }, { status: 500 });
  }
}