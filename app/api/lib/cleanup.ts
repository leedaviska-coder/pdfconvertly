import { autoDeleteOldFiles } from "../lib/autoDelete";

export async function GET() {
  await autoDeleteOldFiles();
  return new Response("Cleanup done", { status: 200 });
}
