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

    const createJob = await fetch("https://api.cloudconvert.com/v2/jobs", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        tasks: {
          "import-file": {
            operation: "import/upload"
          },
          "convert-file": {
            operation: "convert",
            input: "import-file",
            output_format: "pdf"
          },
          "export-file": {
            operation: "export/url",
            input: "convert-file"
          }
        }
      })
    });

    const job = await createJob.json();
    const uploadTask = job.data.tasks.find((t: any) => t.name === "import-file");

    const uploadForm = new FormData();
    Object.entries(uploadTask.result.form.parameters).forEach(([k, v]: any) =>
      uploadForm.append(k, v)
    );
    uploadForm.append("file", file);

    await fetch(uploadTask.result.form.url, {
      method: "POST",
      body: uploadForm
    });

    let status = "processing";
    let exportTask;

    while (status === "processing") {
      await new Promise(r => setTimeout(r, 2000));

      const check = await fetch(`https://api.cloudconvert.com/v2/jobs/${job.data.id}`, {
        headers: { Authorization: `Bearer ${apiKey}` }
      });

      const updated = await check.json();
      status = updated.data.status;
      exportTask = updated.data.tasks.find((t: any) => t.name === "export-file");
    }

    const fileUrl = exportTask.result.files[0].url;
    const pdf = await fetch(fileUrl);
    const buffer = await pdf.arrayBuffer();

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=converted.pdf"
      }
    });
  } catch {
    return NextResponse.json({ error: "Conversion failed" }, { status: 500 });
  }
}