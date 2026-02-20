import { checkUsage } from "../lib/usageLimits";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await checkUsage("FREE");

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const apiKey = process.env.CLOUDCONVERT_API_KEY!;
  const buffer = await file.arrayBuffer();

  try {
    // 1️⃣ Create job
    const jobRes = await fetch("https://api.cloudconvert.com/v2/jobs", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tasks: {
          upload: { operation: "import/upload" },
          convert: {
            operation: "convert",
            input: "upload",
            input_format: "docx",
            output_format: "pdf",
          },
          export: {
            operation: "export/url",
            input: "convert",
          },
        },
      }),
    });

    const jobData = await jobRes.json();

    const uploadTask = jobData.data.tasks.find(
      (t: any) => t.name === "upload"
    );

    if (!uploadTask) throw new Error("Upload task missing");

    // 2️⃣ Upload file
    const form = new FormData();
    Object.entries(uploadTask.result.form.parameters).forEach(([k, v]) =>
      form.append(k, v as string)
    );
    form.append("file", new Blob([buffer]), file.name);

    await fetch(uploadTask.result.form.url, {
      method: "POST",
      body: form,
    });

    // 3️⃣ Wait until job finishes (polling)
    const jobId = jobData.data.id;

    let exportTask;
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 1500));

      const statusRes = await fetch(
        `https://api.cloudconvert.com/v2/jobs/${jobId}`,
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );

      const statusData = await statusRes.json();

      exportTask = statusData.data.tasks.find(
        (t: any) => t.name === "export" && t.status === "finished"
      );

      if (exportTask) break;
    }

    const fileUrl = exportTask?.result?.files?.[0]?.url;
    if (!fileUrl) throw new Error("Conversion not finished");

    // 4️⃣ Download PDF
    const pdfRes = await fetch(fileUrl);
    const pdfBuffer = await pdfRes.arrayBuffer();

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=converted.pdf",
      },
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Conversion failed" },
      { status: 500 }
    );
  }
}
