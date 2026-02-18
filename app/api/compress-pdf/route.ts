

import { checkUsage } from "../lib/usageLimits";

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { spawn, spawnSync } from "child_process";

function findGhostscript(): string {
  const result = spawnSync("where", ["gswin64c.exe"], { encoding: "utf8" });
  if (result.status === 0) {
    const p = result.stdout.split(/\r?\n/)[0];
    if (p && fs.existsSync(p)) return p;
  }
  throw new Error("Ghostscript not found");
}

export async function POST(req: Request) {
  await checkUsage("FREE");

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "compress-"));
  const inputPath = path.join(tempDir, "input.pdf");
  const outputPath = path.join(tempDir, "output.pdf");

  fs.writeFileSync(inputPath, buffer);

  let gsPath: string;
  try {
    gsPath = findGhostscript();
  } catch {
    fs.rmSync(tempDir, { recursive: true, force: true });
    return NextResponse.json(
      { error: "Ghostscript not installed or not in PATH" },
      { status: 500 }
    );
  }

  await new Promise<void>((resolve, reject) => {
    const gs = spawn(gsPath, [
      "-sDEVICE=pdfwrite",
      "-dCompatibilityLevel=1.4",
      "-dPDFSETTINGS=/ebook",
      "-dNOPAUSE",
      "-dBATCH",
      "-dQUIET",
      `-sOutputFile=${outputPath}`,
      inputPath,
    ]);

    gs.on("error", reject);
    gs.on("exit", (code) => (code === 0 ? resolve() : reject()));
  });

  if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    return NextResponse.json({ error: "Compression failed" }, { status: 500 });
  }

  const out = fs.readFileSync(outputPath);
  fs.rmSync(tempDir, { recursive: true, force: true });

  return new NextResponse(out, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=compressed.pdf",
    },
  });
}
