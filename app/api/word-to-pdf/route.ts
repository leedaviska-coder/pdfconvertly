import { checkUsage } from "../lib/usageLimits";
import { NextResponse } from "next/server";
import CloudConvert from "cloudconvert";

export async function POST(req: Request) {
  await checkUsage("FREE");

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const apiKey = process.env.CLOUDCONVERT_API_KEY!;
  const cloudConvert = new CloudConvert(apiKey);

  try {
    const job = await cloudConvert.jobs.create({
      tasks: {
        upload: {
          operation: "import/upload",
        },
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
    });

    const uploadTask = job.tasks.find(t => t.name === "upload")!;
    const buffer = Buffer.from(await file.arrayBuffer());

    await cloudConvert.tasks.upload(uploadTask, buffer, file.name);

    const completedJob = await cloudConvert.jobs.wait(job.id);

    const exportTask = completedJob.tasks.find(
      t => t.name === "export" && t.status === "finished"
    );

    const fileUrl = exportTask?.result?.files?.[0]?.url;
    if (!fileUrl) throw new Error("No file URL");

    const response = await fetch(fileUrl);
    const pdfBuffer = await response.arrayBuffer();

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
