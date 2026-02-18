import fs from "fs";
import path from "path";

const usageFilePath = path.join(process.cwd(), "tmp", "usage.json");

type PlanType = "FREE" | "PREMIUM";

interface UsageRecord {
  plan: PlanType;
  count: number;
}

const FREE_LIMIT = 5;

function readUsage(): Record<string, UsageRecord> {
  if (!fs.existsSync(usageFilePath)) {
    fs.writeFileSync(usageFilePath, "{}");
  }

  const data = fs.readFileSync(usageFilePath, "utf-8");
  return JSON.parse(data || "{}");
}

function writeUsage(data: Record<string, UsageRecord>) {
  fs.writeFileSync(usageFilePath, JSON.stringify(data, null, 2));
}

export function checkUsage(userId: string) {
  const usage = readUsage();

  if (!usage[userId]) {
    usage[userId] = { plan: "FREE", count: 0 };
    writeUsage(usage);
  }

  const user = usage[userId];

  if (user.plan === "FREE" && user.count >= FREE_LIMIT) {
    return { allowed: false, message: "Free limit reached. Upgrade to Premium." };
  }

  return { allowed: true };
}

export function increaseUsage(userId: string) {
  const usage = readUsage();

  usage[userId].count += 1;

  writeUsage(usage);
}

export function upgradeToPremium(userId: string) {
  const usage = readUsage();

  usage[userId] = {
    plan: "PREMIUM",
    count: 0,
  };

  writeUsage(usage);
}
