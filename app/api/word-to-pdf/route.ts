import { checkUsage } from "../lib/usageLimits";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await checkUsage("FREE");

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const apiKey = process.env.CLOUDCONVERT_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "CloudConvert API key missing" },
      { status: 500 }
    );
  }

  try {
    // STEP 1 — Create job
    const jobRes = await fetch("https://api.cloudconvert.com/v2/jobs", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tasks: {
          "upload-file": {
            operation: "import/upload",
          },
          "convert-file": {
            operation: "convert",
            input: "upload-file",
            input_format: "docx",
            output_format: "pdf",
          },
          "export-file": {
            operation: "export/url",
            input: "convert-file",
          },
        },
      }),
    });

    const jobData = await jobRes.json();

    const uploadTask = jobData.data.tasks.find(
      (t: any) => t.name === "upload-file"
    );

    // STEP 2 — Upload file
    const uploadForm = new FormData();

    Object.entries(uploadTask.result.form.parameters).forEach(([k, v]) =>
      uploadForm.append(k, v as string)
    );

    uploadForm.append("file", file);

    await fetch(uploadTask.result.form.url, {
      method: "POST",
      body: uploadForm,
    });

    // STEP 3 — Wait for conversion
    let finished = false;
    let exportUrl = "";

    while (!finished) {
      const statusRes = await fetch(
        `https://api.cloudconvert.com/v2/jobs/${jobData.data.id}`,
        {
          headers: { Authorization: `Bearer ${apiKey}` },
        }
      );

      const statusData = await statusRes.json();

      const exportTask = statusData.data.tasks.find(
        (t: any) => t.name === "export-file"
      );

      if (exportTask.status === "finished") {
        exportUrl = exportTask.result.files[0].url;
        finished = true;
      } else if (exportTask.status === "error") {
        throw new Error("Conversion failed");
      }

      await new Promise((r) => setTimeout(r, 2000));
    }

    // STEP 4 — Download PDF
    const pdfRes = await fetch(exportUrl);
    const pdfBuffer = await pdfRes.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=converted.pdf",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Conversion failed" },
      { status: 500 }
    );
  }
}
