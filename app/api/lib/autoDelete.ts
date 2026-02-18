import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "tmp/uploads");
const MAX_AGE = 1000 * 60 * 15; // 15 minutes

export async function autoDeleteOldFiles() {
  try {
    const files = await fs.readdir(UPLOAD_DIR);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(UPLOAD_DIR, file);
      const stats = await fs.stat(filePath);

      if (now - stats.mtimeMs > MAX_AGE) {
        await fs.unlink(filePath);
      }
    }
  } catch {
    // silent fail (safe)
  }
}
