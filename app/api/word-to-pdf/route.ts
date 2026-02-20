import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const apiKey = process.env.CLOUDCONVERT_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing API key" },
        { status: 500 }
      );
    }

    // 1️⃣ Create job
    const jobRes = await fetch(
      "https://api.cloudconvert.com/v2/jobs",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tasks: {
            "import-file": {
              operation: "import/upload",
            },
            "convert-file": {
              operation: "convert",
              input: "import-file",
              output_format: "pdf",
            },
            "export-file": {
              operation: "export/url",
              input: "convert-file",
            },
          },
        }),
      }
    );

    const jobData = await jobRes.json();

    const uploadTask = jobData.data.tasks.find(
      (t: any) => t.name === "import-file"
    );

    // 2️⃣ Upload file
    const uploadForm = new FormData();
    Object.entries(uploadTask.result.form.parameters).forEach(
      ([key, value]) => uploadForm.append(key, value as string)
    );
    uploadForm.append("file", file);

    await fetch(uploadTask.result.form.url, {
      method: "POST",
      body: uploadForm,
    });

    // 3️⃣ Wait for conversion
    const exportTask = jobData.data.tasks.find(
      (t: any) => t.name === "export-file"
    );

    const fileUrl = exportTask.result.files[0].url;

    // 4️⃣ Download PDF
    const pdfRes = await fetch(fileUrl);
    const pdfBuffer = await pdfRes.arrayBuffer();

    return new NextResponse(pdfBuffer, {
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
