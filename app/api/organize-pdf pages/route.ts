import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(req: Request) {
  const buffer = await req.arrayBuffer();
  const pdf = await PDFDocument.load(buffer);

  return NextResponse.json({
    pages: Array.from({ length: pdf.getPageCount() }, (_, i) => i),
  });
}
