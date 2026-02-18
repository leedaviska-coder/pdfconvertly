import { checkUsage } from "../lib/usageLimits";

import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import path from "path";
import fs from "fs/promises";
import os from "os";

function run(cmd: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    execFile(cmd, args, (err) => (err ? reject(err) : resolve()));
  });
}

export async function POST(req: NextRequest) {
 await checkUsage("FREE");

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "word2pdf-"));

  const inputPath = path.join(dir, file.name);
  await fs.writeFile(inputPath, buffer);

  const soffice =
    process.platform === "win32"
      ? "C:\\Program Files\\LibreOffice\\program\\soffice.exe"
      : "soffice";

  await run(soffice, [
    "--headless",
    "--convert-to",
    "pdf",
    "--outdir",
    dir,
    inputPath,
  ]);

  const files = await fs.readdir(dir);
  const pdfFile = files.find((f) => f.endsWith(".pdf"));

  if (!pdfFile) {
    return NextResponse.json({ error: "Conversion failed" }, { status: 500 });
  }

  const pdfBuffer = await fs.readFile(path.join(dir, pdfFile));

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="converted.pdf"',
    },
  });
}
