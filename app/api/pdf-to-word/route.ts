import { checkUsage } from "../lib/usageLimits";

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

// LibreOffice path (Windows)
const SOFFICE_PATH = "C:\\Program Files\\LibreOffice\\program\\soffice.exe";

export async function POST(req: Request) {
  try {
    await checkUsage("FREE");

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Temp directory
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pdf-to-word-"));
    const inputPdf = path.join(tempDir, "input.pdf");

    // Save PDF
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(inputPdf, buffer);

    // 🔥 IMPORTANT FIX: force PDF import filter
    await execFileAsync(SOFFICE_PATH, [
      "--headless",
      "--infilter=writer_pdf_import",
      "--convert-to",
      "docx",
      "--outdir",
      tempDir,
      inputPdf,
    ]);

    // Find output
    const files = fs.readdirSync(tempDir);
    const docx = files.find((f) => f.endsWith(".docx"));

    if (!docx) {
      throw new Error("LibreOffice ran but produced no DOCX");
    }

    const docxPath = path.join(tempDir, docx);
    const output = fs.readFileSync(docxPath);

    return new Response(output, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="converted.docx"',
      },
    });
  } catch (err: any) {
    console.error("PDF → Word error:", err);
    return NextResponse.json(
      { error: err.message || "Conversion failed" },
      { status: 500 }
    );
  }
}
