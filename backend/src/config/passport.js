import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/v2/users/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID or email
        let user = await User.findOne({
          $or: [{ googleId: profile.id }, { email: profile.emails[0].value }],
        });

        if (user) {
          // User exists, update Google ID if not set
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          return done(null, user);
        }

        // Create new user
        let avatarUrl = "";

        // Download and upload Google profile picture to Cloudinary
        if (profile.photos && profile.photos[0] && profile.photos[0].value) {
          try {
            const response = await fetch(profile.photos[0].value);
            const buffer = await response.buffer();

            // Create a temporary file path (you might need to adjust this)
            const tempPath = `./public/temp/google_avatar_${profile.id}.jpg`;
            require("fs").writeFileSync(tempPath, buffer);

            const avatar = await uploadOnCloudinary(tempPath);
            if (avatar) {
              avatarUrl = avatar.url;
            }

            // Clean up temp file
            require("fs").unlinkSync(tempPath);
          } catch (avatarError) {
            console.log("Error uploading Google avatar:", avatarError);
          }
        }

        // Generate unique username if needed
        let username =
          profile.displayName?.replace(/\s+/g, "").toLowerCase() ||
          profile.emails[0].value.split("@")[0];

        // Check if username exists and make it unique
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          username = `${username}_${Date.now()}`;
        }

        // Create new user
        const newUser = await User.create({
          googleId: profile.id,
          username,
          email: profile.emails[0].value,
          avatar: avatarUrl,
          password: Math.random().toString(36).slice(-8), // Random password for Google users
          isVerified: true, // Google users are already verified
          authProvider: "google",
        });

        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
