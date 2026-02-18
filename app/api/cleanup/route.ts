import { autoDeleteOldFiles } from "../lib/autoDelete";

export async function GET(req: Request) {
  const secret = req.headers.get("x-cleanup-secret");

  if (secret !== process.env.CLEANUP_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  await autoDeleteOldFiles();
  return new Response("Cleanup done", { status: 200 });
}
