import { readFile, writeFile } from "fs/promises";
import path from "path";

const filePath = path.join(process.cwd(), "tmp", "usage.json");

type UsageData = {
  [ip: string]: {
    count: number;
    plan: "free" | "premium";
  };
};

async function getUsageData(): Promise<UsageData> {
  try {
    const data = await readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveUsageData(data: UsageData) {
  await writeFile(filePath, JSON.stringify(data, null, 2));
}

export async function checkUsage(ip: string) {
  const data = await getUsageData();

  if (!data[ip]) {
    data[ip] = { count: 0, plan: "free" };
  }

  if (data[ip].plan === "free" && data[ip].count >= 5) {
    return { allowed: false, message: "Free limit reached. Upgrade to premium." };
  }

  data[ip].count += 1;
  await saveUsageData(data);

  return { allowed: true };
}

export async function upgradeToPremium(ip: string) {
  const data = await getUsageData();

  if (!data[ip]) {
    data[ip] = { count: 0, plan: "premium" };
  } else {
    data[ip].plan = "premium";
  }

  await saveUsageData(data);
}
