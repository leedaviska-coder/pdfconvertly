

import { checkUsage } from "../lib/usageLimits";

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(req: NextRequest) {
  try {
    await checkUsage("FREE");

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length < 2) {
      return NextResponse.json(
        { error: "Please upload at least two PDF files" },
        { status: 400 }
      );
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const pages = await mergedPdf.copyPages(
        pdf,
        pdf.getPageIndices()
      );
      pages.forEach((page) => mergedPdf.addPage(page));
    }

    // 🔑 CRITICAL FIX: convert Uint8Array → Buffer
    const mergedPdfBytes = Buffer.from(await mergedPdf.save());

    return new NextResponse(mergedPdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="merged.pdf"',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Merge failed" },
      { status: 500 }
    );
  }
}
