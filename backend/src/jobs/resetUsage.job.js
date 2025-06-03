import cron from "node-cron";
import { User } from "../models/user.model.js";

// Schedule: Runs at midnight on the 1st day of every month
cron.schedule("0 0 1 * *", async () => {
  console.log("🔁 Starting monthly usage reset...");

  try {
    // Fetch all users (you could optimize this for large user bases)
    const users = await User.find();

    for (const user of users) {
      user.meetingCount = 0;
      user.lastReset = new Date();
      await user.save();
    }

    console.log(`✅ Usage reset completed for ${users.length} user(s)`);
  } catch (error) {
    console.error("❌ Failed to reset usage:", error);
  }
});
