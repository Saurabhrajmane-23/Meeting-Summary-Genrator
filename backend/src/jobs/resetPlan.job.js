import cron from "node-cron";
import { User } from "../models/user.model.js";

// Runs every day at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Checking for expired plans...");

  const now = new Date();

  const expiredUsers = await User.find({
    plan: { $in: ["monthly", "yearly"] },
    planExpiresAt: { $lte: now },
  });

  for (const user of expiredUsers) {
    user.plan = "basic";
    user.planStartedAt = null;
    user.planExpiresAt = null;
    user.meetingCount = 0;
    await user.save();
    console.log(`Downgraded ${user.email} to basic plan`);
  }

  console.log(`Processed ${expiredUsers.length} expired plans`);
});
