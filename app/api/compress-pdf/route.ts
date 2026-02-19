import { checkUsage } from "../lib/usageLimits";
import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(req: Request) {
  await checkUsage("FREE");

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  const pdfDoc = await PDFDocument.load(bytes, {
    ignoreEncryption: true,
  });

  const compressedBytes = await pdfDoc.save({
    useObjectStreams: true,
  });

  return new NextResponse(Buffer.from(compressedBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=compressed.pdf",
    },
  });
}
