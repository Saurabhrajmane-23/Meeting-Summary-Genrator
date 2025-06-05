import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";

// Configure Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/v2/users/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google Profile:", profile); // For debugging

        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          console.log("Existing Google user found:", user.email);
          return done(null, user);
        }

        // Check if user exists with the same email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          console.log("Linking Google account to existing user:", user.email);
          // Link Google account to existing user
          user.googleId = profile.id;
          user.authProvider = "google";
          user.isVerified = true;
          // Update avatar if user doesn't have one
          if (!user.avatar && profile.photos[0]?.value) {
            user.avatar = profile.photos[0].value;
          }
          await user.save({ validateBeforeSave: false });
          return done(null, user);
        }

        // Generate unique username
        let username =
          profile.displayName || profile.emails[0].value.split("@")[0];

        // Check if username already exists and make it unique
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
          username = `${username}_${Date.now()}`;
        }

        console.log("Creating new Google user:", profile.emails[0].value);

        // Create new user
        const newUser = await User.create({
          googleId: profile.id,
          username: username,
          email: profile.emails[0].value,
          avatar: profile.photos[0]?.value || "",
          password: Math.random().toString(36).slice(-8) + "!A1", // Random secure password for Google users
          authProvider: "google",
          isVerified: true,
        });

        console.log("New Google user created:", newUser.email);
        return done(null, newUser);
      } catch (error) {
        console.error("Google OAuth Error:", error);
        return done(error, null);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select("-password -refreshToken");
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
