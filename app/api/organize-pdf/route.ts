
import { checkUsage } from "../lib/usageLimits";

import { PDFDocument, degrees } from "pdf-lib";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await checkUsage("FREE");

  const action = req.headers.get("x-action");

  if (action === "analyze") {
    const buffer = await req.arrayBuffer();
    const pdf = await PDFDocument.load(buffer);
    const pages = Array.from(
      { length: pdf.getPageCount() },
      (_, i) => i + 1
    );
    return NextResponse.json({ pages });
  }

  const form = await req.formData();
  const file = form.get("file") as File;
  const pagesOrder = JSON.parse(form.get("pages") as string);

  const srcBytes = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(srcBytes);
  const newPdf = await PDFDocument.create();

  for (const item of pagesOrder) {
    const pageIndex = item.page - 1;
    const [page] = await newPdf.copyPages(srcPdf, [pageIndex]);

    if (item.rotation > 0) {
      page.setRotation(degrees(item.rotation));
    }

    newPdf.addPage(page);
  }

  const pdfBytes = await newPdf.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=organized.pdf",
    },
  });
}
